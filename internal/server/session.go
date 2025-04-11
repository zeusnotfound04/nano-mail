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
	"strconv"
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
	logger := s.server.config.Logger.With("client", s.remoteAddr)
	logger.Debug("Sending response", "response", strings.TrimSpace(response))

	_, err := s.writer.WriteString(response)
	if err != nil {
		logger.Error("Failed to write response", "error", err)
		return err
	}

	err = s.writer.Flush()
	if err != nil {
		logger.Error("Failed to flush writer", "error", err)
		return err
	}

	logger.Debug("Response sent successfully")
	return nil
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
		s.writeResponse(fmt.Sprintf("250-%s\r\n", s.server.config.Domain))


		capabilities := []string{
			fmt.Sprintf("250-SIZE %d", s.server.config.MaxMessageSize),
			"250-8BITMIME",
		}

		if s.server.config.EnableCompression {
			capabilities = append(capabilities, "250-CHUNKING")
		}


		capabilities = append(capabilities, "250-PIPELINING", "250-SMTPUTF8")


		lastCapability := "250 HELP"

		for _, cap := range capabilities {
			s.writeResponse(cap + "\r\n")
		}

		s.writeResponse(lastCapability + "\r\n")
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
	messageData := s.message.String()

	logger.Debug("Message size", "bytes", messageSize)

	var subject string
	var body string = messageData 

	parts := strings.SplitN(messageData, "\r\n\r\n", 2)
	if len(parts) == 2 {
		headers := parts[0]

		for _, line := range strings.Split(headers, "\r\n") {
			if strings.HasPrefix(strings.ToLower(line), "subject:") {
				subject = strings.TrimSpace(line[8:])
				break
			}
		}
	}

	
	if subject == "" {
		msg, err := mail.ReadMessage(bytes.NewBufferString(messageData))
		if err == nil {
			subject = msg.Header.Get("Subject")
		} else {
			logger.Warn("Failed to parse with standard mail package, using fallback", "error", err)
		}
	}

	message := &message.Message{
		From:    s.sender,
		To:      s.recipients,
		Subject: subject,
		Body:    body, // Store the complete raw email
		Size:    messageSize,
		Date:    time.Now(),
	}

	fmt.Println("Raw Email Data summary:")
	fmt.Printf("From: %s\nTo: %v\nSubject: %s\nSize: %d bytes\n",
		message.From, message.To, message.Subject, message.Size)

	ctx, cancel := context.WithTimeout(s.ctx, 10*time.Second)
	defer cancel()

	fmt.Println("Storing message in database...")
	err := database.StoreMail(ctx, s.server.db, message)
	if err != nil {
		logger.Error("Failed to store message in database", "error", err)
		fmt.Println("Failed to store message in the database:", err)
		return err
	}

	fmt.Println("Message stored successfully!")
	logger.Info("Message processed successfully",
		"size", message.Size,
		"subject", message.Subject,
	)
	return nil
}

func (s *smtpSession) handleBdat(params string) {
	logger := s.server.config.Logger.With("client", s.remoteAddr)

	if s.state < stateRcptTo {
		s.writeResponse("503 Bad sequence of commands\r\n")
		return
	}

	// Parse BDAT parameters: size and optional LAST flag
	parts := strings.Fields(params)
	if len(parts) < 1 {
		s.writeResponse("501 Invalid BDAT parameters\r\n")
		return
	}

	chunkSize, err := strconv.Atoi(parts[0])
	if err != nil {
		logger.Error("Invalid BDAT chunk size", "params", params, "error", err)
		s.writeResponse("501 Invalid BDAT chunk size\r\n")
		return
	}

	isLast := false
	if len(parts) > 1 && strings.ToUpper(parts[1]) == "LAST" {
		isLast = true
	}

	logger.Info("Receiving BDAT chunk", "size", chunkSize, "isLast", isLast)

	chunk := make([]byte, chunkSize)
	bytesRead := 0

	for bytesRead < chunkSize {
		n, err := s.reader.Read(chunk[bytesRead:])
		if err != nil {
			logger.Error("Error reading BDAT chunk", "error", err)
			s.writeResponse("554 Transaction failed\r\n")
			return
		}
		bytesRead += n
	}

	s.message.Write(chunk)

	if s.message.Len() > int(s.server.config.MaxMessageSize) {
		logger.Warn("Message size limit exceeded", "size", s.message.Len())
		s.writeResponse("552 Message size exceeds fixed limit\r\n")
		s.message.Reset()
		s.state = stateHelo
		return
	}

	s.writeResponse("250 OK\r\n")

	if isLast {
		logger.Info("Processing complete BDAT message")
		err := s.processMessageData()
		if err != nil {
			logger.Error("Failed to process BDAT message data", "error", err)
			s.writeResponse("554 Transaction failed\r\n")
			return
		}

		s.state = stateHelo
		logger.Info("BDAT message accepted successfully")
	}
}

func (s *smtpSession) process() {
	logger := s.server.config.Logger.With("client", s.remoteAddr)
	logger.Info("Starting new SMTP session")

	for {
		logger.Debug("Setting connection deadlines")
		s.conn.SetReadDeadline(time.Now().Add(s.server.config.ReadTimeout))
		s.conn.SetWriteDeadline(time.Now().Add(s.server.config.WriteTimeout))

		logger.Debug("Waiting for client command")
		line, err := s.reader.ReadString('\n')
		if err != nil {
			if err != io.EOF {
				logger.Error("Failed to read command", "error", err)
			} else {
				logger.Info("Client disconnected (EOF)")
			}
			return
		}

		line = strings.TrimSpace(line)
		logger.Info("Received command", "command", line)

		if s.state == stateData {
			logger.Debug("Processing data content", "line", line)

			if line == "." {
				logger.Info("End of message data received, processing message")
				err := s.processMessageData()
				if err != nil {
					logger.Error("Failed to process message data", "error", err)
					s.writeResponse("554 Transaction failed\r\n")
					continue
				}

				s.state = stateHelo
				logger.Info("Message accepted successfully")
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

		logger.Info("Processing command", "command", cmd, "params", params)

		switch cmd {
		case "HELO", "EHLO":
			s.handleHelo(cmd, params)
		case "MAIL":
			s.handleMailFrom(params)
		case "RCPT":
			s.handleRcptTo(params)
		case "DATA":
			s.handleData()
		case "BDAT":
			s.handleBdat(params)
		case "RSET":
			s.handleReset()
		case "NOOP":
			logger.Info("NOOP command received")
			s.writeResponse("250 OK\r\n")
		case "QUIT":
			logger.Info("QUIT command received, ending session")
			s.writeResponse("221 Goodbye\r\n")
			return
		default:
			logger.Warn("Unrecognized command", "command", cmd)
			s.writeResponse("502 Command not implemented\r\n")
		}
	}
}
