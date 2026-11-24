const { loadEnvConfig } = require("@next/env");
const readline = require("node:readline/promises");
const { stdin, stdout } = require("node:process");

loadEnvConfig(process.cwd());

const SUPER_ADMIN_CLAIMS = { admin: true, adminRole: "super_admin" };

function normalizeEmail(value) {
  return String(value || "")
    .trim()
    .toLowerCase();
}

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function readEmail() {
  const argumentEmail = normalizeEmail(process.argv[2]);
  if (argumentEmail) return argumentEmail;

  const prompt = readline.createInterface({ input: stdin, output: stdout });
  try {
    return normalizeEmail(await prompt.question("Existing Firebase Auth user email: "));
  } finally {
    prompt.close();
  }
}

async function main() {
  const email = await readEmail();
  if (!isValidEmail(email)) throw new Error("Please provide a valid existing Firebase Authentication email.");

  const { getAdminAuth } = await import("../src/lib/firebase/admin.js");
  const auth = getAdminAuth();
  let user;

  try {
    user = await auth.getUserByEmail(email);
  } catch (error) {
    if (error?.code === "auth/user-not-found")
      throw new Error("No existing Firebase Authentication user was found for that email.");
    throw error;
  }

  const existingClaims = user.customClaims || {};
  const alreadySuperAdmin = existingClaims.admin === true && existingClaims.adminRole === "super_admin";
  if (alreadySuperAdmin) {
    console.log("This existing account already has Super Admin access. No changes were made.");
    return;
  }

  await auth.setCustomUserClaims(user.uid, { ...existingClaims, ...SUPER_ADMIN_CLAIMS });
  console.log("Super Admin claims granted to the existing Firebase Authentication account.");
  console.log("The user must sign out and sign back in before the refreshed claims are available in a new ID token.");
}

main().catch((error) => {
  console.error(`Admin creation failed: ${error.message || "Unknown error."}`);
  process.exitCode = 1;
});
