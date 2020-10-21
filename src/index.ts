import fs from "fs";
import path from "path";
import * as colors from 'kleur/colors';
import { repoURL } from "./get-repo-url";

function runCheck({ pass, title, url }) {
  try {
    const result = pass();
    if (!result) {
      console.error(colors.red("Check failed: "), title);
      console.error(colors.yellow("How to fix: "), url);
      process.exit(1);
    }
  } catch (err) {
    console.error("run failed (internal tool error, please report this!)");
    throw err;
  }
}

const cwd = process.cwd();
const packageJsonContents = fs.readFileSync(path.join(cwd, "package.json"), {
  encoding: "utf-8",
});
const READMEContents = fs.readFileSync(path.join(cwd, "README.md"), {
  encoding: "utf-8",
});
const pkg = JSON.parse(packageJsonContents);

// Check: Has ESM
runCheck({
  title: "ES Module Entrypoint",
  url: "https://docs.skypack.dev/package-authors/package-checks#esm",
  pass: () => {
    return (
      (pkg.exports &&
        !!(
          pkg.exports["import"] ||
          !!Object.values(pkg.exports).find(
            (x: any) => typeof x === "object" && x.import
          )
        )) ||
      !!pkg.module ||
      pkg.type === "module" ||
      (typeof pkg.main === "string" && pkg.main.endsWith(".mjs"))
    );
  },
});
// Check: Export Map
runCheck({
  title: "Export Map",
  url: "https://docs.skypack.dev/package-authors/package-checks#export-map",
  pass: () => {
    return !!pkg.exports;
  },
});
// Check: Has "files"
runCheck({
  title: "No Unnecessary Files",
  url: "https://docs.skypack.dev/package-authors/package-checks#files",
  pass: () => {
    return !!pkg.files;
  },
});
// Check: Has "keywords"
runCheck({
  title: "Keywords",
  url: "https://docs.skypack.dev/package-authors/package-checks#keywords",
  pass: () => {
    return !!pkg.keywords;
  },
});
// Check: Has "keywords"
runCheck({
  title: "Keywords (Empty)",
  url: "https://docs.skypack.dev/package-authors/package-checks#keywords",
  pass: () => {
    return !!pkg.keywords.length;
  },
});
// Check: Has "license"
runCheck({
  title: "License",
  url: "https://docs.skypack.dev/package-authors/package-checks#license",

  pass: () => {
    return !!pkg.license;
  },
});
// Check: Has "README"
runCheck({
  title: "README",
  url: "https://docs.skypack.dev/package-authors/package-checks#readme",

  pass: () => {
    return !!READMEContents;
  },
});
// Check: Has "repository url"
runCheck({
  title: "Repository URL",
  url: "https://docs.skypack.dev/package-authors/package-checks#repository",
  pass: () => {
    let repositoryUrl: string | undefined;
    if (pkg.repository && pkg.repository.url) {
      repositoryUrl = repoURL(pkg.repository.url);
    }
    return !!repositoryUrl;
  },
});
// Check: Has types
runCheck({
  title: "TypeScript Types",
  url: "https://docs.skypack.dev/package-authors/package-checks#types",
  pass: () => {
    return !!pkg.types || !!pkg.typings; // `typings` is also valid according to TypeScript, even though `types` is preferred
  },
});
