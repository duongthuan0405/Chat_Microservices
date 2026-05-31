import { useState, useEffect, useRef } from "react";
import { Avatar } from "../../components/Avatar";
import {
  Search,
  MoreVertical,
  Send,
  CheckCheck,
  Circle,
  Plus,
  X,
  Loader2,
  Users,
  Check,
  MessageCircle,
  UserPlus,
  LogOut
} from "lucide-react";
import { conversationApi, ConversationResponse, ConversationMember } from "../../api/conversationApi";
import { friendshipApi, FriendResponse } from "../../api/friendshipApi";
import { messageApi } from "../../api/messageApi";
import { authApi } from "../../api/authApi";
import { chatHubService } from "../../api/chatHubClient";
import { toast } from "sonner";
export function ChatDashboard() {
  const [conversations, setConversations] = useState<ConversationResponse[]>([]);
  const [selectedChat, setSelectedChat] = useState<ConversationResponse | null>(null);
  const selectedChatRef = useRef<ConversationResponse | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

 

  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  
  const [messages, setMessages] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showRightPanel, setShowRightPanel] = useState(true);

   useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Group Create Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [friends, setFriends] = useState<FriendResponse[]>([]);
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [creating, setCreating] = useState(false);

  // Group Management States
  const [groupMembers, setGroupMembers] = useState<ConversationMember[]>([]);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [friendsToAdd, setFriendsToAdd] = useState<string[]>([]);
  const [isAddingMember, setIsAddingMember] = useState(false);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferToUserId, setTransferToUserId] = useState<string | null>(null);
  const [isTransferring, setIsTransferring] = useState(false);

  const fetchGroupMembers = async (conversationId: string) => {
    try {
      const members = await conversationApi.getMembers(conversationId);
      const profiles = await Promise.all(
        members.map(async (m: any) => {
          const userId = m.userId || m.user_id || m.id;
          try {
            const req = await authApi.getProfile(userId);
            const data = req.data || req;
            return { ...m, name: data.name || m.name, avatarUrl: data.avatarUrl || m.avatarUrl };
          } catch {
            return m;
          }
        })
      );
      setGroupMembers(profiles);
    } catch (error) {
      console.error("Lỗi tải thành viên nhóm:", error);
    }
  };

  useEffect(() => {
    if (selectedChat?.isGroup) {
      fetchGroupMembers(selectedChat.id);
    } else {
      setGroupMembers([]);
    }
  }, [selectedChat?.id]);

  const handleLeaveGroup = async () => {
    if (!selectedChat) return;

    const currentUserId = localStorage.getItem("user_id");
    const currentUserMember = groupMembers.find((m: any) => (m.userId || m.user_id || m.id) === currentUserId);

    if (currentUserMember?.role === 'OWNER') {
      setShowTransferModal(true);
      return;
    }

    if (window.confirm("Bạn có chắc chắn muốn rời nhóm này?")) {
      try {
        await conversationApi.leaveGroup(selectedChat.id);
        toast.success("Đã rời nhóm");
        setSelectedChat(null);
        fetchConversations();
      } catch (error: any) {
        toast.error(error?.response?.data?.message || "Lỗi khi rời nhóm");
      }
    }
  };

  const handleTransferAndLeave = async () => {
    if (!selectedChat || !transferToUserId) return;
    setIsTransferring(true);
    try {
      // 1. Chuyển quyền (User nói ADMIN là owner)
      await conversationApi.changeRole(selectedChat.id, transferToUserId, 'ADMIN');
      
      // 2. Rời nhóm
      await conversationApi.leaveGroup(selectedChat.id);
      
      toast.success("Đã chuyển quyền và rời nhóm");
      setShowTransferModal(false);
      setSelectedChat(null);
      fetchConversations();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi chuyển quyền và rời nhóm");
    } finally {
      setIsTransferring(false);
    }
  };

  const handleAddMembersToGroup = async () => {
    if (!selectedChat || friendsToAdd.length === 0) return;
    setIsAddingMember(true);
    try {
      for (const friendId of friendsToAdd) {
        await conversationApi.addMember(selectedChat.id, friendId);
      }
      toast.success("Đã thêm thành viên");
      setShowAddMemberModal(false);
      setFriendsToAdd([]);
      fetchGroupMembers(selectedChat.id);
      fetchConversations(); // Update member count
    } catch (error) {
      toast.error("Có lỗi xảy ra khi thêm thành viên");
    } finally {
      setIsAddingMember(false);
    }
  };

  const toggleFriendToAdd = (id: string) => {
    setFriendsToAdd(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  useEffect(() => {
    fetchConversations();
    fetchFriends();
    fetchCurrentUser();

    // Lắng nghe tin nhắn mới
    const messageHandler = (newMsg: any) => {
      // Cập nhật lastMessage cho cuộc hội thoại trong danh sách
      setConversations((prev) => {
        const updated = prev.map((c) => {
          if (c.id === newMsg.conversationId) {
            const isSelected = selectedChatRef.current?.id === c.id;
            const isMe = newMsg.senderId === localStorage.getItem("user_id");
            return { 
              ...c, 
              lastMessage: newMsg.content, 
              lastMessageTime: newMsg.createdAt,
              unreadCount: (!isSelected && !isMe) ? (c.unreadCount || 0) + 1 : (c.unreadCount || 0)
            };
          }
          return c;
        });
        
        // Đưa đoạn chat có tin nhắn mới lên đầu
        return updated.sort((a, b) => {
          const timeA = new Date(a.lastMessageTime || 0).getTime();
          const timeB = new Date(b.lastMessageTime || 0).getTime();
          return timeB - timeA; // Giảm dần (mới nhất lên trên)
        });
      });

      // Nếu đang mở đúng đoạn chat này thì thêm tin nhắn vào danh sách
      setSelectedChat((currentChat) => {
        if (currentChat?.id === newMsg.conversationId) {
          setMessages((prevMsg) => {
            // Kiểm tra tránh trùng lặp tin nhắn (do tự gửi và nhận lại qua SignalR)
            const isExist = prevMsg.some((m) => m.id === newMsg.id);
            if (isExist) return prevMsg;
            return [...prevMsg, newMsg];
          });
        }
        return currentChat;
      });
    };

    chatHubService.onReceiveMessage(messageHandler);

    return () => {
      chatHubService.offReceiveMessage(messageHandler);
    };
  }, []);

  // Tải danh sách tin nhắn khi đổi cuộc hội thoại
  useEffect(() => {
    selectedChatRef.current = selectedChat;
    if (selectedChat) {
      fetchMessages(selectedChat.id);
      
      // Đánh dấu đã đọc ở local state
      setConversations(prev => {
        const updated = prev.map(c => c.id === selectedChat.id ? { ...c, unreadCount: 0 } : c);
        const hasUnread = updated.some(c => c.unreadCount && c.unreadCount > 0);
        if (!hasUnread) {
          window.dispatchEvent(new Event("clearUnreadMessages"));
        }
        return updated;
      });
    }
  }, [selectedChat]);

  const fetchMessages = async (conversationId: string) => {
    try {
      const data = await messageApi.getMessagesByConversationId(conversationId, 1, 50);
      // Giả sử data.items chứa mảng tin nhắn mới nhất
      // Nếu API trả về list giảm dần theo thời gian (mới nhất ở đầu) thì có thể cần .reverse()
      setMessages(data.items?.reverse() || []);
    } catch (err) {
      console.error("Lỗi tải tin nhắn:", err);
    }
  };

  const fetchCurrentUser = async () => {
    try {
      const userId = localStorage.getItem("user_id");
      if (userId) {
        const data = await authApi.getProfile(userId);
        setCurrentUser(data);
      }
    } catch (error) {
      console.error("Lỗi lấy thông tin người dùng:", error);
    }
  };

  const fetchConversations = async () => {
    try {
      const data = await conversationApi.getConversations();
      let convs = data || [];
      const currentUserId = localStorage.getItem("user_id");

      // Map tên và avatar cho hội thoại 1-1
      if (currentUserId) {
        convs = await Promise.all(convs.map(async (c: any) => {
          // Chuẩn hóa isGroup từ type
          c.isGroup = c.isGroup === true || c.type === "GROUP";

          try {
            const members = await conversationApi.getMembers(c.id);
            const membersCount = members.length;
            
            if (!c.isGroup) {
              const otherMember = members.find((m: any) => (m.userId || m.user_id || m.id) !== currentUserId);
              const targetId = otherMember?.userId || otherMember?.user_id || otherMember?.id;
              if (targetId) {
                const profileReq = await authApi.getProfile(targetId).catch(() => null);
                if (profileReq) {
                  const profile = profileReq.data || profileReq;
                  return { ...c, name: profile.name, avatarUrl: profile.avatarUrl, email: profile.email, membersCount };
                }
              }
            } else {
              return { ...c, membersCount };
            }
          } catch (e) {
            console.error("Lỗi lấy thông tin conversation:", e);
          }
          return c;
        }));
      }

      // Lấy tin nhắn cuối cùng cho tất cả hội thoại
      if (convs.length > 0) {
        try {
          const ids = convs.map((c: any) => c.id);
          const latestMsgs = await messageApi.getLatestMessages(ids);
          // Gộp tin nhắn cuối vào hội thoại
          convs = convs.map((c: any) => ({
            ...c,
            lastMessage: latestMsgs[c.id]?.content || c.lastMessage,
            lastMessageTime: latestMsgs[c.id]?.createdAt || c.lastActivity,
          }));
        } catch (msgErr) {
          console.error("Lỗi tải tin nhắn cuối:", msgErr);
        }
      }

      setConversations(convs);
      
      // Tham gia các nhóm SignalR để nhận tin nhắn realtime
      convs.forEach((c: any) => {
        chatHubService.joinConversation(c.id);
      });

      if (convs.length > 0 && !selectedChat) {
        setSelectedChat(convs[0]);
      }
    } catch (error) {
      console.error("Lỗi tải hội thoại:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFriends = async () => {
    try {
      const data = await friendshipApi.getFriends();
      const ids = data || [];
      const stringIds = ids.map((item: any) => typeof item === "string" ? item : item.id);
      const profiles = await Promise.all(
        stringIds.map(id => authApi.getProfile(id).catch(() => null))
      );
      const friendsProfiles = profiles.filter(p => p !== null).map(p => p.data || p);
      setFriends(friendsProfiles);
    } catch (error) {
      console.error("Lỗi tải bạn bè:", error);
    }
  };

  const handleSendMessage = async () => {
    if (message.trim() && selectedChat) {
      const msgContent = message.trim();
      setMessage(""); // Clear input
      try {
        const sentMsg = await messageApi.sendMessage(selectedChat.id, msgContent);
        // Gắn thêm vào danh sách hiện tại nếu chưa có (SignalR có thể đã đẩy về trước)
        setMessages((prev) => {
          if (prev.some((m) => m.id === sentMsg.id)) return prev;
          return [...prev, sentMsg];
        });
        // Update danh sách hội thoại
        setConversations((prev) => {
          const updated = prev.map((c) => 
            c.id === selectedChat.id 
              ? { ...c, lastMessage: sentMsg.content, lastMessageTime: sentMsg.createdAt }
              : c
          );
          return updated.sort((a, b) => {
            const timeA = new Date(a.lastMessageTime || 0).getTime();
            const timeB = new Date(b.lastMessageTime || 0).getTime();
            return timeB - timeA;
          });
        });
      } catch (err) {
        console.error("Lỗi gửi tin nhắn:", err);
        toast.error("Không thể gửi tin nhắn");
      }
    }
  };

  const handleCreateGroup = async () => {
    if (!newGroupName.trim()) {
      toast.error("Vui lòng nhập tên nhóm!");
      return;
    }
    if (selectedFriends.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 thành viên!");
      return;
    }
    try {
      setCreating(true);
      await conversationApi.createGroup(newGroupName, selectedFriends);
      toast.success("Tạo nhóm thành công!");
      setShowCreateModal(false);
      setNewGroupName("");
      setSelectedFriends([]);
      fetchConversations();
    } catch (error) {
      console.error("Lỗi tạo nhóm:", error);
      toast.error("Tạo nhóm thất bại");
    } finally {
      setCreating(false);
    }
  };

  const toggleFriendSelection = (id: string) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((fId) => fId !== id) : [...prev, id]
    );
  };

  const filteredChats = conversations.filter((chat) =>
    (chat.name || "").toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="h-full flex">
      {/* LEFT SIDEBAR */}
      <div className="w-full md:w-80 lg:w-96 flex-shrink-0 bg-slate-950/30 backdrop-blur-xl border-r border-white/10 flex flex-col">
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center gap-3 mb-4 cursor-pointer hover:bg-white/5 p-2 rounded-xl transition-all">
            <Avatar
              src={currentUser?.avatarUrl}
              alt="User"
              className="w-12 h-12 rounded-full ring-2 ring-cyan-500/50 bg-slate-800 overflow-hidden flex-shrink-0"
            />
            <div className="flex-1">
              <h3 className="text-white font-semibold truncate">{currentUser ? currentUser.name : "Đang tải..."}</h3>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-white/60">{currentUser ? currentUser.email : ""}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Tìm kiếm..."
                className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
              />
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white flex items-center justify-center hover:shadow-lg hover:shadow-cyan-500/50 transition-all"
              title="Tạo nhóm mới"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {loading ? (
            <div className="flex justify-center p-8">
              <Loader2 className="w-6 h-6 text-cyan-400 animate-spin" />
            </div>
          ) : filteredChats.length === 0 ? (
            <div className="text-center p-8 text-white/40 text-sm">
              Không có cuộc trò chuyện nào
            </div>
          ) : (
            filteredChats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`w-full p-4 flex items-center gap-3 hover:bg-white/5 transition-colors ${
                  selectedChat?.id === chat.id ? "bg-white/10" : ""
                }`}
              >
                <div className="relative">
                  <Avatar
                    src={chat.avatarUrl}
                    alt={chat.name}
                    className="w-12 h-12 rounded-full bg-slate-800 overflow-hidden"
                    isGroup={chat.isGroup}
                  />
                  {chat.unreadCount && chat.unreadCount > 0 ? (
                    <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-red-500 rounded-full border-2 border-slate-900"></span>
                  ) : null}
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-white font-medium truncate">
                      {chat.name}
                    </h4>
                    <span className="text-xs text-white/40 ml-2 flex-shrink-0">
                      {chat.lastMessageTime ? new Date(chat.lastMessageTime).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' }) : ""}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-white/60 truncate">
                      {chat.lastMessage || (chat.isGroup ? "Chưa có tin nhắn" : "Bắt đầu trò chuyện")}
                    </p>
                    {chat.unreadCount && chat.unreadCount > 0 ? (
                      <span className="ml-2 px-2 py-0.5 bg-cyan-500 text-white text-xs font-semibold rounded-full flex-shrink-0">
                        {chat.unreadCount}
                      </span>
                    ) : null}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* RIGHT SIDE (CHAT AREA) */}
      {selectedChat ? (
        <div className="hidden md:flex flex-1 flex-col relative">
          {/* Header */}
          <div className="h-16 px-6 flex items-center justify-between bg-slate-950/30 backdrop-blur-xl border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Avatar
                  src={selectedChat.avatarUrl}
                  alt={selectedChat.name}
                  className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden"
                  isGroup={selectedChat.isGroup}
                />
              </div>
              <div>
                <h3 className="text-white font-semibold">{selectedChat.name}</h3>
                <p className="text-xs text-white/60">
                  {selectedChat.isGroup ? `${selectedChat.membersCount || 0} thành viên` : "Trò chuyện cá nhân"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowRightPanel(!showRightPanel)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages List */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {messages.map((msg: any) => {
              const isMe = msg.senderId === currentUser?.id;
              return (
                <div
                  key={msg.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-md ${
                      isMe
                      ? "bg-gradient-to-br from-cyan-500 to-blue-500"
                      : "bg-slate-800/50"
                  } rounded-2xl px-4 py-3`}
                >
                    <p className="text-white">{msg.content}</p>
                    <div className="flex items-center gap-1 mt-1 justify-end">
                      <span className="text-xs text-white/60">
                        {new Date(msg.createdAt).toLocaleTimeString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMe && (
                        <span className="text-white/60">
                          <CheckCheck className="w-4 h-4 text-cyan-300" />
                        </span>
                      )}
                  </div>
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

          {/* Chat Input */}
          <div className="p-4 bg-slate-950/30 backdrop-blur-xl border-t border-white/10">
            <div className="flex items-end gap-2">
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
      ) : (
        <div className="hidden md:flex flex-1 items-center justify-center bg-slate-950/50">
          <div className="text-center text-white/40">
            <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p>Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        </div>
      )}

      {/* Right Info Panel */}
      {showRightPanel && selectedChat && (
        <div className="hidden lg:block w-80 bg-slate-950/30 backdrop-blur-xl border-l border-white/10 overflow-y-auto custom-scrollbar">
          <div className="p-6">
            <div className="text-center mb-6">
              <Avatar
                src={selectedChat.avatarUrl}
                alt={selectedChat.name}
                className="w-24 h-24 rounded-full mx-auto mb-4 bg-slate-800 overflow-hidden"
                isGroup={selectedChat.isGroup}
              />
              <h3 className="text-white text-xl font-bold mb-1">
                {selectedChat.name}
              </h3>
              <p className="text-white/60 text-sm">
                {selectedChat.isGroup ? `${selectedChat.membersCount || 0} thành viên` : "Trò chuyện cá nhân"}
              </p>
            </div>

            <div className="space-y-4">
              {!selectedChat.isGroup && (
                <div className="bg-slate-800/30 rounded-xl p-4">
                  <h4 className="text-white font-semibold mb-3">Thông tin</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-white/60">Email</span>
                      <span className="text-white">{selectedChat.email || "Không có email"}</span>
                    </div>
                  </div>
                </div>
              )}

              {selectedChat.isGroup && (
                <>
                  <div className="bg-slate-800/30 rounded-xl p-4 flex flex-col max-h-[300px]">
                    <div className="flex items-center justify-between mb-3 shrink-0">
                      <h4 className="text-white font-semibold flex items-center gap-2">
                        <Users className="w-4 h-4 text-cyan-400" />
                        Thành viên ({groupMembers.length})
                      </h4>
                      <button
                        onClick={() => {
                          setFriendsToAdd([]);
                          setShowAddMemberModal(true);
                        }}
                        className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center hover:bg-cyan-500/20 hover:text-cyan-400 transition-all text-white/60"
                        title="Thêm thành viên"
                      >
                        <UserPlus className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 flex-1">
                      {groupMembers.map((member: any) => (
                        <div key={member.id} className="flex items-center gap-3 p-2 bg-slate-800/50 rounded-lg hover:bg-slate-800/80 transition-colors">
                          <Avatar src={member.avatarUrl} alt={member.name} className="w-8 h-8 rounded-full bg-slate-700 overflow-hidden shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-sm font-medium truncate">{member.name || "Người dùng"}</p>
                            <p className="text-white/40 text-[10px] uppercase tracking-wider">
                              {member.role === 'OWNER' ? 'Trưởng nhóm' : member.role === 'ADMIN' ? 'Quản trị viên' : 'Thành viên'}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={handleLeaveGroup}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500/20 transition-all font-medium border border-red-500/20"
                  >
                    <LogOut className="w-4 h-4" />
                    Rời khỏi nhóm
                  </button>
                </>
              )}

              <div className="bg-slate-800/30 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-3">Tệp tin được chia sẻ</h4>
                <div className="space-y-2 text-white/40 text-sm text-center">
                  Chưa có tệp tin
                </div>
              </div>

              <div className="bg-slate-800/30 rounded-xl p-4">
                <h4 className="text-white font-semibold mb-3">Ảnh được chia sẻ</h4>
                <div className="space-y-2 text-white/40 text-sm text-center">
                  Chưa có ảnh
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tạo Nhóm */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 p-8 max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-6 shrink-0 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white">Tạo nhóm mới</h2>
              <button
                onClick={() => setShowCreateModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 flex-1 min-h-0">
              <div>
                <label className="block text-white/80 mb-2 text-sm font-medium">Tên nhóm</label>
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="Nhập tên nhóm..."
                  className="w-full px-4 py-3 bg-slate-800/50 border border-white/10 rounded-xl text-white placeholder:text-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-2 focus:ring-cyan-500/20"
                />
              </div>

              <div>
                <label className="block text-white/80 mb-2 text-sm font-medium">
                  Chọn thành viên ({selectedFriends.length})
                </label>
                {friends.length === 0 ? (
                  <p className="text-white/40 text-sm">Bạn chưa có bạn bè nào để thêm.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2 border border-white/10 p-2 rounded-xl bg-slate-800/20">
                    {friends.map((friend) => (
                      <div
                        key={friend.id}
                        onClick={() => toggleFriendSelection(friend.id)}
                        className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                          selectedFriends.includes(friend.id) ? "bg-cyan-500/20 border border-cyan-500/50" : "hover:bg-slate-800/50 border border-transparent"
                        }`}
                      >
                        <Avatar
                          src={friend.avatarUrl}
                          alt={friend.name}
                          className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden"
                        />
                        <span className="text-white text-sm flex-1 truncate">{friend.name}</span>
                        {selectedFriends.includes(friend.id) && (
                          <div className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-6 shrink-0 mt-6 border-t border-white/10">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleCreateGroup}
                disabled={creating}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {creating ? <Loader2 className="w-5 h-5 animate-spin" /> : "Tạo nhóm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm Thành Viên */}
      {showAddMemberModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 p-8 max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-6 shrink-0 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white">Thêm thành viên</h2>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 flex-1 min-h-0">
              <div>
                <label className="block text-white/80 mb-2 text-sm font-medium">
                  Chọn bạn bè ({friendsToAdd.length})
                </label>
                {friends.length === 0 ? (
                  <p className="text-white/40 text-sm">Bạn chưa có bạn bè nào để thêm.</p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar pr-2 border border-white/10 p-2 rounded-xl bg-slate-800/20">
                    {friends.map((friend) => {
                      // Không hiển thị những người đã có trong nhóm
                      const isAlreadyMember = groupMembers.some((m: any) => 
                        (m.userId || m.user_id || m.id) === friend.id
                      );
                      if (isAlreadyMember) return null;

                      return (
                        <div
                          key={friend.id}
                          onClick={() => toggleFriendToAdd(friend.id)}
                          className={`flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
                            friendsToAdd.includes(friend.id) ? "bg-cyan-500/20 border border-cyan-500/50" : "hover:bg-slate-800/50 border border-transparent"
                          }`}
                        >
                          <Avatar
                            src={friend.avatarUrl}
                            alt={friend.name}
                            className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden"
                          />
                          <span className="text-white text-sm flex-1 truncate">{friend.name}</span>
                          {friendsToAdd.includes(friend.id) && (
                            <div className="w-4 h-4 rounded-full bg-cyan-500 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-6 shrink-0 mt-6 border-t border-white/10">
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleAddMembersToGroup}
                disabled={isAddingMember || friendsToAdd.length === 0}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 text-white font-semibold hover:shadow-lg hover:shadow-cyan-500/50 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {isAddingMember ? <Loader2 className="w-5 h-5 animate-spin" /> : "Thêm"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Chuyển Quyền */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-white/10 p-8 max-w-md w-full max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between mb-6 shrink-0 border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white">Chuyển quyền Trưởng nhóm</h2>
              <button
                onClick={() => setShowTransferModal(false)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-white/60 text-sm mb-4 shrink-0">
              Bạn cần chuyển quyền trưởng nhóm cho một thành viên khác trước khi rời đi.
            </p>

            <div className="space-y-2 overflow-y-auto custom-scrollbar pr-2 flex-1 min-h-0">
              {groupMembers
                .filter(m => (m.userId || m.user_id || m.id) !== localStorage.getItem("user_id"))
                .map(member => {
                  const memberId = member.userId || member.user_id || member.id;
                  return (
                    <div
                      key={member.id}
                      onClick={() => setTransferToUserId(memberId)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${
                        transferToUserId === memberId ? "bg-cyan-500/20 border border-cyan-500/50" : "bg-slate-800/30 hover:bg-slate-800/50 border border-transparent"
                      }`}
                    >
                      <Avatar
                        src={member.avatarUrl}
                        alt={member.name}
                        className="w-10 h-10 rounded-full bg-slate-800 overflow-hidden"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate">{member.name || "Người dùng"}</p>
                      </div>
                      {transferToUserId === memberId && (
                        <div className="w-5 h-5 rounded-full bg-cyan-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                  );
                })}
              
              {groupMembers.length <= 1 && (
                <p className="text-center text-white/40 text-sm mt-4">
                  Nhóm chỉ có mình bạn, hiện tại không có ai để chuyển quyền. (Nếu cần, bạn có thể xóa nhóm - hiện chưa hỗ trợ).
                </p>
              )}
            </div>

            <div className="flex gap-3 pt-6 shrink-0 mt-6 border-t border-white/10">
              <button
                onClick={() => setShowTransferModal(false)}
                className="flex-1 px-4 py-3 rounded-xl bg-white/10 text-white font-semibold hover:bg-white/20 transition-all"
              >
                Hủy
              </button>
              <button
                onClick={handleTransferAndLeave}
                disabled={isTransferring || !transferToUserId}
                className="flex-1 px-4 py-3 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 text-white font-semibold hover:shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50 flex items-center justify-center"
              >
                {isTransferring ? <Loader2 className="w-5 h-5 animate-spin" /> : "Chuyển quyền & Rời đi"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
