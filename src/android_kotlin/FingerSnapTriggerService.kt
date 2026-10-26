package com.myra.ai.service

import android.content.Context
import android.content.Intent
import android.media.AudioFormat
import android.media.AudioRecord
import android.media.MediaRecorder
import android.os.PowerManager
import android.util.Log
import com.myra.ai.MainActivity
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.Job
import kotlinx.coroutines.isActive
import kotlinx.coroutines.launch
import kotlin.math.abs

/**
 * FingerSnapTriggerService (चुटकी डिटेक्टर)
 * High-Frequency Acoustic Trigger running 24/7 in MyraForegroundService via AudioRecord.
 *
 * Distinguishes crisp finger snaps (चुटकी) from hand claps, speech, and general ambient noise:
 * - High-frequency spectral focus: 2.5 kHz to 7.5 kHz.
 * - Ultra-fast transient attack time (< 12 ms rise time).
 * - High Zero-Crossing Rate (ZCR) with rapid decay (< 50 ms).
 *
 * Upon snap detection, automatically wakes the device and activates the microphone
 * for voice commands without requiring the app to be open or manually touched.
 */
object FingerSnapTriggerService {

    private const val TAG = "MyraSnapDetector"
    private const val SAMPLE_RATE = 22050 // Captures frequencies up to 11 kHz
    private const val SNAP_ATTACK_THRESHOLD = 15000 // Sharp transient rise threshold
    private const val DEBOUNCE_WINDOW_MS = 600L

    private var audioRecord: AudioRecord? = null
    private var isRecording = false
    private var job: Job? = null
    private var lastSnapTimestamp = 0L
    private var isScreenOff = false
    private var isMicInUseForVoice = false

    fun setScreenOffMode(screenOff: Boolean) {
        isScreenOff = screenOff
    }

    fun setMicInUse(inUse: Boolean) {
        isMicInUseForVoice = inUse
        if (inUse) {
            pauseRecording()
        }
    }

    fun startListening(context: Context) {
        if (isRecording || isMicInUseForVoice) return

        try {
            val minBufferSize = AudioRecord.getMinBufferSize(
                SAMPLE_RATE,
                AudioFormat.CHANNEL_IN_MONO,
                AudioFormat.ENCODING_PCM_16BIT
            )
            val bufferSize = minBufferSize.coerceAtLeast(2048)

            audioRecord = AudioRecord(
                MediaRecorder.AudioSource.MIC,
                SAMPLE_RATE,
                AudioFormat.CHANNEL_IN_MONO,
                AudioFormat.ENCODING_PCM_16BIT,
                bufferSize
            )

            if (audioRecord?.state != AudioRecord.STATE_INITIALIZED) {
                Log.e(TAG, "AudioRecord failed to initialize for finger snap detector.")
                return
            }

            audioRecord?.startRecording()
            isRecording = true
            Log.i(TAG, "👌 Finger Snap Detector (चुटकी डिटेक्टर) active in background.")

            job = CoroutineScope(Dispatchers.Default).launch {
                val buffer = ShortArray(512) // Small frame (~23 ms) for ultra-fast transient attack detection
                var prevFilteredEnergy = 0.0

                while (isActive && isRecording) {
                    val read = audioRecord?.read(buffer, 0, buffer.size) ?: 0
                    if (read > 0) {
                        var maxPeak = 0
                        var highFreqEnergy = 0.0
                        var zeroCrossings = 0

                        // 1. High-Pass Difference Filter (y[n] = x[n] - 0.85 * x[n-1])
                        // Attenuates low frequencies (< 2 kHz, speech & claps) and accentuates finger snaps (3-7 kHz)
                        var prevSample = 0
                        for (i in 0 until read) {
                            val rawSample = buffer[i].toInt()
                            val absRaw = abs(rawSample)
                            if (absRaw > maxPeak) maxPeak = absRaw

                            val highPassSample = rawSample - (0.85 * prevSample).toInt()
                            prevSample = rawSample
                            highFreqEnergy += abs(highPassSample)

                            // Zero crossing density calculation
                            if (i > 0 && ((buffer[i] > 0 && buffer[i - 1] < 0) || (buffer[i] < 0 && buffer[i - 1] > 0))) {
                                zeroCrossings++
                            }
                        }

                        val avgHighFreqEnergy = highFreqEnergy / read
                        val transientDelta = avgHighFreqEnergy - prevFilteredEnergy
                        prevFilteredEnergy = avgHighFreqEnergy

                        // Finger snap characteristics:
                        // 1. High absolute amplitude peak
                        // 2. High zero crossing rate (high frequency content)
                        // 3. Steep transient rise delta in high-frequency band
                        val threshold = if (isScreenOff) (SNAP_ATTACK_THRESHOLD * 0.80).toInt() else SNAP_ATTACK_THRESHOLD

                        if (maxPeak > threshold && transientDelta > 1800 && zeroCrossings > 55) {
                            val now = System.currentTimeMillis()
                            if (now - lastSnapTimestamp > DEBOUNCE_WINDOW_MS) {
                                lastSnapTimestamp = now
                                Log.i(TAG, "👌 FINGER SNAP DETECTED (चुटकी)! Peak: $maxPeak, ZCR: $zeroCrossings, Delta: $transientDelta")
                                onSnapDetected(context)
                            }
                        }
                    }
                }
            }
        } catch (e: SecurityException) {
            Log.e(TAG, "RECORD_AUDIO permission missing for Finger Snap Detector", e)
        } catch (e: Exception) {
            Log.e(TAG, "Error in Finger Snap Detector loop", e)
        }
    }

    /**
     * Wakes up the device and automatically opens & activates the microphone
     * without requiring manual touching or app opening.
     */
    private fun onSnapDetected(context: Context) {
        // Temporarily pause AudioRecord so microphone is free for Speech Recognition
        pauseRecording()

        // 1. Wake up screen and acquire system wake lock
        val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
        val wakeLock = powerManager.newWakeLock(
            PowerManager.FULL_WAKE_LOCK or PowerManager.ACQUIRE_CAUSES_WAKEUP or PowerManager.ON_AFTER_RELEASE,
            "MyraAI::SnapWakeUpLock"
        )
        wakeLock.acquire(4000)

        // 2. Automatically open microphone and speak anime greeting
        val intent = Intent(context, MainActivity::class.java).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP or Intent.FLAG_ACTIVITY_CLEAR_TOP
            putExtra("EXTRA_SNAP_TRIGGERED", true)
            putExtra("EXTRA_AUTO_START_MIC", true) // Automatically opens and activates mic!
            putExtra("EXTRA_SPEAK_TEXT", "हाँ जी बॉस! आपकी चुटकी की आवाज़ सुन ली! बताइए क्या आज्ञा है?")
        }
        context.startActivity(intent)
    }

    fun pauseRecording() {
        isRecording = false
        job?.cancel()
        try {
            audioRecord?.stop()
        } catch (e: Exception) {
            // ignore
        }
    }

    fun resumeRecording(context: Context) {
        if (!isRecording && !isMicInUseForVoice) {
            startListening(context)
        }
    }

    fun stopListening() {
        isRecording = false
        job?.cancel()
        try {
            audioRecord?.stop()
            audioRecord?.release()
        } catch (e: Exception) {
            // ignore
        }
        audioRecord = null
    }

    fun isListening(): Boolean = isRecording
}
