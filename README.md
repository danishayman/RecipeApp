# RecipeApp

A React Native recipe manager built with Expo SDK 57 and TypeScript.

Browse a collection of recipes, filter them by type, add your own with a photo,
ingredients and steps, then edit or delete them. Everything is stored on-device
and survives an app restart.

> Status: in progress. Full setup notes, screenshots and a feature walkthrough
> land with the final documentation pass.

## Requirements

- Node.js 20 or newer
- An Android emulator (Android Studio) or iOS simulator (Xcode, macOS only),
  or the [Expo Go](https://expo.dev/go) app on a physical device

## Getting started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the dev server:

   ```bash
   npx expo start
   ```

3. Press `a` to open the Android emulator or `i` for the iOS simulator, or scan
   the QR code with Expo Go.

## Scripts

| Script            | Purpose                     |
| ----------------- | --------------------------- |
| `npm start`       | Start the Metro dev server  |
| `npm run android` | Start and open on Android   |
| `npm run ios`     | Start and open on iOS       |
| `npm run web`     | Start and open in a browser |
| `npm run lint`    | Lint the project            |

## Project layout

```
src/
  app/          Expo Router routes (file-based navigation)
  components/   Reusable presentational components
  constants/    Design tokens (colours, spacing, radii)
  hooks/        Reusable stateful logic
```

## Tech stack

- **Expo SDK 57** / React Native 0.86 / React 19
- **TypeScript** in strict mode
- **Expo Router** for file-based stack navigation
