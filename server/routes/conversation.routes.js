
import express from "express";
import {
  getConversations,
  getConversationMessages,
} from "../controllers/conversation.controller.js";

const router = express.Router();

router.get("/", getConversations);


router.get("/:conversationId", getConversationMessages);
router.get("/:conversationId/messages", getConversationMessages);

export default router;
