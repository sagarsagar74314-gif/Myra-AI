package com.myra.ai.service

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
import com.myra.ai.R
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

/**
 * MyraForegroundService
 * Keeps Myra AI active 24/7 in the background with a persistent Foreground Service
 * and PARTIAL_WAKE_LOCK so it can respond to claps, voice, and device sensors
 * even when the phone screen is locked or turned off.
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
        const val ACTION_TRIGGER_VOICE = "ACTION_TRIGGER_VOICE"

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

        fun stop(context: Context) {
            val intent = Intent(context, MyraForegroundService::class.java).apply {
                action = ACTION_STOP_SERVICE
            }
            context.startService(intent)
        }
    }

    override fun onCreate() {
        super.onCreate()
        createNotificationChannel()
        acquireWakeLock()
        registerScreenStateReceiver()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_STOP_SERVICE -> {
                stopForeground(STOP_FOREGROUND_REMOVE)
                stopSelf()
                return START_NOT_STICKY
            }
            ACTION_TRIGGER_VOICE -> {
                // Wake up screen and open voice UI
                wakeUpScreenAndLaunchAssistant()
            }
            else -> {
                val notification = buildForegroundNotification()
                startForeground(NOTIFICATION_ID, notification)
                initializeBackgroundEngines()
            }
        }
        // START_STICKY ensures Android automatically restarts the service if killed by OS memory pressure
        return START_STICKY
    }

    private fun buildForegroundNotification(): Notification {
        val launchIntent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
        }
        val pendingIntent = PendingIntent.getActivity(
            this, 0, launchIntent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Myra AI एक्टिव है (24/7 सक्रिय)")
            .setContentText("बॉस, मैं बैकग्राउंड में आपके हुक्म और सुरक्षा के लिए तैनात हूँ!")
            .setSmallIcon(android.R.drawable.ic_btn_speak_now)
            .setOngoing(true)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setCategory(NotificationCompat.CATEGORY_SERVICE)
            .setContentIntent(pendingIntent)
            .addAction(
                android.R.drawable.ic_btn_speak_now,
                "आवाज़ से बोलें",
                pendingIntent
            )
            .build()
    }

    private fun createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channel = NotificationChannel(
                CHANNEL_ID,
                "Myra AI Background Service",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Keeps Myra AI awake to respond to claps, commands, and security alerts"
                setShowBadge(false)
            }
            val manager = getSystemService(NotificationManager::class.java)
            manager.createNotificationChannel(channel)
        }
    }

    private fun acquireWakeLock() {
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = powerManager.newWakeLock(
            PowerManager.PARTIAL_WAKE_LOCK,
            "MyraAI::BackgroundEngineWakeLock"
        ).apply {
            setReferenceCounted(false)
            acquire(24 * 60 * 60 * 1000L) // Keep active up to 24h
        }
    }

    private fun registerScreenStateReceiver() {
        screenReceiver = object : BroadcastReceiver() {
            override fun onReceive(context: Context?, intent: Intent?) {
                when (intent?.action) {
                    Intent.ACTION_SCREEN_OFF -> {
                        // Phone screen locked or turned off. Maintain high sensitivity for finger snaps and intrusion
                        serviceScope.launch {
                            FingerSnapTriggerService.setScreenOffMode(true)
                            IntrusionDetectorService.armSensors(true)
                        }
                    }
                    Intent.ACTION_SCREEN_ON -> {
                        serviceScope.launch {
                            FingerSnapTriggerService.setScreenOffMode(false)
                        }
                    }
                }
            }
        }
        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_SCREEN_OFF)
            addAction(Intent.ACTION_SCREEN_ON)
            addAction(Intent.ACTION_USER_PRESENT)
        }
        registerReceiver(screenReceiver, filter)
    }

    private fun initializeBackgroundEngines() {
        // 1. AudioRecord-based High-Frequency Finger Snap Trigger (wakes up & auto-activates mic)
        FingerSnapTriggerService.startListening(this)
        // 2. 24/7 Hotword / Wake-word Listener for 'मायरा'
        HotwordWakeWordService.startListening(this)
        // 3. Proactive AI Companion Check Worker
        ProactiveCompanionAgent.scheduleCareCheck(this)
        // 4. High-Accuracy Fused Location updates
        HighAccuracyLocationProvider.startLiveTracking(this)
    }

    private fun wakeUpScreenAndLaunchAssistant() {
        val powerManager = getSystemService(Context.POWER_SERVICE) as PowerManager
        val screenWakeLock = powerManager.newWakeLock(
            PowerManager.SCREEN_BRIGHT_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP,
            "MyraAI::ScreenWakeUp"
        )
        screenWakeLock.acquire(3000)

        val intent = Intent(this, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("EXTRA_AUTO_START_VOICE", true)
            putExtra("EXTRA_AUTO_START_MIC", true)
        }
        startActivity(intent)
    }

    override fun onDestroy() {
        super.onDestroy()
        serviceScope.cancel()
        FingerSnapTriggerService.stopListening()
        HotwordWakeWordService.stopListening()
        screenReceiver?.let { unregisterReceiver(it) }
        wakeLock?.let {
            if (it.isHeld) it.release()
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null
}
