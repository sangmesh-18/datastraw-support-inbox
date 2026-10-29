
import { prisma } from "../prisma.js";

// Edit an AI-generated draft
export const updateDraft = async (req, res) => {
  try {
    const { draftId } = req.params;
    const { text } = req.body;

    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Draft text is required",
      });
    }

    const existingDraft = await prisma.aIDraft.findUnique({
      where: { id: draftId },
    });

    if (!existingDraft) {
      return res.status(404).json({
        success: false,
        message: "Draft not found",
      });
    }

    if (existingDraft.status === "APPROVED") {
      return res.status(400).json({
        success: false,
        message: "Approved drafts cannot be edited",
      });
    }

    const updatedDraft = await prisma.aIDraft.update({
      where: { id: draftId },
      data: { text: text.trim() },
    });

    return res.status(200).json({
      success: true,
      message: "Draft updated successfully",
      draft: updatedDraft,
    });
  } catch (error) {
    console.error("Error updating draft:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to update draft",
    });
  }
};

// Approve an AI-generated draft

export const approveDraft = async (req, res) => {
  try {
    const { draftId } = req.params;

    const existingDraft = await prisma.aIDraft.findUnique({
      where: { id: draftId },
      include: {
        message: {
          select: {
            id: true,
            conversationId: true,
          },
        },
      },
    });

    if (!existingDraft) {
      return res.status(404).json({
        success: false,
        message: "Draft not found",
      });
    }

    if (existingDraft.status === "APPROVED") {
      return res.status(200).json({
        success: true,
        message: "Draft is already approved",
        draft: existingDraft,
      });
    }

    const approvedDraft = await prisma.$transaction(async (tx) => {
      // Update the draft's approval status.
      const updatedDraft = await tx.aIDraft.update({
        where: { id: draftId },
        data: {
          status: "APPROVED",
          approvedAt: new Date(),
        },
      });

      // Save the approved reply in the conversation history.
      await tx.message.create({
        data: {
          conversationId: existingDraft.message.conversationId,
          sender: "AGENT",
          text: updatedDraft.text,
        },
      });

      // Update the conversation activity timestamp.
      await tx.conversation.update({
        where: {
          id: existingDraft.message.conversationId,
        },
        data: {
          updatedAt: new Date(),
        },
      });

      return updatedDraft;
    });

    return res.status(200).json({
      success: true,
      message: "Draft approved and reply saved to conversation",
      draft: approvedDraft,
    });
  } catch (error) {
    console.error("Error approving draft:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to approve draft",
    });
  }
};

