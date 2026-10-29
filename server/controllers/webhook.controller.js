
import { processWebhookEvent } from "../services/webhook.service.js";

export const handleWebhook = async (req, res) => {
  try {
    const result = await processWebhookEvent(req.body);

    if (result.duplicate) {
      return res.status(200).json({
        success: true,
        message: "Event already processed",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Webhook processed successfully",
      customerId: result.customerId,
      conversationId: result.conversationId,
    });
  } catch (error) {
    console.error("Webhook processing error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process webhook",
    });
  }
};
