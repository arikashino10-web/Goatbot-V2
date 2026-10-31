module.exports = {
  config: {
    name: "out",
    version: "2.0.1",
    author: "JABED D KURÕ",
    countDown: 5,
    role: 0,
    shortDescription: "Bot leaves group",
    longDescription: "Bot leaves current group or selected group from list (Only Group Admin & Bot Admin)",
    category: "Admin",
    guide: {
      en: "{pn}\n{pn} help\n{pn} gc list"
    }
  },

  onStart: async function ({ api, event, args, message, threadsData }) {
    const { threadID, messageID, senderID } = event;

    // ===== Permission Check =====
    const ADMINS = global.GoatBot?.config?.adminBot || [];
    const isBotAdmin = ADMINS.includes(senderID);

    let isGroupAdmin = false;
    try {
      const threadInfo = await api.getThreadInfo(threadID);
      isGroupAdmin = threadInfo.adminIDs?.some(item => item.id == senderID);
    } catch (e) {}

    // অ্যাডমিন না হলে সম্পূর্ণ ইগনোর (কোনো মেসেজ না)
    if (!isBotAdmin && !isGroupAdmin) return;

    const command = (args[0] || "").toLowerCase();
    const subCommand = (args[1] || "").toLowerCase();

    // ===== HELP =====
    if (command === "help") {
      return api.sendMessage(
`╔═══════『 𝗢𝗨𝗧 𝗛𝗘𝗟𝗣 』═══════╗
┃
┃ ➤ .out
┃    → বর্তমান গ্রুপ থেকে বট লিভ নেবে
┃
┃ ➤ .out gc list
┃    → সব গ্রুপের লিস্ট দেখাবে
┃    → নাম্বার দিলে সেই গ্রুপ থেকে লিভ
┃
┃ ➤ .out help
┃    → এই হেল্প মেসেজ দেখাবে
┃
┃ 🔒 শুধু গ্রুপ অ্যাডমিন ও বট অ্যাডমিন
┃
╚══════════════════════════╝`,
        threadID,
        messageID
      );
    }

    // ===== GC LIST =====
    if (command === "gc" && subCommand === "list") {
      try {
        const allThreads = await api.getThreadList(100, null, ["INBOX"]);
        const groups = allThreads.filter(t => t.isGroup && t.threadID);

        if (groups.length === 0) {
          return api.sendMessage("❌ কোনো গ্রুপ পাওয়া যায়নি।", threadID, messageID);
        }

        let msg = `📋 𝗧𝗼𝘁𝗮𝗹 𝗚𝗿𝗼𝘂𝗽𝘀: ${groups.length}\n\n`;
        groups.forEach((g, i) => {
          msg += `${i + 1}. ${g.name || "Unnamed Group"}\n   🆔 ${g.threadID}\n\n`;
        });

        msg += `👉 কোন গ্রুপ থেকে লিভ নিতে চাও?\nনাম্বার লিখে রিপ্লাই দাও (যেমন: 1)`;

        return api.sendMessage(msg, threadID, (err, info) => {
          if (err) return;

          global.GoatBot.onReply.set(info.messageID, {
            commandName: this.config.name,
            author: senderID,
            messageID: info.messageID,
            type: "chooseGroup",
            groups: groups.map(g => ({
              id: g.threadID,
              name: g.name || "Unnamed Group"
            }))
          });
        }, messageID);
      } catch (err) {
        console.error(err);
        return api.sendMessage("❌ গ্রুপ লিস্ট আনতে সমস্যা হয়েছে।", threadID, messageID);
      }
    }

    // ===== শুধু .out → বর্তমান গ্রুপ থেকে লিভ =====
    if (!command) {
      return api.removeUserFromGroup(api.getCurrentUserID(), threadID, (err) => {
        if (err) {
          return api.sendMessage("❌ এই গ্রুপ থেকে লিভ নেওয়া যায়নি।", threadID, messageID);
        }
      });
    }

    // ভুল কমান্ড হলে
    return api.sendMessage(
      "❌ ভুল কমান্ড!\nসঠিক ব্যবহার দেখতে লিখো: .out help",
      threadID,
      messageID
    );
  },

  onReply: async function ({ api, event, Reply, message }) {
    const { threadID, messageID, senderID, body } = event;

    // শুধু যিনি লিস্ট চেয়েছেন তিনিই রিপ্লাই দিতে পারবে
    if (senderID !== Reply.author) return;

    if (Reply.type !== "chooseGroup") return;

    const choice = parseInt(body.trim());
    if (isNaN(choice) || choice < 1 || choice > Reply.groups.length) {
      return api.sendMessage(
        `❌ ভুল নাম্বার!\n১ থেকে ${Reply.groups.length} এর মধ্যে একটি নাম্বার দাও।`,
        threadID,
        messageID
      );
    }

    const selected = Reply.groups[choice - 1];

    api.removeUserFromGroup(api.getCurrentUserID(), selected.id, (err) => {
      if (err) {
        return api.sendMessage(
          `❌ "${selected.name}" গ্রুপ থেকে লিভ নেওয়া যায়নি।`,
          threadID,
          messageID
        );
      }
      return api.sendMessage(
        `✅ সফলভাবে লিভ নেওয়া হয়েছে!\n📌 গ্রুপ: ${selected.name}\n🆔 ${selected.id}`,
        threadID,
        messageID
      );
    });
  }
};
