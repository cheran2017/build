# UTN IMMERSIVE 3D WEBSITE — MASTER PROMPT

Reference experience: https://aibuilders.vip/new
Asset pack: `public/media/` in this project (sourced from aibuilders.vip, see ASSET MAP and CONTENT STATUS)

---

I want you to design and build the UTN website as a fully immersive, cinematic, scroll controlled 3D experience.

This should not feel like a landing page with sections stacked on top of each other.
It should feel like the visitor has walked into one connected 3D world and is moving through a single continuous journey.

The site opens in a calm, minimal, all white 3D studio. A sculptural desk. A premium laptop on top. As the visitor scrolls, the camera drifts toward the laptop. The lid opens. The screen begins to glow. The screen becomes a portal, and the visitor travels through it into the UTN universe.

Inside, the journey moves through three connected worlds, each built around one giant anchor word:

**IDEA**
**BUILD**
**LAUNCH**

Each word is a chapter of the UTN story. Each chapter is a place the visitor travels through, not a title on a screen.

At the end, everything the visitor has seen (launch posts, member faces, numbers, testimonials, screens) converges into one final composition around three letters:

**UTN**

Then the call to action.

The whole site should feel:
premium
futuristic
minimal
bold
cinematic
fluid
dynamic
immersive
spatial
unforgettable

This should be the kind of website people screen record and send to their friends because it feels unreal.

---

## BRAND INPUTS

Fill these in once. Every scene, overlay and CTA pulls from them. All values live in `lib/content.ts`.

| Input | Current value | Status |
|---|---|---|
| Brand name | UTN | UTN |
| Wordmark | "UTN" set in Inter Tight ExtraBold, wide tracking | UTN (swap for the real logo when one exists) |
| Accent colour | UTN Cobalt `#3355FF` | UTN (change freely) |
| One line promise | Build your app with AI. | UTN |
| Supporting line | Go from idea to a launched product in 21 days. No code. No developers. | REF |
| Community size | 500+ builders | REF |
| Apps launched | 275+ live apps | REF |
| Timeline | 21 days, one hour a day | REF |
| Founder | Marcin (founder photo + bio from the asset pack) | REF |
| Testimonials | Drew Griffin, Pedro, Adam, Krzysztof, Misty, Daniel Burns | REF |
| Plans | Standard $67/month, Premium $399/year, 14 day guarantee | REF |
| Join / checkout URL | `#plans` placeholder | TODO |

**REF** means the value comes from the reference asset pack and belongs to AI Builders. It is there so the build looks and feels real during development. Every REF value must be replaced with UTN's own before the site is published. Shipping another community's founder, members, screenshots and results under the UTN name would misrepresent UTN.

---

## CORE EXPERIENCE

The site is one continuous camera journey.

The visitor never feels like they are scrolling down a page.
They feel like they are steering a camera through a connected 3D world.

Scroll drives the camera through space.
The camera moves:
forward
slightly left and right
slightly up and down
occasionally around objects
through giant typography
through the laptop screen
past floating content clusters
through a tunnel of launch posts
over and around monumental numbers

Everything is connected.
Every transition moves the visitor from one world into the next.
Nothing hard cuts unless it is a deliberate, designed flash (the laptop portal and the tunnel exit are the only two).

---

## BIG CREATIVE DIRECTION

This website has to combine:
giant 3D typography
immersive spatial storytelling
real business information
social proof from creators and members
image galleries of real launch posts
testimonials
video screens
product screenshots
the 3 part framework
founder credibility
community energy
a strong call to action

Looking cool is not the challenge.
The challenge is presenting a lot of real information in a way that still feels beautiful, high end and effortless to absorb.

The rule:
Do not turn information into sections.
Turn information into environments.

---

## NARRATIVE FLOW

### SCENE 1: THE WHITE STUDIO

Open in a minimal, all white 3D room.
A futuristic design studio or gallery showroom. Not an office. Highly curated. Nothing extra.

Include:
seamless white floor and walls with a soft cove where they meet
soft ambient light from a large overhead source
gentle contact shadows under the desk and laptop
one sculptural desk: a thick, rounded slab on a single monolithic pedestal
one premium aluminium laptop, lid almost closed
one small matte sphere on the desk for balance, nothing more
zero clutter

The room should feel calm, clean and expensive.

The camera starts on a wide shot, slightly above eye level, looking down at the desk.

HTML overlay, left aligned, large and quiet:

> **UTN**
> # Build your app with AI.
> Go from idea to a launched product in 21 days. No code. No developers. A proven path, and 500+ builders beside you.
> [ Join UTN → ]

As the visitor scrolls, the camera slowly pushes in toward the desk, arcing slightly to the right and then back to centre. The move is deliberate and weighted, like a dolly on rails.

Small caption as the laptop fills the frame:

> Every product in this story started on a laptop like this one.

### SCENE 2: THE LAPTOP PORTAL

As the camera approaches, the lid opens from nearly closed to fully open.
The screen wakes up: a dark UI with the UTN wordmark and a soft cobalt glow.
The closer the camera gets, the brighter the screen becomes, until it fills the viewport.

Centre overlay, one line, white on dark:

> Step inside.

The camera passes through the screen. The frame flashes to white, and the visitor is inside a tunnel of light rings that flare wider as they rush past. Streaks of light run along the tunnel walls. The motion speeds up here, the only place in the site where it does.

The tunnel opens into the IDEA world with a second soft white flash.

This is the entry point into UTN.

### SCENE 3: IDEA WORLD

Theme: light. Off-white fog, charcoal typography, cobalt accents.

The first thing inside is the word:

**IDEA**

Giant, extruded, architectural. Charcoal on off-white. It sits on the horizon at the end of this world and grows as the camera travels toward it.

This world explains:
what UTN is
who it is for
why it matters now
the transformation that is possible
the founder behind it and why to trust them

Visual elements in IDEA:
floating wireframe browser windows and phone outlines (drawn with thin lines)
sticky note cards with early idea fragments ("A tool for dog walkers", "Invoices, but simple", "What if my spreadsheet was an app?")
a glowing "YOUR IDEA" sphere with a mind map of nodes: Problem, Audience, Price, MVP, Launch
the creator social proof badges floating in a staggered column
the creator collage on a large gallery panel
the founder portrait on a framed panel with the award badge beneath it
soft drifting particles

Camera path: forward, with four lateral reveals, alternating sides. At each stop the 3D content sits on one side of the frame and an HTML card appears on the other.

Stop 1 — left card, content right (wireframes and idea notes)
> **What UTN is**
> ## Real apps. Built by people who never wrote code.
> UTN is where beginners, creators and founders build and launch real products with AI and no code tools.

Stop 2 — right card, content left (YOUR IDEA mind map)
> **Who it's for**
> ## You bring the idea. AI does the heavy lifting.
> - You feel stuck and want real control of your future.
> - You want income you control, not income a boss decides.
> - You want to build something real, even if you never have.

Stop 3 — left card, content right (creator collage and follower badges)
> **Social proof**
> ## People are talking about what gets built here.
> Creators with over 1M combined followers have shared what our members are building.

Stop 4 — right card, content left (founder portrait, award badge)
> **Meet the founder**
> ## Hey, I'm [Founder].
> I help people with zero coding experience build their own software and break free from the 9 to 5. We don't waste time. We build. We launch. We learn by doing.
> Stats row: follower counts per platform

Final beat, centred card:
> ## The biggest mistake isn't picking the wrong idea.
> ### It's not building anything at all.

Then the camera lines up with the letter **D** and flies straight through its counter. As it passes through, the world darkens. We are entering BUILD.

### SCENE 4: BUILD WORLD

Theme: dark. Near black fog, brushed metal typography, cobalt light lines, glowing grid floor.

The second giant word:

**BUILD**

Brushed metal, heavy. The letters drop into place one after another as the camera arrives. The camera rises up and over the word, and the engine room opens up behind it.

This is the most important and richest world. It proves the system is real.

It must show:
the 3 part framework
the 21 day promise
weekly live coaching
the tunnel of real member launch posts
the global member map
the wall of member faces
the scale of the community

Visual structures:
three framework pillars: tall dark slabs with a cobalt number, icon, title and short line, standing on thin metal rods
a monumental **21 DAYS** in extruded metal
a giant suspended monitor showing the live coaching call with a pulsing red LIVE tag
a helix of launch post screens spiralling around the camera path (the camera flies through the middle)
the member map as a huge suspended screen
the builders faces panel below it
slow tumbling metal cubes in the far distance for depth

Framework reveals, like an exhibition:

Left reveal — Pillar 01
> **The framework · Part 1 of 3**
> ## Pick your idea.
> Find an idea that can actually make money. A 48 hour audit finds the idea already in you, or validates the one you have.

Forward reveal — Pillar 02
> **The framework · Part 2 of 3**
> ## Build your first project.
> Ship in as little as 10 days. Step by step training, prompts, and tech help when you're stuck. AI does the hard part. You lead the vision.

Upper reveal (the camera tilts up) — Pillar 03
> **The framework · Part 3 of 3**
> ## Launch and get customers.
> Put it in front of real users in days. Landing pages, email sequences, launch checklists. Don't just build it. Sell it.

Then the monument:
> ## Idea to launched product in 21 days.
> One hour a day, max. Move at your own pace. The goal is the finish line.

Coaching monitor (on the right, so the camera turns over the low DAYS word rather than past the tall 21), left card:
> **Weekly live coaching**
> ## Live calls every week. Real help in real time.
> Co build with the team. Watch other members build. Get unstuck fast. Nothing prerecorded.

Launch post helix, centred card:
> ## 275+ live apps built inside UTN.
> Every screen around you is a real member launch post.

Member map, right card:
> **Community**
> ## 500+ builders. One room.
> From San Francisco to Singapore, non technical founders build together. Find collaborators. Get feedback. Your cofounder might already be inside.

Short headlines only. Anything longer than two lines lives in the HTML overlay, never in 3D text.

### SCENE 5: LAUNCH WORLD

Theme: dark with more cobalt energy. Faster, brighter, outward.

The third giant word:

**LAUNCH**

White, glossy, with a cobalt underglow. As the camera approaches, the letters lift off one by one, like they are launching.

This is where outcomes explode. Things are no longer forming. They are happening.

It shows:
testimonials as monoliths
member wins with real numbers
screens of launched products and launch posts
stat monuments
a closing proof line

Visual ideas:
five tall testimonial monoliths, alternating left and right, each with a big stat on top ("$200K+", "36 hrs", "7 days", "3 exits", "First app"), a short quote, and a floating screen beside it showing that member's launch post
launch post screens flying outward past the camera
giant floating numbers: **500+**, **275+**, **21**
a slightly faster camera with gentle banking on turns

Testimonial monoliths (overlay card on the opposite side, with a "Watch the story" button that opens a video modal):

> **Drew Griffin · Member** — $200K+
> ## "AI Builders is grossly underpriced for what you get."
> Drew launched SendPush.io and has passed $200K in revenue.

> **Pedro · Member** — 36 hrs
> ## "In 36 hours to a fully functional B2B SaaS. Vibe coded."
> Pedro was stuck getting his software off the ground. A few weeks after joining, he built it in 36 hours.

> **Adam · Member** — 7 days
> ## "AI Builders helped me get my app live on the App Store in 7 days."
> Adam had never launched software before. His first mobile app is live.

> **Krzysztof · Member** — 3 exits
> ## "Marcin helped me build and sell 3 SaaS businesses."
> Started with the videos, built his own SaaS products, and just sold his third.

> **Misty · Member** — First app
> ## "The community massively increased my productivity."
> No tech background. With the community behind her, she launched CartoViva.

All five are REF (see CONTENT STATUS) and quoted verbatim, which is why they still name AI Builders. Never edit a testimonial to swap in UTN: replace the whole testimonial with a real UTN member's words.

Proof line, centred:
> ## Real apps. Real builders. Real results.
> "AI is the biggest disruption in tech history, and we can now use it." — Daniel Burns

Big line as the numbers fly past:
> # Build fast. Launch faster.

Then the world starts converging.

### SCENE 6: FINAL CONVERGENCE

Every launch post, face, screen and proof panel the visitor has passed gathers from where it was scattered and swirls into a slow golden-angle spiral around a single word:

**UTN**

The background washes from dark back to the off-white of the opening studio. The loop closes: we started in a white room with one laptop, and we end in white with hundreds of launched products orbiting the brand.

Final overlay, centred:
> # Stop watching. Start building.
> Join 500+ builders turning ideas into launched products.
> [ Join UTN → ] [ See plans ]
> 14 day money back guarantee

Below the journey, as normal HTML:
Plans (two cards, the featured one highlighted in cobalt)
"Both plans include" list
Guarantee line
Footer with FAQ (opens a dialog), Terms, Privacy

---

## HOW CONTENT SHOULD BE DISPLAYED

This is critical.
Nothing is a flat block. Different content types behave differently.

**Testimonials**
Tall spatial monoliths. From far away you see the stat and a short quote. Up close, the HTML card adds the name, result and detail. The "Watch the story" button opens a modal.

**Image galleries**
Launch post screens as a helix tunnel the camera flies through, and as scattered panels at different depths. No flat grids, except in the reduced motion and no WebGL fallback.

**Videos**
Floating screens with a poster frame and a play button, built into the world. Click opens a modal player (Wistia, YouTube or MP4). Poster frames come from the asset pack until real videos exist.

**Stats and proof**
Monumental extruded numbers: **21 DAYS**, **500+**, **275+**, **$200K+**. They are architecture, not badges.

**Framework**
Three physical pillars with a number, icon and one line in 3D. Readable detail lives in the HTML card for that stop.

**Readable copy**
Anything longer than a headline is an accessible HTML overlay tied to a moment in the timeline. Never tiny 3D text.

---

## ASSET MAP

Every file below is in `public/media/`, optimised to WebP (max 1600px). Originals are kept in `reference/raw-media/`.

| File | What it shows | Where it goes |
|---|---|---|
| `scenes/community-collage.webp` | Creator collabs collage (Dan Martell, Sabrina Ramonov, Russell Brunson) | IDEA stop 3, large gallery panel |
| `creators/creator-01…06.webp` | Creator follower badges (TikTok, YouTube, Instagram) | IDEA stop 3, staggered column beside the collage |
| `scenes/founder.webp` | Founder with fellow builders at Skool Games | IDEA stop 4, framed portrait |
| `scenes/skool-badge.webp` | "Official Skool Games Winner" badge | IDEA stop 4, beneath the portrait |
| `scenes/icon-idea.webp` | Idea icon | IDEA stop 2, next to the YOUR IDEA sphere |
| `framework/part-1-idea.webp` | Glass icon, lightbulb with $ | BUILD pillar 01 |
| `framework/part-2-build.webp` | Glass icon, build | BUILD pillar 02 |
| `framework/part-3-launch.webp` | Glass icon, launch | BUILD pillar 03 |
| `framework/marketing.webp` | Glass icon, marketing | Plans section, "Both plans include" |
| `benefits/framework.webp` | "Build & launch in 3 steps" graphic | Fallback view, framework section |
| `scenes/coaching-call.webp` | 12 person live coaching call grid | BUILD suspended LIVE monitor |
| `benefits/coaching.webp` | Coaching promo graphic | Fallback view |
| `gallery/launch-01…17.webp` | Real member launch and win posts | BUILD helix tunnel, LAUNCH flying screens, FINALE spiral |
| `scenes/members-map.webp` | Global member map | BUILD community screen |
| `scenes/builders-faces.webp` | "Join 500+ builders inside" faces panel | BUILD, beneath the map |
| `benefits/community.webp` | Community promo graphic | Fallback view |
| `wins/win-01…03.webp` | Framed launch posts on black (Drew, Krzysztof, more) | LAUNCH testimonial screens and video posters |
| `benefits/discounts.webp` | Tool discounts graphic | Plans section |

The AI Builders logo and OG image are kept only in `reference/raw-media/` and never used on the UTN site. UTN uses its own wordmark.

---

## CONTENT STATUS

Build with the REF content so the experience feels alive. Before launch, replace every REF item with UTN's own:
founder name, photo, bio and follower counts
all testimonials, names, results and win screenshots
community size, apps launched, timeline claims
creator badges and collage
plans, prices and guarantee
join and checkout URLs

All REF values are marked `// REF` in `lib/content.ts`, so this is a one file job.

---

## INFORMATION ARCHITECTURE

The full story the site must land:
1. UTN helps non technical people build real apps and products with AI
2. There is a clear path from idea to launch (21 days, 3 parts)
3. There is training, weekly live coaching and co building
4. There is a real, global community
5. People inside are already building and launching
6. There are real success stories with real numbers
7. The visitor can join now, risk free

---

## MOTION SYSTEM

One connected motion system.

A master scroll timeline. Scroll position maps to journey progress from 0 to 1.
Forward scroll moves forward through the world. Scrolling back reverses naturally.

The timeline is measured in beats. Each camera keyframe has a travel duration and a hold duration, both in beats. One beat is about 70% of the viewport height of scrolling on desktop and 60% on mobile.

The camera path is a centripetal Catmull-Rom spline through the keyframe positions, with a second spline for the look target. Travel between keyframes uses sine in-out easing, so the camera settles at each stop and then pulls away. On top of that, the rendered camera damps toward the target each frame, giving it weight.

Movement should feel heavy, cinematic and intentional.
No twitchy motion. Almost no spinning.
Mostly forward, with carefully timed lateral and vertical reveals.

Moments to design for:
slow anticipation (white studio push in)
accelerated portal travel (the tunnel)
controlled drift (IDEA stops)
close flybys (framework pillars, monoliths)
reveal turns (rising over BUILD, tilting up to Pillar 03)
through-typography passes (the D of IDEA)
converging motion (finale spiral)

Scene colour (background and fog) is keyed to the camera keyframes and blends with the same easing, so worlds change mood as you travel rather than cutting.

HTML overlays are keyed to the same beats: each card has a start and end relative to a keyframe, fades in over a quarter beat and out over a quarter beat, and only takes pointer events while visible.

A chapter nav (Idea · Build · Launch · Join) shows progress and jumps to each chapter with a smooth two second scroll.

The camera is the main character.

---

## TECHNOLOGY

Build with:
Next.js (App Router)
React
React Three Fiber
Drei
Three.js
GSAP ScrollTrigger
Lenis

Architecture:
one `<Canvas>`, one scene, one camera for the whole journey
the canvas is fixed full screen; a tall invisible spacer element creates the scroll length
Lenis smooths scroll and drives `ScrollTrigger.update`; GSAP's ticker drives Lenis
a scrubbed GSAP timeline writes journey progress into a shared, non-React store, so the scene reads it every frame without re-rendering React
all content (copy, numbers, asset paths, testimonials) in `lib/content.ts`
all camera keyframes, beats, chapters and overlay timing in `lib/journey.ts`, with separate desktop and mobile values

Reusable components:
`Word3D`: extruded 3D word with per-letter animation (drop in, lift off)
`ImagePanel`: framed image in space, with light, dark or no frame
`QuoteMonolith`: testimonial slab with stat, quote and screen
`StatMonument`: giant extruded number with label
`VideoScreen`: floating monitor with poster and play button that opens the modal
`FrameworkPillar`: numbered slab with icon, title and line
`Overlay`: HTML card bound to a beat window
`ChapterNav`, `Loader`, `VideoModal`, `JoinSection`, `ClassicView`

3D type: convert Inter Tight ExtraBold into a Three.js typeface JSON (`scripts/make-typeface.mjs`) so the 3D words match the HTML type.

---

## PERFORMANCE

Premium means smooth.

Requirements:
every texture optimised to WebP, max 1600px (`scripts/optimize-media.mjs`)
build the room, laptop and pillars from primitives (no heavy models)
instance repeated objects (tunnel rings, streaks, cubes, particles)
only render worlds near the camera (each world group toggles visibility by journey progress)
no post processing
DPR capped at 1.75 on desktop and 1.5 on mobile
a loader that waits for textures, with progress
lower object counts on mobile: fewer particles, fewer helix screens, a smaller finale spiral
preserve the whole narrative in simplified versions
respect `prefers-reduced-motion`

---

## MOBILE

Same story, lighter scene.

Keep:
white studio
laptop portal
IDEA
BUILD
LAUNCH
final convergence and CTA

Change:
mobile specific camera keyframes: pulled back and closer to centre so wide words fit
lateral stops pull toward centre; cards become bottom sheets instead of side cards
fewer objects, as listed under PERFORMANCE
a slightly shorter beat length

---

## ACCESSIBILITY AND FALLBACK

If the visitor prefers reduced motion, or WebGL isn't available, or `?view=classic` is set, show the classic view: the same story as clean, stacked editorial HTML sections, with the gallery as a grid and every CTA intact. The classic view links to `?view=3d` for anyone who wants the tour anyway.

All overlay copy is real HTML text in the DOM order of the story. Buttons are keyboard reachable. The video modal traps focus and closes on Escape.

---

## DESIGN LANGUAGE

Apple level clean
high end
futuristic
editorial
immersive
minimal but powerful

Palette:
white `#FFFFFF`
off-white `#F3F3F0` (studio, IDEA, finale)
charcoal `#111216` (IDEA type)
near black `#08090C` (BUILD, LAUNCH)
steel gray `#AEB3BF` (secondary text on dark)
one accent: UTN Cobalt `#3355FF`

Type:
display and 3D: Inter Tight, ExtraBold, tight tracking
body: Inter

Use glow sparingly (laptop screen, tunnel, LAUNCH underglow).
Use fog for depth, not for effect.
No neon overload.
No generic glass UI spam.
No gaming aesthetics.
Everything intentional. Everything elegant.

---

## ASSET GENERATION DIRECTION

Use Higgsfield and Seedance 2.5 to generate supporting visuals for the world:
ambient cinematic loops for the laptop screen and the tunnel
abstract idea world backdrops (wireframes, sketches forming)
premium monitor content loops for BUILD
kinetic backgrounds for LAUNCH
a soft portal tunnel sequence
clean founder intro environment screens
transition plates

The build has three ready slots for generated loops (muted, seamless, 1080p or less, under 8 MB each):
the laptop screen in the white studio (16:10)
a huge backdrop above the IDEA word (16:9, seen through light fog)
a backdrop revealed behind LAUNCH as its letters lift off (16:9, unfogged, glowing in the dark)

Generated assets support the world. They never replace it.
Real screenshots, real launch posts, real testimonials and real proof always come first.

Style for every generated asset:
cinematic
premium
minimal
clean
depth rich
monochrome with a touch of cobalt
spatial
polished
never cheesy
never over designed

Prompt starters:
"Slow dolly through an infinite white studio, soft overhead light, one floating wireframe browser window, monochrome, cinematic, 4K loop"
"Tunnel of thin glowing rings rushing past the camera, cobalt and white light streaks, black background, seamless loop"
"Dark engine room of floating app screens, brushed metal, cobalt light lines, slow push in, loop"
"Abstract launch: dozens of glowing app cards accelerating outward into black space, cobalt trails, loop"

---

## DEVELOPMENT PHASES

**Phase 1** — Shell and master scroll system: Next.js app, fixed canvas, Lenis plus ScrollTrigger, journey store, beat timeline, debug camera.
**Phase 2** — White studio and laptop portal: room, desk, laptop, lid animation, screen glow, flash, tunnel.
**Phase 3** — IDEA world: word, wireframes, notes, mind map, social proof, founder, fly through the D.
**Phase 4** — BUILD world: word drop, rise over, pillars, 21 DAYS, coaching monitor, launch helix, map and faces.
**Phase 5** — LAUNCH world: word lift off, monoliths, screens, stat monuments.
**Phase 6** — Convergence and CTA: spiral gather around UTN, colour wash to white, final overlay, plans, FAQ, footer.
**Phase 7** — Content pass: replace every REF item with UTN's real founder, members, numbers, videos and URLs.
**Phase 8** — Performance, mobile keyframes, reduced motion, classic fallback, Lighthouse pass.

---

## IMPORTANT CREATIVE RULES

It must feel like one connected 3D world.
Every chapter flows into the next.
The visitor travels. They don't browse.
Information is staged, never dumped.
Visually insane, but always understandable.
Motion reveals the story.
Dynamic from the first frame to the last.
Movement in every direction when it earns it: left, right, up, down, forward, through, around.
Everything works together as one system.
Bold, original, cinematic and built to convert.

---

## FINAL GOAL

Anyone who visits should instantly get it:

**"I can come here with an idea, build it with AI, launch something real, and do it alongside people who are actually doing it."**

This should be one of the most visually impressive websites in its space, while still clearly selling UTN.

Make it feel like walking into a machine that turns ideas into launched products.
Make it beautiful.
Make it immersive.
Make it unforgettable.
Make it badass.
