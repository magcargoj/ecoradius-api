from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List
from core import geocode_zip, get_endangered_species

app = FastAPI(
    title="Eco-Radius API",
    description="Discover endangered and critically endangered species by Zip Code or coordinates for environmental planning and wildlife enthusiasts.",
    version="1.0.0"
)

# --- Pydantic Models for Output Validation and Documentation ---
class SpeciesResponse(BaseModel):
    scientific_name: str
    common_name: str
    kingdom: str
    status: str
    occurrences_found: int

class EcoRadiusResponse(BaseModel):
    query_location: dict
    total_unique_species: int
    species: List[SpeciesResponse]

# --- API Endpoints ---
@app.get("/api/v1/endangered/by-zip", response_model=EcoRadiusResponse)
def get_by_zip(
    zipcode: str = Query(..., description="The Zip or Postal code to search"),
    country: str = Query("US", description="Country code (e.g., US, CA, UK)"),
    radius_km: float = Query(10.0, description="Search radius in kilometers", ge=1.0, le=100.0)
):
    """
    Get endangered species using a Zip Code.
    The API automatically geocodes the zip to coordinates and searches the GBIF database.
    """
    lat, lng = geocode_zip(zipcode, country)
    if lat is None or lng is None:
        raise HTTPException(status_code=404, detail="Could not geocode the provided zip code. Please verify the code and country.")
        
    result = get_endangered_species(lat, lng, radius_km)
    if "error" in result:
         raise HTTPException(status_code=500, detail=result["error"])
         
    return {
        "query_location": {"lat": lat, "lng": lng, "zipcode": zipcode, "country": country, "radius_km": radius_km},
        "total_unique_species": result["total_unique_species"],
        "species": result["species"]
    }

@app.get("/api/v1/endangered/by-coords", response_model=EcoRadiusResponse)
def get_by_coords(
    lat: float = Query(..., description="Latitude of the center point"),
    lng: float = Query(..., description="Longitude of the center point"),
    radius_km: float = Query(10.0, description="Search radius in kilometers", ge=1.0, le=100.0)
):
    """
    Get endangered species using exact Latitude and Longitude coordinates.
    """
    result = get_endangered_species(lat, lng, radius_km)
    if "error" in result:
         raise HTTPException(status_code=500, detail=result["error"])
         
    return {
        "query_location": {"lat": lat, "lng": lng, "radius_km": radius_km},
        "total_unique_species": result["total_unique_species"],
        "species": result["species"]
    }

if __name__ == "__main__":
    import uvicorn
    # This block allows you to run the API locally using `python main.py`
    print("Starting Eco-Radius API on http://127.0.0.1:8000")
    print("API Documentation available at: http://127.0.0.1:8000/docs")
    uvicorn.run(app, host="127.0.0.1", port=8000)
