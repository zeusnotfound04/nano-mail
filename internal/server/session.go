package server

import (
	"bufio"
	"bytes"
	"context"
	"database/sql"

	"fmt"
	"io"
	"net"
	"net/mail"
	"strings"
	"sync"
	"time"

	"github.com/zeusnotfound04/nano-mail/database"
	"github.com/zeusnotfound04/nano-mail/internal/config"
	"github.com/zeusnotfound04/nano-mail/internal/limiter"
	"github.com/zeusnotfound04/nano-mail/pkg/message"
)

const (
	stateInit = iota
	stateHelo
	stateMailFrom
	stateRcptTo
	stateData
	stateQuit
)

type Server struct {
	config *config.Config

	listener    net.Listener
	shutdown    chan struct{}
	wg          sync.WaitGroup
	db          *sql.DB
	rateLimiter limiter.ConnectionLimiter
}

type smtpSession struct {
	server     *Server
	conn       net.Conn
	reader     *bufio.Reader
	writer     *bufio.Writer
	state      int
	helo       string
	sender     string
	recipients []string
	message    bytes.Buffer
	remoteAddr string
	ctx        context.Context
}

func (s *smtpSession) writeResponse(response string) error {
	_, err := s.writer.WriteString(response)
	if err != nil {
		return err
	}
	return s.writer.Flush()
}

func (s *smtpSession) handleHelo(cmd string, params string) {
	logger := s.server.config.Logger.With("client", s.remoteAddr)

	if params == "" {
		s.writeResponse("501 Syntax error : Hostname required\r\n")
		return
	}

	s.helo = params
	s.state = stateHelo

	if cmd == "HELO" {
		s.writeResponse(fmt.Sprintf("250 %s\r\n", s.server.config.Domain))
	} else {

		resp := fmt.Sprintf("250-%s\r\n", s.server.config.Domain)

		s.writeResponse(resp)

		capabilities := []string{
			"250-SIZE " + fmt.Sprintf("%d", s.server.config.MaxMessageSize),
			"250-8BITMIME",
		}

		if s.server.config.EnableCompression {
			capabilities = append(capabilities, "250-CHUNKING")
		}

		capabilities[len(capabilities)-1] = strings.Replace(
			capabilities[len(capabilities)-1], "250-", "250", 1)

		for _, cap := range capabilities {
			s.writeResponse(cap + "\r\n")
		}
	}
	logger.Info("Client identified", "command", cmd, "hostname", params)
}

func (s *smtpSession) handleMailFrom(params string) {
	logger := s.server.config.Logger.With("client", s.remoteAddr)

	if s.state < stateHelo {
		s.writeResponse("503 Bad sequence in parameters\r\n")
		return
	}

	addr := strings.TrimSpace(params[5:])
	addr = strings.Trim(addr, "<>")

	if addr == "" {
		s.writeResponse("501 Invalid sender address format\r\n")
		return
	}

	if !strings.Contains(addr, "@") {
		s.writeResponse("501 Invalid sender address format\r\n")
		return
	}

	s.sender = addr
	s.state = stateMailFrom
	s.recipients = nil
	s.message.Reset()

	s.writeResponse("250 OK\r\n")
	logger.Info("Mail from", "sender", addr)

}

func (s *smtpSession) handleRcptTo(params string) {
	logger := s.server.config.Logger.With("client", s.remoteAddr)

	if s.state < stateMailFrom {
		s.writeResponse("503 Bad sequence of commands\r\n")
		return
	}

	if !strings.HasPrefix(strings.ToUpper(params), "TO:") {
		s.writeResponse("501 Syntax error in parameters\r\n")
		return
	}

	if len(s.recipients) >= s.server.config.MaxRecipients {
		s.writeResponse("452 Too many recipients\r\n")
		return
	}

	addr := strings.TrimSpace(params[3:])
	addr = strings.Trim(addr, "<>")

	if addr == "" {
		s.writeResponse("501 Empty recipient address\r\n")
		return
	}

	if !strings.Contains(addr, "@") {
		s.writeResponse("501 Invalid recipient address format\r\n")
		return
	}

	s.recipients = append(s.recipients, addr)
	s.state = stateRcptTo

	s.writeResponse("250 OK\r\n")
	logger.Info("Recipient added", "recipient", addr)
}

func (s *smtpSession) handleData() {
	logger := s.server.config.Logger.With("client", s.remoteAddr)

	if s.state < stateRcptTo {
		s.writeResponse("503 Bad sequence of commands\r\n")
		return
	}

	s.writeResponse("354 Start mail input; end with <CRLF>.<CRLF>\r\n")

	s.state = stateData
	s.message.Reset()

	logger.Info("Date phase started")
}

func (s *smtpSession) handleReset() {
	s.state = stateHelo
	s.sender = ""
	s.recipients = nil
	s.message.Reset()

	s.writeResponse("250 OK\r\n")
	s.server.config.Logger.Info("Session reset", "client", s.remoteAddr)
}

func (s *smtpSession) processMessageData() error {
	logger := s.server.config.Logger.With(
		"client", s.remoteAddr,
		"from", s.sender,
		"recipients", strings.Join(s.recipients, ","),
	)

	messageSize := int64(s.message.Len())

	logger.Debug("Raw message data", "data", s.message.String())

	msg, err := mail.ReadMessage(&s.message)
	if err != nil {
		logger.Error("Failed to parse message", "error", err)
		return err
	}

	// Extract just the subject from headers
	subject := msg.Header.Get("Subject")

	bodyBytes, err := io.ReadAll(msg.Body)
	if err != nil {
		logger.Error("Failed to read message body", "error", err)
		return err
	}

	message := &message.Message{
		From:    s.sender,
		To:      s.recipients,
		Subject: subject,
		Body:    string(bodyBytes),
		Size:    messageSize,
		Date:    time.Now(),
	}

	fmt.Println("Raw Email Data:\n", message)
	ctx, cancel := context.WithTimeout(s.ctx, 10*time.Second)

	defer cancel()

	fmt.Println("Checkpoint-----2")
	fmt.Println("", s.server.db)
	err = database.StoreMail(ctx, s.server.db, message)
	if err != nil {
		logger.Error("Failed to store message in database", "error", err)
		fmt.Println("Failed to store message in the db")
		return err
	}

	fmt.Println("Stored the message successfully")

	logger.Debug("Stored the message successfully")

	logger.Info("Message processed successfully",
		"size", message.Size,
		"subject", message.Subject,
	)
	return nil
}

func (s *smtpSession) process() {
	logger := s.server.config.Logger.With("client", s.remoteAddr)

	for {
		s.conn.SetReadDeadline(time.Now().Add(s.server.config.ReadTimeout))
		s.conn.SetWriteDeadline(time.Now().Add(s.server.config.WriteTimeout))

		line, err := s.reader.ReadString('\n')
		if err != nil {
			if err != io.EOF {
				logger.Error("Failed to read command", "error", err)
			}
			return
		}

		line = strings.TrimSpace(line)
		logger.Debug("Received command", "command", line)

		if s.state == stateData {

			if line == "." {
				err := s.processMessageData()
				if err != nil {
					logger.Error("Failed to process message data", "error", err)
					s.writeResponse("554 Transaction failed\r\n")
					continue
				}

				s.state = stateHelo
				s.writeResponse("250 OK: message accepted\r\n")
				continue

			}

			if strings.HasPrefix(line, "..") {
				line = line[1:]
			}

			s.message.WriteString(line + "\r\n")

			if s.message.Len() > int(s.server.config.MaxMessageSize) {
				logger.Warn("Message size limit exceeded", "size", s.message.Len())
				s.writeResponse("552 Message size exceeds fixed limit\r\n")
				s.message.Reset()
				s.state = stateHelo
				continue
			}

			continue

		}

		parts := strings.SplitN(line, " ", 2)
		cmd := strings.ToUpper(parts[0])
		var params string
		if len(parts) > 1 {
			params = parts[1]
		}

		switch cmd {
		case "HELO", "EHLO":
			s.handleHelo(cmd, params)
		case "MAIL":
			s.handleMailFrom(params)
		case "RCPT":
			s.handleRcptTo(params)
		case "DATA":
			s.handleData()
		case "RSET":
			s.handleReset()
		case "NOOP":
			s.writeResponse("250 OK\r\n")
		case "QUIT":
			s.writeResponse("221 Goodbye\r\n")
			return
		default:
			s.writeResponse("502 Command not implemented\r\n")
		}

	}

}
