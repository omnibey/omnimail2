import { NextResponse } from 'next/server';
import { OmniMailRepository } from '@/lib/store/repository';

const SAMPLE_TEMPLATES = [
  {
    sender: 'security@discord.com',
    service: 'Discord',
    subject: 'Discord Verification Code: {{OTP}}',
    bodyText: 'Hey there,\n\nSomeone is trying to verify an account with your email address.\n\nYour Discord verification code is: {{OTP}}\n\nThis code will expire in 10 minutes. Do not share it with anyone.',
    bodyHtml: '<div style="font-family:sans-serif;padding:24px;background:#f3f4f6;border-radius:12px;"><h2 style="color:#5865F2;">Discord Security Verification</h2><p>Here is your one-time verification code:</p><div style="font-size:32px;font-weight:bold;letter-spacing:6px;color:#5865F2;padding:16px;background:#ffffff;border-radius:8px;display:inline-block;margin:12px 0;">{{OTP}}</div><p style="color:#6b7280;font-size:13px;">Expires in 10 minutes.</p></div>',
  },
  {
    sender: 'support@openai.com',
    service: 'OpenAI',
    subject: 'Your OpenAI security code: {{OTP}}',
    bodyText: 'Your one-time login passcode for OpenAI is {{OTP}}. If you did not request this, please disregard this message.',
    bodyHtml: '<div style="font-family:sans-serif;padding:20px;border:1px solid #e5e7eb;border-radius:8px;"><h3>OpenAI Verification</h3><p>Your security code is:</p><p style="font-size:26px;font-weight:700;color:#10a37f;letter-spacing:4px;">{{OTP}}</p><p style="font-size:12px;color:#9ca3af;">OmniMail Heuristic Detector</p></div>',
  },
  {
    sender: 'no-reply@github.com',
    service: 'GitHub',
    subject: '[GitHub] Please verify your device (Code: {{OTP}})',
    bodyText: 'Hello from GitHub,\n\nA sign-in attempt requires verification. Enter the security code:\n\n{{OTP}}\n\nThanks,\nThe GitHub Team',
    bodyHtml: '<div style="font-family:sans-serif;padding:20px;background:#0d1117;color:#f0f6fc;border-radius:8px;"><h3 style="color:#58a6ff;">GitHub Device Verification</h3><p>Enter the verification code to continue:</p><div style="font-size:28px;font-weight:bold;letter-spacing:4px;color:#3fb950;padding:12px;background:#161b22;border-radius:6px;display:inline-block;">{{OTP}}</div></div>',
  },
  {
    sender: 'info@mailer.netflix.com',
    service: 'Netflix',
    subject: 'Complete your Netflix signup with code {{OTP}}',
    bodyText: 'Hi,\n\nUse code {{OTP}} to verify your account. It expires in 15 minutes.\n\n- The Netflix Team',
    bodyHtml: '<div style="font-family:sans-serif;padding:24px;background:#141414;color:#ffffff;border-radius:8px;"><h2 style="color:#E50914;">Netflix Verification</h2><p>Here is your temporary passcode:</p><div style="font-size:32px;font-weight:bold;letter-spacing:5px;color:#E50914;padding:16px;background:#000000;border-radius:8px;display:inline-block;">{{OTP}}</div></div>',
  },
];

export async function POST(request: Request) {
  try {
    const { emailAddressId, customService } = await request.json();

    if (!emailAddressId) {
      return NextResponse.json({ success: false, error: 'emailAddressId is required' }, { status: 400 });
    }

    const email = await OmniMailRepository.getEmailAddressById(emailAddressId);
    if (!email) {
      return NextResponse.json({ success: false, error: 'Email address not found' }, { status: 404 });
    }

    // Pick template or random
    const template = customService 
      ? SAMPLE_TEMPLATES.find(t => t.service.toLowerCase() === customService.toLowerCase()) || SAMPLE_TEMPLATES[0]
      : SAMPLE_TEMPLATES[Math.floor(Math.random() * SAMPLE_TEMPLATES.length)];

    const randomOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const subject = template.subject.replace('{{OTP}}', randomOtp);
    const bodyText = template.bodyText.replace(/\{\{OTP\}\}/g, randomOtp);
    const bodyHtml = template.bodyHtml.replace(/\{\{OTP\}\}/g, randomOtp);

    const message = await OmniMailRepository.receiveIncomingMessage(
      emailAddressId,
      template.sender,
      subject,
      bodyText,
      bodyHtml
    );

    return NextResponse.json({
      success: true,
      message,
      detectedOtp: message?.detected_otp,
      info: `Simulated incoming message from ${template.service} with code ${randomOtp}`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to simulate email';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
