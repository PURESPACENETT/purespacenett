import * as React from "react";
import { render } from "@react-email/render";
import { TEMPLATES } from "./registry";

const SITE_NAME = "PURE SPACE NETT";

export type SendTemplateEmailResult =
  | { sent: true }
  | { sent: false; reason: "recipient_suppressed" };

export interface SendTemplateEmailOptions {
  templateData?: Record<string, unknown>;
  idempotencyKey?: string;
  replyTo?: string;
}

export async function sendTemplateEmail(
  templateName: string,
  to: string,
  options: SendTemplateEmailOptions = {},
): Promise<SendTemplateEmailResult> {
  const apiKey = process.env["RESEND_API_KEY"];
  const from = process.env["RESEND_FROM_EMAIL"];
  if (!apiKey) throw new Error("RESEND_API_KEY is not configured");
  if (!from) throw new Error("RESEND_FROM_EMAIL is not configured");

  const template = TEMPLATES[templateName];
  if (!template) {
    throw new Error(
      `Template '${templateName}' not found. Available: ${Object.keys(TEMPLATES).join(", ")}`,
    );
  }

  const recipient = template.to || to;
  if (!recipient) throw new Error("Recipient is required");

  const templateData = options.templateData ?? {};
  const element = React.createElement(template.component, templateData);
  const html = await render(element);
  const text = await render(element, { plainText: true });
  const subject =
    typeof template.subject === "function"
      ? template.subject(templateData)
      : template.subject;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(options.idempotencyKey
        ? { "Idempotency-Key": options.idempotencyKey }
        : {}),
    },
    body: JSON.stringify({
      from: from.replace(/^PURE SPACE NETT\s*</, `${SITE_NAME} <`),
      to: [recipient],
      subject,
      html,
      text,
      ...(options.replyTo ? { reply_to: options.replyTo } : {}),
      tags: [{ name: "template", value: templateName }],
    }),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    throw new Error(
      `Resend email failed (${response.status}): ${detail.slice(0, 500)}`.trim(),
    );
  }

  return { sent: true };
}
