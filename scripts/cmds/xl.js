const { GoatWrapper } = require("fca-liane-utils");
const axios = require('axios');

module.exports = {
 config: {
 name: 'xl',
 version: '1.0',
 role: 0,
 countDown: 5,
 author: 'Team Calyx',
 category: '𝗔𝗜',
 },
 onStart: async ({ event, message, args, usersData }) => {
 const { senderID } = event;
 const isAdmin = global.GoatBot.config.adminBot.includes(senderID);
 const limit = 5;
 const today = new Date().toDateString();
 
 let userData = await usersData.get(senderID);
 if (!userData.data) {
 userData.data = { xlLimit: 0, lastUseDate: today };
 }
 if (userData.data.lastUseDate !== today) {
 userData.data.xlLimit = 0;
 userData.data.lastUseDate = today;
 }
 if (!isAdmin) {
 if (userData.data.xlLimit >= limit) {
 return message.reply("Your image generation limit for today has been reached.");
 }

 userData.data.xlLimit += 1;
 await usersData.set(senderID, userData);
 }

 let prompt = args.join(' ');
 let ratio = "1:1";
 let weight = 0.9;

 if (!prompt) {
 return message.reply("Please provide your prompt first.");
 }

 args.forEach(arg => {
 if (arg.startsWith("--ar=")) {
 ratio = arg.slice(5);
 } else if (arg.startsWith("--weight=")) {
 weight = parseFloat(arg.slice(9));
 }
 });

 const endpoint = `/gen?prompt=${encodeURIComponent(prompt)}&ratio=${ratio}&weight=${weight}`;

 try {
 await message.reply("Generating... Please wait...");
 message.reaction('⏳', event.messageID);
 
 const response = await axios.get(`https://xl-v10.onrender.com${endpoint}`);

 const imageURL = response.data.imageUrl;
 
 const remainingUses = isAdmin ? 'Admins have unlimited uses.' : `You have ${limit - userData.data.xlLimit} uses left for today.`;

 message.reply({ 
 body: `XL_V10\n${remainingUses}`, 
 attachment: await utils.getStreamFromURL(imageURL, "image.jpg")
 });
 message.reaction('✅', event.messageID);
 } catch (err) {
 message.reaction('❌', event.messageID);
 message.reply(`❌ Error: ${err.message}`);
 }
 }
};
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });