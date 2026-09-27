package server

import (
	"bufio"
	"bytes"
	"context"
	"io"
	"net"
	"strconv"
	"strings"
	"sync"
	"time"

	"github.com/zeusnotfound04/nano-mail/pkg/message"
)

const (
	initialBufferSize = 64 * 1024
	maxPooledBuffer   = 1024 * 1024
)

var bufferPool = sync.Pool{
	New: func() interface{} {
		return bytes.NewBuffer(make([]byte, 0, initialBufferSize))
	},
}

func getPooledBuffer() *bytes.Buffer {
	buf := bufferPool.Get().(*bytes.Buffer)
	buf.Reset()
	return buf
}

func returnPooledBuffer(buf *bytes.Buffer) {
	if buf.Cap() > maxPooledBuffer {
		return
	}
	bufferPool.Put(buf)
}

const (
	stateInit = iota
	stateHelo
	stateMailFrom
	stateRcptTo
	stateData
	stateQuit
	stateDiscard
)

type smtpSession struct {
	server     *Server
	conn       net.Conn
	reader     *bufio.Reader
	writer     *bufio.Writer
	state      int
	helo       string
	sender     string
	recipients []string
	message    *bytes.Buffer
	remoteAddr string
	ctx        context.Context
}

// extractAddress pulls the email address out of an SMTP path argument such as
// "<user@example.com> SIZE=4013". It returns the content between the angle
// brackets when present, otherwise the first whitespace-delimited token, so
// trailing ESMTP parameters (SIZE, BODY, NOTIFY, ...) are never folded into the
// address.
func extractAddress(s string) string {
	if start := strings.IndexByte(s, '<'); start >= 0 {
		if end := strings.IndexByte(s[start:], '>'); end >= 0 {
			return strings.TrimSpace(s[start+1 : start+end])
		}
	}
	if i := strings.IndexAny(s, " \t"); i >= 0 {
		s = s[:i]
	}
	return strings.TrimSpace(s)
}

func (s *smtpSession) writeResponse(response string) error {
	logger := s.server.config.Logger.With("client", s.remoteAddr)

	if _, err := s.writer.WriteString(response); err != nil {
		logger.Error("Failed to write response", "error", err)
		return err
	}

	if err := s.writer.Flush(); err != nil {
		logger.Error("Failed to flush writer", "error", err)
		return err
	}

	return nil
}

func (s *smtpSession) resetTransaction() {
	s.sender = ""
	s.recipients = nil
	s.message.Reset()

	if s.helo == "" {
		s.state = stateInit
		return
	}
	s.state = stateHelo
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
		s.writeResponse("250 " + s.server.config.Domain + "\r\n")
	} else {
		s.writeResponse("250-" + s.server.config.Domain + "\r\n")

		capabilities := []string{
			"250-SIZE " + strconv.FormatInt(s.server.config.MaxMessageSize, 10),
			"250-8BITMIME",
		}

		if s.server.config.EnableChunking {
			capabilities = append(capabilities, "250-CHUNKING")
		}

		capabilities = append(capabilities, "250-PIPELINING", "250-SMTPUTF8")

		for _, capability := range capabilities {
			s.writeResponse(capability + "\r\n")
		}

		s.writeResponse("250 HELP\r\n")
	}

	logger.Debug("Client identified", "command", cmd, "hostname", params)
}

func (s *smtpSession) handleMailFrom(params string) {
	logger := s.server.config.Logger.With("client", s.remoteAddr)

	if s.state < stateHelo {
		s.writeResponse("503 Bad sequence of commands\r\n")
		return
	}

	if !strings.HasPrefix(strings.ToUpper(params), "FROM:") {
		s.writeResponse("501 Syntax error in parameters\r\n")
		return
	}

	addr := extractAddress(strings.TrimSpace(params[len("FROM:"):]))

	if addr == "" || !strings.Contains(addr, "@") {
		s.writeResponse("501 Invalid sender address format\r\n")
		return
	}

	s.sender = addr
	s.recipients = nil
	s.message.Reset()
	s.state = stateMailFrom

	s.writeResponse("250 OK\r\n")
	logger.Debug("Mail from accepted", "sender", addr)
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

	addr := extractAddress(strings.TrimSpace(params[len("TO:"):]))

	if addr == "" || !strings.Contains(addr, "@") {
		s.writeResponse("501 Invalid recipient address format\r\n")
		return
	}

	if !s.server.config.IsAllowedRecipient(addr) {
		logger.Warn("Rejected recipient outside served domains",
			"domain", addr[strings.LastIndexByte(addr, '@')+1:])
		s.writeResponse("550 5.7.1 Relay access denied\r\n")
		return
	}

	s.recipients = append(s.recipients, addr)
	s.state = stateRcptTo

	s.writeResponse("250 OK\r\n")
	logger.Debug("Recipient accepted", "recipient", addr)
}

func (s *smtpSession) handleData() {
	if s.state < stateRcptTo {
		s.writeResponse("503 Bad sequence of commands\r\n")
		return
	}

	s.message.Reset()
	s.state = stateData

	s.writeResponse("354 Start mail input; end with <CRLF>.<CRLF>\r\n")
}

func (s *smtpSession) handleReset() {
	s.resetTransaction()
	s.writeResponse("250 OK\r\n")
}

func (s *smtpSession) processMessageData() error {
	logger := s.server.config.Logger.With("client", s.remoteAddr)

	msg := &message.Message{
		From: s.sender,
		To:   s.recipients,
		Body: s.message.String(),
		Size: int64(s.message.Len()),
		Date: time.Now(),
	}

	ctx, cancel := context.WithTimeout(s.ctx, s.server.config.StoreTimeout)
	defer cancel()

	id, err := s.server.store(ctx, msg)
	if err != nil {
		logger.Error("Failed to store message", "error", err, "size", msg.Size)
		return err
	}

	logger.Info("Message stored", "id", id, "size", msg.Size, "recipients", len(msg.To))
	return nil
}

func (s *smtpSession) completeTransaction() {
	if err := s.processMessageData(); err != nil {
		s.writeResponse("451 4.3.0 Temporary failure storing message, please retry\r\n")
		s.resetTransaction()
		return
	}

	s.writeResponse("250 OK: message accepted\r\n")
	s.resetTransaction()
}

func (s *smtpSession) handleBdat(params string) bool {
	logger := s.server.config.Logger.With("client", s.remoteAddr)

	if s.state < stateRcptTo {
		s.writeResponse("503 Bad sequence of commands\r\n")
		return true
	}

	parts := strings.Fields(params)
	if len(parts) < 1 {
		s.writeResponse("501 Invalid BDAT parameters\r\n")
		return true
	}

	chunkSize, err := strconv.ParseInt(parts[0], 10, 64)
	if err != nil || chunkSize < 0 {
		logger.Warn("Rejected invalid BDAT chunk size", "value", parts[0])
		s.writeResponse("501 Invalid BDAT chunk size\r\n")
		return true
	}

	if chunkSize > s.server.config.MaxMessageSize-int64(s.message.Len()) {
		logger.Warn("Rejected oversized BDAT chunk", "chunkSize", chunkSize)
		s.writeResponse("552 Message size exceeds fixed limit\r\n")
		s.resetTransaction()
		return false
	}

	if chunkSize > 0 {
		if _, err := io.CopyN(s.message, s.reader, chunkSize); err != nil {
			logger.Error("Failed to read BDAT chunk", "error", err)
			s.writeResponse("554 Transaction failed\r\n")
			return false
		}
	}

	if len(parts) > 1 && strings.ToUpper(parts[1]) == "LAST" {
		s.completeTransaction()
		return true
	}

	s.writeResponse("250 OK\r\n")
	return true
}

func (s *smtpSession) process() {
	logger := s.server.config.Logger.With("client", s.remoteAddr)
	logger.Debug("Starting new SMTP session")

	for {
		s.conn.SetReadDeadline(time.Now().Add(s.server.config.ReadTimeout))
		s.conn.SetWriteDeadline(time.Now().Add(s.server.config.WriteTimeout))

		line, err := s.reader.ReadString('\n')
		if err != nil {
			if err != io.EOF {
				logger.Debug("Failed to read command", "error", err)
			}
			return
		}

		line = strings.TrimRight(line, "\r\n")

		if s.state == stateDiscard {
			if line == "." {
				s.writeResponse("552 Message size exceeds fixed limit\r\n")
				s.resetTransaction()
			}
			continue
		}

		if s.state == stateData {
			if line == "." {
				s.completeTransaction()
				continue
			}

			if strings.HasPrefix(line, ".") {
				line = line[1:]
			}

			if int64(s.message.Len()+len(line)+2) > s.server.config.MaxMessageSize {
				logger.Warn("Message size limit exceeded", "size", s.message.Len())
				s.message.Reset()
				s.state = stateDiscard
				continue
			}

			s.message.WriteString(line)
			s.message.WriteString("\r\n")

			continue
		}

		line = strings.TrimSpace(line)
		parts := strings.SplitN(line, " ", 2)
		cmd := strings.ToUpper(parts[0])

		var params string
		if len(parts) > 1 {
			params = parts[1]
		}

		logger.Debug("Processing command", "command", cmd)

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
			if !s.handleBdat(params) {
				return
			}
		case "RSET":
			s.handleReset()
		case "NOOP":
			s.writeResponse("250 OK\r\n")
		case "QUIT":
			s.writeResponse("221 Goodbye\r\n")
			return
		default:
			logger.Debug("Unrecognized command", "command", cmd)
			s.writeResponse("502 Command not implemented\r\n")
		}
	}
}
