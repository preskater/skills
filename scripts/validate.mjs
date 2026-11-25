#!/usr/bin/env node
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SKILLS_DIR = join(ROOT, "skills");
const CATALOG_PATH = join(ROOT, "catalog.json");

const errors = [];
const warnings = [];

const NAME_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const RESERVED_NAMES = new Set([
  "review",
  "code-review",
  "verify",
  "debug",
  "run",
  "simplify",
  "skill-creator",
  "skill-installer",
  "review-agent",
  "imagegen",
  "openai-docs",
]);
const FORBIDDEN_FRONTMATTER = new Set([
  "agent",
  "allowed-tools",
  "argument-hint",
  "arguments",
  "background",
  "context",
  "disable-model-invocation",
  "disallowed-tools",
  "effort",
  "hooks",
  "model",
  "paths",
  "shell",
  "user-invocable",
  "when_to_use",
]);

const skillData = new Map();

function rel(path) {
  return relative(ROOT, path) || ".";
}

function err(file, message) {
  errors.push(`${rel(file)}: ${message}`);
}

function warn(file, message) {
  warnings.push(`${rel(file)}: ${message}`);
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}

function parseYaml(raw) {
  const data = {};
  const meta = {};
  let inMeta = false;
  let blockKey = null;
  let blockLines = [];

  const flush = () => {
    if (blockKey !== null) {
      data[blockKey] = blockLines.join("\n").trim();
      blockKey = null;
      blockLines = [];
    }
  };

  for (const line of raw.split("\n")) {
    if (!line.trim() || line.trim().startsWith("#")) continue;

    const indent = line.length - line.trimStart().length;
    if (indent > 0) {
      if (blockKey !== null) {
        blockLines.push(line.trim());
        continue;
      }
      if (inMeta) {
        const nested = line.trim().match(/^([A-Za-z0-9_./-]+):\s*(.*)$/);
        if (nested) meta[nested[1]] = stripQuotes(nested[2].trim());
      }
      continue;
    }

    flush();

    const top = line.match(/^([A-Za-z0-9_./-]+):\s*(.*)$/);
    if (!top) continue;

    const key = top[1];
    const value = top[2].trim();

    if (key === "metadata") {
      inMeta = true;
      data.metadata = meta;
      continue;
    }

    inMeta = false;

    if (value === ">" || value === "|" || value === ">-" || value === "|-") {
      blockKey = key;
      blockLines = [];
      continue;
    }

    data[key] = stripQuotes(value);
  }

  flush();
  return data;
}

function parseFrontmatter(text, file) {
  if (!text.startsWith("---\n")) {
    err(file, "file must start with a YAML frontmatter block");
    return null;
  }

  const end = text.indexOf("\n---", 4);
  if (end === -1) {
    err(file, "frontmatter is not closed with ---");
    return null;
  }

  const raw = text.slice(4, end);
  const body = text.slice(end + 4).replace(/^\s*\n/, "");

  return { data: parseYaml(raw), body };
}

function validateSkill(name) {
  const dir = join(SKILLS_DIR, name);
  const file = join(dir, "SKILL.md");

  if (!statSync(dir).isDirectory()) return;

  if (!NAME_RE.test(name)) {
    err(dir, "directory name must be lowercase kebab-case");
  }
  if (name.length > 64) {
    err(dir, "directory name exceeds 64 characters");
  }
  if (RESERVED_NAMES.has(name)) {
    err(dir, `name collides with a bundled harness skill: ${name}`);
  }
  if (!name.startsWith("preskater-")) {
    warn(dir, 'name should start with "preskater-"');
  }

  if (!existsSync(file)) {
    err(dir, "missing SKILL.md");
    return;
  }

  const text = readFileSync(file, "utf8");
  const parsed = parseFrontmatter(text, file);
  if (!parsed) return;

  const { data, body } = parsed;
  skillData.set(name, data);

  if (data.name !== name) {
    err(file, `frontmatter name "${data.name ?? ""}" must match directory "${name}"`);
  }

  const description = data.description ?? "";
  if (!description) {
    err(file, "description is required");
  } else {
    if (description.length > 1024) {
      err(file, `description is ${description.length} characters (max 1024)`);
    }
    if (description.length > 500) {
      warn(file, `description is ${description.length} characters; keep it under 500 for context budgets`);
    }
    if (description.includes("\n")) {
      warn(file, "description spans multiple lines; a single line truncates more safely");
    }
  }

  if (!data.license) {
    err(file, "license is required");
  } else if (data.license !== "MIT") {
    warn(file, `license is "${data.license}", expected MIT`);
  }

  for (const key of Object.keys(data)) {
    if (FORBIDDEN_FRONTMATTER.has(key)) {
      err(file, `"${key}" is harness-specific and not allowed in a portable skill`);
    }
  }

  if (data.metadata && typeof data.metadata === "object") {
    if (data.metadata["opencode/autoinvoke"] !== undefined) {
      err(file, '"opencode/autoinvoke" is OpenCode-specific; use a bundle instead');
    }
    if (!data.metadata.owner) warn(file, "metadata.owner is missing");
    if (!data.metadata.version) warn(file, "metadata.version is missing");
  } else {
    warn(file, "metadata block is missing");
  }

  const lineCount = text.split("\n").length;
  if (lineCount > 500) {
    warn(file, `SKILL.md has ${lineCount} lines; keep it under 500`);
  }

  if (/!`/.test(body)) {
    err(file, "dynamic command injection (!`...`) is Claude-specific and not portable");
  }

  for (const match of body.matchAll(/(?:\/Users\/|\/home\/|\/etc\/)[^\s)`]+/g)) {
    err(file, `absolute path is not portable: ${match[0]}`);
  }

  for (const match of body.matchAll(/\[[^\]]*\]\(([^)\s]+)\)/g)) {
    const link = match[1];
    if (/^(https?:|mailto:|#)/.test(link)) continue;
    const target = join(dir, link.split("#")[0]);
    if (!existsSync(target)) {
      err(file, `broken relative link: ${link}`);
    }
  }

  for (const match of body.matchAll(/`((?:references|assets)\/[^`\s]+)`/g)) {
    const target = join(dir, match[1]);
    if (!existsSync(target)) {
      err(file, `missing referenced file: ${match[1]}`);
    }
  }
}

function validateCatalog() {
  if (!existsSync(CATALOG_PATH)) {
    err(CATALOG_PATH, "missing catalog.json");
    return;
  }

  let catalog;
  try {
    catalog = JSON.parse(readFileSync(CATALOG_PATH, "utf8"));
  } catch (error) {
    err(CATALOG_PATH, `invalid JSON: ${error.message}`);
    return;
  }

  const listed = new Map();

  for (const entry of catalog.skills ?? []) {
    if (!entry.name) {
      err(CATALOG_PATH, "skill entry is missing name");
      continue;
    }
    if (!entry.path) {
      err(CATALOG_PATH, `skill ${entry.name} is missing path`);
      continue;
    }

    const dir = join(ROOT, entry.path);
    if (!existsSync(join(dir, "SKILL.md"))) {
      err(CATALOG_PATH, `skill ${entry.name} has no SKILL.md at ${entry.path}`);
    }
    if (entry.path !== `skills/${entry.name}`) {
      warn(CATALOG_PATH, `skill ${entry.name} path should be skills/${entry.name}`);
    }

    const data = skillData.get(entry.name);
    if (data?.metadata?.version && entry.version && data.metadata.version !== entry.version) {
      err(
        CATALOG_PATH,
        `skill ${entry.name} version mismatch: catalog "${entry.version}" vs SKILL.md "${data.metadata.version}"`,
      );
    }

    listed.set(entry.name, entry);
  }

  const bundles = catalog.bundles ?? {};
  for (const [bundleName, names] of Object.entries(bundles)) {
    if (!Array.isArray(names) || names.length === 0) {
      err(CATALOG_PATH, `bundle "${bundleName}" must be a non-empty array`);
      continue;
    }
    for (const name of names) {
      if (!listed.has(name)) {
        err(CATALOG_PATH, `bundle "${bundleName}" references unknown skill "${name}"`);
      }
    }
  }

  const all = new Set(bundles.all ?? []);
  for (const name of listed.keys()) {
    if (!all.has(name)) {
      err(CATALOG_PATH, `bundle "all" is missing skill "${name}"`);
    }
  }

  if (existsSync(SKILLS_DIR)) {
    for (const name of readdirSync(SKILLS_DIR)) {
      if (!statSync(join(SKILLS_DIR, name)).isDirectory()) continue;
      if (!listed.has(name)) {
        err(CATALOG_PATH, `skill "${name}" is not listed in catalog.json`);
      }
    }
  }
}

function main() {
  if (!existsSync(SKILLS_DIR)) {
    err(SKILLS_DIR, "missing skills directory");
  } else {
    for (const name of readdirSync(SKILLS_DIR)) {
      const dir = join(SKILLS_DIR, name);
      if (!statSync(dir).isDirectory()) continue;
      validateSkill(name);
    }
  }

  validateCatalog();

  for (const message of warnings) {
    console.warn(`warning: ${message}`);
  }

  if (errors.length > 0) {
    for (const message of errors) {
      console.error(`error: ${message}`);
    }
    console.error(`\n${errors.length} error(s), ${warnings.length} warning(s)`);
    process.exit(1);
  }

  console.log(`validated ${skillData.size} skills, ${warnings.length} warning(s)`);
}

main();
