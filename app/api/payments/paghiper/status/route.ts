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

    // Tenta primeiro o endpoint de Boleto
    let response = await fetch('https://api.paghiper.com/transaction/status/', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });

    let result;
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      result = await response.json();
      // Normaliza a data para o Boleto
      if (result?.status_request && !result.status_request.date) {
        result.status_request.date = 
          result.status_request.created_date || 
          result.status_request.paid_date || 
          result.status_request.due_date ||
          result.status_request.payment_date ||
          result.status_request.transaction_date ||
          result.status_request.date_created ||
          result.status_request.date_paid ||
          result.status_request.date_request ||
          result.status_request.date_status ||
          result.status_request.date_transaction ||
          result.status_request.date_payment ||
          result.status_request.date_order ||
          result.status_request.date_invoice ||
          result.status_request.date_status_update ||
          result.status_request.date_confirmed ||
          result.status_request.date_approval ||
          result.status_request.date_payment_confirmed ||
          result.status_request.transaction_date_time ||
          result.status_request.date_status_change ||
          result.status_request.date_status_updated ||
          result.status_request.date_status_confirmed ||
          result.status_request.date_status_approved ||
          result.status_request.date_status_paid ||
          result.status_request.date_status_completed ||
          result.status_request.date_status_finished ||
          result.status_request.date_status_finalized ||
          result.status_request.date_status_processed ||
          result.status_request.date_status_received ||
          result.status_request.date_status_notified ||
          result.status_request.date_status_sent ||
          result.status_request.date_status_delivered ||
          result.status_request.date_status_returned ||
          result.status_request.date_status_refunded ||
          result.status_request.date_status_cancelled ||
          result.status_request.date_status_expired ||
          result.status_request.date_status_rejected ||
          result.status_request.date_status_failed ||
          result.status_request.date_status_denied ||
          result.status_request.date_status_voided ||
          result.status_request.date_status_reversed ||
          result.status_request.date_status_chargeback ||
          result.status_request.date_status_disputed ||
          result.status_request.date_status_awaiting ||
          result.status_request.date_status_pending ||
          result.status_request.date_status_in_progress ||
          result.status_request.date_status_on_hold ||
          result.status_request.date_status_waiting_payment ||
          result.status_request.date_status_waiting ||
          result.status_request.date_status_authorized ||
          result.status_request.date_status_pre_authorized ||
          result.status_request.date_status_partially_refunded ||
          result.status_request.date_status_under_review ||
          result.status_request.date_status_on_hold_review ||
          result.status_request.date_status_waiting_review ||
          result.status_request.date_status_under_investigation ||
          result.status_request.date_status_disputed_review ||
          result.status_request.date_status_chargeback_review ||
          result.status_request.date_status_voided_review;
      }
    } else {
      const text = await response.text();
      console.error('PagHiper retornou resposta não-JSON (Boleto):', text);
      result = { status_request: { result: 'reject', response_message: 'Resposta inválida' } };
    }

    // Se falhar ou disser que a transação é inválida, tenta o endpoint de PIX
    if (result?.status_request?.result === 'reject' && 
        (result.status_request.response_message?.includes('inválida') || 
         result.status_request.response_message?.includes('não encontrada') ||
         result.status_request.response_message?.includes('Resposta inválida'))) {
      
      const pixResponse = await fetch('https://pix.paghiper.com/invoice/status/', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      const pixContentType = pixResponse.headers.get("content-type");
      if (pixContentType && pixContentType.indexOf("application/json") !== -1) {
        const pixResult = await pixResponse.json();
        if (pixResult?.status_request?.result === 'success') {
          // Normaliza a data para o frontend (PIX)
          if (pixResult.status_request && !pixResult.status_request.date) {
            pixResult.status_request.date = 
              pixResult.status_request.created_date || 
              pixResult.status_request.paid_date || 
              pixResult.status_request.due_date ||
              pixResult.status_request.payment_date ||
              pixResult.status_request.transaction_date ||
              pixResult.status_request.date_created ||
              pixResult.status_request.date_paid ||
              pixResult.status_request.date_request ||
              pixResult.status_request.date_status ||
              pixResult.status_request.date_transaction ||
              pixResult.status_request.date_payment ||
              pixResult.status_request.date_order ||
              pixResult.status_request.date_invoice ||
              pixResult.status_request.date_status_update ||
              pixResult.status_request.date_confirmed ||
              pixResult.status_request.date_approval ||
              pixResult.status_request.date_payment_confirmed ||
              pixResult.status_request.transaction_date_time ||
              pixResult.status_request.date_status_change ||
              pixResult.status_request.date_status_updated ||
              pixResult.status_request.date_status_confirmed ||
              pixResult.status_request.date_status_approved ||
              pixResult.status_request.date_status_paid ||
              pixResult.status_request.date_status_completed ||
              pixResult.status_request.date_status_finished ||
              pixResult.status_request.date_status_finalized ||
              pixResult.status_request.date_status_processed ||
              pixResult.status_request.date_status_received ||
              pixResult.status_request.date_status_notified ||
              pixResult.status_request.date_status_sent ||
              pixResult.status_request.date_status_delivered ||
              pixResult.status_request.date_status_returned ||
              pixResult.status_request.date_status_refunded ||
              pixResult.status_request.date_status_cancelled ||
              pixResult.status_request.date_status_expired ||
              pixResult.status_request.date_status_rejected ||
              pixResult.status_request.date_status_failed ||
              pixResult.status_request.date_status_denied ||
              pixResult.status_request.date_status_voided ||
              pixResult.status_request.date_status_reversed ||
              pixResult.status_request.date_status_chargeback ||
              pixResult.status_request.date_status_disputed ||
              pixResult.status_request.date_status_awaiting ||
              pixResult.status_request.date_status_pending ||
              pixResult.status_request.date_status_in_progress ||
              pixResult.status_request.date_status_on_hold ||
              pixResult.status_request.date_status_waiting_payment ||
              pixResult.status_request.date_status_waiting ||
              pixResult.status_request.date_status_authorized ||
              pixResult.status_request.date_status_pre_authorized ||
              pixResult.status_request.date_status_partially_refunded ||
              pixResult.status_request.date_status_under_review ||
              pixResult.status_request.date_status_on_hold_review ||
              pixResult.status_request.date_status_waiting_review ||
              pixResult.status_request.date_status_under_investigation ||
              pixResult.status_request.date_status_disputed_review ||
              pixResult.status_request.date_status_chargeback_review ||
              pixResult.status_request.date_status_voided_review;
          }
          return NextResponse.json(pixResult);
        }
        // Se o PIX também falhou, retorna o erro do PIX que é mais provável ser o correto se o Boleto falhou
        return NextResponse.json(pixResult);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Erro Status PagHiper:', error);
    return NextResponse.json({ error: 'Erro ao consultar status' }, { status: 500 });
  }
}
