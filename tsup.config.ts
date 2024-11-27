import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts', 'src/commands/_index.ts', 'src/events/_index.ts'],
  platform: 'node',
  format: 'cjs',
  bundle: true,
  minify: 'terser',
  treeshake: true,
  clean: true,
  sourcemap: false,
  external: ['tsup'],
});
