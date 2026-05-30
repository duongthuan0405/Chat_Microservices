import * as signalR from "@microsoft/signalr";

class ChatHubService {
  private connection: signalR.HubConnection | null = null;
  private isConnecting: boolean = false;

  public async startConnection(token: string) {
    if (this.connection?.state === signalR.HubConnectionState.Connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.connection = new signalR.HubConnectionBuilder()
        // Cấu hình URL của Chat Hub (giả sử là /hubs/chat)
        .withUrl("/hubs/chat", {
          accessTokenFactory: () => token,
          // Bắt buộc dùng LongPolling để token được gửi qua header thay vì query parameter
          transport: signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

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
    if (this.connection) {
      this.connection.on("ReceiveMessage", callback);
    }
  }

  public offReceiveMessage(callback: (message: any) => void) {
    if (this.connection) {
      this.connection.off("ReceiveMessage", callback);
    }
  }

  // Tùy chọn: Hàm gửi tin nhắn qua SignalR (nếu Backend cho phép Client Invoke trực tiếp)
  // public async sendMessage(conversationId: string, content: string) {
  //   if (this.connection?.state === signalR.HubConnectionState.Connected) {
  //     await this.connection.invoke("SendMessage", conversationId, content);
  //   }
  // }
}

export const chatHubService = new ChatHubService();
