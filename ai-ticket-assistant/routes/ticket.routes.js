import express from "express";
import { authenticate } from "../middlewares/auth.middleware";
import {
  createTicket,
  getTicket,
  getTickets,
} from "../controllers/ticket.controller.js";

const router = express.Router();

router.get("/", authenticate, getTickets);
router.get("/:id", authenticate, getTicket);
router.post("/", authenticate, createTicket);

export default router;
