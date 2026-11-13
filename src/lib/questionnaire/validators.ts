import type { I18n } from "@/lib/i18n"

/** Error messages raised by field validation, in both languages. */
export const VALIDATION: Record<string, I18n> = {
  required: {
    it: "Questa domanda è obbligatoria.",
    en: "This question is required.",
  },
  email: {
    it: "Inserisci un indirizzo email valido.",
    en: "Enter a valid email address.",
  },
  phone: {
    it: "Usa il formato internazionale, per esempio +39 02 1234 5678.",
    en: "Use the international format, for example +39 02 1234 5678.",
  },
  https: {
    it: "L'indirizzo deve iniziare con https://",
    en: "The address must start with https://",
  },
  url: {
    it: "Inserisci un indirizzo completo, incluso https://",
    en: "Enter a full address, including https://",
  },
  hex: {
    it: "I colori devono essere codici HEX a 6 cifre, come #1E90FF.",
    en: "Colours must be 6-digit HEX codes, like #1E90FF.",
  },
  number: { it: "Inserisci un numero.", en: "Enter a number." },
  partitaIva: {
    it: "Partita IVA non valida: servono 11 cifre con codice di controllo corretto.",
    en: "Invalid VAT number: 11 digits with a valid checksum are required.",
  },
  codiceFiscale: {
    it: "Codice fiscale non valido: 11 cifre per le società, 16 caratteri per le persone fisiche.",
    en: "Invalid tax code: 11 digits for companies, 16 characters for individuals.",
  },
  cap: { it: "Il CAP deve avere 5 cifre.", en: "The postcode must be 5 digits." },
  sdi: {
    it: "Il codice destinatario SDI ha 7 caratteri.",
    en: "The SDI recipient code is 7 characters.",
  },
  atLeastOneRow: {
    it: "Aggiungi almeno una riga.",
    en: "Add at least one row.",
  },
  consent: {
    it: "Devi accettare per continuare.",
    en: "You must accept this to continue.",
  },
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
}

/**
 * International format only: a leading +, country code, then 7–14 more digits.
 * Spaces, dots, dashes and parentheses are ignored so people can type naturally.
 */
export function isValidPhone(value: string): boolean {
  const digits = value.replace(/[\s.()\-/]/g, "")
  return /^\+\d{8,15}$/.test(digits)
}

/** Must be a parseable URL *and* use https. */
export function isValidHttpsUrl(value: string): boolean {
  const trimmed = value.trim()
  if (!/^https:\/\//i.test(trimmed)) return false
  try {
    new URL(trimmed)
    return true
  } catch {
    return false
  }
}

/**
 * Italian VAT number: 11 digits, Luhn-style checksum over all of them.
 * Odd-indexed digits are doubled, 9 is subtracted when the result exceeds 9,
 * and the total must be a multiple of 10.
 */
export function isValidPartitaIva(value: string): boolean {
  const digits = value.replace(/[\s.]/g, "").replace(/^IT/i, "")
  if (!/^\d{11}$/.test(digits)) return false

  let sum = 0
  for (let i = 0; i < 11; i++) {
    let n = Number(digits[i])
    if (i % 2 === 1) {
      n *= 2
      if (n > 9) n -= 9
    }
    sum += n
  }
  return sum % 10 === 0
}

/** 11 digits for a company, or the 16-character personal format. */
export function isValidCodiceFiscale(value: string): boolean {
  const code = value.replace(/\s/g, "").toUpperCase()
  if (/^\d{11}$/.test(code)) return isValidPartitaIva(code)
  return /^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/.test(code)
}

export function isValidCap(value: string): boolean {
  return /^\d{5}$/.test(value.trim())
}

export function isValidSdi(value: string): boolean {
  return /^[A-Z0-9]{7}$/i.test(value.trim())
}
