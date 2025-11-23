import { GoogleGenAI, Type } from "@google/genai";
import { FormField } from "../types";

// NOTE: In a real app, do not expose API keys in frontend code if possible.
// Proxy through backend. For this demo, we assume the environment variable is set.
const apiKey = process.env.API_KEY || ''; 

const ai = new GoogleGenAI({ apiKey });

export const generateFormSchema = async (description: string): Promise<FormField[]> => {
  if (!apiKey) {
    console.warn("No API Key found for Gemini. Returning empty.");
    return [];
  }

  try {
    const model = ai.models;
    
    const response = await model.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Generate a detailed list of form fields for a form described as: "${description}".
      Return a JSON array where each object has:
      - id: a unique string (e.g., "field_1")
      - type: one of "text", "email", "number", "select", "checkbox", "textarea", "date"
      - label: professional human readable label
      - helpText: clear and specific instructions or context to help the user (e.g., "Please enter your full legal name as it appears on your ID", "Select the date of the event").
      - placeholder: a realistic example value that acts as a visual guide (e.g., "John Doe", "name@company.com", "+1 555-0123", "YYYY-MM-DD"). Do NOT use generic text like "Enter text here".
      - required: boolean
      - options: array of strings (ONLY if type is "select")
      - validation: object containing logical constraints based on the field context (e.g. age should have min 0, max 120. Descriptions should have maxLength.)
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              id: { type: Type.STRING },
              type: { type: Type.STRING, enum: ["text", "email", "number", "select", "checkbox", "textarea", "date"] },
              label: { type: Type.STRING },
              helpText: { type: Type.STRING },
              placeholder: { type: Type.STRING },
              required: { type: Type.BOOLEAN },
              options: { type: Type.ARRAY, items: { type: Type.STRING } },
              validation: {
                type: Type.OBJECT,
                properties: {
                  min: { type: Type.NUMBER },
                  max: { type: Type.NUMBER },
                  minLength: { type: Type.INTEGER },
                  maxLength: { type: Type.INTEGER }
                }
              }
            },
            // Explicitly require placeholder and helpText to ensure high quality output
            required: ["id", "type", "label", "required", "placeholder", "helpText"]
          }
        }
      }
    });

    if (response.text) {
      const data = JSON.parse(response.text);
      // Ensure unique IDs
      return data.map((f: any, i: number) => ({
        ...f,
        id: `field_${Date.now()}_${i}`
      }));
    }
    return [];
  } catch (error) {
    console.error("Gemini generation failed", error);
    throw error;
  }
};