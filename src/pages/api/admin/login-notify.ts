import type { APIRoute } from 'astro';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { email, userAgent, timestamp, location } = body;

    // クライアントの IP アドレス取得
    const clientIp = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'Unknown IP';

    const loginTime = timestamp || new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    const userEnv = userAgent || request.headers.get('user-agent') || 'Unknown Browser';

    console.log(`[SECURITY ALERT] Admin login notification for ${email} from IP: ${clientIp} at ${loginTime}`);

    // メール送信ロジック (Resend API または Google Cloud Webhook 通知)
    // 万が一不審なログインが疑われる場合のアクションURL
    const emergencyActionUrl = `https://geodyssai.com/admin?action=emergency_lockout`;
    const passwordResetUrl = `https://geodyssai.com/admin?action=reset_password`;

    const mailBody = `
==================================================
🚨 geodyssAI 管理画面へのログインが検出されました
==================================================

【ログイン詳細情報】
・ログイン日時: ${loginTime}
・対象ユーザー: ${email}
・IP アドレス: ${clientIp}
・ユーザーエージェント: ${userEnv}
・アクセス URL: https://geodyssai.com/admin

--------------------------------------------------
⚠️ 【身に覚えのない不審なログインの場合のアクション】
--------------------------------------------------
万が一、ご自身でのログインでない場合は、以下のいずれかのアクションを実行してください：

1. パスワードの緊急リセット（攻撃者のアクセスを遮断）:
   👉 ${passwordResetUrl}

2. 全端末からの強制ログアウト:
   👉 ${emergencyActionUrl}

--
geodyssAI Admin Security System
`;

    // Resend / NodeMailer / Google Cloud PubSub 通知の実装
    const RESEND_API_KEY = process.env.RESEND_API_KEY || import.meta.env.RESEND_API_KEY;
    if (RESEND_API_KEY) {
      const resendResp = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: 'geodyssAI Security <security@geodyssai.com>',
          to: ['baotianyoutai1@gmail.com'],
          subject: `🚨 geodyssAI 管理画面にログインがありました [${loginTime}]`,
          text: mailBody
        })
      });
      console.log('Resend notification response status:', resendResp.status);
    } else {
      console.log('RESEND_API_KEY not configured. Simulated security email payload:\n', mailBody);
    }

    return new Response(JSON.stringify({
      success: true,
      message: 'Security login notification processed successfully',
      details: { clientIp, loginTime }
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error: any) {
    console.error('Error processing login notification:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
