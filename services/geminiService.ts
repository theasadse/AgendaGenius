import { GoogleGenAI, Type, Schema } from "@google/genai";
import { FileData, GeneratedAgenda } from "../types";

const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

const AGENDA_SCHEMA: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING, description: "Title of the meeting" },
    date: { type: Type.STRING, description: "Proposed date string if mentioned, else empty" },
    overview: { type: Type.STRING, description: "A brief summary of the meeting goals" },
    stakeholders: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING },
          role: { type: Type.STRING },
        },
      },
    },
    items: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          topic: { type: Type.STRING },
          durationMinutes: { type: Type.NUMBER },
          presenter: { type: Type.STRING },
          description: { type: Type.STRING },
        },
      },
    },
  },
  required: ["title", "overview", "stakeholders", "items"],
};

export const generateAgendaFromFile = async (file: FileData): Promise<GeneratedAgenda> => {
  const model = "gemini-2.5-flash"; // Efficient for processing documents and structured output

  try {
    const response = await genAI.models.generateContent({
      model: model,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: file.type,
              data: file.data,
            },
          },
          {
            text: `Analyze this document and create a comprehensive meeting agenda. 
            Identify key stakeholders mentioned or implied. 
            Break down the meeting into logical agenda items with estimated duration in minutes. 
            If no duration is explicit, estimate based on complexity.
            Return the result in strict JSON format matching the schema.`,
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: AGENDA_SCHEMA,
      },
    });

    const text = response.text;
    if (!text) throw new Error("No response text generated");
    
    return JSON.parse(text) as GeneratedAgenda;
  } catch (error) {
    console.error("Error generating agenda:", error);
    throw error;
  }
};

export const sendChatMessage = async (
  history: { role: 'user' | 'model'; text: string }[],
  newMessage: string,
  contextFile?: FileData
): Promise<string> => {
  // Using gemini-3-pro-preview for advanced reasoning and chat capabilities
  const model = "gemini-3-pro-preview";

  try {
    const chat = genAI.chats.create({
      model: model,
      history: history.map(h => ({
        role: h.role,
        parts: [{ text: h.text }],
      })),
      config: {
        systemInstruction: "You are a helpful AI meeting assistant. You answer questions about the uploaded document and the generated agenda. Be concise and professional.",
      }
    });

    // If there is a context file, we send it along with the message for context
    // Ideally, for a long chat session, we'd add the file to the history once at the start.
    // Here we check if history is empty (first message) and attach the file.
    
    const parts: any[] = [{ text: newMessage }];

    // If this is the very first interaction or we want to ensure context availability
    // We can prepend the file data if the history length is 0 (new chat)
    if (history.length === 0 && contextFile) {
        parts.unshift({
            inlineData: {
                mimeType: contextFile.type,
                data: contextFile.data
            }
        });
        parts.unshift({
            text: "Here is the document context for our conversation:"
        });
    }

    const result = await chat.sendMessage({
      parts: parts
    });

    return result.text || "I couldn't generate a response.";
  } catch (error) {
    console.error("Chat error:", error);
    return "Sorry, I encountered an error processing your request.";
  }
};
