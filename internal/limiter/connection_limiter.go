package limiter

import (
	"sync"
	"time"
)

type ConnectionLimiter interface {
	Allow(ip string) bool
	Release(ip string)
	Cleanup()
}

type connectionInfo struct {
	count    int
	lastSeen time.Time
}

type RateLimiter struct {
	connections map[string]*connectionInfo
	maxPerIP    int
	mu          sync.Mutex
	cleanupDone chan struct{}
}

func NewRateLimiter(maxPerIP int) *RateLimiter {
	r := &RateLimiter{
		connections: make(map[string]*connectionInfo),
		maxPerIP:    maxPerIP,
		cleanupDone: make(chan struct{}),
	}

	go r.periodicCleanup()
	return r
}

func (r *RateLimiter) Allow(ip string) bool {
	r.mu.Lock()
	defer r.mu.Unlock()

	now := time.Now()
	info, exists := r.connections[ip]

	if !exists {
		r.connections[ip] = &connectionInfo{count: 1, lastSeen: now}
		return true
	}

	if info.count >= r.maxPerIP {
		return false
	}

	info.count++
	info.lastSeen = now
	return true
}

func (r *RateLimiter) Release(ip string) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if info, exists := r.connections[ip]; exists {
		info.count--
		info.lastSeen = time.Now()

		if info.count <= 0 {
			delete(r.connections, ip)
		}
	}
}

func (r *RateLimiter) Cleanup() {
	close(r.cleanupDone)
}

func (r *RateLimiter) periodicCleanup() {
	ticker := time.NewTicker(5 * time.Minute)
	defer ticker.Stop()

	for {
		select {
		case <-r.cleanupDone:
			return
		case <-ticker.C:
			r.cleanupStaleConnections()
		}
	}
}

func (r *RateLimiter) cleanupStaleConnections() {
	r.mu.Lock()
	defer r.mu.Unlock()

	now := time.Now()
	staleThreshold := 30 * time.Minute

	for ip, info := range r.connections {
		if now.Sub(info.lastSeen) > staleThreshold && info.count == 0 {
			delete(r.connections, ip)
		}
	}
}
