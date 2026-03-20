import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { transaction_id } = body;

    if (!transaction_id) {
      return NextResponse.json({ error: 'ID da transação é obrigatório' }, { status: 400 });
    }

    const apiKey = process.env.PAGHIPER_API_KEY || 'apk_47353984-YHjuGjGIXulOvQHNslebMDeHnCLXlDJJ';
    const token = process.env.PAGHIPER_TOKEN || 'IM8MY2F3J0HSSV6QLX6CYI87T0R6A4KU0AM4FX5FWJLK';

    const data = {
      apiKey,
      token,
      transaction_id
    };

    const response = await fetch('https://api.paghiper.com/transaction/status/', {
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
      console.error('PagHiper retornou resposta não-JSON:', text);
      return NextResponse.json({ error: 'Resposta inválida da API do PagHiper' }, { status: 502 });
    }
  } catch (error) {
    console.error('Erro Status PagHiper:', error);
    return NextResponse.json({ error: 'Erro ao consultar status' }, { status: 500 });
  }
}
