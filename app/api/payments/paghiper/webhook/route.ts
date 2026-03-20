import { NextResponse } from 'next/server';

// IPs autorizados pela PagHiper
const AUTHORIZED_IPS = [
  '3.228.145.191', // Primário
  '15.188.152.107', // Secundário
  '54.207.60.165'  // Secundário
];

// User-Agents autorizados pela PagHiper
const AUTHORIZED_USER_AGENTS = [
  'PAGHIPER-Webhook/1.3',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/70.0.3538.77 Safari/537.36'
];

export async function POST(req: Request) {
  try {
    // 1. Validação de IP (Opcional, mas recomendado para segurança)
    // Nota: Em ambientes de proxy (como Nginx), o IP real costuma vir no header x-forwarded-for
    const forwardedFor = req.headers.get('x-forwarded-for');
    const clientIp = forwardedFor ? forwardedFor.split(',')[0].trim() : '';
    
    // 2. Validação de User-Agent
    const userAgent = req.headers.get('user-agent') || '';

    console.log(`[Webhook PagHiper] Recebido de IP: ${clientIp}, UA: ${userAgent}`);

    // Verificação de segurança simplificada
    const isAuthorizedIp = AUTHORIZED_IPS.includes(clientIp);
    const isAuthorizedUA = AUTHORIZED_USER_AGENTS.some(ua => userAgent.includes(ua));

    // Se não for de um IP ou UA conhecido, logamos mas podemos continuar ou bloquear
    if (!isAuthorizedIp && !isAuthorizedUA) {
      console.warn(`[Webhook PagHiper] Alerta: Requisição de origem desconhecida. IP: ${clientIp}`);
      // Em produção, você pode querer retornar 403 aqui se for rigoroso
      // return new Response('Unauthorized', { status: 403 });
    }

    const formData = await req.formData();
    const notification_id = formData.get('notification_id');
    const transaction_id = formData.get('transaction_id');

    if (!notification_id || !transaction_id) {
      return new Response('Dados incompletos', { status: 400 });
    }

    console.log(`[Webhook PagHiper] Processando Notificação: ${notification_id}, Transação: ${transaction_id}`);

    // 3. Consultar a API da PagHiper para confirmar a notificação
    const apiKey = process.env.PAGHIPER_API_KEY || 'apk_47353984-YHjuGjGIXulOvQHNslebMDeHnCLXlDJJ';
    const token = process.env.PAGHIPER_TOKEN || 'IM8MY2F3J0HSSV6QLX6CYI87T0R6A4KU0AM4FX5FWJLK';

    const verifyData = {
      apiKey,
      token,
      notification_id,
      transaction_id
    };

    // Tenta primeiro o endpoint de Boleto
    let verifyResponse = await fetch('https://api.paghiper.com/transaction/notification/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(verifyData)
    });

    let result;
    const contentType = verifyResponse.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      result = await verifyResponse.json();
    } else {
      const text = await verifyResponse.text();
      console.error('[Webhook PagHiper] Resposta não-JSON na verificação (Boleto):', text);
      result = { status_request: { result: 'reject', response_message: 'Resposta inválida' } };
    }

    // Se falhar ou disser que a transação é inválida, tenta o endpoint de PIX
    if (result?.status_request?.result === 'reject' && 
        (result.status_request.response_message?.includes('inválida') || 
         result.status_request.response_message?.includes('não encontrada') ||
         result.status_request.response_message?.includes('Resposta inválida'))) {
      
      const pixVerifyResponse = await fetch('https://pix.paghiper.com/invoice/notification/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(verifyData)
      });

      const pixContentType = pixVerifyResponse.headers.get("content-type");
      if (pixContentType && pixContentType.indexOf("application/json") !== -1) {
        const pixResult = await pixVerifyResponse.json();
        if (pixResult?.status_request?.result === 'success') {
          result = pixResult;
        }
      }
    }

    if (result?.status_request?.result === 'success') {
      const status = result.status_request.status;
      console.log(`[Webhook PagHiper] Status da Transação ${transaction_id}: ${status}`);
      return new Response('OK', { status: 200 });
    } else {
      console.error('[Webhook PagHiper] Falha ao verificar notificação:', result);
      return new Response('Erro na verificação', { status: 500 });
    }

  } catch (error) {
    console.error('[Webhook PagHiper] Erro crítico:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
