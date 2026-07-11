import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { history, userApiKey } = body;

    const serverKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    const apiKey = (userApiKey && userApiKey.trim()) ? userApiKey.trim() : serverKey;

    if (!apiKey) {
      return NextResponse.json({ error: "No Gemini API key configured" }, { status: 400 });
    }

    const contents = (history || []).map((msg: any) => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.content }]
    }));

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: "You are the AI mathematics and exam tutor for ExamSprint AI. If the student asks to explain or translate, do so accurately in that language." }]
          },
          generationConfig: { maxOutputTokens: 500, temperature: 0.7 }
        })
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      return NextResponse.json({ error: `Gemini API error: ${response.status} - ${errorBody}` }, { status: response.status });
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "No response received.";
    return NextResponse.json({ text });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
