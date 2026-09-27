/**
 * Every word, number and asset path the site shows lives here.
 *
 * REF = reference content from the aibuilders.vip/new asset pack this build is modelled on.
 * It makes the experience feel real during development, but it describes AI Builders'
 * founder, members and results. Replace every REF value with UTN's own before publishing.
 * Testimonials are quoted verbatim: replace them whole, never edit them to say "UTN".
 */

import media from "./media.json";

/** Published media, as built by `npm run media`: path -> [width, height] ([0, 0] for video). */
const sizes: Record<string, number[]> = media;

/** Every published file in a media folder, sorted. Collections (gallery, creators) grow or shrink with the folder. */
function mediaIn(folder: string) {
  return Object.keys(sizes)
    .filter((k) => k.startsWith(`/media/${folder}/`))
    .sort();
}

/** First published file for a slot name, e.g. "ambient/idea" -> "/media/ambient/idea.mp4", or null. */
function mediaSlot(slot: string) {
  return Object.keys(sizes).find((k) => k.replace(/\.[a-z0-9]+$/, "") === `/media/${slot}`) ?? null;
}

export const brand = {
  name: "UTN",
  accent: "#3355FF",
  tagline: "Build your app with AI.",
};

/** Search and share previews (page title, meta description, the generated share image). */
export const seo = {
  title: `${brand.name} · Build your app with AI`,
  description:
    "Go from idea to a launched product in 21 days. No code. No developers. Training, weekly live coaching, and a community of builders launching real apps with AI.", // REF: 21 days / coaching claims
  shareHeadline: "Build your app with AI.",
  shareLine: "From idea to a launched product.",
  shareAlt: `${brand.name}: Build your app with AI. Idea, build, launch.`,
};

export const links = {
  join: "#plans", // TODO: UTN signup / community URL
  checkout: "#plans", // TODO: UTN checkout URL
  terms: "#", // TODO
  privacy: "#", // TODO
};

export const stats = {
  members: "500+", // REF
  projects: "275+", // REF
  days: "21", // REF
  followers: "1M", // REF
};

export const hero = {
  eyebrow: brand.name,
  title: ["Build your app", "with AI."],
  lede: `Go from idea to a launched product in ${stats.days} days. No code. No developers. A proven path, and ${stats.members} builders beside you.`, // REF numbers
  laptopCaption: "Every product in this story started on a laptop like this one.",
  enter: "Step inside.",
};

export const ideaNotes = [
  "A tool for dog walkers",
  "Invoices, but simple",
  "What if my spreadsheet was an app?",
  "Booking for my salon",
  "AI coach for runners",
  "Marketplace for local makers",
  "Habit tracker that texts you",
  "CRM for wedding planners",
];

export const whoFor = [
  "You feel stuck and want real control of your future.",
  "You want income you control, not income a boss decides.",
  "You want to build something real, even if you never have.",
];

// REF: founder identity, photo, badge and follower counts
export const founder = {
  name: "Marcin",
  photo: "/media/scenes/founder.webp",
  photoAlt: "The founder with fellow builders at Skool Games",
  badge: "/media/scenes/skool-badge.webp",
  bio: "I help people with zero coding experience build their own software and break free from the 9 to 5. We don’t waste time. We build. We launch. We learn by doing.",
  socials: [
    { value: "506.3K", label: "TikTok followers" },
    { value: "41.8K", label: "YouTube subscribers" },
    { value: "50.8K", label: "Instagram followers" },
  ],
};

// REF: creator follower badges and collab collage
export const creatorBadges = mediaIn("creators");
export const communityCollage = "/media/scenes/community-collage.webp";
export const ideaIcon = "/media/scenes/icon-idea.webp";

export const framework = [
  {
    n: "01",
    icon: "/media/framework/part-1-idea.webp",
    title: "Pick your idea.",
    short: "Find an idea that can actually make money.",
    body: "A 48 hour audit finds the idea already in you, or validates the one you have.",
  },
  {
    n: "02",
    icon: "/media/framework/part-2-build.webp",
    title: "Build your first project.",
    short: "Ship in as little as 10 days.",
    body: "Step by step training, prompts, and tech help when you’re stuck. AI does the hard part. You lead the vision.",
  },
  {
    n: "03",
    icon: "/media/framework/part-3-launch.webp",
    title: "Launch and get customers.",
    short: "Put it in front of real users in days.",
    body: "Landing pages, email sequences, launch checklists. Don’t just build it. Sell it.",
  },
];

export const coachingCall = "/media/scenes/coaching-call.webp"; // REF
export const membersMap = "/media/scenes/members-map.webp"; // REF
export const buildersFaces = "/media/scenes/builders-faces.webp"; // REF

// REF: real AI Builders member launch posts
export const launches = mediaIn("gallery").map((src, i) => ({ src, title: `Member launch post ${i + 1}` }));

/**
 * `count` items taken from `list` starting at `from`, wrapping around, so layouts built for many screens
 * still fill up when the gallery is small. Empty list gives an empty result.
 */
export function cycle<T>(list: T[], count: number, from = 0): T[] {
  if (!list.length) return [];
  return Array.from({ length: count }, (_, i) => list[(from + i) % list.length]);
}

/**
 * Optional generated loops (Higgsfield / Seedance). Drop e.g. assets/ambient/idea.mp4 and run `npm run media`;
 * each slot switches on when its file exists. Muted, looped, 1080p or less, a few MB each.
 */
export const ambient = {
  /** plays on the laptop screen in the studio, 16:10 */
  laptopScreen: mediaSlot("ambient/laptop-screen"),
  /** huge backdrop above the IDEA word, 16:9 */
  idea: mediaSlot("ambient/idea"),
  /** backdrop revealed behind LAUNCH as its letters lift off, 16:9 */
  launch: mediaSlot("ambient/launch"),
};

export type Story = {
  id: string;
  name: string;
  stat: string;
  statLabel: string;
  quote: string;
  detail: string;
  /** Launch post screenshot shown on the floating screen. null = designed poster instead. */
  screen: string | null;
  /** Video embed (Wistia/YouTube iframe URL) or .mp4. null until UTN has the real video. */
  video: string | null;
};

// REF: every story below is an AI Builders member, quoted verbatim
export const stories: Story[] = [
  {
    id: "drew",
    name: "Drew Griffin",
    stat: "$200K+",
    statLabel: "revenue",
    quote: "AI Builders is grossly underpriced for what you get.",
    detail: "Drew launched SendPush.io and has passed $200K in revenue.",
    screen: "/media/wins/win-01.webp",
    video: null,
  },
  {
    id: "pedro",
    name: "Pedro",
    stat: "36 hrs",
    statLabel: "to a B2B SaaS",
    quote: "In 36 hours to a fully functional B2B SaaS. Vibe coded.",
    detail: "Pedro was stuck getting his software off the ground. A few weeks after joining, he built it in 36 hours.",
    screen: null,
    video: null,
  },
  {
    id: "adam",
    name: "Adam",
    stat: "7 days",
    statLabel: "to the App Store",
    quote: "AI Builders helped me get my app live on the App Store in 7 days.",
    detail: "Adam had never launched software before. His first mobile app is live on the App Store.",
    screen: null,
    video: null,
  },
  {
    id: "krzysztof",
    name: "Krzysztof",
    stat: "3 exits",
    statLabel: "SaaS sold",
    quote: "Marcin helped me build and sell 3 SaaS businesses.",
    detail: "Krzysztof started with the YouTube videos, built his own SaaS products, and just sold his third.",
    screen: "/media/wins/win-02.webp",
    video: null,
  },
  {
    id: "misty",
    name: "Misty",
    stat: "0 → app",
    statLabel: "no tech background",
    quote: "The community massively increased my productivity.",
    detail: "Misty had no tech experience. With the community behind her, she launched her app CartoViva.",
    screen: null,
    video: null,
  },
];

// REF
export const proofQuote = {
  quote: "AI is the biggest disruption in tech history, and we can now use it.",
  name: "Daniel Burns",
  screen: "/media/wins/win-03.webp",
};

// REF: pricing and guarantee
export const plans = [
  { name: "Standard", price: "$67", period: "/month", note: "Cancel anytime", featured: false },
  { name: "Premium", price: "$399", period: "/year", note: "Save $405 vs monthly", featured: true },
];

export const included = [
  "3 part framework: Idea, Build, Launch",
  "Step by step training videos",
  "Weekly live coaching and co building",
  `Community of ${stats.members} builders`,
  "Tech support and launch resources",
];

export const guarantee = "14 day money back guarantee."; // REF

export const faqs = [
  {
    q: "I have a 9 to 5. Do I have time for this?",
    a: "It’s built for people with full time jobs, kids, and packed schedules. Most members spend 30 to 60 minutes a day.",
  },
  {
    q: "I’m not technical at all. I’ve never coded.",
    a: "That’s exactly who this is for. If you’ve used ChatGPT, you already have the base skills.",
  },
  {
    q: "What if I build something and no one wants it?",
    a: "That’s why we start with picking the right idea, not with building. You learn to validate before you spend time building.",
  },
];

/** Every texture the 3D scene uses, preloaded behind the loader. */
export const sceneTextures = [
  founder.photo,
  founder.badge,
  communityCollage,
  ideaIcon,
  ...creatorBadges,
  ...framework.map((f) => f.icon),
  coachingCall,
  membersMap,
  buildersFaces,
  ...launches.map((l) => l.src),
  ...(stories.map((s) => s.screen).filter(Boolean) as string[]),
  proofQuote.screen,
];

/** height / width for a published media path (1 if unknown). */
export function aspectOf(src: string) {
  const s = sizes[src];
  return s && s[0] ? s[1] / s[0] : 1;
}
