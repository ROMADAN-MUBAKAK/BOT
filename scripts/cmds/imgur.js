const { GoatWrapper } = require("fca-liane-utils");
const axios = require("axios");

module.exports = {
  config: {
    name: "imgur",
    aliases: ["imgur"],
    version: "1.0",
    author: "ArYAN",
    shortDescription: "Upload media to Imgur.",
    longDescription: "Uploads an image or video (via reply) to Imgur and returns the public Imgur link.",
    category: "LINK",
    guide: "{p}imgur (reply to an image or video and gif message)",
  },
  onStart: async function ({ api, event }) {
    try {
      if (!event.messageReply || !event.messageReply.attachments || event.messageReply.attachments.length === 0) {
        api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      }

      const attachment = event.messageReply.attachments[0];
      const mediaUrl = attachment.url;

      
      api.setMessageReaction("⏳", event.messageID, (err) => {}, true);

      
      const response = await axios.post(
        "https://api.imgur.com/3/upload",
        { image: mediaUrl },
        {
          headers: {
            Authorization: "Bearer edd3135472e670b475101491d1b0e489d319940f",
            "Content-Type": "application/json",
          },
        }
      );

      const imgurData = response.data;
      api.setMessageReaction("✅", event.messageID, (err) => {}, true);
      if (!imgurData || !imgurData.data || !imgurData.data.link) {
        api.setMessageReaction("❌", event.messageID, (err) => {}, true);
      }

      const imgurLink = imgurData.data.link;

      
      api.sendMessage(
        `${imgurLink}`,
        event.threadID,
        event.messageID
      );
    } catch (error) {
      console.error("Error uploading to Imgur:", error.message);
      api.setMessageReaction("❌", event.messageID, (err) => {}, true);
    }
  },
};
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });