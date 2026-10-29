import { Router } from "express";
import { verifyWebhookSignature } from "../middleware/verifyWebhookSignature.js";
import { handleWebhook } from "../controllers/webhook.controller.js";

const router = Router();

router.post("/", verifyWebhookSignature, handleWebhook);

export default router;