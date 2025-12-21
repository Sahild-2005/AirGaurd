const map = L.map("map").setView([22.9734 , 78.6569], 5);  // India Center 

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom:18,
}).addTo(map);

let marker; // to store current city marker


const searchBtn =  document.getElementById("searchBtn");

const cityInput = document.getElementById("cityInput");
searchBtn.addEventListener("click" , searchCity);

async function searchCity() {
    const city = cityInput.value.trim();
    if (!city) {
        alert("Please enter a city name");
        return;
    }

    try {
        // 1️1. Get geo location
        const geoRes = await fetch(`/api/geo?city=${city}`);
        const geoData = await geoRes.json();

        if (!geoData || geoData.length === 0) {
            alert("City not found in India");
            return;
        }

        const { lat, lon, name } = geoData[0];
        map.setView([lat, lon], 11);

        // 2️. Get AQI data
        const aqiRes = await fetch(`/api/aqi?lat=${lat}&lon=${lon}`);
        const aqiData = await aqiRes.json();
        const aqiInfo = aqiData.list[0];

        const aqi = aqiInfo.main.aqi;
        const pm25 = aqiInfo.components.pm2_5;

        // 3️ Show details panel
        document.getElementById("details").classList.remove("hidden");

        document.getElementById("cityName").innerText = name;
        document.getElementById("aqiIndex").innerText = aqi;
        document.getElementById("pm25").innerText = pm25.toFixed(1);

        // 4️ Cigarette equivalent (WHO approx)
        const cigarettes = (pm25 / 22).toFixed(1);
        document.getElementById("cigs").innerText = cigarettes;

        // 5️ AQI category + color
        const badge = document.getElementById("aqiBadge");
        const category = document.getElementById("aqiCategory");

        badge.className = "aqi-badge"; // reset

        if (aqi === 1) {
            category.innerText = "Good 😊";
            badge.classList.add("good");
        } else if (aqi === 2) {
            category.innerText = "Moderate 😐";
            badge.classList.add("moderate");
        } else if (aqi === 3) {
            category.innerText = "Poor 😷";
            badge.classList.add("poor");
        } else if (aqi === 4) {
            category.innerText = "Unhealthy 🤒";
            badge.classList.add("unhealthy");
        } else {
            category.innerText = "Severe ☠️";
            badge.classList.add("severe");
        }

        // 6️ Pollutants list
        const pollutants = aqiInfo.components;
        const list = document.getElementById("pollutantList");
        list.innerHTML = "";

        for (const key in pollutants) {
            const li = document.createElement("li");
            li.innerText = `${key.toUpperCase()}: ${pollutants[key]}`;
            list.appendChild(li);
        }

        // 7️ Map marker
        L.marker([lat, lon])
            .addTo(map)
            .bindPopup(`<b>${name}</b><br>AQI: ${aqi}`)
            .openPopup();

        console.log("AQI rendered successfully");

    } catch (error) {
        console.error("Search Failed:", error);
        alert("Failed to fetch AQI data");
    }
}
