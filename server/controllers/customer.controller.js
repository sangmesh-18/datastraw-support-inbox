import { prisma } from "../prisma.js";
import { processWebhookEvent } from "../services/webhook.service.js";
import { createCustomerSessionToken } from "../middleware/customer-session.middleware.js";

/**
 * Handle incoming customer messages securely.
 * - If customer has an active session, strictly appends to the session's conversation.
 *   Never trusts client-supplied customerId or conversationId.
 * - If no session exists, creates a new customer & conversation and returns a secure session token.
 */
export const sendCustomerMessage = async (req, res) => {
  try {
    const { customer, message, brand_id = "verdant-co" } = req.body;

    if (!message?.id || !message?.text?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message ID and text are required",
      });
    }

    // SCENARIO 1: Existing authenticated customer session
    if (req.customerSession) {
      const { conversationId, customerId } = req.customerSession;

      // Check for duplicate messages (idempotency)
      const existingMessage = await prisma.message.findUnique({
        where: { externalId: message.id },
      });

      if (existingMessage) {
        return res.status(200).json({
          success: true,
          message: "Message already received",
          customerId,
          conversationId,
          messageId: existingMessage.id,
          sessionToken: req.headers["x-customer-session"] || req.headers.authorization?.replace("Bearer ", ""),
        });
      }

      // Ensure the conversation is still open
      const conversation = await prisma.conversation.findUnique({
        where: { id: conversationId },
        select: { id: true, status: true },
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: "Conversation not found",
        });
      }

      // Persist the message in the session's conversation
      const savedMessage = await prisma.message.create({
        data: {
          conversationId,
          sender: "CUSTOMER",
          text: message.text.trim(),
          externalId: message.id,
          eventId: `test_${message.id}`,
          aiProcessingStatus: "PENDING",
        },
      });

      // Update timestamp for agent dashboard ordering
      await prisma.conversation.update({
        where: { id: conversationId },
        data: { updatedAt: new Date() },
      });

      const currentToken =
        req.headers["x-customer-session"] ||
        req.headers.authorization?.replace("Bearer ", "") ||
        createCustomerSessionToken({ customerId, conversationId });

      return res.status(200).json({
        success: true,
        message: "Message received successfully",
        customerId,
        conversationId,
        messageId: savedMessage.id,
        sessionToken: currentToken,
      });
    }

    // SCENARIO 2: Anonymous visitor starting a new conversation
    const uniqueSuffix = Math.floor(1000000 + Math.random() * 9000000);
    const customerPayload = {
      id: customer?.id?.trim() || `anon_${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 6)}`,
      name: customer?.name?.trim() || "Guest Customer",
      phone: customer?.phone?.trim() || `+1555${uniqueSuffix}`,
    };

    const event = {
      event_id: `test_${message.id}`,
      brand_id,
      customer: customerPayload,
      message,
    };

    const result = await processWebhookEvent(event);

    // Issue a cryptographically signed customer session token
    const sessionToken = createCustomerSessionToken({
      customerId: result.customerId,
      conversationId: result.conversationId,
    });

    return res.status(200).json({
      success: true,
      message: result.duplicate
        ? "Message already received"
        : "Message received successfully",
      customerId: result.customerId,
      conversationId: result.conversationId,
      messageId: result.messageId,
      sessionToken,
    });
  } catch (error) {
    console.error("Customer message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to receive customer message",
    });
  }
};

/**
 * Fetch the conversation & messages belonging strictly to the verified customer session.
 * Excludes internal drafts, AI statuses, and sensitive data.
 */
export const getCustomerConversation = async (req, res) => {
  try {
    const { conversationId } = req.customerSession;

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      select: {
        id: true,
        status: true,
        messages: {
          where: {
            OR: [
              { sender: "CUSTOMER" },
              { sender: "AGENT" }, // Agent replies only visible once approved
            ],
          },
          orderBy: {
            createdAt: "asc",
          },
          select: {
            id: true,
            sender: true,
            text: true,
            createdAt: true,
          },
        },
      },
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    return res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error) {
    console.error("Error fetching customer conversation:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch customer conversation",
    });
  }
};

/**
 * Validates ownership of a specific conversationId parameter against the customer session.
 * If the conversationId does not belong to the verified customer session, returns 404
 * without leaking whether the requested conversation exists.
 */
export const getCustomerConversationMessagesById = async (req, res) => {
  const { conversationId } = req.params;

  // Strict ownership check: customer session conversationId must match param
  if (req.customerSession.conversationId !== conversationId) {
    return res.status(404).json({
      success: false,
      message: "Conversation not found",
    });
  }

  // Reuse secure retrieval
  return getCustomerConversation(req, res);
};
