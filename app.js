
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "Method not allowed"
    });
  }

  try {
    const { topic, studyText, noteType } = req.body || {};

    if (!topic?.trim() || !studyText?.trim()) {
      return res.status(400).json({
        error: "Please enter a topic and study material."
      });
    }

    if (studyText.length > 30000) {
      return res.status(413).json({
        error: "Please keep your study material under 30,000 characters."
      });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({
        error: "Gemini API key is not configured."
      });
    }

    const ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY
    });

    const prompt = `
You are StudyMate AI, a friendly academic study assistant.

Topic: ${topic}

Student's study material:
${studyText}

Task:
Create ${noteType}.

Instructions:
1. Use simple and understandable English.
2. Organize content with clear headings.
3. Highlight important definitions.
4. Include key points and examples.
5. Do not invent facts that are not supported by the material.
6. If information is missing, clearly mention it.
7. Make the notes useful for student exam preparation.

Return the notes in plain text with headings and bullet points.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });

    return res.status(200).json({
      success: true,
      notes: response.text || "No notes were generated."
    });

  } catch (error) {
    console.error("Gemini error:", error);

    return res.status(500).json({
      error: "Unable to generate notes. Please try again."
    });
  }
}
