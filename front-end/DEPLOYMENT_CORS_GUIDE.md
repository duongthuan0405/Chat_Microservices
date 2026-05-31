# Hướng Dẫn Cấu Hình NGINX Ingress Để Xử Lý CORS (Production)

Khi build Frontend (chạy `npm run build`), Vite Proxy sẽ không còn hoạt động. Do đó, để Frontend (FE) và Backend (BE) có thể giao tiếp được mà không bị lỗi CORS trong môi trường Kubernetes, chúng ta cần cấu hình NGINX Ingress theo một trong hai cách sau.

## Cách 1: Giải pháp "Same Domain" (Đề xuất - Tốt nhất)
Đưa cả Frontend và Backend về chung một domain để triệt tiêu hoàn toàn rào cản CORS (trình duyệt không coi đây là request ngoại lai nên sẽ không chặn). Đây là cách hoạt động tương đương với Vite Proxy lúc code ở local.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: chat-app-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    nginx.ingress.kubernetes.io/rewrite-target: /$2
spec:
  rules:
  - host: chat.duongthuan.com # Thay bằng Domain chính của dự án
    http:
      paths:
      # 1. Route cho Backend (Các request bắt đầu bằng /api/)
      - path: /api(/|$)(.*)
        pathType: Prefix
        backend:
          service:
            name: backend-gateway-service # Thay bằng tên service BE của bạn trên K8s
            port:
              number: 80
      
      # 2. Route cho Frontend (Tất cả các request giao diện còn lại)
      - path: /()(.*)
        pathType: Prefix
        backend:
          service:
            name: frontend-service # Thay bằng tên service FE của bạn trên K8s
            port:
              number: 80
```

## Cách 2: Bật Header CORS trực tiếp trên Ingress (Dùng khi FE và BE khác Domain)
Nếu bắt buộc phải để Frontend (VD: `app.chat.com`) và Backend (VD: `api.chat.com`) ở 2 domain hoặc sub-domain hoàn toàn khác nhau. Thay vì phải chọc vào code BE để mở CORS, bạn chỉ cần thêm Annotations vào file Ingress của Backend.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: backend-ingress
  annotations:
    kubernetes.io/ingress.class: nginx
    # Kích hoạt tính năng tự động trả về CORS headers
    nginx.ingress.kubernetes.io/enable-cors: "true"
    # Giới hạn chỉ cho phép đích danh Domain của Frontend được truy cập
    nginx.ingress.kubernetes.io/cors-allow-origin: "https://domain-frontend-cua-ban.com"
    # Các HTTP Methods được phép
    nginx.ingress.kubernetes.io/cors-allow-methods: "PUT, GET, POST, OPTIONS, DELETE"
    # Các Headers được phép gửi lên (Quan trọng nhất là Authorization để gửi Token)
    nginx.ingress.kubernetes.io/cors-allow-headers: "DNT,X-CustomHeader,Keep-Alive,User-Agent,X-Requested-With,If-Modified-Since,Cache-Control,Content-Type,Authorization"
spec:
  rules:
  - host: api.domain-cua-ban.com # Domain của Backend
    http:
      paths:
      - path: /
        pathType: Prefix
        backend:
          service:
            name: backend-gateway-service
            port:
              number: 80
```

## 🎯 Ghi chú bổ sung khi cấu hình biến môi trường (`.env.production`)
- Nếu dùng **Cách 1 (Cùng Domain)**: Biến `VITE_API_URL` trong file `.env.production` nên xóa đi hoặc để rỗng (`VITE_API_URL=""`). Khi đó Axios sẽ gọi theo đường dẫn tương đối `/api/...`, Ingress sẽ tự động phân luồng đúng nơi.
- Nếu dùng **Cách 2 (Khác Domain)**: Biến `VITE_API_URL` bắt buộc phải được thiết lập thành link tuyệt đối của Backend, ví dụ: `VITE_API_URL=https://api.domain-cua-ban.com`.
