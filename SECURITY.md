# Security Implementation Guide

## Middleware Protection

Middleware sekarang sudah melindungi route-route berikut:

### Protected Routes (Memerlukan Login)

- `/dashboard`
- `/chat`
- `/cek-kesehatan`
- `/profil`
- `/doctor/monitoring`

Jika user mencoba akses route ini tanpa token atau dengan token yang invalid, mereka akan di-redirect ke `/auth/login`.

### Auth Routes

- `/auth/login`
- `/auth/register`
- `/auth/forgot-password`
- `/auth/reset-password`

Jika user sudah login (memiliki token yang valid), mereka akan di-redirect ke `/dashboard` ketika mencoba akses route ini.

## Token Management

### Storage Strategy

- **Token**: Disimpan di HTTP-only secure cookie (aman dari XSS attacks)
- **User Data**: Disimpan di localStorage (hanya data non-sensitive)

### Flow

#### Login Process

1. User melakukan login dengan email & password
2. Server mengirimkan token JWT ke client
3. Client menyimpan token di HTTP-only cookie via `/api/auth/set-cookie`
4. Client menyimpan user data di localStorage
5. User di-redirect ke `/dashboard`

#### Access Control

1. Middleware meng-intercept semua request ke protected routes
2. Middleware mengambil token dari cookies
3. Middleware memverify token dengan JWT secret
4. Jika valid, request dilanjutkan
5. Jika invalid/expired, user di-redirect ke login

#### Logout Process

1. User klik logout button
2. Client call `/api/auth/logout` untuk clear server-side cookie
3. Client menghapus data dari localStorage
4. User di-redirect ke `/auth/login`

## API Endpoints

### `/api/auth/set-cookie` (POST)

**Purpose**: Set secure HTTP-only cookie
**Body**:

```json
{
  "token": "jwt_token_here"
}
```

### `/api/auth/clear-cookie` (POST)

**Purpose**: Clear auth cookie
**No body required**

### `/api/auth/logout` (POST)

**Purpose**: Logout dan clear cookie
**No body required**

## Not Found Page (404)

File: `app/not-found.tsx`

Halaman custom 404 yang tampil ketika user mencoba akses:

- Route yang tidak ada
- Route yang di-block oleh middleware

Halaman ini menyediakan:

- Tombol kembali
- Link ke dashboard
- Link ke login

## Security Features

### ✅ Implemented

- JWT token verification di middleware
- HTTP-only secure cookies untuk token storage
- Token expiration (30 hari)
- Automatic redirect untuk protected routes
- Logout functionality yang clear cookies
- Custom 404 page

### 🔐 Token Protection

- Token tidak bisa diakses oleh JavaScript (HTTP-only cookie)
- Melindungi dari XSS attacks
- Token di-set dengan `Secure` flag di production
- Token di-set dengan `SameSite=lax` untuk CSRF protection

## Testing

Untuk test middleware:

1. **Test unauthorized access**:

   - Buka dev console dan hapus cookie token: `document.cookie = "token=; max-age=0"`
   - Coba akses `/chat` → harus redirect ke `/auth/login`

2. **Test with valid token**:

   - Login dengan akun yang valid
   - Token akan otomatis tersimpan di cookie
   - Akses `/chat` → harus berhasil

3. **Test expired token**:

   - Ubah token di developer tools cookies
   - Refresh page atau akses route protected
   - Harus redirect ke login

4. **Test 404 page**:
   - Akses `/route-yang-tidak-ada`
   - Harus menampilkan halaman not-found

## Environment Variables

Pastikan `.env.local` memiliki:

```
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

## Future Enhancements

- [ ] Add refresh token rotation
- [ ] Add rate limiting untuk login attempts
- [ ] Add audit logging untuk access attempts
- [ ] Add 2FA (Two-Factor Authentication)
- [ ] Add session management (multiple devices)
