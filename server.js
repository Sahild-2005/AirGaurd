console.log("🚀 server.js executing");

import express from "express";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.static("public"));


// ---------- GEO ----------
app.get("/api/geo", async (req, res) => {
  try {
    const city = req.query.city;
    if (!city) return res.status(400).json({ error: "City is required" });

    const url = `http://api.openweathermap.org/geo/1.0/direct?q=${city},IN&limit=1&appid=${process.env.OPENWEATHER_API_KEY}`;
    const response = await axios.get(url);

    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: "Geo failed" });
  }
});


// ---------- AQI ----------
app.get("/api/aqi", async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: "lat & lon required" });
    }

    const url = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHER_API_KEY}`;
    const response = await axios.get(url);

    res.json(response.data);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ error: "AQI failed" });
  }
});


// ---------- TEST ----------
app.get("/api/test", (req, res) => {
  res.send("API working");
});


// ---------- SERVER ----------
app.listen(PORT, () => {
  console.log(`Server running at http://127.0.0.1:${PORT}`);
});
