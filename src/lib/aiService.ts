import { solveMathOffline, SolverResult } from "./mathEngine";

function cleanJsonResponse(rawText: string): string {
  let cleaned = rawText.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, "");
    cleaned = cleaned.replace(/\s*```$/, "");
  }
  return cleaned.trim();
}

export async function solveMathWithAI(
  query: string, 
  base64Image: string | null, 
  targetExam: string,
  userApiKey: string | null
): Promise<SolverResult> {
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;
  const apiKey = (userApiKey && userApiKey.trim()) ? userApiKey.trim() : (localKey || '');

  try {
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query,
        base64Image,
        targetExam,
        userApiKey: apiKey,
        mode: 'single'
      })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `API error ${response.status}`);
    }

    const { result: parsedResult } = await response.json();

    return {
      question: query || 'Image solved via Vision OCR',
      topic: parsedResult.topic || 'Math Solution',
      chapter: parsedResult.chapter || 'Quantitative Aptitude',
      difficulty: parsedResult.difficulty || 'Medium',
      solvingTime: parsedResult.solvingTime || '40 seconds',
      marks: parsedResult.marks || '2 Marks',
      correctAnswer: parsedResult.correctAnswer || 'Refer to steps',
      stepByStep: parsedResult.stepByStep || ['Analyze equation variables', 'Simplify', 'Solve'],
      shortcutMethod: parsedResult.shortcutMethod || 'Direct substitution',
      fastTrick: parsedResult.fastTrick || 'Vedic digit inspection',
      alternativeSolution: parsedResult.alternativeSolution || '',
      formulaUsed: parsedResult.formulaUsed || 'Syllabus standard formulas',
      memoryTrick: parsedResult.memoryTrick || 'Identify ratios first',
      commonMistakes: parsedResult.commonMistakes || 'Check decimal conversions',
      frequency: parsedResult.frequency || 'High',
      importance: parsedResult.importance || 'Core topic',
      similarQuestions: parsedResult.similarQuestions || []
    };

  } catch (error: any) {
    console.error('Gemini API call failed:', error);
    // Return a visible error result instead of hiding it as a math problem
    return {
      question: query || 'Failed to scan image',
      topic: 'API Error',
      chapter: 'System',
      difficulty: 'Hard',
      solvingTime: '0s',
      marks: '0',
      correctAnswer: 'System Error',
      stepByStep: [
        'An error occurred connecting to the Gemini AI API.',
        `Details: ${error.message || String(error)}`,
        'Please check your API key in settings or your internet connection.'
      ],
      shortcutMethod: 'Update API Key',
      fastTrick: 'Check connection',
      alternativeSolution: '',
      formulaUsed: 'N/A',
      memoryTrick: 'N/A',
      commonMistakes: 'Invalid API Key or Vercel Timeout',
      frequency: 'High',
      importance: 'Critical',
      similarQuestions: [],
      isFallback: true,
      fallbackReason: error.message || String(error)
    };
  }
}

export async function chatWithGemini(
  history: { role: 'user' | 'assistant'; content: string }[],
  userApiKey: string | null
): Promise<string> {
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;
  const apiKey = (userApiKey && userApiKey.trim()) ? userApiKey.trim() : (localKey || '');

  try {
    const response = await fetch('/api/gemini-chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ history, userApiKey: apiKey })
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      throw new Error(errData.error || `API error ${response.status}`);
    }

    const { text } = await response.json();
    return text || 'No response received.';
  } catch (error: any) {
    console.error('Chat API failed:', error);
    return `AI Error: ${error.message || 'Unable to connect to the Gemini model.'}`;
  }
}

export async function solveMultiQuestionsWithAI(
  base64Image: string,
  targetExam: string,
  userApiKey: string | null
): Promise<any[]> {
  const localKey = typeof window !== 'undefined' ? localStorage.getItem('gemini_api_key') : null;
  const apiKey = (userApiKey && userApiKey.trim()) ? userApiKey.trim() : (localKey || '');

  const response = await fetch('/api/gemini', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      base64Image,
      targetExam,
      userApiKey: apiKey,
      mode: 'multi'
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || `API error ${response.status}`);
  }

  const { result } = await response.json();
  return result?.questions || [];
}