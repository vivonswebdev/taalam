/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Votre code de vérification Ta'alam</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://usgqmmfigvkmxneoegig.supabase.co/storage/v1/object/public/email-assets/taaloum-logo.png"
          alt="Ta'alam"
          width="80"
          height="80"
          style={logo}
        />
        <Heading style={h1}>Code de vérification 🔐</Heading>
        <Text style={text}>Assalamou alaykoum,</Text>
        <Text style={text}>
          Voici votre code pour confirmer votre identité :
        </Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={text}>Ce code expirera dans quelques minutes.</Text>
        <Text style={footer}>
          Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Outfit', Arial, sans-serif" }
const container = { padding: '30px 25px', maxWidth: '480px', margin: '0 auto' }
const logo = { margin: '0 auto 20px', display: 'block' as const }
const h1 = {
  fontSize: '22px',
  fontWeight: 'bold' as const,
  color: 'hsl(150, 40%, 10%)',
  margin: '0 0 20px',
  textAlign: 'center' as const,
}
const text = {
  fontSize: '14px',
  color: 'hsl(150, 10%, 46%)',
  lineHeight: '1.6',
  margin: '0 0 20px',
}
const codeStyle = {
  fontFamily: 'Courier, monospace',
  fontSize: '32px',
  fontWeight: 'bold' as const,
  color: 'hsl(152, 56%, 28%)',
  margin: '10px 0 30px',
  textAlign: 'center' as const,
  letterSpacing: '6px',
  padding: '16px',
  backgroundColor: 'hsl(152, 35%, 92%)',
  borderRadius: '16px',
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0', textAlign: 'center' as const }
