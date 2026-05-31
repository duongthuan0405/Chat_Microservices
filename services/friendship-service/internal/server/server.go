package server

import (
	"context"
	httpdelivery "friendship-service/internal/delivery/http"
	"friendship-service/internal/domain"
	"net/http"
	"strconv"
	"time"

	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
	"github.com/prometheus/client_golang/prometheus/promhttp"
)

type Server struct {
	httpServer *http.Server
}

var (
	httpRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "chat_microservice_http_requests_total",
			Help: "Total number of HTTP requests.",
			ConstLabels: prometheus.Labels{
				"service": "friendship-service",
			},
		},
		[]string{"method", "route", "status"},
	)

	httpRequestDurationSeconds = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "chat_microservice_http_request_duration_seconds",
			Help:    "HTTP request duration in seconds.",
			Buckets: prometheus.DefBuckets,
			ConstLabels: prometheus.Labels{
				"service": "friendship-service",
			},
		},
		[]string{"method", "route", "status"},
	)
)

func New(address string, friendshipUsecase domain.FriendshipUsecase) *Server {
	mux := http.NewServeMux()

	friendshipHandler := httpdelivery.NewFriendshipHandler(friendshipUsecase)
	friendshipHandler.RegisterRoutes(mux)

	mux.Handle("/metrics", promhttp.Handler())

	mux.HandleFunc("/live", func(w http.ResponseWriter, r *http.Request) {
		httpdelivery.WriteSuccess(w, http.StatusOK, "friendship-service is alive", nil)
	})

	mux.HandleFunc("/ready", func(w http.ResponseWriter, r *http.Request) {
		httpdelivery.WriteSuccess(w, http.StatusOK, "friendship-service is ready", nil)
	})

	handler := httpdelivery.WithRecover(
		metricsMiddleware(
			httpdelivery.WithRequestLog(mux),
		),
	)

	return &Server{
		httpServer: &http.Server{
			Addr:              address,
			Handler:           handler,
			ReadHeaderTimeout: 5 * time.Second,
			ReadTimeout:       10 * time.Second,
			WriteTimeout:      10 * time.Second,
			IdleTimeout:       60 * time.Second,
		},
	}
}

func (s *Server) Run() error {
	return s.httpServer.ListenAndServe()
}

func (s *Server) Shutdown(ctx context.Context) error {
	return s.httpServer.Shutdown(ctx)
}

type statusRecorder struct {
	http.ResponseWriter
	statusCode int
}

func (r *statusRecorder) WriteHeader(code int) {
	r.statusCode = code
	r.ResponseWriter.WriteHeader(code)
}

func metricsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		startedAt := time.Now()

		recorder := &statusRecorder{
			ResponseWriter: w,
			statusCode:     http.StatusOK,
		}

		next.ServeHTTP(recorder, r)

		route := normalizeRoute(r.URL.Path)
		status := strconv.Itoa(recorder.statusCode)

		httpRequestsTotal.WithLabelValues(r.Method, route, status).Inc()
		httpRequestDurationSeconds.WithLabelValues(r.Method, route, status).Observe(time.Since(startedAt).Seconds())
	})
}

func normalizeRoute(path string) string {
	switch path {
	case "/health", "/live", "/ready", "/metrics":
		return path
	case "/api/friendships",
		"/api/friendships/request",
		"/api/friendships/accept",
		"/api/friendships/reject",
		"/api/friendships/cancel",
		"/api/friendships/block",
		"/api/friendships/unblock",
		"/api/friendships/status",
		"/api/friendships/requests/incoming",
		"/api/friendships/requests/outgoing":
		return path
	default:
		return "unknown"
	}
}
