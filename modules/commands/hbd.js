const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports.config = {
  name: "hbd",
  version: "1.0",
  author: "Hridoy",
  countDown: 10,
  role: 0,
  prefix: false,
  description: "Send Breaking Bad Jesse gift scene",
  category: "media"
};

module.exports.onStart = async ({ api, event }) => {
  const threadID = event.threadID;
  const videoId = "11XzPicMYnSiWAFBG80NO90Imx_tbAu_h";
  const videoUrl = `https://drive.google.com/uc?export=download&id=${videoId}`;

  try {
    const response = await axios.get(videoUrl, { responseType: "arraybuffer" });

    const tempDir = path.join(__dirname, "../../temp");
    await fs.ensureDir(tempDir);
    const filePath = path.join(tempDir, `hbd_${Date.now()}.mp4`);
    await fs.writeFile(filePath, Buffer.from(response.data));

    await api.sendMessage({
      body: "🎬",
      attachment: fs.createReadStream(filePath)
    }, threadID);

    await fs.unlink(filePath);
  } catch (err) {
    console.error("hbd command error:", err);
    api.sendMessage("❌ Failed to fetch or send the video.", threadID);
  }
};
