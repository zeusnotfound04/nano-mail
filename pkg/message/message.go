package message

import (
	"time"
)

type Message struct {
	From    string
	To      []string
	Subject string
	Body    string
	Size    int64
	Date    time.Time
}
