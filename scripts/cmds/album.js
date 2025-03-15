const { GoatWrapper } = require("fca-liane-utils");
const axios = require("axios");

module.exports = {
  config: {
    name: "album",
    version: "2.2",
    role: 0,
    author: "Nyx",
    description: "Advanced Album System",
    category: "MEDIA",
    countDown: 5,
    guide: { en: "{p}album [add/list] [category]" }
  },
  
  onStart: async function({ api, event, args }) {
    try {
      const axiosCategoryData = await axios.get("https://nyx-hub.vercel.app/category");
      const serverCategories = axiosCategoryData.data;
      
      const command = args[0]?.toLowerCase();
      if (command === 'category') {
  return api.sendMessage(JSON.stringify(serverCategories, null, 2), event.threadID, event.messageID);
}
      if (command === "add") {
        if (!event.messageReply?.attachments?.[0]?.url) {
          return api.sendMessage("❌ Reply to a media file!", event.threadID, event.messageID);
        }
        
        const categoryInput = args[1]?.toLowerCase();
        const categoryKey = Object.keys(serverCategories).find(key => key.toLowerCase() === categoryInput);
        
        if (!categoryKey) return api.sendMessage("❌ Invalid category!", event.threadID, event.messageID);
        
        try {
          const mediaUrl = event.messageReply.attachments[0].url;
          const tinyUrlResponse = await axios.get(`https://tinyurl.com/api-create.php?url=${mediaUrl}`);
          const tinyUrl = tinyUrlResponse.data;
          const apiResponse = await axios.get(`https://nyx-hub.vercel.app/album-add?url=${encodeURIComponent(tinyUrl)}&category=${categoryKey}`);
          
          api.sendMessage(`✅ ${apiResponse.data}`, event.threadID, event.messageID);
        } catch (error) {
          api.sendMessage(`❌ Upload failed: ${error.message}`, event.threadID, event.messageID);
        }
        return;
      }
      
      if (command === "list") {
        const categoryInput = args[1]?.toLowerCase();
        const listRes = await axios.get(`https://nyx-hub.vercel.app/album-list`);
        
        if (!categoryInput) {
          const formattedList = listRes.data
            .map(cat => `📂 ${cat.category} (${cat.total_videos} videos)`)
            .join("\n");
          return api.sendMessage(`📁 All Categories:\n\n${formattedList}`, event.threadID, event.messageID);
        }
        
        const categoryKey = Object.keys(serverCategories).find(key => key.toLowerCase() === categoryInput);
        if (!categoryKey) return api.sendMessage("❌ Invalid category!", event.threadID, event.messageID);
        
        const categoryData = listRes.data.find(item => item.category === serverCategories[categoryKey]);
        api.sendMessage(
          `📝 ${serverCategories[categoryKey]} Videos:\n` +
          (categoryData?.video_numbers?.join(", ") || "No videos found"),
          event.threadID,
          event.messageID
        );
        return;
      }
      
      const response = await axios.get(`https://nyx-hub.vercel.app/album-list`);
      const categories = response.data;
      const message = 
			"╭━[𝚈𝙾𝚄𝚁 𝚅𝙾𝙳𝚁𝙾 𝙰𝙻𝙱𝚄𝙼 𝙻𝙸𝚂𝚃]━☻┣‣ Available Categories:\n┣━━━━━━━━✘━━━━━━━━━━☺︎︎︎︎\n" +
        categories.map((cat, index) => `┣‣${index + 1}: ${cat.category}=[${cat.total_videos}]`).join("\n") +
        "\n┣━━━━━━━━✘━━━━━━━━━━☺︎︎ \n┣‣⚙️ Reply number select		╰━━━━━━━━✘━━━━━━━━━━☺︎︎";
      
      await api.sendMessage(message, event.threadID, (error, info) => {
        global.GoatBot.onReply.set(info.messageID, {
          commandName: this.config.name,
          messageID: info.messageID,
          author: event.senderID,
          categories: categories
        });
      }, event.messageID);
    } catch (error) {
      api.sendMessage(`❌ Error: ${error.message}`, event.threadID, event.messageID);
    }
  },
  
  onReply: async function({ api, event, Reply }) {
    try {
      if (event.senderID !== Reply.author) return;
      
      const selected = parseInt(event.body);
      if (isNaN(selected)) return api.sendMessage("❌ Invalid number!", event.threadID, event.messageID);
      
      const selectedCategory = Reply.categories[selected - 1];
      const axiosCategoryData = await axios.get("https://nyx-hub.vercel.app/category");
      const serverCategories = axiosCategoryData.data;
      
      const categoryKey = Object.keys(serverCategories).find(key => serverCategories[key] === selectedCategory.category);
      if (!categoryKey) return api.sendMessage("❌ Category expired!", event.threadID, event.messageID);
      
      const videoRes = await axios.get(`https://nyx-hub.vercel.app/album?category=${encodeURIComponent(categoryKey)}`);
      
      api.unsendMessage(Reply.messageID); 
      api.sendMessage(
        {
          body: ` ☻━─[ 𝚈𝙾𝚄𝚁 𝚅𝙾𝙳𝚁𝙾 𝙱☺︎︎𝚃  ]─━☻			🈷:𝘗𝘳𝘰𝘮𝘰𝘵𝘪𝘯𝘨ト━𓆩${videoRes.data.category}𓆪\n📜:𝘝𝘪𝘥𝘦𝘰 𝘓𝘪𝘴𝘵ト‌‍‌━𓆩${videoRes.data.number}𓆪`,
          attachment: await global.utils.getStreamFromURL(videoRes.data.url)
        },
        event.threadID,
        event.messageID
      );
    } catch (error) {
      api.sendMessage(`❌ Error: ${error.message}`, event.threadID, event.messageID);
    }
  }
};
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
