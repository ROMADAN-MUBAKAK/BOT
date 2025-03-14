const { GoatWrapper } = require("fca-liane-utils");
const axios = require('axios');
const fs = require("fs-extra");
const path = require('path');

module.exports = {
    config: {
        name: "gen",
        version: "1.0",
        author: "Team Calyx",
        category: "𝗔𝗜",
        countDown: 40,
        shortDescription: "Generate an image",
        longDescription: "Generates an image based on the provided prompt.",
        guide: "{pn} <prompt>",
    },

    onStart: async function ({ event, message, args }) {
        if (args.length === 0) {
            return message.reply("Please provide a prompt. Usage: -gen <prompt>");
        }

        const prompt = args.join(" ");

        try {
            const apiUrl = await getApiUrl();
            if(!apiUrl){
              return message.reply("❌ Failed to fetch API URL.");
            }
            const genUrl = `${apiUrl}/gen?prompt=${encodeURIComponent(prompt)}`;
            const response = await axios.get(genUrl, { responseType: 'arraybuffer' });

            const imagePath = path.join(__dirname, 'tmp', `generated_${Date.now()}.jpg`);
            fs.writeFileSync(imagePath, Buffer.from(response.data, 'binary'));

            const imageStream = fs.createReadStream(imagePath);
            message.reply({ attachment: imageStream }, () => {
                fs.unlinkSync(imagePath);
            });

        } catch (error) {
            console.error("Error fetching the image:", error);
            message.reply("❌ Failed to generate image. Please try again later.");
        }
    }
};

async function getApiUrl() {
    try {
        const response = await axios.get("https://raw.githubusercontent.com/Savage-Army/extras/refs/heads/main/api.json");
        return response.data.api;
    } catch (error) {
        console.error("Error fetching API URL:", error);
        return null;
    }
}
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });