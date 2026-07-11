import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

function cleanJson(raw: string): string {
  let c = raw.trim();
  if (c.startsWith("```")) {
    c = c.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  }
  return c.trim();
}

export async function POST(req: NextRequest) {
  try {
    const { query, base64Image, targetExam, userApiKey, mode } = await req.json();

    let apiKey = userApiKey?.trim();
    if (!apiKey) {
      const serverKeys = (process.env.GEMINI_API_KEY || '').split(',').map(k => k.trim()).filter(Boolean);
      if (serverKeys.length > 0) {
        apiKey = serverKeys[Math.floor(Math.random() * serverKeys.length)];
      }
    }

    if (!apiKey) {
      return NextResponse.json({ error: "Missing API Key" }, { status: 401 });
    }

    const parts: any[] = [];

    if (mode === "multi") {
      parts.push({ text: `Analyze the attached worksheet. Solve all questions for exam: ${targetExam || "SSC CGL"}. JSON only, no markdown.` });
    } else {
      const txt = (query && query !== "Vision OCR math formula" && query !== "Handwritten equation")
        ? `Question: ${query}\nExam: ${targetExam || "SSC CGL"}\nRespond ONLY as valid JSON.`
        : `Scan image, extract and solve all math questions.\nExam: ${targetExam || "SSC CGL"}\nRespond ONLY as valid JSON.`;
      parts.push({ text: txt });
    }

    if (base64Image) {
      let mimeType = "image/jpeg";
      const mm = base64Image.match(/^data:(image\/[\w+]+);base64,/);
      if (mm) mimeType = mm[1];
      const b64 = base64Image.replace(/^data:image\/[\w+]+;base64,/, "");
      parts.push({ inlineData: { mimeType, data: b64 } });
    }

    const sysPrompt = mode === "multi"
      ? `You are ExamSprint AI exam tutor. Analyze worksheet OCR, solve every question for exam "${targetExam}". Return ONLY JSON: { "questions": [ { "number": 1, "text": "...", "topic": "...", "chapter": "...", "difficulty": "Easy|Medium|Hard", "solvingTime": "...", "correctAnswer": "...", "stepByStep": ["..."], "shortcutMethod": "...", "fastTrick": "...", "alternativeSolution": "...", "formulaUsed": "...", "memoryTrick": "...", "commonMistakes": "..." } ] }`
      : `You are ExamSprint AI tutor for Indian govt exams. Answer query for exam "${targetExam}". Return ONLY JSON: { "topic": "...", "chapter": "...", "difficulty": "Easy|Medium|Hard", "solvingTime": "...", "marks": "...", "correctAnswer": "...", "stepByStep": ["..."], "shortcutMethod": "...", "fastTrick": "...", "alternativeSolution": "...", "formulaUsed": "...", "memoryTrick": "...", "commonMistakes": "...", "frequency": "...", "importance": "...", "similarQuestions": ["..."] }`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          systemInstruction: { parts: [{ text: sysPrompt }] },
          generationConfig: { responseMimeType: "application/json", temperature: 0.2, maxOutputTokens: 8192 }
        })
      }
    );

    if (!res.ok) {
      const eb = await res.text();
      let msg = `Gemini ${res.status}`;
      try { msg = JSON.parse(eb).error?.message || eb; } catch { msg = eb.substring(0, 300); }
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    const data = await res.json();
    const txt = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!txt) return NextResponse.json({ error: `Empty Gemini response. Finish: ${data.candidates?.[0]?.finishReason}` }, { status: 500 });

    let parsed: any;
    try { parsed = JSON.parse(cleanJson(txt)); }
    catch { return NextResponse.json({ error: `JSON parse failed: ${txt.substring(0, 100)}` }, { status: 500 }); }

    return NextResponse.json({ result: parsed });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Server error" }, { status: 500 });
  }
}