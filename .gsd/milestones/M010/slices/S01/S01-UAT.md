# S01: QR encodes full URL via NEXT_PUBLIC_APP_URL — UAT

**Milestone:** M010
**Written:** 2026-05-11T12:46:14.336Z

1. Set `NEXT_PUBLIC_APP_URL="http://192.168.x.x:3000"` in `apps/web/.env.local`
2. Start dev server: `pnpm --filter @brol/web dev`
3. Navigate to an object with a QR code assigned
4. Inspect the QR img `src` attribute → verify it encodes a URL like `http://192.168.x.x:3000/qr/BR0LABC123XY`
5. Click "Télécharger PNG" → verify the PNG QR also encodes the full URL (scan test with phone)
6. Unset `NEXT_PUBLIC_APP_URL` → QR reverts to raw code only (no regression)
