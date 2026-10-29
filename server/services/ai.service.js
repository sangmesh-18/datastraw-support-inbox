import { GoogleGenAI } from "@google/genai";
import { knowledgeBase } from "./knowledgeBase.service.js";

const apiKey = process.env.GEMINI_API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const sleep = (ms) =>
  new Promise((resolve) => setTimeout(resolve, ms));


const generateWithRetry = async (prompt) => {
  const models = ["gemini-3.8-flash", "gemini-3.5-flash"];
  let lastError;

  for (const model of models) {
    try {
      console.log(`Trying Gemini model: ${model}`);

      const response = await Promise.race([
        ai.models.generateContent({
          model,
          contents: prompt,
        }),
        new Promise((_, reject) => {
          setTimeout(
            () => reject(new Error(`Gemini timeout: ${model}`)),
            15000
          );
        }),
      ]);

      return response;
    } catch (error) {
      lastError = error;
      console.error(`${model} failed:`, error.message);
    }
  }

  throw lastError;
};



export const generateReplyDraft = async (customerMessage) => {
  if (!ai) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const prompt = `
You are a customer support assistant for ${knowledgeBase.brandName}.

Use only the policies provided below. Do not invent policies, order
statuses, delivery dates, refund timelines, or eligibility.

Knowledge base:
${JSON.stringify(knowledgeBase, null, 2)}

Customer message:
${customerMessage}

Write a concise, polite, empathetic reply.
If essential information is missing, ask a clarifying question or explain
that the team needs to confirm it.
Return only the reply text. Do not claim an action has been completed.
This is a draft for agent review and must not be sent automatically.
`;

  const response = await generateWithRetry(prompt);

  const draft = response.text?.trim();

  if (!draft) {
    throw new Error("AI returned an empty reply");
  }

  return draft;
};
