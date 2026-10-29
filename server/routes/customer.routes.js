
import express from "express";
import { sendCustomerMessage } from "../controllers/customer.controller.js";

const router = express.Router();

router.post("/messages", sendCustomerMessage);

export default router;
