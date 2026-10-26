package com.myra.ai.service

import android.content.Context
import android.content.Intent
import android.os.Handler
import android.os.Looper
import android.speech.tts.TextToSpeech
import android.util.Log
import com.myra.ai.MainActivity
import java.util.Calendar
import java.util.Locale

/**
 * ProactiveCompanionAgent
 * Proactive AI Agent that:
 * 1. Checks on the user periodically like a smart, caring anime boy companion.
 * 2. Initiates greeting/conversation automatically upon detecting user presence or unlock.
 * 3. Keeps contextual awareness of the time of day, hydration, work fatigue, and habits.
 */
object ProactiveCompanionAgent {

    private const val TAG = "MyraProactiveAgent"
    private var isRunning = false
    private val handler = Handler(Looper.getMainLooper())
    private var lastProactiveTime = 0L

    private val companionPrompts = listOf(
        "अरे बॉस! काफी समय से आप व्यस्त हैं, क्या सब ठीक है? थोड़ा सा पानी पी लीजिए ना!",
        "हाँ जी बॉस! मैं बस आपका हालचाल जानने आया था। क्या आज के किसी काम में मेरी मदद चाहिए?",
        "बॉस! आँखें थक गई होंगी, दो मिनट के लिए स्क्रीन से दूर देख लीजिए, सेहत सबसे पहले!",
        "नमस्ते बॉस! आपका यह छोटा साथी मायरा हर पल आपकी सहायता के लिए तैयार बैठा है!",
        "बॉस, क्या मुझे आज के आपके रिमाइंडर या मौसम की ताज़ा जानकारी बतानी है?"
    )

    fun scheduleCareCheck(context: Context) {
        if (isRunning) return
        isRunning = true
        Log.d(TAG, "Proactive companion agent care check loop started.")

        // Run routine check every 45-60 minutes or when user becomes active
        val careRunnable = object : Runnable {
            override fun run() {
                val now = System.currentTimeMillis()
                if (now - lastProactiveTime > 30 * 60 * 1000L) {
                    val hour = Calendar.getInstance().get(Calendar.HOUR_OF_DAY)
                    if (hour in 9..22) { // Only during daytime / working hours
                        triggerProactiveGreeting(context)
                    }
                }
                // Schedule next check
                handler.postDelayed(this, 45 * 60 * 1000L)
            }
        }
        handler.postDelayed(careRunnable, 10 * 60 * 1000L) // initial check after 10m
    }

    /**
     * Triggered when camera/face presence or screen unlock detects user is looking at phone
     */
    fun onUserPresenceDetected(context: Context) {
        val now = System.currentTimeMillis()
        if (now - lastProactiveTime < 10 * 60 * 1000L) return // don't overwhelm user
        lastProactiveTime = now

        val cal = Calendar.getInstance()
        val hour = cal.get(Calendar.HOUR_OF_DAY)

        val greeting = when (hour) {
            in 5..11 -> "सुप्रभात बॉस! आज का दिन आपके लिए बहुत शुभ हो! बताइए, आज क्या खास प्लान है?"
            in 12..16 -> "हाँ जी बॉस! दोपहर हो गई है, क्या आपने लंच कर लिया? सब ठीक है ना?"
            in 17..20 -> "शुभ संध्या बॉस! आज का काम कैसा रहा? क्या मैं कोई नया कोड या फ़ाइल तैयार करूँ?"
            else -> "अरे बॉस! इतनी रात हो गई, आप अभी तक जगे हैं? क्या मैं कोई धीमी धुन बजाऊँ या मदद करूँ?"
        }

        launchProactiveDialog(context, greeting)
    }

    private fun triggerProactiveGreeting(context: Context) {
        lastProactiveTime = System.currentTimeMillis()
        val randomPrompt = companionPrompts.random()
        launchProactiveDialog(context, randomPrompt)
    }

    private fun launchProactiveDialog(context: Context, text: String) {
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("EXTRA_PROACTIVE_PROMPT", text)
        }
        context.startActivity(intent)
    }

    fun stop() {
        isRunning = false
        handler.removeCallbacksAndMessages(null)
    }
}
