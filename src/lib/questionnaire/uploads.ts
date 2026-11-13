/** Private Storage bucket holding logos and other uploaded brand assets. */
export const BRANDING_BUCKET = "branding"

/** Anything bigger should be shared as a link instead. */
export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024

/** How long an admin's download link stays valid. */
export const SIGNED_URL_TTL_SECONDS = 60 * 60
