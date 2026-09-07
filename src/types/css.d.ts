/**
 * Side-effect CSS imports (`import '@/global.css'`) are resolved at build time
 * by Metro rather than through the TypeScript module graph.
 *
 * Expo normally declares these in the generated `expo-env.d.ts`, but that file
 * is gitignored, so a fresh clone would fail `tsc --noEmit` until the dev
 * server had been run once. Declaring the module here makes a clean clone
 * typecheck straight after `npm install`.
 */
declare module '*.css';
