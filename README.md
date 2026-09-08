# YumBook

A React Native recipe book built with **Expo SDK 57** and **TypeScript**.

Browse a collection of recipes, filter them by type, add your own with a photo,
ingredients and method steps, then edit or delete them. Everything is stored
on-device and survives an app restart.

Repository: <https://github.com/danishayman/RecipeApp>

## Getting started

### Requirements

- **Node.js 20+**
- An **Android emulator** (Android Studio) or **iOS simulator** (Xcode, macOS
  only), or the [Expo Go](https://expo.dev/go) app on a physical device

No custom native build is needed: every native module used here
(`expo-image-picker`, `@react-native-picker/picker`,
`@react-native-async-storage/async-storage`, `expo-file-system`) ships inside
Expo Go.

### Run it

```bash
git clone https://github.com/danishayman/RecipeApp.git
```

```bash
cd RecipeApp && npm install
```

```bash
npx expo start
```

Then press `a` for Android, `i` for iOS, or scan the QR code with Expo Go.

The app opens on a sign-in screen. A demo account is created on first launch
and its credentials are also shown on the screen itself:

| Username | Password     |
| -------- | ------------ |
| `demo`   | `recipes123` |

"Create an account instead" registers a new one.

### Scripts

| Script                 | Purpose                     |
| ---------------------- | --------------------------- |
| `npm start`            | Start the Metro dev server  |
| `npm run android`      | Start and open on Android   |
| `npm run ios`          | Start and open on iOS       |
| `npm run web`          | Start and open in a browser |
| `npm run lint`         | ESLint                      |
| `npm run typecheck`    | `tsc --noEmit`              |
| `npm run format`       | Prettier, write             |
| `npm run format:check` | Prettier, check only        |

Lint, typecheck and format all pass with no warnings.

---

## How it is put together

```
src/
  app/                    Expo Router routes (file-based navigation)
    _layout.tsx           Root stack, theme, providers, auth gate, error boundary
    login.tsx             Sign in / create account
    index.tsx             Recipe listing + type filter
    add.tsx               Add Recipe
    recipe/[id].tsx       Recipe detail, edit mode, delete
  components/             Presentational components, one job each
  constants/theme.ts      Design tokens: colours, spacing, radii, breakpoints
  data/
    recipetypes.json      Source of truth for recipe categories
    sample-recipes.json   Pre-populated recipes
    recipe-catalog.ts     Validated, frozen catalog + lookups
    recipe-factory.ts     Id/timestamp generation, draft normalisation
    recipe-form.ts        Form value shape, validation, draft conversion
    auth-form.ts          Login form shape and rules
    credentials.ts        Password hashing and credential guards
    validation.ts         Runtime type guards
  hooks/
    use-recipe-types.ts    Categories + label/emoji lookups
    use-recipe-filter.ts   Category filter, derived list and summary
    use-recipe-form.ts     Form values, validation timing, save lifecycle
    use-image-picker.ts    Permissions, camera/library, persist the result
    use-async-callback.ts  Pending/error state for any async action
    use-layout.ts          Orientation, breakpoints, column count
    use-theme.ts           Palette for the active colour scheme
  state/
    recipes-provider.tsx  RecipesProvider + useRecipes: the shared collection
    auth-provider.tsx     AuthProvider + useAuth: the signed-in user
  storage/
    key-value-store.ts    KeyValueStore interface over AsyncStorage
    secure-store.ts       The same interface over SecureStore
    recipe-repository.ts  All reads/writes, seeding, versioned keys
    auth-repository.ts    Accounts and session, in secure storage
    photo-storage.ts      Copies picked photos into permanent storage
  types/
    recipe.ts             Recipe / RecipeType / RecipeDraft
    auth.ts               Credential / Session
```

### Data flow

`recipetypes.json` → `recipe-catalog` → the Picker on every screen. The list
filter and both forms read the same catalog, so they cannot drift apart.

`RecipeRepository` owns device storage: JSON encoding, namespaced and
versioned keys, and first-launch seeding. `RecipesProvider` holds the
collection in memory so the listing, add and detail screens all mutate one
array rather than refetching on focus.

### Design language

The YumBook look uses a warm paper ground, an editorial serif doing the headline work,
monospace for every piece of metadata, and hairline-ruled rows rather than
cards — a recipe box rather than a feed. The ember accent (`#E8590C`) carried
over from the original palette unchanged; only the neutrals warmed up.

Three families, each with one job, defined once in `ThemedText`:

| Family | Role                                             | Variants                              |
| ------ | ------------------------------------------------ | ------------------------------------- |
| Serif  | headings                                         | `subtitle`, `heading`, `headingSmall` |
| Mono   | metadata and field labels, uppercase and tracked | `label`, `meta`                       |
| Sans   | body copy                                        | `default`, `small`, `smallBold`       |

The design names Newsreader, IBM Plex Mono and Spline Sans. These map to the
platform's own serif, monospace and sans through `Fonts` in
`constants/theme.ts`, so the app ships no font files; adopting the real
families later is a change to that one object.

Two colours were adjusted away from the reference, because the reference values
do not clear WCAG AA and the measured ratios are in the code comments:

- secondary text moved from `#7A7168` to `#766E63` — the original measures
  4.48:1 on paper, a hair under the 4.5:1 small text needs;
- button labels on the ember are dark ink (`#2B1000`, 4.98:1) rather than white
  (3.58:1), which also matches what the dark scheme already did.

A separate `accentStrong` token exists for the accent used _as text_: the accent
itself only reaches 3.35:1 on paper, fine as a fill but not as words.

The direction also proposed a bottom tab bar and a step-by-step cook mode.
Both were left out deliberately — this pass changes how the app looks, not what
it does, so every behaviour verified earlier still holds.

### Search

The listing has a free-text search beside the category spinner. A query matches
against a recipe's title, description, category label, ingredients **and**
steps, so "lemon" finds the Caesar salad on `1 tbsp lemon juice` even though
neither its title nor its blurb mentions it.

What counts as a match lives in `data/recipe-search.ts`; the query itself is
screen-local state in `useRecipeFilter`, alongside the category. Both narrowings
feed one `useMemo`, which is what keeps the count from ever disagreeing with the
rows beneath it — the summary reads, for example, "1 recipe in Soup matching
“lemon”".

The magnifier is drawn from two views rather than the `⌕` character the design
uses: that glyph is missing from several Android system fonts and would render
as a blank box.

### Custom hooks

Behaviour that more than one screen needed lives in a hook rather than in a
component, so the components are left doing layout and the logic is testable
and reusable on its own.

| Hook               | What it owns                                                     | Used by                                  |
| ------------------ | ---------------------------------------------------------------- | ---------------------------------------- |
| `useRecipes`       | The shared collection and its CRUD operations (context)          | Every screen                             |
| `useRecipeTypes`   | Categories from `recipetypes.json`, plus label and emoji lookups | Picker, cards, detail, image placeholder |
| `useRecipeFilter`  | Category selection, the filtered list and its pluralised summary | Listing                                  |
| `useRecipeForm`    | Form values, when validation is allowed to speak, the save       | Add screen and detail edit mode          |
| `useImagePicker`   | Permission, camera/library launch, copy into permanent storage   | Photo field                              |
| `useAsyncCallback` | Pending and error state around any async action                  | `useRecipeForm`, `useImagePicker`        |
| `useLayout`        | Orientation, tablet breakpoint, column count                     | Listing, detail                          |
| `useTheme`         | The palette for the active colour scheme                         | Everywhere                               |

Two decisions inside them are worth pointing out.

**Validation errors are derived, not stored.** `useRecipeForm` computes them
with `useMemo` from the current values and a "has tried to submit yet" flag.
Holding them in state would mean re-validating in an effect every time a field
changed, and they could then fall out of step with what the user has typed.
The visible behaviour is that the form stays quiet until the first submit, and
from then on each error clears as its field is fixed.

**The one effect that remains is a genuine subscription.** `useAsyncCallback`
uses `useEffect` for what effects are actually for - synchronising with
something outside React. Its cleanup marks the component unmounted so a save
or a photo pick that settles after the user has navigated away does not set
state on a component that is gone.

### Authentication

A sign-in gate sits in front of the app. `Stack.Protected` from expo-router
hides the app routes while `isSignedIn` is false and hides the login route
while it is true, so signing out needs no imperative navigation: the guard
flips and the only remaining screen is the one that renders.

`AuthRepository` is built exactly like `RecipeRepository` but is handed the
SecureStore implementation of `KeyValueStore` rather than the AsyncStorage one.
That swap is the whole reason the interface exists.

**What is stored, and what is not.** The password is never written anywhere.
Each account gets a random 16-byte salt, and what goes to disk is the salt plus
`SHA-256(salt + password)`:

```json
{ "username": "demo", "salt": "65bc249f…", "hash": "53839f03…", "createdAt": "…" }
```

Signing in re-hashes the entered password with the stored salt and compares
digests. The stored digest is never reversed, because it cannot be. Both the
account list and the session live in SecureStore, which is the Android Keystore
and the iOS Keychain — encrypted at rest and excluded from ordinary backups.

**Where this falls short, stated plainly.** SHA-256 is a _fast_ hash, which is
the wrong property for password storage: someone holding the digest can try
candidates quickly. Real systems use a deliberately slow KDF — bcrypt, scrypt
or Argon2 — on a server. `expo-crypto` exposes no KDF, and iterating its
digest enough times to matter would mean thousands of async native calls on a
sign-in. For a local, offline demo whose digest sits in hardware-backed storage
this is a reasonable trade; it is not production-grade password handling and is
not presented as such.

**SecureStore has no web implementation.** On web the store falls back to
AsyncStorage with a console warning, and the values are _not_ encrypted there.
The app is mobile-first; a real web deployment would keep the session in an
HTTP-only cookie set by a server.

The session deliberately carries no expiry — the brief asks for it to persist
until logout, and it does.

### Decisions worth calling out

**Expo rather than the bare React Native CLI.** The assessment prefers the CLI.
This repository was scaffolded with Expo SDK 57 and its `AGENTS.md` pins the
project to the Expo v57 documentation, so the existing toolchain was kept. The
navigation, storage, picker and camera work is the same either way; only the
build tooling differs.

**Seeding is guarded by a separate flag key.** If the seeded marker lived in
the recipe list itself, a user who deleted every recipe would have the samples
reappear on the next launch. A dedicated `yumbook:seeded:v1` key keeps
"first launch" and "deliberately empty" distinct.

**Picked photos are copied into the document directory.** The image picker
returns a URI inside the app's _cache_ directory, which the OS may purge. The
copy in `photo-storage.ts` is what makes a photo outlive a restart alongside
the recipe. Replacing a photo or deleting a recipe removes the orphaned file.

**Everything read back is validated.** Bundled JSON and stored JSON both pass
through runtime guards. A malformed record is dropped rather than crashing a
screen, and unparseable storage degrades to an empty list with a working
"Add a recipe" action.

**Sample photos are remote URLs.** The six seeded recipes point at
Creative-Commons images on Wikimedia Commons. On a device with no network they
fall back to a category-emoji tile rather than an empty box. Photos the user
adds are local files and always render.

---

## Assessment requirements

| Requirement                                                                         | Where                                                                                                                             |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| `recipetypes.json` local file drives a Picker/Spinner                               | `src/data/recipetypes.json` → `recipe-catalog.ts` → `RecipeTypePicker`                                                            |
| Listing page, filterable by recipe type                                             | `src/app/index.tsx`, plus free-text search                                                                                        |
| Pre-populated sample recipes complying with `recipetypes.json`                      | `src/data/sample-recipes.json`, validated against the catalog at load                                                             |
| Add Recipe page: picture, ingredients, steps; updates the list                      | `src/app/add.tsx` + `RecipeForm`, `PhotoField`, `DynamicListField`                                                                |
| Recipe Detail page: image, ingredients, steps; all fields editable; update + delete | `src/app/recipe/[id].tsx`                                                                                                         |
| At least one persistence method; data survives restart                              | AsyncStorage via `RecipeRepository`; photos via `expo-file-system`                                                                |
| Public git host, builds from a clean clone                                          | This repository                                                                                                                   |
| HCI-sound UI, adapts to screen size/orientation, respects safe area                 | `useLayout`, safe-area insets, tokens in `constants/theme.ts`                                                                     |
| No crashes during normal use                                                        | Error boundaries, runtime guards — see testing below                                                                              |
| OOP principles, consistent naming and formatting                                    | `RecipeRepository` class over an injectable `KeyValueStore`; ESLint + Prettier                                                    |
| Proper lifecycle and state management                                               | State, effect and eight custom hooks (see Custom hooks); `RecipesProvider` context; no `setState` cascades (lint-enforced)        |
| At least one third-party library used deliberately                                  | `@react-native-async-storage/async-storage`, `@react-native-picker/picker`, `expo-image-picker`, `expo-file-system`, `expo-image` |

---

## Testing

Verified by hand on an **Android emulator** (Pixel 7 Pro, API level of the
installed system image, via Expo Go):

- first launch seeds six recipes; force-stop and relaunch reads the same six
  back without re-seeding
- filtering by every category, including one with no recipes (empty state)
- adding a recipe: incomplete submission shows per-field errors and blocks the
  save; a complete one appears in the list immediately and survives a restart
- opening a recipe, editing the title, saving, and deleting with confirmation
- portrait and landscape, including rotation while the list is on screen
- dark mode
- a forced render error shows the recovery screen with the listing intact
  beneath it
- invalid JSON in storage degrades to an empty list rather than crashing

Authentication, verified the same way:

- a cold launch shows the sign-in screen, not the recipe list
- a wrong password is rejected inline and does not navigate
- the demo credentials sign in and land on the six recipes
- force-stop and relaunch goes straight to the list: the session persisted
- signing out returns to sign-in, and relaunching after that still shows
  sign-in, so the session was cleared rather than merely navigated away from
- registration rejects a password under eight characters, then creates the
  account and signs into it
- a temporary diagnostic printed the stored account record: it contained only
  the username, salt, hash and timestamp, with the plaintext password appearing
  nowhere. The diagnostic was removed afterwards.

**Not tested on iOS.** This project was developed on Windows, so no iOS
simulator was available. Nothing in the app is Android-specific — the only
platform branches are picker sizing and keyboard-avoidance behaviour — but the
iOS run is genuinely unverified and should be treated as such.

---

## Bonus items

**Hooks — attempted.** The state behind the editor, the photo picker, the
category filter and the category lookups was pulled out of the components into
the custom hooks listed above. The components lost about a third of their code
and gained nothing they do not need: `RecipeForm` and `PhotoField` are now
presentational, and the add screen and the detail screen's edit mode share one
hook rather than two copies of the same state.

**Authentication — attempted.** Login and logout with a session that survives a
restart and ends only on an explicit sign-out. Passwords are salted and hashed
rather than stored, and both the account record and the session live in
SecureStore. See the Authentication section above, including an honest note on
where the hashing scheme falls short of production practice.

Not attempted: a networking layer, and Redux/MobX. These were left out
deliberately to keep the submission within its time budget.

---

## Licence

See [LICENSE](LICENSE).
