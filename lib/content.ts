/**
 * Every word, number and asset path the site shows lives here.
 *
 * Copy, figures, leadership and client quotes come from https://metayb.ai/. Client quotes are verbatim (whole
 * sentences, never reworded). Images are published from assets/ by `npm run media`; the Metayb set is composed by
 * scripts/compose-metayb-assets.mjs from files on the site.
 * 3D labels use Inter Tight's Latin set (A-Z 0-9 + $ % . , ! ? & - / '): no arrows or emoji.
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
  name: "Metayb",
  /** logo files in public/brand: the blue wordmark, and a white one for dark backgrounds */
  logo: "/brand/logo.svg",
  logoWhite: "/brand/logo-white.svg",
  accent: "#3355FF",
  tagline: "AI-native enterprise transformation.",
};

/** Search and share previews (page title, meta description, the generated share image). */
export const seo = {
  title: "AI Consulting & Digital Transformation Services | Metayb",
  description:
    "Transform your enterprise with Metayb's AI consulting, data analytics, automation and cloud solutions. Streamline operations. Book a free consultation today.",
  shareHeadline: "AI-native transformation.",
  shareLine: "AI, data, cloud and automation for the enterprise.",
  shareAlt: `${brand.name}: AI-native enterprise transformation. Idea, build, scale.`,
};

export const contact = {
  email: "info@metayb.ai",
  phone: "+91 93619 63901",
  address: "ALG Towers, 3rd Floor, Plot No. 48, Industrial Estate Main Road, Chennai 600096, India",
};

export const links = {
  join: "https://metayb.ai/contact-us/",
  consult: "https://metayb.ai/contact-us/",
  email: `mailto:${contact.email}`,
  /** No standalone terms page was found on metayb.ai; the footer hides the link while this is null. */
  terms: null as string | null,
  privacy: "https://metayb.ai/privacy-policy",
};

/** Figures from metayb.ai: the "impact" counters, plus counts of its own solution and industry lists. */
export const stats = {
  team: "500+",
  brands: "20+",
  portfolio: "$2B",
  countries: "12+",
  solutions: "8+",
  industries: "7",
  phases: "3",
};

export const hero = {
  eyebrow: brand.name,
  title: ["AI-native", "transformation."],
  lede: "Metayb helps enterprises modernize and automate through AI, technology, data analytics and cloud solutions.",
  laptopCaption: "Every transformation starts with a screen like this one.",
  enter: "Step inside.",
};

export const chapterCards = {
  idea: { word: "Idea", line: "Every transformation starts here." },
  build: { word: "Build", line: "Welcome to the engine room." },
  scale: { word: "Scale", line: "Now it scales." },
};

/** Floating idea notes: the kind of use cases Metayb helps teams find and build. */
export const ideaNotes = [
  "Forecast demand with AI",
  "Match invoices automatically",
  "Predict machine failures",
  "One view of every warehouse",
  "A copilot for support teams",
  "Live plant dashboards",
  "Move workloads to the cloud",
  "Close the books faster",
];

export const whoFor = [
  "Manufacturing, automotive and logistics teams connecting plants, suppliers and data.",
  "Retail, consumer goods and finance teams streamlining reporting, planning and operations.",
  "Pharma and agriculture teams modernizing workflows with cloud, analytics and IoT.",
];

export const about = {
  eyebrow: "What Metayb is",
  headline: "An AI-native enterprise transformation company.",
  lede: "Metayb helps businesses modernize and automate through AI, technology, data analytics and cloud solutions.",
  whoEyebrow: "Who it’s for",
  whoHeadline: "Your operations. Our AI, data and engineering.",
  clientsEyebrow: "Clients",
  clientsHeadline: `${stats.brands} brands served across SAP, CPG, finance and enterprise technology.`,
  clientsLede: "Real transformation stories from clients who have partnered with Metayb across SAP, digital operations, CPG, finance and enterprise technology.",
  mistakeLine: "Technology is the easier half of enterprise AI adoption.",
  mistakeMuted: "The harder half is people.",
};

// Leadership as published on metayb.ai/leadership ("Leaders Driving Our Vision Forward"), in the site's order
export const leadership = {
  eyebrow: "Leadership",
  title: "Leaders Driving Our Vision Forward",
  lede: "Our leadership team brings together deep expertise and a shared passion for innovation, empowering Metayb to deliver real impact.",
  leaders: [
    { name: "Amit Todi", role: "Founder & CEO", bio: "Driving Metayb’s vision by transforming ideas into impactful digital and AI-powered business solutions.", photo: "/media/leaders/amit-todi.webp", badge: "/media/leaders/badge-amit-todi.webp" },
    { name: "Shweta Todi", role: "Co-Founder & CFO", bio: "Steering financial strategy and governance to enable sustainable growth and long-term business success.", photo: "/media/leaders/shweta-todi.webp", badge: "/media/leaders/badge-shweta-todi.webp" },
    { name: "Vikash Parmanandka", role: "Executive Director", bio: "Driving business growth by aligning strategy, sales, operations, and execution to build scalable businesses and deliver long-term value.", photo: "/media/leaders/vikash-parmanandka.webp", badge: "/media/leaders/badge-vikash-parmanandka.webp" },
    { name: "Varun Selvan", role: "Senior Director - Technology", bio: "Leading technology innovation by building scalable, future-ready solutions that accelerate digital transformation.", photo: "/media/leaders/varun-selvan.webp", badge: "/media/leaders/badge-varun-selvan.webp" },
    { name: "Narendra Anant Patil", role: "Delivery Head – Internet of Things (IoT)", bio: "Delivering intelligent IoT solutions that help businesses unlock operational efficiency and connected innovation.", photo: "/media/leaders/narendra-anant-patil.webp", badge: "/media/leaders/badge-narendra-anant-patil.webp" },
    { name: "Pradeep Manoharan", role: "Delivery Head - Cyber Security", bio: "Leading cybersecurity strategy and resilience by safeguarding enterprise systems, data, and digital operations with a security-first approach.", photo: "/media/leaders/pradeep-manoharan.webp", badge: "/media/leaders/badge-pradeep-manoharan.webp" },
    { name: "Rameshbabu", role: "Director – Data Engineering", bio: "Empowering organizations with robust data engineering capabilities that transform data into actionable insights.", photo: "/media/leaders/rameshbabu.webp", badge: "/media/leaders/badge-rameshbabu.webp" },
    { name: "Sanjay Kumar", role: "Delivery Head – Supply Chain Management (SCM)", bio: "Leading end-to-end supply chain transformation by delivering scalable, efficient, and technology-driven SCM solutions that optimize business performance.", photo: "/media/leaders/sanjay-kumar.webp", badge: "/media/leaders/badge-sanjay-kumar.webp" },
    { name: "Manish Kumar", role: "Delivery Head - Senior Solutions Architect (SAP)", bio: "Leading SAP solutions and enterprise architecture to help organizations streamline operations and accelerate business transformation.", photo: "/media/leaders/manish-kumar.webp", badge: "/media/leaders/badge-manish-kumar.webp" },
    { name: "Suresh Kumar", role: "Solution Architect", bio: "Designing scalable, future-ready technology solutions that align business objectives with seamless digital transformation.", photo: "/media/leaders/suresh-kumar.webp", badge: "/media/leaders/badge-suresh-kumar.webp" },
    { name: "Shantham Sood", role: "Senior Program Manager", bio: "Driving strategic programs with precision, fostering cross-functional collaboration, and ensuring successful delivery of business and technology initiatives.", photo: "/media/leaders/shantham-sood.webp", badge: "/media/leaders/badge-shantham-sood.webp" },
    { name: "Sunitha Hattangadi", role: "Head of Human Resources", bio: "Cultivating a people-first culture by fostering talent, collaboration, and organizational excellence.", photo: "/media/leaders/sunitha-hattangadi.webp", badge: "/media/leaders/badge-sunitha-hattangadi.webp" },
  ],
};

// The 3D leadership stop features the founder; everyone else is in the leadership section below the journey
export const founder = {
  name: "Amit Todi",
  photo: "/media/scenes/founder.webp",
  photoAlt: "Amit Todi, Founder and CEO of Metayb",
  badge: "/media/scenes/skool-badge.webp",
  eyebrow: leadership.eyebrow,
  headline: leadership.title + ".",
  bio: leadership.lede,
  cta: `Meet all ${leadership.leaders.length} leaders`,
  socials: [
    { value: stats.team, label: "Strong team" },
    { value: stats.brands, label: "Brands served" },
    { value: stats.countries, label: "Countries" },
  ],
};

// Social-proof strips (figures above) and the client-logo card
export const creatorBadges = mediaIn("creators");
export const communityCollage = "/media/scenes/community-collage.webp";
export const ideaIcon = "/media/scenes/icon-idea.webp";

export const framework = [
  {
    n: "01",
    icon: "/media/framework/part-1-idea.webp",
    title: "AI, data and analytics.",
    short: "Turn enterprise data into decisions.",
    body: "AI consulting, data analytics and business intelligence that identify use cases and embed AI into daily operations.",
  },
  {
    n: "02",
    icon: "/media/framework/part-2-build.webp",
    title: "Cloud and engineering.",
    short: "Modernize on AWS, Azure or Google Cloud.",
    body: "Cloud consulting, migration, application modernization and enterprise integrations built to scale.",
  },
  {
    n: "03",
    icon: "/media/framework/part-3-launch.webp",
    title: "Automation, ERP and IoT.",
    short: "Connect operations end to end.",
    body: "Intelligent automation, SAP and ERP implementation, and IoT that streamline workflows and give real-time visibility.",
  },
];

export const phasesCard = {
  headline: `From readiness to scale in ${stats.phases} phases.`,
  lede: "Assess readiness, scale what works, then embed and expand. Change management runs alongside the technology.",
};

export const teamCard = {
  eyebrow: "One point of contact",
  headline: "One team for strategy, technology, operations and growth.",
  lede: "Dedicated specialists work alongside yours, from the first workshop to delivery.",
};

export const solutionsCard = {
  headline: "AI, data, cloud, ERP, automation, cybersecurity and IoT.",
  lede: "Eight solution areas, one connected delivery team.",
};

export const industriesCard = {
  eyebrow: "Industries",
  headline: `${stats.industries} industries. One partner.`,
  lede: "Manufacturing, automotive, logistics, retail, pharma, finance and agriculture. Wherever your operations are, we connect plants, suppliers and data.",
};

export const coachingCall = "/media/scenes/coaching-call.webp"; // the Metayb team
export const membersMap = "/media/scenes/members-map.webp"; // reach: 12+ countries
export const buildersFaces = "/media/scenes/builders-faces.webp"; // leaders at AI Impact Expo 2026

// Capability diagrams from metayb.ai/solutions
export const launches = mediaIn("gallery").map((src, i) => ({ src, title: `Metayb solution diagram ${i + 1}` }));

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
  /** backdrop revealed behind SCALE as its letters lift off, 16:9 */
  launch: mediaSlot("ambient/launch"),
};

export type Story = {
  id: string;
  /** the client speaking */
  name: string;
  /** their role and company, e.g. "CTO, Tolaram" */
  byline: string;
  stat: string;
  statLabel: string;
  quote: string;
  detail: string;
  /** Screenshot shown on the floating screen. null = designed poster instead. */
  screen: string | null;
  /** Video embed (Wistia/YouTube iframe URL) or .mp4. null until Metayb has the real video. */
  video: string | null;
};

// Client testimonials as published on metayb.ai. The quote is one whole sentence, the detail is the next sentence, both verbatim.
export const stories: Story[] = [
  {
    id: "tolaram-cto",
    name: "Kavinkumar M",
    byline: "CTO, Tolaram",
    stat: "15+",
    statLabel: "SAP implementations",
    quote: "Metayb has been instrumental in over 15 SAP implementations and several digital initiatives.",
    detail: "Their work has streamlined today's operations while building a strong foundation for our digital future.",
    screen: null,
    video: null,
  },
  {
    id: "tolaram-ceo",
    name: "Pawan Sharma",
    byline: "CEO, Tolaram",
    stat: "3 years",
    statLabel: "reshaping CPG digitally",
    quote: "Metayb has played a pivotal role in reshaping our CPG business digitally.",
    detail: "Their consistency, problem-solving mindset, and dedication over the last three years have made a meaningful impact across Africa.",
    screen: null,
    video: null,
  },
  {
    id: "tolaram-cfo",
    name: "Sandeep Parasramka",
    byline: "CFO, Tolaram",
    stat: "Large scale",
    statLabel: "business transformation",
    quote: "From SAP implementations to large-scale business transformation, Metayb has delivered with clarity, ownership, and reliability.",
    detail: "They have quickly become an integral part of our progress.",
    screen: null,
    video: null,
  },
  {
    id: "tolaram-md",
    name: "Deepak Singhal",
    byline: "Executive Director and MD Consumer Business, Tolaram",
    stat: "Speed",
    statLabel: "and discipline",
    quote: "Metayb has been an exceptional partner in our digital and operational transformation.",
    detail: "Their speed, discipline, and commitment to excellence make them a trusted force behind our growth story.",
    screen: null,
    video: null,
  },
  {
    id: "catalyst",
    name: "Kam",
    byline: "Catalyst",
    stat: "Real time",
    statLabel: "finance visibility",
    quote: "Metayb has transformed how we manage finance across our ecommerce business.",
    detail: "Their proactive insights, accurate reporting, and highly responsive team give us complete confidence in every financial decision.",
    screen: null,
    video: null,
  },
];

export const storiesCard = {
  headline: "What clients say.",
  more: "Explore",
  moreEmpty: "Details coming soon.",
};

export const proofQuote = {
  quote: "Their team is consistently proactive, dependable and highly responsive, giving us the confidence that our technology needs are in capable hands.",
  name: "Manish Tibrewal, Co-Founder, Farro Capital",
  screen: "/media/wins/win-03.webp", // the Metayb team
  headline: "Trusted by growing brands.",
};

export const finale = {
  numbersLine: "Modernize. Automate. Grow.",
  headline: "Ready to transform your enterprise?",
  lede: "Talk to our transformation experts and see where AI can help.",
  primary: "Book a free consultation",
  secondary: "Get in touch",
  note: "Free consultation. No commitment.",
};

/** Contact section (replaces the old pricing plans). */
export const engage = {
  eyebrow: "Contact",
  title: "Let’s talk about your transformation.",
  options: [
    {
      name: "Free consultation",
      price: "Free",
      period: " to start",
      note: "Share your key goals with our team.",
      cta: "Book a consultation",
      href: links.consult,
      featured: true,
    },
    {
      name: "Write to us",
      price: "Email",
      period: ` ${contact.email}`,
      note: `${contact.phone} · Chennai, India`,
      cta: "Send an email",
      href: links.email,
      featured: false,
    },
  ],
  badge: "Start here",
  includedTitle: "Every engagement includes",
  guarantee: "Free consultation.",
  guaranteeNote: "Tell us your goals and we will show where AI, data and automation can help.",
};

export const included = [
  "AI readiness and roadmap",
  "Data, analytics and cloud engineering",
  "SAP, ERP and intelligent automation",
  "IoT and cybersecurity expertise",
  "One team, one point of contact",
];

export const faqTitle = "Questions, answered.";

export const faqs = [
  {
    q: "How do I get started with Metayb?",
    a: "Book a free consultation and share your key goals. Our team will help identify where AI, data and automation can make the biggest difference.",
  },
  {
    q: "How long does an engagement take, and how is it priced?",
    a: "It depends on scope. We typically work in phases: assess readiness, scale what works, then embed and expand. Contact us for a scoped proposal.",
  },
  {
    q: "Which industries do you work with?",
    a: "Manufacturing, automotive, logistics, retail, pharma, finance and agriculture, along with consumer goods and enterprise technology.",
  },
];

/** Every texture the 3D scene uses, preloaded behind the loader. */
export const sceneTextures = [
  ...leadership.leaders.flatMap((l) => [l.photo, l.badge]),
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
