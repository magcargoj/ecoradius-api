#!/usr/bin/env bash
set -e

echo "📱 Setting up Android Environment Variables..."
export ANDROID_HOME=${ANDROID_HOME:-${ANDROID_SDK_ROOT:-$HOME/Android/Sdk}}
export ANDROID_SDK_ROOT="$ANDROID_HOME"
export PATH="$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/cmdline-tools/bin:$ANDROID_HOME/tools/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator"

echo "🚀 Starting Android emulator (pixel_api_33) in GUI mode..."
echo "⚙️ Config: Hardware acceleration enabled, No audio, No boot-anim, 1.5GB memory limit"

# Start the emulator in the background with display window, hardware acceleration and optimized memory
emulator -avd pixel_api_33 -no-audio -no-boot-anim -gpu host -memory 1536 &

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
  if [ "$SECONDS" -gt 300 ]; then
    echo "\nWARNING: Boot check timed out, but device is online."
    break
  fi
done

echo "\n✅ Android emulator is ready."
