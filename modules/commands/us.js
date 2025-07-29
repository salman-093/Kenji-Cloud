const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "us?",
  version: "1.0",
  author: "Hridoy",
  countDown: 10,
  role: 0,
  prefix: false,
  description: "Sends a video with",
  category: "media"
};

module.exports.onStart = async ({ api, event }) => {
  const threadID = event.threadID;
  const videoId = "1lh8vrPRL0t3S1MsTheaNaoXBo09-ko9z";
  const videoUrl = `https://drive.google.com/uc?export=download&id=${videoId}`;

  try {
    const response = await axios.get(videoUrl, { responseType: "arraybuffer" });

    const tempDir = path.join(__dirname, "../../temp");
    await fs.ensureDir(tempDir);
    const filePath = path.join(tempDir, `us_${Date.now()}.mp4`);
    await fs.writeFile(filePath, Buffer.from(response.data));

    await api.sendMessage({
      body: "?🙂",
      attachment: fs.createReadStream(filePath)
    }, threadID);

    await fs.unlink(filePath);
  } catch (err) {
    console.error("us? command error:", err);
    api.sendMessage("❌ Failed to send the video.", threadID);
  }
};
