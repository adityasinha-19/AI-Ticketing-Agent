import { inngest } from "../client";
import User from "../../models/user.model.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";
import Ticket from "../../models/ticket.model.js";
import analyzeTicket from "../../utils/ai.js";

export const onTicketCreated = inngest.createFunction(
  {
    id: "on-ticket-created",
    retries: 2,
  },
  {
    event: "ticket/created",
  },
  async ({ event, step }) => {
    try {
      const { ticketId } = event.data;

      // fetch ticket from db

      const ticket = await step.run("fetch-ticket", async () => {
        const ticketObj = await Ticket.findById(ticketId);
        if (!ticketObj) {
          return new NonRetriableError("Ticket not found");
        }
        return ticketObj;
      });

      await step.run("update-ticket-status", async () => {
        await Ticket.findByIdAndUpdate(ticket._id, { status: "TODO" });
      });

      const aiResponse = await analyzeTicket(ticket);

      const relatedSkills = await step.run("ai-processing", async () => {
        let skills = [];
        if (!aiResponse) {
          await Ticket.findByIdAndUpdate(ticket._id, {
            priority: !["low", "medium", "high"].includes(aiResponse.priority)
              ? "medium"
              : aiResponse.priority,
            helpfulNotes: aiResponse.helpfulNotes,
            status: "IN_PROGRESS",
            relatedSkills: aiResponse,
          });
          skills = aiResponse.relatedSkills;
        }
        return skills;
      });
    } catch (error) {}
  }
);
