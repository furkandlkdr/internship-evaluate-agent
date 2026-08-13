import { NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { checkRateLimit } from "@/lib/rate-limit";

/**
 * CV indirme API'si
 *
 * Kimlik doğrulaması yapılmış admin kullanıcıya kısa süreli signed URL
 * üretir ve 307 redirect ile dosyaya yönlendirir.
 *
 * - Sadece oturum açmış admin kullanıcılar erişebilir.
 * - Signed URL 60 saniye geçerli.
 * - Dakikada max 30 istek (rate limit).
 * - cv_path applications tablosundan çözümlenir; istemci doğrudan
 *   bucket adını bilemez.
 */

export async function GET(request: NextRequest) {
  // Rate limit: IP bazlı
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";
  const limit = checkRateLimit(`cv:${ip}`);

  if (!limit.allowed) {
    return new Response(
      "Çok fazla istek. Lütfen biraz bekleyin.",
      { status: 429 }
    );
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get("id");

  if (!id) {
    return new Response("Geçersiz istek: id gerekli.", { status: 400 });
  }

  const numericId = Number(id);
  if (!Number.isFinite(numericId)) {
    return new Response("Geçersiz istek: id sayı olmalı.", { status: 400 });
  }

  const supabase = await createClient();

  // Kimlik doğrulama kontrolü
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return new Response("Yetkisiz erişim.", { status: 401 });
  }

  // cv_path ve cv_filename'i çözümle
  const { data: row, error: rowError } = await supabase
    .from("applications")
    .select("cv_path, cv_filename")
    .eq("id", numericId)
    .single();

  if (rowError || !row?.cv_path) {
    return new Response("Başvuru veya CV bulunamadı.", { status: 404 });
  }

  console.log("[CV] cv_path:", row.cv_path, "| cv_filename:", row.cv_filename);

  // Service role client ile signed URL üret.
  // Service-role key sunucu tarafında kalır; hiçbir zaman tarayıcıya gitmez.
  const { createClient: createServiceClient } = await import(
    "@supabase/supabase-js"
  );

  const serviceClient = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: { persistSession: false, autoRefreshToken: false },
    }
  );

  // cv_path doğrudan denenir; başarısız olursa alternatif yollar dener.
  // n8n workflow dosyayı farklı bir yapıda koymuş olabilir.
  let signedUrlData: { signedUrl: string } | null = null;
  let signedUrlError: Error | null = null;

  // Potansiyel path'leri topla (benzersiz olanları)
  // cv_path bucket adını (cvs/) içerebilir, onu temizle
  const cleanCvPath = row.cv_path.replace(/^cvs\//, ""); // "cvs/applications/..." → "applications/..."
  const cleanCvFilename = row.cv_filename ? row.cv_filename.replace(/^cvs\//, "") : null;

  const candidatePaths = new Set<string>([
    // Temizlenmiş path önce
    cleanCvPath,
    // Eğer applications/ içindeyse doğrudan dosya adını da dene
    ...(cleanCvPath.includes("/") ? [cleanCvPath.split("/").pop()!] : []),
    // Orijinal cv_path (muhtemelen boş)
    row.cv_path,
    `applications/${row.cv_path}`,
    // cv_filename varsa
    ...(row.cv_filename ? [cleanCvFilename!, `applications/${cleanCvFilename}`] : []),
  ]);

  for (const path of candidatePaths) {
    console.log("[CV] Trying path:", path);
    const result = await serviceClient.storage
      .from("cvs")
      .createSignedUrl(path, 60, { download: true });

    if (result.data?.signedUrl) {
      signedUrlData = result.data;
      console.log("[CV] Success with path:", path);
      break;
    }
    if (result.error) {
      console.log("[CV] Failed for path:", path, "-", result.error.message);
      signedUrlError = result.error;
    }
  }

  if (!signedUrlData?.signedUrl) {
    console.error("Signed URL error:", signedUrlError?.message);
    return new Response("Dosya erişimi sağlanamadı.", { status: 500 });
  }

  // Tarayıcıyı signed URL'ye yönlendir (307 — geçici redirect)
  return Response.redirect(signedUrlData.signedUrl, 307);
}
