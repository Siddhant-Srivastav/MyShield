const { withAndroidManifest, withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const SERVICE_KOTLIN = (pkg) => `package ${pkg}

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
                    v.vibrate(longArrayOf(0, 90, 40, 90)) // feedback buzz
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

    // Boot permission
    root["uses-permission"] = root["uses-permission"] || [];
    if (!root["uses-permission"].find((p) => p.$["android:name"] === "android.permission.RECEIVE_BOOT_COMPLETED")) {
      root["uses-permission"].push({ $: { "android:name": "android.permission.RECEIVE_BOOT_COMPLETED" } });
    }

    const app = root.application[0];

    // Accessibility service
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

    // Boot receiver
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
          `    <string name="volume_trigger_desc">MyShield ko volume button se emergency trigger karne deta hai. Sirf safety ke liye.</string>\n</resources>`
        );
        fs.writeFileSync(stringsPath, strings, "utf8");
      }

      console.log("✅ withVolumeTrigger v2: service + boot receiver injected");
      return cfg;
    },
  ]);

  return config;
};