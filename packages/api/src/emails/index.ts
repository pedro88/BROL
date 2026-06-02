/**
 * Email sending utilities using Resend.
 * @package @brol/api
 */

import { reminderEmailTemplate, reminderEmailText } from "./reminder";
import { logger } from "../lib/logger";
import { getResendClient, getResendFromAddress } from "../lib/resend";

const log = logger.child("emails.sendReminderEmail");

export interface ReminderEmailParams {
  to: string;
  borrowerName: string;
  objectName: string;
  ownerName: string;
  lentAt: Date;
  returnDueDate: Date | null;
}

export async function sendReminderEmail(params: ReminderEmailParams): Promise<{ success: boolean; message: string }> {
  const resend = getResendClient();
  if (!resend) {
    return {
      success: false,
      message: "Service de rappel désactivé (clé API non configurée)",
    };
  }

  const { to, borrowerName, objectName, ownerName, lentAt, returnDueDate } = params;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://brol.app";

  try {
    const html = reminderEmailTemplate({
      borrowerName,
      objectName,
      ownerName,
      lentAt,
      returnDueDate,
      appUrl,
    });
    const text = reminderEmailText({
      borrowerName,
      objectName,
      ownerName,
      lentAt,
      returnDueDate,
      appUrl,
    });

    const result = await resend.emails.send({
      from: getResendFromAddress(),
      to,
      subject: `Rappel : Pensez à retourner "${objectName}"`,
      html,
      text,
    });

    if (result.error) {
      log.error("Resend returned error", { err: result.error });
      return {
        success: false,
        message: `Échec de l'envoi du rappel: ${result.error.message}`,
      };
    }

    log.info("Reminder sent", { to, objectName });
    return {
      success: true,
      message: `Rappel envoyé à ${borrowerName || to}`,
    };
  } catch (error) {
    log.error("Unexpected error sending reminder", { err: error });
    return {
      success: false,
      message: "Erreur lors de l'envoi du rappel email",
    };
  }
}
