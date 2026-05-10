/**
 * Email sending utilities using Resend.
 * @package @brol/api
 */

import { Resend } from "resend";
import { reminderEmailTemplate, reminderEmailText } from "./reminder";

function getResendClient(): Resend | null {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export interface ReminderEmailParams {
  to: string;
  borrowerName: string;
  objectName: string;
  ownerName: string;
  lentAt: Date;
  returnDueDate: Date | null;
}

export async function sendReminderEmail(params: ReminderEmailParams): Promise<{ success: boolean; message: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("[sendReminderEmail] RESEND_API_KEY not configured");
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

    const resend = new Resend(apiKey);
    const result = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL ?? "Brol <noreply@brol.app>",
      to,
      subject: `Rappel : Pensez à retourner "${objectName}"`,
      html,
      text,
    });

    if (result.error) {
      console.error("[sendReminderEmail] Resend error:", result.error);
      return {
        success: false,
        message: `Échec de l'envoi du rappel: ${result.error.message}`,
      };
    }

    console.info(`[sendReminderEmail] Reminder sent to ${to} for object ${objectName}`);
    return {
      success: true,
      message: `Rappel envoyé à ${borrowerName || to}`,
    };
  } catch (error) {
    console.error("[sendReminderEmail] Unexpected error:", error);
    return {
      success: false,
      message: "Erreur lors de l'envoi du rappel email",
    };
  }
}
