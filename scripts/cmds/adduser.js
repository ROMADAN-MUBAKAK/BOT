const { GoatWrapper } = require("fca-liane-utils");
const { findUid } = global.utils;
const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

module.exports = {
  config: {
    name: "adduser",
    version: "2.0",
    author: "NTKhang | ArYAN",
    countDown: 0,
    role: 0,
    longDescription: {
      en: "Add user to your group chats"
    },
    category: "group",
    guide: {
      en: "{p}adduser [ link profile | uid ]"
    }
  },

  langs: {
    en: {
      alreadyInGroup: "Already in group please check group your list",
      successAdd: "- Successfully added %1 members to the group",
      failedAdd: "Failed to add %1 members to the group",
      approve: "Added %1 members to the approval list",
      invalidLink: "Please enter a valid facebook link",
      cannotGetUid: "Cannot get uid of this user",
      linkNotExist: "This profile url does not exist",
      cannotAddUser: "Bot is blocked or this user blocked strangers from adding to the group"
    }
  },

  onStart: async function ({ message, api, event, args, threadsData, getLang }) {
    const { members, adminIDs, approvalMode } = await threadsData.get(event.threadID);
    const botID = api.getCurrentUserID();

    const success = [
      {
        type: "success",
        uids: []
      },
      {
        type: "waitApproval",
        uids: []
      }
    ];
    const failed = [];

    function checkErrorAndPush(messageError, item) {
      item = item.replace(/(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)/i, '');
      const findType = failed.find(error => error.type == messageError);
      if (findType)
        findType.uids.push(item);
      else
        failed.push({
          type: messageError,
          uids: [item]
        });
    }

    const regExMatchFB = /(?:https?:\/\/)?(?:www\.)?(?:facebook|fb|m\.facebook)\.(?:com|me)\/(?:(?:\w)*#!\/)?(?:pages\/)?(?:[\w\-]*\/)*([\w\-\.]+)(?:\/)?/i;
    for (const item of args) {
      let uid;
      let continueLoop = false;

      if (isNaN(item) && regExMatchFB.test(item)) {
        for (let i = 0; i < 10; i++) {
          try {
            uid = await findUid(item);
            break;
          }
          catch (err) {
            if (err.name == "SlowDown" || err.name == "CannotGetData") {
              await sleep(1000);
              continue;
            }
            else if (i == 9 || (err.name != "SlowDown" && err.name != "CannotGetData")) {
              checkErrorAndPush(
                err.name == "InvalidLink" ? getLang('invalidLink') :
                  err.name == "CannotGetData" ? getLang('cannotGetUid') :
                    err.name == "LinkNotExist" ? getLang('linkNotExist') :
                      err.message,
                item
              );
              continueLoop = true;
              break;
            }
          }
        }
      }
      else if (!isNaN(item))
        uid = item;
      else
        continue;

      if (continueLoop == true)
        continue;

      if (members.some(m => m.userID == uid && m.inGroup)) {
        checkErrorAndPush(getLang("alreadyInGroup"), item);
      }
      else {
        try {
          await api.addUserToGroup(uid, event.threadID);
          if (approvalMode === true && !adminIDs.includes(botID))
            success[1].uids.push(uid);
          else
            success[0].uids.push(uid);
        }
        catch (err) {
          checkErrorAndPush(getLang("cannotAddUser"), item);
        }
      }
    }

    const lengthUserSuccess = success[0].uids.length;
    const lengthUserWaitApproval = success[1].uids.length;
    const lengthUserError = failed.length;

    let msg = "";
    if (lengthUserSuccess)
      msg += `✅ 𝗔𝗱𝗱𝗲𝗱 𝗨𝘀𝗲𝗿\n━━━━━━━━━━\n\n${getLang("successAdd", lengthUserSuccess)}`;
    if (lengthUserWaitApproval)
      msg += `✅ 𝗔𝗱𝗱𝗲𝗱 𝗨𝘀𝗲𝗿\n━━━━━━━━━━\n\n${getLang("approve", lengthUserWaitApproval)}`;
    if (lengthUserError)
      msg += `⛔ 𝗙𝗮𝗶𝗹𝗲𝗱\n━━━━━━━━━━\n\n${getLang("failedAdd", failed.reduce((a, b) => a + b.uids.length, 0))} ${failed.reduce((a, b) => a += `\n    + ${b.uids.join('\n       ')}: ${b.type}`, "")}`;
    await message.reply(msg);
  }
};
const wrapper = new GoatWrapper(module.exports);
wrapper.applyNoPrefix({ allowPrefix: true });
