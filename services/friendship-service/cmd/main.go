package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"

	"friendship-service/internal/repository"
	"friendship-service/internal/usecase"

	"github.com/joho/godotenv"
	"github.com/neo4j/neo4j-go-driver/v5/neo4j"
)

func main() {
	ctx := context.Background()

	// 1. Load file .env khi chạy ở local
	if err := godotenv.Load(); err != nil {
		log.Println("💡 Warning: Không tìm thấy file .env, hệ thống sẽ đọc biến môi trường từ OS (Kubernetes/Docker OS).")
	}

	// 2. Check xem  thiếu biến không
	dbURI := os.Getenv("NEO4J_URI")
	dbUser := os.Getenv("NEO4J_USER")
	dbPassword := os.Getenv("NEO4J_PASSWORD")
	serverPort := os.Getenv("SERVER_PORT")

	if dbURI == "" || dbUser == "" || dbPassword == "" {
		log.Fatal("Cấu hình Database bị thiếu trong môi trường hệ thống! Dừng app ngay lập tức.")
	}
	if serverPort == "" {
		serverPort = ":8081"
	}

	// 3. Khởi tạo kết nối Neo4j
	driver, err := neo4j.NewDriverWithContext(dbURI, neo4j.BasicAuth(dbUser, dbPassword, ""))
	if err != nil {
		log.Fatalf("Không thể tạo kết nối Neo4j: %v", err)
	}
	defer driver.Close(ctx)

	if err = driver.VerifyConnectivity(ctx); err != nil {
		log.Fatalf("Kết nối tới Neo4j thất bại! Kiểm tra lại cấu hình: %v", err)
	}
	fmt.Println("[Production] Kết nối thành công tới Neo4j Database!")

	// 4. Khởi tạo các tầng kiến trúc
	friendRepo := repository.NewNeo4jRepository(driver)
	friendUC := usecase.NewFriendshipUsecase(friendRepo)

	// 5. Khai báo API Endpoints
	http.HandleFunc("/request", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Sai phương thức! Hãy dùng POST", http.StatusMethodNotAllowed)
			return
		}
		from := r.URL.Query().Get("from")
		to := r.URL.Query().Get("to")

		err := friendUC.RequestFriend(r.Context(), from, to)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest) // Trả về 400
			return
		}
		w.Write([]byte("Đã gửi lời mời kết bạn thành công!"))
	})

	http.HandleFunc("/accept", func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Sai phương thức! Hãy dùng POST", http.StatusMethodNotAllowed) // Trả về 405
			return
		}
		user := r.URL.Query().Get("user")
		friend := r.URL.Query().Get("friend")

		err := friendUC.ConfirmFriend(r.Context(), user, friend)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}
		w.Write([]byte("Hai bạn đã chính thức trở thành bạn bè!"))
	})

	http.HandleFunc("/list", func(w http.ResponseWriter, r *http.Request) {
		user := r.URL.Query().Get("user")

		friends, err := friendUC.ListFriends(r.Context(), user)
		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(friends)
	})

	// 6. Kích hoạt Server
	fmt.Printf("Friendship Service [Production-Mode] đang gánh tải tại cổng %s\n", serverPort)
	log.Fatal(http.ListenAndServe(serverPort, nil))
}
