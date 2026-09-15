// Run this script locally by replacing 'YOUR_API_KEY_HERE' with your actual Gemini API key
// Command: node check_gemini_models.js

const API_KEY = "YOUR_API_KEY_HERE"; // <-- এখানে আপনার API Key দিন

async function checkModels() {
  if (API_KEY === "YOUR_API_KEY_HERE") {
    console.log("Please replace 'YOUR_API_KEY_HERE' with your actual API key first!");
    return;
  }

  try {
    console.log("Fetching available models for your API key...");
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
    const data = await response.json();
    
    if (data.error) {
      console.error("API Error:", data.error.message);
      return;
    }

    const modelNames = data.models
      .filter(m => m.supportedGenerationMethods.includes("generateContent"))
      .map(m => m.name.replace("models/", ""));
      
    console.log("\n✅ Models supported by your API key for generateContent:\n");
    modelNames.forEach(name => console.log("- " + name));
    console.log("\n");
  } catch (err) {
    console.error("Fetch Error:", err.message);
  }
}

checkModels();
