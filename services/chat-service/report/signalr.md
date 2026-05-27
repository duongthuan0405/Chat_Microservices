# Báo Cáo Sự Kiện Realtime (SignalR) - ChatService

Tài liệu này tổng hợp toàn bộ các sự kiện Realtime mà phía Client (Frontend) cần đăng ký lắng nghe và xử lý qua kết nối SignalR Hub (`ChatHub`).

---

## 📌 1. Địa Chỉ Kết Nối Hub (SignalR Hub Endpoint)

*   **Endpoint:** `/hubs/chat`
*   **Bảo mật (Security):** Yêu cầu đính kèm JWT Bearer Token trong Header hoặc Query String (kết nối SignalR chuẩn) để xác thực người dùng.

---

## ⚡ 2. Danh Sách Các Sự Kiện Lắng Nghe (Realtime Events)

### 💬 1. Sự Kiện Tin Nhắn Mới (`ReceiveMessage`)

*   **Đối Tượng Phát:** Khi có tin nhắn mới được gửi thành công trong cuộc hội thoại.
*   **Phạm Vi Nhận (Scope):** Toàn bộ client đang trong SignalR Group của cuộc hội thoại đó (những người đang mở phòng chat).
*   **Dữ Liệu Trả Về (Payload):**
    ```json
    {
      "id": "c8a45e99-4c8d-4f11-8be9-e099b22cb123",
      "conversationId": "7b045e99-4c8d-4f11-8be9-e099b22cb999",
      "senderId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "content": "Chào bạn! Đây là tin nhắn real-time.",
      "type": "TEXT", // TEXT, IMAGE, FILE, v.v.
      "isDeleted": false,
      "createdAt": "2026-05-25T14:50:00Z",
      "updatedAt": null
    }
    ```
*   **Mục Đích Ở Frontend:** Thêm trực tiếp dòng tin nhắn mới vào cuối khung chat đang mở mà không cần tải lại trang.

---

### 🔔 2. Thông Báo Tin Nhắn Mới Ở Sidebar (`NewMessageNotification`)

*   **Đối Tượng Phát:** Khi có tin nhắn mới tại bất kỳ cuộc trò chuyện nào mà user có tham gia nhưng **không phải người gửi**.
*   **Phạm Vi Nhận (Scope):** Gửi trực tiếp đến kết nối cá nhân của từng thành viên (`userId`) thông qua SignalR `Clients.User(userId)`.
*   **Dữ Liệu Trả Về (Payload):** Tương tự như sự kiện `ReceiveMessage` (chứa đầy đủ thông tin tin nhắn mới).
*   **Mục Đích Ở Frontend:** 
    *   Tăng số lượng tin nhắn chưa đọc (badge counter +1) ở cuộc trò chuyện tương ứng trên danh sách Sidebar.
    *   Cập nhật tin nhắn xem trước (preview text) và thời gian của cuộc trò chuyện đó lên đầu danh sách.

---

### ✏️ 3. Cập Nhật Tin Nhắn Chỉnh Sửa (`MessageEdited`)

*   **Đối Tượng Phát:** Khi một tin nhắn trong cuộc hội thoại được sửa nội dung thành công.
*   **Phạm Vi Nhận (Scope):** Toàn bộ client đang trong SignalR Group của cuộc hội thoại đó.
*   **Dữ Liệu Trả Về (Payload):**
    ```json
    {
      "id": "c8a45e99-4c8d-4f11-8be9-e099b22cb123",
      "content": "Nội dung tin nhắn đã được sửa đổi.",
      "updatedAt": "2026-05-25T14:52:00Z"
    }
    ```
*   **Mục Đích Ở Frontend:** Tìm tin nhắn theo `id` và cập nhật lại nội dung mới, đồng thời hiển thị tag *"Đã chỉnh sửa"*.

---

### 🗑️ 4. Xóa/Thu Hồi Tin Nhắn (`MessageDeleted`)

*   **Đối Tượng Phát:** Khi một tin nhắn được thu hồi thành công (Soft Delete).
*   **Phạm Vi Nhận (Scope):** Toàn bộ client đang trong SignalR Group của cuộc hội thoại đó.
*   **Dữ Liệu Trả Về (Payload):**
    ```json
    {
      "id": "c8a45e99-4c8d-4f11-8be9-e099b22cb123",
      "isDeleted": true
    }
    ```
*   **Mục Đích Ở Frontend:** Ẩn nội dung tin nhắn cũ hoặc đổi hiển thị thành *"Tin nhắn đã bị thu hồi"*.

---

### 👀 5. Cập Nhật Trạng Thái Đã Đọc (`MessageRead`)

*   **Đối Tượng Phát:** Khi có thành viên mở cuộc hội thoại và đánh dấu đã đọc các tin nhắn.
*   **Phạm Vi Nhận (Scope):** Toàn bộ client đang trong SignalR Group của cuộc hội thoại đó.
*   **Dữ Liệu Trả Về (Payload):**
    ```json
    {
      "conversationId": "7b045e99-4c8d-4f11-8be9-e099b22cb999",
      "userId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "lastReadMessageId": "c8a45e99-4c8d-4f11-8be9-e099b22cb123",
      "readAt": "2026-05-25T14:53:00Z"
    }
    ```
*   **Mục Đích Ở Frontend:** Hiển thị biểu tượng tích xanh hoặc avatar nhỏ dưới tin nhắn cuối cùng để báo hiệu người kia đã đọc.
