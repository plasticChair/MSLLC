# Shermanator LLC

A bright, sage-green consulting website for Mary Sherman. Built with vanilla
JavaScript, Vite, and lucide icons, and configured for Cloudflare Workers static
assets. Section content is edited in Markdown and rendered at build time.
No database or third-party form service is needed. See [EDITING.md](EDITING.md).

## Content

The site uses the professional summary provided by the owner: over eight years
of experience, technical support for four long-term foster-care programs at
Global Refuge, two program launches, and expertise in program development,
compliance, grants, and stakeholder engagement.

Shermanator LLC is a working business name, not a claim of registered LLC status.
The services and first-person copy are proposed positioning for Mary's review.
No testimonials, qualifications, employment dates, or contact details have been
invented. The LinkedIn link points to https://www.linkedin.com/in/shermanmary/.

## Local Development

Use Node.js 22.12 or newer and npm:

```sh
npm install
npm run dev
```

Vite prints the preview URL, normally http://127.0.0.1:5173. Saving a content
Markdown file refreshes the browser. On this machine, use the **Edit website
(live preview)** VS Code task to start it with the portable runtime.
Development mode uses the public email from `content/contact.md`, if configured.
To test the actual Worker and production assets:

```sh
npm run worker:dev
```

Wrangler normally serves http://127.0.0.1:8787. The workspace also includes a
**Preview Cloudflare Worker** VS Code task using the portable Node runtime that
was downloaded for this machine. Its absolute runtime path is machine-specific;
replace the task command with `node` after installing Node normally or when
moving to another machine. Build with `npm run build` or the **Build website**
task before running that preview. If CSS or JavaScript returns 404 after a
rebuild, terminate and rerun the Worker preview to refresh its asset manifest.

The portable runtime is outside the project, in
`%TEMP%\mary-website-tools\node-v22.23.3-win-x64`. It was downloaded from nodejs.org
and verified against the official SHA-256 checksum. No system installation or
administrator permission was required. Standard npm commands above assume Node
is installed on PATH. On this machine, the build can also be run in PowerShell:

```powershell
& "$env:TEMP\mary-website-tools\node-v22.23.3-win-x64\node.exe" .\node_modules\vite\bin\vite.js build
```

## Deploy to Cloudflare Workers

1. Sign into the intended Cloudflare account locally:

   ```sh
   npx wrangler login
   ```

2. Review the Worker name in `wrangler.jsonc`, then build and deploy:

   ```sh
   npm run deploy
   ```

3. Wrangler prints the deployed `workers.dev` address. The static website and
   `/api/config` Worker endpoint deploy together. No Cloudflare Pages project is
   required.

4. To add a domain, open **Workers & Pages > shermanator-website > Settings >
   Domains & Routes > Add > Custom Domain** in Cloudflare. Use a domain in a
   Cloudflare-managed zone. Cloudflare manages DNS and HTTPS for that route.

For Git-based deployments, push the project to your repository and connect it
through Cloudflare Workers Builds. Use `npm run build` as the build command and
`npx wrangler deploy` as the deploy command, with the repository root as the root
directory. Do not commit account tokens or `.dev.vars`.

Deployment requires your Cloudflare account authorization. This project does
not contain account credentials and has not automatically been published.

## Add the Contact Email

Set `email` in `content/contact.md` to Mary's approved **public** email, or keep
it empty for a placeholder. A valid nonempty `vars.CONTACT_EMAIL` in
`wrangler.jsonc` overrides it on the Worker. Both are public contact information,
not secrets. A dashboard-only Worker variable can be overwritten by a later
Wrangler deployment.

The form prepares a draft and never submits or stores inquiry details. While
the email is blank, visitors can copy their inquiry and open Mary's LinkedIn.
Once configured, an **Open email draft** action opens the visitor's email app;
the visitor still chooses whether to send. A browser-based mailto draft depends
on a configured email application and its message-length limits. Adding direct
website delivery later would require an email provider, spam protection, and an
updated privacy policy.

## Checks

```sh
npm test
npm run build
npx wrangler deploy --dry-run
```

Tests cover Worker routing, absent/invalid/public contact configuration, inquiry
formatting, safe mailto encoding, Markdown rendering and validation, synchronized
service options, and complete Cloudflare runtime platform entries in the
dependency lockfile. Static assets include security headers.
The site supports mobile navigation, visible keyboard focus, a skip link, native
accessible dialogs, and reduced-motion preferences.

### Cloudflare Dependency Installation

Workers Builds installs dependencies with `npm ci`. Commit `package.json` and
`package-lock.json` together. An `EUSAGE` error listing missing
`@cloudflare/workerd-*` packages means the lockfile lacks optional platform
entries, even if a cached local installation still builds successfully.

The dependency regression test checks those entries. To regenerate an incomplete
lockfile, use a clean temporary directory containing only `package.json` and run
`npm install --package-lock-only`. Review dependency-version changes before
replacing and committing the generated lockfile. A dry run alone may not catch
missing optional entries; validate with an actual clean install in isolation.

## Editing

- `content/*.md`: section text, branding, metadata, photos, and form labels.
- `content/services/*.md`: individual services and their inquiry options.
- [EDITING.md](EDITING.md): file map and step-by-step editing guide.
- `index.html`: shared layout template; ordinary content edits do not go here.
- `build/content.js` and `vite.config.js`: build-time content rendering and live reload.
- `src/style.css`: palette, typography, layouts, and responsive breakpoints.
- `src/main.js`: navigation, dialogs, clipboard, and public contact loading.
- `src/inquiry.js`: draft formatting and mailto construction.
- `worker/index.js`: public configuration endpoint and static-asset routing.
- `wrangler.jsonc`: Worker name, asset directory, and contact email.

Before publishing, confirm the final business name, Mary's approval of the
service copy, contact details, and the domain. Add an existing website only when
an approved URL is available. The current photo and caption are preserved in
`content/about.md` and can be changed there.

## Assets and Privacy

The decorative hero landscape is locally hosted from
https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05 under the
[Unsplash license](https://unsplash.com/license). The About photo is provided by
the site owner; confirm permission to publish any replacement photo.

DM Sans and Fraunces are loaded through Google Fonts. Google and Cloudflare can
process standard requests; the site includes no analytics, tracking cookies, or
submission storage. Markdown files are source content, not a public admin panel.