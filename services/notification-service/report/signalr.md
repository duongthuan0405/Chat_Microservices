# Báo Cáo Sự Kiện Realtime (SignalR) - NotificationService

Tài liệu này tổng hợp toàn bộ thông tin kết nối và các sự kiện Realtime mà phía Client (Frontend) cần đăng ký lắng nghe qua SignalR Hub (`NotificationHub`) để nhận thông báo đẩy tức thời (Push Notification).

---

## 📌 1. Địa Chỉ Kết Nối Hub (SignalR Hub Endpoint)

*   **Endpoint:** `/hubs/notifications`
*   **Bảo mật (Security):** Yêu cầu xác thực người dùng. 
    *   **Môi trường Local (Phát triển):** FE truyền `userId` trực tiếp qua Query String: `?userId=<GUID>`.
    *   **Môi trường Production (API Gateway):** Gateway tự bóc tách JWT Token và đính kèm dưới dạng Header `X-User-Id`.
*   **Cấu hình nhịp tim (KeepAlive) & Timeout:**
    *   `KeepAliveInterval`: 15 giây (Server gửi gói ping định kỳ để giữ kết nối).
    *   `ClientTimeoutInterval`: 30 giây (Server ngắt nếu 30s không nhận được phản hồi).

---

## ⚡ 2. Sự Kiện Realtime Client Cần Lắng Nghe (Realtime Events)

Dịch vụ `NotificationService` chỉ phát ra **1 sự kiện duy nhất** trực tiếp tới người nhận:

### 🔔 1. Nhận Thông Báo Mới (`ReceiveNotification`)

*   **Đối Tượng Phát:** Khi hệ thống xử lý thành công một sự kiện gửi thông báo (như kết bạn mới, thêm vào nhóm, v.v.) và được lưu trữ an toàn trong Database.
*   **Phạm Vi Nhận (Scope):** Chỉ gửi duy nhất cho người nhận đích danh thông qua SignalR `Clients.User(userId)`.
*   **Dữ Liệu Trả Về (Payload):**
    ```json
    {
      "id": "7b045e99-4c8d-4f11-8be9-e099b22cb999", // ID lịch sử thông báo
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6", // ID người nhận
      "title": "Lời mời kết bạn mới",                  // Tiêu đề đã render
      "content": "Nguyễn Văn A đã gửi cho bạn một lời mời kết bạn.", // Nội dung đã render
      "createdAt": "2026-05-25T15:15:00Z"              // Thời gian tạo
    }
    ```
*   **Mục Đích Ở Frontend:** 
    *   Hiển thị thông báo đẩy dạng **Toast Notification** (pop-up nhỏ ở góc màn hình) ngay lập tức.
    *   Thêm vào danh sách thông báo chung trong trung tâm thông báo (Notification Center) của ứng dụng mà không cần reload trang.

---

## 💻 3. Mẫu Code Frontend Thiết Lập Kết Nối

```typescript
import * as signalR from "@microsoft/signalr";

const currentUserId = "3fa85f64-5717-4562-b3fc-2c963f66afa6"; // ID tài khoản đăng nhập

// 1. Tạo kết nối trỏ tới NotificationHub
const connection = new signalR.HubConnectionBuilder()
    .withUrl(`http://localhost:5002/hubs/notifications?userId=${currentUserId}`)
    .withAutomaticReconnect()
    .build();

// 2. Lắng nghe sự kiện nhận thông báo đẩy
connection.on("ReceiveNotification", (notification) => {
    console.log("🔔 [Notification] Nhận được thông báo mới:", notification);
    
    // Ví dụ: Kích hoạt Toast hiển thị thông báo
    showToast({
        title: notification.title,
        message: notification.content,
        type: "info"
    });
});

// 3. Khởi chạy kết nối
async function startNotificationListener() {
    try {
        await connection.start();
        console.log("🔔 [Notification] SignalR Connected!");
    } catch (err) {
        console.error("🔔 [Notification] Connection failed:", err);
    }
}

startNotificationListener();
```
