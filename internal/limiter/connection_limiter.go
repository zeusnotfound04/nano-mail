package limiter

import "sync"

type ConnectionLimiter interface {
	Allow(ip string) bool
	Release(ip string)
}

type RateLimiter struct {
	connections map[string]int
	maxPerIP    int
	mu          sync.Mutex 
}


func NewRateLimiter(maxPerIP int)  *RateLimiter{
	return &RateLimiter{
		connections: make(map[string]int),
		maxPerIP: maxPerIP,
	}
}

func (r *RateLimiter) Allow(ip string) bool{
	r.mu.Lock()
	defer  r.mu.Unlock()

	count := r.connections[ip]
	if count >= r.maxPerIP {
		return false
	}
	r.connections[ip]++
	return true
}


func (r *RateLimiter) Release(ip   string) {
	r.mu.Lock()
	defer r.mu.Unlock()

	if r.connections[ip] > 0 {
		r.connections[ip]--
	}

	if r.connections[ip] == 0 {
		delete(r.connections, ip)
	}

}