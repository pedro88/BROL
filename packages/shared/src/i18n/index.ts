/**
 * Messages d'internationalisation (i18n) pour Brol.
 * Structure: locales/{locale}.json
 *
 * @package @brol/shared
 */

/**
 * Clés de traduction principales.
 * Usage: t('common.submit') dans les composants.
 */
export const common = {
  // Actions
  submit: { fr: "Envoyer", nl: "Verzenden", en: "Submit" },
  cancel: { fr: "Annuler", nl: "Annuleren", en: "Cancel" },
  save: { fr: "Enregistrer", nl: "Opslaan", en: "Save" },
  delete: { fr: "Supprimer", nl: "Verwijderen", en: "Delete" },
  edit: { fr: "Modifier", nl: "Bewerken", en: "Edit" },
  create: { fr: "Créer", nl: "Maken", en: "Create" },
  scan: { fr: "Scanner", nl: "Scannen", en: "Scan" },
  search: { fr: "Rechercher", nl: "Zoeken", en: "Search" },
  filter: { fr: "Filtrer", nl: "Filteren", en: "Filter" },
  close: { fr: "Fermer", nl: "Sluiten", en: "Close" },
  back: { fr: "Retour", nl: "Terug", en: "Back" },
  next: { fr: "Suivant", nl: "Volgende", en: "Next" },
  confirm: { fr: "Confirmer", nl: "Bevestigen", en: "Confirm" },

  // États
  loading: { fr: "Chargement...", nl: "Laden...", en: "Loading..." },
  error: { fr: "Erreur", nl: "Fout", en: "Error" },
  success: { fr: "Succès", nl: "Succes", en: "Success" },
  empty: { fr: "Aucun résultat", nl: "Geen resultaten", en: "No results" },

  // Validation
  required: { fr: "Ce champ est requis", nl: "Dit veld is verplicht", en: "This field is required" },
  invalidEmail: { fr: "Email invalide", nl: "Ongeldig e-mail", en: "Invalid email" },
  tooLong: { fr: "Trop long", nl: "Te lang", en: "Too long" },
};

/**
 * Traductions pour la navigation.
 */
export const nav = {
  home: { fr: "Accueil", nl: "Start", en: "Home" },
  collections: { fr: "Collections", nl: "Collecties", en: "Collections" },
  objects: { fr: "Objets", nl: "Objecten", en: "Objects" },
  loans: { fr: "Prêts", nl: "Leningen", en: "Loans" },
  lent: { fr: "Prêtés", nl: "Uitgeleend", en: "Lent out" },
  borrowed: { fr: "Empruntés", nl: "Geleend", en: "Borrowed" },
  contacts: { fr: "Contacts", nl: "Contacten", en: "Contacts" },
  settings: { fr: "Paramètres", nl: "Instellingen", en: "Settings" },
  profile: { fr: "Profil", nl: "Profiel", en: "Profile" },
  qrCodes: { fr: "QR Codes", nl: "QR Codes", en: "QR Codes" },
};

/**
 * Traductions pour l'authentification.
 */
export const auth = {
  signIn: { fr: "Connexion", nl: "Aanmelden", en: "Sign in" },
  signOut: { fr: "Déconnexion", nl: "Afmelden", en: "Sign out" },
  signUp: { fr: "Inscription", nl: "Registreren", en: "Sign up" },
  email: { fr: "Email", nl: "E-mail", en: "Email" },
  password: { fr: "Mot de passe", nl: "Wachtwoord", en: "Password" },
  forgotPassword: { fr: "Mot de passe oublié ?", nl: "Wachtwoord vergeten?", en: "Forgot password?" },
  noAccount: { fr: "Pas encore de compte ?", nl: "Nog geen account?", en: "Don't have an account?" },
  hasAccount: { fr: "Déjà un compte ?", nl: "Reeds een account?", en: "Already have an account?" },
  orContinueWith: { fr: "Ou continuer avec", nl: "Of ga verder met", en: "Or continue with" },
};

/**
 * Traductions pour les collections.
 */
export const collections = {
  title: { fr: "Mes collections", nl: "Mijn collecties", en: "My collections" },
  create: { fr: "Créer une collection", nl: "Maak een collectie", en: "Create a collection" },
  edit: { fr: "Modifier la collection", nl: "Bewerk de collectie", en: "Edit collection" },
  delete: { fr: "Supprimer la collection", nl: "Verwijder de collectie", en: "Delete collection" },
  name: { fr: "Nom", nl: "Naam", en: "Name" },
  description: { fr: "Description", nl: "Beschrijving", en: "Description" },
  objectCount: { fr: "{{count}} objet", fr_plural: "{{count}} objets", nl: "{{count}} object", nl_plural: "{{count}} objecten", en: "{{count}} item", en_plural: "{{count}} items" },
  lentOut: { fr: "{{count}} prêté", fr_plural: "{{count}} prêtés", nl: "{{count}} uitgeleend", nl_plural: "{{count}} uitgeleend", en: "{{count}} lent out", en_plural: "{{count}} lent out" },
  empty: { fr: "Aucune collection", nl: "Geen collecties", en: "No collections" },
  emptyDescription: { fr: "Créez votre première collection pour commencer", nl: "Maak je eerste collectie om te beginnen", en: "Create your first collection to get started" },
};

/**
 * Traductions pour les objets.
 */
export const objects = {
  title: { fr: "Mes objets", nl: "Mijn objecten", en: "My objects" },
  add: { fr: "Ajouter un objet", nl: "Voeg een object toe", en: "Add an object" },
  edit: { fr: "Modifier l'objet", nl: "Bewerk het object", en: "Edit object" },
  delete: { fr: "Supprimer l'objet", nl: "Verwijder het object", en: "Delete object" },
  name: { fr: "Nom", nl: "Naam", en: "Name" },
  author: { fr: "Auteur", nl: "Auteur", en: "Author" },
  edition: { fr: "Édition", nl: "Editie", en: "Edition" },
  isbn: { fr: "ISBN", nl: "ISBN", en: "ISBN" },
  barcode: { fr: "Code-barres", nl: "Barcode", en: "Barcode" },
  condition: { fr: "État", nl: "Conditie", en: "Condition" },
  notes: { fr: "Notes", nl: "Notities", en: "Notes" },
  scanBarcode: { fr: "Scanner le code-barres", nl: "Scan de barcode", en: "Scan barcode" },
  generateQr: { fr: "Générer un QR code", nl: "Genereer een QR code", en: "Generate QR code" },
  conditions: {
    NEW: { fr: "Neuf", nl: "Nieuw", en: "New" },
    LIKE_NEW: { fr: "Comme neuf", nl: "Als nieuw", en: "Like new" },
    GOOD: { fr: "Bon", nl: "Goed", en: "Good" },
    FAIR: { fr: "Correct", nl: "Redelijk", en: "Fair" },
    POOR: { fr: "Mauvais", nl: "Slecht", en: "Poor" },
  },
  empty: { fr: "Aucun objet", nl: "Geen objecten", en: "No objects" },
  emptyDescription: { fr: "Ajoutez votre premier objet à cette collection", nl: "Voeg je eerste object toe aan deze collectie", en: "Add your first object to this collection" },
};

/**
 * Traductions pour les prêts.
 */
export const loans = {
  title: { fr: "Mes prêts", nl: "Mijn leningen", en: "My loans" },
  lend: { fr: "Prêter", nl: "Uitlenen", en: "Lend" },
  return: { fr: "Retour", nl: "Terugbrengen", en: "Return" },
  returnObject: { fr: "Marquer comme rendu", nl: "Markeer als teruggebracht", en: "Mark as returned" },
  active: { fr: "En cours", nl: "Actief", en: "Active" },
  returned: { fr: "Retourné", nl: "Teruggebracht", en: "Returned" },
  overdue: { fr: "En retard", nl: "Te laat", en: "Overdue" },
  lentOn: { fr: "Prêté le", nl: "Uitgeleend op", en: "Lent on" },
  returnBy: { fr: "Retour avant", nl: "Terug voor", en: "Return by" },
  returnedOn: { fr: "Retourné le", nl: "Teruggebracht op", en: "Returned on" },
  borrower: { fr: "Emprunteur", nl: "Lener", en: "Borrower" },
  selectBorrower: { fr: "Sélectionner l'emprunteur", nl: "Selecteer de lener", en: "Select borrower" },
  addReminder: { fr: "Ajouter un rappel", nl: "Voeg herinnering toe", en: "Add reminder" },
  sendReminder: { fr: "Envoyer un rappel", nl: "Stuur herinnering", en: "Send reminder" },
  lentOut: { fr: "Objets prêtés", nl: "Uitgeleende objecten", en: "Lent out" },
  borrowed: { fr: "Objets empruntés", nl: "Geleende objecten", en: "Borrowed" },
  empty: { fr: "Aucun prêt", nl: "Geen leningen", en: "No loans" },
  emptyLent: { fr: "Aucun objet prêté", nl: "Geen objecten uitgeleend", en: "Nothing lent out" },
  emptyBorrowed: { fr: "Aucun objet emprunté", nl: "Geen objecten geleend", en: "Nothing borrowed" },
};

/**
 * Traductions pour les contacts.
 */
export const contacts = {
  title: { fr: "Mes contacts", nl: "Mijn contacten", en: "My contacts" },
  add: { fr: "Ajouter un contact", nl: "Contact toevoegen", en: "Add contact" },
  edit: { fr: "Modifier le contact", nl: "Bewerk het contact", en: "Edit contact" },
  delete: { fr: "Supprimer le contact", nl: "Verwijder het contact", en: "Delete contact" },
  name: { fr: "Nom", nl: "Naam", en: "Name" },
  email: { fr: "Email", nl: "E-mail", en: "Email" },
  phone: { fr: "Téléphone", nl: "Telefoon", en: "Phone" },
  note: { fr: "Note", nl: "Notitie", en: "Note" },
  scanProfile: { fr: "Scanner le profil", nl: "Scan het profiel", en: "Scan profile" },
  invite: { fr: "Inviter", nl: "Uitnodigen", en: "Invite" },
  empty: { fr: "Aucun contact", nl: "Geen contacten", en: "No contacts" },
  emptyDescription: { fr: "Ajoutez des contacts pour leur prêter des objets", nl: "Voeg contacten toe om objecten uit te lenen", en: "Add contacts to lend them objects" },
};

/**
 * Traductions pour les QR codes.
 */
export const qrCodes = {
  title: { fr: "Mes QR codes", nl: "Mijn QR codes", en: "My QR codes" },
  stock: { fr: "Stock de QR codes", nl: "QR code voorraad", en: "QR code stock" },
  generate: { fr: "Générer", nl: "Genereren", en: "Generate" },
  print: { fr: "Imprimer", nl: "Afdrukken", en: "Print" },
  printAll: { fr: "Imprimer tous", nl: "Alles afdrukken", en: "Print all" },
  available: { fr: "Disponibles", nl: "Beschikbaar", en: "Available" },
  used: { fr: "Utilisés", nl: "Gebruikt", en: "Used" },
  scanToAssign: { fr: "Scanner pour affecter", nl: "Scan om toe te wijzen", en: "Scan to assign" },
  scanToLend: { fr: "Scanner pour prêter", nl: "Scan om uit te lenen", en: "Scan to lend" },
  scanToReturn: { fr: "Scanner pour retourner", nl: "Scan om terug te brengen", en: "Scan to return" },
};

/**
 * Traductions pour le scan public.
 */
export const publicScan = {
  title: { fr: "Objet public", nl: "Publiek object", en: "Public object" },
  owner: { fr: "Propriétaire", nl: "Eigenaar", en: "Owner" },
  currentlyLent: { fr: "Actuellement prêté à", nl: "Momenteel uitgeleend aan", en: "Currently lent to" },
  notLent: { fr: "Actuellement disponible", nl: "Momenteel beschikbaar", en: "Currently available" },
  sendMessage: { fr: "Envoyer un message", nl: "Stuur een bericht", en: "Send message" },
  messagePlaceholder: { fr: "J'ai trouvé votre objet...", nl: "Ik heb uw object gevonden...", en: "I found your item..." },
};

/**
 * Traductions pour les erreurs.
 */
export const errors = {
  notFound: { fr: "Non trouvé", nl: "Niet gevonden", en: "Not found" },
  unauthorized: { fr: "Non autorisé", nl: "Niet geautoriseerd", en: "Unauthorized" },
  forbidden: { fr: "Interdit", nl: "Verboden", en: "Forbidden" },
  serverError: { fr: "Erreur serveur", nl: "Serverfout", en: "Server error" },
  validationError: { fr: "Erreur de validation", nl: "Validatiefout", en: "Validation error" },
  networkError: { fr: "Erreur réseau", nl: "Netwerkfout", en: "Network error" },
};
