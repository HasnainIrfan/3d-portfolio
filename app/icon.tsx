import { ImageResponse } from "next/og";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg, #5c33cc 0%, #ea4884 100%)",
          color: "white",
          fontWeight: 900,
          fontSize: 40,
          fontFamily: "system-ui",
          borderRadius: 16,
        }}
      >
        H
      </div>
    ),
    { ...size }
  );
}
