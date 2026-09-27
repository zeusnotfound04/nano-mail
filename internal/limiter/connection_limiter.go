package limiter

import (
	"sync"
)

type ConnectionLimiter interface {
	Allow(ip string) bool
	Release(ip string)
	Cleanup()
}

type RateLimiter struct {
	mu       sync.Mutex
	perIP    map[string]int
	total    int
	maxPerIP int
	maxTotal int
}

func NewRateLimiter(maxPerIP int, maxTotal int) *RateLimiter {
	return &RateLimiter{
		perIP:    make(map[string]int),
		maxPerIP: maxPerIP,
		maxTotal: maxTotal,
	}
}

func (r *RateLimiter) Allow(ip string) bool {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.maxTotal > 0 && r.total >= r.maxTotal {
		return false
	}

	if r.perIP[ip] >= r.maxPerIP {
		return false
	}

	r.perIP[ip]++
	r.total++

	return true
}

func (r *RateLimiter) Release(ip string) {
	r.mu.Lock()
	defer r.mu.Unlock()

	count, exists := r.perIP[ip]
	if !exists {
		return
	}

	if count <= 1 {
		delete(r.perIP, ip)
	} else {
		r.perIP[ip] = count - 1
	}

	if r.total > 0 {
		r.total--
	}
}

func (r *RateLimiter) Cleanup() {
	r.mu.Lock()
	defer r.mu.Unlock()

	r.perIP = make(map[string]int)
	r.total = 0
}

func (r *RateLimiter) InFlight() int {
	r.mu.Lock()
	defer r.mu.Unlock()

	return r.total
}
