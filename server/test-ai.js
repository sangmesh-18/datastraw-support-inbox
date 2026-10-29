
import "dotenv/config";
import { generateReplyDraft } from "./services/ai.service.js";

const draft = await generateReplyDraft(
  "My order has not arrived. Can you tell me when it will arrive?"
);

console.log("Generated draft:", draft);
