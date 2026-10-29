import express from "express";
import { getCustomerConversationMessagesById } from "../controllers/customer.controller.js";
import { authenticateCustomerSession } from "../middleware/customer-session.middleware.js";

const router = express.Router();

// Protected customer conversation route - strictly requires verified customer session
router.get(
  "/:conversationId/customer-messages",
  authenticateCustomerSession,
  getCustomerConversationMessagesById
);

export default router;
