import {
  AbsoluteFill,
  Img,
  interpolate,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

export function LuaBrancaIntro() {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const reveal = spring({ frame, fps, config: { damping: 18, stiffness: 68 } });
  const pulse = Math.sin(frame / 12) * 0.5 + 0.5;
  const scan = interpolate(frame, [0, 150], [-160, 1240]);
  const opacity = interpolate(frame, [0, 18, 130, 150], [0.92, 1, 1, 0.85], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill style={{ backgroundColor: "#05070B", color: "#ECF7FF", opacity }}>
      <AbsoluteFill
        style={{
          backgroundImage:
            "linear-gradient(rgba(158,231,255,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(158,231,255,0.08) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
          opacity: 0.28,
        }}
      />
      <AbsoluteFill
        style={{
          background:
            "linear-gradient(180deg, rgba(6,17,29,0.92), rgba(8,16,23,0.78) 42%, rgba(5,7,11,0.96))",
        }}
      />
      <div
        style={{
          position: "absolute",
          inset: 0,
          transform: `translateY(${scan}px)`,
          height: 96,
          background:
            "linear-gradient(180deg, transparent, rgba(158,231,255,0.18), transparent)",
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: 0,
          bottom: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            width: 520,
            height: 520,
            border: "1px solid rgba(170,183,196,0.38)",
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            transform: `scale(${0.82 + reveal * 0.18}) rotate(${interpolate(frame, [0, 150], [-8, 4])}deg)`,
            boxShadow: `0 0 ${42 + pulse * 28}px rgba(158,231,255,0.18)`,
          }}
        >
          <Img
            src={staticFile("media/lua-branca-symbol.svg")}
            style={{
              width: 390,
              height: 390,
              opacity: 0.92,
              transform: `scale(${0.92 + reveal * 0.08})`,
            }}
          />
        </div>
      </div>

      <div
        style={{
          position: "absolute",
          left: 120,
          right: 120,
          bottom: 120,
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: 48,
        }}
      >
        <div>
          <div
            style={{
              fontSize: 22,
              letterSpacing: 8,
              textTransform: "uppercase",
              color: "rgba(158,231,255,0.68)",
              marginBottom: 22,
            }}
          >
            Arquivo reservado
          </div>
          <div
            style={{
              fontSize: 92,
              lineHeight: 1,
              fontWeight: 700,
              letterSpacing: 0,
              color: "#FFFFFF",
              transform: `translateY(${interpolate(reveal, [0, 1], [36, 0])}px)`,
            }}
          >
            Lua Branca
          </div>
        </div>

        <div
          style={{
            width: 420,
            borderLeft: "1px solid rgba(170,183,196,0.38)",
            paddingLeft: 28,
            fontSize: 24,
            lineHeight: 1.55,
            color: "rgba(236,247,255,0.76)",
          }}
        >
          Registros, teses, tecnicas e estruturas sob classificacao continua.
        </div>
      </div>
    </AbsoluteFill>
  );
}
