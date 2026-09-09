// Thin client around Resend's API (https://resend.com/docs/api-reference/emails/send-email).
// Uses their shared sandbox sender by default, so it works the moment a user
// pastes in any Resend API key — no domain verification required to start.
// Users can switch to a verified custom domain in their own Resend account
// later; this app doesn't need to know about that.
const FROM_ADDRESS = "SERP Wanderer <onboarding@resend.dev>";

export class EmailError extends Error {}

export async function sendEmail(params: {
  apiKey: string;
  to: string;
  subject: string;
  html: string;
}): Promise<void> {
  const resp = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${params.apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: FROM_ADDRESS,
      to: params.to,
      subject: params.subject,
      html: params.html,
    }),
  });

  if (!resp.ok) {
    const body = await resp.text().catch(() => "");
    throw new EmailError(`Resend send failed (${resp.status}): ${body.slice(0, 300)}`);
  }
}
