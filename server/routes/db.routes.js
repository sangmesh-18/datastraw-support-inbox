
import { Router } from "express";
import { prisma } from "../prisma.js";

const router = Router();

router.get("/test", async (req, res) => {
  try {
    const customers = await prisma.customer.findMany();

    res.json({
      message: "Database connected successfully!",
      customers,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ message: "Database query failed" });
  }
});

router.get("/time", async (req, res) => {
  try {
    const result = await prisma.$queryRaw`SELECT NOW()`;

    res.json({
      success: true,
      message: "Database connected",
      result,
    });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({ success: false });
  }
});

export default router;
