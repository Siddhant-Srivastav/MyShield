const { withAndroidManifest, withDangerousMod } = require("@expo/config-plugins");
const fs = require("fs");
const path = require("path");

const SECURE_ACCESS_KOTLIN = (pkg) => `package ${pkg}

import android.content.Context
import android.content.pm.PackageManager
import android.provider.Settings

object SecureAccess {

    fun component(ctx: Context): String {
        return ctx.packageName + "/" + ctx.packageName + ".VolumeTriggerService"
    }

    fun hasSecurePerm(ctx: Context): Boolean {
        return ctx.checkCallingOrSelfPermission(android.Manifest.permission.WRITE_SECURE_SETTINGS) == PackageManager.PERMISSION_GRANTED
    }

    fun isOn(ctx: Context): Boolean {
        val pref = Settings.Secure.getString(ctx.contentResolver, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES) ?: ""
        return pref.contains(component(ctx))
    }

    fun set(ctx: Context, on: Boolean): Boolean {
        if (!hasSecurePerm(ctx)) return false
        val cr = ctx.contentResolver
        val cur = Settings.Secure.getString(cr, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES) ?: ""
        val me = component(ctx)
        val list = mutableListOf<String>()
        for (p in cur.split(":")) {
            val t = p.trim()
            if (t.isNotEmpty()) list.add(t)
        }
        if (on) {
            if (!list.contains(me)) list.add(me)
        } else {
            list.remove(me)
        }
        Settings.Secure.putString(cr, Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES, list.joinToString(":"))
        if (on) Settings.Secure.putInt(cr, Settings.Secure.ACCESSIBILITY_ENABLED, 1)
        return true
    }

    fun isFinance(ctx: Context, pkg: String): Boolean {
        if (pkg.isEmpty()) return false
        if (baseList().contains(pkg)) return true
        try {
            val f = java.io.File(ctx.filesDir, "finance_apps_extra")
            if (f.exists()) {
                for (x in f.readText().split(",")) {
                    if (x.trim() == pkg) return true
                }
            }
        } catch (e: Exception) {
        }
        return false
    }

    private fun baseList(): List<String> {
        return listOf(
            "money.super.payments",
            "org.altruist.BajajExperia",
            "com.naviapp",
            "net.one97.paytm",
            "com.phonepe.app",
            "com.google.android.apps.nbu.paisa.user",
            "com.paytm.money",
            "com.mobikwik_new",
            "com.bharatpe.app",
            "com.dreamplug.androidapp",
            "in.amazon.mShop.android.shopping",
            "com.bajajfinservmarkets.app",
            "com.bajajfinserv.emi",
            "com.bajajfinserv.app",
            "com.supermoney.app",
            "com.supermoney",
            "in.supermoney.app",
            "com.lazypay.client",
            "com.kreditbee.android",
            "in.hdfcbank.bankapp",
            "com.icici.bank.icici",
            "com.sbi.lotusintouch",
            "com.axis.axisbank",
            "com.msf.kbank.mobile",
            "com.paytm.paytmapp"
        )
    }

    fun flag(ctx: Context, name: String): String {
        return try {
            java.io.File(ctx.filesDir, name).readText().trim()
        } catch (e: Exception) {
            ""
        }
    }
}
`;

const SERVICE_KOTLIN = (pkg) => `package ${pkg}

import android.accessibilityservice.AccessibilityService
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.Looper
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.view.KeyEvent
import android.view.accessibility.AccessibilityEvent
import java.io.File

class VolumeTriggerService : AccessibilityService() {
    private var lastTrigger = 0L
    private var isEnabled = false
    private var wakeLock: PowerManager.WakeLock? = null
    private var lastVolUp = 0L
    private var lastVolDown = 0L
    private val COMBO_WINDOW = 300L
    private var myPkg = ""
    private var selfPausing = false

    private val handler = Handler(Looper.getMainLooper())

    private val pollRunnable = object : Runnable {
        override fun run() {
            try {
                val f = File(filesDir, "volume_trigger_selfdisable")
                if (f.exists() && f.readText().trim() == "1") {
                    f.writeText("0")
                    selfPausing = true
                    disableSelf()
                    return
                }
            } catch (e: Exception) {
            }
            handler.postDelayed(this, 3000)
        }
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        myPkg = packageName
        updateEnabledState()
        val pm = getSystemService(Context.POWER_SERVICE) as PowerManager
        wakeLock = pm.newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "MyShield::VolumeWakeLock")
        wakeLock?.setReferenceCounted(false)
        try { File(filesDir, "volume_trigger_status").writeText("on") } catch (e: Exception) { }
        handler.postDelayed(pollRunnable, 3000)
        try {
            startForegroundService(Intent(this, MyShieldWatchdogService::class.java))
        } catch (e: Exception) {
        }
    }

    private fun updateEnabledState() {
        isEnabled = try {
            File(filesDir, "volume_trigger_enabled").readText().trim() == "1"
        } catch (e: Exception) {
            false
        }
    }

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event == null) return
        if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            val pkg = event.packageName?.toString() ?: ""
            if (pkg.isNotEmpty() && pkg != myPkg && SecureAccess.isFinance(this, pkg)) {
                if (!selfPausing) {
                    selfPausing = true
                    try { File(filesDir, "volume_trigger_status").writeText("paused") } catch (e: Exception) { }
                    handler.postDelayed({
                        try { disableSelf() } catch (e: Exception) { }
                    }, 250)
                }
            }
        }
    }

    override fun onKeyEvent(event: KeyEvent?): Boolean {
        if (event == null || event.action != KeyEvent.ACTION_DOWN) return false
        if (event.repeatCount > 0) return false
        val code = event.keyCode
        if (code != KeyEvent.KEYCODE_VOLUME_UP && code != KeyEvent.KEYCODE_VOLUME_DOWN) return false

        if (!isEnabled) {
            updateEnabledState()
            if (!isEnabled) return false
        }

        val now = System.currentTimeMillis()
        wakeLock?.acquire(3000)

        if (code == KeyEvent.KEYCODE_VOLUME_UP) {
            lastVolUp = now
            if (now - lastVolDown <= COMBO_WINDOW) tryTrigger()
        } else {
            lastVolDown = now
            if (now - lastVolUp <= COMBO_WINDOW) tryTrigger()
        }
        return false
    }

    private fun tryTrigger() {
        val now = System.currentTimeMillis()
        if (now - lastTrigger < 20000) return
        lastTrigger = now
        try {
            val v = getSystemService(Context.VIBRATOR_SERVICE) as Vibrator
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                v.vibrate(VibrationEffect.createOneShot(300, VibrationEffect.DEFAULT_AMPLITUDE))
            } else {
                v.vibrate(300)
            }
        } catch (e: Exception) {
        }
        try {
            val i = Intent(Intent.ACTION_VIEW, Uri.parse("myshield://lock-alert/countdown?trigger=volume"))
            i.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP or Intent.FLAG_ACTIVITY_NO_USER_ACTION)
            startActivity(i)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override fun onUnbind(intent: Intent?): Boolean {
        handler.removeCallbacks(pollRunnable)
        if (!selfPausing) {
            try { File(filesDir, "volume_trigger_status").writeText("off") } catch (e: Exception) { }
        }
        wakeLock?.release()
        return super.onUnbind(intent)
    }

    override fun onDestroy() {
        handler.removeCallbacks(pollRunnable)
        if (!selfPausing) {
            try { File(filesDir, "volume_trigger_status").writeText("off") } catch (e: Exception) { }
        }
        wakeLock?.release()
        super.onDestroy()
    }

    override fun onInterrupt() {
    }
}
`;

const WATCHDOG_KOTLIN = (pkg) => `package ${pkg}

import android.app.AppOpsManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.app.usage.UsageEvents
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.Process
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat

class MyShieldWatchdogService : Service() {
    private val handler = Handler(Looper.getMainLooper())
    private var lastFinanceSeen = 0L
    private var resumePosted = false

    private val poll = object : Runnable {
        override fun run() {
            try { tick() } catch (e: Exception) { }
            handler.postDelayed(this, 1000)
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        try { startForegroundCompat() } catch (e: Exception) { }
        handler.removeCallbacks(poll)
        handler.post(poll)
        return START_STICKY
    }

    private fun makeChannel(id: String, name: String, imp: Int) {
        if (Build.VERSION.SDK_INT >= 26) {
            try {
                NotificationManagerCompat.from(this).createNotificationChannel(
                    NotificationChannel(id, name, imp)
                )
            } catch (e: Exception) {
            }
        }
    }

    private fun startForegroundCompat() {
        makeChannel("myshield-auto", "MyShield Auto Mode", NotificationManager.IMPORTANCE_LOW)
        val n = NotificationCompat.Builder(this, "myshield-auto")
            .setSmallIcon(android.R.drawable.ic_lock_idle_lock)
            .setContentTitle("MyShield Auto-Mode ON")
            .setContentText("Payment apps ke saath trigger auto pause/resume")
            .setOngoing(true)
            .build()
        if (Build.VERSION.SDK_INT >= 34) {
            startForeground(9994, n, 64)
        } else {
            startForeground(9994, n)
        }
    }

    private fun hasUsageAccess(): Boolean {
        return try {
            val aom = getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
            aom.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), packageName) == AppOpsManager.MODE_ALLOWED
        } catch (e: Exception) {
            false
        }
    }

    private fun currentPackage(): String? {
        if (!hasUsageAccess()) return null
        val usm = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val now = System.currentTimeMillis()
        val events = usm.queryEvents(now - 15000, now)
        val ev = UsageEvents.Event()
        var last: String? = null
        while (events.hasNextEvent()) {
            events.getNextEvent(ev)
            if (ev.eventType == UsageEvents.Event.ACTIVITY_RESUMED) last = ev.packageName
        }
        return last
    }

    private fun tick() {
        val comboOn = SecureAccess.flag(this, "volume_trigger_enabled") == "1"
        val protOn = SecureAccess.flag(this, "protection_enabled_native") == "1"
        if (!comboOn || !protOn) {
            cancelResume()
            return
        }
        val pkg = currentPackage() ?: return
        if (pkg == packageName) return

        if (SecureAccess.isFinance(this, pkg)) {
            lastFinanceSeen = System.currentTimeMillis()
            if (SecureAccess.isOn(this)) SecureAccess.set(this, false)
            cancelResume()
        } else {
            val since = System.currentTimeMillis() - lastFinanceSeen
            if (lastFinanceSeen > 0 && since > 1500 && since < 900000) {
                if (!SecureAccess.isOn(this)) {
                    if (!resumePosted) {
                        postResume()
                        resumePosted = true
                    }
                } else {
                    cancelResume()
                    lastFinanceSeen = 0
                }
            }
        }
    }

    private fun postResume() {
        makeChannel("myshield-resume", "MyShield Resume", NotificationManager.IMPORTANCE_HIGH)
        val i = Intent(this, MyShieldResumeReceiver::class.java)
        val pi = PendingIntent.getBroadcast(this, 21, i, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val n = NotificationCompat.Builder(this, "myshield-resume")
            .setSmallIcon(android.R.drawable.ic_menu_send)
            .setContentTitle("Payment khatam? Volume Trigger ON karo")
            .setContentText("Ek tap me protection wapas full mode me")
            .addAction(android.R.drawable.ic_menu_send, "1-TAP ON KARO", pi)
            .setContentIntent(pi)
            .setAutoCancel(true)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .build()
        try { NotificationManagerCompat.from(this).notify(9993, n) } catch (e: Exception) { }
    }

    private fun cancelResume() {
        if (resumePosted) {
            try { NotificationManagerCompat.from(this).cancel(9993) } catch (e: Exception) { }
            resumePosted = false
        }
    }

    override fun onDestroy() {
        handler.removeCallbacks(poll)
        super.onDestroy()
    }
}
`;

const RESUME_RECEIVER_KOTLIN = (pkg) => `package ${pkg}

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.app.NotificationManagerCompat

class MyShieldResumeReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        val ok = SecureAccess.set(context, true)
        if (!ok) {
            try {
                val i = Intent(android.provider.Settings.ACTION_ACCESSIBILITY_SETTINGS)
                i.flags = Intent.FLAG_ACTIVITY_NEW_TASK
                context.startActivity(i)
            } catch (e: Exception) {
            }
        }
        try { NotificationManagerCompat.from(context).cancel(9993) } catch (e: Exception) { }
        try {
            context.startForegroundService(Intent(context, MyShieldWatchdogService::class.java))
        } catch (e: Exception) {
        }
    }
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
                nm.createNotificationChannel(
                    NotificationChannel("myshield-boot", "MyShield Restart", NotificationManager.IMPORTANCE_HIGH)
                )
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

            try {
                context.startForegroundService(Intent(context, MyShieldWatchdogService::class.java))
            } catch (e: Exception) {
            }
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
    if (!root.$["xmlns:tools"]) {
      root.$["xmlns:tools"] = "http://schemas.android.com/tools";
    }

    root["uses-permission"] = root["uses-permission"] || [];
    const addPerm = (name, extra) => {
      if (!root["uses-permission"].find((p) => p.$["android:name"] === name)) {
        root["uses-permission"].push({ $: Object.assign({ "android:name": name }, extra || {}) });
      }
    };
    addPerm("android.permission.RECEIVE_BOOT_COMPLETED");
    addPerm("android.permission.WAKE_LOCK");
    addPerm("android.permission.FOREGROUND_SERVICE");
    addPerm("android.permission.FOREGROUND_SERVICE_SPECIAL_USE");
    addPerm("android.permission.PACKAGE_USAGE_STATS", { "tools:ignore": "ProtectedPermissions" });

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
    if (!app.service.find((s) => s.$["android:name"] === ".MyShieldWatchdogService")) {
      app.service.push({
        $: {
          "android:name": ".MyShieldWatchdogService",
          "android:exported": "false",
          "android:foregroundServiceType": "specialUse",
        },
        "property": [
          { $: { "android:name": "android.app.PROPERTY_SPECIAL_USE_FGS_SUBTYPE", "android:value": "safety_trigger_monitoring" } },
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
    if (!app.receiver.find((r) => r.$["android:name"] === ".MyShieldResumeReceiver")) {
      app.receiver.push({
        $: { "android:name": ".MyShieldResumeReceiver", "android:exported": "false" },
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
      fs.writeFileSync(path.join(kotlinDir, "MyShieldWatchdogService.kt"), WATCHDOG_KOTLIN(pkg), "utf8");
      fs.writeFileSync(path.join(kotlinDir, "MyShieldResumeReceiver.kt"), RESUME_RECEIVER_KOTLIN(pkg), "utf8");
      fs.writeFileSync(path.join(kotlinDir, "MyShieldBootReceiver.kt"), BOOT_RECEIVER_KOTLIN(pkg), "utf8");
      fs.writeFileSync(path.join(kotlinDir, "SecureAccess.kt"), SECURE_ACCESS_KOTLIN(pkg), "utf8");

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
          `    <string name="volume_trigger_desc">MyShield: Volume UP + Volume DOWN dono ek saath dabakar emergency alert bhejo.</string>\n</resources>`
        );
        fs.writeFileSync(stringsPath, strings, "utf8");
      }

      console.log("✅ withVolumeTrigger v11: full stable rewrite");
      return cfg;
    },
  ]);

  return config;
};