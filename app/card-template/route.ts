import { NextRequest, NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

// GET: templateUrl 파라미터로 HTML 가져와서 HCTI 호출
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const templateUrl = searchParams.get('templateUrl');

    if (!templateUrl) {
      return NextResponse.json({ error: 'templateUrl is required' }, { status: 400, headers: corsHeaders });
    }

    // 카드 템플릿 HTML 가져오기
    const templateRes = await fetch(templateUrl);
    const html = await templateRes.text();

    // HCTI API 호출
    const userId = process.env.HCTI_USER_ID;
    const apiKey = process.env.HCTI_API_KEY;
    const credentials = Buffer.from(`${userId}:${apiKey}`).toString('base64');

    const response = await fetch('https://hcti.io/v1/image', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ html }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status, headers: corsHeaders });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}

// POST: html 바디로 직접 받아서 HCTI 호출
export async function POST(req: NextRequest) {
  try {
    const { html, css } = await req.json();

    if (!html) {
      return NextResponse.json({ error: 'html is required' }, { status: 400, headers: corsHeaders });
    }

    const userId = process.env.HCTI_USER_ID;
    const apiKey = process.env.HCTI_API_KEY;
    const credentials = Buffer.from(`${userId}:${apiKey}`).toString('base64');

    const response = await fetch('https://hcti.io/v1/image', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ html, css }),
    });

    const data = await response.json();
    return NextResponse.json(data, { status: response.status, headers: corsHeaders });

  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500, headers: corsHeaders });
  }
}
