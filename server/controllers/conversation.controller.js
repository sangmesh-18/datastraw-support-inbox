
import { prisma } from "../prisma.js";

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


export const getCustomerConversationMessages = async (req, res) => {
  try {
    const { conversationId } = req.params;

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
              {
                sender: "AGENT",
                // Agent replies are saved as messages only after approval.
              },
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
