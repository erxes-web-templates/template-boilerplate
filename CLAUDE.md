# Template Boilerplate — Developer Guide

## 1. Role

You are a template developer building an erxes web template by cloning `template-boilerplate`. Your job is UI only: sections, components, pages, and styling. Composition is yours — the header's logo can sit in the middle with the menu first, a card grid can become a list, a stack can become an editorial split. Data fetching, business logic and routing are not: do not touch the auth flow, cart/checkout logic, GraphQL mutations, Apollo setup, `lib/client.ts`, `hooks/`, or `graphql/` (read those files to understand data shape, but never modify them).

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

The `Section` type (from `types/sections.ts`):

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
3. **Register** in `lib/renderSections.tsx` — add the type string to the `KnownSectionType` union.
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
- **No static text in components**: Every string a visitor reads comes from `section.config` or the API — never a sentence written into the JSX. Headings, body copy, button labels, empty states and alt text included. Use `section.config?.heading` with a short neutral fallback (a word or two, or empty), not invented marketing copy, and seed the real value in initData. Lorem ipsum is banned for the same reason: the problem is not the language, it is text the site's owner cannot edit.
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
| `lib/renderSections.tsx` | Add new section types to `KnownSectionType` |
| `app/page.tsx` | Verify section wiring |
| `tailwind.config.ts` | Theme tokens, fonts, colors |
| `public/` | Static images for fallbacks |

### Do not touch

| Path | Reason |
|---|---|
| `lib/client.ts` | Apollo server client — ISR config lives here |
| `hooks/` | Shared and tested — hands off |
| `graphql/` | Read to understand data shape, never modify |
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

Templates have no `node_modules` of their own, so there is nothing to install.
Then sync core infrastructure and start building sections (see §4):

```bash
./scripts/sync-template-core.sh
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
`/dashboard/projects/<projectId>?template=<id>`. The `dev` and `preview`
scripts in template `package.json` files belong to the unmerged preview branch
(§12) and do nothing useful on `main`.

---

## 10. Core Infrastructure Sync

`lib/`, `graphql/`, `types/`, and `hooks/` are **owned by `template-boilerplate`**. Never edit them directly in a derived template — changes will be overwritten on the next sync.

When boilerplate updates any of these, from the `web-builder` root:

```bash
# Sync all templates (lib/, graphql/, types/, hooks/)
./scripts/sync-template-core.sh

# Sync a specific page directory
./scripts/sync-template-core.sh app/checkout

# Sync a single file
./scripts/sync-template-core.sh --file app/checkout/page.tsx

# Copy only new files — never overwrites existing customizations
./scripts/sync-template-core.sh --missing app/_client
```

After syncing, commit in each template with:

```
chore: sync lib/ from template-boilerplate

- <brief description of what changed>
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

> **Status: not on `main`.** This section describes the iframe preview
> architecture, which lives on the `template-preview-architecture` branch and
> has not been merged. On `main` the files below do not exist —
> `apps/web-builder/src/utils/templatePreview.ts`,
> `scripts/add-preview-route.sh`, `scripts/preview-templates.sh`, and the
> `yarn preview:all` script. Do not follow these steps against `main`; they
> will send you looking for files that are not there.
>
> What *is* on `main`: every template has its own `preview` script on its own
> port, assigned by `templates.manifest.json` (§9a). `cd apps/templates/<id> &&
> yarn preview` works today. When the preview branch merges, `DEV_PREVIEW_PORTS`
> should be dropped in favour of `TEMPLATE_PREVIEW_PORTS`, which
> `apps/web-builder/src/utils/templates.ts` already exports from the manifest —
> that removes the "keep this in sync with your preview script's port" step
> described below.

The builder no longer renders a template inline in its own React tree. It
points an iframe at the template's **own** server, so the preview loads this
template's `globals.css`, fonts and env — the exact CSS the built site uses.

Rendering inline meant the builder's Tailwind build had to know about every
template's custom tokens. It didn't, so `bg-night`, `text-ink`, `.display-xl`,
`.arch` and friends compiled to nothing and every template previewed in the
builder's own palette and Inter.

### Run a preview

```bash
yarn preview     # BUILD_MODE=build next dev -p <template port>
```

`BUILD_MODE=build` matters: it makes `isBuildMode()` agree on the server and
the client, avoiding hydration mismatches.

### The pieces

| File | Role |
|---|---|
| `app/dashboard/projects/[id]/page.tsx` | The preview route. Renders `ClientLayout`. `isBuildMode()` already keys off this path and `templateUrl()` already emits links of this shape. |
| `app/_components/PreviewEnvBridge.tsx` | Receives the builder's env over `postMessage` and writes it into this origin's localStorage. |
| `app/_components/ClientShell.tsx` | Drops to providers-only on the preview path, because `ClientLayout` brings its own Header and Footer. |
| `lib/utils.ts` → `getEnv()` | Falls back to `process.env` so a cross-origin preview still resolves the API host. |
| `apps/web-builder/src/utils/templatePreview.ts` | Builder side: resolves the preview origin and collects the env to post. |

### Registering a preview origin

The builder resolves the origin in this order:

1. `NEXT_PUBLIC_TEMPLATE_PREVIEW_ORIGINS` — a JSON map, e.g.
   `{"hotel-template-nocturne":"https://nocturne.preview.erxes.io"}`
2. `http://localhost:<port>` in development, from `DEV_PREVIEW_PORTS` in
   `templatePreview.ts` — keep this in sync with your `preview` script's port
3. `null` — the builder falls back to the old inline render

So a new template needs its port added to **both** its `preview` script and
`DEV_PREVIEW_PORTS`, and a deployed origin added to the env map for production.

To install this route into a freshly cloned template:

```bash
./scripts/add-preview-route.sh <template-name> <port>   # apply
./scripts/add-preview-route.sh <template-name> --check   # verify only
```

It copies the two new files and writes the `preview` script, then *verifies*
the rest rather than patching it: `ClientShell.tsx` and `lib/utils.ts` diverge
between templates (each shell wraps `children` differently, and some templates
carry their own `getFileUrl`), so overwriting them with the boilerplate copies
destroys real work. Anything it cannot safely do it prints as a `→` to fix by
hand.

### Running previews while you work

The builder switches templates in real time (`?template=` is a search param),
and each one previews on its own port — so to switch freely, those ports have
to be listening.

```bash
cd apps/web-builder && yarn dev        # the builder, port 3400
yarn preview                           # the template you are editing
```

For everything else, from the repo root:

```bash
yarn preview:all                            # every template, one command
./scripts/preview-templates.sh --skip <name> # ...except the one you are editing
```

That script serves a production build (`next build` + `next start`) rather than
`next dev`, because `next dev` keeps a file watcher per template and one alone
is enough to hit `EMFILE: too many open files` on macOS. No hot reload, so keep
using `yarn preview` for the template you are actually changing.

Do **not** use the root `yarn dev` for this. It is `turbo run dev --parallel`,
which starts every template's `dev` script — and those were never renumbered,
so most still collide on 3400/3401.

If a template is not running, the builder now falls back to rendering it inline
(wrong fonts and tokens, but not blank) and shows a notice with a retry. See
`PREVIEW_READY_TIMEOUT_MS` in the builder's project page.

Leaving template `node_modules` installed used to break the builder — its
tsconfig `include`s `../templates/**/*`, so each template's React 19 types
collided with the builder's React 18, and its Tailwind `content` glob scanned
every template's `node_modules`. Both are fixed in `apps/web-builder`
(`paths` pins react/react-dom/react-hook-form to the hoisted copy; the Tailwind
globs are scoped to `app/`, `components/`, `lib/`), so installed templates are
now fine to leave in place.

### Env crosses origins by handshake

localStorage is per-origin, so the preview cannot read what the builder stored.
On mount the template posts `erxes-preview-ready` to its parent; the builder
replies with `erxes-builder-env`, targeted at the preview origin (never `*`).
`PreviewEnvBridge` writes those into its own localStorage and re-renders.

### Known gap

`app/booking/page.tsx` branches on `process.env.TEMPLATE_TYPE`, which is baked
in at the template's own build time — so it is now correct in the preview too.
It was wrong under the old inline render, where it resolved against the
builder's env and always fell back to `"tour"`.
