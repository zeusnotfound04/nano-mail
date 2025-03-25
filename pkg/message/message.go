package message


import (
	"time"
	"net/mail"
)




type Message struct{
	From       string
    To         []string
	Subject    string
	Headers    mail.Header
	Body       string
	Size       int64
	Date       time.Time
}

