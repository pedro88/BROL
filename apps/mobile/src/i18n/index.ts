/**
 * Configuration i18n pour Expo/React Native.
 * @package @brol/mobile
 */

import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";

/**
 * Traductions inline (simplifié pour éviter les imports JSON).
 * @decisions En production, utiliser un bundler qui supporte les JSON imports.
 */
const resources = {
  fr: {
    translation: {
      common: {
        submit: "Envoyer",
        cancel: "Annuler",
        save: "Enregistrer",
        delete: "Supprimer",
        edit: "Modifier",
        create: "Créer",
        scan: "Scanner",
        search: "Rechercher",
        loading: "Chargement...",
      },
      nav: {
        home: "Accueil",
        collections: "Collections",
        objects: "Objets",
        loans: "Prêts",
        contacts: "Contacts",
      },
      auth: {
        signIn: "Connexion",
        signOut: "Déconnexion",
        email: "Email",
        password: "Mot de passe",
      },
      collections: {
        title: "Mes collections",
        create: "Créer une collection",
        empty: "Aucune collection",
        emptyDescription: "Créez votre première collection",
      },
      objects: {
        title: "Mes objets",
        add: "Ajouter un objet",
        empty: "Aucun objet",
      },
      loans: {
        title: "Mes prêts",
        lend: "Prêter",
        return: "Retour",
        empty: "Aucun prêt",
      },
      contacts: {
        title: "Mes contacts",
        add: "Ajouter un contact",
        empty: "Aucun contact",
      },
      qrCodes: {
        title: "Mes QR codes",
        generate: "Générer",
        print: "Imprimer",
      },
    },
  },
  nl: {
    translation: {
      common: {
        submit: "Verzenden",
        cancel: "Annuleren",
        save: "Opslaan",
        delete: "Verwijderen",
        edit: "Bewerken",
        create: "Maken",
        scan: "Scannen",
        search: "Zoeken",
        loading: "Laden...",
      },
      nav: {
        home: "Start",
        collections: "Collecties",
        objects: "Objecten",
        loans: "Leningen",
        contacts: "Contacten",
      },
    },
  },
  en: {
    translation: {
      common: {
        submit: "Submit",
        cancel: "Cancel",
        save: "Save",
        delete: "Delete",
        edit: "Edit",
        create: "Create",
        scan: "Scan",
        search: "Search",
        loading: "Loading...",
      },
      nav: {
        home: "Home",
        collections: "Collections",
        objects: "Objects",
        loans: "Loans",
        contacts: "Contacts",
      },
    },
  },
};

/**
 * Langue par défaut.
 */
const defaultLanguage = "fr";

/**
 * Langue du dispositif.
 */
const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? defaultLanguage;

/**
 * Initialisation de i18n.
 */
i18n.use(initReactI18next).init({
  resources,
  lng: deviceLanguage,
  fallbackLng: defaultLanguage,
  interpolation: {
    escapeValue: false,
  },
  compatibilityJSON: "v4",
});

export default i18n;
