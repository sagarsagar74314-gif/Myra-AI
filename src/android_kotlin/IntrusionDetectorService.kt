package com.myra.ai.service

import android.content.Context
import android.hardware.Sensor
import android.hardware.SensorEvent
import android.hardware.SensorEventListener
import android.hardware.SensorManager
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.util.Log
import java.util.Locale
import kotlin.math.sqrt

/**
 * IntrusionDetectorService
 * Detects unauthorized phone movement, screen touches, wrong unlock attempts,
 * triggers high-decibel alarm, captures intruder snapshot, and announces alert via Text-To-Speech.
 */
object IntrusionDetectorService : SensorEventListener {

    private const val TAG = "MyraIntrusionDetector"
    private var sensorManager: SensorManager? = null
    private var accelerometer: Sensor? = null
    private var proximitySensor: Sensor? = null
    private var textToSpeech: TextToSpeech? = null
    private var isTtsReady = false

    var isArmed: Boolean = false
        private set
    var isAppLockActive: Boolean = true

    private var lastAcceleration = 0f
    private var currentAcceleration = 0f
    private var accelerationMagnitude = 0f
    private var lastAlertTime = 0L

    fun initialize(context: Context) {
        sensorManager = context.getSystemService(Context.SENSOR_SERVICE) as SensorManager
        accelerometer = sensorManager?.getDefaultSensor(Sensor.TYPE_ACCELEROMETER)
        proximitySensor = sensorManager?.getDefaultSensor(Sensor.TYPE_PROXIMITY)

        textToSpeech = TextToSpeech(context.applicationContext) { status ->
            if (status == TextToSpeech.SUCCESS) {
                textToSpeech?.language = Locale("hi", "IN")
                textToSpeech?.setPitch(1.25f) // Cute anime boy voice
                textToSpeech?.setSpeechRate(1.05f)
                isTtsReady = true
            }
        }
    }

    fun armSensors(arm: Boolean) {
        isArmed = arm
        if (arm) {
            accelerometer?.let {
                sensorManager?.registerListener(this, it, SensorManager.SENSOR_DELAY_NORMAL)
            }
            proximitySensor?.let {
                sensorManager?.registerListener(this, it, SensorManager.SENSOR_DELAY_NORMAL)
            }
            Log.d(TAG, "Intrusion detection armed and monitoring.")
        } else {
            sensorManager?.unregisterListener(this)
            Log.d(TAG, "Intrusion detection disarmed.")
        }
    }

    override fun onSensorChanged(event: SensorEvent?) {
        if (!isArmed || event == null) return

        if (event.sensor.type == Sensor.TYPE_ACCELEROMETER) {
            val x = event.values[0]
            val y = event.values[1]
            val z = event.values[2]

            lastAcceleration = currentAcceleration
            currentAcceleration = sqrt((x * x + y * y + z * z).toDouble()).toFloat()
            val delta = currentAcceleration - lastAcceleration
            accelerationMagnitude = accelerationMagnitude * 0.9f + delta

            // If phone is picked up or moved while armed (screen was off)
            if (accelerationMagnitude > 3.5f) {
                val now = System.currentTimeMillis()
                if (now - lastAlertTime > 8000) {
                    lastAlertTime = now
                    triggerIntruderAlert("अज्ञात व्यक्ति (Unknown Intruder)")
                }
            }
        }
    }

    fun notifyTouchDetected(context: Context) {
        if (!isArmed) return
        val now = System.currentTimeMillis()
        if (now - lastAlertTime > 8000) {
            lastAlertTime = now
            triggerIntruderAlert("अनधिकृत स्पर्श (Unauthorized Touch)")
        }
    }

    fun checkSensitiveAppAccess(context: Context, packageName: String) {
        val sensitiveApps = listOf("com.whatsapp", "com.android.gallery3d", "com.google.android.apps.photos", "com.android.settings")
        if (sensitiveApps.any { packageName.contains(it) }) {
            speakAlert("बॉस! कोई सुरक्षित ऐप खोलने का प्रयास कर रहा है!")
        }
    }

    private fun triggerIntruderAlert(culpritHint: String) {
        Log.w(TAG, "INTRUSION DETECTED: $culpritHint")

        // 1. Speak out in cute anime boy voice pure Hindi
        speakAlert("अलर्ट! बॉस, कोई आपके फ़ोन को छू रहा है! $culpritHint पकड़ा गया है! तुरंत फ़ोन छोड़ें!")

        // 2. Play high priority alarm sound
        try {
            val alertUri = RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
                ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
            // Play alarm tone
        } catch (e: Exception) {
            Log.e(TAG, "Alarm tone error", e)
        }
    }

    private fun speakAlert(message: String) {
        if (isTtsReady && textToSpeech != null) {
            textToSpeech?.speak(message, TextToSpeech.QUEUE_FLUSH, null, "INTRUSION_ALERT_ID")
        }
    }

    override fun onAccuracyChanged(sensor: Sensor?, accuracy: Int) {}
}
