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
      payer_cpf_cnpj: payerCpf ? payerCpf.replace(/\D/g, '') : '00000000000',
      type_bank_slip: 'boletoA4',
      days_due_date: 3,
      items: [{
        description: description || `Fatura ${invoiceId}`,
        quantity: 1,
        item_id: '1',
        price_cents: Math.round(amount * 100)
      }]
    };

    const response = await fetch('https://api.paghiper.com/transaction/create/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const result = await response.json();
      return NextResponse.json(result);
    } else {
      const text = await response.text();
      console.error('PagHiper retornou resposta não-JSON (Boleto):', text);
      return NextResponse.json({ error: 'Resposta inválida da API do PagHiper' }, { status: 502 });
    }
  } catch (error) {
    console.error('Erro Boleto PagHiper:', error);
    return NextResponse.json({ error: 'Erro ao gerar Boleto' }, { status: 500 });
  }
}
