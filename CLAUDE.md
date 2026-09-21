# Template Boilerplate — Developer Guide

## 1. Role

You are a template developer building an erxes web template by cloning `template-boilerplate`. Your job is UI only: sections, components, pages, and styling. Do not touch the auth flow, cart/checkout logic, GraphQL mutations, Apollo setup, `lib/client.ts`, `hooks/`, or `graphql/` (read those files to understand data shape, but never modify them).

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
- **No lorem ipsum**: All placeholder text must be real copy in the template's target language.
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

- [ ] All sections render without errors on `/`
- [ ] `pnpm build` passes with 0 TypeScript errors
- [ ] No `|| 999` remainder fallback anywhere
- [ ] No `console.log` left in components
- [ ] `homePageSections.json` uses real Unsplash URLs for images
- [ ] All section types are registered in `sectionComponents` and `KnownSectionType`
- [ ] Mobile layout tested (all sections responsive)
- [ ] Template is registered in `clone-templates.sh`, `sync-template-core.sh`, and `push-templates.sh`

---

## 9. Creating a New Template

**Prerequisites**
- `GH_ACCESS_TOKEN` in `apps/web-builder/.env` (GitHub PAT with `repo` scope)
- A GitHub repo created under the `erxes-web-templates` org, named after your template (e.g. `tour-template-5`)

**Steps**

1. **Register in `clone-templates.sh`** — add the name to the `templates` array and add a `git clone` line:
   ```bash
   git clone --branch main "https://x-access-token:${GH_ACCESS_TOKEN}@github.com/erxes-web-templates/your-template-name.git" "$TEMPLATES_DIR/your-template-name"
   ```

2. **Clone all templates** from the `web-builder` root:
   ```bash
   ./scripts/clone-templates.sh
   ```
   Clones into `apps/templates/` and strips `.git` — result is a clean working copy.

3. **Seed from boilerplate** — if the GitHub repo is empty, copy the boilerplate as a starting point:
   ```bash
   cp -r apps/templates/template-boilerplate apps/templates/your-template-name
   ```

4. **Register in sync and push scripts** — add the template name to `TEMPLATES` in both `sync-template-core.sh` and `push-templates.sh`.

5. **Sync core infrastructure**:
   ```bash
   ./scripts/sync-template-core.sh
   ```
   Pulls the latest `lib/`, `graphql/`, `types/`, `hooks/` from boilerplate into your template. Run this after every `clone-templates.sh`.

Now build your sections (see §4).

**Naming convention**

| What | Format | Example |
|---|---|---|
| GitHub repo name | `<type>-template-<N>` | `tour-template-5` |
| Folder under `apps/templates/` | Matches repo name | `tour-template-5` |
| `package.json` `name` | Matches folder name | `tour-template-5` |

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
