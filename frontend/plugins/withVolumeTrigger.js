const { withAndroidManifest, withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const SERVICE_KOTLIN = (pkg) => `package ${pkg}

import android.accessibilityservice.AccessibilityService
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.KeyEvent
import java.io.File

class VolumeTriggerService : AccessibilityService() {
    private var lastTrigger = 0L
    private var isEnabled = false
    private var wakeLock: PowerManager.WakeLock? = null
    private var lastScreenChange = 0L
    private var lastVolumePress = 0L
    private val COMBO_WINDOW = 450L // Volume + Power isi window me ek saath dabne chahiye

    // Power button ka EFFECT (screen ON/OFF) pakadta hai
    private val screenReceiver = object : BroadcastReceiver() {
        override fun onReceive(context: Context?, intent: Intent?) {
            lastScreenChange = System.currentTimeMillis()
            // Volume PEHLE dab chuka tha, ab Power daba → COMBO
            if (lastScreenChange - lastVolumePress <= COMBO_WINDOW) {
                tryTrigger()
            }
        }
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        updateEnabledState()

        val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "MyShield::VolumeWakeLock").apply {
            setReferenceCounted(false)
        }

        val filter = IntentFilter().apply {
            addAction(Intent.ACTION_SCREEN_OFF)
            addAction(Intent.ACTION_SCREEN_ON)
        }
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            registerReceiver(screenReceiver, filter, RECEIVER_NOT_EXPORTED)
        } else {
            registerReceiver(screenReceiver, filter)
        }
        try { File(filesDir, "volume_trigger_status").writeText("on") } catch (e: Exception) {}
    }

    private fun updateEnabledState() {
        isEnabled = try {
            File(filesDir, "volume_trigger_enabled").readText().trim() == "1"
        } catch (e: Exception) { false }
    }

    override fun onKeyEvent(event: KeyEvent?): Boolean {
        if (event == null || event.action != KeyEvent.ACTION_DOWN) return false
        if (event.repeatCount > 0) return false
        val code = event.keyCode
                if (code != KeyEvent.KEYCODE_VOLUME_UP) return false

        if (!isEnabled) {
            updateEnabledState()
            if (!isEnabled) return false
        }

        wakeLock?.acquire(3000)
        lastVolumePress = System.currentTimeMillis()

        // Power PEHLE dab chuka tha (screen ON/OFF hua), ab Volume daba → COMBO
        if (lastVolumePress - lastScreenChange <= COMBO_WINDOW) {
            tryTrigger()
        }
        return false // Volume ka normal kaam (awaz badhna/kamna) chalta rahe
    }

    private fun tryTrigger() {
        val now = System.currentTimeMillis()
        if (now - lastTrigger < 20000) return // 20 sec cooldown
        lastTrigger = now

        // Strong vibration feedback
        try {
            val v = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                v.vibrate(VibrationEffect.createOneShot(300, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                v.vibrate(300)
            }
        } catch (e: Exception) {}

        // Countdown screen kholo
        try {
            val i = Intent(Intent.ACTION_VIEW, Uri.parse("myshield://lock-alert/countdown?trigger=volume"))
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NO_USER_ACTION)
            startActivity(i)
        } catch (e: Exception) { e.printStackTrace() }
    }

    override fun onUnbind(intent: Intent?): Boolean {
        try { unregisterReceiver(screenReceiver) } catch (e: Exception) {}
        try { File(filesDir, "volume_trigger_status").writeText("off") } catch (e: Exception) {}
        wakeLock?.release()
        return super.onUnbind(intent)
    }

    override fun onDestroy() {
        try { unregisterReceiver(screenReceiver) } catch (e: Exception) {}
        try { File(filesDir, "volume_trigger_status").writeText("off") } catch (e: Exception) {}
        wakeLock?.release()
        super.onDestroy()
    }

    override fun onAccessibilityEvent(event: android.view.accessibility.AccessibilityEvent?) {}
    override fun onInterrupt() {}
}
`;

const BOOT_RECEIVER_KOTLIN = (pkg) => `package ${pkg}

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.os.Build
import java.io.File

class MyShieldBootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        try {
            val enabled = File(context.filesDir, "protection_enabled_native")
                .takeIf { it.exists() }?.readText()?.trim() == "1"
            if (!enabled) return

            val nm = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                val ch = NotificationChannel(
                    "myshield-boot", "MyShield Restart", NotificationManager.IMPORTANCE_HIGH
                )
                nm.createNotificationChannel(ch)
            }

            val launch = context.packageManager.getLaunchIntentForPackage(context.packageName)
            val pi = PendingIntent.getActivity(
                context, 0, launch, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )

            val nb = android.app.Notification.Builder(context, "myshield-boot")
                .setSmallIcon(android.R.drawable.ic_dialog_alert)
                .setContentTitle("MyShield: phone restart hua")
                .setContentText("Protection shuru karne ke liye tap karo")
                .setContentIntent(pi)
                .setAutoCancel(true)
            nm.notify(9991, nb.build())
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }
}
`;

const XML_CONFIG = `<?xml version="1.0" encoding="utf-8"?>
<accessibility-service xmlns:android="http://schemas.android.com/apk/res/android"
    android:accessibilityEventTypes="typeWindowStateChanged"
    android:accessibilityFeedbackType="feedbackGeneric"
    android:notificationTimeout="100"
    android:accessibilityFlags="flagRequestFilterKeyEvents"
    android:canRequestFilterKeyEvents="true"
    android:description="@string/volume_trigger_desc" />
`;

module.exports = function withVolumeTrigger(config) {
  config = withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;
    const root = manifest.manifest;

    root["uses-permission"] = root["uses-permission"] || [];
    if (!root["uses-permission"].find((p) => p.$["android:name"] === "android.permission.RECEIVE_BOOT_COMPLETED")) {
      root["uses-permission"].push({ $: { "android:name": "android.permission.RECEIVE_BOOT_COMPLETED" } });
    }
    if (!root["uses-permission"].find((p) => p.$["android:name"] === "android.permission.WAKE_LOCK")) {
      root["uses-permission"].push({ $: { "android:name": "android.permission.WAKE_LOCK" } });
    }

    const app = root.application[0];

    app.service = app.service || [];
    if (!app.service.find((s) => s.$["android:name"] === ".VolumeTriggerService")) {
      app.service.push({
        $: {
          "android:name": ".VolumeTriggerService",
          "android:permission": "android.permission.BIND_ACCESSIBILITY_SERVICE",
          "android:exported": "false",
          "android:label": "MyShield Volume Trigger",
        },
        "intent-filter": [
          { action: [{ $: { "android:name": "android.accessibilityservice.AccessibilityService" } }] },
        ],
        "meta-data": [
          { $: { "android:name": "android.accessibilityservice", "android:resource": "@xml/volume_trigger_config" } },
        ],
      });
    }

    app.receiver = app.receiver || [];
    if (!app.receiver.find((r) => r.$["android:name"] === ".MyShieldBootReceiver")) {
      app.receiver.push({
        $: { "android:name": ".MyShieldBootReceiver", "android:exported": "true" },
        "intent-filter": [
          {
            action: [
              { $: { "android:name": "android.intent.action.BOOT_COMPLETED" } },
              { $: { "android:name": "android.intent.action.MY_PACKAGE_REPLACED" } },
            ],
          },
        ],
      });
    }
    return cfg;
  });

  config = withDangerousMod(config, [
    "android",
    (cfg) => {
      const pkg = config.android?.package || "com.myshield.app";
      const androidRoot = cfg.modRequest.platformProjectRoot;

      const kotlinDir = path.join(androidRoot, "app", "src", "main", "java", ...pkg.split("."));
      fs.mkdirSync(kotlinDir, { recursive: true });
      fs.writeFileSync(path.join(kotlinDir, "VolumeTriggerService.kt"), SERVICE_KOTLIN(pkg), "utf8");
      fs.writeFileSync(path.join(kotlinDir, "MyShieldBootReceiver.kt"), BOOT_RECEIVER_KOTLIN(pkg), "utf8");

      const xmlDir = path.join(androidRoot, "app", "src", "main", "res", "xml");
      fs.mkdirSync(xmlDir, { recursive: true });
      fs.writeFileSync(path.join(xmlDir, "volume_trigger_config.xml"), XML_CONFIG, "utf8");

      const valuesDir = path.join(androidRoot, "app", "src", "main", "res", "values");
      fs.mkdirSync(valuesDir, { recursive: true });
      const stringsPath = path.join(valuesDir, "strings.xml");
      let strings = fs.existsSync(stringsPath)
        ? fs.readFileSync(stringsPath, "utf8")
        : `<?xml version="1.0" encoding="utf-8"?>\n<resources></resources>`;
      if (!strings.includes("volume_trigger_desc")) {
        strings = strings.replace(
          "</resources>",
          `    <string name="volume_trigger_desc">MyShield: Volume UP + Power button ek saath dabakar emergency alert bhejo.</string>\n</resources>`
        );
        fs.writeFileSync(stringsPath, strings, "utf8");
      }

      console.log("✅ withVolumeTrigger v5: Volume+Power combo injected");
      return cfg;
    },
  ]);

  return config;
};