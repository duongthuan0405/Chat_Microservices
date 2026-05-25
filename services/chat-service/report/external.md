# Báo Cáo Tích Hợp Dịch Vụ Ngoài (External Service Integration) - ChatService

Tài liệu này tổng hợp toàn bộ các phương thức gọi API / giao tiếp liên dịch vụ (Inter-service Communication) mà **ChatService** yêu cầu từ các dịch vụ khác trong hệ thống microservices.

---

## 🔌 1. Dịch Vụ Cần Giao Tiếp: `group-service`

Để kiểm soát quyền hạn gửi tin nhắn và phân phối tin nhắn real-time chính xác, `ChatService` bắt buộc phải gọi các API từ dịch vụ **`group-service`** để lấy thông tin thành viên nhóm.

Các phương thức được định nghĩa thông qua interface `IConversationServiceClient` và triển khai tại lớp `ConversationServiceClient`:

---

## ⚡ 2. Danh Sách Các Phương Thức Yêu Cầu (Required Methods)

### 🔒 1. Kiểm Tra Quyền Thành Viên (`IsMemberAsync`)

*   **Mục đích:** Xác thực tính hợp lệ của User đối với một cuộc hội thoại / nhóm chat để tránh rò rỉ dữ liệu hoặc hacker cố tình gửi tin lén lén vào nhóm khác.
*   **Tham số đầu vào:**
    *   `conversationId` (Guid): ID của cuộc hội thoại hoặc nhóm chat.
    *   `userId` (Guid): ID của người dùng cần kiểm tra.
*   **Kết quả trả về:** `bool` (`true` nếu là thành viên hợp lệ, `false` nếu không thuộc nhóm).
*   **Khi nào được gọi:**
    1.  **Cấp độ HTTP API:** Khi User gọi API gửi tin nhắn (`SendMessageCommand`). Nếu kết quả trả về `false`, hệ thống sẽ chặn đứng và ném lỗi `ForbiddenException` (HTTP Status Code 403).
    2.  **Cấp độ SignalR Realtime:** Khi User yêu cầu lắng nghe sự kiện (`JoinConversation`) tại `ChatHub`. Hệ thống sẽ chặn không cho Client Join vào Group nếu kết quả trả về `false`.
*   **Tình trạng hiện tại:** Đang ở dạng **mock placeholder** (luôn trả về `true` để phục vụ phát triển local). Cần được tích hợp gọi HTTP Client hoặc gRPC Client tới `group-service` khi triển khai production.

---

### 👥 2. Lấy Danh Sách Thành Viên Hội Thoại (`GetMemberIdsAsync`)

*   **Mục đích:** Lấy toàn bộ danh sách User ID thuộc về cuộc trò chuyện để phân phối thông báo realtime ở Sidebar.
*   **Tham số đầu vào:**
    *   `conversationId` (Guid): ID của cuộc hội thoại hoặc nhóm chat.
*   **Kết quả trả về:** `List<Guid>` (Danh sách ID của toàn bộ thành viên trong nhóm).
*   **Khi nào được gọi:**
    *   Được gọi ngay sau khi một tin nhắn mới được lưu vào database thành công. `ChatService` sẽ lấy danh sách ID này để gửi sự kiện **`NewMessageNotification`** đến Sidebar của tất cả các thành viên còn lại (ngoại trừ chính người gửi).
*   **Tình trạng hiện tại:** Đang trả về **danh sách mock cứng** gồm 2 ID mẫu để test nội bộ. Cần tích hợp gọi API thực tế tới `group-service`.
