package main

import (
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"

	"github.com/go-redis/redis"
)

var (
	redisClient *redis.Client
)

var luaScript string

func main() {
	// Start the reverse proxy server
	initRedis()
	log.Println("Reverse proxy server started on port 8080")
	http.HandleFunc("/", reverseProxy)
	log.Fatal(http.ListenAndServe(":8080", nil))
}

func initRedis() {
	// Initialize Redis client
	redisClient = redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_HOST"), // Redis server address
		Password: "",                      // No password
		DB:       0,                       // Default database
	})

	// Lua script to get IP address and port from Redis
	data, err := os.ReadFile("get_ip_port.lua")
	if err != nil {
		log.Fatal("Error reading Lua script:", err)
	}
	luaScript = string(data)
}

func reverseProxy(w http.ResponseWriter, r *http.Request) {
	// Extract the subdomain from the request URL
	subdomain := extractSubdomain(r.Host)

	// Execute Lua script to get IP address and port
	ipPort, err := redisClient.Eval(luaScript, []string{subdomain}).Result()
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
