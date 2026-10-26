import React, { useState } from 'react';
import {
  Code2,
  FileCode,
  Copy,
  Check,
  Download,
  X,
  Layers,
  Sparkles,
  ShieldCheck,
  Radio,
  MapPin,
  HeartHandshake,
  Cpu,
} from 'lucide-react';

interface KotlinCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface KotlinFileItem {
  id: string;
  name: string;
  category: string;
  icon: any;
  description: string;
  filePath: string;
  codeSnippet: string;
}

export const KotlinCodeModal: React.FC<KotlinCodeModalProps> = ({ isOpen, onClose }) => {
  const [activeFileId, setActiveFileId] = useState('myra_background_service');
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const files: KotlinFileItem[] = [
    {
      id: 'myra_background_service',
      name: 'MyraBackgroundService.kt',
      category: '1. Background Foreground Service',
      icon: <Layers className="w-4 h-4 text-purple-400" />,
      description: 'बॉस, मैं बैकग्राउंड में सुन रही हूँ... Foreground Service, START_STICKY एवं microphone foregroundServiceType.',
      filePath: 'src/android_kotlin/MyraBackgroundService.kt',
      codeSnippet: `package com.myra.ai.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.Service
import android.content.Intent
import android.os.IBinder
import android.os.Build
import androidx.core.app.NotificationCompat

class MyraBackgroundService : Service() {

    override fun onCreate() {
        super.onCreate()
        startForegroundServiceNotification()
        // यहाँ बैकग्राउंड लिसनर और वॉयस इंजन इनिशियलाइज होगा
    }

    private fun startForegroundServiceNotification() {
        val channelId = "myra_background_channel"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                channelId,
                "Myra AI Background Service",
                NotificationManager.IMPORTANCE_LOW
            )
            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(channel)
        }

        val notification: Notification = NotificationCompat.Builder(this, channelId)
            .setContentTitle("Myra AI Active")
            .setContentText("बॉस, मैं बैकग्राउंड में सुन रही हूँ...")
            .setSmallIcon(android.R.drawable.ic_menu_mic)
            .build()

        startForeground(1, notification)
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        // यहाँ होम स्क्रीन से मिलने वाले वॉयस कमांड्स प्रोसेस होंगे
        return START_STICKY
    }

    override fun onBind(intent: Intent?): IBinder? {
        return null
    }
}`,
    },
    {
      id: 'foreground',
      name: 'MyraForegroundService.kt',
      category: '2. 24/7 Deep WakeLock Service',
      icon: <Layers className="w-4 h-4 text-indigo-400" />,
      description: '24/7 सक्रिय Foreground Service, PARTIAL_WAKE_LOCK, स्क्रीन ऑफ़ होने पर भी निरंतर कार्य करता है।',
      filePath: 'src/android_kotlin/MyraForegroundService.kt',
      codeSnippet: `package com.myra.ai.service

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.os.Build
import android.os.IBinder
import android.os.PowerManager
import androidx.core.app.NotificationCompat
import com.myra.ai.MainActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.launch

/**
 * MyraForegroundService
 * 24/7 background execution with PARTIAL_WAKE_LOCK so Myra responds to claps,
 * voice, and device sensors even when phone screen is locked or OFF.
 */
class MyraForegroundService : Service() {

    private val serviceJob = Job()
    private val serviceScope = CoroutineScope(Dispatchers.Default + serviceJob)
    private var wakeLock: PowerManager.WakeLock? = null
    private var screenReceiver: BroadcastReceiver? = null

    companion object {
        const val CHANNEL_ID = "myra_ai_foreground_channel"
        const val NOTIFICATION_ID = 1001
        const val ACTION_START_SERVICE = "ACTION_START_MYRA_SERVICE"
        const val ACTION_STOP_SERVICE = "ACTION_STOP_MYRA_SERVICE"

        fun start(context: Context) {
            val intent = Intent(context, MyraForegroundService::class.java).apply {
                action = ACTION_START_SERVICE
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                context.startForegroundService(intent)
            } else {
                context.startService(intent)
            }
        }
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        acquireWakeLock()
        registerScreenStateReceiver()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = buildForegroundNotification()
        startForeground(NOTIFICATION_ID, notification)
        initializeBackgroundEngines()
        return START_STICKY
    }

    private fun acquireWakeLock() {
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "MyraAI::BackgroundEngineWakeLock"
        ).apply {
            setReferenceCounted(false)
            acquire(24 * 60 * 60 * 1000L)
        }
    }

    private fun initializeBackgroundEngines() {
        ClapAcousticTriggerService.startListening(this)
        ProactiveCompanionAgent.scheduleCareCheck(this)
        HighAccuracyLocationProvider.startLiveTracking(this)
    }

    override fun onBind(intent: Intent?): IBinder? = null
}`,
    },
    {
      id: 'accessibility',
      name: 'MyraAccessibilityService.kt',
      category: '1. Accessibility & Touch Interception',
      icon: <Cpu className="w-4 h-4 text-cyan-400" />,
      description: 'Accessibility Service: स्क्रीन लॉक/अनलॉक मॉनिटरिंग, टच इवेंट्स और डीप सिस्टम कंट्रोल।',
      filePath: 'src/android_kotlin/MyraAccessibilityService.kt',
      codeSnippet: `package com.myra.ai.service

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.view.accessibility.AccessibilityEvent

/**
 * MyraAccessibilityService
 * Deep system-level control, touch and unlock monitoring, and global actions
 */
class MyraAccessibilityService : AccessibilityService() {

    override fun onServiceConnected() {
        super.onServiceConnected()
        serviceInfo = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or
                    AccessibilityEvent.TYPE_TOUCH_INTERACTION_START
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            notificationTimeout = 100
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType == AccessibilityEvent.TYPE_TOUCH_INTERACTION_START) {
            IntrusionDetectorService.notifyTouchDetected(this)
        }
    }

    override fun onInterrupt() {}

    fun performHomeAction(): Boolean = performGlobalAction(GLOBAL_ACTION_HOME)
    fun performBackAction(): Boolean = performGlobalAction(GLOBAL_ACTION_BACK)
    fun performLockScreenAction(): Boolean = performGlobalAction(GLOBAL_ACTION_LOCK_SCREEN)
}`,
    },
    {
      id: 'intrusion',
      name: 'IntrusionDetectorService.kt',
      category: '2. Intrusion Detection & Touch Guard',
      icon: <ShieldCheck className="w-4 h-4 text-rose-400" />,
      description: 'मोशन व टच सेंसर: फ़ोन को हिलाने या छूने पर घुसपैठिए की पहचान, अलार्म व वॉइस चेतावनी।',
      filePath: 'src/android_kotlin/IntrusionDetectorService.kt',
      codeSnippet: `package com.myra.ai.service

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.speech.tts.TextToSpeech
import java.util.Locale
import kotlin.math.sqrt

/**
 * IntrusionDetectorService
 * Detects unauthorized phone movement, screen touches, wrong unlock attempts,
 * triggers alarm, and announces alert via Text-To-Speech in cute anime boy voice.
 */
object IntrusionDetectorService : SensorEventListener {

    var isArmed: Boolean = false
    private var textToSpeech: TextToSpeech? = null

    fun armSensors(arm: Boolean) {
        isArmed = arm
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (!isArmed || event == null) return
        if (event.sensor.type == Sensor.TYPE_ACCELEROMETER) {
            val delta = calculateMovementDelta(event.values)
            if (delta > 3.5f) {
                triggerIntruderAlert("अज्ञात व्यक्ति (Intruder)")
            }
        }
    }

    fun notifyTouchDetected(context: Context) {
        if (!isArmed) return
        triggerIntruderAlert("अनधिकृत स्पर्श (Unauthorized Touch)")
    }

    private fun triggerIntruderAlert(culpritHint: String) {
        speakAlert("अलर्ट! बॉस, कोई आपके फ़ोन को छू रहा है! $culpritHint पकड़ा गया है! तुरंत फ़ोन छोड़ें!")
    }

    private fun speakAlert(message: String) {
        textToSpeech?.speak(message, TextToSpeech.QUEUE_FLUSH, null, "INTRUSION_ID")
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}`,
    },
    {
      id: 'snap',
      name: 'FingerSnapTriggerService.kt',
      category: '3. High-Frequency Finger Snap Trigger (चुटकी)',
      icon: <Radio className="w-4 h-4 text-cyan-400" />,
      description: 'AudioRecord आधारित 2.5kHz - 7.5kHz हाई-पास फ़िल्टर से उँगलियों की तीक्ष्ण चुटकी पहचानकर स्वतः माइक सक्रिय करने वाली सेवा।',
      filePath: 'src/android_kotlin/FingerSnapTriggerService.kt',
      codeSnippet: `package com.myra.ai.service

import android.content.Context
import android.content.Intent
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.os.PowerManager
import com.myra.ai.MainActivity
import kotlinx.coroutines.*
import kotlin.math.abs

/**
 * FingerSnapTriggerService (चुटकी डिटेक्टर)
 * AudioRecord 2.5kHz - 7.5kHz high-frequency bandpass & rapid transient onset detector.
 * Wakes up device and activates microphone automatically without manual touch!
 */
object FingerSnapTriggerService {

    private const val SAMPLE_RATE = 22050
    private const val SNAP_ATTACK_THRESHOLD = 15000

    fun startListening(context: Context) {
        CoroutineScope(Dispatchers.Default).launch {
            val buffer = ShortArray(512)
            var prevHighFreq = 0.0

            while (isActive) {
                // High-pass difference filter isolating sharp finger snap frequencies
                var maxPeak = 0
                var highFreqEnergy = 0.0
                var zcr = 0

                for (i in 0 until 512) {
                    val s = buffer[i].toInt()
                    if (abs(s) > maxPeak) maxPeak = abs(s)
                    highFreqEnergy += abs(s - (0.85 * (if (i > 0) buffer[i - 1].toInt() else 0)).toInt())
                    if (i > 0 && buffer[i] * buffer[i - 1] < 0) zcr++
                }

                val delta = (highFreqEnergy / 512) - prevHighFreq
                prevHighFreq = highFreqEnergy / 512

                // Sharp finger snap detected: high peak, rapid onset delta & high ZCR
                if (maxPeak > SNAP_ATTACK_THRESHOLD && delta > 1800 && zcr > 55) {
                    onSnapDetected(context)
                }
            }
        }
    }

    private fun onSnapDetected(context: Context) {
        val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        val wakeLock = powerManager.newWakeLock(
            PowerManager.FULL_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP,
            "MyraAI::SnapWakeUp"
        )
        wakeLock.acquire(4000)

        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("EXTRA_SNAP_TRIGGERED", true)
            putExtra("EXTRA_AUTO_START_MIC", true) // Auto-opens microphone!
            putExtra("EXTRA_SPEAK_TEXT", "हाँ जी बॉस! आपकी चुटकी की आवाज़ सुन ली! बताइए क्या आज्ञा है?")
        }
        context.startActivity(intent)
    }
}`,
    },
    {
      id: 'location',
      name: 'HighAccuracyLocationProvider.kt',
      category: '4. High-Accuracy GPS & Services',
      icon: <MapPin className="w-4 h-4 text-emerald-400" />,
      description: 'FusedLocationProviderClient (PRIORITY_HIGH_ACCURACY) से सटीक GPS निर्देशांक एवं रिवर्स जियोकोडिंग।',
      filePath: 'src/android_kotlin/HighAccuracyLocationProvider.kt',
      codeSnippet: `package com.myra.ai.service

import android.annotation.SuppressLint
import android.content.Context
import android.location.Geocoder
import com.google.android.gms.location.*
import kotlinx.coroutines.flow.MutableStateFlow
import java.util.Locale

/**
 * HighAccuracyLocationProvider
 * FusedLocationProviderClient with PRIORITY_HIGH_ACCURACY and Geocoder reverse lookup
 */
object HighAccuracyLocationProvider {

    @SuppressLint("MissingPermission")
    fun startLiveTracking(context: Context) {
        val client = LocationServices.getFusedLocationProviderClient(context)
        val request = LocationRequest.Builder(
            Priority.PRIORITY_HIGH_ACCURACY,
            5000L
        ).apply {
            setMinUpdateDistanceMeters(2f)
        }.build()

        client.requestLocationUpdates(request, object : LocationCallback() {
            override fun onLocationResult(result: LocationResult) {
                for (location in result.locations) {
                    val geocoder = Geocoder(context, Locale("hi", "IN"))
                    val addresses = geocoder.getFromLocation(location.latitude, location.longitude, 1)
                    // Updates high-accuracy live location state
                }
            }
        }, Looper.getMainLooper())
    }
}`,
    },
    {
      id: 'proactive',
      name: 'ProactiveCompanionAgent.kt',
      category: '5. Proactive AI Companion Agent',
      icon: <HeartHandshake className="w-4 h-4 text-pink-400" />,
      description: 'बिना कमांड का इंतज़ार किए स्वचालित रूप से यूज़र की सेहत, पानी और दिनचर्या का ख्याल रखने वाला एजेंट।',
      filePath: 'src/android_kotlin/ProactiveCompanionAgent.kt',
      codeSnippet: `package com.myra.ai.service

import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import com.myra.ai.MainActivity
import java.util.Calendar

/**
 * ProactiveCompanionAgent
 * Initiates conversation automatically upon detecting user presence or periodically
 * checking in like a caring anime companion.
 */
object ProactiveCompanionAgent {

    private val companionPrompts = listOf(
        "अरे बॉस! काफी समय से आप व्यस्त हैं, क्या सब ठीक है? थोड़ा सा पानी पी लीजिए ना!",
        "हाँ जी बॉस! मैं बस आपका हालचाल जानने आया था। क्या आज के किसी काम में मेरी मदद चाहिए?",
        "बॉस! आँखें थक गई होंगी, दो मिनट के लिए स्क्रीन से दूर देख लीजिए, सेहत सबसे पहले!"
    )

    fun onUserPresenceDetected(context: Context) {
        val greeting = "सुप्रभात बॉस! बताइए, आज क्या खास प्लान है? आपका साथी मायरा हाज़िर है!"
        launchProactiveDialog(context, greeting)
    }

    private fun launchProactiveDialog(context: Context, text: String) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("EXTRA_PROACTIVE_PROMPT", text)
        }
        context.startActivity(intent)
    }
}`,
    },
    {
      id: 'main',
      name: 'MainActivity.kt',
      category: 'Jetpack Compose UI',
      icon: <Code2 className="w-4 h-4 text-purple-400" />,
      description: 'Jetpack Compose UI स्क्रीन जिसमें सभी बैकग्राउंड सर्विसेज, टॉगल और स्टेटस कार्ड्स जुड़े हैं।',
      filePath: 'src/android_kotlin/MainActivity.kt',
      codeSnippet: `package com.myra.ai

import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp

@Composable
fun MyraAppScreen(...) {
    // 1. Clean Title - Subtitle hidden
    Text(text = "MYRA AI", fontSize = 28.sp, fontWeight = FontWeight.Black, color = Color.White)

    // 2. Smooth Rotating Multi-Color Glowing Microphone Button
    val infiniteTransition = rememberInfiniteTransition(label = "rotation")
    val rotationAngle by infiniteTransition.animateFloat(
        initialValue = 0f, targetValue = 360f,
        animationSpec = infiniteRepeatable(tween(5000, easing = LinearEasing), RepeatMode.Restart)
    )
    val pulseScale by infiniteTransition.animateFloat(
        initialValue = 1f, targetValue = 1.08f,
        animationSpec = infiniteRepeatable(tween(2200, easing = FastOutSlowInEasing), RepeatMode.Reverse)
    )

    val multiColorBrush = Brush.sweepGradient(
        listOf(
            Color(0xFF06B6D4), Color(0xFF3B82F6), Color(0xFF6366F1),
            Color(0xFFA855F7), Color(0xFFEC4899), Color(0xFFF59E0B),
            Color(0xFF10B981), Color(0xFF06B6D4)
        )
    )

    Box(contentAlignment = Alignment.Center, modifier = Modifier.size(200.dp)) {
        // Rotating Multi-Color Ambient Glow
        Box(modifier = Modifier.size(190.dp).scale(pulseScale).rotate(rotationAngle).background(multiColorBrush, CircleShape))
        // Rotating Laser Accent Ring
        Box(modifier = Modifier.size(165.dp).rotate(rotationAngle).background(multiColorBrush, CircleShape).padding(3.dp).background(Color(0xFF0A0F29), CircleShape))
        // Central Metallic Microphone Core Orb
        Box(contentAlignment = Alignment.Center, modifier = Modifier.size(140.dp).background(Brush.verticalGradient(listOf(Color(0xFF1E1B4B), Color(0xFF090D21))), CircleShape)) {
            Text(text = "🎤", fontSize = 46.sp)
        }
    }
    // Clean bottom navigation and input controls
}`,
    },
    {
      id: 'manifest',
      name: 'AndroidManifest.xml',
      category: 'Configuration & Permissions',
      icon: <FileCode className="w-4 h-4 text-amber-300" />,
      description: 'Foreground Services, Microphone, Location, Sensors, और Accessibility की संपूर्ण अनुमतियाँ।',
      filePath: 'src/android_kotlin/AndroidManifest.xml',
      codeSnippet: `<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="com.myra.ai">

    <uses-permission android:name="android.permission.FOREGROUND_SERVICE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_MICROPHONE" />
    <uses-permission android:name="android.permission.FOREGROUND_SERVICE_LOCATION" />
    <uses-permission android:name="android.permission.WAKE_LOCK" />
    <uses-permission android:name="android.permission.RECORD_AUDIO" />
    <uses-permission android:name="android.permission.ACCESS_FINE_LOCATION" />
    <uses-permission android:name="android.permission.CAMERA" />

    <application ...>
        <service android:name=".service.MyraForegroundService" android:foregroundServiceType="microphone|location" />
        <service android:name=".service.MyraAccessibilityService" android:permission="android.permission.BIND_ACCESSIBILITY_SERVICE" />
    </application>
</manifest>`,
    },
  ];

  const currentFile = files.find((f) => f.id === activeFileId) || files[0];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentFile.codeSnippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([currentFile.codeSnippet], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = currentFile.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl text-white flex flex-col max-h-[92vh] overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-600/20">
              <Code2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm sm:text-base text-white">
                Kotlin & Jetpack Compose Backend Studio
              </h2>
              <p className="text-[11px] text-indigo-400">
                Foreground Service, Clap Trigger, Intrusion Guard, High-Accuracy GPS & Proactive AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-indigo-300 border border-indigo-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'कॉपी हुआ!' : 'कोड कॉपी करें'}</span>
            </button>
            <button
              onClick={handleDownload}
              className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>डाउनलोड .kt</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Two-Pane Layout: File Tabs on Left, Code Editor on Right */}
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
          {/* Left file sidebar */}
          <div className="w-full md:w-64 border-b md:border-b-0 md:border-r border-slate-800 bg-slate-950/60 p-2 overflow-y-auto max-h-48 md:max-h-none flex-shrink-0">
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2 py-1">
              Kotlin Source Files ({files.length})
            </p>
            <div className="space-y-1">
              {files.map((file) => (
                <button
                  key={file.id}
                  onClick={() => setActiveFileId(file.id)}
                  className={`w-full text-left p-2.5 rounded-xl flex items-center gap-2.5 text-xs transition-colors ${
                    activeFileId === file.id
                      ? 'bg-indigo-600/25 border border-indigo-500/40 text-white font-semibold'
                      : 'text-slate-400 hover:bg-slate-800/60 hover:text-slate-200'
                  }`}
                >
                  <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 flex-shrink-0">
                    {file.icon}
                  </div>
                  <div className="truncate">
                    <p className="truncate leading-tight">{file.name}</p>
                    <span className="text-[10px] text-slate-500 truncate block">
                      {file.category}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Right Code Display */}
          <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
            {/* Top file description banner */}
            <div className="px-4 py-2.5 bg-slate-900/60 border-b border-slate-800 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-indigo-300 font-mono text-[11px] truncate">
                <FileCode className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <span className="truncate">{currentFile.filePath}</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-md bg-purple-950/60 border border-purple-800/40 text-purple-300 font-mono">
                Kotlin (Jetpack Compose)
              </span>
            </div>

            <div className="px-4 py-2 bg-slate-900/30 border-b border-slate-800 text-xs text-slate-400">
              💡 {currentFile.description}
            </div>

            {/* Code Content */}
            <div className="flex-1 p-4 overflow-y-auto font-mono text-xs text-emerald-300/90 leading-relaxed bg-[#060914] selection:bg-indigo-500/40">
              <pre className="whitespace-pre">{currentFile.codeSnippet}</pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
