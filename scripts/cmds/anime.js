const axios = require('axios');
const fs = require('fs-extra');
const path = require('path');

if (!global.instaMemory) global.instaMemory = new Set();

const TUTORIAL_KEYWORDS = [
  "tutorial", "how to edit", "how to make", "how i edit", "how to create",
  "cara edit", "cara buat", "cara membuat", "edit tutorial", "editing tutorial",
  "step by step", "tuto edit", "tuto ", "learn how", "edit guide",
  "guide to edit", "capcut tutorial", "alight motion tutorial",
  "kaise edit", "edit kaise", "edit karna", "editing kaise", "coba edit",
  "belajar edit", "trik edit", "tips edit", "preset tutorial"
];

const RANDOM_ANIME_KEYWORDS = [
  "anime edit", "amv edit", "4k anime edit", "anime viral edit", 
  "jujutsu kaisen edit", "naruto edit", "one piece edit", "demon slayer edit",
  "attack on titan edit", "bleach edit", "solo leveling edit"
];

function isTutorialVideo(video) {
  const text = `${video.title || ""} ${video.desc || ""} ${video.description || ""}`.toLowerCase();
  return TUTORIAL_KEYWORDS.some(kw => text.includes(kw));
}

module.exports = {
  config: {
    name: "anime",
    aliases: ["animeedit", "anivid", "animevid"],
    version: "1.3.2",
    author: "Arafat",
    countDown: 5,
    role: 0,
    description: "Anime edits from TikTok",
    category: "media",
    guide: {
      en: "{pn} [anime name]"
    }
  },

  onStart: async function ({ api, event, args, message }) {
    let query = args.join(" ").trim();
    
    if (!query) {
      query = RANDOM_ANIME_KEYWORDS[Math.floor(Math.random() * RANDOM_ANIME_KEYWORDS.length)];
    }

    api.setMessageReaction("✨", event.messageID, () => {}, true);

    const cacheDir = path.join(__dirname, 'cache');
    if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
    const pathVideo = path.join(cacheDir, `anime_${Date.now()}.mp4`);

    try {
      const searchTerms = `${query} anime edit amv no watermark`;

      const res = await axios.get(`https://azadx69x-tiktok-api.vercel.app/tiktok/search`, {
        params: { query: searchTerms },
        timeout: 15000
      });

      const rawVideos = res.data?.list;

      if (!rawVideos || rawVideos.length === 0) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply(serifBold(""));
      }

      const videos = rawVideos.filter(v => !isTutorialVideo(v));

      if (videos.length === 0) {
        api.setMessageReaction("❌", event.messageID, () => {}, true);
        return message.reply(serifBold(""));
      }

      const getVideoId = (v) => v.video_id || v.id || v.url;

      let unvisited = videos.filter(v => !global.instaMemory.has(getVideoId(v)));
      if (unvisited.length === 0) {
        global.instaMemory.clear();
        unvisited = videos;
      }
      
      const selectedVideo = unvisited[Math.floor(Math.random() * unvisited.length)];
      global.instaMemory.add(getVideoId(selectedVideo));

      const downloadUrl = selectedVideo.noWatermark || selectedVideo.play || selectedVideo.wmplay;

      const videoResponse = await axios({
        method: 'get',
        url: downloadUrl,
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: { 'User-Agent': 'Mozilla/5.0' }
      });

      await fs.writeFile(pathVideo, Buffer.from(videoResponse.data));

      await message.reply({
        body: serifBold(`• 𝐇𝐞𝐫𝐞 𝐢𝐬 𝐲𝐨𝐮𝐫 𝐯𝐢𝐝𝐞𝐨 𝐛𝐚𝐛𝐲  <😘`),
        attachment: fs.createReadStream(pathVideo)
      });

      api.setMessageReaction("🌸", event.messageID, () => {}, true);

    } catch (err) {
      console.error("DEBUG ERROR:", err.message);
      api.setMessageReaction("⚠️", event.messageID, () => {}, true);

      const errorMsg = err.code === 'ECONNABORTED'
        ? "⚠️ | 𝐂𝐨𝐧𝐧𝐞𝐜𝐭𝐢𝐨𝐧 𝐭𝐢𝐦𝐞𝐝 𝐨𝐮𝐭. 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧!"
        : "⚠️ | 𝐒𝐞𝐫𝐯𝐞𝐫 𝐢𝐬 𝐛𝐮𝐬𝐲 𝐨𝐫 𝐀𝐏𝐈 𝐢𝐬 𝐝𝐨𝐰𝐧. 𝐓𝐫𝐲 𝐚𝐠𝐚𝐢𝐧!";

      return message.reply(serifBold(errorMsg));
    } finally {
      if (fs.existsSync(pathVideo)) {
        setTimeout(() => {
          try { fs.unlinkSync(pathVideo); } catch(e) {}
        }, 20000);
      }
    }
  }
};

function serifBold(text) {
  const letters = {
    'a': '𝐚', 'b': '𝐛', 'c': '𝐜', 'd': '𝐝', 'e': '𝐞', 'f': '𝐟', 'g': '𝐠', 'h': '𝐡', 'i': '𝐢', 'j': '𝐣', 'k': '𝐤', 'l': '𝐥', 'm': '𝐦',
    'n': '𝐧', 'o': '𝐨', 'p': '𝐩', 'q': '𝐪', 'r': '𝐫', 's': '𝐬', 't': '𝐭', 'u': '𝐮', 'v': '𝐯', 'w': '𝐰', 'x': '𝐱', 'y': '𝐲', 'z': '𝐳',
    'A': '𝐀', 'B': '𝐁', 'C': '𝐂', 'D': '𝐃', 'E': '𝐄', 'F': '𝐅', 'G': '𝐆', 'H': '𝐇', 'I': '𝐈', 'J': '𝐉', 'K': '𝐊', 'L': '𝐋', 'M': '𝐌',
    'N': '𝐍', 'O': '𝐎', 'P': '𝐏', 'Q': '𝐐', 'R': '𝐑', 'S': '𝐒', 'T': '𝐓', 'U': '𝐔', 'V': '𝐕', 'W': '𝐖', 'X': '𝐗', 'Y': '𝐘', 'Z': '𝐙',
    '0': '𝟎', '1': '𝟏', '2': '𝟐', '3': '𝟑', '4': '𝟒', '5': '𝟓', '6': '𝟔', '7': '𝟕', '8': '𝟖', '9': '𝟗'
  };
  return text.split('').map(char => letters[char] || char).join('');
        }
