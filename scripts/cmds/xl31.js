const { GoatWrapper } = require("fca-liane-utils");
const axios = require('axios');
const fs = require('fs');

module.exports = {
  config: {
    name: "xl31",
    version: "1.2",
    author: "ArYAN",
    countDown: 0,
    role: 0,
    category: "media",
    guide: {
      en: "{p}xl31 <prompt> [--ar=<aspect_ratio>] or [--ar <aspect_ratio>]"
    }
  },

  onStart: async function({ message, args, api, event }) {
    try {
      const input = args.join(" ");
      const arMatch = input.match(/--ar[=\s]?([\d:]+)/);
      const prompt = arMatch ? input.replace(arMatch[0], "").trim() : input;
      const ar = arMatch ? arMatch[1] : "1:1";

      if (!prompt) {
        return message.reply("Please provide some prompts.");
      }

      if (ar && !/^\d+:\d+$/.test(ar)) {
        return message.reply("Invalid aspect ratio format. Use --ar=<width>:<height> or --ar <width>:<height> (e.g., --ar=2:3 or --ar 2:3).");
      }

      api.setMessageReaction("⏰", event.messageID, () => {}, true);

      const baseURL = `https://aryanchauhanapi2.onrender.com/api/animagen31`;
      const params = { prompt, ar }; 

      const response = await axios.get(baseURL, {
        params: params,
        responseType: 'stream'
      });

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      const fileName = 'xl.png';
      const filePath = `/tmp/${fileName}`;
      const writerStream = fs.createWriteStream(filePath);

      response.data.pipe(writerStream);

      writerStream.on('finish', function() {
        message.reply({
          body: "",
          attachment: fs.createReadStream(filePath)
        });
      });

      writerStream.on('error', function(err) {
        console.error('Error writing file:', err);
        message.reply("❌ Failed to process the file.");
      });

    } catch (error) {
      console.error('Error generating image:', error);
      message.reply("❌ Failed to generate the image.");
    }
  }
};
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });