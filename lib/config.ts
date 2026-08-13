// n8n webhook yapılandırması — bu URL herkese açık bir uç noktadır.
// Build sırasında ortam değişkeni verilmezse varsayılan değer kullanılır.
export const N8N_WEBHOOK_URL =
  process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL ||
  "https://nafair.app.n8n.cloud/webhook/internship-application";
