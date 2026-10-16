import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment/PaymentService';
import { requireAuthenticatedUser } from '@/lib/auth-server';

export async function POST(request: Request) {
  try {
    const auth = await requireAuthenticatedUser();
    if (auth instanceof NextResponse) {
      return auth;
    }

    const body = await request.json().catch(() => ({}));
    const { packageId, paymentMethod, senderIdentifier, transactionId, screenshotBase64, screenshotName } = body;

    // Server-derived user ID: strictly ignore any client-provided userId
    const effectiveUserId = auth.profile.id;

    const payment = await PaymentService.validateAndSubmit(effectiveUserId, {
      package_id: packageId,
      payment_method: paymentMethod,
      sender_identifier: senderIdentifier,
      transaction_id: transactionId,
      screenshot_base64: screenshotBase64,
      screenshot_name: screenshotName,
    });

    return NextResponse.json({
      success: true,
      payment,
      message: `Payment ${payment.payment_ref} submitted successfully. An administrator will verify your transaction shortly.`,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Payment submission failed';
    return NextResponse.json({ success: false, error: message }, { status: 400 });
  }
}
