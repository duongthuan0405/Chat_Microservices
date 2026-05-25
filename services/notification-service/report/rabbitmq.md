# Báo Cáo Cấu Hình RabbitMQ / LavinMQ - NotificationService

Tài liệu này tổng hợp toàn bộ các sự kiện (Integration Events) mà dịch vụ **NotificationService** lắng nghe từ RabbitMQ/LavinMQ Broker để xử lý các thông báo trong hệ thống microservices.

---

## 📌 1. Thông Tin Broker Chung (CloudAMQP LavinMQ)

Vui lòng hỏi ai đó có thông tin này để họ giải đáp nhé.

---

## ⚡ 2. Danh Sách Các Sự Kiện Lắng Nghe (Integration Events)

### 🔔 Sự Kiện 1: Gửi Lời Mời Kết Bạn (`FriendRequestSent`)

*   **Tên sự kiện trong C#:** `FriendRequestSentIntegrationEvent`
*   **Tên Exchange:** `friend-request-sent`

#### 📥 Mẫu dữ liệu JSON gửi từ Publisher (Payload):
```json
{
  "senderId": "3fa85f64-5717-4562-b3fc-2c963f66afa1",
  "senderName": "Nguyễn Văn A",
  "receiverId": "3fa85f64-5717-4562-b3fc-2c963f66afa2",
  "timestamp": "2026-05-25T14:19:00Z"
}
```

---

### 🔔 Sự Kiện 2: Đồng Ý Kết Bạn (`FriendRequestAccepted`)

*   **Tên sự kiện trong C#:** `FriendRequestAcceptedIntegrationEvent`
*   **Tên Exchange:** `friend-request-accepted`

#### 📥 Mẫu dữ liệu JSON gửi từ Publisher (Payload):
```json
{
  "senderId": "c8a45e99-4c8d-4f11-8be9-e099b22cb123",
  "senderName": "Nguyễn Văn A",
  "receiverId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "timestamp": "2026-05-25T13:40:00Z"
}
```

---

### 🔔 Sự Kiện 3: Được Thêm Vào Nhóm Chat (`AddedToGroupChat`)

*   **Tên sự kiện trong C#:** `AddedToGroupChatIntegrationEvent`
*   **Tên Exchange:** `added-to-group-chat`

#### 📥 Mẫu dữ liệu JSON gửi từ Publisher (Payload):
```json
{
  "groupId": "7b045e99-4c8d-4f11-8be9-e099b22cb999",
  "groupName": "Biệt Đội DevOps 2026",
  "adderId": "c8a45e99-4c8d-4f11-8be9-e099b22cb123",
  "adderName": "Nguyễn Văn A",
  "addedUserId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "timestamp": "2026-05-25T14:10:00Z"
}
```

---
