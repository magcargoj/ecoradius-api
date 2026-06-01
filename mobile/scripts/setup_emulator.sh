#!/usr/bin/env bash
set -e

echo "📱 Setting up Android Environment Variables..."
export ANDROID_HOME=${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}}
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/cmdline-tools/bin:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator"

echo "🔧 Android SDK root: $ANDROID_HOME"

echo "📜 Accepting Android SDK licenses..."
yes | sdkmanager --licenses > /dev/null 2>&1 || true

echo "🔍 Ensuring required Android packages are installed..."
sdkmanager --install "platform-tools" "emulator" "system-images;android-33;google_apis;x86" --sdk_root="$ANDROID_HOME"

echo "🛠️ Creating Android Virtual Device (AVD) named 'pixel_api_33'..."
echo "no" | avdmanager create avd -n pixel_api_33 -k "system-images;android-33;google_apis;x86" --device "pixel" --force --sdk_root="$ANDROID_HOME"

echo "🚀 Starting the emulator in the background..."
emulator -avd pixel_api_33 -no-window -no-audio -no-boot-anim -no-snapshot-load -gpu swiftshader_indirect -memory 1536 &

EMULATOR_PID=$!

echo "⏳ Waiting for emulator device to appear..."
until adb devices | grep -q '^emulator'; do
  sleep 3
  echo "Still waiting for emulator device..."
done

echo "⏳ Waiting for emulator boot completion..."
boot_completed=""
bootanim=""
SECONDS=0
until [ "$boot_completed" = "1" ] && [ "$bootanim" = "stopped" ]; do
  boot_completed=$(adb shell getprop sys.boot_completed 2>/dev/null | tr -d '\r' || true)
  bootanim=$(adb shell getprop init.svc.bootanim 2>/dev/null | tr -d '\r' || true)
  printf '.'
  sleep 3
  if [ "$SECONDS" -gt 600 ]; then
    echo "\nERROR: Emulator did not finish booting within 10 minutes."
    ps -p "$EMULATOR_PID" || true
    exit 1
  fi
done

echo "\n✅ Android emulator is fully booted and ready."

