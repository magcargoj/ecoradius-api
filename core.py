"""
Core Module for EcoRadius

This module handles external API integrations including geocoding via OpenStreetMap (Nominatim)
and fetching endangered species occurrences from the Global Biodiversity Information Facility (GBIF).
"""
import requests

def geocode_zip(zipcode: str, country: str = "US") -> tuple[float | None, float | None]:
    """
    Convert a postal code to latitude and longitude coordinates using OpenStreetMap Nominatim.
    
    Args:
        zipcode (str): The postal code to geocode.
        country (str): The country code (default is "US").
        
    Returns:
        tuple: A tuple containing (latitude, longitude) as floats. Returns (None, None) if not found.
    """
    url = "https://nominatim.openstreetmap.org/search"
    params = {
        "postalcode": zipcode,
        "country": country,
        "format": "json",
        "limit": 1
    }
    headers = {
        "User-Agent": "EcoRadiusAPI/1.0 (admin@ecoradius.api)" # Required by OSM
    }
    response = requests.get(url, params=params, headers=headers)
    if response.status_code == 200:
        data = response.json()
        if data:
            return float(data[0]["lat"]), float(data[0]["lon"])
    return None, None

def get_english_common_name(species_key: int) -> str:
    """
    Fetch the English common name for a given species from the GBIF species endpoint.
    
    Args:
        species_key (int): The unique GBIF identifier for the species.
        
    Returns:
        str: The English vernacular name. Defaults to "Unknown" if not found or on error.
    """
    if not species_key:
        return "Unknown"
    url = f"https://api.gbif.org/v1/species/{species_key}/vernacularNames"
    try:
        resp = requests.get(url, timeout=3)
        if resp.status_code == 200:
            names = resp.json().get("results", [])
            for n in names:
                # Prioritize english
                if n.get("language") == "eng":
                    return n.get("vernacularName").title()
            # Fallback to the first one if we can't find explicitly tagged english
            if names:
                return names[0].get("vernacularName").title()
    except Exception:
        pass
    return "Unknown"

def get_endangered_species(lat: float, lng: float, radius_km: float = 10.0) -> dict:
    """
    Fetch and aggregate occurrences of endangered and critically endangered species 
    from the GBIF database within a specified radius of given coordinates.
    
    Args:
        lat (float): The latitude of the center point.
        lng (float): The longitude of the center point.
        radius_km (float): The search radius in kilometers (default 10.0).
        
    Returns:
        dict: A dictionary containing the aggregated 'species' list and 'total_unique_species',
              or an 'error' key if the API request fails.
    """
    degree_offset = radius_km / 111.0
    min_lat = lat - degree_offset
    max_lat = lat + degree_offset
    min_lng = lng - degree_offset
    max_lng = lng + degree_offset
    
    url = "https://api.gbif.org/v1/occurrence/search"
    params = {
        "decimalLatitude": f"{min_lat},{max_lat}",
        "decimalLongitude": f"{min_lng},{max_lng}",
        "iucnRedListCategory": ["EN", "CR"], # Endangered, Critically Endangered
        "hasCoordinate": "true",
        "limit": 300 # Pulling up to 300 occurrences to aggregate
    }
    
    response = requests.get(url, params=params)
    if response.status_code != 200:
        return {"error": "Failed to fetch data from GBIF database."}
        
    data = response.json()
    results = data.get("results", [])
    
    species_map = {}
    for r in results:
        scientific_name = r.get("species") or r.get("scientificName")
        if not scientific_name:
            continue
            
        if scientific_name not in species_map:
            species_map[scientific_name] = {
                "scientific_name": scientific_name,
                "common_name": r.get("vernacularName", "Unknown"),
                "kingdom": r.get("kingdom", "Unknown"),
                "status": r.get("iucnRedListCategory", "Unknown"),
                "occurrences_found": 1,
                "speciesKey": r.get("speciesKey")
            }
        else:
            species_map[scientific_name]["occurrences_found"] += 1
            # Some occurrence records might be missing the common name, so update it if we find one
            if species_map[scientific_name]["common_name"] == "Unknown" and r.get("vernacularName"):
                species_map[scientific_name]["common_name"] = r.get("vernacularName")
                
    # Attempt to resolve "Unknown" or foreign common names
    for s in species_map.values():
        current_name = s["common_name"]
        # If it's unknown or contains non-ascii characters (like the Russian name you saw)
        if current_name == "Unknown" or not current_name.isascii():
            better_name = get_english_common_name(s.get("speciesKey"))
            if better_name != "Unknown":
                s["common_name"] = better_name
        
        # Remove speciesKey so it doesn't clutter the final JSON output
        s.pop("speciesKey", None)
                
    # Sort by number of occurrences
    sorted_species = sorted(list(species_map.values()), key=lambda x: x["occurrences_found"], reverse=True)
                
    return {"species": sorted_species, "total_unique_species": len(sorted_species)}
