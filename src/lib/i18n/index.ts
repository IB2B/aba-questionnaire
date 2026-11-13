export type Lang = "it" | "en"

export const LANGS: Lang[] = ["it", "en"]
export const DEFAULT_LANG: Lang = "it"
export const LANG_COOKIE = "lang"

/** A string in both languages. */
export type I18n = { it: string; en: string }

export function t(value: I18n, lang: Lang): string
export function t(value: I18n | undefined, lang: Lang): string | undefined
export function t(value: I18n | undefined, lang: Lang): string | undefined {
  return value?.[lang]
}

export function isLang(value: unknown): value is Lang {
  return value === "it" || value === "en"
}

/** Every string the interface itself needs. */
export const UI = {
  // navigation
  back: { it: "Indietro", en: "Back" },
  next: { it: "Avanti", en: "Next" },
  review: { it: "Rivedi", en: "Review" },
  submit: { it: "Invia le risposte", en: "Submit answers" },
  edit: { it: "Modifica", en: "Edit" },
  stepOf: { it: "Passo {current} di {total}", en: "Step {current} of {total}" },

  // saving
  saving: { it: "Salvataggio…", en: "Saving…" },
  saved: { it: "Progressi salvati", en: "Progress saved" },
  saveFailed: {
    it: "Non è stato possibile salvare i tuoi progressi.",
    en: "Could not save your progress.",
  },

  // validation
  fillRequired: {
    it: "Compila i campi obbligatori",
    en: "Please fill in the required fields",
  },
  missingInSection: {
    it: "Manca qualcosa in “{section}”.",
    en: "Something is missing in “{section}”.",
  },
  submitFailed: {
    it: "Non è stato possibile inviare le risposte.",
    en: "Could not submit your answers.",
  },
  alreadySubmitted: {
    it: "Il questionario è già stato inviato e non è più modificabile.",
    en: "This questionnaire has already been submitted and can no longer be edited.",
  },
  stillIncomplete: {
    it: "Alcune domande obbligatorie sono ancora vuote.",
    en: "Some required questions are still empty.",
  },

  // review
  reviewTitle: { it: "Rivedi le tue risposte", en: "Review your answers" },
  reviewIntro: {
    it: "Dai un'ultima occhiata. Puoi ancora tornare indietro e cambiare qualsiasi cosa — dopo l'invio il modulo si blocca.",
    en: "Have a last look. You can still go back and change anything — after you submit, the form locks.",
  },

  // confirmation
  doneTitle: { it: "Fatto — grazie!", en: "All done — thank you!" },
  doneBody: {
    it: "Abbiamo tutto quello che ci serve per iniziare a configurare la tua piattaforma white-label. Ti contatteremo a breve e ti scriveremo qui se manca qualcosa.",
    en: "We have everything we need to start building your white-label setup. We will be in touch shortly, and will reach out here if anything is missing.",
  },
  whatYouSent: { it: "Quello che ci hai inviato", en: "What you sent us" },

  // fields
  optional: { it: "(facoltativo)", en: "(optional)" },
  required: { it: "obbligatorio", en: "required" },
  notAnswered: { it: "Non risposto", en: "Not answered" },
  none: { it: "Nessuno", en: "None" },
  yes: { it: "Sì", en: "Yes" },
  no: { it: "No", en: "No" },
  choose: { it: "Scegli un'opzione", en: "Choose an option" },
  chooseShort: { it: "Scegli", en: "Choose" },
  addRow: { it: "Aggiungi", en: "Add a row" },
  removeRow: { it: "Rimuovi la riga {n}", en: "Remove row {n}" },
  addColour: { it: "Aggiungi colore", en: "Add colour" },
  removeColour: { it: "Rimuovi il colore {n}", en: "Remove colour {n}" },
  colourN: { it: "Colore {n}", en: "Colour {n}" },
  uploadFile: { it: "Carica un file", en: "Upload a file" },
  uploading: { it: "Caricamento…", en: "Uploading…" },
  orLink: { it: "oppure link", en: "or link" },
  removeFile: { it: "Rimuovi il file", en: "Remove file" },
  uploadTooBig: {
    it: "Il file supera i 10 MB — incolla un link invece.",
    en: "That file is larger than 10 MB — paste a link instead.",
  },
  uploadFailed: {
    it: "Caricamento non riuscito — puoi incollare un link.",
    en: "Upload failed — you can paste a link instead.",
  },

  // auth
  signIn: { it: "Accedi", en: "Sign in" },
  signOut: { it: "Esci", en: "Sign out" },
  welcomeBack: { it: "Bentornato", en: "Welcome back" },
  signInSubtitle: {
    it: "Accedi per continuare il questionario di onboarding.",
    en: "Sign in to continue your onboarding questionnaire.",
  },
  email: { it: "Email", en: "Email" },
  password: { it: "Password", en: "Password" },
  showPassword: { it: "Mostra la password", en: "Show password" },
  hidePassword: { it: "Nascondi la password", en: "Hide password" },
  accountsByAba: {
    it: "Gli account sono creati da ABA. Scrivici se ti serve l'accesso.",
    en: "Accounts are created by ABA. Contact us if you need access.",
  },
  enterEmailPassword: {
    it: "Inserisci email e password.",
    en: "Enter your email and password.",
  },
  yourAccount: { it: "Il tuo account", en: "Your account" },
  accountMenu: { it: "Menu account", en: "Account menu" },
  toggleTheme: { it: "Cambia tema", en: "Toggle theme" },
  language: { it: "Lingua", en: "Language" },

  // admin
  responses: { it: "Risposte", en: "Responses" },
  allResponses: { it: "Tutte le risposte", en: "All responses" },
  noResponsesYet: {
    it: "Nessun cliente ha ancora iniziato il questionario.",
    en: "No clients have started the questionnaire yet.",
  },
  responsesCount: {
    it: "{submitted} inviate su {total} iniziate.",
    en: "{submitted} submitted of {total} started.",
  },
  emptyAdminHint: {
    it: "Appena un cliente inizia a rispondere, la sua risposta compare qui.",
    en: "Once a client starts answering, their response shows up here.",
  },
  colClient: { it: "Cliente", en: "Client" },
  colCompany: { it: "Azienda", en: "Company" },
  colStatus: { it: "Stato", en: "Status" },
  colProgress: { it: "Avanzamento", en: "Progress" },
  colUpdated: { it: "Aggiornato", en: "Updated" },
  statusSubmitted: { it: "Inviata", en: "Submitted" },
  statusInProgress: { it: "In corso", en: "In progress" },
  openResponse: { it: "Apri la risposta", en: "Open response" },
  submittedOn: { it: "Inviata il {date}", en: "Submitted {date}" },
  updatedOn: { it: "Ultimo aggiornamento {date}", en: "Last updated {date}" },

  // email
  emailSubject: {
    it: "Questionario di onboarding inviato — {who}",
    en: "Onboarding questionnaire submitted — {who}",
  },
} satisfies Record<string, I18n>

export type UiKey = keyof typeof UI

/** Look up an interface string, filling `{placeholders}`. */
export function ui(
  key: UiKey,
  lang: Lang,
  vars?: Record<string, string | number>
): string {
  let text = UI[key][lang]
  if (vars) {
    for (const [name, value] of Object.entries(vars)) {
      text = text.replaceAll(`{${name}}`, String(value))
    }
  }
  return text
}
