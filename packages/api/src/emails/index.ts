/**
 * Email sending utilities using Resend.
 * @package @brol/api
 */

import { reminderEmailTemplate, reminderEmailText } from "./reminder";
import { logger } from "../lib/logger";
import { getResendClient, getResendFromAddress } from "../lib/resend";
import { translate, type Locale } from "@brol/shared";

const log = logger.child("emails.sendReminderEmail");

export interface ReminderEmailParams {
  to: string;
  borrowerName: string;
  objectName: string;
  ownerName: string;
  lentAt: Date;
  returnDueDate: Date | null;
  /** Locale of the recipient (borrower) — emails use the recipient's locale. */
  locale: Locale;
}

export async function sendReminderEmail(params: ReminderEmailParams): Promise<{ success: boolean; message: string }> {
  const { locale } = params;
  const resend = getResendClient();
  if (!resend) {
    return {
      success: false,
      message: translate(locale, "emails.reminderServiceDisabled"),
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
      locale,
    });
    const text = reminderEmailText({
      borrowerName,
      objectName,
      ownerName,
      lentAt,
      returnDueDate,
      appUrl,
      locale,
    });

    const result = await resend.emails.send({
      from: getResendFromAddress(),
      to,
      subject: translate(locale, "emails.reminderSubject", { objectName }),
      html,
      text,
    });

    if (result.error) {
      log.error("Resend returned error", { err: result.error });
      return {
        success: false,
        message: translate(locale, "emails.reminderSendFailed", { error: result.error.message }),
      };
    }

    log.info("Reminder sent", { to, objectName });
    return {
      success: true,
      message: translate(locale, "emails.reminderSentSuccess", { borrowerName: borrowerName || to }),
    };
  } catch (error) {
    log.error("Unexpected error sending reminder", { err: error });
    return {
      success: false,
      message: translate(locale, "emails.reminderSendError"),
    };
  }
}
