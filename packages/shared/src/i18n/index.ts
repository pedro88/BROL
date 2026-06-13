/**
 * Messages d'internationalisation (i18n) pour Brol.
 * Structure: locales/{locale}.json
 *
 * @package @brol/shared
 */

// LOCALES / Locale sont déjà la source de vérité dans schemas/types — on les
// réutilise (pas de redéfinition pour éviter les collisions de barrel export).
import { LOCALES } from "../schemas";
import type { Locale } from "../types";

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
  menu: { fr: "Menu", nl: "Menu", en: "Menu" },

  // États
  loading: { fr: "Chargement...", nl: "Laden...", en: "Loading..." },
  error: { fr: "Erreur", nl: "Fout", en: "Error" },
  success: { fr: "Succès", nl: "Succes", en: "Success" },
  empty: { fr: "Aucun résultat", nl: "Geen resultaten", en: "No results" },

  // Validation
  required: { fr: "Ce champ est requis", nl: "Dit veld is verplicht", en: "This field is required" },
  invalidEmail: { fr: "Email invalide", nl: "Ongeldig e-mail", en: "Invalid email" },
  tooLong: { fr: "Trop long", nl: "Te lang", en: "Too long" },

  // Ajouts
  add: { fr: "Ajouter", nl: "Toevoegen", en: "Add" },
  editLabel: { fr: "MODIFIER", nl: "Bewerk", en: "Edit" },
  nameRequired: { fr: "Nom *", nl: "Naam *", en: "Name *" },
  saving: { fr: "Enregistrement...", nl: "Opslaan...", en: "Saving..." },
  name: { fr: "Nom", nl: "Naam", en: "Name" },
  unknown: { fr: "Inconnu", nl: "Onbekend", en: "Unknown" },
  view: { fr: "Voir", nl: "Bekijken", en: "View" },
  creating: { fr: "Création...", nl: "Aanmaken...", en: "Creating..." },
  disable: { fr: "Désactiver", nl: "Uitschakelen", en: "Disable" },
  optional: { fr: "Optionnel", nl: "Optioneel", en: "Optional" },
  other: { fr: "Autre", nl: "Ander", en: "Other" },
  sending: { fr: "Envoi...", nl: "Verzenden...", en: "Sending..." },
  send: { fr: "Envoyer", nl: "Verzenden", en: "Send" },
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
  notifications: { fr: "Notifications", nl: "Meldingen", en: "Notifications" },
  messages: { fr: "Messages", nl: "Berichten", en: "Messages" },
  badges: { fr: "Badges", nl: "Badges", en: "Badges" },
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

  // Titres + sous-titres
  signInTitle: { fr: "Connexion", nl: "Aanmelden", en: "Sign in" },
  signUpTitle: { fr: "Créer un compte", nl: "Account aanmaken", en: "Create account" },
  signInSubtitle: { fr: "> Accédez à votre espace Brol_", nl: "> Open je Brol-ruimte_", en: "> Access your Brol space_" },
  signUpSubtitle: { fr: "> Rejoignez Brol_", nl: "> Word lid van Brol_", en: "> Join Brol_" },

  // Champs
  name: { fr: "Nom", nl: "Naam", en: "Name" },
  namePlaceholder: { fr: "Jean Dupont", nl: "Jan Jansen", en: "John Doe" },
  emailPlaceholder: { fr: "jean@example.com", nl: "jan@example.com", en: "john@example.com" },
  passwordPlaceholderSignup: { fr: "Min. 8 caractères", nl: "Min. 8 tekens", en: "Min. 8 characters" },
  confirmPassword: { fr: "Confirmer le mot de passe", nl: "Bevestig wachtwoord", en: "Confirm password" },
  confirmPlaceholder: { fr: "Retapez votre mot de passe", nl: "Herhaal je wachtwoord", en: "Re-enter your password" },
  showPassword: { fr: "Afficher le mot de passe", nl: "Toon wachtwoord", en: "Show password" },
  hidePassword: { fr: "Masquer le mot de passe", nl: "Verberg wachtwoord", en: "Hide password" },

  // Force du mot de passe
  strengthShort: { fr: "Trop court", nl: "Te kort", en: "Too short" },
  strengthWeak: { fr: "Faible", nl: "Zwak", en: "Weak" },
  strengthFair: { fr: "Correct", nl: "Redelijk", en: "Fair" },
  strengthStrong: { fr: "Fort", nl: "Sterk", en: "Strong" },
  strengthWeakHint: { fr: " — ajoutez une majuscule, un chiffre ou un caractère spécial", nl: " — voeg een hoofdletter, cijfer of speciaal teken toe", en: " — add an uppercase letter, a digit or a special character" },

  // Validation + erreurs
  fillAllFields: { fr: "Veuillez remplir tous les champs", nl: "Vul alle velden in", en: "Please fill in all fields" },
  passwordTooShort: { fr: "Le mot de passe doit contenir au moins 8 caractères.", nl: "Het wachtwoord moet minstens 8 tekens bevatten.", en: "Password must be at least 8 characters." },
  passwordMismatch: { fr: "Les mots de passe ne correspondent pas.", nl: "De wachtwoorden komen niet overeen.", en: "Passwords do not match." },
  passwordMismatchShort: { fr: "Les mots de passe ne correspondent pas", nl: "Wachtwoorden komen niet overeen", en: "Passwords do not match" },

  // Boutons + bascule
  submitSignIn: { fr: "Se connecter", nl: "Aanmelden", en: "Sign in" },
  submitSignUp: { fr: "Créer mon compte", nl: "Account aanmaken", en: "Create my account" },
  toggleToSignUp: { fr: "Pas encore de compte ? Créez-en un.", nl: "Nog geen account? Maak er een aan.", en: "No account yet? Create one." },
  toggleToSignIn: { fr: "Déjà un compte ? Connectez-vous.", nl: "Al een account? Meld je aan.", en: "Already have an account? Sign in." },
  loadingShort: { fr: "...", nl: "...", en: "..." },
};

/**
 * Traductions pour le dashboard (page d'accueil connectée).
 */
export const dashboard = {
  welcome: { fr: "BIENVENUE", nl: "WELKOM", en: "WELCOME" },
  subtitle: { fr: "> Gestion de prêt simplifiée_", nl: "> Uitlenen, vereenvoudigd_", en: "> Lending made simple_" },

  // Cartes stats
  statObjects: { fr: "Objets", nl: "Objecten", en: "Items" },
  statLent: { fr: "Prêtés", nl: "Uitgeleend", en: "Lent out" },
  statLentOverdue: { fr: "Prêtés ({count} en retard)", nl: "Uitgeleend ({count} te laat)", en: "Lent out ({count} overdue)" },
  statBorrowed: { fr: "Empruntés", nl: "Geleend", en: "Borrowed" },
  statContacts: { fr: "Contacts", nl: "Contacten", en: "Contacts" },
  collectionsCount: { fr: "{count} collections", nl: "{count} collecties", en: "{count} collections" },

  // Actions rapides
  quickActions: { fr: "// ACTIONS RAPIDES", nl: "// SNELLE ACTIES", en: "// QUICK ACTIONS" },
  newLoan: { fr: "NOUVEAU PRÊT", nl: "NIEUWE LENING", en: "NEW LOAN" },
  newLoanDesc: { fr: "Prêter un objet à un contact", nl: "Leen een object uit aan een contact", en: "Lend an item to a contact" },
  addObject: { fr: "AJOUTER UN OBJET", nl: "OBJECT TOEVOEGEN", en: "ADD AN ITEM" },
  addObjectDesc: { fr: "Encoder un nouvel item", nl: "Een nieuw item invoeren", en: "Register a new item" },
  askCommunity: { fr: "DEMANDER À LA COMMUNAUTÉ", nl: "VRAAG DE COMMUNITY", en: "ASK THE COMMUNITY" },
  askCommunityDesc: { fr: "Trouver un objet auprès des voisins", nl: "Vind een object bij buren", en: "Find an item from neighbors" },
  scan: { fr: "SCANNER", nl: "SCANNEN", en: "SCAN" },
  scanDesc: { fr: "Scanner un QR code", nl: "Scan een QR-code", en: "Scan a QR code" },

  // Prêts récents
  recentLoans: { fr: "// PRÊTS RÉCENTS", nl: "// RECENTE LENINGEN", en: "// RECENT LOANS" },
  noActiveLoan: { fr: "Aucun prêt en cours", nl: "Geen lopende leningen", en: "No active loans" },
  loading: { fr: "Chargement...", nl: "Laden...", en: "Loading..." },

  // Mes demandes
  myRequests: { fr: "// MES DEMANDES", nl: "// MIJN AANVRAGEN", en: "// MY REQUESTS" },
  requestOpen: { fr: "Ouverte", nl: "Open", en: "Open" },
  requestFulfilled: { fr: "Pourvue", nl: "Vervuld", en: "Fulfilled" },
  requestCancelled: { fr: "Annulée", nl: "Geannuleerd", en: "Cancelled" },
  requestExpired: { fr: "Expirée", nl: "Verlopen", en: "Expired" },
};

/**
 * Traductions pour le sélecteur de langue.
 */
export const language = {
  label: { fr: "Langue", nl: "Taal", en: "Language" },
  fr: { fr: "Français", nl: "Frans", en: "French" },
  nl: { fr: "Néerlandais", nl: "Nederlands", en: "Dutch" },
  en: { fr: "Anglais", nl: "Engels", en: "English" },
};

/**
 * Traductions pour le sélecteur de thème graphique (presets de couleurs).
 */
export const theme = {
  label: { fr: "Thème", nl: "Thema", en: "Theme" },
  magenta: { fr: "Magenta VHS", nl: "Magenta VHS", en: "VHS Magenta" },
  cyan: { fr: "Néon cyan", nl: "Cyaan neon", en: "Cyan Neon" },
  crtAmber: { fr: "CRT ambre", nl: "CRT amber", en: "Amber CRT" },
  boring: { fr: "Classique", nl: "Klassiek", en: "Classic" },
};

/**
 * Traductions pour l'inbox Messages (conversations de demandes + contacts QR).
 */
export const messages = {
  title: { fr: "MESSAGES", nl: "BERICHTEN", en: "MESSAGES" },
  empty: { fr: "Aucun message", nl: "Geen berichten", en: "No messages" },
  emptyDescription: {
    fr: "Vos conversations et demandes de contact apparaîtront ici.",
    nl: "Uw gesprekken en contactaanvragen verschijnen hier.",
    en: "Your conversations and contact requests will appear here.",
  },
  conversationsSection: { fr: "Conversations", nl: "Gesprekken", en: "Conversations" },
  qrSection: { fr: "Contacts via QR", nl: "Contacten via QR", en: "QR contacts" },
  threadAbout: { fr: "À propos de : {title}", nl: "Over: {title}", en: "About: {title}" },
  qrFromLabel: { fr: "De", nl: "Van", en: "From" },
  qrObjectLabel: { fr: "Objet", nl: "Object", en: "Object" },
  replyByEmail: { fr: "Répondre par email", nl: "Antwoord per e-mail", en: "Reply by email" },
  noName: { fr: "Sans nom", nl: "Geen naam", en: "No name" },
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
  noCollections: { fr: "Aucune collection", nl: "Geen collecties", en: "No collections" },

  // Ajouts
  new: { fr: "Nouvelle", nl: "Nieuw", en: "New" },
  notFound: { fr: "COLLECTION NON TROUVÉE", nl: "Collectie niet gevonden", en: "Collection not found" },
  notFoundDescription: { fr: "Cette collection n'existe pas ou n'est pas accessible.", nl: "Deze collectie bestaat niet of is niet toegankelijk.", en: "This collection does not exist or is not accessible." },
  viewPublic: { fr: "Voir les collections publiques", nl: "Bekijk openbare collecties", en: "View public collections" },
  publicCollections: { fr: "Collections publiques", nl: "Openbare collecties", en: "Public collections" },
  public: { fr: "COLLECTION PUBLIQUE", nl: "Openbare collectie", en: "Public collection" },
  publicSignInPrompt: { fr: "Connectez-vous pour voir le contenu et gérer vos prêts.", nl: "Meld je aan om inhoud te bekijken en je leningen te beheren.", en: "Sign in to view content and manage your loans." },
  emptyNoAuth: { fr: "Cette collection est vide.", nl: "Deze collectie is leeg.", en: "This collection is empty." },
  byOwner: { fr: "par {name}", nl: "door {name}", en: "by {name}" },
  editDescription: { fr: "Modifier les informations de la collection", nl: "Bewerk collectie-informatie", en: "Edit collection information" },
  label: { fr: "Collection", nl: "Collectie", en: "Collection" },
  typeOfObjects: { fr: "Type d'objets", nl: "Type objecten", en: "Type of objects" },
  typeLabel: {
    BOOK: { fr: "Livres", nl: "Boeken", en: "Books" },
    BOARD_GAME: { fr: "Jeux de société", nl: "Bordspellen", en: "Board games" },
    TOOL: { fr: "Outils", nl: "Gereedschap", en: "Tools" },
    FILM: { fr: "Films / DVD", nl: "Films / DVD", en: "Films / DVD" },
    MUSIC: { fr: "Musique / CD", nl: "Muziek / CD", en: "Music / CD" },
    ELECTRONIC: { fr: "Électronique", nl: "Elektronica", en: "Electronics" },
    ELECTRIC: { fr: "Outillage électrique", nl: "Elektrisch gereedschap", en: "Power tools" },
    CLOTHING: { fr: "Vêtements", nl: "Kleding", en: "Clothing" },
    VIDEOGAME: { fr: "Jeux vidéo", nl: "Videogames", en: "Video games" },
    CUSTOM: { fr: "Personnalisé", nl: "Aangepast", en: "Custom" },
  },
  customFieldsHint: { fr: "Définissez les labels pour les champs libres", nl: "Definieer labels voor aangepaste velden", en: "Define labels for custom fields" },
  customField1Label: { fr: "Champ libre 1", nl: "Aangepast veld 1", en: "Custom field 1" },
  customField2Label: { fr: "Champ libre 2", nl: "Aangepast veld 2", en: "Custom field 2" },
  isPublic: { fr: "Collection publique", nl: "Openbare collectie", en: "Public collection" },
  publicDescription: { fr: "Visible par tous sans connexion", nl: "Zichtbaar voor iedereen zonder aanmelden", en: "Visible to everyone without login" },
  notFoundShort: { fr: "Collection non trouvée", nl: "Collectie niet gevonden", en: "Collection not found" },
  viewCollection: { fr: "Voir la collection {name}", nl: "Bekijk collectie {name}", en: "View collection {name}" },
  createTitle: { fr: "NOUVELLE COLLECTION", nl: "Nieuwe collectie", en: "New collection" },
  createDescription: { fr: "Créez une collection pour organiser vos objets", nl: "Maak een collectie om uw objecten in te ordenen", en: "Create a collection to organize your objects" },
  namePlaceholder: { fr: "Ma collection", nl: "Mijn collectie", en: "My collection" },
  descriptionPlaceholder: { fr: "Une courte description...", nl: "Een korte beschrijving...", en: "A short description..." },
  publicToggleDescription: { fr: "Permettre à tous de voir cette collection sans se connecter", nl: "Sta iedereen toe deze collectie zonder aanmelding in te zien", en: "Allow everyone to view this collection without signing in" },
  createError: { fr: "Échec de la création. Veuillez réessayer.", nl: "Aanmaken mislukt. Probeer het opnieuw.", en: "Creation failed. Please try again." },
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
  genreLabel: { fr: "Genre", nl: "Genre", en: "Genre" },
  genrePlaceholder: { fr: "ex: science-fiction, comédie, manga…", nl: "bijv. sciencefiction, komedie, manga…", en: "e.g. sci-fi, comedy, manga…" },
  seriesLabel: { fr: "Série / Saga", nl: "Serie / Saga", en: "Series / Saga" },
  seriesPlaceholder: { fr: "ex: Le Seigneur des Anneaux", nl: "bijv. In de Ban van de Ring", en: "e.g. The Lord of the Rings" },
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
  addRequiresCollection: { fr: "Vous devez d'abord créer une collection pour y ajouter des objets", nl: "U moet eerst een collectie maken om objecten toe te voegen", en: "You must first create a collection to add objects to it" },

  // Ajouts
  labelPlural: { fr: "objets", nl: "objecten", en: "objects" },
  labelSingular: { fr: "objet", nl: "object", en: "object" },
  searchPlaceholder: { fr: "Rechercher un objet...", nl: "Zoek naar een object...", en: "Search for an object..." },
  filterAllCollections: { fr: "Toutes les collections", nl: "Alle collecties", en: "All collections" },
  filterStatus: { fr: "Status", nl: "Status", en: "Status" },
  filterStatusAll: { fr: "Tous", nl: "Alle", en: "All" },
  statusAvailable: { fr: "Disponible", nl: "Beschikbaar", en: "Available" },
  statusLent: { fr: "Prêté", nl: "Uitgeleend", en: "Lent" },
  statusBorrowed: { fr: "Emprunté", nl: "Geleend", en: "Borrowed" },
  statusOverdue: { fr: "En retard", nl: "Te laat", en: "Overdue" },
  clearFilters: { fr: "Effacer les filtres", nl: "Filters wissen", en: "Clear filters" },
  noResultsWithFilters: { fr: "Aucun objet ne correspond aux filtres.", nl: "Geen objecten die aan de filters voldoen.", en: "No objects match the filters." },
  noObjectsPrompt: { fr: "Ajoutez votre premier objet dans une collection.", nl: "Voeg uw eerste object toe aan een collectie.", en: "Add your first object to a collection." },
  addTitle: { fr: "AJOUTER UN OBJET", nl: "Een object toevoegen", en: "Add an object" },
  addDescription: { fr: "Ajoutez un nouvel objet à votre collection", nl: "Voeg een nieuw object toe aan uw collectie", en: "Add a new object to your collection" },
  notFound: { fr: "OBJET NON TROUVÉ", nl: "Object niet gevonden", en: "Object not found" },
  notFoundDescription: { fr: "Cet objet n'existe pas ou ne vous appartient pas.", nl: "Dit object bestaat niet of behoort niet aan u.", en: "This object does not exist or does not belong to you." },
  youBorrowedThisObject: { fr: "Vous avez emprunté cet objet", nl: "U hebt dit object geleend", en: "You borrowed this object" },
  loanDateRange: { fr: "Depuis le {lentAt} — retour prévu le {returnDueDate}", nl: "Sinds {lentAt} — terugbrenging verwacht op {returnDueDate}", en: "Since {lentAt} — return expected by {returnDueDate}" },
  owner: { fr: "Propriétaire : {owner}", nl: "Eigenaar: {owner}", en: "Owner: {owner}" },
  viaContact: { fr: "Via votre contact", nl: "Via uw contactpersoon", en: "Via your contact" },
  sharedObject: { fr: "Objet partagé", nl: "Gedeeld object", en: "Shared object" },
  brand: { fr: "Marque", nl: "Merk", en: "Brand" },
  deleteConfirm: { fr: "Êtes-vous sûr de vouloir supprimer cet objet ?", nl: "Weet u zeker dat u dit object wilt verwijderen?", en: "Are you sure you want to delete this object?" },
  activeLoanStatus: { fr: "Prêt en cours", nl: "Actieve lening", en: "Active loan" },
  lendThisObject: { fr: "Prêter cet objet", nl: "Leen dit object uit", en: "Lend this object" },
  detail: { fr: "Détail de l'objet", nl: "Object detail", en: "Object detail" },
  editDescription: { fr: "Modifier les informations de l'objet", nl: "Bewerk objectinformatie", en: "Edit object information" },
  photosSection: { fr: "// PHOTOS", nl: "// FOTO'S", en: "// PHOTOS" },
  notFoundShort: { fr: "Objet non trouvé.", nl: "Object niet gevonden.", en: "Object not found." },
  selectCollection: { fr: "Sélectionner une collection", nl: "Selecteer een collectie", en: "Select a collection" },
  type: { fr: "Type", nl: "Type", en: "Type" },
  photo: { fr: "Photo", nl: "Foto", en: "Photo" },
  authorLabel: {
    BOARD_GAME: { fr: "Auteur / Créateur", nl: "Auteur / Maker", en: "Author / Creator" },
    TOOL: { fr: "Marque / Fabricant", nl: "Merk / Fabrikant", en: "Brand / Manufacturer" },
    FILM: { fr: "Réalisateur", nl: "Regisseur", en: "Director" },
    MUSIC: { fr: "Artiste / Groupe", nl: "Artiest / Groep", en: "Artist / Band" },
    ELECTRONIC: { fr: "Marque", nl: "Merk", en: "Brand" },
    ELECTRIC: { fr: "Marque", nl: "Merk", en: "Brand" },
    CLOTHING: { fr: "Marque", nl: "Merk", en: "Brand" },
    VIDEOGAME: { fr: "Studio / Éditeur", nl: "Studio / Uitgever", en: "Studio / Publisher" },
    CUSTOM: { fr: "Marque / Auteur", nl: "Merk / Auteur", en: "Brand / Author" },
  },
  authorPlaceholder: {
    BOOK: { fr: "Antoine de Saint-Exupéry", nl: "Antoine de Saint-Exupéry", en: "Antoine de Saint-Exupéry" },
    BOARD_GAME: { fr: "Créateur du jeu", nl: "Gamecreator", en: "Game creator" },
    TOOL: { fr: "Makita, Bosch...", nl: "Makita, Bosch...", en: "Makita, Bosch..." },
    FILM: { fr: "Christopher Nolan", nl: "Christopher Nolan", en: "Christopher Nolan" },
    MUSIC: { fr: "Daft Punk", nl: "Daft Punk", en: "Daft Punk" },
    ELECTRONIC: { fr: "Apple, Sony...", nl: "Apple, Sony...", en: "Apple, Sony..." },
    ELECTRIC: { fr: "Makita, DeWalt...", nl: "Makita, DeWalt...", en: "Makita, DeWalt..." },
    CLOTHING: { fr: "Nike, Zara...", nl: "Nike, Zara...", en: "Nike, Zara..." },
    VIDEOGAME: { fr: "Nintendo, FromSoftware...", nl: "Nintendo, FromSoftware...", en: "Nintendo, FromSoftware..." },
    CUSTOM: { fr: "Marque ou auteur", nl: "Merk of auteur", en: "Brand or author" },
  },
  namePlaceholder: {
    BOOK: { fr: "Le Petit Prince", nl: "De kleine prins", en: "The Little Prince" },
    BOARD_GAME: { fr: "Catan", nl: "Catan", en: "Catan" },
    TOOL: { fr: "Tournevis cruciforme", nl: "Kruiskopschroevendraaier", en: "Cross-head screwdriver" },
    FILM: { fr: "Inception", nl: "Inception", en: "Inception" },
    MUSIC: { fr: "Discovery", nl: "Discovery", en: "Discovery" },
    ELECTRONIC: { fr: "iPhone 13", nl: "iPhone 13", en: "iPhone 13" },
    ELECTRIC: { fr: "Perceuse sans fil 18V", nl: "Snoerloze boor 18V", en: "Cordless drill 18V" },
    CLOTHING: { fr: "Veste en cuir", nl: "Lederen jas", en: "Leather jacket" },
    VIDEOGAME: { fr: "The Legend of Zelda", nl: "The Legend of Zelda", en: "The Legend of Zelda" },
    CUSTOM: { fr: "Mon objet", nl: "Mijn object", en: "My object" },
  },
  editionLabel: {
    fr: "Édition / Modèle", nl: "Editie / Model", en: "Edition / Model",
    ELECTRIC: { fr: "Modèle / Référence", nl: "Model / Referentie", en: "Model / Reference" },
    VIDEOGAME: { fr: "Plateforme", nl: "Platform", en: "Platform" },
  },
  editionPlaceholder: {
    BOOK: { fr: "Gallimard, 1943", nl: "Gallimard, 1943", en: "Gallimard, 1943" },
    BOARD_GAME: { fr: "Édition française", nl: "Franse editie", en: "French edition" },
    FILM: { fr: "Director's Cut", nl: "Director's Cut", en: "Director's Cut" },
    MUSIC: { fr: "Virgin Records, 1997", nl: "Virgin Records, 1997", en: "Virgin Records, 1997" },
    ELECTRIC: { fr: "DFD453, 18V", nl: "DFD453, 18V", en: "DFD453, 18V" },
    VIDEOGAME: { fr: "Super Nintendo, PS5, Switch...", nl: "Super Nintendo, PS5, Switch...", en: "Super Nintendo, PS5, Switch..." },
    DEFAULT: { fr: "Modèle, référence...", nl: "Model, referentie...", en: "Model, reference..." },
  },
  playersMin: { fr: "Joueurs min.", nl: "Min. spelers", en: "Min. players" },
  playersMax: { fr: "Joueurs max.", nl: "Max. spelers", en: "Max. players" },
  playingTimeMinutes: { fr: "Durée (min.)", nl: "Duur (min.)", en: "Duration (min.)" },
  ageMin: { fr: "Âge min.", nl: "Min. leeftijd", en: "Min. age" },
  powerWatts: { fr: "Puissance (W)", nl: "Vermogen (W)", en: "Power (W)" },
  isbnPlaceholder: { fr: "978-2-07-040850-4", nl: "978-2-07-040850-4", en: "978-2-07-040850-4" },
  bggSearchLabel: { fr: "Rechercher sur BoardGameGeek", nl: "Zoeken op BoardGameGeek", en: "Search on BoardGameGeek" },
  bggSearchPlaceholder: { fr: "Catan, 7 Wonders...", nl: "Catan, 7 Wonders...", en: "Catan, 7 Wonders..." },
  bggNotConfigured: { fr: "Recherche BGG non configurée sur ce serveur", nl: "BGG-zoekopdracht niet geconfigureerd op deze server", en: "BGG search is not configured on this server" },
  bggNoResults: { fr: "Aucun résultat sur BGG — remplissez manuellement", nl: "Geen resultaten op BGG — vul handmatig in", en: "No results on BGG — fill in manually" },
  bggHint: { fr: "Préremplit titre, auteur, joueurs, durée et couverture", nl: "Vult titel, auteur, spelers, duur en cover automatisch in", en: "Auto-fills title, designer, players, play time and cover" },
  isbnFound: { fr: "✓ Métadonnées récupérées — vérifiez et ajustez si nécessaire", nl: "✓ Metagegevens opgehaald — controleer en pas zo nodig aan", en: "✓ Metadata retrieved — verify and adjust if needed" },
  isbnNotFound: { fr: "ISBN non trouvé — remplissez manuellement", nl: "ISBN niet gevonden — vul handmatig in", en: "ISBN not found — fill in manually" },
  isbnAutoFill: { fr: "Saisie automatique via Open Library", nl: "Automatisch invullen via Open Library", en: "Auto-fill via Open Library" },
  barcodePlaceholder: { fr: "1234567890123", nl: "1234567890123", en: "1234567890123" },
  gender: {
    clothing: {
      size: { fr: "Taille", nl: "Maat", en: "Size" },
      gender: { fr: "Genre", nl: "Geslacht", en: "Gender" },
    },
    MALE: { fr: "Homme", nl: "Man", en: "Male" },
    FEMALE: { fr: "Femme", nl: "Vrouw", en: "Female" },
    UNISEX: { fr: "Unisexe", nl: "Unisex", en: "Unisex" },
  },
  color: { fr: "Couleur", nl: "Kleur", en: "Color" },
  material: { fr: "Matière", nl: "Materiaal", en: "Material" },
  size: {
    CHILD: { fr: "Enfant", nl: "Kind", en: "Child" },
  },
  toolSector: {
    label: { fr: "Secteur / Usage", nl: "Sector / Gebruik", en: "Sector / Use" },
    DIY: { fr: "Bricolage", nl: "DIY", en: "DIY" },
    GARDENING: { fr: "Jardinage", nl: "Tuinieren", en: "Gardening" },
    AUTOMOTIVE: { fr: "Automobile", nl: "Automechanica", en: "Automotive" },
    PLUMBING: { fr: "Plomberie", nl: "Loodgieterswerk", en: "Plumbing" },
    ELECTRICAL: { fr: "Électricité", nl: "Elektriciteit", en: "Electrical" },
    CONSTRUCTION: { fr: "Construction", nl: "Bouw", en: "Construction" },
    CARPENTRY: { fr: "Menuiserie", nl: "Timmerwerk", en: "Carpentry" },
    PAINTING: { fr: "Peinture", nl: "Schilderen", en: "Painting" },
  },
  powerSource: {
    label: { fr: "Alimentation", nl: "Stroombron", en: "Power source" },
    MANUAL: { fr: "Manuel (non alimenté)", nl: "Handmatig (niet aangedreven)", en: "Manual (non-powered)" },
    MAINS: { fr: "Secteur (filaire)", nl: "Netspanning (bedraad)", en: "Mains (wired)" },
    BATTERY: { fr: "Sur batterie", nl: "Batterij", en: "Battery-powered" },
  },
  brandPlaceholder: {
    TOOL: { fr: "Bosch, Makita...", nl: "Bosch, Makita...", en: "Bosch, Makita..." },
    CLOTHING: { fr: "Nike, Levi's...", nl: "Nike, Levi's...", en: "Nike, Levi's..." },
  },
  conditionLabel: { fr: "État", nl: "Conditie", en: "Condition" },
  pricingEnabled: { fr: "▼ Tarification activée", nl: "Prijsstelling ingeschakeld", en: "Pricing enabled" },
  pricingDisabled: { fr: "▶ Activer la tarification", nl: "Prijsstelling inschakelen", en: "Enable pricing" },
  cautionAmount: { fr: "Caution (€)", nl: "Borg (€)", en: "Deposit (€)" },
  rentalPriceDay: { fr: "Prix / jour (€)", nl: "Prijs / dag (€)", en: "Price / day (€)" },
  rentalPriceHour: { fr: "Prix / heure (€)", nl: "Prijs / uur (€)", en: "Price / hour (€)" },
  rentalPriceWeek: { fr: "Prix / semaine (€)", nl: "Prijs / week (€)", en: "Price / week (€)" },
  rentalPriceKm: { fr: "Prix / km (€)", nl: "Prijs / km (€)", en: "Price / km (€)" },
  cautionAmountPlaceholder: { fr: "50.00", nl: "50.00", en: "50.00" },
  rentalPriceDayPlaceholder: { fr: "5.00", nl: "5.00", en: "5.00" },
  rentalPriceHourPlaceholder: { fr: "1.00", nl: "1.00", en: "1.00" },
  rentalPriceWeekPlaceholder: { fr: "25.00", nl: "25.00", en: "25.00" },
  rentalPriceKmPlaceholder: { fr: "0.50", nl: "0.50", en: "0.50" },
  notesPlaceholder: { fr: "Notes ou remarques sur l'objet...", nl: "Notities of opmerkingen over het object...", en: "Notes or remarks about the object..." },
  uploadingPhoto: { fr: "Upload photo...", nl: "Foto uploaden...", en: "Uploading photo..." },
  creating: { fr: "Création...", nl: "Aanmaken...", en: "Creating..." },
  addObject: { fr: "Ajouter l'objet", nl: "Object toevoegen", en: "Add object" },
  createSuccess: { fr: "Objet créé avec succès !", nl: "Object succesvol aangemaakt!", en: "Object created successfully!" },
  createError: { fr: "Erreur lors de la création de l'objet", nl: "Fout bij het aanmaken van object", en: "Error creating object" },
  photoUploadError: { fr: "Photo non uploadée : {error}", nl: "Foto niet geüpload: {error}", en: "Photo not uploaded: {error}" },
  photoUploadErrorGeneric: { fr: "Photo non uploadée", nl: "Foto niet geüpload", en: "Photo not uploaded" },
  lentTo: { fr: "Prêté à {borrower}", nl: "Uitgeleend aan {borrower}", en: "Lent to {borrower}" },
  available: { fr: "Disponible", nl: "Beschikbaar", en: "Available" },
  editDialogTitle: { fr: "MODIFIER L'OBJET", nl: "Object bewerken", en: "Edit object" },
  editDialogDescription: { fr: "Modifier les informations de {objectName}", nl: "Bewerk informatie voor {objectName}", en: "Edit information for {objectName}" },
  nameLabel: { fr: "Nom de l'objet", nl: "Objectnaam", en: "Object name" },
  authorOrBrand: { fr: "Auteur / Marque", nl: "Auteur / Merk", en: "Author / Brand" },
  editionOrModel: { fr: "Édition / Modèle", nl: "Editie / Model", en: "Edition / Model" },
  savingChanges: { fr: "Enregistrement...", nl: "Wijzigingen opslaan...", en: "Saving changes..." },
  contactOwnerTitle: { fr: "Contacter le propriétaire", nl: "Neem contact op met de eigenaar", en: "Contact the owner" },
  contactOwnerDescription: { fr: "Envoyez un message à {ownerName} pour l'objet \"{objectName}\"", nl: "Stuur een bericht naar {ownerName} voor het object \"{objectName}\"", en: "Send a message to {ownerName} for the object \"{objectName}\"" },
  contactOwnerSuccess: { fr: "Votre message a été envoyé à {ownerName}.\nVous recevrez une réponse par email.", nl: "Uw bericht is verzonden aan {ownerName}.\nU ontvangt een antwoord per e-mail.", en: "Your message has been sent to {ownerName}.\nYou will receive a reply by email." },
  contactOwner: {
    fr: "Contacter le propriétaire", nl: "Neem contact op met de eigenaar", en: "Contact the owner",
    yourName: { fr: "Votre nom", nl: "Uw naam", en: "Your name" },
    namePlaceholder: { fr: "Jean Dupont", nl: "Jan Jansen", en: "John Doe" },
    yourEmail: { fr: "Votre email", nl: "Uw e-mailadres", en: "Your email" },
    emailPlaceholder: { fr: "jean@example.com", nl: "jan@example.com", en: "john@example.com" },
    emailNote: { fr: "Votre email ne sera utilisé que pour vous contacter.", nl: "Uw e-mailadres wordt alleen gebruikt om u te bereiken.", en: "Your email will only be used to contact you." },
    messageLabel: { fr: "Message", nl: "Bericht", en: "Message" },
    messagePlaceholder: { fr: "Bonjour {ownerName},\n\nJe suis intéressé par votre objet \"{objectName}\"...", nl: "Hallo {ownerName},\n\nIk ben geïnteresseerd in uw object \"{objectName}\"...", en: "Hello {ownerName},\n\nI am interested in your object \"{objectName}\"..." },
  },
  addPhoto: { fr: "Ajouter une photo", nl: "Voeg een foto toe", en: "Add a photo" },
  photoPickerTitle: { fr: "Ajouter une photo", nl: "Voeg een foto toe", en: "Add a photo" },
  photoSource: {
    file: { fr: "Fichier", nl: "Bestand", en: "File" },
    camera: { fr: "Caméra", nl: "Camera", en: "Camera" },
  },
  photoFileDescription: { fr: "Sélectionnez une image depuis votre appareil.", nl: "Selecteer een afbeelding van uw apparaat.", en: "Select an image from your device." },
  photoChooseFile: { fr: "Choisir un fichier", nl: "Kies een bestand", en: "Choose a file" },
  photoFileFormats: { fr: "JPEG, PNG, WebP, GIF • Max 10 Mo", nl: "JPEG, PNG, WebP, GIF • Max 10 MB", en: "JPEG, PNG, WebP, GIF • Max 10 MB" },
  photoCameraDescription: { fr: "Prenez une photo avec votre appareil.", nl: "Maak een foto met uw apparaat.", en: "Take a photo with your device." },
  photoOpenCamera: { fr: "Ouvrir la caméra", nl: "Camera openen", en: "Open camera" },
  photoCameraHint: { fr: "Caméra arrière sur mobile", nl: "Achteraanzicht op mobiel", en: "Rear camera on mobile" },
  photoPreview: { fr: "Aperçu", nl: "Voorbeeld", en: "Preview" },
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

  // Ajouts
  returnDueDateLabel: { fr: "Date de retour prévue", nl: "Verwachte terugbrengdatum", en: "Expected return date" },
  markReturned: { fr: "Marquer rendu", nl: "Markeer als teruggebracht", en: "Mark returned" },
  closedSuccess: { fr: "Prêt clôturé", nl: "Lening gesloten", en: "Loan closed" },
  closeError: { fr: "Impossible de clôturer le prêt", nl: "Kan lening niet sluiten", en: "Unable to close loan" },
  history: { fr: "Historique", nl: "Geschiedenis", en: "History" },
  cancelled: { fr: "Annulé", nl: "Geannuleerd", en: "Cancelled" },
  lent: { fr: "Prêté", nl: "Uitgeleend", en: "Lent" },
  markReturnedAriaLabel: { fr: "Marquer comme retourné", nl: "Markeer als teruggebracht", en: "Mark as returned" },
  pageTitle: { fr: "PRÊTS", nl: "LENINGEN", en: "LOANS" },
  pageSubtitle: { fr: "Suivez vos prêts et emprunts", nl: "Volg je leningen en uitleningen", en: "Track your loans and borrowings" },
  newLoan: { fr: "NOUVEAU PRÊT", nl: "NIEUWE LENING", en: "NEW LOAN" },
  overdueFilter: { fr: "Filtre : en retard ({count})", nl: "Filter: te laat ({count})", en: "Filter: overdue ({count})" },
  clearFilter: { fr: "Effacer", nl: "Wissen", en: "Clear" },
  removeOverdueFilterAriaLabel: { fr: "Retirer le filtre en retard", nl: "Verwijder te laat filter", en: "Remove overdue filter" },
  // NOTE: loans.emptyLent / loans.emptyBorrowed already exist above (different
  // values) — skipped per the no-duplicate rule.
  emptyHistory: { fr: "AUCUN HISTORIQUE", nl: "GEEN GESCHIEDENIS", en: "NO HISTORY" },
  emptyLentDesc: { fr: "Vos objets prêtés apparaîtront ici", nl: "Je uitgeleende objecten verschijnen hier", en: "Your lent items will appear here" },
  emptyBorrowedDesc: { fr: "Les objets que vous avez empruntés apparaîtront ici", nl: "Objecten die je hebt geleend verschijnen hier", en: "Items you borrowed will appear here" },
  emptyHistoryDesc: { fr: "Votre historique de prêts apparaîtra ici", nl: "Je geschiedems van leningen verschijnt hier", en: "Your loan history will appear here" },
  selectObjectTitle: { fr: "Sélectionner un objet à prêter", nl: "Selecteer een object om uit te lenen", en: "Select an object to lend" },
  searchObjectPlaceholder: { fr: "Rechercher un objet...", nl: "Zoek een object...", en: "Search for an object..." },
  noMatchingObjects: { fr: "Aucun objet disponible ne correspond", nl: "Geen beschikbare objecten gevonden", en: "No matching available objects" },
  noAvailableObjects: { fr: "Aucun objet disponible — tous sont déjà prêtés ou vous n'avez pas d'objets", nl: "Geen beschikbare objecten — allemaal zijn al uitgeleend of je hebt geen", en: "No available objects — all are already lent or you have none" },
  returnedSuccessToast: { fr: "Prêt marqué comme rendu", nl: "Lening gemarkeerd als teruggebracht", en: "Loan marked as returned" },
  returnErrorToast: { fr: "Erreur lors du retour", nl: "Fout bij terugbrengen lening", en: "Error returning loan" },
  reminderSentToast: { fr: "Rappel envoyé", nl: "Herinnering verzonden", en: "Reminder sent" },
  reminderErrorToast: { fr: "Erreur lors du rappel", nl: "Fout bij verzenden herinnering", en: "Error sending reminder" },
  overdueInDays: { fr: "En retard de {days} jour{days, plural, one {} other {s}}", nl: "{days} dag{days, plural, one {} other {en}} te laat", en: "Overdue by {days} day{days, plural, one {} other {s}}" },
  overdueOneDay: { fr: "En retard d'un jour", nl: "Een dag te laat", en: "Overdue by one day" },
  today: { fr: "Aujourd'hui", nl: "Vandaag", en: "Today" },
  tomorrow: { fr: "Demain", nl: "Morgen", en: "Tomorrow" },
  inDays: { fr: "Dans {days} jours", nl: "Over {days} dagen", en: "In {days} days" },
  selectBorrowerDialogTitle: { fr: "Ajouter un emprunteur", nl: "Voeg een lener toe", en: "Add a borrower" },
  selectBorrowerDescription: { fr: "Recherchez un contact, ajoutez par ID, ou créez un nouveau contact.", nl: "Zoek een contact, voeg toe met ID, of maak een nieuw contact.", en: "Search for a contact, add by ID, or create a new contact." },
  myContactsTab: { fr: "Mes contacts", nl: "Mijn contacten", en: "My contacts" },
  idQrTab: { fr: "ID / QR", nl: "ID / QR", en: "ID / QR" },
  newTab: { fr: "Nouveau", nl: "Nieuw", en: "New" },
  searchContactPlaceholder: { fr: "Rechercher un contact...", nl: "Zoek een contact...", en: "Search for a contact..." },
  brolUsersLabel: { fr: "Utilisateurs Brol", nl: "Brol gebruikers", en: "Brol users" },
  noContactsMessage: { fr: "Aucun contact enregistré", nl: "Geen contacten geregistreerd", en: "No contacts registered" },
  createContactLabel: { fr: "Créer un contact", nl: "Maak een contact", en: "Create a contact" },
  noEmailLabel: { fr: "sans email", nl: "geen e-mail", en: "no email" },
  brolAccountLabel: { fr: "compte Brol", nl: "Brol account", en: "Brol account" },
  userIdLabel: { fr: "Identifiant ou ID", nl: "Identificatie of ID", en: "Identifier or ID" },
  userIdPlaceholder: { fr: "#piet1234 ou ID brut", nl: "#piet1234 of raw ID", en: "#piet1234 or raw ID" },
  noUserFoundMessage: { fr: "Aucun utilisateur trouvé avec cet ID", nl: "Geen gebruiker gevonden met deze ID", en: "No user found with this ID" },
  orDivider: { fr: "ou", nl: "of", en: "or" },
  scanQrButtonLabel: { fr: "Scanner un QR code", nl: "Scan een QR-code", en: "Scan a QR code" },
  invalidQrErrorToast: { fr: "Ce QR code n'est pas un profil utilisateur", nl: "Deze QR-code is geen gebruikersprofiel", en: "This QR code is not a user profile" },
  userFoundToast: { fr: "Utilisateur trouvé: {user}", nl: "Gebruiker gevonden: {user}", en: "User found: {user}" },
  noUserForQrErrorToast: { fr: "Aucun utilisateur trouvé pour ce QR code", nl: "Geen gebruiker gevonden voor deze QR-code", en: "No user found for this QR code" },
  noNameLabel: { fr: "Sans nom", nl: "Geen naam", en: "No name" },
  selectThisUserButton: { fr: "Sélectionner cet utilisateur", nl: "Selecteer deze gebruiker", en: "Select this user" },
  newContactNameLabel: { fr: "Nom *", nl: "Naam *", en: "Name *" },
  newContactNamePlaceholder: { fr: "Marie Dupont", nl: "Maria Janssen", en: "Jane Doe" },
  newContactEmailLabel: { fr: "Email (optionnel)", nl: "E-mail (optioneel)", en: "Email (optional)" },
  newContactEmailPlaceholder: { fr: "marie@example.com", nl: "maria@example.com", en: "jane@example.com" },
  newContactPhoneLabel: { fr: "Téléphone (optionnel)", nl: "Telefoon (optioneel)", en: "Phone (optional)" },
  newContactPhonePlaceholder: { fr: "+32 xxx xx xx xx", nl: "+32 xxx xx xx xx", en: "+1 555 0000" },
  newContactNoteLabel: { fr: "Note (optionnel)", nl: "Notitie (optioneel)", en: "Note (optional)" },
  newContactNotePlaceholder: { fr: "Ami, collègue...", nl: "Vriend, collega...", en: "Friend, colleague..." },
  creatingLabel: { fr: "Création...", nl: "Aanmaken...", en: "Creating..." },
  createContactButton: { fr: "Créer le contact", nl: "Maak contact", en: "Create contact" },
  contactCreatedToast: { fr: "Contact \"{contactName}\" créé", nl: "Contact \"{contactName}\" aangemaakt", en: "Contact \"{contactName}\" created" },
  contactCreationErrorToast: { fr: "Erreur lors de la création du contact", nl: "Fout bij aanmaken contact", en: "Error creating contact" },
  lendObjectDialogTitle: { fr: "Prêter cet objet", nl: "Leen dit object uit", en: "Lend this object" },
  lendObjectDescription: { fr: "Vous prêtez {objectName} à un contact ou un utilisateur Brol.", nl: "Je leent {objectName} uit aan een contact of een Brol gebruiker.", en: "You are lending {objectName} to a contact or a Brol user." },
  borrowerLabel: { fr: "Emprunteur", nl: "Lener", en: "Borrower" },
  contactLabel: { fr: "Contact", nl: "Contact", en: "Contact" },
  brolUserLabel: { fr: "Utilisateur Brol", nl: "Brol gebruiker", en: "Brol user" },
  addBorrowerButtonLabel: { fr: "Ajouter un emprunteur", nl: "Voeg een lener toe", en: "Add a borrower" },
  notesLabel: { fr: "Notes (optionnel)", nl: "Notities (optioneel)", en: "Notes (optional)" },
  notesPlaceholder: { fr: "Rappel pour ce prêt...", nl: "Herinnering voor deze lening...", en: "Reminder for this loan..." },
  cancelButtonLabel: { fr: "Annuler", nl: "Annuleren", en: "Cancel" },
  confirmLoanButtonLabel: { fr: "Confirmer le prêt", nl: "Bevestig lening", en: "Confirm loan" },
  selectBorrowerErrorToast: { fr: "Sélectionnez un emprunteur", nl: "Selecteer een lener", en: "Select a borrower" },
  loanCreatedSuccessToast: { fr: "\"{objectName}\" prêté avec succès", nl: "\"{objectName}\" succesvol uitgeleend", en: "\"{objectName}\" lent successfully" },
  loanCreationErrorToast: { fr: "Erreur lors du prêt", nl: "Fout bij aanmaken lening", en: "Error creating loan" },
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

  // Ajouts
  pageTitle: { fr: "CONTACTS", nl: "CONTACTEN", en: "CONTACTS" },
  newButtonLabel: { fr: "Nouveau", nl: "Nieuw", en: "New" },
  editAriaLabel: { fr: "Modifier le contact", nl: "Bewerk het contact", en: "Edit contact" },
  deleteAriaLabel: { fr: "Supprimer le contact", nl: "Verwijder het contact", en: "Delete contact" },
  emptyTitle: { fr: "AUCUN CONTACT", nl: "GEEN CONTACTEN", en: "NO CONTACTS" },
  addButtonLabel: { fr: "Ajouter un contact", nl: "Voeg een contact toe", en: "Add a contact" },
  dialogEditTitle: { fr: "Modifier le contact", nl: "Bewerk het contact", en: "Edit contact" },
  dialogCreateTitle: { fr: "Nouveau contact", nl: "Nieuw contact", en: "New contact" },
  nameLabel: { fr: "Nom *", nl: "Naam *", en: "Name *" },
  namePlaceholder: { fr: "Jean Dupont", nl: "Jan Jansen", en: "John Doe" },
  emailLabel: { fr: "Email", nl: "E-mail", en: "Email" },
  emailPlaceholder: { fr: "jean@example.com", nl: "jan@example.com", en: "john@example.com" },
  phoneLabel: { fr: "Téléphone", nl: "Telefoon", en: "Phone" },
  phonePlaceholder: { fr: "+32 470 00 00 00", nl: "+32 470 00 00 00", en: "+1 555 0000" },
  noteLabel: { fr: "Note", nl: "Notitie", en: "Note" },
  notePlaceholder: { fr: "Ami, collègue...", nl: "Vriend, collega...", en: "Friend, colleague..." },
  saveButtonLabel: { fr: "Enregistrer", nl: "Opslaan", en: "Save" },
  createButtonLabel: { fr: "Créer", nl: "Maken", en: "Create" },
  createdToast: { fr: "Contact créé", nl: "Contact aangemaakt", en: "Contact created" },
  createErrorToast: { fr: "Erreur lors de la création", nl: "Fout bij aanmaken contact", en: "Error creating contact" },
  updatedToast: { fr: "Contact mis à jour", nl: "Contact bijgewerkt", en: "Contact updated" },
  updateErrorToast: { fr: "Erreur lors de la mise à jour", nl: "Fout bij bijwerken contact", en: "Error updating contact" },
  nameRequired: { fr: "Le nom est requis", nl: "Naam is verplicht", en: "Name is required" },
  deleteDialogTitle: { fr: "Supprimer le contact ?", nl: "Contact verwijderen?", en: "Delete contact?" },
  deleteConfirmMessage: { fr: "Voulez-vous vraiment supprimer {contactName} ? Cette action est irréversible.", nl: "Weet je zeker dat je {contactName} wilt verwijderen? Deze actie kan niet ongedaan gemaakt worden.", en: "Are you sure you want to delete {contactName}? This action is irreversible." },
  deletedToast: { fr: "Contact supprimé", nl: "Contact verwijderd", en: "Contact deleted" },
  deleteErrorToast: { fr: "Erreur lors de la suppression", nl: "Fout bij verwijderen contact", en: "Error deleting contact" },
  notFoundTitle: { fr: "CONTACT INTROUVABLE", nl: "CONTACT NIET GEVONDEN", en: "CONTACT NOT FOUND" },
  backButtonLabel: { fr: "Retour aux contacts", nl: "Terug naar contacten", en: "Back to contacts" },
  detailEditAriaLabel: { fr: "Modifier le contact", nl: "Bewerk het contact", en: "Edit contact" },
  loanHistoryTitle: { fr: "HISTORIQUE DE PRÊTS", nl: "GESCHIEDEMS VAN LENINGEN", en: "LOAN HISTORY" },
  loanCount: { fr: "{count} prêt{count, plural, one {} other {s}}", nl: "{count} lening{count, plural, one {} other {en}}", en: "{count} loan{count, plural, one {} other {s}}" },
  noLoansMessage: { fr: "Aucun prêt avec ce contact", nl: "Geen leningen met dit contact", en: "No loans with this contact" },
  lentOnDate: { fr: "Prêté le {date}", nl: "Uitgeleend op {date}", en: "Lent on {date}" },
  returnDueDate: { fr: "retour prévu le {date}", nl: "terugbrengen voorzien op {date}", en: "return due on {date}" },
  returnedOnDate: { fr: "Rendu le {date}", nl: "Teruggebracht op {date}", en: "Returned on {date}" },
  unknownObject: { fr: "Objet inconnu", nl: "Onbekend object", en: "Unknown object" },
  editDialogTitle: { fr: "Modifier le contact", nl: "Bewerk het contact", en: "Edit contact" },
  editNameLabel: { fr: "Nom *", nl: "Naam *", en: "Name *" },
  editEmailLabel: { fr: "Email", nl: "E-mail", en: "Email" },
  editPhoneLabel: { fr: "Téléphone", nl: "Telefoon", en: "Phone" },
  editNoteLabel: { fr: "Note", nl: "Notitie", en: "Note" },
  editSaveButton: { fr: "Enregistrer", nl: "Opslaan", en: "Save" },
  newContactDialogTitle: { fr: "Nouveau contact", nl: "Nieuw contact", en: "New contact" },
  addContactDescription: { fr: "Ajoutez manuellement, par identifiant Brol ou via QR code.", nl: "Voeg handmatig toe, via Brol-identificatie of QR-code.", en: "Add manually, by Brol identifier or via QR code." },
  manualTab: { fr: "Manuel", nl: "Handmatig", en: "Manual" },
  idHandleTab: { fr: "ID / Handle", nl: "ID / Handle", en: "ID / Handle" },
  qrCodeTab: { fr: "QR code", nl: "QR-code", en: "QR code" },
  manualNameLabel: { fr: "Nom *", nl: "Naam *", en: "Name *" },
  manualNamePlaceholder: { fr: "Marie Dupont", nl: "Maria Janssen", en: "Jane Doe" },
  manualEmailLabel: { fr: "Email", nl: "E-mail", en: "Email" },
  manualEmailPlaceholder: { fr: "marie@example.com", nl: "maria@example.com", en: "jane@example.com" },
  manualPhoneLabel: { fr: "Téléphone", nl: "Telefoon", en: "Phone" },
  manualPhonePlaceholder: { fr: "+32 470 00 00 00", nl: "+32 470 00 00 00", en: "+1 555 0000" },
  manualNoteLabel: { fr: "Note", nl: "Notitie", en: "Note" },
  manualNotePlaceholder: { fr: "Ami, collègue...", nl: "Vriend, collega...", en: "Friend, colleague..." },
  creatingLabel: { fr: "Création...", nl: "Aanmaken...", en: "Creating..." },
  createContactButtonLabel: { fr: "Créer le contact", nl: "Maak contact", en: "Create contact" },
  idHandleLabel: { fr: "Identifiant ou handle", nl: "Identificatie of handle", en: "Identifier or handle" },
  idHandlePlaceholder: { fr: "#piet1234 ou ID brut", nl: "#piet1234 of raw ID", en: "#piet1234 or raw ID" },
  noUserFoundForIdMessage: { fr: "Aucun utilisateur trouvé pour cet identifiant.", nl: "Geen gebruiker gevonden voor deze identificatie.", en: "No user found for this identifier." },
  noNameMessage: { fr: "Sans nom", nl: "Geen naam", en: "No name" },
  addThisContactButton: { fr: "Ajouter ce contact", nl: "Voeg dit contact toe", en: "Add this contact" },
  qrInstructions: { fr: "Scannez le QR code d'un profil Brol pour l'ajouter à vos contacts.", nl: "Scan de QR-code van een Brol-profiel om het aan je contacten toe te voegen.", en: "Scan the QR code of a Brol profile to add it to your contacts." },
  openScannerButton: { fr: "Ouvrir le scanner", nl: "Open scanner", en: "Open scanner" },
  invalidQrErrorToast: { fr: "Ce QR code n'est pas un profil utilisateur", nl: "Deze QR-code is geen gebruikersprofiel", en: "This QR code is not a user profile" },
  invalidQrCodeToast: { fr: "QR code invalide", nl: "Ongeldige QR-code", en: "Invalid QR code" },
  createdFromScanToast: { fr: "Contact créé", nl: "Contact aangemaakt", en: "Contact created" },
  contactAddedToast: { fr: "Contact \"{contactName}\" ajouté", nl: "Contact \"{contactName}\" toegevoegd", en: "Contact \"{contactName}\" added" },
  addContactErrorToast: { fr: "Impossible d'ajouter ce contact", nl: "Kan dit contact niet toevoegen", en: "Unable to add this contact" },
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

  // Ajouts
  assign: { fr: "Assigner un QR code", nl: "Wijs een QR-code toe", en: "Assign a QR code" },
  downloadPng: { fr: "Télécharger PNG", nl: "Download PNG", en: "Download PNG" },
  none: { fr: "Aucun QR code", nl: "Geen QR-code", en: "No QR code" },
  scan: { fr: "Scanner un QR", nl: "QR scannen", en: "Scan a QR" },
  selectExisting: { fr: "Sélectionner un QR existant", nl: "Selecteer een bestaande QR-code", en: "Select an existing QR code" },
  createNew: { fr: "Créer un nouveau QR", nl: "Maak een nieuwe QR-code", en: "Create a new QR code" },
  scanned: { fr: "✓ QR scanné : {code}", nl: "✓ QR gescand: {code}", en: "✓ QR scanned: {code}" },
  selectLabel: { fr: "Sélectionner un QR code", nl: "Selecteer een QR-code", en: "Select a QR code" },
  selected: { fr: "QR sélectionné : {code}", nl: "QR geselecteerd: {code}", en: "QR selected: {code}" },
  createAutomatically: { fr: "Un nouveau QR code sera généré automatiquement à la création de l'objet.", nl: "Een nieuwe QR-code wordt automatisch gegenereerd wanneer het object wordt aangemaakt.", en: "A new QR code will be generated automatically when the object is created." },
  generatingQr: { fr: "Génération du QR...", nl: "QR genereren...", en: "Generating QR..." },
  pageDescription: { fr: "Gérez votre stock de QR codes à coller sur vos objets.", nl: "Beheer uw QR-codevoorraad om op uw objecten te plakken.", en: "Manage your QR code stock to stick on your items." },
  countLabel: { fr: "Nombre de codes à générer", nl: "Aantal te genereren codes", en: "Number of codes to generate" },
  generateButton: { fr: "Générer", nl: "Genereren", en: "Generate" },
  generatedSuccess: { fr: "{count} code(s) généré(s) !", nl: "{count} code(s) gegenereerd!", en: "{count} code(s) generated!" },
  selectionCount: { fr: "Sélection : {count} code(s)", nl: "Selectie: {count} code(s)", en: "Selection: {count} code(s)" },
  selectAll: { fr: "Tout sélectionner", nl: "Alles selecteren", en: "Select all" },
  clearSelection: { fr: "Effacer", nl: "Wissen", en: "Clear" },
  sizeLabel: { fr: "Taille des QR", nl: "QR-grootte", en: "QR size" },
  sizeRecommended: { fr: "30 mm (recommandé)", nl: "30 mm (aanbevolen)", en: "30 mm (recommended)" },
  printButton: { fr: "Imprimer / PDF", nl: "Afdrukken / PDF", en: "Print / PDF" },
  printInstructions: { fr: "L'impression ouvre une nouvelle fenêtre. Choisissez \"Enregistrer en PDF\" dans le dialog du navigateur pour obtenir un PDF.", nl: "Afdrukken opent een nieuw venster. Kies \"Opslaan als PDF\" in het browserdialoogvenster om een PDF te krijgen.", en: "Printing opens a new window. Choose \"Save as PDF\" in the browser dialog to get a PDF." },
  codesLabel: { fr: "codes", nl: "codes", en: "codes" },
  usedLabel: { fr: "utilisés", nl: "gebruikt", en: "used" },
  availableLabel: { fr: "disponibles", nl: "beschikbaar", en: "available" },
  emptyTitle: { fr: "AUCUN QR CODE", nl: "GEEN QR-CODE", en: "NO QR CODE" },
  emptyDescription: { fr: "Générez votre premier batch de codes ci-dessus.", nl: "Genereer uw eerste batch codes hierboven.", en: "Generate your first batch of codes above." },
  selectAriaLabel: { fr: "Sélectionner {code}", nl: "Selecteer {code}", en: "Select {code}" },
  statusUsed: { fr: "Utilisé", nl: "Gebruikt", en: "Used" },
  statusFree: { fr: "Libre", nl: "Vrij", en: "Free" },
  confirmDelete: { fr: "Supprimer ce QR code ?", nl: "Deze QR-code verwijderen?", en: "Delete this QR code?" },
  unknownTitle: { fr: "QR INCONNU", nl: "ONBEKENDE QR", en: "UNKNOWN QR" },
  unknownDefault: { fr: "Aucun QR code ne correspond à ce lien.", nl: "Geen QR-code komt overeen met deze link.", en: "No QR code matches this link." },
  unassignedTitle: { fr: "QR NON ASSIGNÉ", nl: "NIET-TOEGEWEZEN QR", en: "UNASSIGNED QR" },
  unassignedDescription: { fr: "Ce QR code n'est associé à aucun objet pour l'instant. Scannez-le depuis votre app pour l'attribuer.", nl: "Deze QR-code is nog niet aan een object gekoppeld. Scan het vanuit uw app om het toe te wijzen.", en: "This QR code is not associated with any object yet. Scan it from your app to assign it." },
  chooseObjectTitle: { fr: "CHOISISSEZ L'OBJET", nl: "KIES HET OBJECT", en: "CHOOSE THE OBJECT" },
  assignDialogTitle: { fr: "ASSigner un QR code", nl: "Een QR-code toewijzen", en: "Assign a QR code" },
  assignDialogDescription: { fr: "Choisissez un QR code libre pour taguer {objectName}.", nl: "Kies een vrije QR-code om {objectName} te labelen.", en: "Choose a free QR code to tag {objectName}." },
  noAvailableCodes: { fr: "Aucun QR code libre disponible.", nl: "Geen beschikbare QR-codes.", en: "No available QR codes." },
  generateFromQrPage: { fr: "Générez-en de nouveaux depuis la page QR Codes.", nl: "Genereer nieuwe vanuit de QR-codes-pagina.", en: "Generate new ones from the QR Codes page." },
  createdOn: { fr: "Créé le {date}", nl: "Gemaakt op {date}", en: "Created on {date}" },
  freeLabel: { fr: "Libre", nl: "Vrij", en: "Free" },
  scannerTitle: { fr: "Scanner QR Code", nl: "QR-code scannen", en: "Scan QR Code" },
  scannerPositionHint: { fr: "Positionnez le QR code dans le cadre", nl: "Plaats de QR-code in het frame", en: "Position the QR code in the frame" },
  openCameraButton: { fr: "Ouvrir la caméra", nl: "Camera openen", en: "Open camera" },
  scanning: { fr: "Recherche du QR...", nl: "Op zoek naar QR...", en: "Searching for QR..." },
  detectedSuccess: { fr: "QR Code détecté !", nl: "QR-code gedetecteerd!", en: "QR Code detected!" },
  cameraError: { fr: "Erreur caméra", nl: "Camerafout", en: "Camera error" },
  retryButton: { fr: "Réessayer", nl: "Opnieuw proberen", en: "Retry" },
  scannerDistanceHint: { fr: "Tenez le QR code à une distance de 15-30 cm de la caméra", nl: "Houd de QR-code 15-30 cm van de camera verwijderd", en: "Hold the QR code 15-30 cm away from the camera" },
  popupAllowanceRequired: { fr: "Veuillez autoriser les popups pour l'impression.", nl: "Sta pop-ups toe voor afdrukken.", en: "Please allow popups for printing." },
  filterByName: { fr: "Rechercher par nom", nl: "Zoeken op naam", en: "Search by name" },
  searchPlaceholder: { fr: "Nom de l'objet...", nl: "Objectnaam...", en: "Object name..." },
  filterByCollection: { fr: "Collection", nl: "Collectie", en: "Collection" },
  allCollections: { fr: "Toutes les collections", nl: "Alle collecties", en: "All collections" },
  clearFilters: { fr: "Effacer les filtres", nl: "Filters wissen", en: "Clear filters" },
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

  // Backend error messages (résolus via translate()).
  collectionLimitReached: { fr: "Limite de {maxCollections} collections atteinte. Upgradez vers un plan supérieur pour continuer.", nl: "Limiet van {maxCollections} collecties bereikt. Upgrade naar een hoger plan om verder te gaan.", en: "Collection limit of {maxCollections} reached. Upgrade to a higher plan to continue." },
  collectionNotFound: { fr: "Collection non trouvée", nl: "Collectie niet gevonden", en: "Collection not found." },
  locationIncomplete: { fr: "Veuillez compléter votre localisation avant de poster une demande.", nl: "Vul uw locatie aan voordat u een aanvraag plaatst.", en: "Please complete your location before posting a request." },
  requestNotFound: { fr: "Demande introuvable", nl: "Aanvraag niet gevonden", en: "Request not found." },
  canOnlyCancelOwnRequest: { fr: "Vous ne pouvez annuler que vos propres demandes.", nl: "U kunt alleen uw eigen aanvragen annuleren.", en: "You can only cancel your own requests." },
  onlyOpenRequestsCanBeCancelled: { fr: "Seules les demandes ouvertes peuvent être annulées.", nl: "Alleen open aanvragen kunnen worden geannuleerd.", en: "Only open requests can be cancelled." },
  onlyOpenRequestsCanBeFulfilled: { fr: "Seules les demandes ouvertes peuvent être fulfill.", nl: "Alleen open aanvragen kunnen worden vervuld.", en: "Only open requests can be fulfilled." },
  contactNotFound: { fr: "Contact non trouvé", nl: "Contact niet gevonden", en: "Contact not found." },
  userNotFound: { fr: "Utilisateur non trouvé", nl: "Gebruiker niet gevonden", en: "User not found." },
  cannotAddYourself: { fr: "Vous ne pouvez pas vous ajouter vous-même", nl: "U kunt uzelf niet toevoegen", en: "You cannot add yourself." },
  emailAlreadyInUse: { fr: "Cet email est déjà utilisé par un compte Brol", nl: "Dit e-mailadres is al in gebruik door een Brol-account", en: "This email is already in use by a Brol account." },
  objectAlreadyLent: { fr: "Cet objet est déjà prêté.", nl: "Dit object is al uitgeleend.", en: "This object is already lent." },
  userNotFoundPeriod: { fr: "Utilisateur non trouvé.", nl: "Gebruiker niet gevonden.", en: "User not found." },
  cannotLendToYourself: { fr: "Vous ne pouvez pas vous prêter à vous-même.", nl: "U kunt niet aan uzelf uitlenen.", en: "You cannot lend to yourself." },
  contactNotFoundPeriod: { fr: "Contact non trouvé.", nl: "Contact niet gevonden.", en: "Contact not found." },
  cannotDetermineBorrower: { fr: "Impossible de déterminer l'emprunteur pour ce contact.", nl: "Kan de lener voor dit contact niet bepalen.", en: "Unable to determine borrower for this contact." },
  loanNotFoundOrReturned: { fr: "Prêt non trouvé ou déjà retourné.", nl: "Lening niet gevonden of al teruggebracht.", en: "Loan not found or already returned." },
  loanNotFoundOrBorrowerHasNoEmail: { fr: "Prêt non trouvé ou emprunteur sans compte (email non disponible).", nl: "Lening niet gevonden of lener zonder account (e-mail niet beschikbaar).", en: "Loan not found or borrower has no account (email not available)." },
  loanNotFound: { fr: "Prêt non trouvé.", nl: "Lening niet gevonden.", en: "Loan not found." },
  objectNotFound: { fr: "Objet non trouvé", nl: "Object niet gevonden", en: "Object not found." },
  ownerNotFound: { fr: "Propriétaire non trouvé", nl: "Eigenaar niet gevonden", en: "Owner not found." },
  notificationNotFound: { fr: "", nl: "", en: "Notification not found." },
  notificationAccessDenied: { fr: "", nl: "", en: "Access denied." },
  collectionNotFoundUnauthorized: { fr: "Collection non trouvée", nl: "Collectie niet gevonden", en: "Collection not found." },
  qrCodeNotAvailable: { fr: "QR code non disponible", nl: "QR-code niet beschikbaar", en: "QR code not available." },
  photoNotFound: { fr: "Photo non trouvée", nl: "Foto niet gevonden", en: "Photo not found." },
  qrObjectNotFound: { fr: "Objet non trouvé", nl: "Object niet gevonden", en: "Object not found." },
  objectAlreadyHasQR: { fr: "Cet objet a déjà un QR code assigné", nl: "Aan dit object is al een QR-code toegewezen", en: "This object already has a QR code assigned." },
  qrNotFound: { fr: "QR code non trouvé", nl: "QR-code niet gevonden", en: "QR code not found." },
  qrNotAvailableOrUsed: { fr: "QR code non disponible ou déjà utilisé", nl: "QR-code niet beschikbaar of al gebruikt", en: "QR code not available or already used." },
  threadAccessDenied: { fr: "Vous n'avez pas accès à ce thread.", nl: "U hebt geen toegang tot dit gesprek.", en: "You do not have access to this thread." },
  cannotInitiateMessage: { fr: "Aucun voisin n'a encore proposé son aide — vous ne pouvez pas écrire en premier.", nl: "Nog geen buur heeft hulp aangeboden — u kunt niet als eerste schrijven.", en: "No neighbor has offered help yet — you cannot write first." },
  cannotReviewYourself: { fr: "Vous ne pouvez pas vous noter vous-même.", nl: "U kunt uzelf niet beoordelen.", en: "You cannot review yourself." },
  noExchangeFound: { fr: "Aucun échange trouvé avec cet utilisateur.", nl: "Geen uitwisseling gevonden met deze gebruiker.", en: "No exchange found with this user." },
  reviewAlreadyExists: { fr: "Vous avez déjà laissé un avis pour cet échange.", nl: "U hebt al een beoordeling voor deze uitwisseling achtergelaten.", en: "You have already left a review for this exchange." },
  handleImmutable: { fr: "Le pseudo est définitif : il est utilisé dans les URLs publiques et les QR codes partagés.", nl: "De gebruikersnaam is definitief: deze wordt gebruikt in openbare URL's en gedeelde QR-codes.", en: "The handle is permanent: it is used in public URLs and shared QR codes." },
  postalCodeUnknown: { fr: "Code postal inconnu pour ce pays.", nl: "Postcode onbekend voor dit land.", en: "Postal code unknown for this country." },
  objectNotFoundOwned: { fr: "Objet non trouvé", nl: "Object niet gevonden", en: "Object not found." },
  collectionNotFoundOwned: { fr: "Collection non trouvée", nl: "Collectie niet gevonden", en: "Collection not found." },
  s3NotConfigured: { fr: "S3 non configuré. Définissez S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY dans .env", nl: "S3 niet geconfigureerd. Stel S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY in in .env", en: "S3 not configured. Define S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY in .env" },
  s3BucketNotConfigured: { fr: "S3_BUCKET non configuré dans .env", nl: "S3_BUCKET niet geconfigureerd in .env", en: "S3_BUCKET not configured in .env" },
  fileTypeNotAllowed: { fr: "Type de fichier non autorisé: {contentType}. Types acceptés: {allowedTypes}", nl: "Bestandstype niet toegestaan: {contentType}. Toegestane types: {allowedTypes}", en: "File type not allowed: {contentType}. Allowed types: {allowedTypes}" },
  fileTooLarge: { fr: "Fichier trop volumineux. Maximum: {maxSizeMB}MB", nl: "Bestand te groot. Maximum: {maxSizeMB}MB", en: "File too large. Maximum: {maxSizeMB}MB" },
  s3EndpointNotConfigured: { fr: "S3_ENDPOINT non configuré", nl: "S3_ENDPOINT niet geconfigureerd", en: "S3_ENDPOINT not configured" },
  // Self-service errors
  selfServiceNotEnabled: { fr: "L'auto-prêt n'est pas activé pour cet objet.", nl: "Zelf-uitlenen is niet ingeschakeld voor dit object.", en: "Self-borrowing is not enabled for this item." },
  selfServiceNotAllowed: { fr: "Vous n'êtes pas autorisé à vous auto-emprunter cet objet.", nl: "U mag dit object niet zelf lenen.", en: "You are not allowed to self-borrow this item." },
  selfServiceLocationRequired: { fr: "Vous devez avoir une localisation configurée pour utiliser l'auto-prêt en mode rayon.", nl: "U moet een locatie hebben geconfigureerd om zelf te lenen in radius-modus.", en: "You need to have a location configured to self-borrow in radius mode." },
  selfServiceOutOfRadius: { fr: "Vous êtes en dehors du rayon autorisé pour cet objet.", nl: "U bent buiten de toegestane straal voor dit object.", en: "You are outside the allowed radius for this item." },
  selfServiceWeeklyLimitReached: { fr: "Vous avez atteint votre limite d'auto-emprunts pour cette semaine.", nl: "U heeft uw limiet voor zelf-lenen deze week bereikt.", en: "You have reached your weekly self-borrow limit." },
  cannotBorrowOwnObject: { fr: "Vous ne pouvez pas empruntez votre propre objet.", nl: "U kunt niet uzelf lenen.", en: "You cannot borrow your own object." },
};

/**
 * Traductions pour les paramètres.
 */
export const settings = {
  title: { fr: "PARAMÈTRES", nl: "INSTELLINGEN", en: "SETTINGS" },
  myProfileTitle: { fr: "MON PROFIL", nl: "MIJN PROFIEL", en: "MY PROFILE" },
  noName: { fr: "Sans nom", nl: "Geen naam", en: "No name" },
  viewButton: { fr: "Voir", nl: "Bekijken", en: "View" },
  handleLabel: { fr: "Mon identifiant", nl: "Mijn identificatie", en: "My identifier" },
  copyHandleLabel: { fr: "Copier l'identifiant", nl: "Identificatie kopiëren", en: "Copy identifier" },
  showQrLabel: { fr: "Afficher le QR code", nl: "QR-code weergeven", en: "Show QR code" },
  handleHint: { fr: "Votre pseudo est définitif — il est utilisé dans les liens partagés (URL de profil, QR code).", nl: "Uw handle is permanent — deze wordt gebruikt in gedeelde links (profiel-URL, QR-code).", en: "Your handle is permanent — it is used in shared links (profile URL, QR code)." },
  scanQrHint: { fr: "Scannez pour m'ajouter comme ami", nl: "Scan om mij als vriend toe te voegen", en: "Scan to add me as a friend" },
  copiedSuccess: { fr: "Handle copié", nl: "Handle gekopieerd", en: "Handle copied" },
  copyError: { fr: "Impossible de copier", nl: "Kan niet kopiëren", en: "Unable to copy" },
  myPlanTitle: { fr: "MON PLAN", nl: "MIJN PLAN", en: "MY PLAN" },
  tier: {
    free: {
      feature1: { fr: "5 collections", nl: "5 collecties", en: "5 collections" },
      feature2: { fr: "50 objets", nl: "50 objecten", en: "50 objects" },
      feature3: { fr: "10 prêts simultanés", nl: "10 gelijktijdige leningen", en: "10 simultaneous loans" },
    },
    tier2: {
      feature1: { fr: "10 collections", nl: "10 collecties", en: "10 collections" },
      feature2: { fr: "500 objets", nl: "500 objecten", en: "500 objects" },
      feature3: { fr: "50 prêts simultanés", nl: "50 gelijktijdige leningen", en: "50 simultaneous loans" },
    },
    tier3: {
      feature1: { fr: "Collections illimitées", nl: "Onbeperkte collecties", en: "Unlimited collections" },
      feature2: { fr: "Objets illimités", nl: "Onbeperkte objecten", en: "Unlimited objects" },
      feature3: { fr: "Prêts illimités", nl: "Onbeperkte leningen", en: "Unlimited loans" },
    },
  },
  upgradeButton: { fr: "Upgrade", nl: "Upgrade", en: "Upgrade" },
  upgradeTitleAvailable: { fr: "UPGRADE DISPONIBLE", nl: "BESCHIKBARE UPGRADES", en: "AVAILABLE UPGRADES" },
  chooseTier2Button: { fr: "Choisir Tier 2", nl: "Kies Tier 2", en: "Choose Tier 2" },
  chooseTier3Button: { fr: "Choisir Tier 3", nl: "Kies Tier 3", en: "Choose Tier 3" },
  personalInfoTitle: { fr: "INFORMATIONS PERSONNELLES", nl: "PERSOONLIJKE INFORMATIE", en: "PERSONAL INFORMATION" },
  personalInfoHint: { fr: "Tout est optionnel et privé par défaut. Cochez \"Public\" pour rendre un champ visible sur votre profil.", nl: "Alles is optioneel en standaard privé. Vink \"Openbaar\" aan om een veld zichtbaar te maken op uw profiel.", en: "Everything is optional and private by default. Check \"Public\" to make a field visible on your profile." },
  birthYearLabel: { fr: "Année de naissance", nl: "Geboortejaar", en: "Birth year" },
  birthYearPlaceholder: { fr: "ex: 1985", nl: "bijv. 1985", en: "e.g. 1985" },
  genderLabel: { fr: "Genre", nl: "Geslacht", en: "Gender" },
  genderPlaceholder: { fr: "ex: F, H, X, ou autre", nl: "bijv. V, M, X, of ander", en: "e.g. F, M, X, or other" },
  phoneLabel: { fr: "Téléphone", nl: "Telefoon", en: "Phone" },
  phonePlaceholder: { fr: "+32 ...", nl: "+32 ...", en: "+32 ..." },
  cityNotSet: { fr: "Non renseignée", nl: "Niet ingesteld", en: "Not set" },
  cityLabel: { fr: "Ville", nl: "Stad", en: "City" },
  emailLabel: { fr: "Email", nl: "E-mail", en: "Email" },
  publicToggle: { fr: "Public", nl: "Openbaar", en: "Public" },
  perMonth: { fr: "/mois", nl: "/maand", en: "/month" },
  invalidYear: { fr: "Année invalide (1900 - {year}).", nl: "Ongeldig jaar (1900 - {year}).", en: "Invalid year (1900 - {year})." },
  profileUpdatedSuccess: { fr: "Profil mis à jour", nl: "Profiel bijgewerkt", en: "Profile updated" },
  profileUpdateError: { fr: "Erreur lors de la mise à jour", nl: "Fout bij bijwerken van profiel", en: "Error updating profile" },
  progressBarCollections: { fr: "Collections", nl: "Collecties", en: "Collections" },
  progressBarObjects: { fr: "Objets", nl: "Objecten", en: "Objects" },
  progressBarActiveLoans: { fr: "Prêts actifs", nl: "Actieve leningen", en: "Active loans" },
};

/**
 * Traductions pour les photos.
 */
export const photos = {
  invalidFileType: { fr: "Le fichier doit être une image (JPEG, PNG, WebP, GIF)", nl: "Bestand moet een afbeelding zijn (JPEG, PNG, WebP, GIF)", en: "File must be an image (JPEG, PNG, WebP, GIF)" },
  fileTooLarge: { fr: "Le fichier est trop volumineux. Maximum: 10 Mo.", nl: "Bestand is te groot. Maximum: 10 MB.", en: "File is too large. Maximum: 10 MB." },
  addPhotoButton: { fr: "Ajouter une photo", nl: "Voeg een foto toe", en: "Add a photo" },
  uploadFailed: { fr: "Upload échoué: {status} {statusText}", nl: "Upload mislukt: {status} {statusText}", en: "Upload failed: {status} {statusText}" },
  uploadError: { fr: "Erreur lors de l'upload", nl: "Uploadfout", en: "Upload error" },
  dialogTitle: { fr: "Ajouter une photo", nl: "Voeg een foto toe", en: "Add a photo" },
  fileTab: { fr: "Fichier", nl: "Bestand", en: "File" },
  cameraTab: { fr: "Caméra", nl: "Camera", en: "Camera" },
  selectImageHint: { fr: "Sélectionnez une image depuis votre appareil.", nl: "Selecteer een afbeelding van uw apparaat.", en: "Select an image from your device." },
  chooseFileButton: { fr: "Choisir un fichier", nl: "Kies een bestand", en: "Choose a file" },
  fileSupportedFormats: { fr: "JPEG, PNG, WebP, GIF • Max 10 Mo", nl: "JPEG, PNG, WebP, GIF • Max 10 MB", en: "JPEG, PNG, WebP, GIF • Max 10 MB" },
  takePictureHint: { fr: "Prenez une photo avec votre appareil.", nl: "Maak een foto met uw apparaat.", en: "Take a picture with your device." },
  openCameraButton: { fr: "Ouvrir la caméra", nl: "Camera openen", en: "Open camera" },
  rearCameraHint: { fr: "Caméra arrière sur mobile", nl: "Achtercamera op mobiel", en: "Rear camera on mobile" },
  previewLabel: { fr: "Aperçu", nl: "Voorbeeld", en: "Preview" },
  uploading: { fr: "Envoi en cours...", nl: "Uploaden...", en: "Uploading..." },
  photoAddedSuccess: { fr: "Photo ajoutée !", nl: "Foto toegevoegd!", en: "Photo added!" },
  retryButton: { fr: "Réessayer", nl: "Opnieuw proberen", en: "Retry" },
  galleryTitle: { fr: "Photos", nl: "Foto's", en: "Photos" },
  loadingError: { fr: "Erreur de chargement des photos.", nl: "Fout bij laden van foto's.", en: "Error loading photos." },
  emptyTitle: { fr: "Pas encore de photos", nl: "Nog geen foto's", en: "No photos yet" },
  emptyDescription: { fr: "Ajoutez une photo depuis votre appareil, votre caméra ou une recherche web.", nl: "Voeg een foto toe van uw apparaat, uw camera of een websearch.", en: "Add a photo from your device, your camera or a web search." },
  confirmDelete: { fr: "Confirmer ?", nl: "Bevestigen?", en: "Confirm?" },
};

/**
 * Traductions pour les emails (backend — résolus via translate()).
 */
export const emails = {
  reminderSubject: { fr: "Rappel : Pensez à retourner \"{objectName}\"", nl: "Herinnering: Vergeet niet terug te brengen \"{objectName}\"", en: "Reminder: Remember to return \"{objectName}\"" },
  reminderServiceDisabled: { fr: "Service de rappel désactivé (clé API non configurée)", nl: "Herinneringsservice uitgeschakeld (API-sleutel niet geconfigureerd)", en: "Reminder service disabled (API key not configured)" },
  reminderSendFailed: { fr: "Échec de l'envoi du rappel: {error}", nl: "Herinnering verzenden mislukt: {error}", en: "Failed to send reminder: {error}" },
  reminderSentSuccess: { fr: "Rappel envoyé à {borrowerName}", nl: "Herinnering verzonden naar {borrowerName}", en: "Reminder sent to {borrowerName}" },
  reminderSendError: { fr: "Erreur lors de l'envoi du rappel email", nl: "Fout bij verzenden herinneringsemail", en: "Error sending reminder email" },
  reminderGreeting: { fr: "Bonjour {borrowerName},", nl: "Hallo {borrowerName},", en: "Hello {borrowerName}," },
  reminderIntro: { fr: "{ownerName} vous envoie un rappel concernant un prêt.", nl: "{ownerName} stuurt u een herinnering over een uitlening.", en: "{ownerName} is sending you a reminder about a loan." },
  reminderBorrowedObjectLabel: { fr: "OBJET EMPRUNTÉ", nl: "GELEEND OBJECT", en: "BORROWED OBJECT" },
  reminderExpectedReturnDate: { fr: "DATE DE RETOUR ATTENDUE: {returnDueDate}", nl: "VERWACHTE RETOURDATE: {returnDueDate}", en: "EXPECTED RETURN DATE: {returnDueDate}" },
  reminderReturnRequest: { fr: "Merci de bien vouloir retourner cet objet à {ownerName}.", nl: "Breng dit object alstublieft terug naar {ownerName}.", en: "Please return this item to {ownerName}." },
  reminderOpenBrolButton: { fr: "Ouvrir BROL", nl: "BROL openen", en: "Open BROL" },
  reminderTextTitle: { fr: "BROL — RAPPEL DE PRÊT", nl: "BROL — HERINNERINGSBRIEF LENEN", en: "BROL — LOAN REMINDER" },
  reminderTextObject: { fr: "OBJET: {objectName}", nl: "OBJECT: {objectName}", en: "OBJECT: {objectName}" },
  reminderTextLoanDate: { fr: "DATE DU PRÊT: {lentAt}", nl: "UITLEENDATUM: {lentAt}", en: "LOAN DATE: {lentAt}" },
  reminderTextExpectedReturnDate: { fr: "DATE DE RETOUR ATTENDUE: {returnDueDate}", nl: "VERWACHTE RETOURDATE: {returnDueDate}", en: "EXPECTED RETURN DATE: {returnDueDate}" },
  ownerContactObjectNotFound: { fr: "Objet non trouvé", nl: "Object niet gevonden", en: "Object not found" },
  ownerContactOwnerNotFound: { fr: "Propriétaire non trouvé", nl: "Eigenaar niet gevonden", en: "Owner not found" },
  ownerContactSubject: { fr: "Nouveau message pour \"{objectName}\"", nl: "Nieuw bericht voor \"{objectName}\"", en: "New message for \"{objectName}\"" },
  ownerContactFromLabel: { fr: "De:", nl: "Van:", en: "From:" },
  ownerContactCollectionLabel: { fr: "Collection:", nl: "Collectie:", en: "Collection:" },
  ownerContactViewObjectButton: { fr: "Voir l'objet sur Brol", nl: "Object op Brol bekijken", en: "View object on Brol" },
  ownerContactFooter: { fr: "Cet email a été envoyé via Brol. Vous pouvez répondre directement à {fromEmail}.", nl: "Deze e-mail is via Brol verstuurd. U kunt direct antwoorden op {fromEmail}.", en: "This email was sent via Brol. You can reply directly to {fromEmail}." },
  ownerContactEmailSubject: { fr: "[Brol] Message pour votre objet \"{objectName}\"", nl: "[Brol] Bericht voor uw object \"{objectName}\"", en: "[Brol] Message for your object \"{objectName}\"" },
  requestMessageSubject: { fr: "Nouveau message sur Brol", nl: "Nieuw bericht op Brol", en: "New message on Brol" },
  requestMessageGreeting: { fr: "Bonjour {toName},", nl: "Hallo {toName},", en: "Hello {toName}," },
  requestMessageIntro: { fr: "{fromName} vous a écrit à propos de votre demande \"{requestTitle}\".", nl: "{fromName} heeft u geschreven over uw verzoek \"{requestTitle}\".", en: "{fromName} wrote to you about your request \"{requestTitle}\"." },
  requestMessageOpenConversationButton: { fr: "Ouvrir la conversation", nl: "Gesprek openen", en: "Open conversation" },
  requestMessageFooter: { fr: "Email envoyé via Brol. Pour répondre, ouvrez la conversation directement dans l'app — votre email ne sera pas partagé.", nl: "E-mail verzonden via Brol. Om te antwoorden, opent u het gesprek rechtstreeks in de app — uw e-mail wordt niet gedeeld.", en: "Email sent via Brol. To reply, open the conversation directly in the app — your email will not be shared." },
  requestMessageEmailSubject: { fr: "[Brol] {fromName} : \"{requestTitle}\"", nl: "[Brol] {fromName}: \"{requestTitle}\"", en: "[Brol] {fromName}: \"{requestTitle}\"" },
};

/**
 * Traductions pour les notifications (backend — résolues via translate()).
 */
export const notifications = {
  requestMessageTitle: { fr: "Nouveau message pour \"{requestTitle}\"", nl: "Nieuw bericht voor \"{requestTitle}\"", en: "New message for \"{requestTitle}\"" },
  requestMessageMessage: { fr: "{senderName} : {preview}", nl: "{senderName}: {preview}", en: "{senderName}: {preview}" },
  communityRequestNotFound: { fr: "Demande introuvable", nl: "Verzoek niet gevonden", en: "Request not found" },
  communityRequestTitle: { fr: "Un voisin recherche un objet", nl: "Een buur zoekt een object", en: "A neighbor is looking for an item" },
  communityRequestMessage: { fr: "{requesterName} cherche \"{searchTitle}\" près de chez vous (≈ {distance} km). Vous avez \"{matchObjectName}\".", nl: "{requesterName} zoekt \"{searchTitle}\" in uw buurt (≈ {distance} km). U hebt \"{matchObjectName}\".", en: "{requesterName} is looking for \"{searchTitle}\" near you (≈ {distance} km). You have \"{matchObjectName}\"." },
  requestFulfilledTitle: { fr: "Votre demande a été traitée", nl: "Uw verzoek is voltooid", en: "Your request has been fulfilled" },
  requestFulfilledMessage: { fr: "Quelqu'un a répondu à votre demande: \"{requestTitle}\"", nl: "Iemand heeft op uw verzoek geantwoord: \"{requestTitle}\"", en: "Someone has responded to your request: \"{requestTitle}\"" },
  newLoanTitle: { fr: "Nouvel emprunt", nl: "Nieuwe uitlening", en: "New loan" },
  newLoanMessage: { fr: "{objectName} vous a été prêté. Retour prévu: {returnDueDate}.", nl: "{objectName} is u uitgeleend. Terugbrengen voorzien: {returnDueDate}.", en: "{objectName} has been lent to you. Return expected: {returnDueDate}." },
  selfBorrowTitle: { fr: "Auto-emprunt", nl: "Zelf-uitlening", en: "Self-borrow" },
  selfBorrowMessage: { fr: "{borrowerName} s'est auto-emprunté \"{objectName}\".", nl: "{borrowerName} heeft zichzelf \"{objectName}\" geleend.", en: "{borrowerName} has self-borrowed \"{objectName}\"." },
  reviewReceivedTitle: { fr: "Nouvel avis de {reviewerName}", nl: "Nieuwe recensie van {reviewerName}", en: "New review from {reviewerName}" },
  reviewReceivedMessageWithComment: { fr: "\"{comment}\"", nl: "\"{comment}\"", en: "\"{comment}\"" },
  reviewReceivedMessageWithoutComment: { fr: "{rating}/5 étoiles", nl: "{rating}/5 sterren", en: "{rating}/5 stars" },
};

export const badges = {
  title: { fr: "Badges", nl: "Badges", en: "Badges" },
  myBadges: { fr: "Mes badges", nl: "Mijn badges", en: "My badges" },
  allBadges: { fr: "Tous les badges", nl: "Alle badges", en: "All badges" },
  earned: { fr: "Décroché", nl: "Verdiend", en: "Earned" },
  locked: { fr: "Verrouillés", nl: "Vergrendeld", en: "Locked" },
  noBadges: { fr: "Aucun badge encore", nl: "Nog geen badges", en: "No badges yet" },
  noBadgesDescription: { fr: "Continuez à utiliser Brol pour en décrocher !", nl: "Blijf Brol gebruiken om er te verdienen!", en: "Keep using Brol to earn some!" },
  myProgress: { fr: "// MON PROGRÈS", nl: "// MIJN VOORUITGANG", en: "// MY PROGRESS" },
  category: {
    all: { fr: "Tous", nl: "Alle", en: "All" },
    CINEMA: { fr: "Cinéma/VHS", nl: "Film/VHS", en: "Cinema/VHS" },
    LITERATURE: { fr: "Littérature", nl: "Literatuur", en: "Literature" },
    GAMING: { fr: "Jeux vidéo", nl: "Videogames", en: "Gaming" },
    TV: { fr: "TV/Séries", nl: "TV/Series", en: "TV/Series" },
    HARDWARE: { fr: "Hardware", nl: "Hardware", en: "Hardware" },
    TABLETOP: { fr: "Board games", nl: "Bordspellen", en: "Board games" },
    ACCOMPLISHMENTS: { fr: "Accomplissements", nl: "Prestaties", en: "Accomplishments" },
    SPECIAL: { fr: "Spéciaux", nl: "Speciaal", en: "Special" },
  },
  rarity: {
    all: { fr: "Toutes rarités", nl: "Alle zeldzaamheden", en: "All rarities" },
    COMMON: { fr: "Commun", nl: "Algemeen", en: "Common" },
    UNCOMMON: { fr: "Peu commun", nl: "Ongewoon", en: "Uncommon" },
    RARE: { fr: "Rare", nl: "Zeldzaam", en: "Rare" },
    EPIC: { fr: "Épique", nl: "Episch", en: "Epic" },
    LEGENDARY: { fr: "Légendaire", nl: "Legendarisch", en: "Legendary" },
  },
  howToUnlock: { fr: "Comment débloquer ?", nl: "Hoe te ontgrendelen?", en: "How to unlock?" },
  earnedOn: { fr: "Décroché le", nl: "Verdiend op", en: "Earned on" },
};

/**
 * Abonnements / facturation (page `/billing`, web).
 */
export const billing = {
  title: { fr: "ABONNEMENT", nl: "ABONNEMENT", en: "SUBSCRIPTION" },
  currentPlan: { fr: "Plan actuel", nl: "Huidig plan", en: "Current plan" },
  choosePlan: { fr: "CHOISIR UN PLAN", nl: "KIES EEN PLAN", en: "CHOOSE A PLAN" },
  subscribe: { fr: "S'abonner", nl: "Abonneren", en: "Subscribe" },
  cancelSubscription: { fr: "Annuler l'abonnement", nl: "Abonnement opzeggen", en: "Cancel subscription" },
  cancelConfirm: {
    fr: "Annuler l'abonnement ? Votre plan reste actif jusqu'à la fin de la période payée.",
    nl: "Abonnement opzeggen? Uw plan blijft actief tot het einde van de betaalde periode.",
    en: "Cancel the subscription? Your plan stays active until the end of the paid period.",
  },
  canceled: { fr: "Abonnement annulé", nl: "Abonnement opgezegd", en: "Subscription canceled" },
  activeUntil: { fr: "Actif jusqu'au {date}", nl: "Actief tot {date}", en: "Active until {date}" },
  checkoutError: {
    fr: "Impossible de démarrer le paiement.",
    nl: "Kan de betaling niet starten.",
    en: "Unable to start the payment.",
  },
  notConfigured: {
    fr: "Le paiement n'est pas encore activé sur ce serveur. Réessayez plus tard.",
    nl: "Betaling is nog niet ingeschakeld op deze server. Probeer het later opnieuw.",
    en: "Payment is not yet enabled on this server. Please try again later.",
  },
  return: {
    processing: { fr: "Paiement en cours…", nl: "Betaling wordt verwerkt…", en: "Processing payment…" },
    processingDetail: {
      fr: "Confirmation de votre paiement, un instant.",
      nl: "Uw betaling wordt bevestigd, een ogenblik.",
      en: "Confirming your payment, one moment.",
    },
    stillProcessing: {
      fr: "Ça prend un peu plus longtemps que prévu. Vous pouvez fermer cette page — votre plan sera mis à jour dès confirmation.",
      nl: "Dit duurt iets langer dan verwacht. U kunt deze pagina sluiten — uw plan wordt bijgewerkt zodra het bevestigd is.",
      en: "This is taking a bit longer than expected. You can close this page — your plan will update once confirmed.",
    },
    success: { fr: "Abonnement actif !", nl: "Abonnement actief!", en: "Subscription active!" },
    successDetail: {
      fr: "Vous êtes maintenant en {tier}.",
      nl: "U zit nu op {tier}.",
      en: "You are now on {tier}.",
    },
    backToSettings: { fr: "Retour aux paramètres", nl: "Terug naar instellingen", en: "Back to settings" },
    backToBilling: { fr: "Retour à l'abonnement", nl: "Terug naar abonnement", en: "Back to subscription" },
  },
};

// ===========================================================================
// Adapter — source de vérité unique projetée vers next-intl (web), i18next
// (mobile) et le backend. Chaque feuille du catalogue est un objet
// { fr, nl, en } ; `project(locale)` aplatit l'arbre en ne gardant que la
// chaîne de la locale demandée.
// ===========================================================================

/** Locale par défaut (cf. User.locale dans le schema). */
export const DEFAULT_LOCALE: Locale = "fr";

/** Catalogue agrégé — l'unique source de vérité multi-locale. */
export const catalog = {
  common,
  nav,
  auth,
  dashboard,
  language,
  theme,
  messages,
  collections,
  objects,
  loans,
  contacts,
  qrCodes,
  publicScan,
  errors,
  settings,
  billing,
  photos,
  emails,
  notifications,
  badges,
} as const;

/** Valide une string arbitraire comme Locale (fallback défaut sinon). */
export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

type TranslationLeaf = { fr: string; nl?: string; en?: string } & Record<string, string>;
type CatalogNode = TranslationLeaf | { [key: string]: CatalogNode };

function isLeaf(node: CatalogNode): node is TranslationLeaf {
  return (
    typeof node === "object" &&
    node !== null &&
    "fr" in node &&
    typeof (node as Record<string, unknown>).fr === "string"
  );
}

/**
 * Projette récursivement l'arbre `{ fr, nl, en }` en un catalogue plat pour
 * une seule locale (chaînes feuilles). Les clés `*_plural` (héritage i18next)
 * sont ignorées — next-intl gère les pluriels via ICU. Fallback sur `fr` si
 * la traduction manque pour la locale.
 */
function projectNode(node: CatalogNode, locale: Locale): unknown {
  if (isLeaf(node)) {
    return node[locale] ?? node.fr;
  }
  const out: Record<string, unknown> = {};
  for (const [key, child] of Object.entries(node)) {
    if (key.endsWith("_plural")) continue;
    out[key] = projectNode(child as CatalogNode, locale);
  }
  return out;
}

/**
 * Catalogue de messages pour next-intl, projeté sur `locale`.
 * Usage côté web : `getRequestConfig` → `{ messages: getMessages(locale) }`.
 */
export function getMessages(locale: Locale): Record<string, unknown> {
  return projectNode(catalog as unknown as CatalogNode, locale) as Record<string, unknown>;
}

/**
 * Ressources i18next pour mobile : `{ fr: { translation }, nl: {...}, en: {...} }`.
 * Note : i18next doit être configuré avec des délimiteurs d'interpolation
 * `{`/`}` (et non `{{`/`}}`) pour rester compatible avec les chaînes ICU
 * single-brace utilisées ici. Cf. increment mobile.
 */
export function getI18nextResources(): Record<Locale, { translation: Record<string, unknown> }> {
  return LOCALES.reduce(
    (acc, locale) => {
      acc[locale] = { translation: getMessages(locale) };
      return acc;
    },
    {} as Record<Locale, { translation: Record<string, unknown> }>,
  );
}

/**
 * Traduction côté serveur (backend) — résout une clé pointée dans le catalogue
 * pour une `locale` donnée, avec interpolation ICU single-brace `{var}`.
 *
 * Usage : `translate(ctx.locale, "errors.collectionNotFound")` ou
 * `translate(locale, "errors.collectionLimitReached", { maxCollections: 5 })`.
 * Fallback : `fr` si la locale manque pour la clé, puis la clé brute si la
 * clé est introuvable (jamais d'exception — un message vaut mieux qu'un crash).
 */
export function translate(
  locale: Locale,
  dottedKey: string,
  vars?: Record<string, string | number>,
): string {
  let node: unknown = catalog;
  for (const seg of dottedKey.split(".")) {
    if (node && typeof node === "object" && seg in (node as Record<string, unknown>)) {
      node = (node as Record<string, unknown>)[seg];
    } else {
      return dottedKey;
    }
  }
  if (!node || typeof node !== "object") return dottedKey;
  const leaf = node as Record<string, string>;
  let str = leaf[locale] ?? leaf.fr;
  if (typeof str !== "string") return dottedKey;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.split(`{${k}}`).join(String(v));
    }
  }
  return str;
}
