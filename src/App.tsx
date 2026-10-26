/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { AndroidFrame } from './components/AndroidFrame';
import { HomeScreen } from './components/HomeScreen';
import { ChatScreen } from './components/ChatScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { PermissionManagerModal } from './components/PermissionManagerModal';
import { DevelopmentStatusModal } from './components/DevelopmentStatusModal';
import { PhoneControlModal } from './components/PhoneControlModal';
import { AppDrawerModal } from './components/simulated_apps/AppDrawerModal';
import { CameraApp } from './components/simulated_apps/CameraApp';
import { DialerApp } from './components/simulated_apps/DialerApp';
import { SmsApp } from './components/simulated_apps/SmsApp';
import { CalculatorApp } from './components/simulated_apps/CalculatorApp';
import { FileManagerApp } from './components/simulated_apps/FileManagerApp';
import { WebStudioApp } from './components/simulated_apps/WebStudioApp';
import { AdvancedFeaturesModal } from './components/AdvancedFeaturesModal';
import { KotlinCodeModal } from './components/KotlinCodeModal';
import { ScreenOffOverlay } from './components/ScreenOffOverlay';
import {
  ChatMessage,
  CreatedFile,
  DeviceAction,
  GeneratedWebsite,
  HighAccuracyGpsData,
  IntrusionLog,
  Language,
  MobileState,
  PermissionsState,
  PermissionStatus,
  SettingsState,
} from './types';
import { SpeechManager, speakText, toggleHardwareTorch } from './utils/speech';
import { FingerSnapDetector } from './utils/snapDetector';
import { WakeWordDetector } from './utils/wakeWordDetector';
import { getHighAccuracyLocation } from './utils/locationService';

const DEFAULT_SETTINGS: SettingsState = {
  voiceAssistantEnabled: true,
  speechRecognitionEnabled: true,
  ttsEnabled: true,
  autoLanguageDetection: true,
  spokenResponse: true,
  voiceSpeed: 1.0,
  voiceVolume: 90,
  voicePersona: 'Puck',
  continuousListening: false,
  language: 'Hindi',
  searchEnabled: true,
  memoryEnabled: true,
  memory: {
    name: 'उपयोगकर्ता',
    city: 'नई दिल्ली',
    notes: ['पसंदीदा भाषा: हिंदी', 'सहायक: Myra AI'],
  },
  darkMode: true,
  phoneFrameMode: true,
  requireActionConfirmation: true,
};

const DEFAULT_GPS_DATA: HighAccuracyGpsData = {
  lat: 28.6139,
  lng: 77.209,
  accuracy: 4,
  altitude: 216,
  speed: 0,
  heading: 0,
  address: 'कनॉट प्लेस, नई दिल्ली, दिल्ली, 110001, भारत',
  city: 'नई दिल्ली',
  state: 'दिल्ली',
  country: 'भारत',
  timestamp: 'Just now',
};

const DEFAULT_MOBILE_STATE: MobileState = {
  flashlight: false,
  strobeTorch: false,
  volume: 80,
  ringVolume: 85,
  alarmVolume: 90,
  soundMode: 'sound',
  brightness: 90,
  autoBrightness: false,
  wifi: true,
  bluetooth: true,
  mobileData: true,
  airplaneMode: false,
  hotspot: false,
  batterySaver: false,
  batteryLevel: 88,
  isCharging: false,
  screenTimeout: 30,
  storageUsedMB: 2840,
  storageTotalGB: 128,
  activeApp: null,
  locationName: 'नई दिल्ली, भारत',
  gpsCoordinates: { lat: 28.6139, lng: 77.209 },

  // Advanced Background & Intelligent Features
  isForegroundServiceRunning: true,
  isScreenOff: false,
  isIntrusionArmed: false,
  intruderAlertName: 'अज्ञात व्यक्ति',
  intrusionLogs: [],
  isSnapDetectorActive: true,
  snapThreshold: 65,
  isClapDetectorActive: true,
  clapThreshold: 65,
  isHotwordActive: true,
  isProactiveAgentActive: true,
  proactiveCheckIntervalMin: 30,
  highAccuracyGps: DEFAULT_GPS_DATA,
};

const DEFAULT_PERMISSIONS: PermissionsState = {
  microphone: 'granted',
  camera: 'prompt',
  location: 'granted',
  contacts: 'granted',
  sms: 'granted',
  storage: 'granted',
  notifications: 'prompt',
  systemSettings: 'granted',
};

const INITIAL_FILES: CreatedFile[] = [
  {
    id: 'file-1',
    name: 'notes.txt',
    extension: 'txt',
    content: 'Myra AI Notes:\n- दैनिक कार्य सूची\n- मीटिंग समय: शाम 4 बजे\n- कोडिंग प्रोजेक्ट्स और वेबसाइट्स',
    size: 112,
    createdAt: 'Today 10:00 AM',
    updatedAt: 'Today 10:00 AM',
  },
  {
    id: 'file-2',
    name: 'index.html',
    extension: 'html',
    content: '<!DOCTYPE html>\n<html>\n<head>\n  <title>Welcome to Myra Web</title>\n</head>\n<body style="font-family:sans-serif;background:#0f172a;color:#f8fafc;padding:30px;text-align:center;">\n  <h1>⚡ Myra AI Web Page</h1>\n  <p>यह पेज Myra AI असिस्टेंट द्वारा तैयार किया गया है।</p>\n</body>\n</html>',
    size: 320,
    createdAt: 'Today 10:15 AM',
    updatedAt: 'Today 10:15 AM',
  },
  {
    id: 'file-3',
    name: 'script.py',
    extension: 'py',
    content: '# Python Calculator\ndef add(a, b):\n    return a + b\n\nprint("25 + 75 =", add(25, 75))\n',
    size: 88,
    createdAt: 'Today 10:20 AM',
    updatedAt: 'Today 10:20 AM',
  },
  {
    id: 'file-4',
    name: 'MyraForegroundService.kt',
    extension: 'kt',
    content: '// Kotlin 24/7 Foreground Service & Screen-off WakeLock\npackage com.myra.ai.service\n\nclass MyraForegroundService : Service() {\n    // Foreground service keeping Myra active when screen is off\n}\n',
    size: 245,
    createdAt: 'Today 10:30 AM',
    updatedAt: 'Today 10:30 AM',
  },
  {
    id: 'file-5',
    name: 'ClapAcousticTriggerService.kt',
    extension: 'kt',
    content: '// Acoustic Sound & Clap Detector in Kotlin\npackage com.myra.ai.service\n\nobject ClapAcousticTriggerService {\n    // AudioRecord background peak energy spike analyzer\n}\n',
    size: 210,
    createdAt: 'Today 10:35 AM',
    updatedAt: 'Today 10:35 AM',
  },
];

export default function App() {
  // Saved Settings
  const [settings, setSettings] = useState<SettingsState>(() => {
    try {
      const saved = localStorage.getItem('myra_ai_settings');
      return saved ? JSON.parse(saved) : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Mobile Hardware / OS State
  const [mobileState, setMobileState] = useState<MobileState>(() => {
    try {
      const saved = localStorage.getItem('myra_ai_mobile_state');
      return saved ? JSON.parse(saved) : DEFAULT_MOBILE_STATE;
    } catch {
      return DEFAULT_MOBILE_STATE;
    }
  });

  // Android Permissions
  const [permissions, setPermissions] = useState<PermissionsState>(() => {
    try {
      const saved = localStorage.getItem('myra_ai_permissions');
      return saved ? JSON.parse(saved) : DEFAULT_PERMISSIONS;
    } catch {
      return DEFAULT_PERMISSIONS;
    }
  });

  // Created Files in Storage
  const [files, setFiles] = useState<CreatedFile[]>(() => {
    try {
      const saved = localStorage.getItem('myra_ai_files');
      return saved ? JSON.parse(saved) : INITIAL_FILES;
    } catch {
      return INITIAL_FILES;
    }
  });

  // Generated Website Studio State
  const [currentWebsite, setCurrentWebsite] = useState<GeneratedWebsite | null>(() => {
    try {
      const saved = localStorage.getItem('myra_ai_website');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [isGeneratingWebsite, setIsGeneratingWebsite] = useState(false);

  // Chat Messages
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('myra_ai_messages');
      if (saved) return JSON.parse(saved);
    } catch {}
    return [
      {
        id: 'welcome',
        sender: 'myra',
        text: 'हाँ जी बॉस! बताइए, कैसे हैं आप? सब ठीक हो ना आप या आपको क्या मदद चाहिए? आपका यह छोटा साथी मायरा हर पल आपकी सेवा में हाज़िर है!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });

  // Active Screen
  const [currentScreen, setCurrentScreen] = useState<'home' | 'chat'>('home');

  // Modals
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPermissionsOpen, setIsPermissionsOpen] = useState(false);
  const [isDevStatusOpen, setIsDevStatusOpen] = useState(false);
  const [isPhoneControlOpen, setIsPhoneControlOpen] = useState(false);
  const [isAppDrawerOpen, setIsAppDrawerOpen] = useState(false);
  const [isAdvancedModalOpen, setIsAdvancedModalOpen] = useState(false);
  const [isKotlinModalOpen, setIsKotlinModalOpen] = useState(false);
  const [liveSoundLevel, setLiveSoundLevel] = useState(0);

  // Apps
  const [isFileManagerOpen, setIsFileManagerOpen] = useState(false);
  const [isWebStudioOpen, setIsWebStudioOpen] = useState(false);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDialerOpen, setIsDialerOpen] = useState(false);
  const [dialerNumber, setDialerNumber] = useState('');
  const [isSmsOpen, setIsSmsOpen] = useState(false);
  const [smsRecipient, setSmsRecipient] = useState('');
  const [smsText, setSmsText] = useState('');
  const [isCalculatorOpen, setIsCalculatorOpen] = useState(false);

  // Voice & AI State
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isThinking, setIsThinking] = useState(false);
  const [voiceTranscript, setVoiceTranscript] = useState('');
  const [voiceResponse, setVoiceResponse] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const speechManagerRef = useRef<SpeechManager | null>(null);
  const snapDetectorRef = useRef<FingerSnapDetector | null>(null);
  const wakeWordDetectorRef = useRef<WakeWordDetector | null>(null);

  // Play Police/Intrusion Alarm Siren via Web Audio API
  const playAlarmSiren = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.3);
      osc.frequency.linearRampToValueAtTime(700, ctx.currentTime + 0.6);
      osc.frequency.linearRampToValueAtTime(1200, ctx.currentTime + 0.9);
      osc.frequency.linearRampToValueAtTime(800, ctx.currentTime + 1.2);
      gain.gain.setValueAtTime(0.4, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 1.3);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.3);
    } catch (e) {
      // ignore
    }
  };

  // Trigger Intrusion Alert
  const handleTriggerIntrusion = (reason: string = 'अनधिकृत स्पर्श (Unauthorized Touch)') => {
    playAlarmSiren();
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLog: IntrusionLog = {
      id: `log-${Date.now()}`,
      timestamp: timeStr,
      reason,
      intruderName: mobileState.intruderAlertName || 'अज्ञात व्यक्ति',
    };
    setMobileState((prev) => ({
      ...prev,
      isScreenOff: false,
      intrusionLogs: [newLog, ...(prev.intrusionLogs || []).slice(0, 19)],
    }));
    const alertMsg = `अलर्ट! बॉस, कोई आपके फ़ोन को छू रहा है! ${mobileState.intruderAlertName || 'अनधिकृत स्पर्श'} पकड़ा गया है! तुरंत फ़ोन छोड़ें!`;
    setStatusMessage(`🚨 घुसपैठ चेतावनी! ${reason}`);
    handlePlaySpeech(alertMsg);
  };

  // Trigger Finger Snap Detected Wakeup (हाई-फ़्रीक्वेंसी चुटकी डिटेक्टर)
  const handleSnapDetected = () => {
    if (mobileState.isScreenOff) {
      setMobileState((prev) => ({ ...prev, isScreenOff: false }));
    }
    const snapGreeting = 'हाँ जी बॉस! आपकी चुटकी की आवाज़ सुन ली! बताइए क्या आज्ञा है?';
    setStatusMessage('👌 चुटकी की पहचान हुई (Finger Snap Detected)!');
    setVoiceResponse(snapGreeting);
    setIsVoiceModalOpen(true);
    handlePlaySpeech(snapGreeting);

    // Zero-touch: automatically opens and activates microphone without manual touching!
    setTimeout(() => {
      handleStartListening();
    }, 1200);
  };

  // Trigger Wake-Word 'मायरा' Detected
  const handleHotwordDetected = (remainderCommand?: string) => {
    if (mobileState.isScreenOff) {
      setMobileState((prev) => ({ ...prev, isScreenOff: false }));
    }
    if (remainderCommand && remainderCommand.trim()) {
      setStatusMessage(`✨ मायरा कमांड: ${remainderCommand}`);
      handleSendMessage(remainderCommand.trim(), true);
    } else {
      const hotwordGreeting = 'हाँ जी बॉस! मैं हाज़िर हूँ, बताइए क्या सेवा करूँ?';
      setStatusMessage('✨ मायरा वेक-वर्ड एक्टिव (Wake-Word Triggered)');
      setVoiceResponse(hotwordGreeting);
      setIsVoiceModalOpen(true);
      handlePlaySpeech(hotwordGreeting);
      setTimeout(() => {
        handleStartListening();
      }, 1200);
    }
  };

  // High-Accuracy GPS Refresh
  const handleRefreshGps = async () => {
    setStatusMessage('सटीक GPS से स्थान प्राप्त किया जा रहा है...');
    try {
      const gps = await getHighAccuracyLocation();
      setMobileState((prev) => ({
        ...prev,
        highAccuracyGps: gps,
        locationName: gps.city ? `${gps.city}, ${gps.country}` : gps.address.slice(0, 30),
      }));
      setStatusMessage(`📍 सटीक लोकेशन: ${gps.city || gps.address.slice(0, 25)}`);
      if (settings.spokenResponse) {
        handlePlaySpeech(`हाँ जी बॉस! आपकी ताज़ा सटीक लोकेशन प्राप्त हो गई है। आप ${gps.city || gps.address} के पास हैं।`);
      }
    } catch (err: any) {
      console.warn('GPS location error:', err);
      setStatusMessage('GPS त्रुटि: अनुमति या टाइमआउट।');
    }
  };

  // Proactive Companion Check-In
  const handleTriggerProactive = () => {
    const proactiveTexts = [
      'अरे बॉस! काफी समय से आप व्यस्त हैं, क्या सब ठीक है ना? थोड़ा सा पानी पी लीजिए ना!',
      'हाँ जी बॉस! मैं बस आपका हालचाल जानने आया था। क्या आज के किसी काम में मेरी मदद चाहिए?',
      'बॉस! आँखें थक गई होंगी, दो मिनट के लिए थोड़ा आराम कर लीजिए, सेहत सबसे पहले!',
      'नमस्ते बॉस! आपका यह छोटा साथी मायरा हर पल आपकी सहायता के लिए तैयार बैठा है!',
    ];
    const text = proactiveTexts[Math.floor(Math.random() * proactiveTexts.length)];
    const msg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'myra',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, msg]);
    setStatusMessage(text.slice(0, 50) + '...');
    handlePlaySpeech(text);
  };

  // Initialize SpeechManager
  useEffect(() => {
    speechManagerRef.current = new SpeechManager();
  }, []);

  // Motion Sensor for Intrusion Detection
  useEffect(() => {
    if (!mobileState.isIntrusionArmed) return;

    let lastMotionTime = 0;
    const handleMotion = (event: DeviceMotionEvent) => {
      const acc = event.accelerationIncludingGravity;
      if (!acc) return;
      const mag = Math.sqrt((acc.x || 0) ** 2 + (acc.y || 0) ** 2 + (acc.z || 0) ** 2);
      const now = Date.now();
      if (mag > 22 && now - lastMotionTime > 7000) {
        lastMotionTime = now;
        handleTriggerIntrusion('फ़ोन हिलाया या उठाया गया (Motion Detected)');
      }
    };

    window.addEventListener('devicemotion', handleMotion);
    return () => window.removeEventListener('devicemotion', handleMotion);
  }, [mobileState.isIntrusionArmed, mobileState.intruderAlertName]);

  // High-Frequency Finger Snap Detector Loop (चुटकी डिटेक्टर)
  useEffect(() => {
    if (mobileState.isSnapDetectorActive) {
      snapDetectorRef.current = new FingerSnapDetector();
      snapDetectorRef.current.start(
        mobileState.snapThreshold || 65,
        handleSnapDetected,
        (lvl) => setLiveSoundLevel(lvl)
      );
    } else {
      snapDetectorRef.current?.stop();
    }
    return () => {
      snapDetectorRef.current?.stop();
    };
  }, [mobileState.isSnapDetectorActive, mobileState.snapThreshold]);

  // Continuous Background Hotword 'मायरा' Listener Loop
  useEffect(() => {
    if (mobileState.isHotwordActive) {
      wakeWordDetectorRef.current = new WakeWordDetector();
      wakeWordDetectorRef.current.start(
        handleHotwordDetected,
        (st) => setStatusMessage(`🎙️ ${st}`)
      );
    } else {
      wakeWordDetectorRef.current?.stop();
    }
    return () => {
      wakeWordDetectorRef.current?.stop();
    };
  }, [mobileState.isHotwordActive]);

  // Proactive Companion Interval Loop
  useEffect(() => {
    if (!mobileState.isProactiveAgentActive) return;

    const intervalMs = (mobileState.proactiveCheckIntervalMin || 30) * 60 * 1000;
    const timer = setInterval(() => {
      handleTriggerProactive();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [mobileState.isProactiveAgentActive, mobileState.proactiveCheckIntervalMin]);

  // Initial High-Accuracy GPS on launch
  useEffect(() => {
    getHighAccuracyLocation()
      .then((gps) => {
        setMobileState((prev) => ({
          ...prev,
          highAccuracyGps: gps,
          locationName: gps.city ? `${gps.city}, ${gps.country}` : gps.address.slice(0, 30),
        }));
      })
      .catch(() => {});
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('myra_ai_settings', JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem('myra_ai_mobile_state', JSON.stringify(mobileState));
    } catch {}
  }, [mobileState]);

  useEffect(() => {
    try {
      localStorage.setItem('myra_ai_permissions', JSON.stringify(permissions));
    } catch {}
  }, [permissions]);

  useEffect(() => {
    try {
      localStorage.setItem('myra_ai_files', JSON.stringify(files));
    } catch {}
  }, [files]);

  useEffect(() => {
    try {
      if (currentWebsite) {
        localStorage.setItem('myra_ai_website', JSON.stringify(currentWebsite));
      }
    } catch {}
  }, [currentWebsite]);

  useEffect(() => {
    try {
      localStorage.setItem('myra_ai_messages', JSON.stringify(messages));
    } catch {}
  }, [messages]);

  // Flashlight Hardware synchronization
  const handleToggleFlashlight = async (forcedState?: boolean) => {
    const nextState = forcedState !== undefined ? forcedState : !mobileState.flashlight;
    setMobileState((prev) => ({
      ...prev,
      flashlight: nextState,
      strobeTorch: nextState ? prev.strobeTorch : false,
    }));
    await toggleHardwareTorch(nextState);
    setStatusMessage(
      nextState ? 'टॉर्च चालू कर दी गई है (Flashlight ON)' : 'टॉर्च बंद कर दी गई है (Flashlight OFF)'
    );
  };

  // Strobe effect interval
  useEffect(() => {
    let strobeTimer: any;
    if (mobileState.strobeTorch) {
      let toggle = false;
      strobeTimer = setInterval(() => {
        toggle = !toggle;
        toggleHardwareTorch(toggle).catch(() => {});
      }, 200);
    }
    return () => clearInterval(strobeTimer);
  }, [mobileState.strobeTorch]);

  // File Manager Handlers
  const handleCreateFile = (newFileData: Omit<CreatedFile, 'id' | 'createdAt' | 'updatedAt' | 'size'>) => {
    const fileId = `file-${Date.now()}`;
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newFile: CreatedFile = {
      id: fileId,
      name: newFileData.name,
      extension: newFileData.extension,
      content: newFileData.content,
      size: new Blob([newFileData.content]).size,
      createdAt: timeStr,
      updatedAt: timeStr,
    };

    setFiles((prev) => [newFile, ...prev]);
    setMobileState((prev) => ({
      ...prev,
      storageUsedMB: prev.storageUsedMB + Math.max(1, Math.round(newFile.size / 1024)),
    }));
    setStatusMessage(`फ़ाइल "${newFile.name}" सहेज दी गई है।`);
  };

  const handleDeleteFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setStatusMessage('फ़ाइल हटा दी गई।');
  };

  const handleUpdateFile = (id: string, content: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id
          ? {
              ...f,
              content,
              size: new Blob([content]).size,
              updatedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : f
      )
    );
    setStatusMessage('फ़ाइल अपडेट हो गई।');
  };

  // Website Generator Handler
  const handleGenerateWebsite = (prompt: string, template?: string) => {
    setIsGeneratingWebsite(true);
    setStatusMessage(`वेबसाइट कोड तैयार किया जा रहा है: ${prompt.slice(0, 40)}...`);

    setTimeout(() => {
      let title = 'Modern Web Page';
      let htmlCode = '';

      if (template === 'coffee_shop' || prompt.toLowerCase().includes('coffee') || prompt.toLowerCase().includes('कैफे')) {
        title = 'Artisan Cafe & Roastery';
        htmlCode = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Artisan Coffee</title><style>
          body{margin:0;font-family:system-ui;background:#18181b;color:#f4f4f5;padding:24px;text-align:center}
          .hero{max-width:600px;margin:40px auto;background:#27272a;padding:32px;border-radius:24px;box-shadow:0 10px 30px rgba(0,0,0,0.5)}
          h1{color:#f59e0b;font-size:28px}
          .menu{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:24px 0}
          .item{background:#3f3f46;padding:16px;border-radius:16px;text-align:left}
          .btn{background:#f59e0b;color:#18181b;padding:12px 24px;border:none;border-radius:12px;font-weight:700;cursor:pointer}
        </style></head><body>
          <div class="hero">
            <h1>☕ Artisan Coffee House</h1>
            <p>ताज़ी भुनी हुई अरेबिका कॉफ़ी और स्वादिष्ट बेकरी आइटम्स।</p>
            <div class="menu">
              <div class="item"><h4>Espresso Roast</h4><p>₹180 • Rich Crema</p></div>
              <div class="item"><h4>Hazelnut Latte</h4><p>₹240 • Silky Foam</p></div>
            </div>
            <button class="btn" onclick="alert('आपका टेबल आर्डर दर्ज कर लिया गया है!')">Order Online Now</button>
          </div>
        </body></html>`;
      } else if (template === 'portfolio' || prompt.toLowerCase().includes('portfolio') || prompt.toLowerCase().includes('पोर्टफोलियो')) {
        title = 'Developer Portfolio';
        htmlCode = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Portfolio</title><style>
          body{margin:0;font-family:system-ui;background:#090d16;color:#e2e8f0;padding:24px;display:flex;justify-content:center}
          .wrap{max-width:680px;width:100%}
          .card{background:#111827;border:1px solid #1f2937;padding:24px;border-radius:20px;margin-bottom:16px}
          .pill{display:inline-block;padding:4px 10px;background:#312e81;color:#818cf8;border-radius:9999px;font-size:12px;font-weight:700}
          h1{font-size:26px;margin:12px 0 8px}
          .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
          .btn{background:#6366f1;color:#fff;padding:10px 20px;border-radius:12px;border:none;font-weight:600;cursor:pointer}
        </style></head><body>
          <div class="wrap">
            <div class="card">
              <span class="pill">Full-Stack & Mobile AI Engineer</span>
              <h1>नमस्ते, मैं सॉफ़्टवेयर डेवलपर हूँ</h1>
              <p>सुंदर, आधुनिक और रेस्पॉन्सिव वेब व मोबाइल ऐप्स का निर्माण।</p>
              <button class="btn" onclick="alert('Contact Form opened!')">Get in Touch</button>
            </div>
            <div class="grid">
              <div class="card"><h3>🚀 Myra AI Assistant</h3><p>Kotlin, Jetpack Compose, React, Gemini 3.8</p></div>
              <div class="card"><h3>⚡ Cloud Web Studio</h3><p>Real-time sandbox code generator</p></div>
            </div>
          </div>
        </body></html>`;
      } else {
        title = 'Myra AI Dynamic Website';
        htmlCode = `<!DOCTYPE html><html><head><meta charset="UTF-8"><title>Generated Site</title><style>
          body{margin:0;font-family:system-ui;background:#0f172a;color:#f8fafc;padding:30px;text-align:center}
          .box{max-width:600px;margin:auto;background:#1e293b;padding:30px;border-radius:24px;border:1px solid #334155}
          h1{background:linear-gradient(135deg,#38bdf8,#818cf8);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
          .btn{background:linear-gradient(135deg,#4f46e5,#7c3aed);color:white;padding:12px 24px;border-radius:12px;border:none;font-weight:600;cursor:pointer}
        </style></head><body>
          <div class="box">
            <h1>✨ ${prompt}</h1>
            <p>Myra AI द्वारा सेकंडों में तैयार किया गया रेस्पॉन्सिव कोड।</p>
            <button class="btn" onclick="alert('बटन सफलतापूर्वक कार्य कर रहा है!')">Live Action Test</button>
          </div>
        </body></html>`;
      }

      const newSite: GeneratedWebsite = {
        id: `site-${Date.now()}`,
        title,
        html: htmlCode,
        css: '',
        js: '',
        prompt,
        createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setCurrentWebsite(newSite);
      setIsGeneratingWebsite(false);
      setIsWebStudioOpen(true);
      setStatusMessage(`वेबसाइट "${title}" तैयार है!`);
    }, 600);
  };

  const handleSaveWebsiteToFileManager = (filename: string, content: string) => {
    handleCreateFile({
      name: filename,
      extension: 'html',
      content,
    });
    setStatusMessage(`वेबसाइट फ़ाइल "${filename}" फ़ाइल मैनेजर में सहेज दी गई!`);
  };

  // Execute detected device action from Gemini
  const executeDeviceAction = (action: DeviceAction) => {
    if (!action || !action.type) return;

    switch (action.type) {
      case 'FLASHLIGHT':
        handleToggleFlashlight(action.payload?.state);
        break;
      case 'STROBE_TORCH':
        setMobileState((prev) => ({
          ...prev,
          strobeTorch: !!action.payload?.state,
          flashlight: !!action.payload?.state,
        }));
        setStatusMessage(
          action.payload?.state ? 'SOS Strobe इमरजेंसी लाइट ON' : 'Strobe लाइट OFF'
        );
        break;
      case 'CREATE_FILE':
        if (action.payload?.filename) {
          handleCreateFile({
            name: action.payload.filename,
            extension: action.payload.extension || 'txt',
            content: action.payload.content || '',
          });
          setIsFileManagerOpen(true);
        }
        break;
      case 'GENERATE_WEBSITE':
        handleGenerateWebsite(action.payload?.prompt || action.payload?.title || 'Modern AI Web Page');
        break;
      case 'CAMERA':
        setIsCameraOpen(true);
        setStatusMessage('कैमरा खोला गया (Camera Opened)');
        break;
      case 'DIALER':
      case 'CALL':
        setDialerNumber(action.payload?.number || '');
        setIsDialerOpen(true);
        setStatusMessage('डायलर खोला गया (Dialer Opened)');
        break;
      case 'SMS':
        setSmsRecipient(action.payload?.recipient || '');
        setSmsText(action.payload?.message || '');
        setIsSmsOpen(true);
        setStatusMessage('संदेश ऐप खोला गया (Messages Opened)');
        break;
      case 'VOLUME':
        if (typeof action.payload?.level === 'number') {
          const clamped = Math.max(0, Math.min(100, action.payload.level));
          setMobileState((prev) => ({ ...prev, volume: clamped }));
          setStatusMessage(`वॉल्यूम सेट किया गया: ${clamped}%`);
        }
        break;
      case 'BRIGHTNESS':
        if (typeof action.payload?.level === 'number') {
          const clamped = Math.max(10, Math.min(100, action.payload.level));
          setMobileState((prev) => ({ ...prev, brightness: clamped }));
          setStatusMessage(`स्क्रीन ब्राइटनेस सेट की गई: ${clamped}%`);
        }
        break;
      case 'WIFI':
        setMobileState((prev) => ({ ...prev, wifi: !!action.payload?.state }));
        setStatusMessage(`Wi-Fi: ${action.payload?.state ? 'चालू' : 'बंद'}`);
        break;
      case 'BLUETOOTH':
        setMobileState((prev) => ({ ...prev, bluetooth: !!action.payload?.state }));
        setStatusMessage(`Bluetooth: ${action.payload?.state ? 'चालू' : 'बंद'}`);
        break;
      case 'AIRPLANE_MODE':
        setMobileState((prev) => ({
          ...prev,
          airplaneMode: !!action.payload?.state,
          wifi: action.payload?.state ? false : prev.wifi,
          mobileData: action.payload?.state ? false : prev.mobileData,
        }));
        setStatusMessage(`Airplane Mode: ${action.payload?.state ? 'चालू' : 'बंद'}`);
        break;
      case 'HOTSPOT':
        setMobileState((prev) => ({ ...prev, hotspot: !!action.payload?.state }));
        setStatusMessage(`Hotspot: ${action.payload?.state ? 'चालू' : 'बंद'}`);
        break;
      case 'BATTERY_SAVER':
        setMobileState((prev) => ({ ...prev, batterySaver: !!action.payload?.state }));
        setStatusMessage(`Battery Saver: ${action.payload?.state ? 'चालू' : 'बंद'}`);
        break;
      case 'SOUND_MODE':
        if (action.payload?.mode) {
          setMobileState((prev) => ({ ...prev, soundMode: action.payload.mode }));
          setStatusMessage(`Sound Mode: ${action.payload.mode}`);
        }
        break;
      case 'OPEN_APP':
        handleLaunchApp(action.payload?.appId);
        break;
      case 'OPEN_SETTINGS':
        if (action.payload?.section === 'phone_control') {
          setIsPhoneControlOpen(true);
        } else {
          setIsSettingsOpen(true);
        }
        break;
      case 'TOGGLE_FOREGROUND_SERVICE':
        setMobileState((prev) => ({
          ...prev,
          isForegroundServiceRunning: !prev.isForegroundServiceRunning,
        }));
        setStatusMessage(
          mobileState.isForegroundServiceRunning
            ? 'Foreground Service बंद कर दी गई है'
            : '24/7 Foreground Service सक्रिय है'
        );
        break;
      case 'TOGGLE_SCREEN_OFF':
        setMobileState((prev) => ({ ...prev, isScreenOff: true }));
        break;
      case 'TOGGLE_INTRUSION':
        setMobileState((prev) => ({
          ...prev,
          isIntrusionArmed: !prev.isIntrusionArmed,
        }));
        setStatusMessage(
          mobileState.isIntrusionArmed
            ? 'सुरक्षा गार्ड बंद'
            : 'सुरक्षा गार्ड चालू (Intrusion Guard Armed)'
        );
        break;
      case 'TOGGLE_SNAP_DETECTOR':
      case 'TOGGLE_CLAP_DETECTOR' as any:
        setMobileState((prev) => ({
          ...prev,
          isSnapDetectorActive: !prev.isSnapDetectorActive,
          isClapDetectorActive: !prev.isSnapDetectorActive,
        }));
        setStatusMessage(
          mobileState.isSnapDetectorActive
            ? 'चुटकी डिटेक्टर बंद'
            : 'हाई-फ़्रीक्वेंसी चुटकी डिटेक्टर चालू (Finger Snap Active)'
        );
        break;
      case 'GET_LOCATION':
        handleRefreshGps();
        break;
      case 'TOGGLE_PROACTIVE_AGENT':
        setMobileState((prev) => ({
          ...prev,
          isProactiveAgentActive: !prev.isProactiveAgentActive,
        }));
        setStatusMessage(
          mobileState.isProactiveAgentActive
            ? 'प्रोएक्टिव साथी एजेंट बंद'
            : 'प्रोएक्टिव साथी एजेंट सक्रिय'
        );
        break;
      case 'VIEW_KOTLIN_CODE':
        setIsKotlinModalOpen(true);
        break;
      default:
        break;
    }
  };

  // Launch simulated app by ID
  const handleLaunchApp = (appId: string) => {
    if (!appId) return;
    const lower = appId.toLowerCase();
    if (lower.includes('file') || lower.includes('storage')) {
      setIsFileManagerOpen(true);
    } else if (lower.includes('web') || lower.includes('studio') || lower.includes('site')) {
      setIsWebStudioOpen(true);
    } else if (lower.includes('control')) {
      setIsPhoneControlOpen(true);
    } else if (lower.includes('camera') || lower.includes('photo')) {
      setIsCameraOpen(true);
    } else if (lower.includes('dialer') || lower.includes('phone') || lower.includes('call')) {
      setIsDialerOpen(true);
    } else if (lower.includes('sms') || lower.includes('message')) {
      setIsSmsOpen(true);
    } else if (lower.includes('calc')) {
      setIsCalculatorOpen(true);
    } else if (lower.includes('settings')) {
      setIsSettingsOpen(true);
    } else if (lower.includes('flash') || lower.includes('torch')) {
      handleToggleFlashlight();
    } else if (lower.includes('advanced') || lower.includes('security') || lower.includes('सुरक्षा') || lower.includes('गार्ड') || lower.includes('ताली')) {
      setIsAdvancedModalOpen(true);
    } else if (lower.includes('kotlin') || lower.includes('कोट्लिन')) {
      setIsKotlinModalOpen(true);
    } else {
      setStatusMessage(`ऐप "${appId}" खोला गया।`);
    }
  };

  // Play audio speech for given text
  const handlePlaySpeech = async (text: string) => {
    if (!settings.ttsEnabled) return;
    setIsSpeaking(true);
    try {
      await speakText(text, {
        language: settings.language,
        speed: settings.voiceSpeed,
        volume: settings.voiceVolume,
        voicePersona: settings.voicePersona,
      });
    } catch (err) {
      console.warn('Speech playback failed:', err);
    } finally {
      setIsSpeaking(false);
    }
  };

  // Send message to Gemini Backend API
  const handleSendMessage = async (text: string, isVoice = false) => {
    if (!text.trim() || isThinking) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isVoice,
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);
    setStatusMessage('मायरा उत्तर तैयार कर रही है...');

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: messages.slice(-6),
          language: settings.language,
          searchEnabled: settings.searchEnabled,
          memory: settings.memoryEnabled ? settings.memory : {},
          mobileState,
        }),
      });

      const data = await response.json();
      const replyText = data.reply || 'माफ़ कीजिए, उत्तर प्राप्त नहीं हुआ।';

      const myraMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'myra',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        detectedAction: data.detectedAction,
        citations: data.citations,
      };

      setMessages((prev) => [...prev, myraMsg]);
      setVoiceResponse(replyText);
      setStatusMessage(replyText.slice(0, 70) + (replyText.length > 70 ? '...' : ''));

      // If action detected, execute device action
      if (data.detectedAction) {
        executeDeviceAction(data.detectedAction);
      }

      // If spoken response is active, speak it aloud!
      if (settings.spokenResponse) {
        handlePlaySpeech(replyText);
      }
    } catch (error: any) {
      console.error('Error talking to Myra AI:', error);
      const errMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'myra',
        text: 'माफ़ कीजिए, इंटरनेट या सर्वर से जुड़ने में समस्या हुई। कृपया पुनः प्रयास करें।',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  // Speech Recognition Start/Stop
  const handleStartListening = () => {
    if (!speechManagerRef.current) return;
    setVoiceTranscript('');
    setIsListening(true);
    setStatusMessage('मायरा सुन रही है...');

    speechManagerRef.current.startListening(
      settings.language,
      (transcript, isFinal) => {
        setVoiceTranscript(transcript);
        if (isFinal && transcript.trim()) {
          setIsListening(false);
          handleSendMessage(transcript.trim(), true);
        }
      },
      (error) => {
        console.warn('Speech Recognition error:', error);
        setIsListening(false);
        setStatusMessage('आवाज़ पहचानने में समस्या आई। पुनः प्रयास करें।');
      },
      () => {
        setIsListening(false);
      }
    );
  };

  const handleStopListening = () => {
    if (speechManagerRef.current) {
      speechManagerRef.current.stopListening();
    }
    setIsListening(false);
  };

  const handleToggleVoiceAssistant = () => {
    setIsVoiceModalOpen(true);
    if (!isListening) {
      handleStartListening();
    }
  };

  const handleNewChat = () => {
    setMessages([
      {
        id: Date.now().toString(),
        sender: 'myra',
        text: 'हाँ जी बॉस! बताइए, सब ठीक हो ना आप या आपको क्या मदद चाहिए? आपका मायरा हरदम तैयार है!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setStatusMessage('नई चैट शुरू हुई');
  };

  const handleClearChat = () => {
    if (confirm('क्या आप सचमुच चैट मिटाना चाहते हैं?')) {
      setMessages([]);
      setStatusMessage('चैट साफ़ की गई');
    }
  };

  const handleBackPress = () => {
    if (isVoiceModalOpen) setIsVoiceModalOpen(false);
    else if (isAdvancedModalOpen) setIsAdvancedModalOpen(false);
    else if (isKotlinModalOpen) setIsKotlinModalOpen(false);
    else if (isWebStudioOpen) setIsWebStudioOpen(false);
    else if (isFileManagerOpen) setIsFileManagerOpen(false);
    else if (isPhoneControlOpen) setIsPhoneControlOpen(false);
    else if (isSettingsOpen) setIsSettingsOpen(false);
    else if (isPermissionsOpen) setIsPermissionsOpen(false);
    else if (isDevStatusOpen) setIsDevStatusOpen(false);
    else if (isAppDrawerOpen) setIsAppDrawerOpen(false);
    else if (isCameraOpen) setIsCameraOpen(false);
    else if (isDialerOpen) setIsDialerOpen(false);
    else if (isSmsOpen) setIsSmsOpen(false);
    else if (isCalculatorOpen) setIsCalculatorOpen(false);
    else if (currentScreen === 'chat') setCurrentScreen('home');
  };

  const handleHomePress = () => {
    setIsVoiceModalOpen(false);
    setIsAdvancedModalOpen(false);
    setIsKotlinModalOpen(false);
    setIsWebStudioOpen(false);
    setIsFileManagerOpen(false);
    setIsPhoneControlOpen(false);
    setIsSettingsOpen(false);
    setIsPermissionsOpen(false);
    setIsDevStatusOpen(false);
    setIsAppDrawerOpen(false);
    setIsCameraOpen(false);
    setIsDialerOpen(false);
    setIsSmsOpen(false);
    setIsCalculatorOpen(false);
    setCurrentScreen('home');
  };

  return (
    <AndroidFrame
      mobileState={mobileState}
      isPhoneFrame={settings.phoneFrameMode}
      onToggleFrame={() =>
        setSettings((prev) => ({ ...prev, phoneFrameMode: !prev.phoneFrameMode }))
      }
      onHomePress={handleHomePress}
      onBackPress={handleBackPress}
    >
      {/* Screen Router */}
      {currentScreen === 'home' ? (
        <HomeScreen
          onStartVoice={handleToggleVoiceAssistant}
          onOpenChat={() => setCurrentScreen('chat')}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenAppDrawer={() => setIsAppDrawerOpen(true)}
          onOpenPermissions={() => setIsPermissionsOpen(true)}
          onOpenPhoneControl={() => setIsPhoneControlOpen(true)}
          onOpenWebStudio={() => setIsWebStudioOpen(true)}
          onOpenFileManager={() => setIsFileManagerOpen(true)}
          mobileState={mobileState}
          onToggleFlashlight={() => handleToggleFlashlight()}
          onLaunchApp={handleLaunchApp}
          onOpenAdvancedFeatures={() => setIsAdvancedModalOpen(true)}
          onOpenKotlinStudio={() => setIsKotlinModalOpen(true)}
          settings={settings}
          onQuickPrompt={(p) => handleSendMessage(p, false)}
          isListening={isListening}
          isSpeaking={isSpeaking}
          statusText={statusMessage}
        />
      ) : (
        <ChatScreen
          messages={messages}
          onSendMessage={(t, v) => handleSendMessage(t, v)}
          onNewChat={handleNewChat}
          onClearChat={handleClearChat}
          onPlaySpeech={handlePlaySpeech}
          isListening={isListening}
          onStartListening={handleStartListening}
          onStopListening={handleStopListening}
          isThinking={isThinking}
          language={settings.language}
          searchEnabled={settings.searchEnabled}
        />
      )}

      {/* Voice Assistant Modal */}
      <VoiceAssistantModal
        isOpen={isVoiceModalOpen}
        onClose={() => {
          handleStopListening();
          setIsVoiceModalOpen(false);
        }}
        isListening={isListening}
        isSpeaking={isSpeaking}
        isThinking={isThinking}
        transcript={voiceTranscript}
        response={voiceResponse}
        onToggleListening={isListening ? handleStopListening : handleStartListening}
        language={settings.language}
      />

      {/* Web Studio App (Website Generator & Preview) */}
      <WebStudioApp
        isOpen={isWebStudioOpen}
        onClose={() => setIsWebStudioOpen(false)}
        currentSite={currentWebsite}
        onGenerateSite={handleGenerateWebsite}
        onSaveToFileManager={handleSaveWebsiteToFileManager}
        isGenerating={isGeneratingWebsite}
      />

      {/* File Manager App (Create Files & Storage) */}
      <FileManagerApp
        isOpen={isFileManagerOpen}
        onClose={() => setIsFileManagerOpen(false)}
        files={files}
        onCreateFile={handleCreateFile}
        onDeleteFile={handleDeleteFile}
        onUpdateFile={handleUpdateFile}
        storageUsedMB={mobileState.storageUsedMB}
        storageTotalGB={mobileState.storageTotalGB}
      />

      {/* Full Phone Control Center Modal */}
      <PhoneControlModal
        isOpen={isPhoneControlOpen}
        onClose={() => setIsPhoneControlOpen(false)}
        mobileState={mobileState}
        onUpdateMobileState={setMobileState}
        onOpenPermissions={() => setIsPermissionsOpen(true)}
        onToggleFlashlight={handleToggleFlashlight}
      />

      {/* Complete Settings Screen Form */}
      <SettingsScreen
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        mobileState={mobileState}
        onUpdateMobileState={setMobileState}
        onOpenPermissionManager={() => setIsPermissionsOpen(true)}
        onOpenDevStatus={() => setIsDevStatusOpen(true)}
        onClearChat={handleClearChat}
      />

      {/* Android Permissions Manager */}
      <PermissionManagerModal
        isOpen={isPermissionsOpen}
        onClose={() => setIsPermissionsOpen(false)}
        permissions={permissions}
        onUpdatePermission={(key: keyof PermissionsState, status: PermissionStatus) =>
          setPermissions((prev) => ({ ...prev, [key]: status }))
        }
      />

      {/* 12-Step Development Checklist & APK Info */}
      <DevelopmentStatusModal
        isOpen={isDevStatusOpen}
        onClose={() => setIsDevStatusOpen(false)}
      />

      {/* Apps Drawer */}
      <AppDrawerModal
        isOpen={isAppDrawerOpen}
        onClose={() => setIsAppDrawerOpen(false)}
        onLaunchApp={handleLaunchApp}
      />

      {/* Camera App */}
      <CameraApp isOpen={isCameraOpen} onClose={() => setIsCameraOpen(false)} />

      {/* Phone Dialer App */}
      <DialerApp
        isOpen={isDialerOpen}
        onClose={() => setIsDialerOpen(false)}
        initialNumber={dialerNumber}
        requireConfirmation={settings.requireActionConfirmation}
      />

      {/* Messages / SMS App */}
      <SmsApp
        isOpen={isSmsOpen}
        onClose={() => setIsSmsOpen(false)}
        initialRecipient={smsRecipient}
        initialMessage={smsText}
        requireConfirmation={settings.requireActionConfirmation}
      />

      {/* Calculator App */}
      <CalculatorApp
        isOpen={isCalculatorOpen}
        onClose={() => setIsCalculatorOpen(false)}
      />

      {/* Screen Off AMOLED Overlay with background acoustic & touch detection */}
      <ScreenOffOverlay
        isOpen={mobileState.isScreenOff}
        onWakeUp={() => setMobileState((prev) => ({ ...prev, isScreenOff: false }))}
        onScreenTouch={() => {
          if (mobileState.isIntrusionArmed) {
            handleTriggerIntrusion('स्क्रीन स्पर्श (Touch on Screen while Armed)');
          } else {
            setMobileState((prev) => ({ ...prev, isScreenOff: false }));
          }
        }}
        isSnapActive={mobileState.isSnapDetectorActive}
        isClapActive={mobileState.isSnapDetectorActive}
        isIntrusionArmed={mobileState.isIntrusionArmed}
      />

      {/* Advanced Background & Intelligent Features Modal */}
      <AdvancedFeaturesModal
        isOpen={isAdvancedModalOpen}
        onClose={() => setIsAdvancedModalOpen(false)}
        mobileState={mobileState}
        onUpdateMobileState={setMobileState}
        onTestSnap={handleSnapDetected}
        onTestClap={handleSnapDetected}
        onTestIntrusion={() => handleTriggerIntrusion('परीक्षण घुसपैठ (Test Intrusion Alert)')}
        onTestProactive={handleTriggerProactive}
        onRefreshGps={handleRefreshGps}
        onOpenKotlinStudio={() => {
          setIsAdvancedModalOpen(false);
          setIsKotlinModalOpen(true);
        }}
        soundLevel={liveSoundLevel}
      />

      {/* Kotlin & Jetpack Compose Backend Studio Modal */}
      <KotlinCodeModal
        isOpen={isKotlinModalOpen}
        onClose={() => setIsKotlinModalOpen(false)}
      />
    </AndroidFrame>
  );
}
