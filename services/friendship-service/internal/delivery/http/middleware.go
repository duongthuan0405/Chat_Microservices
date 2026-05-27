package httpdelivery

import (
	"context"
	"log"
	"net/http"
	"runtime/debug"
	"strings"
	"time"
)

type contextKey string

const CurrentUserIDKey contextKey = "current_user_id"

func WithCORS(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization, userId, X-User-ID")

		if r.Method == http.MethodOptions {
			w.WriteHeader(http.StatusNoContent)
			return
		}

		next.ServeHTTP(w, r)
	})
}

func WithRecover(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		defer func() {
			if value := recover(); value != nil {
				log.Printf("panic recovered: %v\n%s", value, string(debug.Stack()))
				WriteError(w, http.StatusInternalServerError, "internal server error")
			}
		}()

		next.ServeHTTP(w, r)
	})
}

func WithRequestLog(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		startedAt := time.Now()
		next.ServeHTTP(w, r)
		log.Printf("%s %s %s", r.Method, r.URL.Path, time.Since(startedAt).String())
	})
}

func WithCurrentUser(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		userID := currentUserIDFromHeader(r)

		if userID == "" {
			WriteError(w, http.StatusUnauthorized, "missing userId header")
			return
		}

		ctx := context.WithValue(r.Context(), CurrentUserIDKey, userID)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func CurrentUserID(r *http.Request) string {
	value := r.Context().Value(CurrentUserIDKey)
	if value == nil {
		return ""
	}

	userID, ok := value.(string)
	if !ok {
		return ""
	}

	return userID
}

func currentUserIDFromHeader(r *http.Request) string {
	userID := strings.TrimSpace(r.Header.Get("userId"))
	if userID != "" {
		return userID
	}

	userID = strings.TrimSpace(r.Header.Get("X-User-ID"))
	if userID != "" {
		return userID
	}

	return ""
}
