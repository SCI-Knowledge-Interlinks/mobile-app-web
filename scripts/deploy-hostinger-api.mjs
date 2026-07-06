#!/usr/bin/env node
/**
 * Deploy a pre-built static site to Hostinger via the official Hosting API.
 * Requires: HOSTINGER_API_TOKEN, HOSTINGER_DOMAIN
 * Usage: node scripts/deploy-hostinger-api.mjs [path-to-dist]
 */
import fs from "fs";
import path from "path";
import { execSync } from "child_process";
import { fileURLToPath } from "url";
import axios from "axios";
import tus from "tus-js-client";

const API_BASE = "https://developers.hostinger.com";
const token = process.env.HOSTINGER_API_TOKEN;
const domain = process.env.HOSTINGER_DOMAIN;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.resolve(process.argv[2] || path.join(__dirname, "../dist"));

function requireEnv(name, value) {
  if (!value?.trim()) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
}

requireEnv("HOSTINGER_API_TOKEN", token);
requireEnv("HOSTINGER_DOMAIN", domain);

if (!fs.existsSync(distDir) || !fs.statSync(distDir).isDirectory()) {
  console.error(`Build output not found: ${distDir}`);
  process.exit(1);
}

const headers = {
  Accept: "application/json",
  "Content-Type": "application/json",
};

async function apiRequest(method, apiPath, data) {
  const url = `${API_BASE}/${apiPath.replace(/^\//, "")}`;
  const response = await axios({
    method,
    url,
    headers: {
      ...headers,
      Authorization: `Bearer ${token}`,
    },
    data,
    timeout: 120000,
    validateStatus: (status) => status < 500,
  });

  if (response.status < 200 || response.status >= 300) {
    throw new Error(
      `Hostinger API ${method} ${apiPath} failed (${response.status}): ${JSON.stringify(response.data)}`
    );
  }

  return response.data;
}

async function resolveUsername() {
  const result = await apiRequest(
    "get",
    `api/hosting/v1/websites?domain=${encodeURIComponent(domain)}`
  );
  const websites = result?.data;
  if (!websites?.length || !websites[0]?.username) {
    throw new Error(`No Hostinger website found for domain: ${domain}`);
  }
  return websites[0].username;
}

async function fetchUploadCredentials(username) {
  return apiRequest("post", "api/hosting/v1/files/upload-urls", {
    username,
    domain,
  });
}

function createArchive() {
  const stamp = new Date()
    .toISOString()
    .replace(/[-:TZ]/g, "")
    .slice(0, 14);
  const archiveName = `prawaas-web_${stamp}.zip`;
  const archivePath = path.join("/tmp", archiveName);

  execSync(
    `cd "${distDir}" && zip -r "${archivePath}" . -x "*.DS_Store"`,
    { stdio: "inherit" }
  );

  return { archivePath, archiveName };
}

function uploadArchive(archivePath, archiveName, uploadUrl, authToken, authRestToken) {
  const stats = fs.statSync(archivePath);
  const fileStream = fs.createReadStream(archivePath);
  const cleanUploadUrl = uploadUrl.replace(/\/$/, "");
  const uploadUrlWithFile = `${cleanUploadUrl}/${archiveName}?override=true`;
  const requestHeaders = {
    "X-Auth": authToken,
    "X-Auth-Rest": authRestToken,
    "upload-length": stats.size.toString(),
    "upload-offset": "0",
  };

  return new Promise((resolve, reject) => {
    axios
      .post(uploadUrlWithFile, "", {
        headers: requestHeaders,
        timeout: 120000,
        validateStatus: (status) => status === 201,
      })
      .then(() => {
        const upload = new tus.Upload(fileStream, {
          uploadUrl: uploadUrlWithFile,
          retryDelays: [1000, 2000, 4000, 8000, 16000],
          uploadDataDuringCreation: false,
          parallelUploads: 1,
          chunkSize: 10 * 1024 * 1024,
          headers: requestHeaders,
          removeFingerprintOnSuccess: true,
          uploadSize: stats.size,
          metadata: { filename: archiveName },
          onError: (error) => reject(error),
          onSuccess: () => resolve(archiveName),
        });
        upload.start();
      })
      .catch(reject);
  });
}

async function triggerDeploy(username, archiveName) {
  return apiRequest(
    "post",
    `api/hosting/v1/accounts/${username}/websites/${domain}/deploy`,
    { archive_path: `public_html/${archiveName}` }
  );
}

async function main() {
  console.log(`Deploying ${distDir} to Hostinger domain: ${domain}`);

  const username = await resolveUsername();
  console.log(`Resolved Hostinger account: ${username}`);

  const { archivePath, archiveName } = createArchive();
  console.log(`Created archive: ${archiveName}`);

  const credentials = await fetchUploadCredentials(username);
  const { url: uploadUrl, auth_key: authToken, rest_auth_key: authRestToken } = credentials;

  if (!uploadUrl || !authToken || !authRestToken) {
    throw new Error("Invalid upload credentials from Hostinger API");
  }

  await uploadArchive(archivePath, archiveName, uploadUrl, authToken, authRestToken);
  console.log("Archive uploaded");

  const deployResult = await triggerDeploy(username, archiveName);
  console.log("Deployment triggered:", JSON.stringify(deployResult));
  fs.unlinkSync(archivePath);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
