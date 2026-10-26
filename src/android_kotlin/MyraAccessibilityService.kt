package com.myra.ai.service

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Intent
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

/**
 * MyraAccessibilityService
 * Provides deep system-level control, touch and unlock monitoring, and global actions
 * such as pressing Home, Back, expanding Quick Settings, or simulating clicks.
 */
class MyraAccessibilityService : AccessibilityService() {

    companion object {
        var instance: MyraAccessibilityService? = null
            private set

        val isServiceEnabled: Boolean
            get() = instance != null
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        instance = this
        val info = AccessibilityServiceInfo().apply {
            eventTypes = AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED or
                    AccessibilityEvent.TYPE_VIEW_CLICKED or
                    AccessibilityEvent.TYPE_VIEW_SCROLLED or
                    AccessibilityEvent.TYPE_TOUCH_INTERACTION_START
            feedbackType = AccessibilityServiceInfo.FEEDBACK_GENERIC
            flags = AccessibilityServiceInfo.FLAG_INCLUDE_NOT_IMPORTANT_VIEWS or
                    AccessibilityServiceInfo.FLAG_REPORT_VIEW_IDS or
                    AccessibilityServiceInfo.FLAG_REQUEST_FILTER_KEY_EVENTS
            notificationTimeout = 100
        }
        serviceInfo = info
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return

        when (event.eventType) {
            AccessibilityEvent.TYPE_TOUCH_INTERACTION_START -> {
                // Monitor touch interactions on lockscreen / secure surfaces
                IntrusionDetectorService.notifyTouchDetected(this)
            }
            AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED -> {
                val packageName = event.packageName?.toString() ?: ""
                val className = event.className?.toString() ?: ""

                // Detect if someone is opening sensitive apps like WhatsApp, Gallery, or Settings
                if (IntrusionDetectorService.isAppLockActive) {
                    IntrusionDetectorService.checkSensitiveAppAccess(this, packageName)
                }
            }
        }
    }

    override fun onInterrupt() {
        // Accessibility service interrupted
    }

    override fun onDestroy() {
        super.onDestroy()
        instance = null
    }

    // Global Phone Actions performed by Myra AI
    fun performHomeAction(): Boolean = performGlobalAction(GLOBAL_ACTION_HOME)
    fun performBackAction(): Boolean = performGlobalAction(GLOBAL_ACTION_BACK)
    fun performNotificationsAction(): Boolean = performGlobalAction(GLOBAL_ACTION_NOTIFICATIONS)
    fun performQuickSettingsAction(): Boolean = performGlobalAction(GLOBAL_ACTION_QUICK_SETTINGS)
    fun performLockScreenAction(): Boolean = performGlobalAction(GLOBAL_ACTION_LOCK_SCREEN)
    fun performPowerDialogAction(): Boolean = performGlobalAction(GLOBAL_ACTION_POWER_DIALOG)

    // Click on UI node with matching text
    fun clickNodeWithText(targetText: String): Boolean {
        val rootNode = rootInActiveWindow ?: return false
        val nodes = rootNode.findAccessibilityNodeInfosByText(targetText)
        for (node in nodes) {
            if (node.isClickable) {
                return node.performAction(AccessibilityNodeInfo.ACTION_CLICK)
            }
        }
        return false
    }
}
