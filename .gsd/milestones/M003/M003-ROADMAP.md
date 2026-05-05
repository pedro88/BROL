# M003: Auth: fix password hashing & persistence

**Vision:** Corriger le système d'authentification pour que les mots de passe soient hashés en bcrypt avant stockage et correctement vérifiés à la connexion.

## Success Criteria

- Signup HTTP POST body ne contient jamais le mot de passe en clair (chiffré via TLS)
- hashedPassword en base n'est jamais NULL pour un user avec mot de passe (non-OAuth)
- Login email+password fonctionne end-to-end
- Hash = bcrypt, pas de MD5/SHA/plaintext
- Les users existants avec hashedPassword=NULL sont migrés

## Slices

- [x] **S01: S01** `risk:low` `depends:[]`
  > After this: Signup hash un password en bcrypt avant insertion, et le login vérifie le hash.

- [x] **S02: Password verification on sign-in** `risk:low` `depends:[S01]`
  > After this: Le login vérifie le hash bcrypt et retourne une session.

- [x] **S03: Migrate existing users with NULL hashedPassword** `risk:medium` `depends:[S02]`
  > After this: Tous les users NULL migrés avec un hash temporaire.

## Boundary Map

Not provided.
