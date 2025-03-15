const { GoatWrapper } = require("fca-liane-utils");
const axios = require('axios');
const jimp = require("jimp");
const fs = require("fs");

module.exports = {
    config: {
        name: "myfd",
        version: "1.0",
        author: "Arafat",
        countDown: 5,
        role: 0,
        shortDescription: "Purpose Your Beb",
        longDescription: "Purpose Your Beb",
        category: "LOVE",
        guide: {
            vi: "{pn} @tag ",
            en: "{pn} @tag "
        }
    },
    onStart: async function ({ message, args, event, api }) {
        const mention = Object.keys(event.mentions);
        if (mention.length == 0) return message.reply("🔄 LOADING...[█▒▒▒▒▒▒▒▒▒]													mention plz your best friend...𓃵");
        else if (mention.length == 1) {
            const one = event.senderID, two = mention[0];
            bal(one, two).then(ptth => { message.reply({ body: "Please Babe Accept My Love </100%", attachment: fs.createReadStream(ptth) }) })
        } else {
            const one = mention[1], two = mention[0];
            bal(one, two).then(ptth => { message.reply({ body: "Please Babe Accept My Love </100%", attachment: fs.createReadStream(ptth) }) })
        }
    }
};

async function bal(one, two) {
    const avone = await jimp.read(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
    avone.circle();
    const avtwo = await jimp.read(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
    avtwo.circle();
    const pth = "abcd.jpg";
    const img = await jimp.read("https://i.imgur.com/d4wpmT5.jpeg");
    img.resize(1000, 560).composite(avone.resize(268, 280), 108, 155).composite(avtwo.resize(258, 275), 627, 155);
    await img.writeAsync(pth);
    return pth;
              }
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });