const { GoatWrapper } = require("fca-liane-utils");
const axios = require("axios");
const fs = require("fs");
const yts = require("yt-search");
const path = require("path");
const cacheDir = path.join(__dirname, "/cache");
const tmp = path.join(__dirname, "/tmp");

module.exports = {
 config: {
 name: "ytb",
 version: "1.2",
 aliases: ["ytb"],
 author: "Team Calyx",
 countDown: 5,
 role: 0,
 description: {
 en: "Search and download video from YouTube with options for audio or video",
 },
 category: "media",
 guide: {
 en: "{pn} [-a] [-v] <search term>: search YouTube and download selected video or audio",
 },
 },

 onStart: async ({ api, args, event }) => {
 if (args.length < 2) {
 return api.sendMessage("❌ Please use the format '/ytb [-a] [-v] <search term>'.", event.threadID, event.messageID);
 }

 const isAudio = args[0] === "-a";
 const isVideo = args[0] === "-v";
 const searchTerm = isAudio || isVideo ? args.slice(1).join(" ") : args.join(" ");

 if (!isAudio && !isVideo) {
 return api.sendMessage("❌ Please specify either '-a' for audio or '-v' for video.", event.threadID, event.messageID);
 }

 try {
 const searchResults = await yts(searchTerm);
 const videos = searchResults.videos.slice(0, 6);

 if (videos.length === 0) {
 return api.sendMessage(`⭕ No results found for: ${searchTerm}`, event.threadID, event.messageID);
 }

 let msg = "";
 videos.forEach((video, index) => {
 msg += `${index + 1}. ${video.title}\nDuration: ${video.timestamp}\nChannel: ${video.author.name}\n\n`;
 });

 api.sendMessage(
 {
 body: msg + "Reply with a number to select.",
 attachment: await Promise.all(videos.map(video => fahimcalyx(video.thumbnail, path.join(tmp, `thumbnail_${video.videoId}.jpg`)))),
 },
 event.threadID,
 (err, info) => {
 global.GoatBot.onReply.set(info.messageID, {
 commandName: "ytb",
 messageID: info.messageID,
 author: event.senderID,
 videos,
 isAudio,
 isVideo
 });
 },
 event.messageID
 );
 } catch (error) {
 console.error(error);
 return api.sendMessage("❌ Failed to search YouTube.", event.threadID, event.messageID);
 }
 },

 onReply: async ({ event, api, Reply }) => {
 await api.unsendMessage(Reply.messageID);
 api.setMessageReaction("⏳", event.messageID, () => {}, true);

 const choice = parseInt(event.body);
 if (isNaN(choice) || choice <= 0 || choice > Reply.videos.length) {
 return api.sendMessage("❌ Please enter a valid number.", event.threadID, event.messageID);
 }

 const selectedVideo = Reply.videos[choice - 1];
 const videoUrl = selectedVideo.url;
 console.log(videoUrl);

 try {
 let downloadUrl;

 // API Endpoint to fetch the download URL based on audio/video type
 const downloadUrlEndpoint = `http://152.42.220.111:25744/youtube?link=${encodeURIComponent(videoUrl)}`;
 const respo = await axios.get(downloadUrlEndpoint);

 // Determine the correct download URL based on flag
 if (Reply.isAudio) {
 downloadUrl = respo.data.download_links.find(link => link.type === "audio")?.audio_url;
 } else if (Reply.isVideo) {
 downloadUrl = respo.data.download_links.find(link => link.type === "video")?.video_url;
 }

 if (!downloadUrl) {
 return api.sendMessage("❌ Could not retrieve a valid file. Please try again with a different selection.", event.threadID, event.messageID);
 }

 console.log("Download URL:", downloadUrl);
 const totalSize = await getTotalSize(downloadUrl);

 const filePath = path.join(cacheDir, `ytb_${Reply.isAudio ? "audio" : "video"}_${selectedVideo.videoId}.${Reply.isAudio ? "mp3" : "mp4"}`);
 await downloadFileParallel(downloadUrl, filePath, totalSize, 5);

 api.setMessageReaction("✅", event.messageID, () => {}, true);
 await api.sendMessage(
 {
 body: `📥 ${Reply.isAudio ? "Audio" : "Video"} download successful:\n• Title: ${selectedVideo.title}\n• Channel: ${selectedVideo.author.name}`,
 attachment: fs.createReadStream(filePath),
 },
 event.threadID,
 () => fs.unlinkSync(filePath),
 event.messageID
 );
 } catch (e) {
 console.error(e);
 return api.sendMessage("❌ Failed to download.", event.threadID, event.messageID);
 }
 },
};

async function fahimcalyx(url, pathName) {
 try {
 const response = await axios.get(url, { responseType: "stream" });
 response.data.pipe(fs.createWriteStream(pathName));
 return new Promise((resolve) => {
 response.data.on("end", () => resolve(fs.createReadStream(pathName)));
 });
 } catch (error) {
 console.error(error);
 return null;
 }
}

async function getTotalSize(url) {
 const response = await axios.head(url);
 return parseInt(response.headers["content-length"], 10);
}

async function downloadFileParallel(url, filePath, totalSize, numChunks) {
 const chunkSize = Math.ceil(totalSize / numChunks);
 const chunks = [];

 async function downloadChunk(url, start, end, index) {
 console.log(`Starting chunk ${index + 1}/${numChunks}: bytes ${start}-${end}`);
 try {
 const response = await axios.get(url, {
 headers: { Range: `bytes=${start}-${end}` },
 responseType: "arraybuffer",
 });
 console.log(`Chunk ${index + 1} downloaded.`);
 return response.data;
 } catch (error) {
 console.error(`Error downloading chunk ${index + 1}:`, error);
 throw error;
 }
 }

 for (let i = 0; i < numChunks; i++) {
 const start = i * chunkSize;
 const end = Math.min(start + chunkSize - 1, totalSize - 1);
 chunks.push(downloadChunk(url, start, end, i));
 }

 try {
 const buffers = await Promise.all(chunks);

 const fileStream = fs.createWriteStream(filePath);
 for (const buffer of buffers) {
 fileStream.write(Buffer.from(buffer));
 }

 await new Promise((resolve, reject) => {
 fileStream.on("finish", resolve);
 fileStream.on("error", reject);
 fileStream.end();
 });

 console.log("Download successful.");
 } catch (error) {
 console.error("Error downloading or writing the file:", error);
 }
}
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });