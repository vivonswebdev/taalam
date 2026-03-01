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
  Link,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="fr" dir="ltr">
    <Head />
    <Preview>Confirmez votre email pour Ta'alam</Preview>
    <Body style={main}>
      <Container style={container}>
        <Img
          src="https://usgqmmfigvkmxneoegig.supabase.co/storage/v1/object/public/email-assets/taaloum-logo.png"
          alt="Ta'alam"
          width="80"
          height="80"
          style={logo}
        />
        <Heading style={h1}>Assalamou alaykoum 🌙</Heading>
        <Text style={text}>
          Bienvenue sur{' '}
          <Link href={siteUrl} style={link}>
            <strong>Ta'alam</strong>
          </Link>{' '}
          ! Nous sommes ravis de vous accompagner dans votre parcours coranique.
        </Text>
        <Text style={text}>
          Veuillez confirmer votre adresse email (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) en cliquant sur le bouton ci-dessous :
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirmer mon email ✨
        </Button>
        <Text style={footer}>
          Si vous n'avez pas créé de compte, vous pouvez ignorer cet email en toute sécurité.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

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
const link = { color: 'hsl(152, 56%, 28%)', textDecoration: 'underline' }
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
