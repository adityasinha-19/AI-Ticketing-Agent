import { inngest } from "../client";
import User from "../../models/user.model.js";
import { NonRetriableError } from "inngest";
import { sendMail } from "../../utils/mailer.js";

export const onUserSignup = inngest.createFunction(
  { id: "on-user-signup", retries: 2 },
  { event: "user/signup" },
  async ({ event, step }) => {
    try {
      const { email } = event.data;

      // step one
      const user = await step.run("get-user-email", async () => {
        const userObj = await User.findOne({ email });
        if (!userObj) {
          throw new NonRetriableError("User no longer exists");
        }
        return userObj;
      });

      // step two
      await step.run("send-welcome-email", async () => {
        const subject = `Welcome to the app`;
        const message = `Hi,
        \n\n
        Thanks for signing up.We're glad to have you onboard!
        `;
        await sendMail(user.email, subject, message);

        return { success: true };
      });
    } catch (error) {
      console.error("❌ Error running step", error.message);
      return { success: false };
    }
  }
);
