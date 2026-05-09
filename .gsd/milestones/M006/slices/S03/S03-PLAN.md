# S03: Affichage et download QR

**Goal:** Rendre le QR code visuellement sur la page objet, permettre le download PNG et l'impression.

**Milestone:** M006

**Slice Definition of Done**
- [ ] Page détail objet affiche le QR code en image (canvas via qrcode lib)
- [ ] Bouton Télécharger → fichier PNG nommé avec le nom de l'objet
- [ ] Bouton Imprimer → dialog impression navigateur avec le QR formaté
- [ ] URL /qr?code=<uuid> génère et affiche l'image (sans auth — QR public)
- [ ] Export batch depuis `/qr` : download ZIP de tous les QR PNG ou liste imprimable

## Tasks

- [ ] **T01: Composant QRCodeImage (affichage canvas)**
  `est:1h`
  Créer `components/qr/qr-code-image.tsx`. Utilise la lib `qrcode` (déjà en deps). Prend `code: string` en prop, génère le QR en data URI, affiche dans un canvas ou img tag. Fallback si erreur de génération.

- [ ] **T02: Affichage QR sur page détail objet**
  `est:1h`
  Intégrer QRCodeImage sur `/objects/[id]` si object.qrStock existe. Afficher en grand (200x200 min), avec les boutons Télécharger et Imprimer. Si pas de QR, ne pas afficher la section.

- [ ] **T03: Download PNG et impression**
  `est:1h`
  Implémenter downloadPNG(code, objectName): génère data URI → canvas → toBlob → download via anchor. Implémenter printQR(objectName, dataURI): ouvre une fenêtre popup avec le QR formaté pour impression, puis window.print().

- [ ] **T04: Page /qr public (URL avec code)**
  `est:1h`
  Créer `/app/qr/[code]/page.tsx` (route publique, pas de middleware auth). Appelle qr.getByCode (publicProcedure ou sans auth) et affiche le QR de l'objet scanné. Accessible sans login pour les emprunteurs.

- [ ] **T05: Export batch ZIP depuis /qr**
  `est:1h`
  Sur la page /qr (authentifiée), bouton "Exporter tous mes QR". Pour chaque QR non utilisé ou utilisé, génère le PNG, zip le tout, download. Alternative: une liste imprimable (print-friendly CSS sur /qr/export).
