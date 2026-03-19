export type StoryLine = {
  speaker: "adult" | "child";
  text: string;
  arabicText?: string;
};

export type IslamicStory = {
  id: string;
  titleKey: string;
  emoji: string;
  category: "prophets" | "pillars" | "quran" | "morals" | "history";
  ageRange: "4-6" | "6-9" | "9-12";
  durationSec: number;
  dialogue: StoryLine[];
};

export const ISLAMIC_STORIES: IslamicStory[] = [
  {
    id: "five-pillars",
    titleKey: "islamicStories.fivePillars",
    emoji: "🕌",
    category: "pillars",
    ageRange: "6-9",
    durationSec: 120,
    dialogue: [
      { speaker: "child", text: "Baba, what is Islam?" },
      { speaker: "adult", text: "Islam, my child, is built on five pillars — like a strong house needs five walls." },
      { speaker: "child", text: "Five pillars? Like a masjid?" },
      { speaker: "adult", text: "Exactly! The first is Shahada — saying that Allah is One and Muhammad ﷺ is His messenger." },
      { speaker: "child", text: "I know that one! Ash-hadu an la ilaha illallah!" },
      { speaker: "adult", text: "Masha'Allah! The second is Salah — praying five times a day, talking to Allah." },
      { speaker: "child", text: "Like Fajr prayer in the morning?" },
      { speaker: "adult", text: "Yes! Fajr, Dhuhr, Asr, Maghrib and Isha. The third is Zakat — giving to those who have less." },
      { speaker: "child", text: "Like sharing our food?" },
      { speaker: "adult", text: "Beautifully said. The fourth is Sawm — fasting in Ramadan, from sunrise to sunset." },
      { speaker: "child", text: "That's when Mama makes special food at night!" },
      { speaker: "adult", text: "Yes, that's Iftar! And the fifth pillar is Hajj — visiting the Kaaba in Makkah, at least once in a lifetime." },
      { speaker: "child", text: "Can we go to Makkah one day?" },
      { speaker: "adult", text: "Insha'Allah, we will. These five pillars are how we show our love for Allah." },
      { speaker: "child", text: "I want to do all five!" },
      { speaker: "adult", text: "And Allah will help you, insha'Allah. Ameen." },
    ],
  },
  {
    id: "ibrahim-stars",
    titleKey: "islamicStories.ibrahim",
    emoji: "⭐",
    category: "prophets",
    ageRange: "6-9",
    durationSec: 150,
    dialogue: [
      { speaker: "child", text: "Baba, why do people worship statues?" },
      { speaker: "adult", text: "That's a big question. Long ago, most people did. But there was one brave boy named Ibrahim who questioned everything." },
      { speaker: "child", text: "A boy like me?" },
      { speaker: "adult", text: "Yes! Ibrahim looked at the stars at night and thought — can a star be God? But the star disappeared by morning." },
      { speaker: "child", text: "Stars go away in the morning!" },
      { speaker: "adult", text: "Exactly! So Ibrahim said: a god cannot disappear. He looked at the moon — so big and bright. But the moon also set." },
      { speaker: "child", text: "So the moon isn't God either?" },
      { speaker: "adult", text: "Correct. Then he saw the sun — the biggest of all. But at sunset, it disappeared too." },
      { speaker: "child", text: "Nothing in the sky is God then?" },
      { speaker: "adult", text: "Ibrahim said: I turn my face to the One who created all of this — the stars, the moon, the sun. That is Allah." },
      { speaker: "child", text: "He figured it out all by himself?" },
      { speaker: "adult", text: "Allah guided his heart. And that's why we call Ibrahim Khalilullah — the friend of Allah." },
      { speaker: "child", text: "I want to be Allah's friend too." },
      { speaker: "adult", text: "Every time you pray and remember Allah, you already are, my dear." },
    ],
  },
  {
    id: "nuh-ark",
    titleKey: "islamicStories.nuh",
    emoji: "🚢",
    category: "prophets",
    ageRange: "4-6",
    durationSec: 90,
    dialogue: [
      { speaker: "child", text: "Tell me a story about animals!" },
      { speaker: "adult", text: "Oh, I have a perfect one. The story of Prophet Nuh and the great boat — called the Ark." },
      { speaker: "child", text: "A big boat? For animals?" },
      { speaker: "adult", text: "Allah told Prophet Nuh to build the biggest boat ever — and to bring two of every animal on Earth." },
      { speaker: "child", text: "Two elephants? Two lions?" },
      { speaker: "adult", text: "Two of everything! Can you imagine? Then it rained and rained for forty days and forty nights." },
      { speaker: "child", text: "That's so much rain!" },
      { speaker: "adult", text: "The whole earth was covered with water. But Nuh and the believers and all the animals were safe on the Ark." },
      { speaker: "child", text: "Allah protected them!" },
      { speaker: "adult", text: "Always. And when the rain stopped, the boat rested on a mountain called Al-Judi." },
      { speaker: "child", text: "Did the animals go free?" },
      { speaker: "adult", text: "Yes! They came out and the earth was new and fresh. The lesson? When we trust Allah, He always saves us." },
      { speaker: "child", text: "I trust Allah!" },
      { speaker: "adult", text: "And He loves you for it. Masha'Allah." },
    ],
  },
  {
    id: "salah-explained",
    titleKey: "islamicStories.salah",
    emoji: "🤲",
    category: "pillars",
    ageRange: "4-6",
    durationSec: 90,
    dialogue: [
      { speaker: "child", text: "Why do we pray five times a day?" },
      { speaker: "adult", text: "Because Allah loves us, and prayer is our way to talk to Him — five special conversations every day." },
      { speaker: "child", text: "We TALK to Allah in prayer?" },
      { speaker: "adult", text: "Every word of Al-Fatiha is a conversation. When you say Alhamdulillah, Allah answers: My servant has praised Me." },
      { speaker: "child", text: "Allah answers me?!" },
      { speaker: "adult", text: "Every single time. When you bow in Ruku', you show Allah how great He is. When you put your forehead on the ground in Sujud..." },
      { speaker: "child", text: "That's my favourite part!" },
      { speaker: "adult", text: "In Sujud, you are closest to Allah of any moment in your day. It's the most beautiful position." },
      { speaker: "child", text: "I didn't know that! I'll do extra Sujud!" },
      { speaker: "adult", text: "That's called Nafl prayer — extra love for Allah. He will love you back, abundantly." },
    ],
  },
  {
    id: "names-of-allah",
    titleKey: "islamicStories.namesAllah",
    emoji: "✨",
    category: "quran",
    ageRange: "6-9",
    durationSec: 120,
    dialogue: [
      { speaker: "child", text: "Does Allah have a name?" },
      { speaker: "adult", text: "Allah has ninety-nine beautiful names. Each one tells us something amazing about Him." },
      { speaker: "child", text: "Ninety-nine?! That's so many!" },
      { speaker: "adult", text: "The first is Allah — The One. Then Ar-Rahman — The Most Merciful, the One who loves everyone." },
      { speaker: "child", text: "Even people who make mistakes?" },
      { speaker: "adult", text: "Especially them. Then Ar-Raheem — The Most Compassionate, specifically for believers." },
      { speaker: "child", text: "What's my favourite going to be?" },
      { speaker: "adult", text: "How about Al-Wadud — The Loving. Allah loves you more than any parent ever could." },
      { speaker: "child", text: "More than Mama loves me?" },
      { speaker: "adult", text: "Prophet Muhammad ﷺ said Allah's mercy is seventy times greater than a mother's love." },
      { speaker: "child", text: "That's... I can't even imagine that much love." },
      { speaker: "adult", text: "That's the point. Allah's love is beyond imagination. When you call His names, He listens." },
      { speaker: "child", text: "Ya Allah, Ya Rahman, Ya Raheem!" },
      { speaker: "adult", text: "Ameen. He heard you." },
    ],
  },
];
