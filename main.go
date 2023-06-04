package main

import (
	"fmt"
	"os"

	"github.com/joho/godotenv"
)

func main() {
	fmt.Println("Hello, world!")
	godotenv.Load("./.env.local")
	fmt.Println("AWS_KEY", os.Getenv("AWS_KEY"))
}
