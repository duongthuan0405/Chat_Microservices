import dotenv from "dotenv";
import fs from "fs";
import path from "path";

function loadEnvFile() {
  const currentDir = process.cwd();

  const explicitEnvFile = process.env.ENV_FILE;

  if (explicitEnvFile && explicitEnvFile.trim()) {
    const explicitPath = path.resolve(currentDir, explicitEnvFile.trim());

    if (!fs.existsSync(explicitPath)) {
      throw new Error(`ENV_FILE="${explicitEnvFile}" nhưng file này không tồn tại.`);
    }

    dotenv.config({ path: explicitPath });
    console.log(`Loaded environment file: ${path.basename(explicitPath)}`);
    return;
  }

  const envFiles = [".env", "integration_test.env"];

  for (const fileName of envFiles) {
    const filePath = path.resolve(currentDir, fileName);

    if (fs.existsSync(filePath)) {
      dotenv.config({ path: filePath });
      console.log(`Loaded environment file: ${fileName}`);
      return;
    }
  }

  console.warn(
    "No .env or integration_test.env file found. Using system environment variables only."
  );
}

loadEnvFile();

if (process.env.ALLOW_SELF_SIGNED_CERT === "true") {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
  console.warn(
    "WARNING: TLS certificate verification is disabled for this test run."
  );
}

function required(name) {
  const value = process.env[name];

  if (!value || !value.trim()) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value.trim();
}

function optional(name, fallback = "") {
  const value = process.env[name];
  return value && value.trim() ? value.trim() : fallback;
}

export const env = {
  baseUrl: required("BASE_URL").replace(/\/+$/, ""),
  authLoginPath: optional("AUTH_LOGIN_PATH", "/api/auth/login"),
  authRegisterPath: optional("AUTH_REGISTER_PATH", "/api/auth/register"),
  testUserMode: optional("TEST_USER_MODE", "login"),
  allowSelfSignedCert: optional("ALLOW_SELF_SIGNED_CERT", "false") === "true",

  userA: {
    email: required("USER_A_EMAIL"),
    password: required("USER_A_PASSWORD")
  },
  userB: {
    email: required("USER_B_EMAIL"),
    password: required("USER_B_PASSWORD")
  },
  userC: {
    email: required("USER_C_EMAIL"),
    password: required("USER_C_PASSWORD")
  },

  existingConversationId: optional("EXISTING_CONVERSATION_ID")
};