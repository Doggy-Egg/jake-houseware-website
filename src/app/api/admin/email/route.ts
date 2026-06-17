import { NextResponse } from "next/server";
import { getNotifyEmail, isEmailConfigured, getEmailProvider } from "@/lib/email/config";
import { isResendConfigured } from "@/lib/email/resend";
import { getSmtpPublicConfig, sendViaSmtp, verifySmtpConnection } from "@/lib/email/smtp";

export async function GET() {
  const provider = getEmailProvider();

  return NextResponse.json({
    configured: isEmailConfigured(),
    provider,
    notifyEmail: getNotifyEmail(),
    smtp: getSmtpPublicConfig(),
    resend: { configured: isResendConfigured() },
  });
}

export async function POST() {
  if (!isEmailConfigured()) {
    return NextResponse.json(
      { message: "邮件未配置：请在环境变量中设置 SMTP 或 Resend。" },
      { status: 503 },
    );
  }

  const provider = getEmailProvider();
  const notifyEmail = getNotifyEmail();
  const now = new Date().toISOString();

  const testEmail = {
    subject: "[Test] JAKE HOUSEWARE website email",
    text: [
      "This is a test email from the JAKE HOUSEWARE admin panel.",
      "",
      `Time: ${now}`,
      `Provider: ${provider}`,
      "",
      "If you received this, Contact and Inquiry forms should work.",
    ].join("\n"),
    html: `<p>This is a test email from the <strong>JAKE HOUSEWARE</strong> admin panel.</p>
<p>Time: ${now}<br/>Provider: ${provider}</p>
<p>If you received this, Contact and Inquiry forms should work.</p>`,
    replyTo: notifyEmail,
  };

  try {
    if (provider === "smtp") {
      await verifySmtpConnection();
      await sendViaSmtp(testEmail, notifyEmail);
    } else {
      const { sendViaResend } = await import("@/lib/email/resend");
      await sendViaResend(testEmail, notifyEmail);
    }

    return NextResponse.json({
      message: `测试邮件已发送到 ${notifyEmail}`,
      provider,
      notifyEmail,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "测试邮件发送失败";
    return NextResponse.json({ message }, { status: 502 });
  }
}
