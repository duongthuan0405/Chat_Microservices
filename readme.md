# Chat Microservice System

## 1. Tổng quan dự án

Chat Microservice System là hệ thống trò chuyện được xây dựng theo kiến trúc microservices, phục vụ các chức năng giao tiếp giữa người dùng như nhắn tin cá nhân, quản lý cuộc trò chuyện, kết bạn và gửi thông báo liên quan đến hoạt động chat.

Dự án được tách thành nhiều service độc lập nhằm giúp hệ thống dễ mở rộng, dễ triển khai và dễ bảo trì. Mỗi service đảm nhiệm một nhóm chức năng riêng, giao tiếp với nhau thông qua HTTP API và message broker.

<img width="1892" height="903" alt="Screenshot 2026-06-02 193006" src="https://github.com/user-attachments/assets/071e4568-1200-4810-a5d3-a5b495b34fe7" />


---

## 2. Mục tiêu của hệ thống

Hệ thống được xây dựng với các mục tiêu chính:

- Xây dựng nền tảng chat theo kiến trúc microservices.
- Tách riêng các chức năng như xác thực, chat, friendship và conversation.
- Hỗ trợ giao tiếp giữa các service thông qua API và RabbitMQ.
- Triển khai hệ thống bằng Docker và Kubernetes/k3s.
- Tích hợp CI/CD để tự động build, test và deploy.
- Tích hợp monitoring bằng Prometheus và Grafana để theo dõi tình trạng hệ thống.

---

## 3. Kiến trúc tổng quan

Hệ thống bao gồm các service chính:

| Service | Công nghệ | Chức năng chính |
|---|---|---|
| Auth Service | .NET | Xác thực người dùng, xử lý JWT token |
| Chat Service | .NET | Xử lý tin nhắn, realtime chat |
| Friendship Service | Go | Quản lý kết bạn, lời mời kết bạn |
| Conversation Service | Go | Quản lý cuộc trò chuyện cá nhân và nhóm |
| RabbitMQ | Message Broker | Truyền sự kiện giữa các service |
| PostgreSQL | Database | Lưu trữ dữ liệu của các service |
| Prometheus | Monitoring | Thu thập metrics từ service |
| Grafana | Visualization | Hiển thị biểu đồ giám sát hệ thống |

<img width="1448" height="1086" alt="Image 22_42_42 31 thg 5, 2026" src="https://github.com/user-attachments/assets/87d3a5f8-ccb3-4cc0-8558-3896801ea2e5" />

---

## 4. Luồng xử lý chính

### 4.1. Luồng xác thực

Người dùng đăng nhập vào hệ thống thông qua Auth Service. Sau khi đăng nhập thành công, hệ thống trả về JWT token. Token này được frontend gửi kèm trong các request tiếp theo để xác thực người dùng khi truy cập các API riêng tư.

### 4.2. Luồng kết bạn

Friendship Service xử lý các chức năng gửi lời mời kết bạn, chấp nhận lời mời và quản lý quan hệ bạn bè. Khi một lời mời kết bạn được gửi hoặc được chấp nhận, service có thể phát sinh event qua RabbitMQ để các service khác xử lý tiếp.


### 4.3. Luồng tạo cuộc trò chuyện

Conversation Service quản lý thông tin cuộc trò chuyện, thành viên trong nhóm chat và quyền của người dùng trong từng cuộc trò chuyện. Khi người dùng tạo nhóm hoặc thêm thành viên, service sẽ kiểm tra quyền, lưu dữ liệu và phát event thông báo nếu cần.


### 4.4. Luồng nhắn tin

Chat Service chịu trách nhiệm xử lý tin nhắn giữa các người dùng. Khi người dùng gửi tin nhắn, service kiểm tra quyền truy cập conversation, lưu tin nhắn và gửi dữ liệu realtime đến các thành viên liên quan.

---

## 5. Công nghệ sử dụng

Dự án sử dụng các công nghệ chính:

- **.NET**: xây dựng Auth Service và Chat Service.
- **Go**: xây dựng Friendship Service và Conversation Service.
- **PostgreSQL**: lưu trữ dữ liệu.
- **RabbitMQ**: truyền event bất đồng bộ giữa các service.
- **Docker**: đóng gói từng service thành container.
- **Kubernetes/k3s**: triển khai các service trên môi trường server.
- **GitHub Actions**: tự động hóa quy trình CI/CD.
- **Prometheus**: thu thập metrics.
- **Grafana**: trực quan hóa dữ liệu monitoring.
- **k6**: kiểm thử API và kiểm thử tải.

---

## 6. Triển khai hệ thống

Mỗi service được đóng gói bằng Dockerfile riêng. Sau khi build image, hệ thống được deploy lên server thông qua Kubernetes/k3s. Các thành phần như Deployment, Service, Secret và ConfigMap được sử dụng để quản lý container, biến môi trường và cấu hình kết nối.

<img width="745" height="199" alt="Screenshot 2026-05-31 234852" src="https://github.com/user-attachments/assets/9a837b3a-fb1b-4c8f-8b33-6406ccb36cf7" />

---

## 7. CI/CD

Dự án sử dụng GitHub Actions để tự động hóa quy trình phát triển. Khi có thay đổi trên repository, pipeline sẽ thực hiện các bước như build source code, chạy test, build Docker image, push image lên container registry và deploy lên server.

<img width="1466" height="581" alt="Screenshot 2026-05-31 230805" src="https://github.com/user-attachments/assets/5bf681b9-1ad1-4f23-bf92-9dd7c9e2ce7a" />


---

## 8. Monitoring

Hệ thống được tích hợp Prometheus và Grafana để theo dõi trạng thái hoạt động của các service. Prometheus thu thập metrics từ các service, sau đó Grafana sử dụng dữ liệu này để hiển thị biểu đồ như số lượng request, latency, lỗi HTTP và tình trạng service.

<img width="1529" height="788" alt="Screenshot 2026-06-01 201305" src="https://github.com/user-attachments/assets/f6472f97-2b6d-46f8-830a-345d1b133025" />


---

## 9. Kiểm thử

Dự án có sử dụng kiểm thử API và kiểm thử tải bằng k6. Các bài test giúp kiểm tra khả năng phản hồi của hệ thống, đảm bảo các API riêng tư được bảo vệ bằng token và đánh giá hiệu năng khi có nhiều request đồng thời.

<img width="1038" height="345" alt="Screenshot 2026-05-31 211337" src="https://github.com/user-attachments/assets/78f1bed4-a1c7-48cf-a502-6dc4c9b556c2" />


---

## 10. Kết luận

Chat Microservice System là một hệ thống chat được xây dựng theo hướng hiện đại, có tách service rõ ràng, hỗ trợ triển khai container, CI/CD và monitoring. Dự án không chỉ tập trung vào chức năng nhắn tin mà còn thể hiện quy trình xây dựng, triển khai và vận hành một hệ thống microservices hoàn chỉnh.
