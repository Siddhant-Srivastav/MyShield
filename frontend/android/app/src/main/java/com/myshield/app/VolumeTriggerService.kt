package com.myshield.app

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Vibrator
import android.view.KeyEvent
import java.io.File

class VolumeTriggerService : AccessibilityService() {
    private val presses = mutableListOf<Long>()
    private var lastTrigger = 0L

    override fun onKeyEvent(event: KeyEvent?): Boolean {
        if (event == null || event.action != KeyEvent.ACTION_DOWN) return false
        if (event.repeatCount > 0) return false // long-press repeats = ignore
        val code = event.keyCode
        if (code != KeyEvent.KEYCODE_VOLUME_DOWN && code != KeyEvent.KEYCODE_VOLUME_UP) return false

        val enabled = try {
            File(filesDir, "volume_trigger_enabled").readText().trim() == "1"
        } catch (e: Exception) { false }
        if (!enabled) return false

        val now = System.currentTimeMillis()
        presses.add(now)
        presses.removeAll { now - it > 3000 } // 3 sec window

        if (presses.size >= 3) {
            presses.clear()
            if (now - lastTrigger > 20000) { // 20 sec cooldown
                lastTrigger = now
                try {
                    val v = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
                    v.vibrate(longArrayOf(0, 90, 40, 90),-1) // feedback buzz
                } catch (e: Exception) {}
                try {
                    val i = Intent(
                        Intent.ACTION_VIEW,
                        Uri.parse("myshield://lock-alert/countdown?trigger=volume")
                    )
                    i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
                    startActivity(i)
                } catch (e: Exception) { e.printStackTrace() }
            }
            return true
        }
        return false
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        try { File(filesDir, "volume_trigger_status").writeText("on") } catch (e: Exception) {}
    }

    override fun onUnbind(intent: Intent?): Boolean {
        try { File(filesDir, "volume_trigger_status").writeText("off") } catch (e: Exception) {}
        return super.onUnbind(intent)
    }

    override fun onDestroy() {
        try { File(filesDir, "volume_trigger_status").writeText("off") } catch (e: Exception) {}
        super.onDestroy()
    }

    override fun onAccessibilityEvent(event: android.view.accessibility.AccessibilityEvent?) {}
    override fun onInterrupt() {}
}
