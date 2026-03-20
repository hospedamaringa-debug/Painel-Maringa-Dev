import { NextResponse } from 'next/server';

const globalForInvoices = global as unknown as { paidInvoices: Set<string> };
if (!globalForInvoices.paidInvoices) {
  globalForInvoices.paidInvoices = new Set();
}

export async function POST(req: Request) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    
    const transaction_id = params.get('transaction_id');
    const notification_id = params.get('notification_id');
    const apiKey = process.env.PAGHIPER_API_KEY || 'apk_47353984-YHjuGjGIXulOvQHNslebMDeHnCLXlDJJ';
    const token = process.env.PAGHIPER_TOKEN || 'IM8MY2F3J0HSSV6QLX6CYI87T0R6A4KU0AM4FX5FWJLK';

    if (notification_id) {
      const response = await fetch('https://api.paghiper.com/transaction/notification/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          apiKey,
          transaction_id,
          notification_id
        })
      });

      const data = await response.json();
      
      if (data.status_request && data.status_request.result === 'success') {
        const status = data.status_request.status;
        const order_id = data.status_request.order_id;
        
        if (status === 'paid' || status === 'completed' || status === 'reserved') {
          globalForInvoices.paidInvoices.add(order_id);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const invoiceId = searchParams.get('invoiceId');
  
  if (!invoiceId) {
    return NextResponse.json({ error: 'Missing invoiceId' }, { status: 400 });
  }

  const isPaid = globalForInvoices.paidInvoices.has(invoiceId);
  return NextResponse.json({ paid: isPaid });
}
