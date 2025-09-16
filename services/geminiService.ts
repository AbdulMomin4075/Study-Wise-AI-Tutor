import { GoogleGenAI, Chat, Part, Content } from "@google/genai";
import { Message } from '../types';

declare const mammoth: any;

if (!process.env.API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const SYSTEM_INSTRUCTION = `You are StudyWise, a personalized AI tutor.
Your top priorities are speed and accuracy. Always provide clear, well-structured, and correct responses as quickly as possible.

Core Behaviors:

Fast & Accurate Responses:
Always prioritize delivering answers that are factually correct, concise, and relevant.
Summarize when needed, but allow deeper dives if the user asks.

Active Tutor Mode:
Do not just answer — also ask follow-up or related questions that help you refine the user’s needs and improve your guidance.
Encourage critical thinking and deeper learning, not just passive answers.

Study File Integration:
Be ready to read and analyze all types of files (PDF, DOCX, PPTX, TXT, CSV, code files, etc.).
Extract key points, summaries, and explanations from uploaded files, and use them to answer user questions.

Learning Support Beyond Text:
When explaining concepts, provide links to relevant YouTube videos or websites for extra learning support.
Always ensure links are trustworthy and directly related to the user’s query.

Guided Learning:
Adjust explanations to the user’s level (beginner, intermediate, advanced).
Mix teaching methods: ask the user to summarize back, quiz them briefly, or give examples to check understanding.`;

function mapMessagesToContent(messages: Message[]): Content[] {
    const filteredMessages = messages.filter(m => m.parts.some(p => p.text.length > 0) || m.file);
    return filteredMessages.map(message => ({
        role: message.role,
        parts: message.parts.map(part => ({ text: part.text }))
    }));
}


export function createChatSession(history?: Message[]): Chat {
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      thinkingConfig: { thinkingBudget: 0 },
    },
    history: history ? mapMessagesToContent(history) : undefined,
  });
  return chat;
}

function fileToGenerativePart(file: File): Promise<Part> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result !== 'string') {
        return reject(new Error("Failed to read file as base64 string."));
      }
      const base64Data = reader.result.split(',')[1];
      resolve({
        inlineData: {
          mimeType: file.type,
          data: base64Data,
        },
      });
    };
    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export async function sendMessage(
  chat: Chat, 
  prompt: string, 
  file?: File
): Promise<AsyncGenerator<string, void, unknown>> {
  const parts: Part[] = [];
  let fileContext = '';

  if (file) {
    if (file.type.startsWith('image/')) {
        const filePart = await fileToGenerativePart(file);
        parts.push(filePart);
    } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        try {
            const arrayBuffer = await file.arrayBuffer();
            const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
            fileContext = `\n\n--- Start of Document: ${file.name} ---\n${result.value}\n--- End of Document ---`;
        } catch (error) {
            console.error("Error processing .docx file:", error);
            throw new Error("Could not read the content of the Word document. The file might be corrupted.");
        }
    } else if (file.type.startsWith('text/')) {
         const textContent = await file.text();
         fileContext = `\n\n--- Start of Document: ${file.name} ---\n${textContent}\n--- End of Document ---`;
    } else {
        throw new Error(`Unsupported file type: ${file.type}. Please upload an image, a Word document, or a plain text file.`);
    }
  }
  
  const combinedPrompt = prompt + fileContext;
  parts.push({ text: combinedPrompt });

  const result = await chat.sendMessageStream({ message: parts });

  async function* streamGenerator(): AsyncGenerator<string, void, unknown> {
    for await (const chunk of result) {
      yield chunk.text;
    }
  }

  return streamGenerator();
}