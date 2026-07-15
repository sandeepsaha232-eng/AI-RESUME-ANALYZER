import { GoogleGenAI } from '@google/genai';

export const hasAiKey = !!(process.env.GEMINI_API_KEY || process.env.GROQ_API_KEY);

export async function generateContent(prompt: string, expectJson: boolean = false): Promise<string> {
  const groqApiKey = process.env.GROQ_API_KEY || '';
  const geminiApiKey = process.env.GEMINI_API_KEY || '';

  if (groqApiKey) {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${groqApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        ...(expectJson ? { response_format: { type: 'json_object' } } : {})
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Groq API returned ${response.status}: ${errText}`);
    }

    const data = await response.json() as any;
    return data.choices?.[0]?.message?.content || '';
  } else if (geminiApiKey) {
    const ai = new GoogleGenAI({ apiKey: geminiApiKey });
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    return response.text || '';
  } else {
    throw new Error('No AI API key configured. Please set GEMINI_API_KEY or GROQ_API_KEY.');
  }
}
