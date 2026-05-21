# Notification Microservice

Dịch vụ thông báo (Notification Microservice) là một thành phần trong hệ thống **Chat Microservices**, đảm nhận nhiệm vụ xử lý, lưu trữ lịch sử và phân phối thông báo thời gian thực đến người dùng thông qua **SignalR (WebSockets)** và nhận các sự kiện tích hợp từ **RabbitMQ (MassTransit)**.

Dịch vụ được thiết kế theo nguyên lý **Clean Architecture** kết hợp với mô hình **CQRS (Command Query Responsibility Segregation)** thông qua thư viện **MediatR**.

---

## 1. Công Nghệ Sử Dụng

* **Framework:** ASP.NET Core (.NET 8.0/9.0)
* **Cơ sở dữ liệu:** PostgreSQL (sử dụng Entity Framework Core làm ORM)
* **Real-time Hub:** SignalR (WebSockets)
* **Message Broker:** RabbitMQ với thư viện MassTransit
* **Logging:** Serilog
* **Testing:** xUnit & FluentAssertions

---

## 2. Cấu Trúc Dự Án (Project Structure)

Dự án tuân thủ nghiêm ngặt mô hình **Clean Architecture** với chiều phụ thuộc đi vào trong (`Presentation` -> `Infrastructure` -> `Application` -> `Domain`).

```text
notification-service/
│
├── NotificationService/                      <--- Thư mục code chính của Microservice
│   ├── src/
│   │   ├── Domain/                           <--- Quy tắc nghiệp vụ, thực thể thuần khiết
│   │   │   ├── Builders/                     <--- Các Builder để khởi tạo thực thể
│   │   │   ├── Entities/                     <--- NotificationHistory, NotificationPreference, NotificationTemplate
│   │   │   ├── Enums/                        <--- DeliveryStatus (Pending, Sent, Failed)
│   │   │   └── Exceptions/                   <--- Các Exception nghiệp vụ (DomainException)
│   │   │
│   │   ├── Application/                      <--- Logic điều hướng và các ca sử dụng (Use Cases)
│   │   │   ├── Common/                       <--- Các Helper, Model dùng chung (PagedResult, StringExtensions)
│   │   │   ├── Exceptions/                   <--- NotFoundException, BadRequestException, v.v.
│   │   │   ├── ExternalServices/             <--- Định nghĩa các cổng dịch vụ bên ngoài (IRealtimeService)
│   │   │   ├── Persistence/                  <--- Interface của Repositories và Unit of Work
│   │   │   └── Features/                     <--- Logic CQRS phân chia theo Feature Slice
│   │   │       ├── Notifications/            <--- Quản lý thông báo lịch sử (Commands & Queries)
│   │   │       ├── Preferences/              <--- Cấu hình bật/tắt nhận thông báo của User
│   │   │       └── Templates/                <--- Quản lý mẫu nội dung thông báo (Bell templates)
│   │   │
│   │   ├── Infrastructure/                   <--- Triển khai kết nối DB, Broker, Hub ngoài
│   │   │   ├── Persistence/                  <--- DbContext, Migrations, Mapping Models
│   │   │   ├── Repositories/                 <--- Thực thi cụ thể của Repository Pattern
│   │   │   ├── HealthChecks/                 <--- Kiểm tra sức khỏe DB và RabbitMQ
│   │   │   └── ExternalServices/             <--- Triển khai SignalRRealtimeService
│   │   │
│   │   └── Presentation/                     <--- Cổng vào API và Consumer tiếp nhận thông tin
│   │       ├── Controllers/                  <--- Thin Controllers nhận HTTP Request và đẩy qua MediatR
│   │       ├── Consumers/                    <--- Các consumer lắng nghe từ RabbitMQ (MassTransit)
│   │       ├── DTOs/                         <--- Định nghĩa DTO giao tiếp không chứa logic
│   │       ├── Hubs/                         <--- SignalR NotificationHub
│   │       └── Middleware/                   <--- Global Exception Middleware xử lý lỗi tập trung
│   │
│   ├── Program.cs                            <--- Điểm khởi chạy cấu hình chính dịch vụ
│   ├── .env.development                      <--- Cấu hình biến môi trường cục bộ
│   └── Dockerfile                            <--- Hỗ trợ Containerization đóng gói Docker
```

### Các nguyên tắc cốt lõi:
1. **Domain Entity thuần khiết:** Các Entity trong `Domain/Entities` được bảo vệ dữ liệu tuyệt đối. `Constructor` không tham số được đặt là `private` để bắt buộc tạo thông qua `Builder`. Các property setter thực hiện validation trực tiếp và ném lỗi nghiệp vụ.
2. **Sử dụng Database Models để tách biệt DB với Domain:** Nhằm tránh việc EF Core can thiệp cấu trúc vào Domain Entity, hệ thống sử dụng các lớp model riêng biệt trong `Infrastructure/Persistence/Models` (ví dụ: `NotificationHistoryModel`) để giao tiếp trực tiếp với cơ sở dữ liệu và chuyển đổi dữ liệu qua lại với Domain Entity qua phương thức `FromDomain()` và `ToDomain()`.
3. **Mỏng hóa Controllers (Thin Controllers):** Các Controller chỉ phụ thuộc duy nhất vào `ISender` (MediatR), thực hiện ánh xạ DTO sang Command/Query và trả về kết quả dưới dạng envelope chuẩn hóa `ApiSuccessResponse`.

---

## 3. Cơ Chế Thử Lại & Xử Lý Lỗi (Retry & Error Handling)

### 3.1. Cơ chế Retry trên Message Broker (RabbitMQ)
Khi xử lý các sự kiện tích hợp từ hàng đợi (Queue), nếu Consumer xảy ra ngoại lệ (do nghẽn mạng, lỗi kết nối DB tạm thời, v.v.), hệ thống có cấu hình chính sách **Message Retry** tự động:
* **Chiến lược:** Fixed Interval (Chu kỳ cố định).
* **Số lần thử lại:** **6 lần**.
* **Thời gian chờ giữa các lần:** **5 giây**.
* **Đường đi khi thất bại hoàn toàn:** Sau 6 lần thử lại vẫn lỗi, tin nhắn sẽ được di chuyển sang hàng đợi lỗi lỗi biệt lập có đuôi `_error` (ví dụ: `friend-request-sent_error`) để kiểm tra thủ công.

Cấu hình chi tiết nằm tại: `Infrastructure/DependencyInjection.cs`:
```csharp
cfg.UseMessageRetry(r => r.Interval(6, TimeSpan.FromSeconds(5)));
```

### 3.2. central Exception Handling Middleware
Toàn bộ Exception xảy ra trên tầng Web API (kể cả lỗi validation dữ liệu đầu vào hoặc lỗi nghiệp vụ) được bắt tự động qua `GlobalExceptionMiddleware`. API sẽ trả về cấu trúc lỗi JSON thống nhất:
```json
{
  "success": false,
  "message": "Nội dung thông báo lỗi cụ thể",
  "data": null
}
```

---

## 4. Xử Lý Sự Kiện Tích Hợp (RabbitMQ Integration Consumers)

Dịch vụ lắng nghe 3 sự kiện chính từ các dịch vụ khác thông qua RabbitMQ:

1. **`FriendRequestSentIntegrationEvent`** (Lắng nghe từ Friendship Service):
   * Consumer: `FriendRequestSentConsumer`
   * Hành động: Tạo thông báo với template `FRIEND_REQUEST_RECEIVED` gửi tới người nhận và đẩy thông tin real-time.
2. **`FriendRequestAcceptedIntegrationEvent`** (Lắng nghe từ Friendship Service):
   * Consumer: `FriendRequestAcceptedConsumer`
   * Hành động: Tạo thông báo với template `FRIEND_REQUEST_ACCEPTED` gửi tới người gửi lời mời ban đầu.
3. **`AddedToGroupChatIntegrationEvent`** (Lắng nghe từ Group/Chat Service):
   * Consumer: `AddedToGroupChatConsumer`
   * Hành động: Tạo thông báo với template `ADDED_TO_GROUP_CHAT` gửi tới người được thêm vào nhóm chat.

---

## 5. Truyền Tải Thời Gian Thực (SignalR WebSockets)

* **Hub Endpoint:** `/hubs/notifications`
* **Xác thực User:** Sử dụng `CustomUserIdProvider` để xác định danh tính kết nối. Người dùng sẽ được ánh xạ kết nối thông qua:
  1. Header `X-User-Id` do API Gateway gửi xuống.
  2. Tham số query string `userId` (dùng cho môi trường Test cục bộ).
* **Client Method:** Khi có thông báo mới, server sẽ đẩy về client qua kênh: `ReceiveNotification`.

---

## 6. Danh Sách API Endpoints

### 6.1. Quản Lý Thông Báo (Notifications)

| HTTP Method | Route | Mô tả | Query/Body Parameters |
|:---|:---|:---|:---|
| **GET** | `/api/notifications/user/{userId}` | Lấy lịch sử thông báo của người dùng (Phân trang) | `pageNumber` (mặc định: 1)<br>`pageSize` (mặc định: 10) |
| **POST** | `/api/notifications/{id}/read` | Đánh dấu một thông báo đã đọc | `{id}` (Guid thông báo) |

### 6.2. Cấu Hình Nhận Thông Báo (Preferences)

| HTTP Method | Route | Mô tả |
|:---|:---|:---|
| **GET** | `/api/preferences/{userId}` | Lấy cấu hình bật/tắt nhận thông báo của người dùng |
| **POST** | `/api/preferences/{userId}/toggle` | Toggle (bật hoặc tắt) trạng thái nhận thông báo đẩy |

### 6.3. Quản Lý Mẫu Thông Báo (Templates)

| HTTP Method | Route | Mô tả | Body Parameter (JSON) |
|:---|:---|:---|:---|
| **GET** | `/api/templates/{code}` | Lấy mẫu thông báo theo mã code | |
| **POST** | `/api/templates` | Tạo mẫu thông báo mới | `{ "code": "...", "titleTemplate": "...", "bodyTemplate": "..." }` |
| **PUT** | `/api/templates/{code}` | Cập nhật nội dung mẫu thông báo | `{ "titleTemplate": "...", "bodyTemplate": "..." }` |
| **POST** | `/api/templates/{code}/toggle-active` | Kích hoạt hoặc vô hiệu hóa một mẫu thông báo | |

---

## 7. Hướng Dẫn Khởi Chạy (How to Run)

### 7.1. Cấu hình biến môi trường
Tạo tệp `.env.development` trong thư mục gốc `NotificationService/` với nội dung cấu hình kết nối của bạn:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=duongthuan
DB_PASSWORD=duongthuan
DB_DATABASE=notification_db

RABBITMQ_HOST=localhost
RABBITMQ_PORT=5672
RABBITMQ_USERNAME=guest
RABBITMQ_PASSWORD=guest
```

### 7.2. Chạy Migrations & Khởi tạo CSDL
Chạy lệnh sau để tự động chạy Migration và nạp dữ liệu mẫu ban đầu (seeding template):
```bash
dotnet run --project NotificationService/NotificationService.csproj -- --migrate
```

### 7.3. Khởi động dịch vụ
Khởi chạy dịch vụ ở chế độ phát triển:
```bash
dotnet run --project NotificationService/NotificationService.csproj
```
Dịch vụ sẽ lắng nghe tại cổng được cấu hình trong `launchSettings.json` và đăng ký kết nối thành công tới PostgreSQL và RabbitMQ.
