const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "goat",
  version: "1.0",
  author: "Hridoy",
  countDown: 5,
  role: 0,
  prefix: false,
  description: "Send a random goat image from Google Drive",
  category: "fun"
};

module.exports.onStart = async ({ api, event }) => {
  const threadID = event.threadID;

  const goatImages = [
    "1AwVnhG90YAUW-tNUfExS1X3fHES62V9G",
    "1BR8sukvvFzUwYmzhN-DJv4U8GVeGN91N",
    "1PqSp59uZdkDomwiRROv_U8Ov1wSuOH-Z",
    "1QW-nHKRHR0hhvvtKMZQ31JmBdpP-oZEw",
    "1X06_xF1LaiV3G8NVSfspc3ktGwigE6El",
    "1EXv32uITfo8ynEQKepQVTM9OwsiaJa5m",
    "1KVrMVrbScv597g0fiKd9_4ZM13ZdBZLF",
    "1CPEIOdp70Aw5XT_Mn410UO39sZUz11FS",
    "19CCPTdAD1F1RMP-tOZFyta2Lx6Ry680t",
    "1bWq2v3K41jIMv213FLbfkDzmMGmyWSjx",
    "1STOe9ohjutHASQ_5OEohrStaOJPRrmqf"
  ];

  const randomId = goatImages[Math.floor(Math.random() * goatImages.length)];
  const imageUrl = `https://drive.google.com/uc?export=download&id=${randomId}`;

  try {
    const response = await axios.get(imageUrl, { responseType: "arraybuffer" });

    const tempDir = path.join(__dirname, "../../temp");
    await fs.ensureDir(tempDir);
    const filePath = path.join(tempDir, `goat_${Date.now()}.jpg`);
    await fs.writeFile(filePath, Buffer.from(response.data));

    await api.sendMessage({
      body: "🐐",
      attachment: fs.createReadStream(filePath)
    }, threadID);

    await fs.unlink(filePath);
  } catch (err) {
    console.error("Goat command error:", err);
    api.sendMessage("❌ Failed to fetch goat image.", threadID);
  }
};
