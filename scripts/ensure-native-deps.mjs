import { execSync, spawnSync } from "node:child_process";
import { readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);

function bindingLoads() {
  const probe = spawnSync(
    process.execPath,
    ["-e", "require('@tailwindcss/oxide')"],
    { cwd: projectRoot },
  );
  return probe.status === 0;
}

function platformPackage() {
  const { platform, arch } = process;
  if (platform === "linux") {
    if (arch === "arm") {
      return "@tailwindcss/oxide-linux-arm-gnueabihf";
    }
    const isMusl = !process.report.getReport().header.glibcVersionRuntime;
    return `@tailwindcss/oxide-linux-${arch}-${isMusl ? "musl" : "gnu"}`;
  }
  if (platform === "darwin") {
    return `@tailwindcss/oxide-darwin-${arch}`;
  }
  if (platform === "win32") {
    return `@tailwindcss/oxide-win32-${arch}-msvc`;
  }
  return null;
}

function oxideVersion() {
  const manifest = path.join(
    projectRoot,
    "node_modules",
    "@tailwindcss",
    "oxide",
    "package.json",
  );
  return JSON.parse(readFileSync(manifest, "utf8")).version;
}

if (!bindingLoads()) {
  const name = platformPackage();
  if (!name) {
    console.error(
      "The @tailwindcss/oxide native binding is missing and cannot be repaired automatically on this platform. Run: npm ci",
    );
    process.exit(1);
  }
  const version = oxideVersion();
  console.log(`Restoring missing native binding ${name}@${version}`);
  execSync(`npm install --no-save ${name}@${version}`, {
    cwd: projectRoot,
    stdio: "inherit",
  });
  rmSync(path.join(projectRoot, ".next"), { recursive: true, force: true });
  if (!bindingLoads()) {
    console.error(
      `The @tailwindcss/oxide native binding still fails to load after installing ${name}. Run: npm ci, then delete the .next directory.`,
    );
    process.exit(1);
  }
  console.log("Native binding restored and stale build cache cleared.");
}
