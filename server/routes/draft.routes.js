
import express from "express";
import {
  updateDraft,
  approveDraft,
} from "../controllers/draft.controller.js";

const router = express.Router();

router.patch("/:draftId", updateDraft);
router.patch("/:draftId/approve", approveDraft);

export default router;
