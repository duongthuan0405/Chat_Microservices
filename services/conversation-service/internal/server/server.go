package server

import (
	"context"
	httpdelivery "conversation-service/internal/delivery/http"
	"conversation-service/internal/domain"
	"net/http"
	"strconv"
	"time"

	"github.com/go-chi/chi/v5"
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
				"service": "conversation-service",
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
				"service": "conversation-service",
			},
		},
		[]string{"method", "route", "status"},
	)
)

func New(address string, conversationUsecase domain.ConversationUsecase) *Server {
	r := chi.NewRouter()

	r.Use(httpdelivery.WithRecover)
	r.Use(httpdelivery.WithCORS)
	r.Use(metricsMiddleware)
	r.Use(httpdelivery.WithRequestLog)

	r.Get("/health", func(w http.ResponseWriter, req *http.Request) {
		httpdelivery.WriteSuccess(w, http.StatusOK, "conversation-service is running", nil)
	})

	r.Get("/live", func(w http.ResponseWriter, req *http.Request) {
		httpdelivery.WriteSuccess(w, http.StatusOK, "conversation-service is alive", nil)
	})

	r.Get("/ready", func(w http.ResponseWriter, req *http.Request) {
		httpdelivery.WriteSuccess(w, http.StatusOK, "conversation-service is ready", nil)
	})

	r.Handle("/metrics", promhttp.Handler())

	conversationHandler := httpdelivery.NewConversationHandler(conversationUsecase)
	conversationHandler.RegisterRoutes(r)

	internalHandler := httpdelivery.NewInternalHandler(conversationUsecase)
	internalHandler.RegisterRoutes(r)

	return &Server{
		httpServer: &http.Server{
			Addr:              address,
			Handler:           r,
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

		route := chi.RouteContext(r.Context()).RoutePattern()
		if route == "" {
			route = r.URL.Path
		}

		status := strconv.Itoa(recorder.statusCode)

		httpRequestsTotal.WithLabelValues(r.Method, route, status).Inc()
		httpRequestDurationSeconds.WithLabelValues(r.Method, route, status).Observe(time.Since(startedAt).Seconds())
	})
}
