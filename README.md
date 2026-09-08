# YumBook

YumBook is a small recipe book built with Expo and TypeScript. Keep recipes,
photos, ingredients, and cooking steps together in one place.

## Features

- Browse, search, and filter recipes.
- Create, edit, and delete recipes.
- Add recipe photos from the camera or photo library.
- Tick ingredients off while cooking.
- Keep recipes and sign-in details on the device.

## Run the app

You will need Node.js 22.13 or later, plus Expo Go, an Android emulator, or the
iOS Simulator.

```bash
npm install
npx expo start
```

Scan the QR code with Expo Go, or press `a` for Android, `i` for iOS, or
`w` for web.

Use `demo` / `recipes123` to sign in, or create a local account.

## Useful commands

| Command             | What it does     |
| ------------------- | ---------------- |
| `npm start`         | Start Expo       |
| `npm run android`   | Open Android     |
| `npm run ios`       | Open iOS         |
| `npm run web`       | Open web         |
| `npm run lint`      | Run ESLint       |
| `npm run typecheck` | Check TypeScript |

## Project layout

- `src/app` — screens and navigation
- `src/components` — shared UI
- `src/data` — recipe data and validation
- `src/state` and `src/storage` — local state and persistence

## License

[MIT](LICENSE)
