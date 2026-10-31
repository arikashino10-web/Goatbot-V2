const axios = require("axios");

module.exports = {
  config: {
    name: "adduser",
    version: "1.1.0",
    role: 0,
    author: "JABED D KURÕ",
    shortDescription: { en: "Add user to group" },
    longDescription: { en: "Add user to group using profile link or Facebook UID" },
    category: "system",
    guide: { en: "[uid/link]" }
  },

  onStart: async function ({ message, event, args, api }) {
    const { threadID } = event;

    if (!args || !args[0]) {
      return message.reply("UID বা Link দিন......");
    }

    // ইনপুট যদি সরাসরি সংখ্যা হয়, তবে সেটাকে UID ধরে অ্যাড করা হবে
    if (!isNaN(args[0])) {
      return addUserToGroup(args[0], threadID, message, api);
    }

    let link = args[0];
    let uid = null;

    try {
      if (!link.includes("facebook.com") && !link.includes("fb.com")) {
        return message.reply("Facebook link দিন.....");
      }

      let res = await axios.get(link);
      let data = res.data;

      let match = data.match(/"userID":"(\d+)"/);
      if (match) uid = match[1];

      if (!uid) return message.reply("UID পাওয়া যায়নি.....");

      return addUserToGroup(uid, threadID, message, api);

    } catch (e) {
      return message.reply("Link থেকে UID বের করতে সমস্যা হয়েছে!");
    }
  }
};

// অ্যাড করার মেইন ফাংশনটি নিচে আলাদা করা হয়েছে
async function addUserToGroup(uid, threadID, message, api) {
  try {
    let info = await api.getThreadInfo(threadID);
    let participantIDs = info.participantIDs.map(e => parseInt(e));
    let admins = info.adminIDs.map(e => parseInt(e.id));
    let botID = parseInt(api.getCurrentUserID());

    uid = parseInt(uid);

    if (participantIDs.includes(uid)) {
      return message.reply("এই ইউজার গ্রুপে আগেই আছে.....");
    }

    await api.addUserToGroup(uid, threadID);

    if (info.approvalMode === true && !admins.includes(botID)) {
      return message.reply("Request list এ add হয়েছে ✔️");
    }

    return message.reply("Successfully added ✔️");

  } catch (err) {
    return message.reply("Add করা যাচ্ছে না..!\nএই ইউজার হয়তো Friendlist এ নেই........");
  }
}
