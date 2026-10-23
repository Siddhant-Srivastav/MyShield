const { withAndroidManifest } = require("@expo/config-plugins");

const PERMISSIONS = [
  "android.permission.VIBRATE",
  "android.permission.WAKE_LOCK",
  "android.permission.FOREGROUND_SERVICE",
  "android.permission.POST_NOTIFICATIONS",
  "android.permission.REQUEST_IGNORE_BATTERY_OPTIMIZATIONS",
  "android.permission.ACCESS_BACKGROUND_LOCATION",
];

function ensurePermission(manifest, name) {
  const root = manifest.manifest;
  root["uses-permission"] = root["uses-permission"] || [];
  if (!root["uses-permission"].find((p) => p.$["android:name"] === name)) {
    root["uses-permission"].push({ $: { "android:name": name } });
  }
}

module.exports = function withLockScreenAlert(config) {
  return withAndroidManifest(config, (cfg) => {
    const manifest = cfg.modResults;

    PERMISSIONS.forEach((p) => ensurePermission(manifest, p));

    const app = manifest.manifest.application[0];
    const mainActivity =
      app.activity.find(
        (a) =>
          a.$["android:name"] === ".MainActivity" ||
          a.$["android:name"] === "MainActivity"
      ) || app.activity[0];

    mainActivity.$["android:showWhenLocked"] = "true";
    mainActivity.$["android:turnScreenOn"] = "true";

    console.log("✅ withLockScreenAlert: manifest updated");
    return cfg;
  });
};