# ARCHITECTURE — Brol

Vue d'ensemble technique du monorepo. Diagrammes Mermaid (rendus par GitHub
et la plupart des éditeurs Markdown).

---

## 1. Topologie déploiement

```mermaid
flowchart LR
    subgraph Internet
        U[Utilisateur web]
        M[Utilisateur mobile]
    end

    subgraph Cloudflare
        CF[Proxy + DNS]
    end

    subgraph VPS[VPS Hetzner — 91.98.87.65]
        NGINX[nginx + certbot]
        WEB[brol-web :3000<br/>Next.js 15]
        API[brol-api :3001<br/>tRPC + BetterAuth]
        DB[(Postgres 16<br/>:5432)]
        S3M[S3 Hetzner<br/>brol-storage]
    end

    U -- app.brol.dev --> CF
    M -- api.brol.dev --> CF
    CF --> NGINX
    NGINX --> WEB
    NGINX --> API
    WEB -- HTTP --> API
    API --> DB
    API --> S3M

    classDef ext fill:#1e293b,stroke:#64748b,color:#e2e8f0
    classDef proxy fill:#7c2d12,stroke:#fb923c,color:#fed7aa
    classDef app fill:#1e3a8a,stroke:#3b82f6,color:#dbeafe
    class U,M ext
    class CF,NGINX proxy
    class WEB,API,DB,S3M app
```

---

## 2. Monorepo — dépendances entre packages

```mermaid
flowchart TB
    WEB[apps/web<br/>Next.js]
    MOB[apps/mobile<br/>Expo]
    API[packages/api<br/>tRPC routers]
    DB[packages/db<br/>Prisma client]
    SHARED[packages/shared<br/>Zod schemas + i18n + types]

    WEB --> API
    MOB --> API
    WEB --> SHARED
    MOB --> SHARED
    API --> SHARED
    API --> DB
    DB --> POSTGRES[(Postgres)]

    classDef app fill:#1e3a8a,stroke:#3b82f6,color:#dbeafe
    classDef pkg fill:#3f3f46,stroke:#a1a1aa,color:#e4e4e7
    classDef ext fill:#1e293b,stroke:#64748b,color:#e2e8f0
    class WEB,MOB app
    class API,DB,SHARED pkg
    class POSTGRES ext
```

`@brol/shared` est consommé partout — pas de cycle. `@brol/db` est consommé
uniquement par `@brol/api` (les apps n'accèdent jamais à Prisma directement,
elles passent par tRPC).

---

## 3. Auth — flux cross-platform

Deux chemins, **même backend BetterAuth** côté API.

```mermaid
sequenceDiagram
    autonumber
    participant W as Web (app.brol.dev)
    participant M as Mobile (Expo)
    participant API as packages/api<br/>(api.brol.dev)
    participant DB as Postgres

    Note over W,M: Sign-up / Sign-in

    W->>API: POST /api/auth/sign-in/email<br/>credentials: include
    API->>DB: vérifie hash
    API-->>W: Set-Cookie: __Secure-better-auth.session_token<br/>+ JSON { session, user }
    W->>W: syncTokenToStore() → nanostore<br/>(tRPC envoie Bearer en + du cookie)

    M->>API: POST /api/auth/sign-in/email<br/>(pas de cookie, JSON only)
    API-->>M: JSON { session.token, user }
    M->>M: SecureStore.setItem("session", token)
    M->>M: setAuth() → atom global

    Note over W,M: Requête authentifiée tRPC

    W->>API: POST /api/trpc/...<br/>Cookie + Authorization Bearer
    API->>API: getSession(req)<br/>cookie OU bearer
    API-->>W: data

    M->>API: POST /api/trpc/...<br/>Authorization Bearer {token}
    API->>API: getSession(req)<br/>bearer only
    API-->>M: data
```

Détails clés :

- **Cookies cross-subdomain** en prod : `BETTER_AUTH_COOKIE_DOMAIN=.brol.dev`
  pour que le cookie posé par `api.brol.dev` soit lu par `app.brol.dev`.
- **Mobile = bearer token uniquement** : pas de cookies dans React Native →
  le token est sauvé dans `expo-secure-store` (Keychain/Keystore).
- **Hook `databaseHooks.user.create.after`** sur le serveur génère un
  `handle` (`#piet1234`) automatiquement à chaque signup.

---

## 4. Flux d'un prêt — owner → borrower

```mermaid
sequenceDiagram
    autonumber
    participant A as Alice (owner)
    participant W as Web Alice
    participant API as packages/api
    participant DB as Postgres
    participant B as Bob (borrower)
    participant WB as Web Bob

    A->>W: clique "Prêter" sur Objet
    W->>W: CreateLoanDialog ouvert
    W->>W: BorrowerSelectDialog<br/>(onglet ID/QR)
    A->>W: tape "#bob5678" ou scan QR
    W->>API: trpc.users.getById({ id: "#bob5678" })
    API->>DB: SELECT user WHERE id OR handle
    API-->>W: { id, name, handle }
    A->>W: clique "Sélectionner"
    W->>API: trpc.loans.create({ objectId, userId: bob.id })
    API->>DB: INSERT Loan { borrowerId: bob.id, ownerId: alice.id, ACTIVE }
    API->>DB: INSERT Notification { userId: bob.id, type: RETURN_REMINDER }
    API-->>W: loan

    Note over B,WB: Plus tard...

    B->>WB: ouvre /loans
    WB->>API: trpc.loans.borrowed()
    API->>DB: SELECT Loan WHERE borrowerId = bob.id<br/>+ JOIN object, owner
    API-->>WB: items[]
    WB->>B: affiche objet + nom Alice sous onglet "Empruntés"
```

Cas spécial : si Bob n'a pas (encore) de compte Brol mais est dans les
contacts d'Alice avec `Contact.borrowerId = null`, le `Loan` pointe sur
`borrowerContactId` à la place — Bob ne verra rien jusqu'à ce que son
`Contact` soit lié à un compte (via email/téléphone match).

---

## 5. Modèle de données (sous-ensemble)

```mermaid
erDiagram
    User ||--o{ Collection : owns
    User ||--o{ Contact : owns
    User ||--o{ Loan : "owns (as owner)"
    User ||--o{ Loan : "owns (as borrower)"
    User ||--o| Profile : has
    User ||--o{ Review : "writes (author)"
    User ||--o{ Review : "receives (target)"
    User ||--o{ UserBadge : earned
    User ||--o{ QrStock : owns

    Collection ||--o{ Object : contains
    Object ||--o{ Photo : has
    Object ||--o{ Loan : "subject of"
    Object ||--o| QrStock : "tagged with"

    Contact ||--o{ Loan : "as borrowerContact"
    Loan ||--o{ Review : "exchange for"

    BadgeDefinition ||--o{ UserBadge : awarded

    User {
        string id PK
        string handle UK "#piet1234"
        string email UK
        string name
        string locale "fr|nl|en"
    }
    Loan {
        string id PK
        string objectId FK
        string ownerId FK
        string borrowerId FK "User ou null"
        string borrowerContactId FK "Contact ou null"
        enum status "ACTIVE|RETURNED|OVERDUE|CANCELLED"
        datetime lentAt
        datetime returnDueDate
    }
    Review {
        string id PK
        string authorId FK
        string targetId FK
        string loanId FK
        int rating "1-5"
        string comment
    }
```

17 modèles au total (cf. `packages/db/prisma/schema.prisma`). Les modèles
auth BetterAuth (`Account`, `Session`, `VerificationToken`) sont omis pour
lisibilité.

---

## 6. Communautés du graphe de code

Extrait du graphe de connaissance produit par `/graphify` (415 nœuds, 145
communautés). Top 10 par taille :

| ID | Nom                         | Taille | God node     |
|----|-----------------------------|-------:|--------------|
| C0 | Mobile Auth & Session       | 32     | `syncSession` |
| C1 | Web Auth Pages              | 27     | `signInEmailPassword` |
| C2 | E2E Test Helpers            | 19     | `createUserAPI` |
| C3 | Utility Functions           | 16     | `formatDate` |
| C4 | Mobile API Client           | 14     | `getApiBase` |
| C5 | Coverage Report JS          | 14     | `getNthColumn` (auto-généré, ignorable) |
| C7 | S3 Storage                  | 11     | `getBucket` |
| C8 | Web Page Utilities          | 10     | `formatRelativeDate` |
| C9 | tRPC Server Handler         | 7      | `handleTrpc` |
| C11| Email Reminders             | 7      | `sendReminderEmail` |

Le god node `trpcCall()` (11 edges, le plus connecté du repo) ponte
**Mobile API Client ↔ Mobile Auth & Session** — c'est le seul endroit où
la couche transport touche au store de session. Tout changement de
sémantique d'auth doit passer par cette fonction.

---

## 7. Endpoints publics

| Surface       | Route                              | Description                    |
| ------------- | ---------------------------------- | ------------------------------ |
| Web           | `app.brol.dev/`                    | Dashboard                      |
| Web           | `app.brol.dev/browse`              | Collections publiques          |
| Web           | `app.brol.dev/profile/{handle}`    | Profil public via handle ou id |
| Web           | `app.brol.dev/qr/{code}`           | Page publique de scan QR       |
| API           | `api.brol.dev/api/auth/*`          | BetterAuth                     |
| API           | `api.brol.dev/api/trpc/*`          | Tous les routers tRPC          |
| API (test)    | `api.brol.dev/api/test/*`          | Endpoints de test (à gater en prod) |

⚠️ Les endpoints `/api/test/cleanup-user` et `/api/test/get-token` ne sont
**pas** gardés derrière `NODE_ENV !== "production"` — à corriger avant tout
déploiement nouveau (cf. AUDIT.md §5).

---

## 8. CI

```mermaid
flowchart LR
    PR[Pull Request / Push main] --> LINT[lint]
    PR --> TYPE[typecheck]
    PR --> UNIT[Unit tests<br/>+ coverage artifact]
    PR --> E2E[E2E Playwright]
    UNIT --> COV[Upload coverage<br/>retention 7j]
```

Workflows GitHub Actions : `.github/workflows/ci.yml`.

Postgres 16 est démarré comme service container pour les jobs `Unit tests`
et `E2E`. Les deux installent les deps avec `pnpm install --frozen-lockfile`,
ce qui déclenche `postinstall` (`scripts/postinstall.sh`) → `prisma generate`
+ symlink `.prisma`.
