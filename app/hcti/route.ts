import { NextRequest, NextResponse } from 'next/server';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const { html, css } = await req.json();

    if (!html) {
      return NextResponse.json({ error: 'html is required' }, { status: 400, headers: corsHeaders });
    }

    const userId = process.env.HCTI_USER_ID;
    const apiKey = process.env.HCTI_API_KEY;

    if (!userId || !apiKey) {
      return NextResponse.json({ error: 'HCTI credentials not configured' }, { status: 500, headers: corsHeaders });
    }

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
