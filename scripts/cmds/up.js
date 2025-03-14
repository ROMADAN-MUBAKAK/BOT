const { GoatWrapper } = require("fca-liane-utils");
module.exports = {
  config: {
    name: "up",
    aliases: ["up", "upt"],
    version: "1.0",
    author: "ArYan",
    role: 0,
    shortDescription: {
      en: "Displays the uptime of the bot."
    },
    longDescription: {
      en: "Displays the amount of time that the bot has been running for."
    },
    category: "System",
    guide: {
      en: "Use {p}uptime to display the uptime of the bot."
    }
  },
  onStart: async function ({ api, event, args }) {
    const uptime = process.uptime();
    const seconds = Math.floor(uptime % 60);
    const minutes = Math.floor((uptime / 60) % 60);
    const hours = Math.floor((uptime / (60 * 60)) % 24);
    const days = Math.floor(uptime / (60 * 60 * 24));
    const uptimeString = `𝗛𝗼𝘂𝗿𝘀 ${hours}\n├─⏱️𝗠𝗶𝗻𝘂𝘁𝗲𝘀 ${minutes}\n├─⌚𝗦𝗲𝗰𝗼𝗻𝗱 ${seconds}\n╰───────────✰`;
    api.sendMessage(`╭─────✰\n│  『 𝗨𝗣𝗧𝗜𝗠𝗘 』  \n├❁𝙷𝙴𝙻𝙻𝙾 𝙴𝚅𝙴𝚁𝚈𝙾𝙽𝙴\n│\n├─⏰${uptimeString}`, event.threadID);
  }
}

const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });