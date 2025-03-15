const { GoatWrapper } = require("fca-liane-utils");
const axios = require('axios');

const BASE_URL = 'https://quixapii.onrender.com/api';

module.exports = {
  config: {
    name: "quiz",
    aliases: ["qz"],
    version: "0.0.1",
    author: "ArYAN",
    countDown: 0,
    role: 0,
    longDescription: { 
      en: "Play quiz game in multiple categories with enhanced features" 
    },
    category: "game",
    guide: {
      en: "{pn} <category> - Play quiz\n{pn} rank - View detailed rank\n{pn} top - View global leaderboard\n{pn} categories - List all categories\n{pn} torf - Play True/False quiz"
    }
  },

  langs: {
    en: {
      reply: "🎯 𝗤𝘂𝗶𝘇\n━━━━━━━━━━━━━\n\n📚 𝖢𝖺𝗍𝖾𝗀𝗈𝗋𝗒: {category}\n❓ 𝗤𝘂𝗲𝘀𝘁𝗶𝗼𝗻: {question}\n\n{options}\n\n⏰ 𝖸𝗈𝗎 𝗁𝖺𝗏𝖾 30 𝗌𝖾𝖼𝗈𝗇𝖽𝗌 𝗍𝗈 𝖺𝗆𝗌𝗐𝖾𝗋 𝗋𝖾𝗉𝗅𝗒 𝗐𝗂𝗍𝗁 (A/B/C/D):",
      torfReply: "⚙ 𝗤𝘂𝗶𝘇 ( True/False )\n━━━━━━━━━━━━━\n\n❓ 𝗤𝘂𝗲𝘀𝘁𝗶𝗼𝗻: {question}\n\n😆: True\n😮: False",
      correctMessage: "🎯 𝗤𝘂𝗶𝘇\n━━━━━━━━━━━━━\n\n🎉 𝖢𝗈𝗋𝗋𝖾𝖼𝗍 𝖠𝗇𝗌𝗐𝖾𝗋!\n✅ 𝖲𝖼𝗈𝗋𝖾: {correct}/{total}\n🏆 𝖱𝖺𝗇𝗄: {position}\n🔥 𝖲𝗍𝗋𝖾𝖺𝗄: {streak}",
      wrongMessage: "🎯 𝗤𝘂𝗶𝘇\n━━━━━━━━━━━━━\n\n❌ 𝖮𝗉𝗌 𝗐𝗋𝗈𝗇𝗀 𝖺𝗇𝗌𝗐𝖾𝗋!\n𝖢𝗈𝗋𝗋𝖾𝖼𝗍 𝖺𝗇𝗌𝗐𝖾𝗋 𝗂𝗌: {correctAnswer}\n📊 𝖲𝖼𝗈𝗋𝖾: {correct}/{total}",
      timeoutMessage: "⏰ 𝖳𝗂𝗆𝖾'𝗌 𝗎𝗉! 𝖳𝗁𝖾 𝖼𝗈𝗋𝗋𝖾𝖼𝗍 𝖺𝗇𝗌𝗐𝖾𝗋 𝗐𝖺𝗌: {correctAnswer}"
    }
  },

  onStart: async function ({ message, event, args, commandName, getLang, api, usersData }) {
    try {
      const command = args[0]?.toLowerCase();

      switch (command) {
        case "rank":
          return await this.handleRank(message, event, getLang, api);
        case "leaderboard":
          return await this.handleLeaderboard(message, getLang);
        case "categories":
          return await this.handleCategories(message, getLang);
        case "torf":
          return await this.handleTrueOrFalse(message, event, commandName, api);
        default:
          return await this.handleQuiz(message, event, args, commandName, getLang, api, usersData);
      }
    } catch (err) {
      console.error("Quiz start error:", err);
      return message.reply("⚠️ Error occurred, try again.");
    }
  },

  async handleRank(message, event, getLang, api) {
    try {
      const res = await axios.get(`${BASE_URL}/leaderboards`);
      const user = res.data.rankings.find(u => u.userId === event.senderID);
      const position = res.data.rankings.findIndex(u => u.userId === event.senderID) + 1;
      
      if (!user) {
        return message.reply("❌ You haven't played any quiz yet!");
      }

      const userInfo = await api.getUserInfo(event.senderID);
      const userName = userInfo[event.senderID].name;
      const accuracy = Math.round((user.correct / (user.total || 1)) * 100);
      const daysActive = Math.ceil((new Date() - new Date(user.firstQuizDate)) / (1000 * 60 * 60 * 24));

      const rankTitle = user.correct >= 50 ? "Quiz Champion 👑" : 
                       user.correct >= 25 ? "Quiz Master 🎓" :
                       user.correct >= 10 ? "Quiz Pro ⭐" : "Novice 🌟";

      return message.reply(
        `📊 𝗤𝘂𝗶𝘇 𝗥𝗮𝗻𝗸\n━━━━━━━━━━━━━\n\n` +
        `👤 ${userName}\n` +
        `🏆 𝖦𝗅𝗈𝖻𝖺𝗅 𝖯𝗈𝗌𝗂𝗍𝗂𝗈𝗇: ${position}\n` +
        `💫 𝖱𝖺𝗇𝗄: ${rankTitle}\n` +
        `✅ 𝖢𝗈𝗋𝗋𝖾𝖼𝗍: ${user.correct}\n` +
        `❌ 𝖶𝗋𝗈𝗇𝗀: ${user.wrong}\n` +
        `📝 𝖳𝗈𝗍𝖺𝗅 𝖯𝗅𝖺𝗒𝖾𝖽: ${user.total}\n` +
        `📈 𝖠𝖼𝖼𝗎𝗋𝖺𝖼𝗒: ${accuracy}%\n` +
        `🔥 𝖢𝗎𝗋𝗋𝖾𝗇𝗍 𝖲𝗍𝗋𝖾𝖺𝗄: ${user.currentStreak || 0}\n` +
        `🏅 𝖡𝖾𝗌𝗍 𝖲𝗍𝗋𝖾𝖺𝗄: ${user.bestStreak || 0}\n` +
        `🎯 𝖭𝖾𝗑𝗍 𝖱𝖺𝗇𝗄: ${this.getNextRankProgress(user.correct)}`
      );
    } catch (err) {
      console.error("Rank error:", err);
      return message.reply("⚠️ Could not fetch rank.");
    }
  },

  getNextRankProgress(correct) {
    if (correct >= 50) return "Maximum Rank Achieved! 👑";
    if (correct >= 25) return `${50 - correct} correct answers to Quiz Champion`;
    if (correct >= 10) return `${25 - correct} correct answers to Quiz Master`;
    return `${10 - correct} correct answers to Quiz Pro`;
  },

  async handleLeaderboard(message, getLang) {
    try {
      const res = await axios.get(`${BASE_URL}/leaderboards`);
      const { rankings, stats } = res.data;

      const topPlayers = rankings.slice(0, 10).map((u, i) => {
        const acc = Math.round((u.correct / (u.total || 1)) * 100);
        const crown = i === 0 ? "👑" : i === 1 ? "🥈" : i === 2 ? "🥉" : "🏅";
        return `${crown} ${i + 1}. ${u.name || 'Anonymous'}\n🆔 𝖴𝗌𝖾𝗋𝖨𝖣: ${u.userId}\n📚 𝖯𝗅𝖺𝗒𝖾𝖽 𝖦𝖺𝗆𝖾𝗌: ${u.total}\n✅ 𝖢𝗈𝗋𝗋𝖾𝖼𝗍: ${u.correct}/${u.total} (${acc}% accuracy)\n❌ 𝖶𝗋𝗈𝗇𝗀: ${u.wrong}\n🔥 𝖲𝗍𝗋𝖾𝖺𝗄: ${u.currentStreak || 0}\n🥇 𝖡𝖾𝗌𝗍 𝖲𝗍𝗋𝖾𝖺𝗄: ${u.bestStreak || 0}`;
      }).join('\n\n');

      const globalStats = `📊 𝗚𝗹𝗼𝗯𝗮𝗹 𝗦𝘁𝗮𝘁𝘀\n` +
        `🎮 𝖳𝗈𝗍𝖺𝗅 𝖯𝗅𝖺𝗒𝖾𝗋𝗌: ${stats.totalUsers}\n` +
        `📝 𝖳𝗈𝗍𝖺𝗅 𝖰𝗎𝖾𝗌𝗍𝗂𝗈𝗇𝗌: ${stats.totalQuestions}\n` +
        `✨ 𝖳𝗈𝗍𝖺𝗅 𝖠𝗇𝗌𝗐𝖾𝗋𝖾𝖽: ${stats.totalAnswered}`;

      return message.reply(`🏆 𝗤𝘂𝗶𝘇 𝗟𝗲𝗮𝗱𝗲𝗿𝗯𝗼𝗮𝗿𝗱\n━━━━━━━━━━━━━\n\n${topPlayers}\n\n${globalStats}`);
    } catch (err) {
      console.error("Leaderboard error:", err);
      return message.reply("⚠️ Could not fetch leaderboard.");
    }
  },

  async handleCategories(message, getLang) {
    try {
      const res = await axios.get(`${BASE_URL}/categories`);
      const catText = res.data.map(c => `📍 ${c.charAt(0).toUpperCase() + c.slice(1)}`).join("\n");
      return message.reply(`📚 𝗤𝘂𝗶𝘇 𝗖𝗮𝘁𝗲𝗴𝗼𝗿𝗶𝗲𝘀\n━━━━━━━━━━━━━\n\n${catText}`);
    } catch (err) {
      console.error("Categories error:", err);
      return message.reply("⚠️ Could not fetch categories.");
    }
  },

  async handleTrueOrFalse(message, event, commandName, api) {
    try {
      const res = await axios.get(`${BASE_URL}/question?category=torf`);
      const { question, answer } = res.data;

      const info = await message.reply(this.langs.en.torfReply.replace("{question}", question));
      
      global.GoatBot.onReaction.set(info.messageID, {
        commandName,
        author: event.senderID,
        messageID: info.messageID,
        answer: answer === "True",
        reacted: false,
        reward: this.envConfig.reward
      });

      setTimeout(() => {
        const reaction = global.GoatBot.onReaction.get(info.messageID);
        if (reaction && !reaction.reacted) {
          message.reply(this.langs.en.timeoutMessage.replace("{correctAnswer}", answer));
          message.unsend(info.messageID);
          global.GoatBot.onReaction.delete(info.messageID);
        }
      }, 30000);
    } catch (err) {
      console.error("True/False error:", err);
      return message.reply("⚠️ Could not create True/False question.");
    }
  },

  async handleQuiz(message, event, args, commandName, getLang, api, usersData) {
    try {
      const userInfo = await api.getUserInfo(event.senderID);
      const userName = userInfo[event.senderID].name;
      const category = args[0]?.toLowerCase() || "";

      const res = await axios.get(`${BASE_URL}/question`, {
        params: { category: category || undefined }
      });

      const { _id, question, options, answer } = res.data;
      const optText = options.map((opt, i) => `${String.fromCharCode(65 + i)}. ${opt}`).join("\n");

      const info = await message.reply(getLang("reply")
        .replace("{name}", userName)
        .replace("{category}", category || "Random")
        .replace("{question}", question)
        .replace("{options}", optText));

      global.GoatBot.onReply.set(info.messageID, {
        commandName,
        author: event.senderID,
        messageID: info.messageID,
        answer,
        questionId: _id,
        startTime: Date.now()
      });

      setTimeout(() => {
        const r = global.GoatBot.onReply.get(info.messageID);
        if (r) {
          message.reply(getLang("timeoutMessage").replace("{correctAnswer}", answer));
          message.unsend(info.messageID);
          global.GoatBot.onReply.delete(info.messageID);
        }
      }, 30000);
    } catch (err) {
      console.error("Quiz error:", err);
      message.reply("⚠️ Could not get quiz question.");
    }
  },

  onReaction: async function ({ message, event, Reaction, api, usersData }) {
    try {
      const { author, messageID, answer, reacted, reward } = Reaction;
      
      if (event.userID !== author || reacted) return;
      
      const isCorrect = (event.reaction === '😆' && answer === true) || 
                       (event.reaction === '😮' && answer === false);

      const userData = await usersData.get(event.userID);
      userData.money = (userData.money || 0) + (isCorrect ? reward : 0);
      await usersData.set(event.userID, userData);

      const tfSuccessMessages = [
        `🌟 Perfect intuition {name}! You've earned ${reward} coins! Keep it up! 🎉`,
        `🏆 That's right {name}! Your instincts are spot on! Here's ${reward} coins! ✨`,
        `💫 You've got it {name}! Excellent judgment! Enjoy your ${reward} coins! 🎯`,
        `🎉 Way to go {name}! That's correct! Take these ${reward} coins! 🔥`,
        `⭐ You nailed it {name}! Here's ${reward} coins for your wisdom! 💰`
      ];

      const tfFailureMessages = [
        `😅 Not this time {name}! The answer was {answer}. Keep going! 💪`,
        `🤔 Close one {name}! It was actually {answer}. You'll get it next time! ✨`,
        `💫 Good try {name}! The correct answer was {answer}. Stay positive! 🎯`,
        `🌟 Nice attempt {name}! It was {answer}. Keep that spirit up! 📚`,
        `✨ Almost {name}! The answer we wanted was {answer}. Next one's yours! 🎓`
      ];

      const userInfo = await api.getUserInfo(event.userID);
      const randomMessage = (isCorrect ? 
        tfSuccessMessages[Math.floor(Math.random() * tfSuccessMessages.length)] :
        tfFailureMessages[Math.floor(Math.random() * tfFailureMessages.length)])
        .replace('{name}', userInfo[event.userID].name)
        .replace('{answer}', answer ? 'true' : 'false');

      message.reply(randomMessage);

      global.GoatBot.onReaction.get(messageID).reacted = true;
      setTimeout(() => global.GoatBot.onReaction.delete(messageID), 1000);
    } catch (err) {
      console.error("Quiz reaction error:", err);
    }
  },

  onReply: async function ({ message, event, Reply, getLang, api, usersData }) {
    if (Reply.author !== event.senderID) return;

    try {
      const ans = event.body.trim().toUpperCase();
      if (!["A", "B", "C", "D"].includes(ans)) {
        return message.reply("❌ Reply with A, B, C or D only!");
      }

      const timeSpent = (Date.now() - Reply.startTime) / 1000;
      if (timeSpent > 30) {
        return message.reply("⏰ Time's up!");
      }

      const userInfo = await api.getUserInfo(event.senderID);
      const userName = userInfo[event.senderID].name;

      const res = await axios.post(`${BASE_URL}/answer`, {
        userId: event.senderID,
        questionId: Reply.questionId,
        answer: ans,
        timeSpent,
        userName
      });

      const { result, user, achievement } = res.data;
      
      if (result === "correct") {
        const userData = await usersData.get(event.senderID);
        userData.money = (userData.money || 0) + this.envConfig.reward;
        await usersData.set(event.senderID, userData);
      }

      const successMessages = [
        `🌟 Congratulations {name}! Your brilliance shines through! You've earned ${this.envConfig.reward} coins! 🎉`,
        `🏆 Outstanding {name}! That's absolutely correct! Here's ${this.envConfig.reward} coins for your genius! ✨`,
        `💫 Amazing work {name}! Your knowledge is impressive! Enjoy your ${this.envConfig.reward} coin reward! 🎯`,
        `🎉 Brilliant answer {name}! You're on fire! Take these ${this.envConfig.reward} coins! 🔥`,
        `⭐ You're unstoppable {name}! Perfect answer! ${this.envConfig.reward} coins added to your wallet! 💰`
      ];

      const failureMessages = [
        `😅 Oops {name}! Not quite right this time. Keep trying, you're getting better! 💪`,
        `🤔 Almost there {name}! The correct answer was: {answer}. Don't give up! ✨`,
        `💫 Nice try {name}! Keep that enthusiasm going! The right answer was: {answer} 🎯`,
        `🌟 Good attempt {name}! Learning is a journey. The correct answer was: {answer} 📚`,
        `✨ Don't worry {name}! Everyone learns differently. The answer we wanted was: {answer} 🎓`
      ];

      const randomMessage = (result === "correct" ? 
        successMessages[Math.floor(Math.random() * successMessages.length)] :
        failureMessages[Math.floor(Math.random() * failureMessages.length)])
        .replace('{name}', userName)
        .replace('{answer}', Reply.answer);

      const msg = `${randomMessage}\n\n📊 𝖲𝖼𝗈𝗋𝖾: ${user.correct}/${user.total}\n🔥 𝖲𝗍𝗋𝖾𝖺𝗄: ${user.currentStreak || 0}`;

      await message.reply(msg);

      if (achievement) {
        const bonusReward = this.envConfig.achievementReward;
        const userData = await usersData.get(event.senderID);
        userData.money = (userData.money || 0) + bonusReward;
        await usersData.set(event.senderID, userData);
        
        await message.reply(`🏆 𝖠𝖼𝗁𝗂𝖾𝗏𝖾𝗆𝖾𝗇𝗍 𝖴𝗇𝗅𝗈𝖼𝗄𝖾𝖽: ${achievement}\n💰 +${bonusReward} bonus coins!`);
      }

      message.unsend(Reply.messageID);
      global.GoatBot.onReply.delete(Reply.messageID);
    } catch (err) {
      console.error("Answer error:", err);
      message.reply("⚠️ Error processing your answer.");
    }
  },

  envConfig: {
    reward: 10000,
    achievementReward: 20000,
    streakReward: 5000
  }
};
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });