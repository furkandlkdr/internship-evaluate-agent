# Güvenlik Dokümantasyonu

## Mimari Özeti

- **Public Form**: Tarayıcı → n8n webhook → Supabase
- **Admin Paneli**: Tarayıcı → Next.js (SSR/API routes) → Supabase Auth + RLS

## Ortam Değişkenleri

| Değişken | Kimlik | Nerede Kullanılır | Açıklama |
|----------|--------|-------------------|----------|
| NEXT_PUBLIC_SUPABASE_URL | Public | Client & Server | Supabase proje URL |
| NEXT_PUBLIC_SUPABASE_ANON_KEY | Public | Client & Server | Anon key (RLS ile sınırlandırılmış) |
| SUPABASE_SERVICE_ROLE_KEY | Server-only | API routes (server) | Service-role; **asla** client'a gitmez |
| NEXT_PUBLIC_N8N_WEBHOOK_URL | Public | Client | Public n8n webhook |

## Sunucu / İstemci Ayrımı

| Modül | Amaç | Çalıştığı Yer |
|-------|------|---------------|
| `lib/supabase/client.ts` | Tarayıcı oturumu yönetimi | Client Component ("use client") |
| `lib/supabase/server.ts` | SSR / Server Action / Route Handler'da veri çekme | Server |
| `lib/supabase/middleware.ts` | Session yenileme ve cookie yönetimi | Edge Middleware |
| `app/api/cv/route.ts` | Service-role ile signed URL üretme | Server API route |

## Admin Yetkilendirme Modeli

- Supabase Auth'teki **tüm authenticated kullanıcılar admin sayılır**.
- Herhangi bir role/permission tablosu veya ek kontrol gerekmez.
- `auth.getUser()` başarılı olduğunda kullanıcı admin yetkisine sahiptir.
- Yeni admin eklemek için Supabase Auth Dashboard → Users → Add User.

## Supabase RLS Politikaları (Uygulanacak)

`public.applications` tablosu için:

```sql
-- Anon kullanıcılara SELECT engelle
CREATE POLICY "anon_no_select_applications" ON public.applications
  FOR SELECT USING (false);

-- Oturum açmış tüm kullanıcılara SELECT izin ver (hepsi admin)
CREATE POLICY "authenticated_select_applications" ON public.applications
  FOR SELECT USING (auth.role() = 'authenticated');

-- n8n service-role INSERT/UPDATE (service_role zaten bypass eder)
-- Ek bir policy gerekmez çünkü service-role RLS'yi bypass eder.
```

**Not:** RLS etkinleştirildiğinde anon kullanıcılar tabloya erişemez.
Bu, `/admin/*` sayfalarının `auth.getUser()` ile doğrulanmış oturum gerektirmesini zorunlu kılar.

## Supabase Storage Politikaları (Uygulanacak)

`cvs` bucket için:

```sql
-- Anon kullanıcılara tüm işlem yasak
CREATE POLICY "anon_no_access" ON storage.objects
  FOR ALL USING (bucket_id = 'cvs' AND auth.role() = 'authenticated');

-- Oturum açmış kullanıcılara SELECT (download) izni
CREATE POLICY "authenticated_download" ON storage.objects
  FOR SELECT USING (bucket_id = 'cvs' AND auth.role() = 'authenticated');

-- n8n service-role ile upload (RLS bypass edilir)
```

## CV Erişim Akışı

1. Admin `/admin/applications/[id]` sayfasına girer.
2. Sayfa `cv_filename` görüntüler.
3. Download butonu `/api/cv?id=123` API'sine gider.
4. API Route `auth.getUser()` ile kullanıcıyı doğrular.
5. `applications` tablosundan `cv_path` çözümler.
6. **Service-role client** ile 60 saniyelik signed URL üretir.
7. Tarayıcıyı `307 redirect` ile signed URL'ye yönlendirir.
8. Signed URL expire olduktan sonra tekrar erişilemez.

## CORS

- Supabase CORS ayarları sadece `https://internagent.furkan.software` ve `http://localhost:3000` origin'lerine izin vermeli.
- CORS birincil güvenlik mekanizması değil; RLS ve Storage politikaları birincil koruma.
- CORS sadece browser seviyesinde ek bir kısıtlamadır.

## Loglama Güvenliği

- `cv_text`, `cv_path`, `evaluation_details` gibi hassas veriler **production loglarına yazılmaz**.
- `console.log` kullanımı development ile sınırlıdır; production'da supress edilir.
- Service-role key **asla** tarayıcıda veya istemci kodunda görünmez.
