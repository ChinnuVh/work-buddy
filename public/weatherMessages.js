// weatherMessages.js
const weatherMessages = {
  rain: [
    "☔ Don’t forget your umbrella today!",
    "🌧 Rain is here — stay dry and cozy!",
    "💧 A rainy day calls for a warm cup of chai!",
    "🌂 Rain ahead! Make sure you’re prepared.",
    "🌦 Showers outside, productivity inside!",
    "🌧 Rainy days make the best creative days.",
    "☔ Splash through the puddles with joy!",
    "🌧 Rain brings freshness — embrace it.",
    "💦 Time to enjoy the soothing rain sounds.",
    "🌧 Drizzle or downpour, you’re unstoppable.",
  ],
  clear: [
    "☀️ It's a bright and sunny day!",
    "😎 Sunglasses on, sunshine mode activated!",
    "🌞 Perfect weather for a walk outside!",
    "☀️ Clear skies — nothing can stop you today!",
    "🌻 Sun’s out! Let the good vibes roll.",
    "☀️ Bright day, brighter ideas!",
    "🌞 Sunshine is nature’s way of smiling.",
    "😎 A perfect day to shine your best.",
    "🌼 Clear skies for a clear mind.",
    "☀️ Let today’s sunshine boost your energy.",
  ],
  clouds: [
    "☁️ A bit cloudy, but you've got sunshine in you!",
    "🌤 Cloudy outside, but clear in your mind!",
    "⛅ Overcast skies — time to focus indoors.",
    "☁️ Clouds can't hide your bright ideas!",
    "🌥 A calm, cloudy day — perfect for deep work.",
    "⛅ The sky’s gray, but your day doesn’t have to be.",
    "🌤 Cloudy days make sunny ones sweeter.",
    "☁️ Cozy weather for a productive mood.",
    "🌥 Gentle skies bring gentle focus.",
    "⛅ Clouds above, determination below.",
  ],
  thunderstorm: [
    "⛈️ Stormy out there! Stay safe and dry!",
    "⚡ Thunder ahead — be cautious!",
    "🌩 Stormy skies, but calm in your heart.",
    "⛈ A thunderstorm is nature’s rock concert!",
    "🌪 Weather’s wild, but you’ve got this.",
    "⚡ Lightning reminds us of raw power — and so do you.",
    "🌩 Storms pass, strength stays.",
    "⛈ A little thunder, a lot of determination.",
    "⚡ Nature’s energy is in full display.",
    "🌪 Storm or shine, progress is yours.",
  ],
  default: [
    "🌡️ Current temp: {temp}°C",
    "📍 Location check — weather steady.",
    "🌏 Another day, another weather mood.",
    "🌈 Whatever the weather, keep smiling.",
    "🌡 Temperature now: {temp}°C",
    "🌀 Steady conditions — steady focus.",
    "🌍 Weather’s calm — so are you.",
    "☁ A regular day, but your potential is limitless.",
    "🌤 Same skies, new opportunities.",
    "🌡 The temp is {temp}°C — let’s make it count.",
  ],
};

function getRandomWeatherMessage(condition, temp) {
  let key = "default";
  if (condition.includes("rain")) key = "rain";
  else if (condition.includes("clear")) key = "clear";
  else if (condition.includes("cloud")) key = "clouds";
  else if (condition.includes("thunderstorm")) key = "thunderstorm";

  const messages = weatherMessages[key];
  const randomIndex = Math.floor(Math.random() * messages.length);
  return messages[randomIndex].replace("{temp}", temp ?? "N/A");
}

// Export for background.js
if (typeof window === "undefined") {
  module.exports = { getRandomWeatherMessage };
} else {
  window.getRandomWeatherMessage = getRandomWeatherMessage;
}
