import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { brand, seo } from "@/lib/content";

// The link preview on social networks and chat apps. Generated at build time.
// It echoes the site's opening: a white studio headline beside the glowing laptop screen that becomes the portal.

export const alt = seo.shareAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = (w: number) => readFile(join(process.cwd(), "public", "fonts", `inter-tight-${w}.woff`));

export default async function Image() {
  const [bold, medium] = await Promise.all([font(800), font(500)]);
  const accent = brand.accent;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          padding: "0 72px",
          background: "#f3f3f0",
          fontFamily: "Inter Tight",
          color: "#111216",
        }}
      >
        {/* left: wordmark + headline. Widths add up to the 1200 frame: 72 + 540 + 44 + 472 + 72 */}
        <div style={{ display: "flex", flexDirection: "column", width: 540 }}>
          <div style={{ fontSize: 30, fontWeight: 800, letterSpacing: "0.14em", marginBottom: 40 }}>{brand.name}</div>
          <div style={{ fontSize: 92, fontWeight: 800, lineHeight: 0.96, letterSpacing: "-0.035em" }}>{seo.shareHeadline}</div>
          <div style={{ display: "flex", alignItems: "center", marginTop: 40 }}>
            <div style={{ width: 56, height: 6, borderRadius: 3, background: accent, marginRight: 18 }} />
            <div style={{ fontSize: 28, fontWeight: 500, color: "#3b3e46" }}>{seo.shareLine}</div>
          </div>
        </div>

        {/* right: the laptop screen from the opening shot */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginLeft: 44 }}>
          <div
            style={{
              width: 420,
              height: 268,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 18,
              border: "10px solid #0b0c10",
              background: `radial-gradient(circle at 50% 55%, rgba(51,85,255,0.65), rgba(51,85,255,0) 62%), linear-gradient(180deg, #0a0c13, #0e1330)`,
              boxShadow: "0 40px 80px -30px rgba(17,18,22,0.55)",
            }}
          >
            <div style={{ fontSize: 100, fontWeight: 800, color: "#ffffff", letterSpacing: "0.02em" }}>{brand.name}</div>
            <div style={{ fontSize: 18, fontWeight: 500, color: "#aeb3bf", letterSpacing: "0.2em", marginTop: 6 }}>IDEA · BUILD · LAUNCH</div>
            <div style={{ width: 70, height: 5, background: accent, marginTop: 18 }} />
          </div>
          {/* laptop base */}
          <div style={{ width: 472, height: 14, borderRadius: "0 0 12px 12px", background: "linear-gradient(180deg, #d9dce1, #aeb2b9)" }} />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter Tight", data: bold, weight: 800, style: "normal" },
        { name: "Inter Tight", data: medium, weight: 500, style: "normal" },
      ],
    },
  );
}
