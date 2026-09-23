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
  fullName?: string
  email?: string
  phone?: string
  address?: string
  propertyType?: string
  surface?: string
  serviceType?: string
  frequency?: string
  message?: string
  photoUrls?: string[]
}

const Line = ({ label, value }: { label: string; value?: string | undefined }) =>
  value ? (
    <Text style={line}>
      <strong style={strong}>{label} :</strong> {value}
    </Text>
  ) : null

const Email = ({
  fullName,
  email,
  phone,
  address,
  propertyType,
  surface,
  serviceType,
  frequency,
  message,
  photoUrls = [],
}: Props) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>
      {`Nouvelle demande de devis${fullName ? ` de ${fullName}` : ''}${serviceType ? ` — ${serviceType}` : ''}`}
    </Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={heading}>Nouvelle demande de devis</Heading>
        <Text style={intro}>
          Une demande vient d&apos;être envoyée depuis le site PURE SPACE NETT.
        </Text>
        <Hr style={hr} />
        <Section>
          <Line label="Nom" value={fullName} />
          <Line label="E-mail" value={email} />
          <Line label="Téléphone" value={phone} />
          <Line label="Adresse" value={address} />
          <Line label="Type de bien" value={propertyType} />
          <Line label="Surface" value={surface} />
          <Line label="Prestation" value={serviceType} />
          <Line label="Fréquence" value={frequency} />
        </Section>
        {photoUrls.length > 0 ? (
          <>
            <Hr style={hr} />
            <Text style={strong}>Photos jointes</Text>
            {photoUrls.map((url, index) => (
              <Text key={url} style={line}>
                <a href={url}>Photo {index + 1}</a>
              </Text>
            ))}
          </>
        ) : null}
        {message ? (
          <>
            <Hr style={hr} />
            <Text style={strong}>Précisions du client</Text>
            <Text style={line}>{message}</Text>
          </>
        ) : null}
        <Hr style={hr} />
        <Text style={footer}>
          Demande enregistrée dans votre espace privé du site.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: Email,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  subject: (data: Record<string, any>) =>
    `Nouvelle demande de devis${data['fullName'] ? ` — ${data['fullName']}` : ''}`,
  displayName: 'Nouvelle demande de devis',
  to: 'contact@purespacenett.com',
  previewData: {
    fullName: 'Marie Dupont',
    email: 'marie.dupont@example.com',
    phone: '06 12 34 56 78',
    address: '12 rue de Paris, 93310 Le Pré-Saint-Gervais',
    propertyType: 'Bureaux',
    surface: '120 m²',
    serviceType: 'Nettoyage de bureaux',
    frequency: 'Hebdomadaire',
    message: 'Nous cherchons un passage tous les vendredis soir.',
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
