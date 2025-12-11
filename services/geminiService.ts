import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ROADMAP_SYSTEM_PROMPT, GEMINI_MODEL } from "../constants";
import { Roadmap } from "../types";

// Initialize the client
// NOTE: API Key is expected to be in process.env.API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const fileToPart = async (file: File): Promise<{ inlineData: { data: string; mimeType: string } }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64Data = reader.result as string;
      // Remove the Data URL prefix (e.g., "data:image/jpeg;base64,")
      const base64Content = base64Data.split(',')[1];
      resolve({
        inlineData: {
          data: base64Content,
          mimeType: file.type,
        },
      });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const roadmapSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    overview: { type: Type.STRING },
    currentLevelEstimate: { type: Type.STRING },
    timelineEstimate: { type: Type.STRING },
    phases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          duration: { type: Type.STRING },
          description: { type: Type.STRING },
        },
        required: ["name", "duration", "description"],
      },
    },
    dailyPlans: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          day: { type: Type.INTEGER },
          title: { type: Type.STRING },
          focus: { type: Type.STRING },
          tasks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                description: { type: Type.STRING },
                completed: { type: Type.BOOLEAN },
              },
              required: ["id", "description", "completed"],
            },
          },
          resources: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                url: { type: Type.STRING },
                type: { type: Type.STRING, enum: ["article", "video", "course", "tool"] },
              },
              required: ["title", "url", "type"],
            },
          },
        },
        required: ["day", "title", "focus", "tasks", "resources"],
      },
    },
    weeklySummaries: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          week: { type: Type.INTEGER },
          theme: { type: Type.STRING },
          objectives: { type: Type.ARRAY, items: { type: Type.STRING } },
          checkpoint: { type: Type.STRING },
        },
        required: ["week", "theme", "objectives", "checkpoint"],
      },
    },
    predictedChallenges: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          problem: { type: Type.STRING },
          solution: { type: Type.STRING },
        },
        required: ["problem", "solution"],
      },
    },
  },
  required: ["title", "overview", "currentLevelEstimate", "timelineEstimate", "phases", "dailyPlans", "weeklySummaries", "predictedChallenges"],
};

export const generateLearningRoadmap = async (
  goal: string,
  context: string,
  images: File[]
): Promise<Roadmap> => {
  try {
    const imageParts = await Promise.all(images.map(fileToPart));
    
    const userPrompt = `
      USER GOAL: ${goal}
      
      USER CONTEXT / STRUGGLES:
      ${context}
      
      (See attached images for user's current notes, code snippets, or diagrams to infer skill level)
    `;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL,
      contents: {
        parts: [...imageParts, { text: userPrompt }],
      },
      config: {
        systemInstruction: ROADMAP_SYSTEM_PROMPT,
        responseMimeType: "application/json",
        responseSchema: roadmapSchema,
        temperature: 0.4, // Lower temperature for more structured/reliable plans
      },
    });

    if (!response.text) {
        throw new Error("Empty response from Gemini");
    }

    const roadmapData: Roadmap = JSON.parse(response.text);
    return roadmapData;

  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("Failed to generate roadmap. Please try again.");
  }
};
