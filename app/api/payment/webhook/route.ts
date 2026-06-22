import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const secretHash = process.env.FLW_SECRET_HASH;
    const signature = request.headers.get('verif-hash');

    // Verify webhook signature
    if (secretHash && signature !== secretHash) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
    }

    const { event, data } = body;

    if (event === 'charge.completed' && data.status === 'successful') {
      const { tx_ref, amount, currency } = data;
      console.log('Payment confirmed:', { tx_ref, amount, currency });
      // Bet creation is handled client-side on payment success callback
      // This webhook serves as a secondary confirmation
    }

    return NextResponse.json({ status: 'ok' });
  } catch {
    return NextResponse.json({ error: 'Webhook error' }, { status: 500 });
  }
}
