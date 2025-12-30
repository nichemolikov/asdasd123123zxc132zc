# HTTPS Troubleshooting - ERR_SSL_VERSION_OR_CIPHER_MISMATCH

## Issue Fixed

The error `ERR_SSL_VERSION_OR_CIPHER_MISMATCH` occurs when Vite's basic HTTPS setup doesn't work properly on Windows. 

## Solution Applied

I've installed `@vitejs/plugin-basic-ssl` which provides better Windows compatibility for HTTPS in development.

## Steps to Fix

### 1. Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### 2. Clear Browser Cache

- **Chrome/Edge:** Ctrl+Shift+Delete → Clear cached images and files
- **Firefox:** Ctrl+Shift+Delete → Clear cache
- Or use **Incognito/Private mode** for testing

### 3. Access HTTPS URL

- Make sure you're using: `https://localhost:8080`
- NOT: `http://localhost:8080`

### 4. Accept Certificate

First time you visit, browser will show security warning:
- Click **"Advanced"** or **"Show Details"**
- Click **"Proceed to localhost"** or **"Accept the Risk"**

## Alternative: Use HTTP (If HTTPS Still Fails)

If HTTPS continues to cause issues, you can temporarily use HTTP:

1. Edit `vite.config.ts`:
   ```typescript
   server: {
     host: "::",
     port: 8080,
     // https: true, // Comment this out
   },
   ```

2. Remove the plugin:
   ```typescript
   // basicSsl(), // Comment this out
   ```

3. Restart server and use: `http://localhost:8080`

## Why HTTPS?

HTTPS is needed for:
- Testing OAuth flows (Instagram API requires HTTPS)
- Service Workers
- Some browser APIs (geolocation, camera, etc.)
- Production-like environment

## Still Getting Errors?

1. **Check Node.js version:**
   ```bash
   node --version
   ```
   Should be 18+ for best compatibility

2. **Try different port:**
   ```typescript
   server: {
     port: 3000, // Try different port
     https: true,
   },
   ```

3. **Check firewall/antivirus:**
   - Some antivirus software blocks self-signed certificates
   - Temporarily disable to test

4. **Use mkcert (Advanced):**
   ```bash
   # Install mkcert
   choco install mkcert  # or download from https://github.com/FiloSottile/mkcert
   
   # Generate certificate
   mkcert -install
   mkcert localhost 127.0.0.1 ::1
   
   # Update vite.config.ts to use the certificates
   ```

## Quick Test

After restarting, check terminal output:
- Should show: `Local: https://localhost:8080/`
- Open that exact URL in browser
- Accept the security warning
- App should load

