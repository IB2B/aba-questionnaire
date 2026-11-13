/**
 * End-to-end walk through the onboarding form.
 *
 * Drives the real validation, visibility, defaults and progress code — the
 * same modules the UI calls — step by step, in both languages. Run with:
 *
 *   npm run test:form
 */

import { t, type Lang } from "../src/lib/i18n"
import { SECTIONS } from "../src/lib/questionnaire/questions"
import { resolveChoices } from "../src/lib/questionnaire/choices"
import {
  firstInvalidSection,
  normalizeAnswers,
  pruneAnswers,
  stepPercent,
  validateAll,
  validateSection,
  visibleQuestions,
  withDefaults,
} from "../src/lib/questionnaire/validation"
import { renderSummaryText } from "../src/lib/email"
import { ALL_QUESTIONS } from "../src/lib/questionnaire/questions"
import type { AnswerMap, AnswerValue } from "../src/lib/supabase/types"

/** A copy of the answers with one key removed, to simulate "never touched". */
function without(source: AnswerMap, key: string): AnswerMap {
  const copy = { ...source }
  delete copy[key]
  return copy
}

const TOTAL_STEPS = SECTIONS.length + 1
const LANG: Lang = "it"

let passed = 0
let failed = 0

function check(label: string, condition: boolean, detail = "") {
  if (condition) {
    passed++
    console.log(`  ok   ${label}`)
  } else {
    failed++
    console.log(`  FAIL ${label}${detail ? ` — ${detail}` : ""}`)
  }
}

function heading(text: string) {
  console.log(`\n${text}\n${"=".repeat(text.length)}`)
}

// ---------------------------------------------------------------- defaults
heading("Defaults")

let answers: AnswerMap = withDefaults({})

check("time zone defaults to Europe/Rome", answers.timezone === "Europe/Rome")
check("language defaults to Italian", answers.language === "it")
check("currency defaults to EUR", answers.currency === "EUR")
check("country defaults to Italia", answers.address_country === "Italia")
check("business phone is prefilled +39", answers.business_phone === "+39 ")
check("WhatsApp is prefilled +39", answers.contact_whatsapp === "+39 ")
check("VAT rate defaults to 22", answers.vat_rate === 22)
check("SMS to US defaults to No", answers.sms_to_us === false)
check("subdomain defaults are on", answers.use_default_subdomains === true)

// ------------------------------------------------------------- progress bar
heading("Progress bar is per step, not per field")

check("step 1 of 8 reads 12%", stepPercent(0, TOTAL_STEPS) === 12,
  `got ${stepPercent(0, TOTAL_STEPS)}`)
check("step 4 of 8 reads 50%", stepPercent(3, TOTAL_STEPS) === 50,
  `got ${stepPercent(3, TOTAL_STEPS)}`)
check("step 8 of 8 reads 100%", stepPercent(7, TOTAL_STEPS) === 100,
  `got ${stepPercent(7, TOTAL_STEPS)}`)
check("there are 8 steps (7 sections + review)", TOTAL_STEPS === 8)

// ------------------------------------------------- step 1 blocks when empty
heading("Step 1 blocks on empty required fields")

const step1Errors = validateSection(SECTIONS[0], answers, LANG)
check("empty step 1 produces errors", Object.keys(step1Errors).length > 0,
  `${Object.keys(step1Errors).length} errors`)
check("agency name is flagged", Boolean(step1Errors.agency_name))
check("Partita IVA is flagged", Boolean(step1Errors.partita_iva))
check("prefilled +39 phone is rejected as incomplete",
  Boolean(step1Errors.business_phone))
check("errors are in Italian",
  step1Errors.agency_name === "Questa domanda è obbligatoria.",
  step1Errors.agency_name)

// ------------------------------------------------------- Italian validators
heading("Italian field validation")

const bad = (id: string, value: AnswerValue) =>
  validateSection(SECTIONS[0], { ...answers, [id]: value }, LANG)[id]

check("Partita IVA with bad checksum rejected", Boolean(bad("partita_iva", "12345678901")))
check("Partita IVA of 10 digits rejected", Boolean(bad("partita_iva", "1234567890")))
check("valid Partita IVA accepted", !bad("partita_iva", "12345678903"))
check("real Partita IVA (IT prefix) accepted", !bad("partita_iva", "IT00743110157"))

check("16-char Codice Fiscale accepted", !bad("codice_fiscale", "RSSMRA85T10A562S"))
check("11-digit company CF accepted", !bad("codice_fiscale", "12345678903"))
check("15-char CF rejected", Boolean(bad("codice_fiscale", "RSSMRA85T10A562")))

check("4-digit CAP rejected", Boolean(bad("address_cap", "2012")))
check("5-digit CAP accepted", !bad("address_cap", "20121"))

check("6-char SDI rejected", Boolean(bad("codice_sdi", "ABC123")))
check("7-char SDI accepted", !bad("codice_sdi", "ABC1234"))
check("SDI is optional when empty", !bad("codice_sdi", ""))

check("phone without + rejected", Boolean(bad("business_phone", "02 1234 5678")))
check("international phone accepted", !bad("business_phone", "+39 02 1234 5678"))
check("phone with dots accepted", !bad("contact_whatsapp", "+39.333.123.4567"))

check("malformed email rejected", Boolean(bad("support_email", "mario@")))
check("valid email accepted", !bad("support_email", "info@agenzia.it"))
check("PEC validated as email", Boolean(bad("pec", "pec-senza-chiocciola")))

check("http:// URL rejected", Boolean(bad("website", "http://agenzia.it")))
check("bare domain rejected", Boolean(bad("website", "agenzia.it")))
check("https:// URL accepted", !bad("website", "https://agenzia.it"))

// --------------------------------------------------------- fill every step
heading("Filling all 7 steps")

const filled: AnswerMap = {
  ...answers,
  // 1 — dati aziendali
  agency_name: "Milano Growth",
  legal_company_name: "Milano Growth S.R.L.",
  legal_form: "srl",
  partita_iva: "12345678903",
  codice_fiscale: "12345678903",
  pec: "milanogrowth@pec.it",
  codice_sdi: "ABC1234",
  address_street: "Via Monte Napoleone 8",
  address_cap: "20121",
  address_city: "Milano",
  address_province: "MI",
  business_phone: "+39 02 1234 5678",
  support_email: "supporto@milanogrowth.it",
  website: "https://milanogrowth.it",
  contact_name: "Giulia Ferrari",
  contact_email: "giulia@milanogrowth.it",
  contact_whatsapp: "+39 333 123 4567",
  // 2 — brand
  logo_main: { kind: "link", url: "https://drive.google.com/logo.svg" },
  brand_colors: ["#0B5FFF", "#101828"],
  platform_name: "GrowthOS",
  menu_changes_default: true,
  // 3 — dominio
  main_domain: "milanogrowth.it",
  dns_access: "share_login",
  registrar: "aruba",
  domain_has_website: true,
  website_host: "wordpress",
  domain_has_email: true,
  email_provider: "aruba",
  clients_own_domain: false,
  // 4 — email e telefonia
  sender_name: "GrowthOS",
  sender_email: "no-reply@milanogrowth.it",
  reply_to_email: "supporto@milanogrowth.it",
  phone_countries: ["it"],
  // 5 — pagamenti
  stripe_access: "invite",
  packages: [{ name: "Starter", monthly_price: "297", setup_fee: "500" }],
  // 6 — snapshot
  has_snapshots: false,
  wants_snapshot_built: true,
  snapshot_brand: "Milano Growth",
  niches: ["dental", "med_spa"],
  template_language: "it",
  // 7 — team
  go_live_date: "2026-02-01",
  gdpr_consent: true,
}

answers = filled

SECTIONS.forEach((section, index) => {
  const errors = validateSection(section, answers, LANG)
  check(
    `step ${index + 1} “${t(section.title, LANG)}” passes`,
    Object.keys(errors).length === 0,
    JSON.stringify(errors)
  )
})

// ----------------------------------------------------- conditional branches
heading("Conditional fields")

const itDocs = visibleQuestions(SECTIONS[3], answers).map((q) => q.id)
check("Italian number documents shown for Italy",
  itDocs.includes("italian_number_id_doc") && itDocs.includes("italian_number_visura"))
check("A2P fields hidden while SMS-to-US is No", !itDocs.includes("sms_ein"))

const withUsSms = { ...answers, sms_to_us: true }
const usIds = visibleQuestions(SECTIONS[3], withUsSms).map((q) => q.id)
check("A2P fields appear when SMS-to-US is Yes",
  ["sms_ein", "sms_authorized_name", "sms_authorized_email",
   "sms_authorized_mobile", "sms_privacy_url"].every((id) => usIds.includes(id)))
check("turning SMS-to-US on re-blocks the step",
  Object.keys(validateSection(SECTIONS[3], withUsSms, LANG)).length === 5)

const otherCountry = { ...answers, phone_countries: ["it", "other"] }
check("“other countries” field appears",
  visibleQuestions(SECTIONS[3], otherCountry).some((q) => q.id === "phone_countries_other"))

const customSubdomains = { ...answers, use_default_subdomains: false }
const subIds = visibleQuestions(SECTIONS[2], customSubdomains).map((q) => q.id)
check("custom subdomain fields appear",
  ["subdomain_login", "subdomain_links", "subdomain_email"].every((id) => subIds.includes(id)))
check("they are prefilled app/link/mail",
  withDefaults({}).subdomain_login === "app" &&
  withDefaults({}).subdomain_links === "link" &&
  withDefaults({}).subdomain_email === "mail")

const withSnapshots: AnswerMap = {
  ...without(without(answers, "niches"), "wants_snapshot_built"),
  has_snapshots: true,
}
const snapIds = visibleQuestions(SECTIONS[5], withSnapshots).map((q) => q.id)
check("snapshot repeater replaces the niches picker",
  snapIds.includes("snapshots") && !snapIds.includes("niches"))
check("empty required repeater blocks the step",
  validateSection(SECTIONS[5], withSnapshots, LANG).snapshots ===
    "Aggiungi almeno una riga.")
check("a row missing its required link is flagged",
  Boolean(validateSection(
    SECTIONS[5],
    { ...withSnapshots, snapshots: [{ niche: "Dentisti" }] },
    LANG
  ).snapshots))

// --------------------------------------------------------- dynamic choices
heading("Dropdowns built from earlier answers")

const defaultSnapshot = SECTIONS[5].questions.find((q) => q.id === "default_snapshot")!
const fromNiches = resolveChoices(defaultSnapshot, answers, LANG).map((c) => c.label)
check("default snapshot lists the chosen niches",
  fromNiches.includes("Dentisti") && fromNiches.includes("Centri estetici"),
  fromNiches.join(", "))

const fromSnapshots = resolveChoices(
  defaultSnapshot,
  { ...withSnapshots, snapshots: [{ link: "https://x", niche: "Odontoiatria" }] },
  LANG
).map((c) => c.label)
check("default snapshot lists snapshot niches instead",
  fromSnapshots.includes("Odontoiatria"), fromSnapshots.join(", "))

// ----------------------------------------------------------- GDPR + consent
heading("GDPR consent")

check("unticked GDPR consent blocks the final step",
  validateSection(SECTIONS[6], { ...answers, gdpr_consent: false }, LANG)
    .gdpr_consent === "Devi accettare per continuare.")
check("missing GDPR consent blocks the final step",
  Boolean(validateSection(SECTIONS[6], without(answers, "gdpr_consent"), LANG)
    .gdpr_consent))
check("DPA request is optional",
  !validateSection(SECTIONS[6], answers, LANG).wants_dpa)


// ------------------------------------------------------------ recent fixes
heading("Recent fixes")

check("the Fonts question is gone",
  !ALL_QUESTIONS.some((q) => q.id === "fonts"))
check("a saved Fonts answer is pruned away",
  pruneAnswers({ ...answers, fonts: "Inter" }).fonts === undefined)
check("live answers survive pruning",
  pruneAnswers({ ...answers, fonts: "Inter" }).agency_name === "Milano Growth")
check("opt-out keys survive pruning",
  pruneAnswers(answers).menu_changes_default === true)

check("registrar is now required",
  Boolean(validateSection(SECTIONS[2], without(answers, "registrar"), LANG).registrar))

const dnsOwner = SECTIONS[2].questions.find((q) => q.id === "client_dns_owner")!
const dnsLabels = dnsOwner.choices!.map((c) => c.label.it)
check("DNS option 1 renamed",
  dnsLabels.includes("Li raccolgo io e ve li invio"), dnsLabels.join(" | "))
check("DNS option 2 renamed",
  dnsLabels.includes("Contattate voi direttamente i miei clienti"),
  dnsLabels.join(" | "))

const noWhatsapp = visibleQuestions(SECTIONS[3], answers).map((q) => q.id)
check("WhatsApp follow-ups hidden by default",
  !noWhatsapp.includes("whatsapp_number") &&
  !noWhatsapp.includes("whatsapp_business_manager"))

const withWhatsapp = { ...answers, needs_whatsapp: true }
const waIds = visibleQuestions(SECTIONS[3], withWhatsapp).map((q) => q.id)
check("Meta Business Manager question appears",
  waIds.includes("whatsapp_business_manager"))
check("WhatsApp number question appears", waIds.includes("whatsapp_number"))
check("both WhatsApp questions are required",
  Object.keys(validateSection(SECTIONS[3], withWhatsapp, LANG)).length === 2)
check("“Non lo so” is an option",
  SECTIONS[3].questions
    .find((q) => q.id === "whatsapp_business_manager")!
    .choices!.some((c) => c.label.it === "Non lo so"))
check("WhatsApp number must be international",
  Boolean(validateSection(
    SECTIONS[3],
    { ...withWhatsapp, whatsapp_business_manager: "yes", whatsapp_number: "333 123 4567" },
    LANG
  ).whatsapp_number))
check("a valid WhatsApp number clears the step",
  Object.keys(validateSection(
    SECTIONS[3],
    { ...withWhatsapp, whatsapp_business_manager: "yes", whatsapp_number: "+39 333 123 4567" },
    LANG
  )).length === 0)
check("the helper warns about reusing a number",
  SECTIONS[3].questions
    .find((q) => q.id === "whatsapp_number")!
    .help!.it.includes("non deve essere già usato"))

const halfPackage = { ...answers, packages: [{ setup_fee: "500" }] }
check("a half-filled package row demands a name",
  Boolean(validateSection(SECTIONS[4], halfPackage, LANG).packages),
  validateSection(SECTIONS[4], halfPackage, LANG).packages)
check("a package with a name but no price is flagged",
  Boolean(validateSection(
    SECTIONS[4],
    { ...answers, packages: [{ name: "Starter" }] },
    LANG
  ).packages))
check("a completely empty package row is ignored",
  Object.keys(validateSection(
    SECTIONS[4],
    { ...answers, packages: [{ name: "", monthly_price: "" }] },
    LANG
  )).length === 0)
check("empty package rows are dropped before saving",
  (pruneAnswers({
    ...answers,
    packages: [{ name: "Starter", monthly_price: "297" }, {}, { name: "  " }],
  }).packages as { name?: string }[]).length === 1)

const staleDraft = { agency_name: "Vecchia bozza", fonts: "Inter", timezone: "" }
const revived = normalizeAnswers(staleDraft)
check("old draft still gets Europe/Rome", revived.timezone === "Europe/Rome")
check("old draft still gets Italiano", revived.language === "it")
check("old draft still gets EUR", revived.currency === "EUR")
check("old draft keeps what the client typed",
  revived.agency_name === "Vecchia bozza")
check("old draft loses the retired field", revived.fonts === undefined)
check("a deliberate No is not overwritten by its default",
  normalizeAnswers({ prices_include_vat: false }).prices_include_vat === false)
check("a deliberate 0 is not overwritten by its default",
  normalizeAnswers({ vat_rate: 0 }).vat_rate === 0)

// ----------------------------------------------- snapshot build flow
heading("Snapshot: do you want us to build one")

const noSnapshots: AnswerMap = { ...answers, has_snapshots: false }
const buildIds = visibleQuestions(SECTIONS[5], noSnapshots).map((q) => q.id)
check("“shall we build one” appears when they have none",
  buildIds.includes("wants_snapshot_built"))
check("it is required",
  Boolean(validateSection(
    SECTIONS[5],
    without(noSnapshots, "wants_snapshot_built"),
    LANG
  ).wants_snapshot_built))

const declined: AnswerMap = { ...noSnapshots, wants_snapshot_built: false }
const declinedIds = visibleQuestions(SECTIONS[5], declined).map((q) => q.id)
check("saying no hides the brand and niches",
  !declinedIds.includes("snapshot_brand") && !declinedIds.includes("niches"))
check("saying no hides every content question",
  ["pipeline_stages", "calendars", "forms", "automations", "funnels"].every(
    (id) => !declinedIds.includes(id)
  ))
check("saying no leaves nothing else to fill in",
  Object.keys(validateSection(SECTIONS[5], declined, LANG)).length === 0,
  JSON.stringify(validateSection(SECTIONS[5], declined, LANG)))

const buildingIds = visibleQuestions(SECTIONS[5], answers).map((q) => q.id)
check("saying yes asks for the brand", buildingIds.includes("snapshot_brand"))
check("saying yes asks for the niches", buildingIds.includes("niches"))
check("saying yes asks what goes inside",
  ["pipeline_stages", "calendars", "forms", "automations", "funnels"].every(
    (id) => buildingIds.includes(id)
  ))
check("brand and niches are both required",
  Object.keys(validateSection(
    SECTIONS[5],
    without(without(answers, "snapshot_brand"), "niches"),
    LANG
  )).length === 2)

const importingIds = visibleQuestions(SECTIONS[5], withSnapshots).map((q) => q.id)
check("importing their own snapshots still asks what goes inside",
  ["pipeline_stages", "calendars", "forms", "automations", "funnels"].every(
    (id) => importingIds.includes(id)
  ))
check("the contents carry a group heading",
  Boolean(SECTIONS[5].questions.find((q) => q.id === "pipeline_stages")!.groupTitle))

check("default snapshot hidden before either branch is answered",
  !visibleQuestions(SECTIONS[5], { has_snapshots: false }).some(
    (q) => q.id === "default_snapshot"
  ))
check("default snapshot shown when they have their own",
  importingIds.includes("default_snapshot"))
check("default snapshot shown when we build one",
  buildingIds.includes("default_snapshot"))

heading("Removed questions")

for (const id of [
  "demo_subaccount",
  "first_clients",
  "wants_mobile_app",
  "fonts",
  "einvoicing_sdi",
]) {
  check(`“${id}” is gone`, !ALL_QUESTIONS.some((q) => q.id === id))
}
check("the pipeline “use yours” escape hatch is gone",
  !SECTIONS[5].questions.find((q) => q.id === "pipeline_stages")!.optOut)
check("the automations “use your standard setup” escape hatch is gone",
  !SECTIONS[5].questions.find((q) => q.id === "automations")!.optOut)

// ------------------------------------------------------------ review + send
heading("Review and submit")

check("whole form validates", Object.keys(validateAll(answers, LANG)).length === 0,
  JSON.stringify(validateAll(answers, LANG)))
check("no section is flagged as invalid", firstInvalidSection(answers, LANG) === -1)
check("a broken answer sends you back to its section",
  firstInvalidSection({ ...answers, main_domain: "" }, LANG) === 2)

// --------------------------------------------------------------- languages
heading("Both languages")

check("Italian section title", t(SECTIONS[0].title, "it") === "Dati aziendali")
check("English section title", t(SECTIONS[0].title, "en") === "Business info")
check("English errors come through in English",
  validateSection(SECTIONS[0], withDefaults({}), "en").agency_name ===
    "This question is required.")

const everyStringTranslated = SECTIONS.every((s) =>
  s.title.it && s.title.en &&
  s.questions.every((q) => q.label.it && q.label.en)
)
check("every section and question has both languages", everyStringTranslated)

const noDuplicateOptionalHelp = SECTIONS.every((s) =>
  s.questions.every(
    (q) => !/^(Optional|Facoltativo)\.?$/i.test(q.help?.it ?? "")
  )
)
check("no leftover “Optional.” helper text", noDuplicateOptionalHelp)

// ------------------------------------------------------------- email sample
heading("Summary email (first lines, Italian)")

const email = renderSummaryText(answers, LANG)
console.log(
  email
    .split("\n")
    .slice(0, 12)
    .map((l) => `  │ ${l}`)
    .join("\n")
)
check("email renders Italian labels", email.includes("Partita IVA: 12345678903"))
check("email resolves choice labels", email.includes("Forma giuridica: SRL"))
check("email shows opt-outs", email.includes("Decidete voi"))
check("email no longer mentions Font", !/^Font:/m.test(email))

const emailEn = renderSummaryText(answers, "en")
check("email renders in English too", emailEn.includes("VAT number (Partita IVA)"))

// -------------------------------------------------------------------- done
console.log(`\n${"-".repeat(40)}`)
console.log(`${passed} passed, ${failed} failed`)
process.exit(failed === 0 ? 0 : 1)
