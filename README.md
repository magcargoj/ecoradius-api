# EcoRadius 🌍

**EcoRadius** is an open-source platform that allows users to discover endangered wildlife species within a specific US Zip Code. 

This repository is a **monorepo** containing both the backend API and the frontend mobile application. It is designed to be highly scalable, thoroughly documented, and easy to run locally without any complex setup or external API keys.

---

## 🏗 Architecture & Tech Stack

The platform is divided into a robust backend and a fluid mobile frontend. They communicate via RESTful HTTP endpoints.

### Tech Stack
- **Frontend**: React Native, Expo, JavaScript
- **Backend**: Python 3.10+, FastAPI, Pydantic, Uvicorn
- **External Data Sources**: 
  - OpenStreetMap (Nominatim API) for Geocoding
  - Global Biodiversity Information Facility (GBIF API) for Species Data
- **CI/CD**: Bitrise (Local Android APK Pipeline)

### System Flow
```mermaid
sequenceDiagram
    participant User as Mobile App (React Native)
    participant API as FastAPI Backend (Python)
    participant OSM as OpenStreetMap API
    participant GBIF as GBIF API

    User->>API: GET /api/v1/endangered/by-zip?zipcode=90210
    API->>OSM: Geocode Zip to Lat/Lng
    OSM-->>API: 34.0901, -118.4065
    API->>GBIF: Query Endangered Species at Lat/Lng
    GBIF-->>API: Raw Occurrence Data
    API->>API: Aggregate & Resolve Common Names
    API-->>User: Structured JSON Response
```

---

## 📊 Data Schemas

The API is fully typed using **Pydantic**. Here is the standard JSON response schema when successfully querying a zip code.

### Endpoint: `GET /api/v1/endangered/by-zip`

**Example Response:**
```json
{
  "query_location": {
    "lat": 34.0901,
    "lng": -118.4065,
    "zipcode": "90210",
    "country": "US",
    "radius_km": 10.0
  },
  "total_unique_species": 1,
  "species": [
    {
      "scientific_name": "Puma concolor",
      "common_name": "Mountain Lion",
      "kingdom": "Animalia",
      "status": "Endangered",
      "occurrences_found": 14
    }
  ]
}
```

---

## 🚀 Quick Start (Local Setup)

The project is designed to run locally right out of the box. **No external API keys or secrets are required to run this project.** It uses public, open APIs.

### 1. Running the Backend API
The API is located in the root of this repository.

**Prerequisites**: Python 3.10+
```bash
# 1. Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Start the FastAPI server on port 8000 (in the background)
python main.py &

# Note: Press Enter if the logs overlay your prompt. To stop the server later, type `fg` then press CTRL+C.
```
*The API will be available at `http://localhost:8000` with interactive docs at `http://localhost:8000/docs`.*

### 2. Running the Mobile App
The mobile app is located in the `mobile` directory.

**Prerequisites**: Node.js 18+
```bash
# 1. Navigate to the mobile directory
cd mobile

# 2. Install NPM dependencies
npm install

# 3. Start the Expo development server
npm start
```
*Use the Expo Go app on your physical device, or press `a` to run on an Android emulator, or `w` for the web interface.*

### 3. Running End-to-End Locally
After starting the backend API, you can run the mobile app and verify it connects successfully.

1. Start the backend from the repo root:
```bash
python main.py &
```
2. Confirm the API is live at:
   - `http://localhost:8000`
   - `http://localhost:8000/docs`
3. In the `mobile` directory, install dependencies and start Expo:
```bash
cd mobile
npm install
npm start
```
4. Open Expo on a device or emulator and confirm the app loads data from the backend.

This setup is ideal for local verification before pushing updates or running the CI/CD workflow.

---

## ⚙️ Bitrise Automated Workflow
The `mobile/bitrise.yml` workflow automates the full interview demo flow end to end.

It performs these key stages:
- Install backend dependencies and start the FastAPI API in the background
- Install mobile dependencies
- Lint and validate code with ESLint
- Run application unit tests to validate behavior
- Build a release Android APK using Gradle Runner and publish it to `artifacts/ecoradius.apk`
- Deploy the results and APK artifact with Bitrise's `deploy-to-bitrise-io` step

To test the app locally, you can use the web view while the backend is running:

```bash
cd mobile
npm start
# Then press 'w' for web
```

Run the full automated APK build locally with:
```bash
cd mobile
bitrise run primary
```

This workflow is designed to showcase not just a build, but a full integrated pipeline from backend startup to emulator deployment, validation, and APK packaging.

---

## 📄 License

This project is licensed under the **MIT License**. See the [LICENSE](LICENSE) file for more details.
