#!/usr/bin/env node

import { defineCommand, type ParsedArgs, runMain, showUsage } from "citty";
import { version } from "../package.json";
import consola from "consola";
import * as path from "path";
import * as fs from "fs";
import whichpm from "which-pm";
import shell from "shelljs";
import {
  ESLINT_CONFIG,
  ESLINT_IGNORE,
  GITIGNORE,
  PNPM_WORKSPACE,
  PRETTIER_IGNORE,
  TSCONFIG_CONTENT,
  TSUP_CONFIG,
  UNBUILD_CONFIG,
  VITEST_CONFIG,
} from "./files.ts";
type ProjectType = "integrated" | "standalone";
const projectTypes: ProjectType[] = ["integrated", "standalone"];
type BuildTool = "tsup" | "unbuild";
const buildTools: BuildTool[] = ["tsup", "unbuild"];
const parseNoOption = (arg: string, args: ParsedArgs, fallback: boolean) =>
  !Object.keys(args).includes(arg) ? fallback : !args[arg];

const main = defineCommand({
  meta: {
    name: "elmen",
    version: version,
    description: "Elmen is a simple boilerplate generator for ts projects",
  },
  args: {
    name: {
      type: "string",
      description: "name of the project",
      required: true,
    },
    "no-test": {
      type: "boolean",
      description: "don't add test packages",
    },
    type: {
      type: "string",
      description: "type of project",
      required: true,
      valueHint: "integrated | standalone",
    },
    build: {
      type: "string",
      description: "build tool",
      default: "tsup",
      valueHint: "tsup | unbuild",
    },
    "no-prettier": {
      type: "boolean",
      description: "don't add prettier",
    },
    "no-git": {
      type: "boolean",
      description: "don't add git",
    },
    "no-eslint": {
      type: "boolean",
      description: "don't add eslint",
    },
  },
  async run({ args }) {
    const type = args.type as ProjectType;
    const noTest = parseNoOption("test", args, false);
    const name = args.name ?? "example-project";
    const projectPath = path.join(process.cwd(), name);
    const buildTool = args.build as BuildTool;
    const noPrettier = parseNoOption("prettier", args, false);
    const noGit = parseNoOption("git", args, false);
    const noEslint = parseNoOption("eslint", args, false);

    if (fs.existsSync(projectPath)) {
      consola.error(`Path already exists: ${projectPath}`);
      return;
    }

    if (!projectTypes.includes(type)) {
      consola.error(`Invalid project type: ${type}`);
      return;
    }

    if (!buildTools.includes(buildTool)) {
      consola.error(`Invalid build tool: ${args.build}`);
      return;
    }

    //TODO: find one with bun support
    const result = await whichpm(process.cwd());
    const pm = result.name;
    const installCommand =
      pm === "yarn"
        ? "yarn add"
        : pm === "pnpm"
        ? "pnpm install"
        : "npm install";
    const installDev = `${installCommand} -D @types/node ${buildTool} typescript ${
      !noPrettier ? "prettier" : ""
    } ${!noEslint ? "eslint eslint-config-unjs" : ""} ${
      !noTest ? "vitest @vitest/ui @vitest/coverage-v8" : ""
    }`;

    const packageJson = {
      name: name,
      version: "0.0.0",
      license: "MIT",
      scripts: {
        build: buildTool,
        test: "vitest",
        ...(!noPrettier && {
          format: 'prettier --write "**/*.{ts,tsx,js,jsx,cjs,mjs}"',
        }),
        ...(!noEslint && {
          lint: "eslint --cache --ext .ts,.js,.mjs,.cjs,.tsx,.jsx .",
        }),
      },
      ...(type === "integrated" &&
        pm !== "pnpm" && {
          workspaces: ["apps/*", "packages/*"],
        }),
    };

    const files = [
      {
        path: "tsconfig.json",
        content: TSCONFIG_CONTENT,
      },
      {
        path: "package.json",
        content: JSON.stringify(packageJson, null, 2),
      },
      {
        path: ".gitignore",
        content: GITIGNORE,
      },
    ];
    buildTool === "tsup"
      ? files.push({
          path: "tsup.config.ts",
          content: TSUP_CONFIG,
        })
      : files.push({
          path: "build.config.ts",
          content: UNBUILD_CONFIG,
        });

    if (!noPrettier) {
      files.push({
        path: ".prettierignore",
        content: PRETTIER_IGNORE,
      });
    }

    if (!noTest) {
      files.push({
        path: "vitest.config.ts",
        content: VITEST_CONFIG,
      });
    }

    if (!noEslint) {
      files.push({
        path: ".eslintrc.js",
        content: ESLINT_CONFIG,
      });
      files.push({
        path: ".eslintignore",
        content: ESLINT_IGNORE,
      });
    }
    type === "integrated"
      ? files.push(
          {
            path: "apps",
            content: "",
          },
          {
            path: "packages",
            content: "",
          }
        )
      : files.push(
          {
            path: "src",
            content: "",
          },
          {
            path: "src/index.ts",
            content: "console.log('Hello, world!')",
          }
        );

    type === "integrated" &&
      pm === "pnpm" &&
      files.push({
        path: "pnpm-workspace.yaml",
        content: PNPM_WORKSPACE,
      });
    fs.mkdirSync(projectPath);

    shell.cd(projectPath);

    files.forEach((file) => {
      if (file.content.length > 0) {
        fs.writeFileSync(path.join(projectPath, file.path), file.content);
      } else {
        fs.mkdirSync(path.join(projectPath, file.path));
      }
    });
    consola.success("Created files");

    consola.start("Installing dependencies");
    shell.exec(`${installDev}`, { silent: true });
    consola.success("Installed dev dependencies");

    if (!noGit) {
      shell.exec("git init", { silent: true });
      consola.success("Initialized git");
    }
  },
});

runMain(main);
