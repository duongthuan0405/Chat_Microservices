import * as signalR from "@microsoft/signalr";

class ChatHubService {
  private connection: signalR.HubConnection | null = null;
  private isConnecting: boolean = false;
  private messageCallbacks: ((message: any) => void)[] = [];

  public async startConnection(token: string) {
    if (this.connection?.state === signalR.HubConnectionState.Connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const API_URL = import.meta.env.VITE_API_URL || "";
      this.connection = new signalR.HubConnectionBuilder()
        // Cấu hình URL của Chat Hub (giả sử là /hubs/chat)
        .withUrl(`${API_URL}/hubs/chat`, {
          accessTokenFactory: () => token,
          // Bắt buộc dùng LongPolling để token được gửi qua header thay vì query parameter
          transport: signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      // Đăng ký lại các callbacks đã add trước đó
      this.messageCallbacks.forEach(cb => {
        this.connection?.on("ReceiveMessage", cb);
      });

      await this.connection.start();
      console.log("🟢 SignalR Connected to Chat Hub");
    } catch (err) {
      console.error("🔴 Lỗi kết nối Chat Hub: ", err);
      setTimeout(() => this.startConnection(token), 5000);
    } finally {
      this.isConnecting = false;
    }
  }

  public stopConnection() {
    if (this.connection) {
      this.connection.stop();
      console.log("🔴 SignalR Chat Hub Disconnected");
    }
  }

  // Lắng nghe tin nhắn mới
  public onReceiveMessage(callback: (message: any) => void) {
    if (!this.messageCallbacks.includes(callback)) {
      this.messageCallbacks.push(callback);
    }
    if (this.connection) {
      this.connection.on("ReceiveMessage", callback);
    }
  }

  public offReceiveMessage(callback: (message: any) => void) {
    this.messageCallbacks = this.messageCallbacks.filter(cb => cb !== callback);
    if (this.connection) {
      this.connection.off("ReceiveMessage", callback);
    }
  }

  // Join conversation group
  public async joinConversation(conversationId: string) {
    let retries = 0;
    while (this.connection?.state !== signalR.HubConnectionState.Connected && retries < 10) {
      await new Promise(resolve => setTimeout(resolve, 500));
      retries++;
    }
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke("JoinConversation", conversationId);
      } catch (err) {
        console.error("Lỗi JoinConversation:", err);
      }
    }
  }

  // Leave conversation group
  public async leaveConversation(conversationId: string) {
    if (this.connection?.state === signalR.HubConnectionState.Connected) {
      try {
        await this.connection.invoke("LeaveConversation", conversationId);
      } catch (err) {
        console.error("Lỗi LeaveConversation:", err);
      }
    }
  }
}

export const chatHubService = new ChatHubService();
