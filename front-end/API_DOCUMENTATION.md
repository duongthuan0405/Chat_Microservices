# TÀI LIỆU CHI TIẾT API MICROSERVICES

Tài liệu này liệt kê chi tiết toàn bộ các API Endpoints trong hệ thống. Mỗi API bao gồm Method, Endpoint, Cấu trúc JSON Request (nếu có) và Cấu trúc JSON Response.
(Dùng để phục vụ quá trình phát triển Frontend và ghép nối API).

---

## 1. 🛡️ AUTH SERVICE (Quản lý Xác thực & Hồ sơ)

### 1.1. Đăng ký tài khoản mới
- **Method**: `POST`
- **Endpoint**: `/api/auth/register`
- **Request (Body)**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
- **Response (200 OK)**:
  ```json
  {
    "id": "guid-uuid-string",
    "email": "user@example.com",
    "token": "eyJhbGciOiJIUzI...",
    "expiresAt": "2024-05-30T10:00:00Z"
  }
  ```

### 1.2. Đăng nhập
- **Method**: `POST`
- **Endpoint**: `/api/auth/login`
- **Request (Body)**:
  ```json
  {
    "email": "user@example.com",
    "password": "Password123!"
  }
  ```
- **Response (200 OK)**: Trả về Token xác thực
  ```json
  {
    "id": "guid-uuid-string",
    "email": "user@example.com",
    "token": "eyJhbGciOiJIUzI...",
    "expiresAt": "2024-05-30T10:00:00Z"
  }
  ```

### 1.3. Xác thực Token (Dùng cho NGINX Ingress)
- **Method**: `GET`
- **Endpoint**: `/api/auth/verify-token`
- **Request (Headers)**: `Authorization: Bearer <token>`
- **Response (200 OK)**: Không có Body. Trả về Headers: `X-User-Id` và `X-User-Email`. (Trả 401 nếu token sai).

### 1.4. Lấy thông tin Profile
- **Method**: `GET`
- **Endpoint**: `/api/profile/{userId}`
- **Request**: Không có Body. (Truyền `userId` trên URL).
- **Response (200 OK)**:
  ```json
  {
    "id": "guid-string",
    "email": "user@example.com",
    "name": "Nguyễn Văn A",
    "phoneNumber": "0123456789",
    "avatarUrl": "https://link-to-avatar",
    "gender": "Male",
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-05-30T00:00:00Z"
  }
  ```

### 1.5. Cập nhật Profile
- **Method**: `PUT`
- **Endpoint**: `/api/profile/{userId}`
- **Request (Body)**:
  ```json
  {
    "name": "Nguyễn Văn B",
    "phoneNumber": "0987654321",
    "avatarUrl": "https://link-to-new-avatar",
    "gender": "Female"
  }
  ```
- **Response (200 OK)**: Trả về Object Profile mới nhất y như API 1.4.

---

## 2. 💬 CHAT SERVICE (Quản lý Tin nhắn)

### 2.1. Gửi tin nhắn mới
- **Method**: `POST`
- **Endpoint**: `/api/messages`
- **Request (Body)**:
  ```json
  {
    "conversationId": "guid-conversation-id",
    "content": "Nội dung tin nhắn",
    "type": "Text" // Hoặc Image, File...
  }
  ```
- **Response (201 Created)**:
  ```json
  {
    "success": true,
    "message": "Message sent successfully.",
    "data": {
      "id": "guid-message-id",
      "conversationId": "guid-conversation-id",
      "senderId": "guid-sender-id",
      "content": "Nội dung tin nhắn",
      "type": "Text",
      "isDeleted": false,
      "createdAt": "2024-05-30T10:00:00Z",
      "updatedAt": "2024-05-30T10:00:00Z"
    }
  }
  ```

### 2.2. Sửa tin nhắn
- **Method**: `PUT`
- **Endpoint**: `/api/messages/{id}`
- **Request (Body)**:
  ```json
  {
    "newContent": "Nội dung tin nhắn đã sửa"
  }
  ```
- **Response (200 OK)**: Trả về data tin nhắn đã cập nhật.

### 2.3. Thu hồi (Xóa mềm) tin nhắn
- **Method**: `DELETE`
- **Endpoint**: `/api/messages/{id}`
- **Request**: Không có Body.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Message deleted successfully.",
    "data": {
      "id": "guid-message-id",
      "conversationId": "guid-conversation-id",
      "isDeleted": true
    }
  }
  ```

### 2.4. Đánh dấu đã đọc tin nhắn
- **Method**: `POST`
- **Endpoint**: `/api/messages/{id}/read`
- **Request**: Không có Body.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Message marked as read successfully.",
    "data": {
      "id": "guid-message-id",
      "conversationId": "guid-conversation-id",
      "userId": "guid-user-id",
      "lastReadAt": "2024-05-30T10:00:00Z"
    }
  }
  ```

### 2.5. Lấy danh sách tin nhắn của 1 hội thoại (Phân trang)
- **Method**: `GET`
- **Endpoint**: `/api/messages/conversation/{conversationId}?pageNumber=1&pageSize=20`
- **Request**: Truyền qua Query URL.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "Conversation messages retrieved successfully.",
    "data": {
      "items": [
        {
          "id": "guid-message-id",
          "content": "Alo alo",
          "isRead": true,
          "readBy": ["user-id-1", "user-id-2"]
        }
      ],
      "totalCount": 100,
      "pageNumber": 1,
      "pageSize": 20
    }
  }
  ```

### 2.6. Lấy tin nhắn mới nhất của nhiều hội thoại cùng lúc
- **Method**: `POST`
- **Endpoint**: `/api/messages/conversations/latest`
- **Request (Body)**:
  ```json
  {
    "conversationIds": ["guid-conv-1", "guid-conv-2"]
  }
  ```
- **Response (200 OK)**: Dictionary dạng Key-Value (Key là Conversation ID).

### 2.7. Lấy tin nhắn mới nhất của 1 hội thoại
- **Method**: `GET`
- **Endpoint**: `/api/messages/conversation/{conversationId}/latest`
- **Request**: Không có body.
- **Response (200 OK)**: Data là MessageDto của tin nhắn cuối cùng.

---

## 3. 👥 CONVERSATION SERVICE (Quản lý Hội thoại)

### 3.1. Tạo hội thoại 1-1 (Direct)
- **Method**: `POST`
- **Endpoint**: `/api/conversations/direct`
- **Request (Body)**:
  ```json
  {
    "member_id": "guid-friend-id"
  }
  ```
- **Response (201 Created)**: Trả về object Conversation.

### 3.2. Tạo nhóm chat (Group)
- **Method**: `POST`
- **Endpoint**: `/api/conversations/groups`
- **Request (Body)**:
  ```json
  {
    "name": "Tên nhóm chat",
    "member_ids": ["guid-user-1", "guid-user-2"]
  }
  ```
- **Response (201 Created)**: Trả về object Group Conversation.

### 3.3. Lấy danh sách tất cả hội thoại của bản thân
- **Method**: `GET`
- **Endpoint**: `/api/conversations/`
- **Request**: Không có.
- **Response (200 OK)**: Mảng chứa các đoạn hội thoại mà user đang tham gia.

### 3.4. Lấy chi tiết 1 hội thoại
- **Method**: `GET`
- **Endpoint**: `/api/conversations/{conversationId}`
- **Request**: Không có.
- **Response (200 OK)**: Object chi tiết hội thoại.

### 3.5. Lấy danh sách thành viên trong nhóm
- **Method**: `GET`
- **Endpoint**: `/api/conversations/{conversationId}/members`
- **Request**: Không có.
- **Response (200 OK)**: Array các members.

### 3.6. Thêm thành viên vào nhóm
- **Method**: `POST`
- **Endpoint**: `/api/conversations/{conversationId}/members`
- **Request (Body)**:
  ```json
  {
    "member_id": "guid-user-to-add"
  }
  ```
- **Response (200 OK)**: Thông báo thành công.

### 3.7. Kích/Xóa thành viên khỏi nhóm
- **Method**: `DELETE`
- **Endpoint**: `/api/conversations/{conversationId}/members/{memberId}`
- **Request**: URL Params.
- **Response (200 OK)**: Thông báo thành công.

### 3.8. Tự rời nhóm
- **Method**: `POST`
- **Endpoint**: `/api/conversations/{conversationId}/leave`
- **Request**: Không có.
- **Response (200 OK)**: Thông báo rời nhóm thành công.

### 3.9. Cập nhật quyền (Role) của thành viên trong nhóm
- **Method**: `PATCH`
- **Endpoint**: `/api/conversations/{conversationId}/members/{memberId}/role`
- **Request (Body)**:
  ```json
  {
    "role": "admin" // hoặc "member"
  }
  ```
- **Response (200 OK)**: Thông báo đổi quyền thành công.

---

## 4. 🤝 FRIENDSHIP SERVICE (Quản lý Bạn bè)
*(Lưu ý chung: Tham số `friend_id` của Service này hỗ trợ linh hoạt, bạn có thể gửi nó bằng JSON Body `{ "friend_id": "..." }` HOẶC truyền trực tiếp qua URL Query `?friend_id=...` đều được).*

### 4.1. Lấy danh sách bạn bè
- **Method**: `GET`
- **Endpoint**: `/api/friendships`
- **Request**: Không có.
- **Response (200 OK)**: Array chứa thông tin bạn bè hiện tại.

### 4.2. Xóa bạn bè (Hủy kết bạn)
- **Method**: `DELETE`
- **Endpoint**: `/api/friendships`
- **Request (Body/Query)**: `friend_id`
- **Response (200 OK)**: Thành công.

### 4.3. Gửi lời mời kết bạn
- **Method**: `POST`
- **Endpoint**: `/api/friendships/request`
- **Request (Body/Query)**: `friend_id`
- **Response (201 Created)**: Thành công.

### 4.4. Đồng ý kết bạn
- **Method**: `POST`
- **Endpoint**: `/api/friendships/accept`
- **Request (Body/Query)**: `friend_id`
- **Response (200 OK)**: Thành công.

### 4.5. Từ chối kết bạn
- **Method**: `POST`
- **Endpoint**: `/api/friendships/reject`
- **Request (Body/Query)**: `friend_id`
- **Response (200 OK)**: Thành công.

### 4.6. Thu hồi lời mời đã gửi
- **Method**: `POST`
- **Endpoint**: `/api/friendships/cancel`
- **Request (Body/Query)**: `friend_id`
- **Response (200 OK)**: Thành công.

### 4.7. Chặn người dùng (Block)
- **Method**: `POST`
- **Endpoint**: `/api/friendships/block`
- **Request (Body/Query)**: `friend_id`
- **Response (200 OK)**: Thành công.

### 4.8. Bỏ chặn người dùng (Unblock)
- **Method**: `POST`
- **Endpoint**: `/api/friendships/unblock`
- **Request (Body/Query)**: `friend_id`
- **Response (200 OK)**: Thành công.

### 4.9. Kiểm tra trạng thái quan hệ với 1 người
- **Method**: `GET`
- **Endpoint**: `/api/friendships/status?friend_id={id}`
- **Request**: `friend_id` nằm ở Query URL.
- **Response (200 OK)**: Trả về trạng thái (VD: `None`, `Pending`, `Friend`, `Blocked`).

### 4.10. Lấy danh sách lời mời kết bạn ĐÃ NHẬN
- **Method**: `GET`
- **Endpoint**: `/api/friendships/requests/incoming`
- **Request**: Không có.
- **Response (200 OK)**: Danh sách user.

### 4.11. Lấy danh sách lời mời kết bạn ĐÃ GỬI ĐI
- **Method**: `GET`
- **Endpoint**: `/api/friendships/requests/outgoing`
- **Request**: Không có.
- **Response (200 OK)**: Danh sách user.

---

## 5. 🔔 NOTIFICATION SERVICE (Quản lý Thông báo)

### 5.1. Lấy lịch sử thông báo
- **Method**: `GET`
- **Endpoint**: `/api/notifications?pageNumber=1&pageSize=10`
- **Request**: Phân trang qua URL Query.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User notification history retrieved successfully.",
    "data": {
      "items": [
        {
          "id": "guid-notification",
          "userId": "guid-user",
          "title": "Bạn có tin nhắn mới",
          "content": "Nguyễn Văn A đã gửi tin nhắn",
          "isRead": false,
          "status": "Sent",
          "createdAt": "2024-05-30T10:00:00Z"
        }
      ],
      "totalCount": 50,
      "pageNumber": 1,
      "pageSize": 10
    }
  }
  ```

### 5.2. Đánh dấu đã đọc 1 thông báo
- **Method**: `POST`
- **Endpoint**: `/api/notifications/{id}/read`
- **Request**: Không có Body.
- **Response (200 OK)**: Trả về thông báo với `isRead` bằng `true`.

### 5.3. Lấy cấu hình nhận thông báo (Preferences)
- **Method**: `GET`
- **Endpoint**: `/api/preferences`
- **Request**: Không có.
- **Response (200 OK)**:
  ```json
  {
    "success": true,
    "message": "User notification preferences retrieved successfully.",
    "data": {
      "userId": "guid-user",
      "enablePush": true,
      "updatedAt": "2024-05-30T10:00:00Z"
    }
  }
  ```

### 5.4. Bật / Tắt nhận Push Notification
- **Method**: `POST`
- **Endpoint**: `/api/preferences/toggle`
- **Request**: Không có Body.
- **Response (200 OK)**: Trả về trạng thái `enablePush` đảo ngược so với hiện tại.

---

## 6. ❌ QUY CHUẨN TRẢ VỀ LỖI (ERROR RESPONSES)

Trong quá trình gọi API, nếu xảy ra lỗi (Bad Request, Unauthorized, Server Error...), hệ thống sẽ trả về HTTP Status Code tương ứng (400, 401, 403, 404, 500...) kèm theo Body dạng JSON mô tả lỗi. 

Có **2 định dạng lỗi** chính phụ thuộc vào Service bạn đang gọi:

### 6.1. Dành riêng cho AUTH SERVICE
Auth Service (C# Minimal API) trả về một Object lỗi đơn giản, chỉ chứa 1 field `message`.
- **Status Codes thường gặp**: `400 Bad Request`, `409 Conflict`.
- **JSON Format**:
  ```json
  {
    "message": "Email is already taken"
  }
  ```
*(Riêng lỗi `401 Unauthorized` của Auth Service thường sẽ không có Body).*

### 6.2. Dành cho 4 SERVICES CÒN LẠI (Chat, Conversation, Friendship, Notification)
Tất cả các service còn lại đều tuân thủ một chuẩn Response Wrapper chung. Khi có lỗi, field `success` luôn là `false`.
- **Status Codes thường gặp**: `400 Bad Request`, `403 Forbidden`, `404 Not Found`.
- **JSON Format mặc định**:
  ```json
  {
    "success": false,
    "message": "Không tìm thấy người dùng này."
  }
  ```
- **Lưu ý riêng cho Chat / Notification Service (C# MVC)**: Nếu lỗi do Validate dữ liệu (nhập thiếu field, sai format), có thể sẽ xuất hiện thêm field `errors` chứa chi tiết từng lỗi của từng field:
  ```json
  {
    "success": false,
    "message": "Validation failed",
    "errors": {
      "Content": [
        "Nội dung tin nhắn không được để trống"
      ]
    }
  }
  ```
