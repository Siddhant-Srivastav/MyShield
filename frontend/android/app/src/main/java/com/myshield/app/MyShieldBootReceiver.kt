package com.myshield.app

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
