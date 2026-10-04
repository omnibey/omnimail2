import { NextResponse } from 'next/server';
import { PaymentService } from '@/services/payment/PaymentService';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, packageId, paymentMethod, senderIdentifier, transactionId, screenshotBase64, screenshotName } = body;

    const effectiveUserId = userId || 'user-demo-1';

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
