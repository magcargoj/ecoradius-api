#!/usr/bin/env bash
set -e

echo "📱 Setting up Android Environment Variables..."
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/cmdline-tools/latest/bin:$ANDROID_HOME/platform-tools:$ANDROID_HOME/emulator

echo "📜 Accepting Android SDK licenses..."
yes | sdkmanager --licenses > /dev/null 2>&1 || true

echo "⬇️ Downloading Android 13 (API 33) System Image..."
sdkmanager "emulator" "system-images;android-33;google_apis;x86_64"

echo "🛠️ Creating Android Virtual Device (AVD) named 'pixel_api_33'..."
echo "no" | avdmanager create avd -n pixel_api_33 -k "system-images;android-33;google_apis;x86_64" --device "pixel" --force

echo "🚀 Starting the emulator in the background..."
emulator -avd pixel_api_33 -no-snapshot-load &

echo "✅ Done! The emulator should appear shortly."
echo "Once it boots up to the home screen, go back to your Expo terminal and press 'a' to install the app!"chmod +x mobile/scripts/setup_emulator.sh
./mobile/scripts/setup_emulator.sh
