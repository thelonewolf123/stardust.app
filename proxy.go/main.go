package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"strings"

	"github.com/go-redis/redis"
)

var (
	redisClient *redis.Client
	luaScript   = `
local key = KEYS[1]
local subdomain = ARGV[1]
local ipPort = redis.call("HGET", key, subdomain)
return ipPort
`
)

func init() {
	// Initialize Redis client
	redisClient = redis.NewClient(&redis.Options{
		Addr:     "localhost:6379", // Redis server address
		Password: "",               // No password
		DB:       0,                // Default database
	})
}

func main() {
	// Start the reverse proxy server
	log.Println("Reverse proxy server started on port 8080")
	http.HandleFunc("/", reverseProxy)
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func reverseProxy(w http.ResponseWriter, r *http.Request) {
	// Extract the subdomain from the request URL
	subdomain := extractSubdomain(r.Host)

	// Execute Lua script to get IP address and port
	ipPort, err := redisClient.Eval(luaScript, []string{"subdomains", subdomain}).Result()
	if err != nil {
		http.Error(w, "Error executing Lua script", http.StatusInternalServerError)
		log.Println("Error executing Lua script:", err)
		return
	}

	// Check if IP address and port are retrieved
	ipPortStr, ok := ipPort.(string)
	if !ok {
		http.Error(w, "Invalid IP address or port", http.StatusInternalServerError)
		log.Println("Invalid IP address or port:", ipPort)
		return
	}

	// Parse the destination URL
	destURL, err := url.Parse("http://" + ipPortStr)
	if err != nil {
		http.Error(w, "Error parsing destination URL", http.StatusInternalServerError)
		log.Println("Error parsing destination URL:", err)
		return
	}

	// Create a reverse proxy
	proxy := httputil.NewSingleHostReverseProxy(destURL)

	// Serve the request using the reverse proxy
	proxy.ServeHTTP(w, r)
}

// extractSubdomain extracts the subdomain from a given host string
func extractSubdomain(host string) string {
	parts := strings.SplitN(host, ".", 2)
	if len(parts) > 1 {
		return parts[0]
	}
	return ""
}
