
import express from "express";
import {
  getCustomerConversationMessages,
} from "../controllers/conversation.controller.js";

const router = express.Router();

router.get(
  "/:conversationId/customer-messages",
  getCustomerConversationMessages
);

export default router;
