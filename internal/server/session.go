package server

import (
	"bufio"
	"bytes"
	"context"
	"fmt"
	"net"
	"strings"
	"sync"

	"github.com/zeusnotfound04/nano-mail/internal/config"
	"github.com/zeusnotfound04/nano-mail/internal/limiter"
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
	config        *config.Config
   
	listener      net.Listener
	shutdown      chan struct{}
	wg            sync.WaitGroup

	rateLimiter   limiter.ConnectionLimiter
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
	headers    map[string][]string
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
		s.writeResponse(fmt.Sprintf("250-%s\r\n" , s.server.config.Domain))
	} else {

		res := fmt.Sprintf("250-%s\r\n" , s.server.config.Domain)

		s.writeResponse(res)

		capabilities := []string{
			"250-SIZE" + fmt.Sprintf("%d", s.server.config.MaxMessageSize),
			"250-8BITMIME",
		}

		if s.server.config.EnableCompression {
			capabilities = append(capabilities, "250-CHUNKING")
		}

		capabilities[len(capabilities)-1] = strings.Replace(
			capabilities[len(capabilities)-1], "250-" , "250" , 1 )

		for _, cap := range capabilities {
			s.writeResponse(cap + "\r\n")
		}
	}
	logger.Info("Client identified" , "command" , cmd , "hostname" , params)
}


func (s *smtpSession) handleMailFrom(params string) {
	logger := s.server.config.Logger.With("client" , s.remoteAddr)

	if s.state < stateHelo {
		s.writeResponse("503 Bad sequence in parameters\r\n")
		return
	}

	addr := strings.TrimSpace(params[5:])
	addr = strings.Trim(addr , "<>")

	if addr == "" {
		s.writeResponse("501 Invalid sender address format\r\n")
		return
	}

	if !strings.Contains(addr , "@") {
		s.writeResponse("501 Invalid sender address format\r\n")
		return
	}

	s.sender = addr
	s.state = stateMailFrom 
	s.recipients = nil
	s.message.Reset()

	s.writeResponse("250 OK\r\n")
	logger.Info("Mail from", "sender" , addr)
	
}


func (s *smtpSession) handleRcptTo(params string){
	logger := s.server.config.Logger.With("client" , s.remoteAddr)

	if s.state < stateMailFrom {
		s.writeResponse("503 Bad sequence of commands\r\n")
		return
	}

	if !strings.HasPrefix(strings.ToUpper(params) , "TO:") {
		s.writeResponse("501 Syntax error in parameters\r\n")
		return
	}

	if len(s.recipients) >= s.server.config.MaxRecipients {
		s.writeResponse("452 Too many recipients\r\n")
		return
	}

	addr := strings.TrimSpace(params[3:])
	addr = strings.Trim(addr , "<>")

	if add == "" {
		s.writeResponse("501 Empty recipient address\r\n")
		return
	}

	if !strings.Contains(addr , "@") {
		s.writeResponse("501 Invalid recipient address format\r\n")
		return
	}

	s.recipients = append(s.recipients, addr)
	s.state = stateRcptTo

	s.writeResponse("250 OK\r\n")
	logger.Info("Recipient added", "recipient" , addr)
}


func (s *smtpSession) handleData()  {
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
