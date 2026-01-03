
export class NotificationService {
  private static instance: NotificationService;
  private listeners: ((title: string, message: string) => void)[] = [];

  private constructor() {
    this.requestPermission();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async requestPermission() {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission;
    }
    return 'denied';
  }

  public subscribe(callback: (title: string, message: string) => void) {
    this.listeners.push(callback);
  }

  public unsubscribe(callback: (title: string, message: string) => void) {
    this.listeners = this.listeners.filter(l => l !== callback);
  }

  public notify(title: string, message: string, options?: NotificationOptions) {
    // 1. Try Browser Native Notification
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, {
        body: message,
        icon: '/favicon.ico',
        ...options
      });
    }

    // 2. Trigger Custom App UI (Mobile Simulation)
    this.listeners.forEach(l => l(title, message));
  }
}

export const notificationService = NotificationService.getInstance();
