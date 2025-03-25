//This Storage Mechanism is for TESTING AND DEVELOPMENT PURPOSE :)

package storage

import (
	"context"
	"sync"

	"github.com/zeusnotfound04/nano-mail/pkg/message"
)

type MemoryStorage struct {
	messages   []*message.Message
	mu         sync.RWMutex
}

func NewMemoryStorage() *MemoryStorage{
	return &MemoryStorage{
		messages: make([]*message.Message,0 ),
	}
}


func (s *MemoryStorage) Store(ctx context.Context , msg  *message.Message) error {
	s.mu.Lock()
	defer s.mu.Lock()

	select {
	case <-ctx.Done():
		return ctx.Err()
	default:
		s.messages = append(s.messages, msg)
		return nil

	}
}


func (s *MemoryStorage) Close() error{
	return nil
}