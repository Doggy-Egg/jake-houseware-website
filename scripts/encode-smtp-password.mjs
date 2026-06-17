/**
 * Encode NetEase SMTP auth code to Base64 and update .env.local.
 *
 * Usage (must use SINGLE quotes so shell does not expand $):
 *   node scripts/encode-smtp-password.mjs '$yourAuthCodeHere'
 */
import fs from "node:fs";

const authCode = process.argv[2];

if (!authCode) {
  console.error("用法: node scripts/encode-smtp-password.mjs '$你的授权码'");
  console.error("注意: 必须用单引号包裹授权码，否则 $ 会被终端吃掉");
  process.exit(1);
}

if (authCode.length < 8) {
  console.error(`授权码过短 (${authCode.length} 位)，可能已被 shell 截断。请用单引号重试。`);
  process.exit(1);
}

const b64 = Buffer.from(authCode, "utf8").toString("base64");
const envPath = ".env.local";

if (!fs.existsSync(envPath)) {
  console.error(".env.local 不存在");
  process.exit(1);
}

let content = fs.readFileSync(envPath, "utf8");
content = content.replace(/^SMTP_PASSWORD=.*\n?/m, "");

if (/^SMTP_PASSWORD_B64=/m.test(content)) {
  content = content.replace(/^SMTP_PASSWORD_B64=.*$/m, `SMTP_PASSWORD_B64=${b64}`);
} else {
  content = content.trimEnd() + `\nSMTP_PASSWORD_B64=${b64}\n`;
}

fs.writeFileSync(envPath, content);

console.log("已更新 .env.local 中的 SMTP_PASSWORD_B64");
console.log("授权码长度:", authCode.length);
console.log("首字符是 $:", authCode.startsWith("$"));
console.log("请重启 npm run dev，然后到 /admin/email 测试发信");
