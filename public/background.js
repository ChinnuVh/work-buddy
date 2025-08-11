const API_KEY = "f7abd39c0ccb170e0ac87d2236da4793";
const CITY = "Kochi";

function getClosestGreeting(hour, minute, greetingsData) {
  const currentMinutes = hour * 60 + minute;
  const availableTimes = Object.keys(greetingsData)
    .map((key) => {
      const [h, m] = key.split(":").map(Number);
      return { key, totalMinutes: h * 60 + m };
    })
    .filter((entry) => entry.totalMinutes <= currentMinutes)
    .sort((a, b) => b.totalMinutes - a.totalMinutes);

  if (availableTimes.length === 0) return null;

  const closestKey = availableTimes[0].key;
  const messages = greetingsData[closestKey] || [];
  if (messages.length === 0) return null;

  return messages[Math.floor(Math.random() * messages.length)];
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
    const condition = data.weather?.[0]?.main?.toLowerCase() || "";
    const temp = data.main?.temp ?? null;
    return { condition, temp };
  } catch (err) {
    console.error("Weather fetch error:", err);
    return null;
  }
}

async function getRandomWeatherMessage(condition, temp) {
  const resWeather = await fetch(chrome.runtime.getURL("weatherMessages.json"));
  const weatherMessages = await resWeather.json();

  let key = "default";
  if (condition.includes("rain")) key = "rain";
  else if (condition.includes("clear")) key = "clear";
  else if (condition.includes("cloud")) key = "clouds";
  else if (condition.includes("thunderstorm")) key = "thunderstorm";

  const messages = weatherMessages[key] || weatherMessages.default;
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex].replace("{temp}", temp ?? "N/A");
}

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
    greeting = messages[Math.floor(Math.random() * messages.length)];
    hasExactGreeting = true;
  }

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
          weatherText = await getRandomWeatherMessage(
            weather.condition,
            weather.temp
          );
        } else {
          weatherText = `🌡️ Current temp: ${weather?.temp ?? "N/A"}°C`;
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

// Setup alarms
chrome.runtime.onStartup.addListener(() => {
  chrome.alarms.create("minuteCheck", { periodInMinutes: 1 });
  chrome.alarms.create("hourlyWeather", { periodInMinutes: 60 });
  checkAndNotifyGreeting(true);
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("minuteCheck", { periodInMinutes: 1 });
  chrome.alarms.create("hourlyWeather", { periodInMinutes: 60 });
  checkAndNotifyGreeting(true);
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "minuteCheck") {
    checkAndNotifyGreeting();
  } else if (alarm.name === "hourlyWeather") {
    checkWeatherUpdateHourly();
  }
});
