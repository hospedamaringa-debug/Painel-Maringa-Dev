import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { invoiceId, amount, description } = body;

    // Mocking NuPay response since we don't have real keys
    // In a real scenario, we would call NuPay API to generate a checkout URL
    // https://docs.nupaybusiness.com.br/checkout/docs/openapi/index.html
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    return NextResponse.json({
      success: true,
      checkoutUrl: `https://checkout.nupaybusiness.com.br/pay/mock-${invoiceId}?amount=${amount}`,
      payload: body,
      message: 'Checkout NuPay gerado com sucesso (Mock)'
    });
  } catch (error) {
    console.error('Erro NuPay:', error);
    return NextResponse.json({ error: 'Erro ao gerar NuPay' }, { status: 500 });
  }
}
