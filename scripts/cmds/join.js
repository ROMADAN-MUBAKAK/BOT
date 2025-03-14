module.exports = {
 config: {
 name: "join",
 version: "6.0",
 author: "ArYAN",
 countDown: 5,
 role: 2,
 shortDescription: "List groups and join",
 longDescription: {
 en: "Displays paginated list of group chats with full info and allows joining",
 },
 category: "tools",
 guide: "{p}{n}\nReply a number to join\nReply 'next' or 'prev' to flip pages"
 },

 onStart: async function ({ api, event, usersData }) {
 try {
 const allThreads = await api.getThreadList(500, null, ["INBOX"]);
 const groups = allThreads.filter(thread => thread.isGroup && thread.threadID);

 if (!groups.length) return api.sendMessage("❌ No valid group chats found.", event.threadID);

 const groupList = await Promise.all(groups.map(async (group) => {
 try {
 const info = await api.getThreadInfo(group.threadID);
 const name = info?.name || "Unnamed Group";
 const memberCount = info?.userInfo?.length || 0;
 const adminIDs = info?.adminIDs?.map(a => a.id) || [];

 const admins = await Promise.all(adminIDs.map(async id => {
 try {
 const name = await usersData.getName(id);
 return name || id;
 } catch {
 return id;
 }
 }));

 const approvalMode = info?.approvalMode ? "✅ On" : "❌ Off";
 const emoji = info?.emoji || "🚫 None";
 const color = info?.color || "🚫 None";
 const messageCount = info?.messageCount || "Unknown";

 let creatorName = "Unknown";
 if (adminIDs.length > 0) {
 try {
 const creatorID = adminIDs[0];
 creatorName = await usersData.getName(creatorID);
 } catch { }
 }

 return {
 id: group.threadID,
 name,
 memberCount,
 admins: admins.join(", "),
 approvalMode,
 emoji,
 color,
 creator: creatorName,
 messageCount
 };
 } catch {
 return {
 id: group.threadID,
 name: "Unnamed Group",
 memberCount: 0,
 admins: "N/A",
 approvalMode: "❌ Unknown",
 emoji: "N/A",
 color: "N/A",
 creator: "Unknown",
 messageCount: "Unknown"
 };
 }
 }));

 const perPage = 5;
 const totalPages = Math.ceil(groupList.length / perPage);
 const page = 1;
 const start = (page - 1) * perPage;
 const end = start + perPage;
 const currentGroups = groupList.slice(start, end);

 let msg = `╭─╮\n│𝗚𝗿𝗼𝘂𝗽𝘀 𝗟𝗶𝘀𝘁 (Page ${page}/${totalPages}):\n`;
 currentGroups.forEach((group, index) => {
 msg += `━━${index + 1}. ${group.name}━━\n│♻️ 𝗧𝗜𝗗: ${group.id}\n│👥 𝗠𝗲𝗺𝗯𝗲𝗿𝘀: ${group.memberCount}\n | 👑 𝗔𝗱𝗺𝗶𝗻𝘀: ${group.admins}\n│🛡 𝗔𝗽𝗽𝗿𝗼𝘃𝗮𝗹: ${group.approvalMode}\n│🏷️ 𝗘𝗺𝗼𝗷𝗶: ${group.emoji}\n | 🎨 𝗧𝗵𝗲𝗺𝗲: ${group.color}\n│📨 𝗠𝘀𝗴 𝗰𝗼𝘂𝗻𝘁: ${group.messageCount}\n | ⚙️ 𝗚𝗿𝗼𝘂𝗽 𝗖𝗿𝗲𝗮𝘁𝗼𝗿: ${group.creator}\n\n`;
 });
 msg += `╰─────────────ꔪ\n🔸 Reply a number to join\n🔸 Reply 'next' or 'prev' to flip pages`;

 const sent = await api.sendMessage(msg, event.threadID);
 global.GoatBot.onReply.set(sent.messageID, {
 commandName: "join",
 author: event.senderID,
 groupList,
 page,
 totalPages
 });

 } catch (err) {
 console.error(err);
 return api.sendMessage("❌ Error while fetching group list.", event.threadID);
 }
 },

 onReply: async function ({ api, event, Reply, usersData }) {
 const { author, groupList, page, totalPages } = Reply;
 if (event.senderID !== author) return;

 const input = event.body.trim().toLowerCase();

 if (input === "next" || input === "prev") {
 const newPage = input === "next"
 ? (page + 1 > totalPages ? 1 : page + 1)
 : (page - 1 < 1 ? totalPages : page - 1);

 const start = (newPage - 1) * 5;
 const end = start + 5;
 const currentGroups = groupList.slice(start, end);

 let msg = `╭─╮\n│𝗚𝗿𝗼𝘂𝗽𝘀 𝗟𝗶𝘀𝘁 (Page ${newPage}/${totalPages}):\n`;
 currentGroups.forEach((group, index) => {
 msg += `━━${index + 1}. ${group.name}━━\n│♻️ 𝗧𝗜𝗗: ${group.id}\n│👥 𝗠𝗲𝗺𝗯𝗲𝗿𝘀: ${group.memberCount}\n | 👑 𝗔𝗱𝗺𝗶𝗻𝘀: ${group.admins}\n│🛡 𝗔𝗽𝗽𝗿𝗼𝘃𝗮𝗹: ${group.approvalMode}\n│🏷️ 𝗘𝗺𝗼𝗷𝗶: ${group.emoji}\n | 🎨 𝗧𝗵𝗲𝗺𝗲: ${group.color}\n│📨 𝗠𝘀𝗴 𝗰𝗼𝘂𝗻𝘁: ${group.messageCount}\n | ⚙️ 𝗚𝗿𝗼𝘂𝗽 𝗖𝗿𝗲𝗮𝘁𝗼𝗿: ${group.creator}\n\n`;
 });
 msg += `╰─────────────ꔪ\n🔸 Reply a number to join\n🔸 Reply 'next' or 'prev' to flip pages`;

 const sent = await api.sendMessage(msg, event.threadID);
 global.GoatBot.onReply.set(sent.messageID, {
 commandName: "join",
 author,
 groupList,
 page: newPage,
 totalPages
 });
 return;
 }

 const index = parseInt(input);
 if (!isNaN(index)) {
 const realIndex = (page - 1) * 5 + (index - 1);
 const selectedGroup = groupList[realIndex];

 if (!selectedGroup) return api.sendMessage("❌ Invalid group number.", event.threadID);

 try {
 await api.addUserToGroup(event.senderID, selectedGroup.id);
 return api.sendMessage(`✅ You’ve been added to: ${selectedGroup.name}`, event.threadID);
 } catch (err) {
 return api.sendMessage("❌ Unable to join group. Maybe you're already in or bot lacks permission.", event.threadID);
 }
 }
 }
};