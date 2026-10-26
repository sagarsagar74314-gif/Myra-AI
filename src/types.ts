export type Language = 'Hindi' | 'English' | 'Urdu';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'myra';
  text: string;
  timestamp: string;
  isVoice?: boolean;
  detectedAction?: DeviceAction;
  citations?: string[];
  audioBase64?: string;
}

export type DeviceActionType =
  | 'FLASHLIGHT'
  | 'STROBE_TORCH'
  | 'CAMERA'
  | 'DIALER'
  | 'CALL'
  | 'SMS'
  | 'VOLUME'
  | 'BRIGHTNESS'
  | 'WIFI'
  | 'BLUETOOTH'
  | 'AIRPLANE_MODE'
  | 'HOTSPOT'
  | 'MOBILE_DATA'
  | 'BATTERY_SAVER'
  | 'SOUND_MODE'
  | 'CREATE_FILE'
  | 'GENERATE_WEBSITE'
  | 'OPEN_APP'
  | 'OPEN_SETTINGS'
  | 'TOGGLE_FOREGROUND_SERVICE'
  | 'TOGGLE_SCREEN_OFF'
  | 'TOGGLE_INTRUSION'
  | 'TOGGLE_SNAP_DETECTOR'
  | 'GET_LOCATION'
  | 'TOGGLE_PROACTIVE_AGENT'
  | 'TOGGLE_HOTWORD_SERVICE'
  | 'VIEW_KOTLIN_CODE';

export interface DeviceAction {
  type: DeviceActionType;
  payload: any;
}

export interface CreatedFile {
  id: string;
  name: string;
  content: string;
  extension: string;
  size: number; // in bytes
  createdAt: string;
  updatedAt: string;
}

export interface GeneratedWebsite {
  id: string;
  title: string;
  html: string;
  css: string;
  js: string;
  prompt?: string;
  createdAt: string;
}

export interface HighAccuracyGpsData {
  lat: number;
  lng: number;
  accuracy: number; // in meters
  altitude: number | null;
  speed: number | null;
  heading: number | null;
  address: string;
  city: string;
  state: string;
  country: string;
  timestamp: string;
}

export interface IntrusionLog {
  id: string;
  timestamp: string;
  reason: string;
  intruderName?: string;
  snapshotBase64?: string;
}

export type SoundMode = 'sound' | 'vibrate' | 'silent';

export interface MobileState {
  flashlight: boolean;
  strobeTorch: boolean;
  volume: number; // 0 - 100 (media)
  ringVolume: number; // 0 - 100
  alarmVolume: number; // 0 - 100
  soundMode: SoundMode;
  brightness: number; // 10 - 100
  autoBrightness: boolean;
  wifi: boolean;
  bluetooth: boolean;
  mobileData: boolean;
  airplaneMode: boolean;
  hotspot: boolean;
  batterySaver: boolean;
  batteryLevel: number;
  isCharging: boolean;
  screenTimeout: number; // in seconds
  storageUsedMB: number;
  storageTotalGB: number;
  activeApp: string | null;
  locationName: string;
  gpsCoordinates?: { lat: number; lng: number };

  // Advanced Background & Intelligent Features
  isForegroundServiceRunning: boolean;
  isScreenOff: boolean;
  isIntrusionArmed: boolean;
  intruderAlertName: string;
  intrusionLogs: IntrusionLog[];
  isSnapDetectorActive: boolean;
  snapThreshold: number; // 0 - 100
  isClapDetectorActive?: boolean; // deprecated alias
  clapThreshold?: number; // deprecated alias
  isHotwordActive: boolean; // Continuous 'मायरा' wake-word detection in background
  isProactiveAgentActive: boolean;
  proactiveCheckIntervalMin: number;
  highAccuracyGps: HighAccuracyGpsData;
}

export type PermissionStatus = 'granted' | 'denied' | 'prompt';

export interface PermissionsState {
  microphone: PermissionStatus;
  camera: PermissionStatus;
  location: PermissionStatus;
  contacts: PermissionStatus;
  sms: PermissionStatus;
  storage: PermissionStatus;
  notifications: PermissionStatus;
  systemSettings: PermissionStatus;
}

export interface UserMemory {
  name: string;
  city: string;
  notes: string[];
}

export interface SettingsState {
  // Voice Settings
  voiceAssistantEnabled: boolean;
  speechRecognitionEnabled: boolean;
  ttsEnabled: boolean;
  autoLanguageDetection: boolean;
  spokenResponse: boolean;
  voiceSpeed: number; // 0.75, 1.0, 1.25, 1.5
  voiceVolume: number;
  voicePersona: 'Kore' | 'Puck' | 'Zephyr' | 'Fenrir';
  continuousListening: boolean; // default OFF

  // Chat Settings
  language: Language;
  searchEnabled: boolean;

  // Memory Settings
  memoryEnabled: boolean;
  memory: UserMemory;

  // UI Settings
  darkMode: boolean;
  phoneFrameMode: boolean; // toggle phone frame or full screen
  requireActionConfirmation: boolean; // safety confirmation for calls/SMS
}
