import { GoogleGenAI, Type } from "@google/genai";
import { Question } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

const SYSTEM_INSTRUCTION = `You are a master of critical debate and reflexive thinking. Your goal is to help users deeply engage with a piece of text.
Given a text, generate 10 to 30 high-quality questions.
Categorize them into exactly three types:
1. Critical: These should challenge the text's logic, expose underlying assumptions, or look for biases and omissions.
2. Reflexive: These should invite the user to look inward, connecting the text to their own life, values, and pre-conceived notions.
3. Evocative: These should be powerful, imaginative, or provocative questions that spark intense debate or emotional response.

Format your response as a JSON array of objects:
[{ "question": "...", "type": "Critical" | "Reflexive" | "Evocative", "context": "short explanation why this is relevant" }]
Return only the JSON. Generate at least 15 questions if the text is substantial.`;

export async function generateQuestions(text: string): Promise<Question[]> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Text to analyze:\n\n${text}`,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              question: { type: Type.STRING },
              type: { 
                type: Type.STRING,
                enum: ["Critical", "Reflexive", "Evocative"]
              },
              context: { type: Type.STRING }
            },
            required: ["question", "type", "context"]
          }
        }
      },
    });

    if (!response.text) {
      throw new Error("No response from Gemini");
    }

    return JSON.parse(response.text.trim());
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error;
  }
}
