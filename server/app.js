import express from "express";
import cors from "cors";
import { authenticateToken } from "./middleware/auth.middleware.js";
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

app.use("/api/health", healthRoutes);
app.use("/api/db", dbRoutes);
app.use("/api/webhook", webhookRoutes);
// Public customer conversation route - allows customer view without agent auth
app.use("/api/conversations", customerConversationRoutes);
app.use("/api/conversations", authenticateToken, conversationRoutes);
app.use("/api/drafts", authenticateToken, draftRoutes);
app.use("/api/auth", authRoutes);
app.use(
  "/api/customer-conversations",
  customerConversationRoutes
);
app.use("/api/customer", customerRoutes);

export default app;
