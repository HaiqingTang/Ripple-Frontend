import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as crypto from "crypto";

admin.initializeApp();

type CloudinaryCfg = { cloud_name: string; api_key: string; api_secret: string };

let cachedCfg: CloudinaryCfg | null = null;

async function loadCfg(): Promise<CloudinaryCfg> {
  if (cachedCfg) return cachedCfg;

  const db = admin.firestore();

  // 任选其一（建议第一种结构清晰）：
  // ① 读子集合文档 __private/config/cloudinary/default
  const snap = await db.doc("__private/config/cloudinary/default").get();

  // ② 或者如果你是把字段直接放在 __private/config 根文档：
  // const snap = await db.doc("__private/config").get();

  if (!snap.exists) {
    throw new Error("Cloudinary config not found in Firestore.");
  }
  const data = snap.data() as any;

  const cfg: CloudinaryCfg = {
    cloud_name: String(data.cloud_name || data.cloudName || "").trim(),
    api_key: String(data.api_key || data.apiKey || "").trim(),
    api_secret: String(data.api_secret || data.apiSecret || "").trim(),
  };
  if (!cfg.cloud_name || !cfg.api_key || !cfg.api_secret) {
    throw new Error("Cloudinary config missing required fields.");
  }
  cachedCfg = cfg; // 缓存到内存，后续冷启动前都不再读库
  return cfg;
}

export const getCloudinarySignature = functions
  .region("us-central1")
  .https.onCall(async (_data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError("unauthenticated", "Sign in required.");
    }

    const { cloud_name, api_key, api_secret } = await loadCfg();

    const timestamp = Math.floor(Date.now() / 1000);
    const folder = "challenge_checkins";
    const toSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto.createHash("sha1").update(toSign + api_secret).digest("hex");

    return { timestamp, folder, signature, api_key, cloud_name };
  });
