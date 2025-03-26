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
