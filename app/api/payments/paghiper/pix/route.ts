import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoiceId, amount, description, payerName, payerEmail, payerCpf } = body;

    const apiKey = process.env.PAGHIPER_API_KEY || 'apk_47353984-YHjuGjGIXulOvQHNslebMDeHnCLXlDJJ';
    const token = process.env.PAGHIPER_TOKEN || 'IM8MY2F3J0HSSV6QLX6CYI87T0R6A4KU0AM4FX5FWJLK';

    const data = {
      apiKey,
      token,
      order_id: invoiceId,
      payer_email: payerEmail || 'cliente@hospedamaringa.com.br',
      payer_name: payerName || 'Cliente Hospeda Maringá',
      payer_cpf_cnpj: payerCpf || '00000000000',
      days_due_date: 3,
      items: [{
        description: description || `Fatura ${invoiceId}`,
        quantity: 1,
        item_id: '1',
        price_cents: Math.round(amount * 100)
      }]
    };

    const response = await fetch('https://pix.paghiper.com/invoice/create/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const result = await response.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro PIX PagHiper:', error);
    return NextResponse.json({ error: 'Erro ao gerar PIX' }, { status: 500 });
  }
}
