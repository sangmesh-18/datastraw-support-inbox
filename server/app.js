import express from "express";
import cors from "cors";
import { authenticateToken } from "./middleware/auth.middleware.js";
import {
  authenticateCustomerSession,
} from "./middleware/customer-session.middleware.js";
import {
  getCustomerConversationMessagesById,
} from "./controllers/customer.controller.js";
import healthRoutes from "./routes/health.routes.js";
import dbRoutes from "./routes/db.routes.js";
import webhookRoutes from "./routes/webhook.routes.js";
import conversationRoutes from "./routes/conversation.routes.js";
import draftRoutes from "./routes/draft.routes.js";
import authRoutes from "./routes/auth.routes.js";
import customerConversationRoutes from "./routes/customer-conversation.routes.js";
import customerRoutes from "./routes/customer.routes.js";

const app = express();

app.use(cors());
app.use(
  express.json({
    verify: (req, res, buffer) => {
      if (req.originalUrl.startsWith("/api/webhook")) {
        req.rawBody = Buffer.from(buffer);
      }
    },
  })
);

// 1. Diagnostics & Health
app.use("/api/health", healthRoutes);
app.use("/api/db", dbRoutes);

// 2. Webhook Ingestion
app.use("/api/webhook", webhookRoutes);

// 3. Agent Authentication
app.use("/api/auth", authRoutes);

// 4. Customer Session Routes (isolated per browser session)
app.use("/api/customer", customerRoutes);
app.use("/api/customer-conversations", customerConversationRoutes);

// Backward compatibility: specific customer route with customer session validation
app.get(
  "/api/conversations/:conversationId/customer-messages",
  authenticateCustomerSession,
  getCustomerConversationMessagesById
);

// 5. Protected Agent Endpoints (strictly requires agent JWT)
app.use("/api/conversations", authenticateToken, conversationRoutes);
app.use("/api/drafts", authenticateToken, draftRoutes);

export default app;
