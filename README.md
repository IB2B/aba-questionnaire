# GoHighLevel White-Label Onboarding

A client onboarding questionnaire for our GoHighLevel white-label service.
The client who just bought Agency Unlimited fills this in once; we get
everything we need to set up hosting, DNS, branding, email, phone, payments
and snapshots from A to Z.

- **The client** signs in, works through seven short steps at their own pace,
  reviews everything, and submits. Progress autosaves, so they can close the
  tab and come back later. Once submitted, the form locks.
- **We** get an email summary the moment they submit, and can read every
  answer — including their uploaded logos — in the admin area.

## Stack

| Piece    | Choice                                          |
| -------- | ----------------------------------------------- |
| Frontend | Next.js 16 (App Router, React 19, TypeScript)    |
| Styling  | Tailwind CSS v4, shadcn/ui, Geist Sans + Mono    |
| Theme    | Light / dark / system via `next-themes`          |
| Language | Italian (default) and English, toggled in the header |
| Backend  | Supabase — Postgres, Auth, Storage, Row Level Security |
| Email    | Resend (optional — the app works without it)     |

## Setup

### 1. Supabase

Create a project at [supabase.com](https://supabase.com), then in
**SQL Editor → New query** run, in this order:

1. [`supabase/schema.sql`](supabase/schema.sql) — tables, RLS policies, the
   private `branding` storage bucket, and the trigger that creates a profile
   for every new user.
2. [`supabase/create-users.sql`](supabase/create-users.sql) — creates the two
   accounts. There is no public signup.

### 2. Environment

```bash
cp .env.example .env.local
```

| Variable | Required | What it is |
| -------- | -------- | ---------- |
| `NEXT_PUBLIC_SUPABASE_URL` | yes | Project Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | The **publishable** key, never the secret one — this value ships to the browser, and RLS is what protects the data |
| `RESEND_API_KEY` | no | From [resend.com/api-keys](https://resend.com/api-keys). Leave empty and submission emails are skipped; everything else still works |
| `NOTIFY_EMAIL_TO` | no | Who gets the summary. Comma-separate for several people |
| `NOTIFY_EMAIL_FROM` | no | A sender on a domain you have verified in Resend |

Next.js reads env files at startup only — restart the dev server after editing.

### 3. Run

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. You will be sent to `/login`.

## Customising

### Brand colours

Three CSS variables at the top of
[`src/app/globals.css`](src/app/globals.css) drive buttons, focus rings, the
progress bar and links, in both light and dark mode:

```css
:root {
  --brand: oklch(0.205 0 0);
  --brand-foreground: oklch(0.985 0 0);  /* text on the brand colour */
  --brand-ring: oklch(0.708 0 0);        /* focus ring */
}
```

Values are `oklch(lightness chroma hue)` — paste a HEX into
[oklch.com](https://oklch.com) to convert.

### The questions

All seven sections live in
[`src/lib/questionnaire/questions.ts`](src/lib/questionnaire/questions.ts).
The form, validation, progress bar, review step, admin view and the email
summary all read from it, so changing a question there updates everything.

Every visible string is a `{ it, en }` pair — Italian first. Interface strings
(buttons, errors, admin labels) live in [`src/lib/i18n/index.ts`](src/lib/i18n/index.ts);
the chosen language is kept in a `lang` cookie so server-rendered pages match.

Field types: `text`, `textarea`, `email`, `url`, `tel`, `number`, `date`,
`radio`, `checkbox`, `select`, `toggle` (Yes/No buttons), `color` (swatch
picker), `file` (upload or paste a link), `repeater` (repeatable rows),
`consent` (a single required checkbox, for GDPR).

Italian formats are checked by `format` on a question — `partita_iva` (11
digits with the checksum), `codice_fiscale` (11 or 16 characters), `cap`
(5 digits) and `sdi` (7 characters). Phones must be international (`+39 …`)
and URLs must start with `https://`. The rules live in
[`src/lib/questionnaire/validators.ts`](src/lib/questionnaire/validators.ts).

Extras any question can use:

```ts
required: true                                     // renders a *
showIf: { questionId: "sms_to_us", equals: true }  // conditional field
showIf: { questionId: "phone_countries", includes: "other" }
optOut: { id: "menu_changes_default", label: "Leave it to you" }
note: "Paid add-on, not included in the $297 plan."
```

Hidden questions are skipped by validation and left out of the progress
count, so a required field inside a branch the client never opens will not
block them.

Each question's `id` is the key its answer is stored under in
`responses.answers`. **Renaming an id orphans existing answers** — add a new
question instead.

## How answers are stored

One row per client in `public.responses`, with every answer in a single
`jsonb` column. Uploaded files go to the private `branding` bucket under a
folder named after the client's user id; the admin screen hands out signed
URLs that expire after an hour.

## Routes

| Route | Who | What |
| ----- | --- | ---- |
| `/login` | anyone | Sign in |
| `/` | signed in | Redirects by role |
| `/questionnaire` | client | The form, or the confirmation screen once submitted |
| `/admin` | admin | Every response, with status and progress |
| `/admin/[id]` | admin | One response in full |

Access is enforced twice: [`src/proxy.ts`](src/proxy.ts) redirects signed-out
visitors to `/login`, and RLS stops a client reading anyone else's row even
if they call the Supabase API directly.

## Deploying

The app is a standard Next.js project — Vercel is the shortest path:

```bash
npx vercel
```

Then in the Vercel dashboard add the same environment variables as
`.env.local` (**Settings → Environment Variables**) and redeploy. The
publishable key is fine to expose; the Supabase secret key is not used
anywhere in this project and should never be added.

Anywhere that runs Node 20+ works too:

```bash
npm run build
npm start
```

One thing to set on the Supabase side before going live: under
**Authentication → URL Configuration**, set the Site URL to your deployed
domain.

## Scripts

```bash
npm run dev        # dev server
npm run build      # production build
npm run start      # serve the production build
npm run typecheck  # tsc --noEmit
npm run lint       # eslint
npm run test:form  # walk every step of the form end to end
```

`test:form` drives the real validation, visibility, defaults and progress code
through all eight steps in both languages, and prints the summary email it
would send. Run it after editing the questions.
