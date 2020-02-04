package main

import (
	"assignments-hawkticehurst/servers/gateway/handlers"
	"assignments-hawkticehurst/servers/gateway/models/users"
	"assignments-hawkticehurst/servers/gateway/sessions"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"strings"
	"sync/atomic"
	"time"

	"github.com/go-redis/redis"
	_ "github.com/go-sql-driver/mysql"
)

//main is the main entry point for the server
func main() {
	addr := os.Getenv("ADDR")
	if len(addr) == 0 {
		addr = ":443"
	}

	tlsKeyPath := os.Getenv("TLSKEY")
	tlsCertPath := os.Getenv("TLSCERT")
	if len(tlsKeyPath) == 0 || len(tlsCertPath) == 0 {
		err := fmt.Errorf("Environment variables TLSKEY and TLSCERT should be set.\nTLSKEY: %s\nTLSCERT: %s", tlsKeyPath, tlsCertPath)
		fmt.Println(err.Error())
		os.Exit(1)
	}

	sessionKey := os.Getenv("SESSIONKEY")
	reddisAddr := os.Getenv("REDISADDR")
	dsn := os.Getenv("DSN")

	redisClient := redis.NewClient(&redis.Options{
		Addr:     reddisAddr,
		Password: "",
		DB:       0,
	})

	db, err := sql.Open("mysql", dsn)
	if err != nil {
		fmt.Println(err.Error())
		os.Exit(1)
	}
	defer db.Close()

	redisStore := sessions.NewRedisStore(redisClient, time.Hour*100000)
	sqlStore := users.NewMySQLStore(db)

	hctx := handlers.NewContext(sessionKey, redisStore, sqlStore)

	mux := http.NewServeMux()
	wrappedMux := handlers.NewCORSHeader(mux)

	mux.HandleFunc("/v1/users", hctx.UsersHandler)
	mux.HandleFunc("/v1/users/", hctx.SpecificUserHandler)
	mux.HandleFunc("/v1/sessions", hctx.SessionsHandler)
	mux.HandleFunc("/v1/sessions/", hctx.SpecificSessionHandler)

	log.Printf("Server is listening at %s...", addr)
	log.Fatal(http.ListenAndServeTLS(addr, tlsCertPath, tlsKeyPath, wrappedMux))
}