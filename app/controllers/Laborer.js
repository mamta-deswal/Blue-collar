require("dotenv").config();
const axios = require("axios");
const Labor = require("../models/Laborer");

// Function to get coordinates based on address
async function getCoordinates(address) {
  try {
    const apiKey = process.env.OPENCAGE_API_KEY;
    if (!apiKey) throw new Error("OpenCage API key is missing!");

    const response = await axios.get(
      "https://api.opencagedata.com/geocode/v1/json",
      {
        params: {
          q: address,
          key: apiKey,
          no_annotations: 1,
          limit: 1,
        },
      }
    );

    if (response.status !== 200 || response.data.results.length === 0) {
      throw new Error("Address not found");
    }

    const location = response.data.results[0].geometry;
    return { latitude: location.lat, longitude: location.lng };
  } catch (error) {
    console.error("Error fetching geocoding data:", error.message);
    return null;
  }
}

// Labor Registration API
exports.registerLabor = async (req, res) => {
  try {
    const { name, area, city, pincode, phone, service } = req.body;

    const existingLabor = await Labor.findOne({ phone });
    if (existingLabor) {
      return res
        .status(400)
        .json({ message: "Laborer with this phone number already exists." });
    }

    const address = `${area}, ${city}, ${pincode}`;
    const coordinates = await getCoordinates(address);

    if (!coordinates) {
      return res
        .status(400)
        .json({ message: "Invalid address. Please enter a valid location." });
    }

    const labor = new Labor({
      name,
      area,
      city,
      pincode,
      phone,
      service,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      location: {
        type: "Point",
        coordinates: [coordinates.longitude, coordinates.latitude],
      },
    });

    await labor.save();
    res.status(201).json({ message: "Labor registered successfully!" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Search Laborers API
exports.searchLaborers = async (req, res) => {
  try {
    const { service, area, pincode, city } = req.query;

    if (!service || !area || !pincode || !city) {
      return res
        .status(400)
        .json({ message: "Service, area, pincode, and city are required." });
    }

    const projection = {
      latitude: 0,
      longitude: 0,
    };

    let laborers = await Labor.find(
      { service, area, pincode, city },
      projection
    );
    if (laborers.length > 0) return res.status(200).json(laborers);

    laborers = await Labor.find(
      { service, city, pincode, area: { $ne: area } },
      projection
    );
    if (laborers.length > 0) return res.status(200).json(laborers);

    laborers = await Labor.find(
      { service, city, pincode: { $ne: pincode }, area: { $ne: area } },
      projection
    );
    if (laborers.length > 0) return res.status(200).json(laborers);

    laborers = await Labor.find({ service, city }, projection);
    if (laborers.length > 0) return res.status(200).json(laborers);

    const coordinates = await getCoordinates(`${area}, ${city}, ${pincode}`);
    if (coordinates) {
      laborers = await Labor.find(
        {
          service,
          location: {
            $near: {
              $geometry: {
                type: "Point",
                coordinates: [coordinates.longitude, coordinates.latitude],
              },
              $maxDistance: 5000,
            },
          },
        },
        projection
      );
      if (laborers.length > 0) return res.status(200).json(laborers);
    }

    return res.status(404).json({ message: "No laborers found." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
