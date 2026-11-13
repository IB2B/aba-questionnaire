/**
 * The questionnaire definition — GoHighLevel white-label onboarding,
 * adapted for an Italian company.
 *
 * This is the only file you edit to change what clients are asked. The form,
 * the validation, the progress bar, the review step, the admin screen and the
 * summary email all read from it.
 *
 * Every visible string is `{ it, en }`. Italian is the default.
 *
 * Each question has a stable `id`. That id is the key the answer is stored
 * under in `responses.answers`, so renaming one orphans existing answers —
 * add a new question instead.
 */

import type { I18n } from "@/lib/i18n"

export type QuestionType =
  | "text"
  | "textarea"
  | "email"
  | "url"
  | "tel"
  | "number"
  | "date"
  | "radio"
  | "checkbox"
  | "select"
  | "toggle"
  | "color"
  | "file"
  | "repeater"
  | "consent"

/** Country-specific formats checked on top of the base type. */
export type Format = "partita_iva" | "codice_fiscale" | "cap" | "sdi"

export type Choice = { value: string; label: I18n }

/**
 * Build a dropdown's options out of an earlier answer — a repeater's rows
 * (naming the column with `field`) or a checkbox answer's selected labels.
 */
export type ChoiceSource = { questionId: string; field?: string }

/** A column inside a repeatable question. */
export type RepeaterField = {
  id: string
  label: I18n
  type: "text" | "email" | "number" | "select" | "textarea" | "tel"
  placeholder?: I18n
  required?: boolean
  choices?: Choice[]
  choicesFrom?: ChoiceSource[]
}

/**
 * Show this question only when another answer matches.
 * `equals` compares directly; `includes` tests membership in a checkbox answer.
 */
export type ShowIf = {
  questionId: string
  equals?: string | number | boolean
  includes?: string
}

/**
 * An escape hatch rendered as a checkbox under the field.
 * While it is ticked the field is disabled and its `required` flag is waived.
 */
export type OptOut = { id: string; label: I18n }

export type Question = {
  id: string
  type: QuestionType
  label: I18n
  help?: I18n
  /** Shown as a highlighted note under the field. */
  note?: I18n
  placeholder?: I18n
  required?: boolean
  /** Extra format check — Partita IVA, CAP, and friends. */
  format?: Format
  /** radio / checkbox / select */
  choices?: Choice[]
  /** Options taken from earlier answers, appended after `choices`. */
  choicesFrom?: ChoiceSource[]
  /** Pre-filled when the client first opens the form. */
  defaultValue?: string | number | boolean
  /** number */
  min?: number
  max?: number
  /** color — allow more than one swatch */
  multiple?: boolean
  /** repeater */
  fields?: RepeaterField[]
  addLabel?: I18n
  /** consent — a link rendered under the checkbox label */
  linkUrl?: string
  linkLabel?: I18n
  showIf?: ShowIf
  /** Visible when ANY of these match — use instead of `showIf`, not with it. */
  showIfAny?: ShowIf[]
  /** Renders a titled divider above this question, opening a group. */
  groupTitle?: I18n
  optOut?: OptOut
}

export type Section = {
  id: string
  title: I18n
  description?: I18n
  questions: Question[]
}

// ---------------------------------------------------------------- option sets

/** Same label in both languages — place names, brands, codes. */
const same = (text: string): I18n => ({ it: text, en: text })

const PROVINCE_LIST: [string, string][] = [
  ["AG", "Agrigento"], ["AL", "Alessandria"], ["AN", "Ancona"], ["AO", "Aosta"],
  ["AR", "Arezzo"], ["AP", "Ascoli Piceno"], ["AT", "Asti"], ["AV", "Avellino"],
  ["BA", "Bari"], ["BT", "Barletta-Andria-Trani"], ["BL", "Belluno"],
  ["BN", "Benevento"], ["BG", "Bergamo"], ["BI", "Biella"], ["BO", "Bologna"],
  ["BZ", "Bolzano"], ["BS", "Brescia"], ["BR", "Brindisi"], ["CA", "Cagliari"],
  ["CL", "Caltanissetta"], ["CB", "Campobasso"], ["CE", "Caserta"],
  ["CT", "Catania"], ["CZ", "Catanzaro"], ["CH", "Chieti"], ["CO", "Como"],
  ["CS", "Cosenza"], ["CR", "Cremona"], ["KR", "Crotone"], ["CN", "Cuneo"],
  ["EN", "Enna"], ["FM", "Fermo"], ["FE", "Ferrara"], ["FI", "Firenze"],
  ["FG", "Foggia"], ["FC", "Forlì-Cesena"], ["FR", "Frosinone"],
  ["GE", "Genova"], ["GO", "Gorizia"], ["GR", "Grosseto"], ["IM", "Imperia"],
  ["IS", "Isernia"], ["AQ", "L'Aquila"], ["SP", "La Spezia"], ["LT", "Latina"],
  ["LE", "Lecce"], ["LC", "Lecco"], ["LI", "Livorno"], ["LO", "Lodi"],
  ["LU", "Lucca"], ["MC", "Macerata"], ["MN", "Mantova"],
  ["MS", "Massa-Carrara"], ["MT", "Matera"], ["ME", "Messina"],
  ["MI", "Milano"], ["MO", "Modena"], ["MB", "Monza e Brianza"],
  ["NA", "Napoli"], ["NO", "Novara"], ["NU", "Nuoro"], ["OR", "Oristano"],
  ["PD", "Padova"], ["PA", "Palermo"], ["PR", "Parma"], ["PV", "Pavia"],
  ["PG", "Perugia"], ["PU", "Pesaro e Urbino"], ["PE", "Pescara"],
  ["PC", "Piacenza"], ["PI", "Pisa"], ["PT", "Pistoia"], ["PN", "Pordenone"],
  ["PZ", "Potenza"], ["PO", "Prato"], ["RG", "Ragusa"], ["RA", "Ravenna"],
  ["RC", "Reggio Calabria"], ["RE", "Reggio Emilia"], ["RI", "Rieti"],
  ["RN", "Rimini"], ["RM", "Roma"], ["RO", "Rovigo"], ["SA", "Salerno"],
  ["SS", "Sassari"], ["SV", "Savona"], ["SI", "Siena"], ["SR", "Siracusa"],
  ["SO", "Sondrio"], ["SU", "Sud Sardegna"], ["TA", "Taranto"],
  ["TE", "Teramo"], ["TR", "Terni"], ["TO", "Torino"], ["TP", "Trapani"],
  ["TN", "Trento"], ["TV", "Treviso"], ["TS", "Trieste"], ["UD", "Udine"],
  ["VA", "Varese"], ["VE", "Venezia"], ["VB", "Verbano-Cusio-Ossola"],
  ["VC", "Vercelli"], ["VR", "Verona"], ["VV", "Vibo Valentia"],
  ["VI", "Vicenza"], ["VT", "Viterbo"],
]

const PROVINCES: Choice[] = PROVINCE_LIST.map(([code, name]) => ({
  value: code,
  label: same(`${code} — ${name}`),
}))

const LEGAL_FORMS: Choice[] = [
  { value: "srl", label: same("SRL") },
  { value: "srls", label: same("SRLS") },
  { value: "spa", label: same("SPA") },
  { value: "sas", label: same("SAS") },
  { value: "snc", label: same("SNC") },
  {
    value: "ditta_individuale",
    label: { it: "Ditta individuale", en: "Sole trader" },
  },
  {
    value: "libero_professionista",
    label: { it: "Libero professionista", en: "Freelance professional" },
  },
]

const TIMEZONES: Choice[] = [
  { value: "Europe/Rome", label: same("Europe/Rome (CET)") },
  { value: "Europe/London", label: same("Europe/London (GMT)") },
  { value: "Europe/Paris", label: same("Europe/Paris (CET)") },
  { value: "Europe/Madrid", label: same("Europe/Madrid (CET)") },
  { value: "Europe/Berlin", label: same("Europe/Berlin (CET)") },
  { value: "Europe/Amsterdam", label: same("Europe/Amsterdam (CET)") },
  { value: "America/New_York", label: same("America/New York (ET)") },
  { value: "America/Los_Angeles", label: same("America/Los Angeles (PT)") },
  { value: "UTC", label: same("UTC") },
]

const LANGUAGES: Choice[] = [
  { value: "it", label: { it: "Italiano", en: "Italian" } },
  { value: "en", label: { it: "Inglese", en: "English" } },
  { value: "fr", label: { it: "Francese", en: "French" } },
  { value: "es", label: { it: "Spagnolo", en: "Spanish" } },
  { value: "de", label: { it: "Tedesco", en: "German" } },
]

const CURRENCIES: Choice[] = [
  { value: "EUR", label: same("EUR — Euro") },
  { value: "USD", label: { it: "USD — Dollaro USA", en: "USD — US Dollar" } },
  { value: "GBP", label: { it: "GBP — Sterlina", en: "GBP — British Pound" } },
  {
    value: "CHF",
    label: { it: "CHF — Franco svizzero", en: "CHF — Swiss Franc" },
  },
]

const PHONE_COUNTRIES: Choice[] = [
  { value: "it", label: { it: "Italia", en: "Italy" } },
  { value: "uk", label: { it: "Regno Unito", en: "United Kingdom" } },
  { value: "fr", label: { it: "Francia", en: "France" } },
  { value: "es", label: { it: "Spagna", en: "Spain" } },
  { value: "de", label: { it: "Germania", en: "Germany" } },
  { value: "ch", label: { it: "Svizzera", en: "Switzerland" } },
  { value: "us", label: { it: "Stati Uniti", en: "United States" } },
  { value: "other", label: { it: "Altro paese", en: "Somewhere else" } },
]

const YES_NO: Choice[] = [
  { value: "yes", label: { it: "Sì", en: "Yes" } },
  { value: "no", label: { it: "No", en: "No" } },
]

// -------------------------------------------------------------------- content

export const SECTIONS: Section[] = [
  // ------------------------------------------------------------ 1. Anagrafica
  {
    id: "business",
    title: { it: "Dati aziendali", en: "Business info" },
    description: {
      it: "I dati che ci servono per configurare correttamente la tua agenzia.",
      en: "The details we need to set your agency up correctly.",
    },
    questions: [
      {
        id: "agency_name",
        type: "text",
        label: {
          it: "Nome agenzia (come la vedranno i clienti)",
          en: "Agency name (as your clients will see it)",
        },
        required: true,
      },
      {
        id: "legal_company_name",
        type: "text",
        label: { it: "Ragione sociale", en: "Legal company name" },
        required: true,
      },
      {
        id: "legal_form",
        type: "select",
        label: { it: "Forma giuridica", en: "Legal form" },
        choices: LEGAL_FORMS,
        required: true,
      },
      {
        id: "partita_iva",
        type: "text",
        label: { it: "Partita IVA", en: "VAT number (Partita IVA)" },
        placeholder: same("12345678903"),
        format: "partita_iva",
        required: true,
      },
      {
        id: "codice_fiscale",
        type: "text",
        label: {
          it: "Codice Fiscale azienda",
          en: "Company tax code (Codice Fiscale)",
        },
        help: {
          it: "11 cifre per le società, 16 caratteri per ditte individuali e liberi professionisti.",
          en: "11 digits for companies, 16 characters for sole traders and freelancers.",
        },
        format: "codice_fiscale",
        required: true,
      },
      {
        id: "pec",
        type: "email",
        label: { it: "PEC", en: "Certified email (PEC)" },
        placeholder: same("azienda@pec.it"),
        required: true,
      },
      {
        id: "codice_sdi",
        type: "text",
        label: { it: "Codice destinatario SDI", en: "SDI recipient code" },
        help: {
          it: "7 caratteri. Puoi lasciarlo vuoto se ci hai dato la PEC.",
          en: "7 characters. You can leave it empty if you gave us a PEC address.",
        },
        placeholder: same("ABC1234"),
        format: "sdi",
      },
      {
        id: "address_street",
        type: "text",
        label: {
          it: "Sede legale — via e numero civico",
          en: "Registered office — street and number",
        },
        placeholder: same("Via Monte Napoleone 8"),
        required: true,
      },
      {
        id: "address_cap",
        type: "text",
        label: { it: "CAP", en: "Postcode (CAP)" },
        placeholder: same("20121"),
        format: "cap",
        required: true,
      },
      {
        id: "address_city",
        type: "text",
        label: { it: "Città", en: "City" },
        placeholder: same("Milano"),
        required: true,
      },
      {
        id: "address_province",
        type: "select",
        label: { it: "Provincia", en: "Province" },
        choices: PROVINCES,
        required: true,
      },
      {
        id: "address_country",
        type: "text",
        label: { it: "Paese", en: "Country" },
        defaultValue: "Italia",
      },
      {
        id: "business_phone",
        type: "tel",
        label: { it: "Telefono aziendale", en: "Business phone" },
        placeholder: same("+39 02 1234 5678"),
        defaultValue: "+39 ",
        required: true,
      },
      {
        id: "support_email",
        type: "email",
        label: { it: "Email di supporto", en: "Support email" },
        help: {
          it: "Dove i tuoi clienti scriveranno quando hanno bisogno di aiuto.",
          en: "Where your clients will write when they need help.",
        },
        required: true,
      },
      {
        id: "website",
        type: "url",
        label: { it: "Sito web", en: "Website" },
        placeholder: same("https://"),
      },
      {
        id: "timezone",
        type: "select",
        label: { it: "Fuso orario", en: "Time zone" },
        choices: TIMEZONES,
        defaultValue: "Europe/Rome",
        required: true,
      },
      {
        id: "language",
        type: "select",
        label: { it: "Lingua della piattaforma", en: "Platform language" },
        choices: LANGUAGES,
        defaultValue: "it",
        required: true,
      },
      {
        id: "currency",
        type: "select",
        label: { it: "Valuta", en: "Currency" },
        choices: CURRENCIES,
        defaultValue: "EUR",
        required: true,
      },
      {
        id: "contact_name",
        type: "text",
        label: {
          it: "Referente — nome e cognome",
          en: "Main contact — full name",
        },
        required: true,
      },
      {
        id: "contact_email",
        type: "email",
        label: { it: "Referente — email", en: "Main contact — email" },
        required: true,
      },
      {
        id: "contact_whatsapp",
        type: "tel",
        label: { it: "Referente — WhatsApp", en: "Main contact — WhatsApp" },
        placeholder: same("+39 333 123 4567"),
        defaultValue: "+39 ",
        required: true,
      },
    ],
  },

  // ----------------------------------------------------------------- 2. Brand
  {
    id: "branding",
    title: { it: "Brand", en: "Branding" },
    description: {
      it: "Carica i tuoi file, oppure incolla un link a Drive o Dropbox.",
      en: "Upload your files, or paste a Drive or Dropbox link instead.",
    },
    questions: [
      {
        id: "logo_main",
        type: "file",
        label: { it: "Logo — versione normale", en: "Logo — normal version" },
        help: {
          it: "PNG o SVG con sfondo trasparente è l'ideale.",
          en: "PNG or SVG with a transparent background works best.",
        },
        required: true,
      },
      {
        id: "logo_white",
        type: "file",
        label: { it: "Logo — versione bianca", en: "Logo — white version" },
        help: {
          it: "Usata sugli sfondi scuri.",
          en: "Used on dark backgrounds.",
        },
      },
      {
        id: "logo_icon",
        type: "file",
        label: { it: "Icona quadrata", en: "Square icon" },
        help: {
          it: "Usata per la favicon e per l'icona dell'app.",
          en: "Used for the favicon and the app icon.",
        },
      },
      {
        id: "brand_colors",
        type: "color",
        label: { it: "Colori del brand", en: "Brand colors" },
        help: {
          it: "Aggiungi un colore per volta. Inizia dal principale.",
          en: "Add one swatch per colour. Start with your primary.",
        },
        multiple: true,
        required: true,
      },
      {
        id: "platform_name",
        type: "text",
        label: {
          it: "Nome della piattaforma che vedranno i clienti",
          en: "Platform name your clients will see",
        },
        placeholder: same("GrowthOS"),
        required: true,
      },
      {
        id: "menu_changes",
        type: "textarea",
        label: {
          it: "Voci di menu da rinominare o nascondere",
          en: "Menu items to rename or hide",
        },
        placeholder: {
          it: "Rinomina “Opportunities” in “Trattative”, nascondi “Reputation”…",
          en: "Rename “Opportunities” to “Deals”, hide “Reputation”…",
        },
        optOut: {
          id: "menu_changes_default",
          label: { it: "Decidete voi", en: "Leave it to you" },
        },
      },
    ],
  },

  // --------------------------------------------------------------- 3. Dominio
  {
    id: "domain",
    title: { it: "Dominio", en: "Domain" },
    description: {
      it: "Gli indirizzi su cui vivranno la piattaforma e i link dei tuoi clienti.",
      en: "The addresses your platform and your clients' links will live on.",
    },
    questions: [
      {
        id: "main_domain",
        type: "text",
        label: {
          it: "Dominio principale della piattaforma",
          en: "Main domain for the platform",
        },
        help: {
          it: "Creeremo i sottodomini app., link. e mail. su questo dominio.",
          en: "We'll create app., link. and mail. subdomains on it.",
        },
        placeholder: same("tuaagenzia.it"),
        required: true,
      },
      {
        id: "use_default_subdomains",
        type: "toggle",
        label: {
          it: "Usiamo i sottodomini predefiniti?",
          en: "Use your defaults for the subdomains?",
        },
        help: {
          it: "app. per l'accesso, link. per i link brandizzati, mail. per gli invii.",
          en: "app. to log in, link. for branded links, mail. for sending.",
        },
        defaultValue: true,
      },
      {
        id: "subdomain_login",
        type: "text",
        label: { it: "Sottodominio di accesso", en: "Login subdomain" },
        defaultValue: "app",
        showIf: { questionId: "use_default_subdomains", equals: false },
        required: true,
      },
      {
        id: "subdomain_links",
        type: "text",
        label: {
          it: "Sottodominio per i link brandizzati",
          en: "Branded links subdomain",
        },
        defaultValue: "link",
        showIf: { questionId: "use_default_subdomains", equals: false },
        required: true,
      },
      {
        id: "subdomain_email",
        type: "text",
        label: { it: "Sottodominio email", en: "Email subdomain" },
        defaultValue: "mail",
        showIf: { questionId: "use_default_subdomains", equals: false },
        required: true,
      },
      {
        id: "dns_access",
        type: "radio",
        label: {
          it: "Come ci dai accesso al DNS?",
          en: "How should we get DNS access?",
        },
        required: true,
        choices: [
          {
            value: "share_login",
            label: {
              it: "Vi condivido le credenziali del registrar",
              en: "I'll share my registrar login",
            },
          },
          {
            value: "add_user",
            label: {
              it: "Vi aggiungo come utenti",
              en: "I'll add you as a user",
            },
          },
        ],
      },
      {
        id: "registrar",
        type: "select",
        label: { it: "Qual è il tuo registrar?", en: "Who is your registrar?" },
        required: true,
        choices: [
          { value: "aruba", label: same("Aruba") },
          { value: "register_it", label: same("Register.it") },
          { value: "ovh", label: same("OVH") },
          { value: "siteground", label: same("SiteGround") },
          { value: "godaddy", label: same("GoDaddy") },
          { value: "cloudflare", label: same("Cloudflare") },
          { value: "namecheap", label: same("Namecheap") },
          { value: "google_squarespace", label: same("Google / Squarespace") },
          { value: "wix", label: same("Wix") },
          { value: "other", label: { it: "Altro", en: "Other" } },
        ],
      },
      {
        id: "domain_has_website",
        type: "toggle",
        label: {
          it: "Il dominio principale è già usato per un sito web?",
          en: "Is your main domain used for a website?",
        },
        required: true,
      },
      {
        id: "website_host",
        type: "select",
        label: { it: "Dov'è ospitato?", en: "Where is it hosted?" },
        showIf: { questionId: "domain_has_website", equals: true },
        required: true,
        choices: [
          { value: "wordpress", label: same("WordPress") },
          { value: "aruba", label: same("Aruba") },
          { value: "wix", label: same("Wix") },
          { value: "shopify", label: same("Shopify") },
          { value: "webflow", label: same("Webflow") },
          { value: "other", label: { it: "Altro", en: "Other" } },
        ],
      },
      {
        id: "domain_has_email",
        type: "toggle",
        label: {
          it: "Il dominio principale è già usato per l'email?",
          en: "Is your main domain used for email?",
        },
        required: true,
      },
      {
        id: "email_provider",
        type: "select",
        label: { it: "Quale provider email?", en: "Which email provider?" },
        showIf: { questionId: "domain_has_email", equals: true },
        required: true,
        choices: [
          { value: "google_workspace", label: same("Google Workspace") },
          { value: "microsoft_365", label: same("Microsoft 365") },
          { value: "aruba", label: same("Aruba") },
          { value: "register_it", label: same("Register.it") },
          { value: "other", label: { it: "Altro", en: "Other" } },
        ],
      },
      {
        id: "other_domains",
        type: "repeater",
        label: {
          it: "Altri domini da collegare",
          en: "Other domains to connect",
        },
        addLabel: { it: "Aggiungi un dominio", en: "Add a domain" },
        fields: [
          { id: "domain", label: { it: "Dominio", en: "Domain" }, type: "text" },
          {
            id: "used_for",
            label: { it: "Usato per", en: "Used for" },
            type: "select",
            choices: [
              {
                value: "funnels_website",
                label: { it: "Funnel / Sito web", en: "Funnels / Website" },
              },
              {
                value: "client_portal",
                label: { it: "Portale clienti", en: "Client portal" },
              },
              {
                value: "landing_pages",
                label: { it: "Landing page", en: "Landing pages" },
              },
              { value: "other", label: { it: "Altro", en: "Other" } },
            ],
          },
        ],
      },
      {
        id: "domains_to_buy",
        type: "repeater",
        label: { it: "Nuovi domini da acquistare", en: "New domains to buy" },
        help: {
          it: "Possiamo registrarli noi per te.",
          en: "We can register these for you.",
        },
        addLabel: { it: "Aggiungi un dominio", en: "Add a domain" },
        fields: [
          { id: "domain", label: { it: "Dominio", en: "Domain" }, type: "text" },
        ],
      },
      {
        id: "clients_own_domain",
        type: "toggle",
        label: {
          it: "Ogni cliente userà un proprio dominio?",
          en: "Should each client use their own domain?",
        },
      },
      {
        id: "client_dns_owner",
        type: "radio",
        label: {
          it: "Chi raccoglie i loro accessi DNS?",
          en: "Who collects their DNS access?",
        },
        showIf: { questionId: "clients_own_domain", equals: true },
        required: true,
        choices: [
          {
            value: "client",
            label: {
              it: "Li raccolgo io e ve li invio",
              en: "I collect them and send them to you",
            },
          },
          {
            value: "aba",
            label: {
              it: "Contattate voi direttamente i miei clienti",
              en: "You contact my clients directly",
            },
          },
        ],
      },
    ],
  },

  // ------------------------------------------------------ 4. Email e telefonia
  {
    id: "comms",
    title: { it: "Email e telefonia", en: "Email & phone" },
    description: {
      it: "Come escono i messaggi dalla tua piattaforma.",
      en: "How messages leave your platform.",
    },
    questions: [
      {
        id: "sender_name",
        type: "text",
        label: {
          it: "Nome mittente per le email di sistema",
          en: "Sender name for system emails",
        },
        placeholder: same("GrowthOS"),
        required: true,
      },
      {
        id: "sender_email",
        type: "email",
        label: {
          it: "Email mittente per le email di sistema",
          en: "Sender email for system emails",
        },
        placeholder: same("no-reply@tuaagenzia.it"),
        required: true,
      },
      {
        id: "reply_to_email",
        type: "email",
        label: { it: "Email di risposta (reply-to)", en: "Reply-to email" },
        required: true,
      },
      {
        id: "phone_countries",
        type: "checkbox",
        label: {
          it: "In quali paesi ti servono numeri di telefono?",
          en: "Countries where you need phone numbers",
        },
        choices: PHONE_COUNTRIES,
        required: true,
      },
      {
        id: "phone_countries_other",
        type: "text",
        label: { it: "Quali altri paesi?", en: "Which other countries?" },
        showIf: { questionId: "phone_countries", includes: "other" },
        required: true,
      },
      {
        id: "italian_number_id_doc",
        type: "file",
        label: {
          it: "Carta d'identità del legale rappresentante",
          en: "ID card of the legal representative",
        },
        note: {
          it: "I numeri italiani richiedono documenti di verifica: carta d'identità del legale rappresentante e visura camerale. Caricali qui oppure inviaci un link.",
          en: "Italian phone numbers need verification documents: the legal representative's ID card and the company registration document (visura camerale). Upload them or send a link.",
        },
        showIf: { questionId: "phone_countries", includes: "it" },
      },
      {
        id: "italian_number_visura",
        type: "file",
        label: {
          it: "Visura camerale",
          en: "Company registration (visura camerale)",
        },
        showIf: { questionId: "phone_countries", includes: "it" },
      },
      {
        id: "sms_to_us",
        type: "toggle",
        label: {
          it: "Invierai SMS verso numeri statunitensi?",
          en: "Will you send SMS to US numbers?",
        },
        help: {
          it: "Gli operatori USA richiedono la registrazione A2P 10DLC prima di qualsiasi invio.",
          en: "US carriers require A2P 10DLC registration before any SMS goes out.",
        },
        defaultValue: false,
        required: true,
      },
      {
        id: "sms_ein",
        type: "text",
        label: same("EIN"),
        help: {
          it: "Serve per la registrazione A2P 10DLC.",
          en: "Needed for the A2P 10DLC registration.",
        },
        showIf: { questionId: "sms_to_us", equals: true },
        required: true,
      },
      {
        id: "sms_authorized_name",
        type: "text",
        label: {
          it: "Persona autorizzata — nome",
          en: "Authorized person — name",
        },
        showIf: { questionId: "sms_to_us", equals: true },
        required: true,
      },
      {
        id: "sms_authorized_email",
        type: "email",
        label: {
          it: "Persona autorizzata — email",
          en: "Authorized person — email",
        },
        showIf: { questionId: "sms_to_us", equals: true },
        required: true,
      },
      {
        id: "sms_authorized_mobile",
        type: "tel",
        label: {
          it: "Persona autorizzata — cellulare",
          en: "Authorized person — mobile",
        },
        placeholder: same("+39 333 123 4567"),
        showIf: { questionId: "sms_to_us", equals: true },
        required: true,
      },
      {
        id: "sms_privacy_url",
        type: "url",
        label: { it: "URL della privacy policy", en: "Privacy policy URL" },
        help: {
          it: "Deve essere pubblicamente raggiungibile — gli operatori la controllano.",
          en: "Must be publicly reachable — the carriers check it.",
        },
        placeholder: same("https://"),
        showIf: { questionId: "sms_to_us", equals: true },
        required: true,
      },
      {
        id: "needs_whatsapp",
        type: "toggle",
        label: { it: "Ti serve WhatsApp?", en: "Do you need WhatsApp?" },
      },
      {
        id: "whatsapp_business_manager",
        type: "radio",
        label: {
          it: "Hai un Meta Business Manager (Business Suite)?",
          en: "Do you have a Meta Business Manager (Business Suite)?",
        },
        showIf: { questionId: "needs_whatsapp", equals: true },
        required: true,
        choices: [
          { value: "yes", label: { it: "Sì", en: "Yes" } },
          { value: "no", label: { it: "No", en: "No" } },
          { value: "unknown", label: { it: "Non lo so", en: "I don't know" } },
        ],
      },
      {
        id: "whatsapp_number",
        type: "tel",
        label: {
          it: "Numero da collegare a WhatsApp",
          en: "Number to connect to WhatsApp",
        },
        help: {
          it: "Il numero non deve essere già usato su WhatsApp o WhatsApp Business app.",
          en: "The number must not already be in use on WhatsApp or the WhatsApp Business app.",
        },
        placeholder: same("+39 333 123 4567"),
        showIf: { questionId: "needs_whatsapp", equals: true },
        required: true,
      },
    ],
  },

  // ------------------------------------------------------------- 5. Pagamenti
  {
    id: "payments",
    title: { it: "Pagamenti e fatturazione", en: "Payments & invoicing" },
    description: {
      it: "Come fatturerai ai tuoi clienti.",
      en: "How you will charge your own clients.",
    },
    questions: [
      {
        id: "stripe_access",
        type: "radio",
        label: { it: "Account Stripe", en: "Stripe account" },
        required: true,
        choices: [
          {
            value: "invite",
            label: {
              it: "Vi invito sul mio account",
              en: "I'll invite you to my account",
            },
          },
          {
            value: "share",
            label: { it: "Vi condivido gli accessi", en: "I'll share access" },
          },
          {
            value: "create",
            label: { it: "Aiutatemi a crearne uno", en: "Help me create one" },
          },
        ],
      },
      {
        id: "vat_rate",
        type: "number",
        label: {
          it: "Aliquota IVA da applicare in fattura (%)",
          en: "VAT rate to apply on invoices (%)",
        },
        help: {
          it: "In Italia l'aliquota ordinaria è il 22%. Modificala se nel tuo caso è diversa.",
          en: "The standard Italian rate is 22%. Change it if yours differs.",
        },
        defaultValue: 22,
        min: 0,
        max: 100,
        required: true,
      },
      {
        id: "prices_include_vat",
        type: "toggle",
        label: {
          it: "I prezzi qui sotto sono IVA inclusa?",
          en: "Are the prices below VAT-inclusive?",
        },
        defaultValue: false,
      },
      {
        id: "packages",
        type: "repeater",
        label: {
          it: "I tuoi pacchetti e prezzi per i clienti",
          en: "Your client packages and prices",
        },
        help: {
          it: "Una riga per pacchetto. Potrai cambiarli in seguito.",
          en: "One row per package. You can change these later.",
        },
        addLabel: { it: "Aggiungi un pacchetto", en: "Add a package" },
        fields: [
          {
            id: "name",
            label: { it: "Nome del pacchetto", en: "Package name" },
            type: "text",
            required: true,
          },
          {
            id: "monthly_price",
            label: { it: "Prezzo mensile (€)", en: "Monthly price (€)" },
            type: "text",
            required: true,
          },
          {
            id: "setup_fee",
            label: { it: "Costo di attivazione (€)", en: "Setup fee (€)" },
            type: "text",
          },
          {
            id: "includes",
            label: { it: "Cosa include", en: "What's included" },
            type: "textarea",
          },
        ],
      },
      {
        id: "rebill_usage",
        type: "toggle",
        label: {
          it: "Riaddebiterai ai clienti i consumi di SMS ed email?",
          en: "Rebill SMS and email usage to your clients?",
        },
      },
    ],
  },

  // ----------------------------------------------------- 6. Snapshot e clienti
  {
    id: "snapshots",
    title: { it: "Snapshot e clienti", en: "Snapshots & clients" },
    description: {
      it: "Cosa carichiamo nella tua piattaforma il primo giorno.",
      en: "What we load into your platform on day one.",
    },
    questions: [
      {
        id: "has_snapshots",
        type: "toggle",
        label: {
          it: "Hai già degli snapshot?",
          en: "Do you already have snapshots?",
        },
        required: true,
      },
      {
        id: "wants_snapshot_built",
        type: "toggle",
        label: {
          it: "Vuoi che costruiamo noi uno snapshot?",
          en: "Do you want us to build a snapshot for you?",
        },
        showIf: { questionId: "has_snapshots", equals: false },
        required: true,
      },
      {
        id: "snapshot_brand",
        type: "text",
        label: {
          it: "Per quale brand o attività?",
          en: "For which brand or business?",
        },
        help: {
          it: "Il nome che useremo nei contenuti dello snapshot.",
          en: "The name we will use inside the snapshot's content.",
        },
        showIf: { questionId: "wants_snapshot_built", equals: true },
        required: true,
      },
      {
        id: "snapshots",
        type: "repeater",
        label: { it: "I tuoi snapshot", en: "Your snapshots" },
        addLabel: { it: "Aggiungi uno snapshot", en: "Add a snapshot" },
        showIf: { questionId: "has_snapshots", equals: true },
        required: true,
        fields: [
          {
            id: "link",
            label: { it: "Link di condivisione", en: "Share link" },
            type: "text",
            required: true,
          },
          {
            id: "niche",
            label: { it: "Settore", en: "Niche" },
            type: "text",
            required: true,
          },
          {
            id: "source",
            label: { it: "Provenienza", en: "Source" },
            type: "select",
            choices: [
              {
                value: "built",
                label: { it: "Creato da me", en: "Built by me" },
              },
              { value: "bought", label: { it: "Acquistato", en: "Bought" } },
              { value: "marketplace", label: same("Marketplace") },
            ],
          },
          {
            id: "licensed",
            label: { it: "Ho la licenza d'uso?", en: "Licensed for my use?" },
            type: "select",
            choices: YES_NO,
          },
        ],
      },
      {
        id: "niches",
        type: "checkbox",
        label: {
          it: "Per quali settori dobbiamo costruirlo?",
          en: "Which niches should we build it for?",
        },
        showIf: { questionId: "wants_snapshot_built", equals: true },
        required: true,
        choices: [
          { value: "dental", label: { it: "Dentisti", en: "Dental" } },
          {
            value: "real_estate",
            label: { it: "Immobiliare", en: "Real estate" },
          },
          { value: "coaching", label: same("Coaching") },
          {
            value: "home_services",
            label: { it: "Servizi per la casa", en: "Home services" },
          },
          { value: "med_spa", label: { it: "Centri estetici", en: "Med spa" } },
          { value: "other", label: { it: "Altro", en: "Other" } },
        ],
      },
      {
        id: "niches_other",
        type: "text",
        label: { it: "Quale altro settore?", en: "Which other niche?" },
        showIf: { questionId: "niches", includes: "other" },
        required: true,
      },
      {
        id: "default_snapshot",
        type: "select",
        label: {
          it: "Snapshot predefinito per ogni nuovo cliente",
          en: "Default snapshot for every new client",
        },
        help: {
          it: "Costruito dalle tue risposte qui sopra.",
          en: "Built from your answers above.",
        },
        choicesFrom: [
          { questionId: "snapshots", field: "niche" },
          { questionId: "niches" },
        ],
        showIfAny: [
          { questionId: "has_snapshots", equals: true },
          { questionId: "wants_snapshot_built", equals: true },
        ],
      },
      {
        id: "rebrand_snapshots",
        type: "toggle",
        label: {
          it: "Dobbiamo rifare il brand dei contenuti degli snapshot?",
          en: "Rebrand snapshot content with your brand?",
        },
      },
      {
        id: "pipeline_stages",
        type: "textarea",
        groupTitle: {
          it: "Cosa mettiamo dentro lo snapshot",
          en: "What goes inside the snapshot",
        },
        label: { it: "Fasi della pipeline", en: "Pipeline stages" },
        showIfAny: [
          { questionId: "has_snapshots", equals: true },
          { questionId: "wants_snapshot_built", equals: true },
        ],
        placeholder: {
          it: "Nuovo lead → Contattato → Appuntamento → Vinto",
          en: "New lead → Contacted → Booked → Won",
        },
      },
      {
        id: "calendars",
        type: "repeater",
        label: { it: "Calendari necessari", en: "Calendars needed" },
        showIfAny: [
          { questionId: "has_snapshots", equals: true },
          { questionId: "wants_snapshot_built", equals: true },
        ],
        addLabel: { it: "Aggiungi un calendario", en: "Add a calendar" },
        fields: [
          {
            id: "type",
            label: { it: "Tipo", en: "Type" },
            type: "select",
            choices: [
              {
                value: "one_on_one",
                label: { it: "Individuale", en: "One-on-one" },
              },
              { value: "round_robin", label: same("Round robin") },
              { value: "group", label: { it: "Di gruppo", en: "Group" } },
            ],
          },
          {
            id: "duration",
            label: { it: "Durata (minuti)", en: "Duration (minutes)" },
            type: "number",
          },
          {
            id: "hours",
            label: { it: "Orari di lavoro", en: "Working hours" },
            type: "text",
            placeholder: {
              it: "Lun–Ven, 9:00–18:00",
              en: "Mon–Fri, 9:00–18:00",
            },
          },
        ],
      },
      {
        id: "forms",
        type: "repeater",
        label: { it: "Form e sondaggi necessari", en: "Forms and surveys needed" },
        showIfAny: [
          { questionId: "has_snapshots", equals: true },
          { questionId: "wants_snapshot_built", equals: true },
        ],
        addLabel: { it: "Aggiungi un form", en: "Add a form" },
        fields: [
          {
            id: "name",
            label: { it: "Nome del form", en: "Form name" },
            type: "text",
          },
          {
            id: "fields",
            label: { it: "Campi da raccogliere", en: "Fields to collect" },
            type: "textarea",
          },
        ],
      },
      {
        id: "automations",
        type: "checkbox",
        label: { it: "Automazioni indispensabili", en: "Must-have automations" },
        showIfAny: [
          { questionId: "has_snapshots", equals: true },
          { questionId: "wants_snapshot_built", equals: true },
        ],
        choices: [
          {
            value: "missed_call",
            label: {
              it: "SMS automatico per chiamate perse",
              en: "Missed-call text-back",
            },
          },
          {
            value: "reminders",
            label: { it: "Promemoria appuntamenti", en: "Appointment reminders" },
          },
          {
            value: "no_show",
            label: {
              it: "Recupero appuntamenti mancati",
              en: "No-show follow-up",
            },
          },
          {
            value: "review",
            label: { it: "Richiesta recensioni", en: "Review request" },
          },
          {
            value: "nurture",
            label: { it: "Nurturing dei lead", en: "Lead nurture" },
          },
          {
            value: "reactivation",
            label: { it: "Riattivazione contatti", en: "Reactivation" },
          },
        ],
      },
      {
        id: "funnels",
        type: "checkbox",
        label: {
          it: "Funnel e siti da includere",
          en: "Funnels and websites to include",
        },
        showIfAny: [
          { questionId: "has_snapshots", equals: true },
          { questionId: "wants_snapshot_built", equals: true },
        ],
        choices: [
          {
            value: "booking",
            label: { it: "Pagina di prenotazione", en: "Booking page" },
          },
          { value: "lead_magnet", label: same("Lead magnet") },
          {
            value: "thank_you",
            label: { it: "Pagina di ringraziamento", en: "Thank-you page" },
          },
          { value: "other", label: { it: "Altro", en: "Other" } },
        ],
      },
      {
        id: "funnels_other",
        type: "text",
        label: {
          it: "Cos'altro dobbiamo costruire?",
          en: "What else should we build?",
        },
        showIf: { questionId: "funnels", includes: "other" },
        required: true,
      },
      {
        id: "template_language",
        type: "select",
        label: {
          it: "Lingua dei template email e SMS",
          en: "Language for email & SMS templates",
        },
        required: true,
        choices: LANGUAGES,
        defaultValue: "it",
      },
      {
        id: "template_tone",
        type: "radio",
        label: { it: "Tono di voce", en: "Tone of voice" },
        choices: [
          { value: "friendly", label: { it: "Amichevole", en: "Friendly" } },
          {
            value: "professional",
            label: { it: "Professionale", en: "Professional" },
          },
          { value: "direct", label: { it: "Diretto", en: "Direct" } },
        ],
      },
    ],
  },

  // -------------------------------------------------------- 7. Team e consensi
  {
    id: "team",
    title: { it: "Team e ultimi dettagli", en: "Team & final details" },
    description: {
      it: "Ancora poche cose e hai finito.",
      en: "Last few things, then you're done.",
    },
    questions: [
      {
        id: "team_members",
        type: "repeater",
        label: { it: "Membri del team da aggiungere", en: "Team members to add" },
        addLabel: { it: "Aggiungi un membro", en: "Add a team member" },
        fields: [
          { id: "name", label: { it: "Nome", en: "Name" }, type: "text" },
          { id: "email", label: same("Email"), type: "email" },
          {
            id: "role",
            label: { it: "Ruolo", en: "Role" },
            type: "select",
            choices: [
              { value: "admin", label: same("Admin") },
              { value: "user", label: { it: "Utente", en: "User" } },
            ],
          },
        ],
      },
      {
        id: "terms_url",
        type: "url",
        label: {
          it: "URL dei Termini e Condizioni",
          en: "Terms & Conditions URL",
        },
        placeholder: same("https://"),
      },
      {
        id: "privacy_url",
        type: "url",
        label: { it: "URL della Privacy Policy", en: "Privacy Policy URL" },
        placeholder: same("https://"),
      },
      {
        id: "go_live_date",
        type: "date",
        label: {
          it: "Data obiettivo per andare online",
          en: "Target go-live date",
        },
        required: true,
      },
      {
        id: "gdpr_consent",
        type: "consent",
        label: {
          it: "Acconsento al trattamento dei dati ai sensi del GDPR (Reg. UE 2016/679)",
          en: "I consent to the processing of my data under the GDPR (EU Reg. 2016/679)",
        },
        linkUrl: "/privacy",
        linkLabel: {
          it: "Leggi l'informativa privacy",
          en: "Read the privacy policy",
        },
        required: true,
      },
      {
        id: "wants_dpa",
        type: "consent",
        label: {
          it: "Desidero ricevere un DPA (Data Processing Agreement) da firmare",
          en: "I would like to receive a Data Processing Agreement (DPA) to sign",
        },
      },
    ],
  },
]

export const ALL_QUESTIONS: Question[] = SECTIONS.flatMap((s) => s.questions)

export function questionById(id: string): Question | undefined {
  return ALL_QUESTIONS.find((q) => q.id === id)
}
