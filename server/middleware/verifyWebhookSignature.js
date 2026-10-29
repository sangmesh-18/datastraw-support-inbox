
import crypto from "node:crypto";

export const verifyWebhookSignature = (req, res, next) => {
  const signature = req.get("X-Signature");
  const secret = process.env.WEBHOOK_SECRET;

  if (!secret) {
    console.error("WEBHOOK_SECRET is not configured");
    return res.status(500).json({
      message: "Webhook configuration error",
    });
  }

  if (!signature || !req.rawBody) {
    return res.status(401).json({
      message: "Missing signature or request body",
    });
  }

  const expectedSignature =
    "sha256=" +
    crypto
      .createHmac("sha256", secret)
      .update(req.rawBody)
      .digest("hex");

  const received = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);

//   console.log("Received:", signature);
// console.log("Expected:", expectedSignature);
// console.log("Raw body:", req.rawBody.toString("utf8"));
// console.log("Secret loaded:", Boolean(secret));

console.log("Received signature:", signature);
console.log("Expected signature:", expectedSignature);
console.log("Raw body length:", req.rawBody.length);
console.log("Server secret loaded:", Boolean(secret));

  if (
    received.length !== expected.length ||
    !crypto.timingSafeEqual(received, expected)
  ) {
    return res.status(401).json({
      message: "Invalid webhook signature",
    });
  }

  next();
};
