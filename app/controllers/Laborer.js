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

exports.registerLabor = async (req, res) => {
  try {
    const { name, fullAddress, phone, service } = req.body;

    if (!name || !fullAddress || !phone || !service) {
      return res.status(400).json({ message: "All fields are required." });
    }

    const existingLabor = await Labor.findOne({ phone });
    if (existingLabor) {
      return res
        .status(400)
        .json({ message: "Laborer with this phone number already exists." });
    }

    const coordinates = await getCoordinates(fullAddress);

    if (!coordinates) {
      return res
        .status(400)
        .json({ message: "Invalid address. Please enter a valid location." });
    }

    const labor = new Labor({
      name,
      fullAddress,
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

exports.searchLaborers = async (req, res) => {
  try {
    const { service, fullAddress } = req.query;

    if (!service) {
      return res.status(400).json({ message: "Service is required." });
    }

    const projection = { latitude: 0, longitude: 0 };
    let query = { service };

    if (!fullAddress || fullAddress.trim() === "") {
      const laborers = await Labor.find(query, projection);
      return laborers.length
        ? res.status(200).json(laborers)
        : res.status(404).json({ message: "No laborers found." });
    }

    if (fullAddress && fullAddress.length > 0) {
      const coordinates = await getCoordinates(fullAddress);
      if (coordinates) {
        const laborers = await Labor.find(
          {
            service,
            location: {
              $near: {
                $geometry: {
                  type: "Point",
                  coordinates: [coordinates.longitude, coordinates.latitude],
                },
                $maxDistance: 10000,
              },
            },
          },
          projection
        );
        return laborers.length
          ? res.status(200).json(laborers)
          : res.status(404).json({ message: "No laborers found." });
      } else {
        return res.status(400).json({ message: "Invalid address provided." });
      }
    } else {
      query.fullAddress = { $regex: new RegExp(fullAddress, "i") };
      const laborers = await Labor.find(query, projection);
      return laborers.length
        ? res.status(200).json(laborers)
        : res.status(404).json({ message: "No laborers found." });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};