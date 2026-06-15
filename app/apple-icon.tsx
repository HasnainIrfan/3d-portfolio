import { ImageResponse } from "next/og";

// Apple touch icon (home-screen). iOS applies its own rounded-corner mask,
// so we render full-bleed with safe padding — no border radius here.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background:
            "linear-gradient(135deg, #5c33cc 0%, #ca2f8c 55%, #ea4884 100%)",
        }}
      >
        {/* soft radial glow behind the monogram */}
        <div
          style={{
            position: "absolute",
            top: 18,
            left: 28,
            width: 130,
            height: 130,
            borderRadius: "50%",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.30) 0%, rgba(255,255,255,0) 70%)",
          }}
        />
        <div
          style={{
            display: "flex",
            color: "white",
            fontFamily: "system-ui, sans-serif",
            fontWeight: 800,
            fontSize: 118,
            lineHeight: 1,
            letterSpacing: -4,
          }}
        >
          H
        </div>
      </div>
    ),
    { ...size }
  );
}
