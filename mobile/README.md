# EcoRadius Mobile

This directory contains the cross-platform React Native frontend for EcoRadius, built with Expo Router.

## Running Locally

To run the mobile app locally, ensure you have first started the FastAPI backend from the root directory.

```bash
npm install
npm start
```

## Local CI/CD Build (Bitrise)

This project contains a fully functional local **Bitrise CI/CD Pipeline**. The pipeline is designed to resolve dependencies, run unit tests, and compile a genuine native Android APK.

### Prerequisites for Native Build
To run the full Android build pipeline locally, your machine must have the **Java Development Kit (JDK 17)** and the **Android SDK** installed.

### Executing the Pipeline

From this `mobile` directory, run:
```bash
bitrise run primary
```

The pipeline will execute the following steps defined in `bitrise.yml`:
1. `npm install`
2. `npm test`
3. Execute Gradle (`./gradlew assembleRelease`) to compile the native Android binaries.

Once the workflow succeeds, the generated Android package will be available in the `artifacts/` folder as `ecoradius.apk`.
