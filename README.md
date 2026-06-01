# Nhà Chung — Backend

NestJS + Prisma + PostgreSQL + MinIO(S3). API cho FE dashboard cư dân/tòa nhà.

## Scope hiện tại
- ✅ Auth (sign-up / sign-in / refresh / logout, JWT access+refresh, quản lý thiết bị qua bảng `sessions`)
- ✅ Dashboard tổng quan: Dashboard, Thông báo, Kho tài liệu, Góp ý/Phản ánh, Tin tức (AI Assistant: skip)
- ✅ Cá nhân: Hồ sơ, Thành viên gia đình, Căn hộ của tôi, Cài đặt
- ⏸️ Section "Báo cáo minh bạch" (tài chính/thu chi/quỹ/KPI…) — **để sau**

## Chạy local
```bash
npm install
cp .env.example .env          # .env đã được cấu hình sẵn tới DB & MinIO
npx prisma generate
npx prisma migrate deploy     # hoặc: npx prisma migrate dev
npm run seed                  # nạp data demo (giống FE hard-code)
npm run start:dev
```
- API: `http://localhost:4001/api`
- Swagger: `http://localhost:4001/api/docs`
- Tài khoản demo: **default@gmail.com / Default@123**

## Cấu trúc
- `prisma/schema.prisma` — toàn bộ bảng. `prisma/seed.ts` — data demo.
- `src/<module>/` — mỗi tab 1 module (controller + service + dto).
- `src/common/` — guard JWT (global), `BuildingContextService` (resolve tòa đang active), pagination.
- `src/storage/` — MinIO/S3 (tự tạo bucket + set public-read).

## Quy ước API
- Bearer token ở header `Authorization`. Route `@Public()` (auth, health) không cần token.
- Dữ liệu trả về **thuần ngữ nghĩa**: enum viết thường (`category: "maintenance"`, `status: "processing"`). FE tự map màu/badge.
- Hầu hết nội dung **scope theo tòa nhà đang active**; có thể override bằng `?buildingId=`.
- List có phân trang: `?page=&limit=&search=` → `{ items, meta }`.

## Nhóm endpoint chính
| Tab FE | Endpoint |
|---|---|
| Auth | `POST /auth/sign-up·sign-in·refresh·logout` |
| Building switcher | `GET /buildings`, `POST /buildings/:id/activate` |
| Dashboard | `GET /dashboard/overview` |
| Thông báo | `GET /notifications`, `/notifications/summary`, `/notifications/:id`, `PATCH /:id/read`, `POST /read-all` |
| Kho tài liệu | `GET /documents`, `/documents/categories`, `/documents/:id`, `POST /:id/view` |
| Góp ý | `GET /feedbacks`, `/feedbacks/summary`, `/feedbacks/:id`, `POST /feedbacks` |
| Tin tức | `GET /news`, `/news/featured`, `/news/trending`, `/news/:id` |
| Sự kiện | `GET /events`, `/events/:id` |
| Hồ sơ | `GET /profile/me`, `PATCH /profile`, CRUD `/profile/vehicles`·`/profile/contacts`, `GET /profile/activities` |
| Gia đình | `GET /family`, `POST /family`, `PATCH·DELETE /family/:id` |
| Căn hộ | `GET /apartment/me`, `GET /apartment/fees` |
| Cài đặt | `GET·PATCH /settings`, `PATCH /settings/notifications/:key`, `POST /settings/change-password`, `GET·DELETE /settings/devices`, `POST /settings/devices/revoke-others`, `DELETE /settings/account` |
| Upload file | `POST /uploads` (multipart), `POST /uploads/presign` |

## Tích hợp FE
FE hiện chặn route bằng cookie `nc_auth=1`. Sau khi `sign-in`/`sign-up`, FE nên: lưu `accessToken`+`refreshToken`, set cookie `nc_auth=1` để middleware (`proxy.ts`) cho qua, và gắn `Authorization: Bearer <accessToken>` cho mọi request API.

## Ghi chú kỹ thuật
- Redis: **chưa dùng**. Quản lý phiên/thiết bị bằng bảng `sessions` (Postgres). Có thể thêm sau cho cache/rate-limit mà không đổi schema.
- Quan hệ 1-1: `accounts.profile_id` → `account_profiles` (đúng spec). Tạo account sẽ tự tạo profile + settings + 5 toggle thông báo mặc định.
