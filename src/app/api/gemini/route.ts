import { NextRequest, NextResponse } from "next/server";

export const runtime = "edge";

function cleanJsonResponse(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { query, base64Image, targetExam, userApiKey, mode } = body;

    const serverKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
    const apiKey = (userApiKey && userApiKey.trim()) ? userApiKey.trim() : serverKey;

    if (!apiKey) {
      return NextResponse.json({ error: "No Gemini API key configured" }, { status: 400 });
    }

    const parts: any[] = [];

    if (mode === "multi") {
      parts.push({ text: `Analyze the attached worksheet and solve all questions for Target Exam: ${targetExam}. Respond strictly in JSON format with a "questions" array.` });
    } else {
      let promptText = "";
      if (query && query !== "Vision OCR math formula" && query !== "Handwritten equation") {
        promptText = `Question/Query: ${query}\n\nTarget Exam: ${targetExam}\n\nRespond strictly with the specified JSON structure.`;
      } else {
        promptText = `Question: Scan, extract and solve the mathematical or conceptual question present in the attached image.\n\nTarget Exam: ${targetExam}\n\nRespond strictly with the specified JSON structure.`;
      }
      parts.push({ text: promptText });
    }

    if (base64Image) {
      let mimeType = "image/jpeg";
      const mimeMatch = base64Image.match(/^data:(image\/\w+);base64,/);
      if (mimeMatch) mimeType = mimeMatch[1];
      const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, "");
      parts.push({ inlineData: { mimeType, data: base64Data } });
    }

    const systemPrompt =
      mode === "multi"
        ? `You are ExamSprint AI, an expert exam tutor scanner. Analyze the attached worksheet, OCR-scan, identify every individual question, number them, and solve each for target exam: "${targetExam}". Respond STRICTLY as JSON: { "questions": [ { "number": 1, "text": "...", "topic": "...", "chapter": "...", "difficulty": "Easy|Medium|Hard", "solvingTime": "...", "correctAnswer": "...", "stepByStep": ["..."], "shortcutMethod": "...", "fastTrick": "...", "alternativeSolution": "...", "formulaUsed": "...", "memoryTrick": "...", "commonMistakes": "..." } ] }`
        : `You are ExamSprint AI, India's most advanced learning platform for competitive exams. Answer the query (text or image) for target exam: "${targetExam}". Respond STRICTLY as JSON: { "topic": "...", "chapter": "...", "difficulty": "Easy|Medium|Hard", "solvingTime": "...", "marks": "...", "correctAnswer": "...", "stepByStep": ["..."], "shortcutMethod": "...", "fastTrick": "...", "alternativeSolution": "...", "formulaUsed": "...", "memoryTrick": "...", "commonMistakes": "...", "frequency": "...", "importance": "...", "similarQuestions": ["..."] }`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts }],
          systemInstruction: { parts: [{ text: systemPrompt }] },
          generationConfig: { responseMimeType: "application/json" }
        })
      }
    );

    if (!response.ok) {
      const errorBody = await response.text();
      let errorMsg = `Gemini API returned status: ${response.status}`;
      try {
        const errorJson = JSON.parse(errorBody);
        if (errorJson.error?.message) errorMsg += ` - ${errorJson.error.message}`;
        else errorMsg += ` - ${errorBody}`;
      } catch {
        errorMsg += ` - ${errorBody}`;
      }
      return NextResponse.json({ error: errorMsg }, { status: response.status });
    }

    const data = await response.json();
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!responseText) {
      return NextResponse.json({ error: "Empty response from Gemini" }, { status: 500 });
    }

    const cleaned = cleanJsonResponse(responseText);
    const parsed = JSON.parse(cleaned);
    return NextResponse.json({ result: parsed });
  } catch (err: any) {
    console.error("Gemini API route error:", err);
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
