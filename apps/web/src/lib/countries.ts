/**
 * Pays supportés par l'API Zippopotam.us (~60 pays).
 * Source : https://api.zippopotam.us/ (liste maintenue manuellement).
 * Triés alphabétiquement par nom FR.
 *
 * @package @brol/web
 */

export type Country = {
  code: string; // ISO-3166 alpha-2
  name: string; // Nom français
};

export const COUNTRIES: Country[] = [
  { code: "ZA", name: "Afrique du Sud" },
  { code: "DE", name: "Allemagne" },
  { code: "AD", name: "Andorre" },
  { code: "AR", name: "Argentine" },
  { code: "AU", name: "Australie" },
  { code: "AT", name: "Autriche" },
  { code: "BD", name: "Bangladesh" },
  { code: "BE", name: "Belgique" },
  { code: "BR", name: "Brésil" },
  { code: "BG", name: "Bulgarie" },
  { code: "CA", name: "Canada" },
  { code: "CL", name: "Chili" },
  { code: "CY", name: "Chypre" },
  { code: "HR", name: "Croatie" },
  { code: "DK", name: "Danemark" },
  { code: "DO", name: "République dominicaine" },
  { code: "ES", name: "Espagne" },
  { code: "EE", name: "Estonie" },
  { code: "US", name: "États-Unis" },
  { code: "FI", name: "Finlande" },
  { code: "FR", name: "France" },
  { code: "GR", name: "Grèce" },
  { code: "GG", name: "Guernesey" },
  { code: "GU", name: "Guam" },
  { code: "HU", name: "Hongrie" },
  { code: "IM", name: "Île de Man" },
  { code: "FO", name: "Îles Féroé" },
  { code: "MH", name: "Îles Marshall" },
  { code: "IN", name: "Inde" },
  { code: "ID", name: "Indonésie" },
  { code: "IE", name: "Irlande" },
  { code: "IS", name: "Islande" },
  { code: "IT", name: "Italie" },
  { code: "JP", name: "Japon" },
  { code: "JE", name: "Jersey" },
  { code: "LI", name: "Liechtenstein" },
  { code: "LT", name: "Lituanie" },
  { code: "LU", name: "Luxembourg" },
  { code: "MK", name: "Macédoine du Nord" },
  { code: "MY", name: "Malaisie" },
  { code: "MT", name: "Malte" },
  { code: "MX", name: "Mexique" },
  { code: "MC", name: "Monaco" },
  { code: "NO", name: "Norvège" },
  { code: "NZ", name: "Nouvelle-Zélande" },
  { code: "PK", name: "Pakistan" },
  { code: "NL", name: "Pays-Bas" },
  { code: "PH", name: "Philippines" },
  { code: "PL", name: "Pologne" },
  { code: "PT", name: "Portugal" },
  { code: "PR", name: "Porto Rico" },
  { code: "CZ", name: "République tchèque" },
  { code: "RO", name: "Roumanie" },
  { code: "GB", name: "Royaume-Uni" },
  { code: "RU", name: "Russie" },
  { code: "SM", name: "Saint-Marin" },
  { code: "RS", name: "Serbie" },
  { code: "SK", name: "Slovaquie" },
  { code: "SI", name: "Slovénie" },
  { code: "SE", name: "Suède" },
  { code: "CH", name: "Suisse" },
  { code: "TH", name: "Thaïlande" },
  { code: "TR", name: "Turquie" },
  { code: "UA", name: "Ukraine" },
  { code: "VA", name: "Vatican" },
  { code: "VI", name: "Îles Vierges américaines" },
];

export function countryName(code: string | null | undefined): string | null {
  if (!code) return null;
  return COUNTRIES.find((c) => c.code === code.toUpperCase())?.name ?? null;
}
