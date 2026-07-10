export type PermissionName = "camera" | "location" | "notification";
export type PermissionStatus = "unknown" | "granted" | "denied" | "blocked" | "unavailable";
export type BridgeSource = "web" | "app";

export type BridgeMessageType =
  | "WEB_READY"
  | "APP_READY"
  | "REQUEST_PERMISSION"
  | "PERMISSION_RESULT"
  | "GET_PUSH_TOKEN"
  | "PUSH_TOKEN"
  | "OPEN_SYSTEM_SETTINGS"
  | "NOTIFICATION_OPENED"
  | "APP_STATE_CHANGED"
  | "ERROR";

export type BridgeError = {
  code: string;
  message: string;
  details?: unknown;
  retryable?: boolean;
};

export type BridgeMessage<T = unknown> = {
  version: 1;
  source: BridgeSource;
  type: BridgeMessageType;
  requestId?: string;
  ts: number;
  payload?: T;
  error?: BridgeError;
};

export type AppReadyPayload = {
  platform: "android" | "ios";
  appVersion: string;
  deviceId: string;
  capabilities: {
    permissions: PermissionName[];
    pushToken: boolean;
    notificationOpen: boolean;
  };
  permissions: Partial<Record<PermissionName, PermissionStatus>>;
};

export type PermissionResultPayload = {
  permission: PermissionName;
  status: PermissionStatus;
};

export type PushTokenPayload = {
  provider: "fcm";
  token: string;
  platform: "android" | "ios";
  deviceId: string;
  appVersion?: string | null;
  permissionStatus: PermissionStatus;
};

export type NotificationOpenedPayload = {
  notificationId?: string;
  event?: string;
  coldStart?: boolean;
  route?: string;
  url?: string;
  screen?: string;
  entityId?: string;
  data?: Record<string, string>;
};
