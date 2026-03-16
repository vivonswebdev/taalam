declare module "@capacitor/local-notifications" {
  interface LocalNotificationSchedule {
    at?: Date;
    every?: string;
    on?: { hour: number; minute: number };
  }
  interface LocalNotification {
    id: number;
    title: string;
    body: string;
    schedule?: LocalNotificationSchedule;
    sound?: string;
    extra?: Record<string, any>;
  }
  interface PermissionStatus {
    display: "prompt" | "prompt-with-rationale" | "granted" | "denied";
  }
  export const LocalNotifications: {
    requestPermissions(): Promise<PermissionStatus>;
    checkPermissions(): Promise<PermissionStatus>;
    createChannel(channel: { id: string; name: string; importance: number; sound?: string; description?: string; vibration?: boolean; lights?: boolean; lightColor?: string; [key: string]: any }): Promise<void>;
    schedule(options: { notifications: LocalNotification[] }): Promise<any>;
    cancel(options: { notifications: { id: number }[] }): Promise<void>;
    getPending(): Promise<{ notifications: { id: number }[] }>;
    addListener(event: string, cb: (...args: any[]) => void): Promise<any>;
  };
}

declare module "@capacitor/status-bar" {
  export enum Style {
    Dark = "DARK",
    Light = "LIGHT",
    Default = "DEFAULT",
  }
  export const StatusBar: {
    setStyle(options: { style: Style }): Promise<void>;
    setBackgroundColor(options: { color: string }): Promise<void>;
    setOverlaysWebView(options: { overlay: boolean }): Promise<void>;
    show(): Promise<void>;
    hide(): Promise<void>;
  };
}

declare module "@capacitor/push-notifications" {
  export interface Token {
    value: string;
  }
  export interface PushNotificationSchema {
    title?: string;
    body?: string;
    data?: Record<string, any>;
  }
  export interface ActionPerformed {
    notification: PushNotificationSchema;
  }
  export interface PermissionStatus {
    receive: "prompt" | "prompt-with-rationale" | "granted" | "denied";
  }
  export const PushNotifications: {
    checkPermissions(): Promise<PermissionStatus>;
    requestPermissions(): Promise<PermissionStatus>;
    register(): Promise<void>;
    addListener(event: "registration", cb: (token: Token) => void): Promise<any>;
    addListener(event: "registrationError", cb: (err: any) => void): Promise<any>;
    addListener(event: "pushNotificationReceived", cb: (notification: PushNotificationSchema) => void): Promise<any>;
    addListener(event: "pushNotificationActionPerformed", cb: (action: ActionPerformed) => void): Promise<any>;
  };
}

declare module "@capacitor-community/speech-recognition" {
  export interface SpeechRecognitionListenerResult {
    matches?: string[];
  }
  export interface PermissionStatus {
    speechRecognition: "prompt" | "prompt-with-rationale" | "granted" | "denied";
  }
  export const SpeechRecognition: {
    available(): Promise<{ available: boolean }>;
    start(options: { language: string; popup?: boolean; partialResults?: boolean; maxResults?: number }): Promise<void>;
    stop(): Promise<void>;
    requestPermissions(): Promise<PermissionStatus>;
    checkPermissions(): Promise<PermissionStatus>;
    addListener(event: "partialResults", cb: (data: SpeechRecognitionListenerResult) => void): Promise<any>;
    removeAllListeners(): Promise<void>;
  };
}
