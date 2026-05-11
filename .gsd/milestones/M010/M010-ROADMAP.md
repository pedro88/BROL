# M010: QR codes with local network URLs

**Vision:** QR codes encodes a full URL (e.g. http://192.168.1.x:3000/qr/CODE) instead of just the raw code, enabling direct scan-to-navigate from any phone on the same local network without tunnel tools.

## Success Criteria

- QR codes encode full URL when NEXT_PUBLIC_QR_BASE_URL is set
- QR codes fall back to raw code when env var is absent (no regression)
- Phone on same WiFi can scan and open the object page via local IP
- get-local-ip.js script works and prints the correct value

## Slices

- [x] **S01: S01** `risk:low` `depends:[]`
  > After this: QR codes embed `NEXT_PUBLIC_QR_BASE_URL/qr/CODE` — phones can open it directly.

- [x] **S02: S02** `risk:medium` `depends:[]`
  > After this: User can run `node scripts/get-local-ip.js` to get their LAN IP instantly.

- [x] **S03: S03** `risk:low` `depends:[]`
  > After this: npm run dev binds to 0.0.0.0 so phone can reach it.

## Boundary Map

```\npackages/shared/src/utils/index.ts\n  ↳ generateScanCode() — unchanged\n  ↳ getObjectScanUrl() — exists but unused, not touched\n\napps/web/src/components/qr/qr-code-image.tsx  [S01]\n  ↳ QrCodeImage — add baseUrl prop, encode full URL\n  ↳ useQrDownload — encode full URL\n\napps/web/src/app/objects/[id]/page.tsx  [S01]\n  ↳ passes baseUrl to QrCodeImage + useQrDownload\n\napps/web/src/app/qr/page.tsx  [S01]\n  ↳ passes baseUrl to QrCodeImage\n\nscripts/get-local-ip.js  [S02]\n  ↳ auto-detect LAN IP\n\napps/web/next.config.js  [S03]\n  ↳ set hostname: '0.0.0.0'\n\napps/web/.env.example  [S01]\n  ↳ document NEXT_PUBLIC_QR_BASE_URL\n\n.gsd/KNOWLEDGE.md  [S03]\n  ↳ document local QR testing workflow\n```"
