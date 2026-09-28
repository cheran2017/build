import sharp from "sharp";
import { readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

async function generateBadge() {
  const founderPath = join(process.cwd(), "assets", "scenes", "founder.jpg");
  const meta = await sharp(founderPath).metadata();
  console.log("Original founder image dimensions:", meta.width, "x", meta.height);

  // Crop head & face for the avatar
  const avatarSize = Math.round(meta.width * 0.35);
  const left = Math.round((meta.width - avatarSize) / 2);
  const top = Math.round(meta.height * 0.23);

  const avatar = await sharp(founderPath)
    .extract({ left, top, width: avatarSize, height: avatarSize })
    .resize(110, 110)
    .composite([
      {
        input: Buffer.from(
          '<svg width="110" height="110"><circle cx="55" cy="55" r="55" fill="#fff"/></svg>'
        ),
        blend: "dest-in",
      },
    ])
    .png()
    .toBuffer();

  const avatarBase64 = `data:image/png;base64,${avatar.toString("base64")}`;

  // SVG badge matching the original 1200x243 dimensions with modern, high-res styling
  const width = 1200;
  const height = 243;

  const svg = `
  <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="bgGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#ffffff"/>
        <stop offset="100%" stop-color="#f8f9fa"/>
      </linearGradient>
      <linearGradient id="trophyGrad" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#FFD700"/>
        <stop offset="50%" stop-color="#FFA500"/>
        <stop offset="100%" stop-color="#FF4500"/>
      </linearGradient>
      <linearGradient id="borderGrad" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#0052FF"/>
        <stop offset="50%" stop-color="#3355FF"/>
        <stop offset="100%" stop-color="#0040E0"/>
      </linearGradient>
      <filter id="shadow" x="-5%" y="-5%" width="110%" height="115%">
        <feDropShadow dx="0" dy="2" stdDeviation="3" flood-opacity="0.08"/>
      </filter>
    </defs>

    <!-- Outer Pill border & background -->
    <rect x="5" y="5" width="1190" height="233" rx="116.5" ry="116.5" fill="url(#bgGrad)" stroke="url(#borderGrad)" stroke-width="9"/>

    <!-- Main Title -->
    <text x="600" y="86" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="54" font-weight="800" fill="#0c0e14" letter-spacing="-1">Official Skool Games Winner</text>

    <!-- Sub-row content -->
    <g transform="translate(60, 114)">
      <!-- Flame / Trophy Icon -->
      <g transform="translate(10, 0)">
        <rect x="18" y="68" width="16" height="34" fill="#5c2c16" rx="3" />
        <rect x="10" y="60" width="32" height="12" fill="#8b4513" rx="2" />
        <path d="M26 4 C26 4 12 28 12 44 C12 55 18 60 26 60 C34 60 40 55 40 44 C40 28 26 4 26 4 Z" fill="url(#trophyGrad)" />
        <path d="M26 22 C26 22 18 36 18 46 C18 52 22 55 26 55 C30 55 34 52 34 46 C34 36 26 22 26 22 Z" fill="#FFE066" />
      </g>

      <!-- Founder Avatar & Name -->
      <g transform="translate(90, 0)">
        <image href="${avatarBase64}" x="0" y="0" width="94" height="94"/>
        <circle cx="47" cy="47" r="47" fill="none" stroke="#3355FF" stroke-width="3.5"/>
        <text x="115" y="60" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="34" font-weight="700" fill="#15171c">AI Builders 🚀</text>
      </g>

      <!-- Brand pill icon & title -->
      <g transform="translate(560, 6)">
        <rect x="0" y="0" width="82" height="82" rx="22" fill="#0c0e14"/>
        <!-- Rocket inside icon -->
        <path d="M41 16 C33 24 29 38 29 46 C33 44 37 45 41 47 C45 45 49 44 53 46 C53 38 49 24 41 16 Z" fill="#ffffff"/>
        <path d="M27 46 L20 52 L27 56 Z" fill="#ffffff"/>
        <path d="M55 46 L62 52 L55 56 Z" fill="#ffffff"/>
        <circle cx="41" cy="32" r="5" fill="#0c0e14"/>
        <text x="105" y="52" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="34" font-weight="700" fill="#15171c">UTN</text>
      </g>

      <!-- Skool Logo -->
      <g transform="translate(870, 10)">
        <text x="0" y="54" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif" font-size="68" font-weight="900" letter-spacing="-2">
          <tspan fill="#2b47aa">sk</tspan><tspan fill="#df4826">o</tspan><tspan fill="#f59c23">o</tspan><tspan fill="#995039">l</tspan>
        </text>
      </g>
    </g>
  </svg>
  `;

  const outBadgePath = join(process.cwd(), "assets", "scenes", "skool-badge.png");
  await sharp(Buffer.from(svg))
    .png()
    .toFile(outBadgePath);

  console.log("Badge generated successfully at:", outBadgePath);
}

generateBadge().catch(console.error);
