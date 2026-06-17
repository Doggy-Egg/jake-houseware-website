/**
 * Local SMTP diagnostic — run: node scripts/test-smtp.mjs
 * Reads .env.local, tries common NetEase hosts, prints server response (no password).
 */
import fs from "node:fs";
import nodemailer from "nodemailer";

function loadEnv() {
  const env = {};
  if (!fs.existsSync(".env.local")) {
    throw new Error(".env.local not found");
  }

  for (const line of fs.readFileSync(".env.local", "utf8").split("\n")) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      env[match[1].trim()] = match[2];
    }
  }

  return env;
}

const env = loadEnv();
const user = env.SMTP_USER?.trim();
const pass =
  env.SMTP_PASSWORD_B64?.trim()
    ? Buffer.from(env.SMTP_PASSWORD_B64.trim(), "base64").toString("utf8")
    : (env.SMTP_PASSWORD ?? "");

if (!user || !pass) {
  console.error("SMTP_USER / SMTP_PASSWORD missing in .env.local");
  process.exit(1);
}

console.log("SMTP_USER:", user);
console.log("password length:", pass.length);
console.log("password has whitespace:", pass !== pass.trim() || /\s/.test(pass));

const attempts = [
  [env.SMTP_HOST || "smtphz.qiye.163.com", Number(env.SMTP_PORT) || 465, true],
  ["smtp.qiye.163.com", 465, true],
  ["hwhzsmtp.qiye.163.com", 465, true],
  ["smtphz.qiye.163.com", 587, false],
];

for (const [host, port, secure] of attempts) {
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: { user, pass: pass.trim() },
    connectionTimeout: 15_000,
    ...(port === 587 && !secure ? { requireTLS: true } : {}),
  });

  try {
    await transporter.verify();
    console.log(`\n✓ SUCCESS: ${host}:${port} (${secure ? "SSL" : "STARTTLS"})`);
    console.log(`  Update .env.local: SMTP_HOST=${host} SMTP_PORT=${port} SMTP_SECURE=${secure}`);
    process.exit(0);
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? error.code : "";
    const response =
      error && typeof error === "object" && "response" in error ? error.response : "";
    console.log(`\n✗ FAIL: ${host}:${port} — ${code} ${response || (error instanceof Error ? error.message : "")}`);
  }
}

process.exit(1);
