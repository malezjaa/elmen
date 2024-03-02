export const TSCONFIG_CONTENT = `
{
  "$schema": "https://json.schemastore.org/tsconfig",
  "compilerOptions": {
    "lib": [
      "ESNext"
    ],
    "target": "ESNext",
    "module": "ESNext",
    "moduleDetection": "force",
    "allowJs": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "verbatimModuleSyntax": true,
    "resolveJsonModule": true,
    "noEmit": true,
    "strict": true,
    "skipLibCheck": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": false,
    "noUnusedParameters": false,
    "noPropertyAccessFromIndexSignature": false,
  }  
}
`;

export const PRETTIER_IGNORE = `
/dist
/coverage
/.nx/cache
`;

export const GITIGNORE = `
# compiled output
dist
tmp
/out-tsc
build
out

# dependencies
node_modules

# IDEs and editors
/.idea
.project
.classpath
.c9/
*.launch
.settings/
*.sublime-workspace

# IDE - VSCode
.vscode/*
!.vscode/settings.json
!.vscode/tasks.json
!.vscode/launch.json
!.vscode/extensions.json

# misc
/.sass-cache
/connect.lock
/coverage
/libpeerconnection.log
npm-debug.log
yarn-error.log
testem.log
/typings

# System Files
.DS_Store
Thumbs.db

.nx/cache
`;

export const VITEST_CONFIG = `
import { defineConfig } from 'vitest';

export default defineConfig({
  test: {
    globals: true,
    cache: { dir: './node_modules/.vitest' },
    environment: 'node',
    include: ['src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    reporters: ['default'],
    coverage: { reportsDirectory: './coverage/test', provider: 'v8' },
  }
});

`;

export const TSUP_CONFIG = `
import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm", "cjs"],
  dts: true,
  clean: true,
  treeshake: true,
  minify: true,
});
`;

export const UNBUILD_CONFIG = `
import { defineBuildConfig } from "unbuild";

export default defineBuildConfig({
  declaration: true,
  rollup: {
    emitCJS: true,
  },
  entries: [
    'src/index.ts'
  ],
})
`;

export const ESLINT_CONFIG = `
module.exports = {
  extends: ['eslint-config-unjs'],
  rules: {},
};
`;

export const ESLINT_IGNORE = `
node_modules
dist
coverage
build
.nx
out
`;

export const PNPM_WORKSPACE = `
packages:
    - "packages/*"
    - "apps/*"
`;
