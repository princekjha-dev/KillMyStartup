import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;

  try {
    // Fetch roast details from backend
    const res = await fetch(`http://localhost:8000/api/roasts/${id}`, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      return new Response("Roast not found", { status: 404 });
    }

    const data = await res.json();
    const startupName = data.startup_name;
    const score = data.survival_score;
    const vectors = Object.values(data.vectors) as any[];

    // Extract top 2 lowest-scoring vectors to get the most brutal quotes
    const sortedVectors = [...vectors].sort(
      (a, b) => a.survival_points - b.survival_points
    );
    const killerQuotes = sortedVectors.slice(0, 2).map((v) => ({
      vectorName: v.name,
      quote: v.killer_quote,
    }));

    // Define colors based on score
    const scoreColor = score >= 70 ? "#10B981" : score >= 40 ? "#FBBF24" : "#EF4444";
    const statusText = score >= 70 ? "REAL POTENTIAL" : score >= 40 ? "FRAGILE HYPOTHESIS" : "CRITICAL CASUALTY";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            backgroundColor: "#08090C",
            backgroundImage: "radial-gradient(circle at 50% 0%, rgba(239, 68, 68, 0.12) 0%, transparent 60%), radial-gradient(circle at 0% 100%, rgba(16, 185, 129, 0.08) 0%, transparent 60%)",
            color: "#F3F4F6",
            padding: "50px 60px",
            fontFamily: "sans-serif",
            justifyContent: "space-between",
            boxSizing: "border-box",
          }}
        >
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: "12px", fontFamily: "monospace", color: "#EF4444", letterSpacing: "2px" }}>
                PITCH DESTRUCTION CYCLE COMPLETE
              </span>
              <span style={{ fontSize: "38px", fontWeight: 800, marginTop: "5px", textTransform: "uppercase" }}>
                {startupName}
              </span>
            </div>
            
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                padding: "10px 20px",
                border: `1px solid rgba(255, 255, 255, 0.1)`,
                backgroundColor: "rgba(15, 17, 22, 0.6)",
                borderRadius: "8px",
              }}
            >
              <span style={{ fontSize: "10px", color: "#9CA3AF", letterSpacing: "1px" }}>SURVIVAL RATING</span>
              <span style={{ fontSize: "28px", fontWeight: 900, color: scoreColor }}>
                {score}/100
              </span>
            </div>
          </div>

          {/* Body: Quotes */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px", margin: "30px 0" }}>
            <span style={{ fontSize: "12px", color: "#6B7280", letterSpacing: "1px" }}>TOP CRITICAL VECTORS</span>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "30px" }}>
              {killerQuotes.map((q, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                    backgroundColor: "rgba(15, 17, 22, 0.8)",
                    borderLeft: `4px solid #EF4444`,
                    padding: "20px",
                    borderRadius: "4px",
                  }}
                >
                  <span style={{ fontSize: "11px", fontWeight: "bold", color: "#EF4444", textTransform: "uppercase", marginBottom: "8px" }}>
                    {q.vectorName}
                  </span>
                  <span style={{ fontSize: "15px", fontStyle: "italic", lineHeight: "1.5", color: "#D1D5DB" }}>
                    &ldquo;{q.quote}&rdquo;
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              width: "100%",
              borderTop: "1px solid rgba(255, 255, 255, 0.05)",
              paddingTop: "20px",
            }}
          >
            <div style={{ display: "flex", alignItems: "center" }}>
              <div
                style={{
                  height: "24px",
                  width: "24px",
                  backgroundColor: "rgba(239, 68, 68, 0.1)",
                  borderRadius: "50%",
                  border: "1px solid rgba(239, 68, 68, 0.3)",
                  marginRight: "10px",
                }}
              />
              <span style={{ fontSize: "13px", fontWeight: "bold", letterSpacing: "1px", color: "#9CA3AF" }}>
                KILLMYSTARTUPIDEA.COM
              </span>
            </div>
            
            <span style={{ fontSize: "12px", color: "#6B7280", fontFamily: "monospace" }}>
              DIAGNOSIS: {statusText}
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e: any) {
    console.error("Satori share card rendering error", e);
    return new Response("Failed to render card image", { status: 500 });
  }
}
