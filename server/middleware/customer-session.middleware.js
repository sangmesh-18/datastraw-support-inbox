import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../prisma.js";

/**
 * Generate a cryptographically signed, unguessable customer session token.
 * Contains session ID, customer ID, and conversation ID.
 */
export const createCustomerSessionToken = ({ customerId, conversationId }) => {
  const sessionId = crypto.randomUUID();

  return jwt.sign(
    {
      sub: sessionId,
      customerId,
      conversationId,
      role: "CUSTOMER",
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

/**
 * Extract customer session token from x-customer-session header,
 * Authorization header, or cookie.
 */
export const extractCustomerSessionToken = (req) => {
  const headerToken = req.headers["x-customer-session"];
  if (headerToken && typeof headerToken === "string") {
    return headerToken.trim();
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1].trim();
  }

  return null;
};

/**
 * Required Customer Session Middleware:
 * Validates that the request has a valid, non-expired customer session token,
 * and ensures the conversation belongs to the customer in the database.
 */
export const authenticateCustomerSession = async (req, res, next) => {
  const token = extractCustomerSessionToken(req);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Customer session token is required to access this conversation",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "CUSTOMER" || !decoded.conversationId || !decoded.customerId) {
      return res.status(401).json({
        success: false,
        message: "Invalid customer session token",
      });
    }

    // Verify database ownership: conversation must exist and match customer
    const conversation = await prisma.conversation.findUnique({
      where: { id: decoded.conversationId },
      select: {
        id: true,
        customerId: true,
        status: true,
        brandId: true,
      },
    });

    if (!conversation || conversation.customerId !== decoded.customerId) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    req.customerSession = {
      sessionId: decoded.sub,
      customerId: decoded.customerId,
      conversationId: decoded.conversationId,
    };
    req.customerConversation = conversation;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Customer session has expired or is invalid. Please start a new session.",
    });
  }
};

/**
 * Optional Customer Session Middleware:
 * Used on message creation where the visitor may be either:
 * 1) A new anonymous user sending their first message (no session yet)
 * 2) An existing session sending an additional message in their conversation
 */
export const optionalCustomerSession = async (req, res, next) => {
  const token = extractCustomerSessionToken(req);

  if (!token) {
    req.customerSession = null;
    return next();
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role === "CUSTOMER" && decoded.conversationId && decoded.customerId) {
      const conversation = await prisma.conversation.findUnique({
        where: { id: decoded.conversationId },
        select: {
          id: true,
          customerId: true,
          status: true,
          brandId: true,
        },
      });

      if (conversation && conversation.customerId === decoded.customerId) {
        req.customerSession = {
          sessionId: decoded.sub,
          customerId: decoded.customerId,
          conversationId: decoded.conversationId,
        };
        req.customerConversation = conversation;
      } else {
        req.customerSession = null;
      }
    } else {
      req.customerSession = null;
    }
  } catch {
    // If token is invalid or expired, treat as new session
    req.customerSession = null;
  }

  next();
};

