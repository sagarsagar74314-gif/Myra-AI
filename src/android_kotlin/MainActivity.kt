package com.myra.ai

import android.Manifest
import android.content.Intent
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.animation.core.*
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.rotate
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import com.myra.ai.service.*

/**
 * MainActivity
 * Jetpack Compose implementation of Myra AI with interactive controls for
 * Background Service, Screen-off execution, Clap Detection, Intrusion Guard,
 * High-Accuracy GPS, and Proactive AI Companion.
 */
class MainActivity : ComponentActivity() {

    private val permissionLauncher = registerForActivityResult(
        ActivityResultContracts.RequestMultiplePermissions()
    ) { permissions ->
        val recordAudioGranted = permissions[Manifest.permission.RECORD_AUDIO] ?: false
        val locationGranted = permissions[Manifest.permission.ACCESS_FINE_LOCATION] ?: false

        if (recordAudioGranted) {
            ClapAcousticTriggerService.startListening(this)
        }
        if (locationGranted) {
            HighAccuracyLocationProvider.startLiveTracking(this)
        }
    }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        // Initialize services
        IntrusionDetectorService.initialize(this)
        requestRequiredPermissions()

        // Check if woke up from Finger Snap (चुटकी), Hotword 'मायरा', or Proactive check
        val snapTriggered = intent.getBooleanExtra("EXTRA_SNAP_TRIGGERED", false)
        val hotwordTriggered = intent.getBooleanExtra("EXTRA_HOTWORD_TRIGGERED", false)
        val autoStartMic = intent.getBooleanExtra("EXTRA_AUTO_START_MIC", false)
        val directCommand = intent.getStringExtra("EXTRA_DIRECT_COMMAND")
        val proactivePrompt = intent.getStringExtra("EXTRA_PROACTIVE_PROMPT")

        setContent {
            MaterialTheme(colorScheme = darkColorScheme()) {
                Surface(
                    modifier = Modifier.fillMaxSize(),
                    color = Color(0xFF090D21)
                ) {
                    MyraAppScreen(
                        isSnapTriggered = snapTriggered,
                        isHotwordTriggered = hotwordTriggered,
                        autoStartMic = autoStartMic,
                        directCommand = directCommand,
                        proactivePrompt = proactivePrompt,
                        onStartForegroundService = { MyraForegroundService.start(this) },
                        onStopForegroundService = { MyraForegroundService.stop(this) },
                        onArmIntrusion = { IntrusionDetectorService.armSensors(it) }
                    )
                }
            }
        }
    }

    private fun requestRequiredPermissions() {
        val permissions = mutableListOf(
            Manifest.permission.RECORD_AUDIO,
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.CAMERA
        )
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            permissions.add(Manifest.permission.POST_NOTIFICATIONS)
        }
        permissionLauncher.launch(permissions.toTypedArray())
    }
}

@Composable
fun MyraAppScreen(
    isSnapTriggered: Boolean = false,
    isHotwordTriggered: Boolean = false,
    autoStartMic: Boolean = false,
    directCommand: String? = null,
    proactivePrompt: String? = null,
    onStartForegroundService: () -> Unit,
    onStopForegroundService: () -> Unit,
    onArmIntrusion: (Boolean) -> Unit
) {
    var isForegroundActive by remember { mutableStateOf(true) }
    var isIntrusionArmed by remember { mutableStateOf(false) }
    var isVoiceListening by remember { mutableStateOf(autoStartMic) }
    val locationData by HighAccuracyLocationProvider.currentLocation.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.SpaceBetween
    ) {
        // Top Header - Subtitle hidden per user request
        Text(
            text = "MYRA AI",
            fontSize = 28.sp,
            fontWeight = FontWeight.Black,
            color = Color.White
        )

        // Center Voice Button with Smooth Rotating Multi-Colored Glowing Animation
        val infiniteTransition = rememberInfiniteTransition(label = "mic_rotation")
        val rotationAngle by infiniteTransition.animateFloat(
            initialValue = 0f,
            targetValue = 360f,
            animationSpec = infiniteRepeatable(
                animation = tween(durationMillis = 5000, easing = LinearEasing),
                repeatMode = RepeatMode.Restart
            ),
            label = "spin_angle"
        )
        val pulseScale by infiniteTransition.animateFloat(
            initialValue = 1f,
            targetValue = 1.08f,
            animationSpec = infiniteRepeatable(
                animation = tween(durationMillis = 2200, easing = FastOutSlowInEasing),
                repeatMode = RepeatMode.Reverse
            ),
            label = "pulse_scale"
        )

        val multiColorBrush = Brush.sweepGradient(
            listOf(
                Color(0xFF06B6D4), // Cyan
                Color(0xFF3B82F6), // Blue
                Color(0xFF6366F1), // Indigo
                Color(0xFFA855F7), // Purple
                Color(0xFFEC4899), // Pink
                Color(0xFFF59E0B), // Amber
                Color(0xFF10B981), // Emerald
                Color(0xFF06B6D4)  // Cyan loop
            )
        )

        Box(
            contentAlignment = Alignment.Center,
            modifier = Modifier.size(200.dp)
        ) {
            // Ambient Rotating Multi-Color Halo Glow
            Box(
                modifier = Modifier
                    .size(190.dp)
                    .scale(pulseScale)
                    .rotate(rotationAngle)
                    .background(
                        brush = multiColorBrush,
                        shape = CircleShape
                    )
            )

            // Outer Rotating Multi-Color Ring
            Box(
                modifier = Modifier
                    .size(165.dp)
                    .rotate(rotationAngle)
                    .background(
                        brush = multiColorBrush,
                        shape = CircleShape
                    )
                    .padding(3.dp)
                    .background(
                        color = Color(0xFF0A0F29),
                        shape = CircleShape
                    )
            )

            // Inner Sleek Metallic Core Orb
            Box(
                contentAlignment = Alignment.Center,
                modifier = Modifier
                    .size(140.dp)
                    .background(
                        brush = Brush.verticalGradient(
                            colors = listOf(
                                Color(0xFF1E1B4B),
                                Color(0xFF0F172A),
                                Color(0xFF090D21)
                            )
                        ),
                        shape = CircleShape
                    )
            ) {
                Text(
                    text = "🎤",
                    fontSize = 46.sp,
                    textAlign = TextAlign.Center
                )
            }
        }

        // Live GPS Card
        Card(
            shape = RoundedCornerShape(20.dp),
            colors = CardDefaults.cardColors(containerColor = Color(0xFF0F172A)),
            modifier = Modifier.fillMaxWidth()
        ) {
            Row(
                modifier = Modifier.padding(14.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(text = "📍", fontSize = 24.sp)
                Spacer(modifier = Modifier.width(10.dp))
                Column {
                    Text(
                        text = "उच्च सटीकता GPS (High-Accuracy):",
                        fontSize = 11.sp,
                        color = Color(0xFF94A3B8)
                    )
                    Text(
                        text = locationData.addressLine,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White,
                        maxLines = 1
                    )
                }
            }
        }

        // Background & Security Toggles
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "बैकग्राउंड सेवा (Foreground 24/7):",
                color = Color.White,
                fontSize = 13.sp
            )
            Switch(
                checked = isForegroundActive,
                onCheckedChange = {
                    isForegroundActive = it
                    if (it) onStartForegroundService() else onStopForegroundService()
                }
            )
        }

        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.SpaceBetween,
            verticalAlignment = Alignment.CenterVertically
        ) {
            Text(
                text = "घुसपैठ पहचान (Intrusion Guard):",
                color = Color.White,
                fontSize = 13.sp
            )
            Switch(
                checked = isIntrusionArmed,
                onCheckedChange = {
                    isIntrusionArmed = it
                    onArmIntrusion(it)
                }
            )
        }
    }
}
