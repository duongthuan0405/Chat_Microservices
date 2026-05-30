import * as signalR from "@microsoft/signalr";

class SignalRService {
  private connection: signalR.HubConnection | null = null;
  private isConnecting: boolean = false;
  private notificationCallbacks: ((notification: any) => void)[] = [];

  public async startConnection(token: string) {
    if (this.connection?.state === signalR.HubConnectionState.Connected || this.isConnecting) {
      return;
    }

    this.isConnecting = true;

    try {
      const API_URL = import.meta.env.VITE_API_URL || "";
      this.connection = new signalR.HubConnectionBuilder()
        // Giả sử Notification Hub nằm ở /hubs/notification
        .withUrl(`${API_URL}/hubs/notifications`, {
          accessTokenFactory: () => token,
          // Bắt buộc dùng LongPolling để token được gửi qua header thay vì query parameter
          transport: signalR.HttpTransportType.LongPolling
        })
        .withAutomaticReconnect()
        .configureLogging(signalR.LogLevel.Information)
        .build();

      this.notificationCallbacks.forEach(cb => {
        this.connection?.on("ReceiveNotification", cb);
      });

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
    if (!this.notificationCallbacks.includes(callback)) {
      this.notificationCallbacks.push(callback);
    }
    if (this.connection) {
      this.connection.on("ReceiveNotification", callback);
    }
  }

  public offReceiveNotification(callback: (notification: any) => void) {
    this.notificationCallbacks = this.notificationCallbacks.filter(cb => cb !== callback);
    if (this.connection) {
      this.connection.off("ReceiveNotification", callback);
    }
  }
}

export const signalrService = new SignalRService();
