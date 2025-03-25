package storage

import (
	"context"

	"github.com/zeusnotfound04/nano-mail/pkg/message"
)

type StorageBackend interface {
	Store(ctx context.Context, msg *message.Message) error
	Close() error
}