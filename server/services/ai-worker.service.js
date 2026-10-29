import { prisma } from "../prisma.js";
import { generateReplyDraft } from "./ai.service.js";

let workerRunning = false;
const MAX_ATTEMPTS = 3;

const processPendingMessage = async (message) => {
  // Claim the message and increment its attempt count.
  const claim = await prisma.message.updateMany({
    where: {
      id: message.id,
      aiProcessingStatus: "PENDING",
    },
    data: {
      aiProcessingStatus: "PROCESSING",
      aiProcessingAttempts: { increment: 1 },
    },
  });

  if (claim.count === 0) return;

  try {
    console.log(
      `Generating AI draft for message ${message.id}, attempt ${
        message.aiProcessingAttempts + 1
      }`
    );

    const draftText = await generateReplyDraft(message.text);

    await prisma.$transaction([
      prisma.aIDraft.upsert({
        where: { messageId: message.id },
        update: {
          text: draftText,
          status: "PENDING",
        },
        create: {
          messageId: message.id,
          text: draftText,
          status: "PENDING",
        },
      }),
      prisma.message.update({
        where: { id: message.id },
        data: { aiProcessingStatus: "COMPLETED" },
      }),
    ]);

    console.log(`AI draft saved for message ${message.id}`);
  } catch (error) {
    console.error(
      `AI draft generation failed for message ${message.id}:`,
      error.message
    );

    const current = await prisma.message.findUnique({
      where: { id: message.id },
      select: { aiProcessingAttempts: true },
    });

    if (current && current.aiProcessingAttempts < MAX_ATTEMPTS) {
      await prisma.message.update({
        where: { id: message.id },
        data: { aiProcessingStatus: "PENDING" },
      });

      console.log(`Message ${message.id} will be retried`);
    } else {
      await prisma.message.update({
        where: { id: message.id },
        data: { aiProcessingStatus: "FAILED" },
      });

      console.error(
        `Message ${message.id} failed after ${MAX_ATTEMPTS} attempts`
      );
    }
  }
};

const runWorker = async () => {
  if (workerRunning) return;

  workerRunning = true;

  try {
    while (true) {
      const message = await prisma.message.findFirst({
        where: {
          sender: "CUSTOMER",
          aiProcessingStatus: "PENDING",
          aiProcessingAttempts: { lt: MAX_ATTEMPTS },
          draft: null,
        },
        orderBy: { createdAt: "asc" },
      });

      if (!message) break;

      await processPendingMessage(message);
    }
  } catch (error) {
    console.error("AI worker error:", error.message);
  } finally {
    workerRunning = false;
  }
};

export const startAIWorker = () => {
  console.log("AI background worker started");

  prisma.message
    .updateMany({
      where: {
        aiProcessingStatus: { in: ["PROCESSING", "FAILED"] },
        draft: null,
      },
      data: {
        aiProcessingStatus: "PENDING",
        aiProcessingAttempts: 0,
      },
    })
    .then(() => {
      const poll = async () => {
        await runWorker();
        setTimeout(poll, 2000);
      };

      poll();
    })
    .catch((error) => {
      console.error("Failed to recover AI jobs:", error.message);
    });
};
