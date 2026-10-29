import { prisma } from "../prisma.js";

// Protected Agent Endpoint: List all conversations
export const getConversations = async (req, res) => {
  try {
    const conversations = await prisma.conversation.findMany({
      include: {
        customer: true,
        messages: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return res.status(200).json({
      success: true,
      count: conversations.length,
      conversations,
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversations",
    });
  }
};

// Protected Agent Endpoint: Get conversation messages with AI drafts
export const getConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
      },
      include: {
        customer: true,
        messages: {
          orderBy: {
            createdAt: "asc",
          },
          include: {
            draft: true,
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
    console.error("Error fetching conversation messages:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch conversation messages",
    });
  }
};

// Customer-safe conversation messages endpoint
export const getCustomerConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

    // Defense in depth: If a customer session is present, verify ownership
    if (req.customerSession && req.customerSession.conversationId !== conversationId) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

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
