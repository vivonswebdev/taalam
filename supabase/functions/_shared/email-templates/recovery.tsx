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
  Section,
} from 'npm:@react-email/components@0.0.22'

import { type EmailLang, DEFAULT_LANG, isRtl, tr } from './translations.ts'

interface RecoveryEmailProps {
  siteName: string
  token: string
  lang?: EmailLang
}

export const RecoveryEmail = ({
  siteName,
  token,
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
        <Text style={codeLabel}>{tr('recovery.codeLabel', lang)}</Text>
        <Section style={codeBox}>
          <Text style={codeText}>{token}</Text>
        </Section>
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
const codeLabel = {
  fontSize: '14px',
  color: 'hsl(150, 10%, 46%)',
  lineHeight: '1.6',
  margin: '0 0 8px',
  textAlign: 'center' as const,
}
const codeBox = {
  backgroundColor: 'hsl(150, 30%, 96%)',
  border: '2px dashed hsl(152, 56%, 28%)',
  borderRadius: '16px',
  padding: '20px',
  margin: '0 0 24px',
  textAlign: 'center' as const,
}
const codeText = {
  fontSize: '36px',
  fontWeight: 'bold' as const,
  letterSpacing: '8px',
  color: 'hsl(152, 56%, 28%)',
  margin: '0',
  fontFamily: "'Courier New', monospace",
}
const footer = { fontSize: '12px', color: '#999999', margin: '30px 0 0', textAlign: 'center' as const }
