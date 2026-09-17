import React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import type { TemplateEntry } from './registry'

interface Props {
  authorName?: string
  city?: string
  serviceType?: string
  rating?: number
  message?: string
  email?: string
}

const Line = ({ label, value }: { label: string; value?: string | undefined }) =>
  value ? (
    <Text style={line}>
      <strong style={strong}>{label} :</strong> {value}
    </Text>
  ) : null

const Email = ({ authorName, city, serviceType, rating, message, email }: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>
      {`Nouvel avis client${authorName ? ` de ${authorName}` : ''}${rating ? ` — ${rating}/5` : ''}`}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Nouvel avis client</Heading>
        <Text style={intro}>
          Un avis vient d&apos;être déposé depuis le site PURE SPACE NETT.
        </Text>
        <Hr style={hr} />
        <Section>
          <Line label="Auteur" value={authorName} />
          <Line label="Note" value={rating ? `${rating}/5` : undefined} />
          <Line label="Ville" value={city} />
          <Line label="Prestation" value={serviceType} />
          <Line label="E-mail" value={email} />
        </Section>
        {message ? (
          <>
            <Hr style={hr} />
            <Text style={strong}>Message</Text>
            <Text style={line}>{message}</Text>
          </>
        ) : null}
        <Hr style={hr} />
        <Text style={footer}>Avis enregistré dans votre espace privé du site.</Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  subject: (data: Record<string, any>) =>
    `Nouvel avis client${data['rating'] ? ` (${data['rating']}/5)` : ''}${data['authorName'] ? ` — ${data['authorName']}` : ''}`,
  displayName: 'Nouvel avis client',
  to: 'contact@purespacenett.com',
  previewData: {
    authorName: 'Boualem A.',
    city: 'Pantin',
    serviceType: 'Nettoyage fin de chantier',
    rating: 5,
    message: 'Travail impeccable et équipe très ponctuelle.',
    email: 'client@example.com',
  },
} satisfies TemplateEntry

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '24px 28px', maxWidth: '560px' }
const heading = { color: '#0f3d4c', fontSize: '22px', margin: '0 0 8px' }
const intro = { color: '#334155', fontSize: '15px', margin: '0' }
const line = { color: '#1e293b', fontSize: '15px', margin: '0 0 6px', lineHeight: '22px' }
const strong = { color: '#0f3d4c' }
const hr = { borderColor: '#e2e8f0', margin: '18px 0' }
const footer = { color: '#64748b', fontSize: '13px', margin: '0' }
