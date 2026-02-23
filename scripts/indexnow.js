import { access, readdir, readFile } from "node:fs/promises";
import { constants as fsConstants } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";

const workspaceRoot = process.cwd();
const distDir = path.join(workspaceRoot, "dist");
const publicDir = path.join(workspaceRoot, "public");

const args = process.argv.slice(2);
const dryRun = args.includes("--dry-run");
const endpoint = process.env.INDEXNOW_ENDPOINT || "https://api.indexnow.org/indexnow";
const batchSize = Number(process.env.INDEXNOW_BATCH_SIZE || 1000);
const forceBuild = args.includes("--build");

function runCommand(command, commandArgs) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, commandArgs, {
      cwd: workspaceRoot,
      stdio: "inherit",
      shell: process.platform === "win32",
    });

    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }
      reject(new Error(`Command failed: ${command} ${commandArgs.join(" ")} (exit code ${code})`));
    });
  });
}

async function fileExists(filePath) {
  try {
    await access(filePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

async function ensureBuildArtifacts() {
  const sitemapIndexPath = path.join(distDir, "sitemap-index.xml");
  const hasSitemapIndex = await fileExists(sitemapIndexPath);

  if (!forceBuild && hasSitemapIndex) {
    return;
  }

  console.log(forceBuild
    ? "Running build before IndexNow submission (--build enabled)..."
    : "No sitemap build artifacts found. Running build before IndexNow submission...");
  await runCommand("npm", ["run", "build"]);
}

function extractLocValues(xmlContent) {
  const matches = xmlContent.matchAll(/<loc>(.*?)<\/loc>/g);
  return [...matches].map((match) => match[1].trim()).filter(Boolean);
}

async function readXmlFile(filePath) {
  return readFile(filePath, "utf8");
}

function toLocalXmlPathFromLoc(loc) {
  try {
    const parsed = new URL(loc);
    return path.join(distDir, parsed.pathname.replace(/^\/+/, ""));
  } catch {
    return path.join(distDir, loc.replace(/^\/+/, ""));
  }
}

async function getSitemapFiles() {
  const indexPath = path.join(distDir, "sitemap-index.xml");

  try {
    const indexXml = await readXmlFile(indexPath);
    const sitemapLocs = extractLocValues(indexXml);
    const discoveredFiles = sitemapLocs
      .map(toLocalXmlPathFromLoc)
      .filter((filePath) => filePath.endsWith(".xml") && !filePath.endsWith("sitemap-index.xml"));

    if (discoveredFiles.length > 0) {
      return discoveredFiles;
    }
  } catch {
    // Fallback to scanning dist when sitemap index is unavailable.
  }

  const filesInDist = await readdir(distDir);
  return filesInDist
    .filter((name) => /^sitemap-\d+\.xml$/i.test(name))
    .map((name) => path.join(distDir, name));
}

async function getAllUrlsFromSitemaps() {
  const sitemapFiles = await getSitemapFiles();
  const allUrls = [];

  for (const sitemapFile of sitemapFiles) {
    const xml = await readXmlFile(sitemapFile);
    allUrls.push(...extractLocValues(xml));
  }

  return [...new Set(allUrls)];
}

async function detectIndexNowKey() {
  if (process.env.INDEXNOW_KEY) {
    return process.env.INDEXNOW_KEY.trim();
  }

  if (process.env.INDEXNOW_KEY_FILE) {
    const keyFromFile = await readFile(path.resolve(process.env.INDEXNOW_KEY_FILE), "utf8");
    return keyFromFile.trim();
  }

  const publicFiles = await readdir(publicDir);
  const txtFiles = publicFiles.filter((fileName) => fileName.toLowerCase().endsWith(".txt"));

  for (const txtFile of txtFiles) {
    const fullPath = path.join(publicDir, txtFile);
    const content = (await readFile(fullPath, "utf8")).trim();
    const fileNameWithoutExt = path.basename(txtFile, ".txt").trim();

    if (content && content === fileNameWithoutExt) {
      return content;
    }
  }

  throw new Error(
    "Could not detect IndexNow key. Set INDEXNOW_KEY or INDEXNOW_KEY_FILE, or add a public/<key>.txt file with key content."
  );
}

function chunkArray(items, size) {
  const chunks = [];
  for (let index = 0; index < items.length; index += size) {
    chunks.push(items.slice(index, index + size));
  }
  return chunks;
}

async function submitToIndexNow({ host, key, keyLocation, urls }) {
  const payload = {
    host,
    key,
    keyLocation,
    urlList: urls,
  };

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`IndexNow request failed (${response.status}): ${body}`);
  }
}

async function main() {
  await ensureBuildArtifacts();
  const urls = await getAllUrlsFromSitemaps();

  if (urls.length === 0) {
    console.log("No URLs found in sitemap files.");
    return;
  }

  const firstUrl = new URL(urls[0]);
  const host = process.env.INDEXNOW_HOST || firstUrl.host;
  const key = await detectIndexNowKey();
  const keyLocation = process.env.INDEXNOW_KEY_LOCATION || `${firstUrl.origin}/${key}.txt`;

  if (dryRun) {
    console.log("[dry-run] IndexNow payload preview");
    console.log(`Endpoint: ${endpoint}`);
    console.log(`Host: ${host}`);
    console.log(`Key location: ${keyLocation}`);
    console.log(`URLs found: ${urls.length}`);
    console.log(`Batch size: ${batchSize}`);
    console.log("Sample URLs:");
    for (const url of urls.slice(0, 10)) {
      console.log(`- ${url}`);
    }
    return;
  }

  const batches = chunkArray(urls, batchSize);
  for (let index = 0; index < batches.length; index += 1) {
    const batch = batches[index];
    await submitToIndexNow({ host, key, keyLocation, urls: batch });
    console.log(`Submitted batch ${index + 1}/${batches.length} (${batch.length} URLs)`);
  }

  console.log(`IndexNow submission completed for ${urls.length} URLs.`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
