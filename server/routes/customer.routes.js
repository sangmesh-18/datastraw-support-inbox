import express from "express";
import {
  sendCustomerMessage,
  getCustomerConversation,
  getCustomerConversationMessagesById,
} from "../controllers/customer.controller.js";
import {
  authenticateCustomerSession,
  optionalCustomerSession,
} from "../middleware/customer-session.middleware.js";

const router = express.Router();

// Submit customer inquiry (new session or continuing session)
router.post("/messages", optionalCustomerSession, sendCustomerMessage);

// Fetch conversation for the current verified customer session
router.get("/conversation", authenticateCustomerSession, getCustomerConversation);

// Fetch conversation by ID with strict customer session ownership verification
router.get(
  "/conversations/:conversationId/messages",
  authenticateCustomerSession,
  getCustomerConversationMessagesById
);

// Backward compatibility for customer endpoints
router.get(
  "/:conversationId/customer-messages",
  authenticateCustomerSession,
  getCustomerConversationMessagesById
);

export default router;
