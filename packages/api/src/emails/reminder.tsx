/**
 * Email template for loan reminders.
 * @package @brol/api
 */

import { translate, type Locale } from "@brol/shared";

interface ReminderEmailData {
  borrowerName: string;
  objectName: string;
  ownerName: string;
  lentAt: Date;
  returnDueDate: Date | null;
  appUrl: string;
  locale: Locale;
}

function formatDate(date: Date): string {
  return date.toLocaleDateString("fr-BE", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function reminderEmailTemplate(data: ReminderEmailData): string {
  const { borrowerName, objectName, ownerName, lentAt, returnDueDate, appUrl, locale } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Rappel de prêt — ${objectName}</title>
</head>
<body style="font-family: 'Courier New', monospace; background: #0a0a0a; color: #e0e0e0; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 40px auto; padding: 20px;">
    <div style="border: 2px solid #00ff88; padding: 20px; margin-bottom: 20px; text-align: center; background: #0d1f14;">
      <h1 style="font-size: 32px; margin: 0; color: #00ff88;">BROL</h1>
    </div>
    <div style="border: 2px solid #333; padding: 20px; background: #111;">
      <p>${translate(locale, "emails.reminderGreeting", { borrowerName: borrowerName || "vous" })}</p>
      <p>${translate(locale, "emails.reminderIntro", { ownerName })}</p>
      <div style="border: 2px dashed #00ff88; padding: 16px; margin: 20px 0; background: #0d1f14;">
        <p style="font-size: 10px; color: #00ccff; margin: 0 0 8px; letter-spacing: 2px;">${translate(locale, "emails.reminderBorrowedObjectLabel")}</p>
        <p style="font-size: 18px; font-weight: bold; color: #00ff88; margin: 0;">${objectName}</p>
      </div>
      ${returnDueDate ? `<p style="font-size: 12px;">${translate(locale, "emails.reminderExpectedReturnDate", { returnDueDate: formatDate(returnDueDate) })}</p>` : ""}
      <p>${translate(locale, "emails.reminderReturnRequest", { ownerName })}</p>
    </div>
    <div style="padding: 16px; text-align: center;">
      <p style="font-size: 10px; color: #666;"><a href="${appUrl}" style="color: #00ccff;">${translate(locale, "emails.reminderOpenBrolButton")}</a></p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function reminderEmailText(data: ReminderEmailData): string {
  const { borrowerName, objectName, ownerName, lentAt, returnDueDate, locale } = data;
  return `${translate(locale, "emails.reminderTextTitle")}

${translate(locale, "emails.reminderGreeting", { borrowerName: borrowerName || "vous" })}

${translate(locale, "emails.reminderIntro", { ownerName })}

${translate(locale, "emails.reminderTextObject", { objectName })}
${translate(locale, "emails.reminderTextLoanDate", { lentAt: formatDate(lentAt) })}
${returnDueDate ? translate(locale, "emails.reminderTextExpectedReturnDate", { returnDueDate: formatDate(returnDueDate) }) : ""}

${translate(locale, "emails.reminderReturnRequest", { ownerName })}
  `.trim();
}
