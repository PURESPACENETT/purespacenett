import * as React from 'react'
import { render } from '@react-email/render'
import { TEMPLATES } from './registry'

// Server-only: reads RESEND_API_KEY and RESEND_FROM_EMAIL. Never import from client components.
const SITE_NAME = "PURE SPACE NETT"
// SENDER_DOMAIN is the verified sender subdomain FQDN (e.g., "notify.example.com").
// It MUST match the subdomain delegated to Lovable's nameservers. NEVER use the root domain.
const FROM_DOMAIN = "purespacenett.com"

export type SendTemplateEmailResult =
  | { sent: true }
  | { sent: false; reason: 'recipient_suppressed' }

export interface SendTemplateEmailOptions {
  templateData?: Record<string, any>
  /** Dedupes retries of the same logical send; defaults to a random UUID (no dedupe). */
  idempotencyKey?: string
  replyTo?: string
}

/**
 * Renders a registered template and sends it through Lovable's managed email
 * API. Suppression, retries, and rate limits are enforced by Lovable
 * server-side. A suppressed recipient is an expected outcome
 * ({ sent: false }); any other failure throws — EmailAPIError exposes
 * .code and .status for branching.
 */
export async function sendTemplateEmail(
  templateName: string,
  to: string,
  options: SendTemplateEmailOptions = {}
): Promise<SendTemplateEmailResult> {
  const apiKey = process.env['RESEND_API_KEY']
  const from = process.env['RESEND_FROM_EMAIL']
  if (!apiKey || !from) {
    throw new Error('RESEND_API_KEY et RESEND_FROM_EMAIL doivent être configurés')
  }

  const template = TEMPLATES[templateName]
  if (!template) {
    throw new Error(
      `Template '${templateName}' not found. Available: ${Object.keys(TEMPLATES).join(', ')}`
    )
  }

  const recipient = template.to || to
  if (!recipient) {
    throw new Error('Recipient is required (the template defines no fixed recipient)')
  }

  const templateData = options.templateData ?? {}
  const element = React.createElement(template.component, templateData)
  const html = await render(element)
  const text = await render(element, { plainText: true })
  const subject =
    typeof template.subject === 'function'
      ? template.subject(templateData)
      : template.subject

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(options.idempotencyKey
        ? { 'Idempotency-Key': options.idempotencyKey }
        : {}),
    },
    body: JSON.stringify({
      from: from || `${SITE_NAME} <noreply@${FROM_DOMAIN}>`,
      to: [recipient],
      subject,
      html,
      text,
      ...(options.replyTo ? { reply_to: options.replyTo } : {}),
    }),
  })

  if (!response.ok) {
    const errorText = await response.text()
    throw new Error(`Resend (${response.status}): ${errorText.slice(0, 500)}`)
  }

  return { sent: true }
}
