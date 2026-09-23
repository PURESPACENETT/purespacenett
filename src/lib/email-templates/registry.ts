import type { ComponentType } from 'react'

export interface TemplateEntry {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  component: ComponentType<any>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subject: string | ((data: Record<string, any>) => string)
  displayName?: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  previewData?: Record<string, any>
  /** Fixed recipient — overrides caller-provided recipientEmail when set. */
  to?: string
}

/**
 * Template registry — maps template names to their React Email components.
 * Import and register new templates here after creating them in this directory.
 *
 * Example:
 *   import { template as welcomeTemplate } from './welcome'
 *   // then add to TEMPLATES: 'welcome': welcomeTemplate
 */
import { template as nouvelleDemandeDevis } from './nouvelle-demande-devis'
import { template as nouvelAvisClient } from './nouvel-avis-client'

export const TEMPLATES: Record<string, TemplateEntry> = {
  'nouvelle-demande-devis': nouvelleDemandeDevis,
  'nouvel-avis-client': nouvelAvisClient,
}
