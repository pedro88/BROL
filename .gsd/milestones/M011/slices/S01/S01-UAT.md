# S01: Infrastructure stockage photos — UAT

**Milestone:** M011
**Written:** 2026-05-11T14:30:48.274Z

## UAT: Infrastructure stockage photos (S01)

### Setup
- Configurer les variables S3 dans `.env.local` (S3_ENDPOINT, S3_REGION, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET)
- S'assurer que le bucket est accessible en écriture

### Tests manuels

**1. Upload photo (via tRPC)**
```bash
# Demander une presigned URL
curl -X POST http://localhost:3001/trpc/photos.getPresignedUrl \
  -H "Content-Type: application/json" \
  -d '{"0":{"objectId":"<cuid>","filename":"test.jpg","contentType":"image/jpeg","fileSize":1024}}'

# Upload direct vers S3 avec la presigned URL (PUT request)
curl -X PUT "<presigned_url>" \
  -H "Content-Type: image/jpeg" \
  --data-binary @test.jpg

# Ajouter la photo en base
curl -X POST http://localhost:3001/trpc/photos.add \
  -d '{"0":{"objectId":"<cuid>","url":"<public_url>","position":0}}'
```

**2. Liste des photos**
```bash
curl "http://localhost:3001/trpc/photos.list?input=%7B%22objectId%22%3A%22<cuid>%22%7D"
```

**3. Suppression photo**
```bash
curl -X POST http://localhost:3001/trpc/photos.remove \
  -d '{"0":{"objectId":"<cuid>","photoId":"<cuid>"}}'
```

**4. Réordonnancement**
```bash
curl -X POST http://localhost:3001/trpc/photos.reorder \
  -d '{"0":{"objectId":"<cuid>","positions":{"<photoId1>":1,"<photoId2>":0}}}'
```

### Vérification
- [ ] `photos.getPresignedUrl` retourne une URL signée (uploadUrl) et une URL publique
- [ ] Le fichier uploadé via PUT est accessible à l'URL publique
- [ ] `photos.list` retourne les photos triées par position
- [ ] `photos.remove` supprime le fichier S3 et l'entrée en base
- [ ] Les procédures rejettent les appels pour des objets d'un autre utilisateur
