/**
 * Email template for loan reminders.
 * Sent to the borrower when the owner requests a reminder.
 *
 * @package @brol/api
 */

interface ReminderEmailData {
  borrowerName: string;
  objectName: string;
  ownerName: string;
  lentAt: Date;
  returnDueDate: Date | null;
  appUrl: string;
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
  const { borrowerName, objectName, ownerName, lentAt, returnDueDate, appUrl } = data;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rappel de prêt — ${objectName}</title>
</head>
<body style="font-family: 'Courier New', Courier, monospace; background: #0a0a0a; color: #e0e0e0; margin: 0; padding: 0;">
  <div style="max-width: 600px; margin: 40px auto; padding: 20px;">
    <!-- Header -->
    <div style="border: 2px solid #00ff88; padding: 20px; margin-bottom: 20px; text-align: center; background: #0d1f14;">
      <h1 style="font-size: 32px; margin: 0; color: #00ff88; text-shadow: 0 0 10px #00ff88;">
        BROL
      </h1>
      <p style="font-size: 10px; color: #00ccff; margin: 4px 0 0; letter-spacing: 4px;">
        PRÊT EN RETARD
      </p>
    </div>

    <!-- Content -->
    <div style="border: 2px solid #333; padding: 20px; background: #111;">
      <p style="font-size: 14px;">Bonjour <strong>${borrowerName || "vous"}</strong>,</p>

      <p style="font-size: 14px;">
        ${ownerName} vous envoie un rappel concernant un prêt.
      </p>

      <!-- Object card -->
      <div style="border: 2px dashed #00ff88; padding: 16px; margin: 20px 0; background: #0d1f14;">
        <p style="font-size: 10px; color: #00ccff; margin: 0 0 8px; letter-spacing: 2px;">OBJET EMPRUNTÉ</p>
        <p style="font-size: 18px; font-weight: bold; color: #00ff88; margin: 0;">${objectName}</p>
      </div>

      <!-- Dates -->
      <div style="margin: 20px 0;">
        <p style="font-size: 12px; margin: 4px 0;">
          <span style="color: #666;">DATE DU PRÊT&nbsp;:</span>
          ${formatDate(lentAt)}
        </p>
        ${returnDueDate ? `
        <p style="font-size: 12px; margin: 4px 0;">
          <span style="color: #ff4444;">DATE DE RETOUR ATTENDUE&nbsp;:</span>
          ${formatDate(returnDueDate)}
        </p>
        ` : ""}
      </div>

      <p style="font-size: 14px; color: #ff4444; font-weight: bold;">
        ⚠️ La date de retour prévue est passée.
      </p>

      <p style="font-size: 14px;">
        Merci de bien vouloir retourner cet objet à ${ownerName} dans les meilleurs délais.
      </p>
    </div>

    <!-- Footer -->
    <div style="border: 2px solid #333; border-top: none; padding: 16px; background: #0a0a0a;">
      <p style="font-size: 10px; color: #666; text-align: center; margin: 0;">
        Envoyé via BROL · <a href="${appUrl}" style="color: #00ccff;">Ouvrir BROL</a>
      </p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

export function reminderEmailText(data: ReminderEmailData): string {
  const { borrowerName, objectName, ownerName, lentAt, returnDueDate } = data;

  return `
BROL — RAPPEL DE PRÊT

Bonjour ${borrowerName || "vous"},

${ownerName} vous envoie un rappel concernant un prêt.

OBJET: ${objectName}
DATE DU PRÊT: ${formatDate(lentAt)}
${returnDueDate ? `DATE DE RETOUR ATTENDUE: ${formatDate(returnDueDate)}` : ""}

⚠️ La date de retour prévue est passée.

Merci de bien vouloir retourner cet objet à ${ownerName} dans les meilleurs délais.
  `.trim();
}
