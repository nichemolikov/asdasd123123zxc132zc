# HTTPS Setup Guide

## ✅ HTTPS Enabled

HTTPS has been enabled for the development server using `@vitejs/plugin-basic-ssl`. This plugin automatically generates and manages self-signed certificates, which works better on Windows.

## How to Use

1. **Start the dev server:**
   ```bash
   npm run dev
   ```

2. **Access the app:**
   - The server will show: `https://localhost:8080`
   - Open in browser: `https://localhost:8080`

3. **Accept the security warning:**
   - First time: Browser will show "Your connection is not private" warning
   - This is normal for self-signed certificates
   - Click "Advanced" → "Proceed to localhost (unsafe)"
   - Or click "Show Details" → "visit this website"

## Browser Warnings

### Chrome/Edge
- Shows "Your connection is not private"
- Click "Advanced" → "Proceed to localhost (unsafe)"

### Firefox
- Shows "Warning: Potential Security Risk Ahead"
- Click "Advanced" → "Accept the Risk and Continue"

### Safari
- Shows "This connection is not private"
- Click "Show Details" → "visit this website"

## Why the Warning?

Self-signed certificates are not trusted by browsers by default. This is normal for local development. The connection is still encrypted (HTTPS), but the certificate isn't verified by a Certificate Authority.

## Custom Certificates (Optional)

If you want to use your own certificates:

1. Generate certificates (using mkcert or openssl)
2. Update `vite.config.ts`:
   ```typescript
   server: {
     https: {
       key: fs.readFileSync('path/to/key.pem'),
       cert: fs.readFileSync('path/to/cert.pem'),
     },
   },
   ```

## Troubleshooting

### Port Already in Use
If port 8080 is taken, change it in `vite.config.ts`:
```typescript
server: {
  port: 3000, // or any available port
  https: true,
},
```

### Certificate Errors
- Clear browser cache
- Try incognito/private mode
- Accept the certificate in browser settings

### Still Using HTTP?
- Make sure you're accessing `https://localhost:8080` (not `http://`)
- Check terminal output for the correct URL
- Restart dev server after config changes

## Production

For production deployment, use a proper hosting service (Vercel, Netlify, etc.) that provides HTTPS automatically with valid certificates.

