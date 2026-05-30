# EcoRadius 🌍

**EcoRadius** is an open-source platform that allows users to discover endangered wildlife species within a specific US Zip Code. 

This repository is a **monorepo** containing both the backend API and the frontend mobile application.

## 🏗 Architecture

1. **Backend API (Root)**: A high-performance Python backend powered by **FastAPI**. It handles geographic coding (converting Zip Codes to coordinates) and interacts with the US Fish and Wildlife Service databases to return nearby endangered species.
2. **Mobile App (`/mobile`)**: A sleek, cross-platform mobile application built with **React Native (Expo)**. It features a modern, fluid user interface designed for both Android and iOS.

## 🚀 Quick Start

### 1. Running the API Locally
The API is located in the root of this repository.

**Prerequisites**: Python 3.10+
```bash
# 1. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the FastAPI server on port 8000
python main.py
```
The API will be available at `http://localhost:8000`.

### 2. Running the Mobile App
The mobile app is located in the `mobile` directory.

**Prerequisites**: Node.js 18+
```bash
cd mobile
npm install
npm start
```
Use the Expo Go app on your physical device, or press `a` to run on an Android emulator, or `w` for the web interface.

## ⚙️ CI/CD Pipeline

The mobile application utilizes **Bitrise** for its continuous integration and delivery pipeline. The local `bitrise.yml` workflow is fully configured to compile a native Android `.apk` artifact directly from the source code.

For detailed CI/CD execution instructions, see the [Mobile README](mobile/README.md).

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.
