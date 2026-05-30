import * as signalR from "@microsoft/signalr";

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnecting: boolean = false;

  public async startConnection(token: string) {
    if (this.connection?.state === signalR.HubConnectionState.Connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      this.connection = new signalR.HubConnectionBuilder()
        // Giả sử Notification Hub nằm ở /hubs/notification
        .withUrl("/hubs/notifications", {
          accessTokenFactory: () => token,
          // Bắt buộc dùng LongPolling để token được gửi qua header thay vì query parameter
          transport: signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      await this.connection.start();
      console.log("🟢 SignalR Connected to Notification Hub");
    } catch (err) {
      console.error("🔴 Lỗi kết nối SignalR: ", err);
      setTimeout(() => this.startConnection(token), 5000);
    } finally {
      this.isConnecting = false;
    }
  }

  public stopConnection() {
    if (this.connection) {
      this.connection.stop();
      console.log("🔴 SignalR Disconnected");
    }
  }

  // Subscribe cho event Notification
  public onReceiveNotification(callback: (notification: any) => void) {
    if (this.connection) {
      // Tên phương thức phía Backend trigger xuống, ví dụ "ReceiveNotification"
      this.connection.on("ReceiveNotification", callback);
    }
  }

  public offReceiveNotification(callback: (notification: any) => void) {
    if (this.connection) {
      this.connection.off("ReceiveNotification", callback);
    }
  }
}

export const signalrService = new SignalRService();
