package com.myra.ai.service

import android.content.Context
import android.content.Intent
import android.os.Bundle
import android.os.PowerManager
import android.speech.RecognitionListener
import android.speech.RecognizerIntent
import android.speech.SpeechRecognizer
import android.util.Log
import com.myra.ai.MainActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import java.util.Locale

/**
 * HotwordWakeWordService
 * 24/7 background continuous Hotword / Wake-word listener for 'मायरा' / 'Myra'.
 * Runs seamlessly in the background across all phone screens and apps.
 * Automatically wakes up the assistant, speaks in cute anime Hindi voice,
 * and activates the microphone to listen to commands without opening the app interface!
 */
object HotwordWakeWordService {

    private const val TAG = "MyraHotwordService"
    private val HOTWORDS = listOf("मायरा", "myra", "mayra", "maira", "mira", "मैरा")

    private var speechRecognizer: SpeechRecognizer? = null
    private var isListening = false
    private var serviceJob: Job? = null
    private val scope = CoroutineScope(Dispatchers.Main)
    private var isProcessingCommand = false

    fun startListening(context: Context) {
        if (isListening) return

        scope.launch {
            try {
                if (!SpeechRecognizer.isRecognitionAvailable(context)) {
                    Log.w(TAG, "SpeechRecognizer is not available on this device.")
                    return@launch
                }

                initRecognizer(context)
                isListening = true
                Log.i(TAG, "Hotword listener started in background for 'मायरा'")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to start Hotword listener", e)
            }
        }
    }

    private fun initRecognizer(context: Context) {
        speechRecognizer?.destroy()
        speechRecognizer = SpeechRecognizer.createSpeechRecognizer(context.applicationContext).apply {
            setRecognitionListener(object : RecognitionListener {
                override fun onReadyForSpeech(params: Bundle?) {}
                override fun onBeginningOfSpeech() {}
                override fun onRmsChanged(rmsdB: Float) {}
                override fun onBufferReceived(buffer: ByteArray?) {}
                override fun onEndOfSpeech() {}

                override fun onError(error: Int) {
                    // Auto-restart recognizer on timeout or silence to maintain continuous background listening
                    if (isListening && !isProcessingCommand) {
                        scope.launch {
                            delay(500)
                            restartListening(context)
                        }
                    }
                }

                override fun onResults(results: Bundle?) {
                    val matches = results?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    matches?.let { list ->
                        for (text in list) {
                            val lower = text.lowercase(Locale.getDefault())
                            for (hw in HOTWORDS) {
                                if (lower.contains(hw)) {
                                    val command = lower.substringAfter(hw).trim()
                                    onHotwordDetected(context, command)
                                    return
                                }
                            }
                        }
                    }

                    // Continue listening if hotword not detected
                    if (isListening && !isProcessingCommand) {
                        restartListening(context)
                    }
                }

                override fun onPartialResults(partialResults: Bundle?) {
                    val partialMatches = partialResults?.getStringArrayList(SpeechRecognizer.RESULTS_RECOGNITION)
                    partialMatches?.let { list ->
                        for (text in list) {
                            val lower = text.lowercase(Locale.getDefault())
                            for (hw in HOTWORDS) {
                                if (lower.contains(hw)) {
                                    val command = lower.substringAfter(hw).trim()
                                    onHotwordDetected(context, command)
                                    return
                                }
                            }
                        }
                    }
                }

                override fun onEvent(eventType: Int, params: Bundle?) {}
            })
        }

        startListeningLoop(context)
    }

    private fun startListeningLoop(context: Context) {
        val intent = Intent(RecognizerIntent.ACTION_RECOGNIZE_SPEECH).apply {
            putExtra(RecognizerIntent.EXTRA_LANGUAGE_MODEL, RecognizerIntent.LANGUAGE_MODEL_FREE_FORM)
            putExtra(RecognizerIntent.EXTRA_LANGUAGE, "hi-IN")
            putExtra(RecognizerIntent.EXTRA_CALLING_PACKAGE, context.packageName)
            putExtra(RecognizerIntent.EXTRA_PARTIAL_RESULTS, true)
            putExtra(RecognizerIntent.EXTRA_MAX_RESULTS, 3)
        }

        try {
            speechRecognizer?.startListening(intent)
        } catch (e: Exception) {
            Log.e(TAG, "Error starting speechRecognizer loop", e)
        }
    }

    private fun restartListening(context: Context) {
        if (!isListening || isProcessingCommand) return
        try {
            speechRecognizer?.cancel()
            startListeningLoop(context)
        } catch (e: Exception) {
            // Re-init if recognizer died
            initRecognizer(context)
        }
    }

    /**
     * Triggered immediately when 'मायरा' is spoken anywhere on phone.
     * Wakes up phone and listens to command without forcing user to open or touch app UI.
     */
    private fun onHotwordDetected(context: Context, trailingCommand: String) {
        Log.i(TAG, "HOTWORD DETECTED: 'मायरा'! Trailing command: $trailingCommand")
        isProcessingCommand = true

        // 1. Wake up screen if locked/off
        val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        val wakeLock = powerManager.newWakeLock(
            PowerManager.FULL_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP or PowerManager.ON_AFTER_RELEASE,
            "MyraAI::HotwordWakeUp"
        )
        wakeLock.acquire(4000)

        // 2. Launch background command processing or overlay voice assistant
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            putExtra("EXTRA_HOTWORD_TRIGGERED", true)
            putExtra("EXTRA_SPEAK_TEXT", "हाँ जी बॉस! मैं हाज़िर हूँ, बताइए क्या सेवा करूँ?")
            putExtra("EXTRA_AUTO_START_MIC", true)
            if (trailingCommand.isNotEmpty()) {
                putExtra("EXTRA_DIRECT_COMMAND", trailingCommand)
            }
        }
        context.startActivity(intent)

        // Reset processing state after window
        scope.launch {
            delay(5000)
            isProcessingCommand = false
            if (isListening) {
                restartListening(context)
            }
        }
    }

    fun stopListening() {
        isListening = false
        isProcessingCommand = false
        serviceJob?.cancel()
        try {
            speechRecognizer?.stopListening()
            speechRecognizer?.destroy()
        } catch (e: Exception) {
            // ignore
        }
        speechRecognizer = null
        Log.i(TAG, "Hotword listener stopped")
    }

    fun isListening(): Boolean = isListening
}
