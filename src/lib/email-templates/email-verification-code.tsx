import * as React from 'react'
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

import type { TemplateEntry } from './registry'

interface EmailVerificationCodeProps {
  /** The 6-digit one-time code the merchant must type back into the sign-up form. */
  code?: string
  /** Minutes until the code stops working. */
  minutes?: number
}

const SITE_NAME = 'Cryptope'

/** One-time code used to confirm a merchant's work email during sign-up. */
const EmailVerificationCode = ({ code = '000000', minutes = 10 }: EmailVerificationCodeProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>{`Your ${SITE_NAME} verification code is ${code}`}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Confirm your email address</Heading>
        <Text style={text}>
          Use the code below to confirm your email address and continue creating your {SITE_NAME}{' '}
          merchant account.
        </Text>
        <Section style={codeBox}>
          <Text style={codeText}>{code}</Text>
        </Section>
        <Text style={text}>
          The code expires in {minutes} minutes. For your security, never share it with anyone —
          including someone claiming to be from {SITE_NAME}.
        </Text>
        <Text style={footer}>
          If you did not start a sign-up, you can safely ignore this email and no account will be
          created.
        </Text>
      </Container>
    </Body>
  </Html>
)

export const template = {
  component: EmailVerificationCode,
  subject: `Your ${SITE_NAME} verification code`,
  displayName: 'Email verification code',
  previewData: { code: '482913', minutes: 10 },
} satisfies TemplateEntry

export default EmailVerificationCode

const main = { backgroundColor: '#ffffff', fontFamily: 'Arial, Helvetica, sans-serif' }
const container = { padding: '24px 25px', maxWidth: '520px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#0b1220', margin: '0 0 16px' }
const text = { fontSize: '15px', lineHeight: '24px', color: '#334155', margin: '0 0 16px' }
const codeBox = {
  backgroundColor: '#f1f5f9',
  borderRadius: '12px',
  padding: '18px',
  textAlign: 'center' as const,
  margin: '0 0 20px',
}
const codeText = {
  fontSize: '32px',
  fontWeight: 'bold' as const,
  letterSpacing: '10px',
  color: '#0b1220',
  margin: '0',
}
const footer = { fontSize: '13px', lineHeight: '20px', color: '#64748b', margin: '24px 0 0' }
