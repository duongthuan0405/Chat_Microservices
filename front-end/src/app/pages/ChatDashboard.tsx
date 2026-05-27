import { useState } from "react";
import {
  Search,
  MoreVertical,
  Phone,
  Video,
  Smile,
  Paperclip,
  Send,
  Image as ImageIcon,
  Mic,
  X,
  Circle,
  Check,
  CheckCheck,
} from "lucide-react";

const mockChats = [
  {
    id: 1,
    name: "Nguyễn Văn A",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user1",
    lastMessage: "Hẹn gặp lại bạn nhé!",
    time: "2 phút",
    unread: 2,
    online: true,
  },
  {
    id: 2,
    name: "Trần Thị B",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user2",
    lastMessage: "Cảm ơn bạn nhiều!",
    time: "15 phút",
    unread: 0,
    online: true,
  },
  {
    id: 3,
    name: "Nhóm Dự Án",
    avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=group1",
    lastMessage: "Mai họp lúc 9h nhé",
    time: "1 giờ",
    unread: 5,
    online: false,
  },
  {
    id: 4,
    name: "Lê Văn C",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user3",
    lastMessage: "Ok, tôi sẽ gửi file cho bạn",
    time: "3 giờ",
    unread: 0,
    online: false,
  },
  {
    id: 5,
    name: "Phạm Thị D",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=user4",
    lastMessage: "Bạn có rảnh tối nay không?",
    time: "Hôm qua",
    unread: 0,
    online: true,
  },
];

const mockMessages = [
  {
    id: 1,
    sender: "other",
    content: "Chào bạn! Hôm nay bạn thế nào?",
    time: "10:30",
    status: "seen",
  },
  {
    id: 2,
    sender: "me",
    content: "Chào! Tôi khỏe, cảm ơn bạn. Còn bạn?",
    time: "10:32",
    status: "seen",
  },
  {
    id: 3,
    sender: "other",
    content: "Tôi cũng tốt. Ngày mai chúng ta có cuộc họp lúc mấy giờ nhỉ?",
    time: "10:35",
    status: "seen",
  },
  {
    id: 4,
    sender: "me",
    content: "Để tôi kiểm tra lịch...",
    time: "10:36",
    status: "seen",
  },
  {
    id: 5,
    sender: "me",
    content: "Cuộc họp vào lúc 9h sáng tại phòng họp A",
    time: "10:37",
    status: "seen",
  },
  {
    id: 6,
    sender: "other",
    content: "Tuyệt vời! Cảm ơn bạn nhiều",
    time: "10:38",
    status: "seen",
  },
  {
    id: 7,
    sender: "me",
    content: "Hẹn gặp lại bạn nhé!",
    time: "10:40",
    status: "delivered",
  },
];

export function ChatDashboard() {
  const [selectedChat, setSelectedChat] = useState(mockChats[0]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRightPanel, setShowRightPanel] = useState(true);

  const handleSendMessage = () => {
    if (message.trim()) {
      setMessage("");
    }
  };

  const filteredChats = mockChats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex">
      <div className="w-full md:w-80 lg:w-96 flex-shrink-0 bg-slate-950/30 backdrop-blur-xl border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3 mb-4">
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=currentuser"
              alt="User"
              className="w-12 h-12 rounded-full ring-2 ring-cyan-500/50"
            />
            <div className="flex-1">
              <h3 className="text-white font-semibold">Người dùng hiện tại</h3>
              <div className="flex items-center gap-1.5">
                <Circle className="w-2 h-2 fill-green-400 text-green-400" />
                <span className="text-xs text-green-400">Đang hoạt động</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Tìm kiếm cuộc trò chuyện..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredChats.map((chat) => (
            <button
              key={chat.id}
              onClick={() => setSelectedChat(chat)}
              className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors ${
                selectedChat.id === chat.id ? "bg-white/10" : ""
              }`}
            >
              <div className="relative">
                <img
                  src={chat.avatar}
                  alt={chat.name}
                  className="w-12 h-12 rounded-full"
                />
                {chat.online && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-400 border-2 border-slate-950 rounded-full" />
                )}
              </div>
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-white font-medium truncate">
                    {chat.name}
                  </h4>
                  <span className="text-xs text-white/40 ml-2 flex-shrink-0">
                    {chat.time}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-white/60 truncate">
                    {chat.lastMessage}
                  </p>
                  {chat.unread > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-cyan-500 text-white text-xs font-semibold rounded-full flex-shrink-0">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="hidden md:flex flex-1 flex-col">
        <div className="h-16 px-6 flex items-center justify-between bg-slate-950/30 backdrop-blur-xl border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img
                src={selectedChat.avatar}
                alt={selectedChat.name}
                className="w-10 h-10 rounded-full"
              />
              {selectedChat.online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 border-2 border-slate-950 rounded-full" />
              )}
            </div>
            <div>
              <h3 className="text-white font-semibold">{selectedChat.name}</h3>
              <p className="text-xs text-white/60">
                {selectedChat.online ? "Đang hoạt động" : "Không hoạt động"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
              <Phone className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all">
              <Video className="w-5 h-5" />
            </button>
            <button
              onClick={() => setShowRightPanel(!showRightPanel)}
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {mockMessages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-md ${
                  msg.sender === "me"
                    ? "bg-gradient-to-br from-cyan-500 to-blue-500"
                    : "bg-slate-800/50"
                } rounded-2xl px-4 py-3`}
              >
                <p className="text-white">{msg.content}</p>
                <div className="flex items-center gap-1 mt-1 justify-end">
                  <span className="text-xs text-white/60">{msg.time}</span>
                  {msg.sender === "me" && (
                    <span className="text-white/60">
                      {msg.status === "delivered" ? (
                        <CheckCheck className="w-4 h-4" />
                      ) : (
                        <CheckCheck className="w-4 h-4 text-cyan-300" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-slate-950/30 backdrop-blur-xl border-t border-white/10">
          <div className="flex items-end gap-2">
            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all flex-shrink-0">
              <Smile className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all flex-shrink-0">
              <Paperclip className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all flex-shrink-0">
              <ImageIcon className="w-5 h-5" />
            </button>
            <div className="flex-1">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Nhập tin nhắn..."
                rows={1}
                className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20 resize-none"
              />
            </div>
            <button
              onClick={handleSendMessage}
              className="w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-cyan-500 to-blue-500 text-white hover:shadow-lg hover:shadow-cyan-500/50 transition-all flex-shrink-0"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {showRightPanel && (
        <div className="hidden lg:block w-80 bg-slate-950/30 backdrop-blur-xl border-l border-white/10 overflow-y-auto">
          <div className="p-6">
            <div className="text-center mb-6">
              <img
                src={selectedChat.avatar}
                alt={selectedChat.name}
                className="w-24 h-24 rounded-full mx-auto mb-4"
              />
              <h3 className="text-white text-xl font-bold mb-1">
                {selectedChat.name}
              </h3>
              <p className="text-white/60 text-sm">
                {selectedChat.online ? "Đang hoạt động" : "Không hoạt động"}
              </p>
            </div>

            <div className="space-y-4">
              <div className="bg-slate-800/30 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-3">Thông tin</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-white/60">Email</span>
                    <span className="text-white">user@example.com</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-white/60">Điện thoại</span>
                    <span className="text-white">+84 123 456 789</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-800/30 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-3">
                  Tệp tin được chia sẻ
                </h4>
                <div className="space-y-2">
                  {[1, 2, 3].map((i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-2 bg-slate-700/30 rounded-lg hover:bg-slate-700/50 cursor-pointer transition-colors"
                    >
                      <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                        <Paperclip className="w-5 h-5 text-cyan-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate">
                          document_{i}.pdf
                        </p>
                        <p className="text-white/40 text-xs">2.5 MB</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-800/30 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-3">
                  Ảnh được chia sẻ
                </h4>
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <div
                      key={i}
                      className="aspect-square bg-slate-700/30 rounded-lg overflow-hidden cursor-pointer hover:opacity-80 transition-opacity"
                    >
                      <div className="w-full h-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
