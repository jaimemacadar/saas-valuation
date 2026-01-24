// Script para testar envio de e-mail de reset de senha
import { createClient } from "@supabase/supabase-js";
import { readFileSync } from "fs";

// Carregar variáveis do .env.local
const envContent = readFileSync(".env.local", "utf-8");
const envVars = {};
envContent.split("\n").forEach((line) => {
  const [key, ...valueParts] = line.split("=");
  if (key && valueParts.length > 0) {
    envVars[key.trim()] = valueParts.join("=").trim();
  }
});

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const siteUrl = envVars.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Variáveis de ambiente não configuradas!");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Pega o e-mail do argumento da linha de comando
const email = process.argv[2];

if (!email) {
  console.error("❌ Uso: node scripts/test-reset-password.mjs seu@email.com");
  process.exit(1);
}

console.log("🔍 Testando envio de e-mail de reset de senha...\n");
console.log("📧 E-mail:", email);
console.log("🔗 URL Supabase:", supabaseUrl);
console.log("🌐 Site URL:", siteUrl);
console.log("📍 Redirect URL:", `${siteUrl}/reset-password`);
console.log("\n⏳ Enviando...\n");

try {
  const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl}/reset-password`,
  });

  if (error) {
    console.error("❌ Erro:", error.message);
    console.error("📋 Detalhes:", error);
    if (error.message?.includes("rate limit") || error.status === 429) {
      console.log("\n⚠️  RATE LIMIT ATINGIDO!");
      console.log("📌 O Supabase limita o envio de e-mails de recuperação.");
      console.log("⏰ Aguarde 1 hora e tente novamente.");
      console.log("💡 Ou configure SMTP customizado no painel do Supabase.");
    }
    process.exit(1);
  }

  console.log("✅ E-mail enviado com sucesso!");
  console.log("📋 Resposta:", data);
  console.log("\n📬 Verifique sua caixa de entrada (e pasta de spam)");
  console.log("⏱️  O e-mail pode levar alguns minutos para chegar");
} catch (err) {
  console.error("❌ Exceção:", err);
  process.exit(1);
}
