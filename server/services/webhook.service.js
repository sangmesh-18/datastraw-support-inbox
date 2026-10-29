
import { prisma } from "../prisma.js";

export const processWebhookEvent = async (event) => {
  const { event_id, brand_id, customer, message } = event;
  const brandId = brand_id || "verdant-co";

  if (
    !event_id ||
    !customer?.id ||
    !customer?.name?.trim() ||
    !customer?.phone?.trim() ||
    !message?.id ||
    !message?.text?.trim()
  ) {
    throw new Error("Invalid webhook event data");
  }

  try {
    // Check for duplicate events or messages.
    const existingEvent = await prisma.message.findUnique({
      where: { eventId: event_id },
    });

    if (existingEvent) {
      return {
        duplicate: true,
        customerId: existingEvent.conversationId,
      };
    }

    const existingMessage = await prisma.message.findUnique({
      where: { externalId: message.id },
    });

    if (existingMessage) {
      return { duplicate: true };
    }

    // Match the customer by external ID first.
    let savedCustomer = await prisma.customer.findUnique({
      where: { externalId: customer.id },
    });

    // Fall back to phone number if the external ID is unknown.
    if (!savedCustomer) {
      savedCustomer = await prisma.customer.findFirst({
        where: { phone: customer.phone },
      });
    }

    if (!savedCustomer) {
      savedCustomer = await prisma.customer.create({
        data: {
          externalId: customer.id,
          name: customer.name.trim(),
          phone: customer.phone.trim(),
        },
      });
    }

    // Find an existing open conversation for this customer and brand.
    let conversation = await prisma.conversation.findFirst({
      where: {
        customerId: savedCustomer.id,
        brandId,
        status: "OPEN",
      },
    });

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          customerId: savedCustomer.id,
          brandId,
          status: "OPEN",
        },
      });
    }

    // Persist the message so the background worker can process it.
    const savedMessage = await prisma.message.create({
      data: {
        conversationId: conversation.id,
        sender: "CUSTOMER",
        text: message.text.trim(),
        externalId: message.id,
        eventId: event_id,
        aiProcessingStatus: "PENDING",
      },
    });

    // Update activity so the conversation moves to the top of the list.
    await prisma.conversation.update({
      where: { id: conversation.id },
      data: { updatedAt: new Date() },
    });

    return {
      duplicate: false,
      customerId: savedCustomer.id,
      conversationId: conversation.id,
      messageId: savedMessage.id,
    };
  } catch (error) {
    // A concurrent request may have inserted the same unique ID.
    if (error.code === "P2002") {
      return { duplicate: true };
    }

    throw error;
  }
};
