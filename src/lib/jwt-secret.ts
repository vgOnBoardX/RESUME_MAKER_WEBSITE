/**
 * Resolves the JWT signing secret from (in order):
 * 1. JWT_SECRET or AUTH_SECRET env (local / simple deploys)
 * 2. GCP_JWT_SECRET_RESOURCE — full resource name, e.g. projects/PROJECT_ID/secrets/SECRET_ID/versions/latest
 * 3. GOOGLE_CLOUD_PROJECT (or GCP_PROJECT_ID) + GCP_JWT_SECRET_ID — builds .../secrets/ID/versions/latest
 *
 * Google auth: set GOOGLE_APPLICATION_CREDENTIALS to a service account JSON with
 * Secret Manager Secret Accessor on that secret, or use Application Default Credentials on GCP.
 */
let cachedKey: Uint8Array | null = null;

export async function getJwtSecretKeyBytes(): Promise<Uint8Array> {
  if (cachedKey) return cachedKey;
  const raw = await resolveJwtSecretRaw();
  if (raw.length < 16 && process.env.NODE_ENV === "production") {
    throw new Error("JWT secret must be at least 16 characters in production.");
  }
  cachedKey = new TextEncoder().encode(raw);
  return cachedKey;
}

async function resolveJwtSecretRaw(): Promise<string> {
  const fromEnv = process.env.JWT_SECRET?.trim() || process.env.AUTH_SECRET?.trim();
  if (fromEnv) return fromEnv;

  const fullResource = process.env.GCP_JWT_SECRET_RESOURCE?.trim();
  if (fullResource) {
    return accessGcpSecretVersion(fullResource);
  }

  const projectId = process.env.GOOGLE_CLOUD_PROJECT?.trim() || process.env.GCP_PROJECT_ID?.trim();
  const secretId = process.env.GCP_JWT_SECRET_ID?.trim();
  if (projectId && secretId) {
    const name = `projects/${projectId}/secrets/${secretId}/versions/latest`;
    return accessGcpSecretVersion(name);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error(
      "Set JWT_SECRET, or configure Google Secret Manager: GCP_JWT_SECRET_RESOURCE, or GOOGLE_CLOUD_PROJECT + GCP_JWT_SECRET_ID."
    );
  }

  console.warn(
    "[auth] Using development JWT fallback. Set JWT_SECRET or Google Secret Manager env vars for production."
  );
  return "change-me-in-development-only";
}

async function accessGcpSecretVersion(name: string): Promise<string> {
  const { SecretManagerServiceClient } = await import("@google-cloud/secret-manager");
  const client = new SecretManagerServiceClient();
  const [version] = await client.accessSecretVersion({ name });
  const data = version.payload?.data;
  if (data == null) {
    throw new Error("Secret Manager returned an empty payload.");
  }
  const buf = typeof data === "string" ? Buffer.from(data, "utf8") : Buffer.from(data);
  return buf.toString("utf8").trim();
}
