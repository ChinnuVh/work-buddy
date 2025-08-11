const API_KEY = "1606e3b595669aeb0cd09662a4c195d7"; // <-- Add your OpenWeatherMap API key here
const CITY = "Kochi"; // Or any city you like

function getClosestGreeting(hour, minute, greetingsData) {
  const currentMinutes = hour * 60 + minute;
  const availableTimes = Object.keys(greetingsData)
    .map((key) => {
      const [h, m] = key.split(":").map(Number);
      return { key, totalMinutes: h * 60 + m };
    })
    .filter((entry) => entry.totalMinutes <= currentMinutes)
    .sort((a, b) => b.totalMinutes - a.totalMinutes); // sort descending

  if (availableTimes.length === 0) return null;

  const closestKey = availableTimes[0].key;
  const messages = greetingsData[closestKey] || [];
  if (messages.length === 0) return null;

  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex];
}

function showNotification(message) {
  chrome.notifications.create({
    type: "basic",
    iconUrl: "icon.png",
    title: "Work Buddy",
    message: message,
    priority: 2,
  });
}

async function fetchWeatherCondition() {
  try {
    const res = await fetch(
      `https://api.openweathermap.org/data/2.5/weather?q=${CITY}&appid=${API_KEY}&units=metric`
    );
    const data = await res.json();
    const condition = data.weather?.[0]?.main?.toLowerCase();
    const temp = data.main?.temp;
    return { condition, temp };
  } catch (err) {
    console.error("Weather fetch error:", err);
    return null;
  }
}

// ⏰ Main function
async function checkAndNotifyGreeting(forceNotify = false) {
  const now = new Date();
  const hour = now.getHours();
  const minute = now.getMinutes();
  const key = `${hour}:${minute}`;

  const res = await fetch(chrome.runtime.getURL("greetings.json"));
  const greetingsData = await res.json();

  let greeting = null;
  let hasExactGreeting = false;

  if (greetingsData[key]) {
    const messages = greetingsData[key];
    const randomIndex = Math.floor(Math.random() * messages.length);
    greeting = messages[randomIndex];
    hasExactGreeting = true;
  }

  // fallback
  if (!greeting) {
    greeting = getClosestGreeting(hour, minute, greetingsData);
  }

  if (!greeting) {
    greeting = "👋 Hello! Hope you have a great day!";
  }

  chrome.storage.local.get(["lastNotifiedTime"], async (data) => {
    const alreadyNotified = data?.lastNotifiedTime === key;

    if ((hasExactGreeting && !alreadyNotified) || forceNotify) {
      chrome.storage.local.set({ lastNotifiedTime: key }, async () => {
        const weather = await fetchWeatherCondition();
        let weatherText = "";

        if (weather && weather.condition) {
          if (weather.condition.includes("rain")) {
            weatherText = "☔ Don’t forget your umbrella today!";
          } else if (weather.condition.includes("clear")) {
            weatherText = "☀️ It's a bright and sunny day!";
          } else if (weather.condition.includes("cloud")) {
            weatherText = "☁️ A bit cloudy, but you've got sunshine in you!";
          } else if (weather.condition.includes("thunderstorm")) {
            weatherText = "⛈️ Stormy out there! Stay safe and dry!";
          } else {
            weatherText = `🌡️ Current temp: ${weather.temp}°C`;
          }
        } else {
          weatherText = weather ? `🌡️ Current temp: ${weather.temp}°C` : "";
        }

        const finalMessage = `${greeting} ${weatherText}`;
        showNotification(finalMessage);
      });
    }
  });
}

async function checkWeatherUpdateHourly() {
  const weather = await fetchWeatherCondition();
  if (!weather) return;

  const current = {
    condition: weather.condition,
    temp: weather.temp,
  };

  chrome.storage.local.get(["lastWeather"], (data) => {
    const previous = data.lastWeather;
    let message = null;

    if (previous) {
      const tempDiff = Math.abs(previous.temp - current.temp);
      if (previous.condition !== current.condition) {
        message = `🌦️ Weather Alert: Changed from ${previous.condition} to ${current.condition}`;
      } else if (tempDiff >= 3) {
        message = `🌡️ Temp changed significantly: Now ${current.temp}°C (was ${previous.temp}°C)`;
      }
    } else {
      message = `🌍 Weather Update: ${current.condition}, ${current.temp}°C`;
    }

    if (message) showNotification(message);

    chrome.storage.local.set({ lastWeather: current });
  });
}

// 🛠️ Setup alarms
chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create("minuteCheck", { periodInMinutes: 1 }); // greeting
  chrome.alarms.create("hourlyWeather", { periodInMinutes: 60 }); // weather

  checkAndNotifyGreeting(true); // ✅ Force greeting on startup
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("minuteCheck", { periodInMinutes: 1 });
  chrome.alarms.create("hourlyWeather", { periodInMinutes: 60 });

  checkAndNotifyGreeting(true); // ✅ Force greeting on install
});

// ⏰ Alarm events
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "minuteCheck") {
    checkAndNotifyGreeting(); // Only notify if exact match
  } else if (alarm.name === "hourlyWeather") {
    checkWeatherUpdateHourly();
  }
});
