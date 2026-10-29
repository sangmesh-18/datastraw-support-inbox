
import { processWebhookEvent } from "../services/webhook.service.js";

export const sendCustomerMessage = async (req, res) => {
  try {
    const { customer, message, brand_id = "verdant-co" } = req.body;

    if (
      !customer?.id ||
      !customer?.name?.trim() ||
      !customer?.phone?.trim() ||
      !message?.id ||
      !message?.text?.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Customer ID, name, phone, message ID, and message text are required",
      });
    }

    const event = {
      event_id: `test_${message.id}`,
      brand_id,
      customer,
      message,
    };

    const result = await processWebhookEvent(event);

    return res.status(200).json({
      success: true,
      message: result.duplicate
        ? "Message already received"
        : "Message received successfully",
      customerId: result.customerId,
      conversationId: result.conversationId,
      messageId: result.messageId,
    });
  } catch (error) {
    console.error("Customer message error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to receive customer message",
    });
  }
};
