/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

import { type EmailLang, DEFAULT_LANG, isRtl, tr } from './translations.ts'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
  lang?: EmailLang
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
  lang = DEFAULT_LANG,
}: RecoveryEmailProps) => (
  <Html lang={lang} dir={isRtl(lang) ? 'rtl' : 'ltr'}>
    <Head />
    <Preview>{tr('recovery.preview', lang)}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://usgqmmfigvkmxneoegig.supabase.co/storage/v1/object/public/email-assets/taaloum-logo.png"
          alt="Ta'alam"
          width="80"
          height="80"
          style={logo}
        />
        <Heading style={h1}>{tr('recovery.heading', lang)}</Heading>
        <Text style={text}>{tr('common.salam', lang)}</Text>
        <Text style={text}>{tr('recovery.text', lang)}</Text>
        <Button style={button} href={confirmationUrl}>
          {tr('recovery.button', lang)}
        </Button>
        <Text style={footer}>{tr('recovery.footer', lang)}</Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

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
const button = {
  backgroundColor: 'hsl(152, 56%, 28%)',
  color: 'hsl(40, 40%, 97%)',
  fontSize: '14px',
  fontWeight: 'bold' as const,
  borderRadius: '16px',
  padding: '14px 28px',
  textDecoration: 'none',
  display: 'block' as const,
  textAlign: 'center' as const,
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0', textAlign: 'center' as const }
