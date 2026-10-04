import { ExtractedOTP, OTPConfidence } from '@/types';

export class OTPService {
  /**
   * Heuristically detects likely verification codes, OTPs, and authorization PINs from email content.
   * Wording is carefully qualified ("Detected verification code") as specified.
   */
  public static detect(subject: string, bodyText: string, bodyHtml?: string): ExtractedOTP | null {
    const combinedContent = `${subject} \n ${bodyText} \n ${bodyHtml || ''}`;

    // Common context patterns for verification codes
    const patterns = [
      // Explicit labels with 4-8 digits e.g. "code is: 482931", "verification code: 9281"
      /(?:verification\s*code|verify\s*code|security\s*code|confirm\s*code|login\s*code|passcode|one-time\s*password|otp|pin|auth\s*code)[\s:=–—]+([0-9]{4,8})\b/i,
      // "Your code is 492810"
      /(?:your|the)\s+(?:verification|security|access|confirmation)?\s*code\s+is\s*[:\s]*([0-9]{4,8})\b/i,
      // Standalone formatted 6-digit block e.g. "Use 482 931 to continue" or "482-931"
      /(?:code|otp)[\s:=–—]+([0-9]{3}[-\s][0-9]{3})\b/i,
      // Words like "Enter 592819"
      /(?:enter|use|input)\s+([0-9]{4,8})\s+(?:to\s+(?:verify|confirm|log\s*in|continue))/i,
      // Alphanumeric codes: e.g. "Code: ABC-1234"
      /(?:verification\s*code|security\s*key)[\s:=]+([A-Z0-9]{4,10})\b/i,
      // Isolated prominent 6-digit number in subject
      /\b([0-9]{6})\b/,
    ];

    for (let i = 0; i < patterns.length; i++) {
      const match = combinedContent.match(patterns[i]);
      if (match && match[1]) {
        let code = match[1].trim().replace(/\s+|-/g, '');

        // Determine heuristic confidence
        let confidence: OTPConfidence = 'low';
        if (i <= 1) {
          confidence = 'high';
        } else if (i <= 3) {
          confidence = 'medium';
        } else {
          confidence = 'low';
        }

        return {
          code,
          confidence,
          contextMessage: `Detected verification code: ${code}`,
        };
      }
    }

    return null;
  }
}
