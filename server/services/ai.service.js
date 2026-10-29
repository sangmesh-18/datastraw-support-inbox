import { GoogleGenAI } from "@google/genai";
import { knowledgeBase } from "./knowledgeBase.service.js";

const apiKey = process.env.GEMINI_API_KEY;

const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

const generateFallbackDraft = (customerMessage) => {
  const brand = knowledgeBase.brandName || "Verdant Co";
  const lower = (customerMessage || "").toLowerCase();

  let policyNote =
    "Thank you for reaching out to us. I have noted your message and our support team will review your account details.";

  if (lower.includes("refund") || lower.includes("return")) {
    policyNote =
      "Thank you for contacting us regarding returns. Per our policy, all return and refund requests must be verified against your order history. Please share your order ID so our team can check eligibility.";
  } else if (lower.includes("cancel")) {
    policyNote =
      "Thank you for contacting us regarding order cancellation. Cancellations are subject to order processing status and must be verified by our team. Please provide your order number.";
  } else if (lower.includes("address") || lower.includes("ship")) {
    policyNote =
      "Thank you for contacting us. Address changes can only be requested before shipment (within 12 hours of order placement). Please provide your order details so our team can check shipment status.";
  } else if (lower.includes("cod") || lower.includes("cash")) {
    policyNote =
      "Thank you for reaching out. Cash on Delivery is available for orders below ₹3000 with a ₹50 COD fee. Let us know if you need help with your order.";
  }

  return `Dear Customer,\n\n${policyNote}\n\nOur support team is reviewing your inquiry and will follow up shortly.\n\nWarm regards,\nCustomer Support Team\n${brand}`;
};

const generateWithRetry = async (prompt) => {
  // Use fast, stable Gemini models with fallbacks
  const models = [
    "gemini-3.1-flash-lite",
    "gemini-3.5-flash-lite",
    "gemini-3-flash-preview",
    "gemini-3.8-flash",
  ];
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
            30000
          );
        }),
      ]);

      if (response?.text?.trim()) {
        return response;
      }
    } catch (error) {
      lastError = error;
      console.error(`${model} failed:`, error.message);
    }
  }

  throw lastError || new Error("All AI models failed to respond");
};

export const generateReplyDraft = async (customerMessage) => {
  if (!ai) {
    console.warn("GEMINI_API_KEY is not configured; generating policy-based fallback draft");
    return generateFallbackDraft(customerMessage);
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

  try {
    const response = await generateWithRetry(prompt);
    const draft = response.text?.trim();

    if (draft) {
      return draft;
    }
  } catch (error) {
    console.error(
      "Gemini generation failed; falling back to knowledge-base policy draft:",
      error.message
    );
    return generateFallbackDraft(customerMessage);
  }

  return generateFallbackDraft(customerMessage);
};
