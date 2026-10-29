
import "dotenv/config";
import crypto from "node:crypto";
import fs from "node:fs";

const body = fs.readFileSync("./webhook-body.json");

const signature =
  "sha256=" +
  crypto
    .createHmac("sha256", process.env.WEBHOOK_SECRET)
    .update(body)
    .digest("hex");

console.log("Generator body length:", body.length);
console.log("X-Signature:", signature);
