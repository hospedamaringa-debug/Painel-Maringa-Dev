import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ success: false, message: 'Token is missing' }, { status: 400 });
    }

    const secretKey = process.env.RECAPTCHA_SECRET_KEY || '6LcpEu0qAAAAAK_6hh_59fe_uzLO28xC99xoSRDk';
    
    const response = await fetch(`https://www.google.com/recaptcha/api/siteverify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `secret=${secretKey}&response=${token}`,
    });

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const data = await response.json();
      if (data.success) {
        return NextResponse.json({ success: true });
      } else {
        return NextResponse.json({ success: false, errors: data['error-codes'] }, { status: 400 });
      }
    } else {
      const text = await response.text();
      console.error('Recaptcha retornou resposta não-JSON:', text);
      return NextResponse.json({ success: false, message: 'Erro na verificação do reCAPTCHA' }, { status: 502 });
    }
  } catch (error) {
    console.error('Error verifying reCAPTCHA:', error);
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 });
  }
}
