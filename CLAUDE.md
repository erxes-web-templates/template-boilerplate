# Template Boilerplate — Developer Guide

## 1. Role

You are a template developer building an erxes web template by cloning `template-boilerplate`. Your job is UI only: sections, components, pages, and styling. Composition is yours — the header's logo can sit in the middle with the menu first, a card grid can become a list, a stack can become an editorial split. Data fetching, business logic and routing are not: do not touch the auth flow, cart/checkout logic, GraphQL mutations, Apollo setup, `lib/client.ts`, `hooks/`, or `graphql/` (read those files to understand data shape, but never modify them).

Those shared folders — `lib/`, `graphql/`, `hooks/` and `types/` — are not in
the template at all. They live once in the monorepo's `packages/site-core` and
every template imports them as `@site-core/*` (see §10). Paths such as
`lib/client.ts` below mean `packages/site-core/lib/client.ts`.

Templates have no `node_modules` of their own and are compiled by the builder (see §9a). Never add a dependency to a template's `package.json`.

---

## 2. Template Types and Their Sections

| Template type | Sections to build | Key GraphQL queries | initData path |
|---|---|---|---|
| **ecommerce** | hero, products, productCategories, lastViewedProducts, banner, carousel, contact | `cpPoscProducts`, `cpPoscProductCategories`, `cpPoscProductDetail` | `apps/web-builder/src/initData/ecommerce/` |
| **tour** | hero, imageText (about), tours, bookingForm, gallery, contact | `cpBmToursGroupDetail` (from `graphql/tms/queries.ts`) | `apps/web-builder/src/initData/tour/` |
| **hotel** | hero, imageText (about), rooms, bookingForm, gallery, contact | `products` query from `graphql/pms/rooms/queries.ts` (uses `products` resolver under the hood) | `apps/web-builder/src/initData/hotel/` |
| **ticket** | hero, requestCategories, howItWorks, requestForm, trackRequest, contact | `cpGetTickets`, `cpGetTicket`, `cpCreateTicket`, `cpTags(type: "frontline:ticket")`, `cpTicketGetNotes` (from `graphql/tickets/`) | `apps/web-builder/src/initData/ticket/` |
| **business** | hero, imageText (about), cmsPosts, gallery, form, contact, banner | `cpCmsPosts`, `cpFormDetail` | (none — business templates use CMS content only) |

### Ticket templates: three things that bite

1. **`cpGetTickets` does not scope to the caller.** It applies `createdBy` only
   when the filter carries it, so querying without one returns every ticket in
   the channel — every other visitor's submissions included. `useMyRequests`
   stays skipped until it knows the customer id. That skip is a privacy
   control, not an optimisation.
2. **Status is an object, not a string.** Map on `status.type` (an Int, see
   `STAGE_BY_STATUS_TYPE`), which survives an admin renaming a status.
3. **`channelId`/`pipelineId`/`statusId` cannot be discovered from the portal**
   — listing channels and pipelines needs a staff login. They come from
   `section.config`, falling back to `NEXT_PUBLIC_ERXES_TICKET_*` env. See
   `lib/ticketConfig.ts`; an unconfigured form shows a notice rather than
   posting an invalid ticket.

Anonymous submission works (`cpCreateTicket` optional-chains `cpUser` and falls
back to the portal id), but every anonymous ticket then shares one `createdBy`,
so it can never be listed back — only opened by reference. Treat a reference as
a secret: `cpGetTicket` has no scoping at all.

---

## 3. How Sections Work

Every section is a React component that receives a `{ section: Section }` prop.

- `section.type` maps to a component in `app/_components/sections/index.ts` via the `sectionComponents` object. The key must match exactly.
- `section.config` is a JSON object set by the web builder at runtime. Read it in your component to get layout, color, content, and image overrides.
- `section.contentType` is metadata (e.g. `"bms:tours"`, `"ecommerce:products"`). It is used by the web builder UI to surface the right content pickers. It does not affect rendering — do not branch logic on it.

The `Section` type (from `@site-core/types/sections`):

```ts
interface Section {
  type: string;
  content?: string;
  contentType?: string;
  name: string;
  config?: any;
  contentTypeId: string;
}
```

---

## 4. Adding a New Section

1. **Create** `app/_components/sections/MySection.tsx`. Accept `{ section: Section }` as the only prop. Read all configurable values from `section.config`.
2. **Export** it from `app/_components/sections/index.ts` by adding it to the `sectionComponents` object with the section type string as the key.
3. **Register** in `packages/site-core/lib/renderSections.tsx` — add the type string to the `KnownSectionType` union. That file is shared by every template; adding a type to the union is safe, changing anything else there is a core change (§10).
4. **Verify wiring** in `app/page.tsx`. The `sectionComponents` spread should pick it up automatically — confirm there is no explicit exclusion.
5. **Seed** `apps/web-builder/src/initData/<template>/homePageSections.json` with a new entry using the correct `type` and `contentType` values.

---

## 5. Key Patterns (Non-Negotiable)

- **Parsing JSON fields**: `externalLinks.phones` and `.emails` are stored as JSON strings. Always use the `parseStringOrArray` helper (already in `ContactSection.tsx`) before calling `.map()`.
- **Stock check**: Use `remainder > 0`. Do NOT use `|| 999` as a fallback. If `remainder` is `null` or `undefined`, treat the item as in-stock (`true`).
- **ISR cache**: `lib/client.ts` uses `next: { revalidate: 60 }`. Do not change this value.
- **Images**: Always use `next/image` `<Image>`. Never use a bare `<img>` tag.
- **Internal links**: Always use `next/link` `<Link>`. Never use a bare `<a>` tag.
- **Tailwind only**: No inline styles. No hardcoded hex colors — use CSS variables or Tailwind tokens.
- **No static text in components**: Every string a visitor reads comes from `section.config`, the API, or site text — never a sentence written into the JSX. Headings, body copy, button labels, empty states and alt text included. Use `section.config?.heading` with a short neutral fallback (a word or two, or empty), not invented marketing copy, and seed the real value in initData. Interface text that isn't part of any one section (header and footer labels, empty and error states, form buttons) goes in `app/_components/siteText.ts` with an English default and is read with `useSiteText()` from that module; the owner edits it in the builder's Site text panel. Lorem ipsum is banned for the same reason: the problem is not the language, it is text the site's owner cannot edit.
- **Every section gets its own UI**: across templates, your `RoomsSection` must differ structurally from every other template's — not the same markup recoloured. Within a template, no two sections should share a structure. If a diff against the source shows only class names changing, it is not done.
- **TypeScript**: No `any` except when accessing `section.config` (it is typed `any` intentionally). Never use `any` in your own interfaces.

---

## 6. initData Seed Files

`homePageSections.json` is an array of page section objects seeded when a new project is created in the web builder.

`menuData.json` is an array of nav items seeded on first open.

Each section entry requires these fields:

| Field | Description |
|---|---|
| `type` | Must match a key in `sectionComponents` exactly |
| `contentType` | Metadata string for the web builder (e.g. `"ecommerce:products"`) |
| `name` | Human-readable label shown in the builder |
| `order` | Integer, ascending from `0` |
| `config` | Default config object matching what your component reads |

Use real Unsplash URLs for `initUrl` image fields. Do not use local `/images/` paths.

---

## 7. File Ownership

### Touch freely

| Path | Purpose |
|---|---|
| `app/_components/sections/*.tsx` | Your section components |
| `app/_components/sections/index.ts` | Register sections in `sectionComponents` |
| `components/common/*.tsx` | Shared UI (ProductCard, RoomCard, etc.) |
| `app/_components/sections/theme.ts` | Which of your palette tokens a section's text/background colour and the owner's secondary/accent colours drive |
| `app/_components/siteText.ts` | Your site-text catalog (keys are permanent once shipped) |
| `app/page.tsx` | Verify section wiring |
| `tailwind.config.ts` | Theme tokens, fonts, colors |
| `public/` | Static images for fallbacks |

### Do not touch

| Path | Reason |
|---|---|
| `packages/site-core/` (`@site-core/*`) | Shared by every template — changes go through §10, never as a one-template tweak |
| `app/_components/sections/render.ts` | Binds the core's `renderSections` / `usePage` to `theme.ts`; import those from here, not from `@site-core` |
| `app/checkout/`, `app/cart/`, `app/auth/`, `app/profile/` | Business logic, not UI templates |
| `app/_components/ClientShell.tsx` | Portal config wiring |

---

## 8. Checklist Before Submitting a Template

- [ ] All sections render without errors in the builder preview
- [ ] `cd apps/web-builder && yarn build` passes with 0 TypeScript errors (templates compile as part of the builder — there is no per-template build)
- [ ] The preview shows THIS template, not the boilerplate — if it looks wrong, the `renderTemplate` case is missing
- [ ] No static copy left in any component
- [ ] No `|| 999` remainder fallback anywhere
- [ ] No `console.log` left in components
- [ ] `homePageSections.json` uses real Unsplash URLs for images
- [ ] All section types are registered in `sectionComponents` and `KnownSectionType`
- [ ] Mobile layout tested (all sections responsive)
- [ ] `yarn template:check` passes with no errors
- [ ] Template has a catalog thumbnail (`yarn template:shoot <id>`)
- [ ] Manifest entry promoted from `wip` to `active` with its `catalog` block filled

---

## 9. Creating a New Template

**Prerequisites**
- `GH_ACCESS_TOKEN` in `apps/web-builder/.env` (GitHub PAT with `repo` scope)
- A GitHub repo created under the `erxes-web-templates` org, named after your template (e.g. `hotel-template-larch`)

**One command**

From the `web-builder` root:

```bash
yarn template:new hotel-template-larch --type hotel --name "Larch"
```

That copies the boilerplate into `apps/templates/`, names the package, adds the
entry to `templates.manifest.json`, and regenerates every registration point —
including the import and `case` in the builder's `renderTemplate`. There is
nothing else to register by hand.

Templates have no `node_modules` of their own, so there is nothing to install,
and the copy already uses the shared core (§10), so there is nothing to sync.
Start building sections (see §4):

```bash
cd apps/web-builder && yarn dev    # open a project and pick the template
```

A new template starts at status `wip` — present, synced and pushed, but not
offered in the builder. Promote it once its sections are built:

```bash
yarn template:shoot hotel-template-larch    # catalog thumbnail
# then set status to "active" and fill the catalog block in templates.manifest.json
yarn template:sync && yarn template:check
```

**Naming convention**

The id is used in three places and they must agree — `yarn template:check`
fails if they do not, and `yarn template:sync` fixes it.

| What | Format | Example |
|---|---|---|
| GitHub repo name | `<type>-template-<name>` | `hotel-template-larch` |
| Folder under `apps/templates/` | Matches repo name | `hotel-template-larch` |
| `package.json` `name` | Matches folder name | `hotel-template-larch` |

---

## 9a. The Manifest

`templates.manifest.json` at the repo root is the single source of truth for
which templates exist. These four are **generated from it** and must never be
edited by hand:

| Generated | Managed region |
|---|---|
| `scripts/clone-templates.sh` | `TEMPLATE_SPECS` block |
| `scripts/sync-template-core.sh` | `TEMPLATES` block |
| `scripts/push-templates.sh` | `TEMPLATES` block |
| `apps/web-builder/src/utils/templates.ts` | whole file |
| `apps/web-builder/src/app/dashboard/projects/[id]/page.tsx` | `template-imports` and `template-cases` blocks |

The last one is the one that matters. The others decide what is **listed**;
`renderTemplate` decides what is **rendered**. A template can be in the
catalog, the clone list and the sync list and still show the boilerplate,
because that switch is what picks the layout. `yarn template:check` treats a
catalog template missing from the switch as an error.

```bash
yarn template:sync              # regenerate everything from the manifest
yarn template:sync --dry-run    # show what would change
yarn template:check             # fail if anything has drifted
```

**Status** decides where a template appears:

| Status | Cloned | Core-synced | Pushed | In builder |
|---|---|---|---|---|
| `active` | yes | yes | yes | yes — needs a `catalog` block |
| `wip` | yes | yes | yes | no — `catalog` must be `null` |
| `archived` | no | no | no | no |

`yarn template:check` is the guard against the failure this design exists to
prevent: a template folder that is on disk but in none of the lists, so it
silently never reaches the builder. Run it in CI and before every PR.

**Templates have no `node_modules` or `.next`.** The builder compiles their
source through `"@templates/*": ["../templates/*"]` in its tsconfig, which also
`include`s `../templates/**/*` and excludes any template `node_modules` —
React, react-dom and react-hook-form are pinned to the hoisted copy so a stray
install cannot collide. Never run `yarn install` inside a template, and never
add a dependency to a template's `package.json`; it belongs to the builder.

This is also why a template is only viewable inside the builder, at
`/dashboard/projects/<projectId>?template=<id>` (see §12). The `dev` and
`preview` scripts in template `package.json` files are left over from an
earlier preview design and are not used.

---

## 10. The Shared Core (`packages/site-core`)

`lib/`, `graphql/`, `hooks/` and `types/` exist once, in the monorepo's
`packages/site-core`, and every template imports them as `@site-core/*`. Nothing
is copied into templates, so there is nothing to sync and no copy to drift.

The core cannot import any one template, so a template hands it what is its
own through three small files:

| File | Passes the core |
|---|---|
| `app/_components/sections/render.ts` | `theme.ts`'s `sectionTextTokens`, bound into `renderSections` and `usePage` |
| `app/_components/siteText.ts` | its catalog, via `createSiteText(siteText)` → `SiteTextProvider`, `useSiteText` |
| `ClientShell.tsx` / `ClientLayout.tsx` | `ownerColorTokens` from `theme.ts`, via `applyOwnerPalette(ownerColorTokens)` |

How the alias resolves:

- **In the monorepo**, `tsconfig.json` maps `@site-core/*` (and `@/lib/*`,
  `@/graphql/*`, `@/hooks/*`, `@/types/*`) to `../../../packages/site-core`;
  the builder's tsconfig maps `@site-core/*` the same way.
- **In the published repo**, `push-templates.sh` copies the package into the
  repo as `core/`, and the same tsconfig entries list `./core` first. The repo
  stays a standalone Next app the backend can build and deploy as before.
  `next.config.ts` imports its helper from `./core` for that reason, and
  `tailwind.config.ts` scans both `./core` and the package.

A change to the core reaches every template on its next push. Make it in
`packages/site-core`, check it from `apps/web-builder` with `npx tsc --noEmit`
(it compiles every template), and preview a couple of templates.

`sync-template-core.sh` still syncs **pages** from the boilerplate — for those,
from the `web-builder` root:

```bash
# Sync a specific page directory
./scripts/sync-template-core.sh app/checkout

# Sync a single file
./scripts/sync-template-core.sh --file app/checkout/page.tsx

# Copy only new files — never overwrites existing customizations
./scripts/sync-template-core.sh --missing app/_client
```

---

## 11. Pushing a Template to GitHub

From the `web-builder` root:

```bash
./scripts/push-templates.sh                             # default message
./scripts/push-templates.sh "feat: add hero section"   # custom message
```

The script re-clones the target GitHub repo to a temp dir, rsyncs your local template over it (excluding `.git`, `node_modules`, `.next`), and pushes only if there are changes.

Requirements: the template must be in `push-templates.sh`'s `TEMPLATES` array and its GitHub repo must exist under `erxes-web-templates/`.

---

## 12. Builder Preview (how the template renders inside the web builder)

The builder previews a template in an iframe pointed at its own route,
`/template-preview/<template>/<projectId>` — same origin as the builder, so
there is no second server to run or host. That route renders this template's
`ClientLayout` and links this template's stylesheet only:

| Piece | Role |
|---|---|
| `src/app/template-preview/[template]/[id]/page.tsx` (builder) | Renders the template's `ClientLayout`, loaded on its own (`templatePreviewLayouts.tsx`, generated) so no other template's code or CSS reaches the page |
| `src/app/template-preview-css/[template]/route.ts` (builder) | Builds this template's `app/globals.css` with this template's `tailwind.config.ts`; prebuilt at `next build` for production |
| `src/lib/templatePreview.ts` (builder) | Keeps the preview in step with the builder over a `BroadcastChannel`: saves refetch, unsaved colour/font/site-text drafts apply live |
| `@site-core/lib/buildMode` | Treats `/template-preview/` as build mode |

A template previews this way once its `tailwind.config.ts` uses
`content: { relative: true, files: [...] }` — the builder builds the CSS from
its own directory, so the globs must be relative to the config.
`yarn template:sync` lists such templates in `IFRAME_PREVIEW_TEMPLATES`; the
rest still render inline in the builder's page (wrong fonts and tokens for
anything custom). The boilerplate is set up this way, so a template made from
it previews in the iframe from the start.

Two rules keep the preview faithful:

- **Load fonts from `app/globals.css`** (`@import url(...)` of Google Fonts), not
  `next/font` in `app/layout.tsx`. The preview renders `ClientLayout`, never
  `layout.tsx`, so fonts loaded there are missing from the preview.
- **No `@config` in `globals.css`.** The builder passes the config itself.
