import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const imgUrl = searchParams.get('imgUrl') || '';
  const weatherIcon = searchParams.get('weatherIcon') || '☀️';
  const weatherShort = searchParams.get('weatherShort') || '';
  const moodText = searchParams.get('moodText') || '';
  const theme = searchParams.get('theme') || '';
  const courseTitle = searchParams.get('courseTitle') || '';
  const spot1Name = searchParams.get('spot1Name') || '';
  const spot1Loc = searchParams.get('spot1Loc') || '';
  const spot1Desc = searchParams.get('spot1Desc') || '';
  const spot2Name = searchParams.get('spot2Name') || '';
  const spot2Loc = searchParams.get('spot2Loc') || '';
  const spot2Desc = searchParams.get('spot2Desc') || '';
  const spot3Name = searchParams.get('spot3Name') || '';
  const spot3Loc = searchParams.get('spot3Loc') || '';
  const spot3Desc = searchParams.get('spot3Desc') || '';
  const date = searchParams.get('date') || '';

  const html = `<!DOCTYPE html>
<html lang="ko">
<head>
<meta charset="UTF-8">
<link href="https://fonts.googleapis.com/css2?family=Gaegu:wght@400;700&family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { width: 360px; height: 640px; overflow: hidden; font-family: 'Noto Sans KR', sans-serif; background: #0f0f0f; }
  .card { width: 360px; height: 640px; position: relative; overflow: hidden; }
  .bg-img { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; filter: brightness(0.45) saturate(1.2); }
  .bg-gradient { position: absolute; inset: 0; background: linear-gradient(160deg, #1a1a2e 0%, #16213e 40%, #0f3460 100%); }
  .overlay { position: absolute; inset: 0; background: linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.05) 30%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.92) 100%); }
  .content { position: absolute; inset: 0; display: flex; flex-direction: column; justify-content: space-between; padding: 28px 24px 30px; }
  .top { display: flex; justify-content: space-between; align-items: flex-start; }
  .app-badge { background: rgba(255,255,255,0.15); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.2); border-radius: 20px; padding: 5px 12px; font-size: 10px; color: rgba(255,255,255,0.9); letter-spacing: 1px; font-weight: 500; }
  .weather-pill { background: rgba(255,220,80,0.2); backdrop-filter: blur(10px); border: 1px solid rgba(255,220,80,0.4); border-radius: 20px; padding: 5px 12px; font-size: 11px; color: #FFD240; font-weight: 700; display: flex; align-items: center; gap: 4px; }
  .mid { flex: 1; display: flex; align-items: center; justify-content: center; padding: 20px 0; }
  .mood-text { font-family: 'Gaegu', cursive; font-size: 22px; color: rgba(255,255,255,0.7); text-align: center; line-height: 1.6; }
  .theme-tag { display: inline-block; background: #FFD240; color: #1a1a1a; font-size: 10px; font-weight: 700; letter-spacing: 1.5px; padding: 4px 12px; border-radius: 4px; margin-bottom: 10px; }
  .course-title { font-size: 24px; font-weight: 700; color: #ffffff; line-height: 1.3; margin-bottom: 20px; }
  .spots { display: flex; flex-direction: column; gap: 0; margin-bottom: 18px; }
  .spot-row { display: flex; align-items: flex-start; gap: 10px; }
  .spot-line { display: flex; flex-direction: column; align-items: center; padding-top: 4px; }
  .dot { width: 7px; height: 7px; border-radius: 50%; background: #FFD240; flex-shrink: 0; }
  .line { width: 1px; height: 22px; background: rgba(255,220,80,0.3); }
  .spot-text { padding-bottom: 16px; }
  .spot-name { font-size: 13px; font-weight: 700; color: #ffffff; margin-bottom: 2px; }
  .spot-sub { font-size: 10px; color: rgba(255,255,255,0.45); }
  .divider { height: 1px; background: rgba(255,255,255,0.1); margin-bottom: 14px; }
  .footer { display: flex; justify-content: space-between; align-items: center; }
  .footer-left { font-size: 9px; color: rgba(255,255,255,0.25); }
  .footer-right { font-size: 9px; color: rgba(255,255,255,0.25); }
</style>
</head>
<body>
<div class="card">
  <img class="bg-img" src="${imgUrl}" onerror="this.style.display='none'">
  <div class="bg-gradient"></div>
  <div class="overlay"></div>
  <div class="content">
    <div class="top">
      <div class="app-badge">✦ 끌리는대로</div>
      <div class="weather-pill">${weatherIcon} ${weatherShort}</div>
    </div>
    <div class="mid">
      <div class="mood-text">"${moodText}"</div>
    </div>
    <div class="bottom">
      <div class="theme-tag">${theme}</div>
      <div class="course-title">${courseTitle}</div>
      <div class="spots">
        <div class="spot-row">
          <div class="spot-line"><div class="dot"></div><div class="line"></div></div>
          <div class="spot-text"><div class="spot-name">${spot1Name}</div><div class="spot-sub">${spot1Loc} · ${spot1Desc}</div></div>
        </div>
        <div class="spot-row">
          <div class="spot-line"><div class="dot"></div><div class="line"></div></div>
          <div class="spot-text"><div class="spot-name">${spot2Name}</div><div class="spot-sub">${spot2Loc} · ${spot2Desc}</div></div>
        </div>
        <div class="spot-row">
          <div class="spot-line"><div class="dot"></div></div>
          <div class="spot-text"><div class="spot-name">${spot3Name}</div><div class="spot-sub">${spot3Loc} · ${spot3Desc}</div></div>
        </div>
      </div>
      <div class="divider"></div>
      <div class="footer">
        <div class="footer-left">${date} · 한국관광공사 데이터 기반</div>
        <div class="footer-right">#즉흥여행 #끌리는대로</div>
      </div>
    </div>
  </div>
</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
