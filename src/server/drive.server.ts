// Server-only Google Drive helper via Lovable connector gateway.
// Ensures an "RKInfinity Reports" folder exists and uploads files to it.

const DRIVE_BASE = "https://connector-gateway.lovable.dev/google_drive/drive/v3";
const DRIVE_UPLOAD = "https://connector-gateway.lovable.dev/google_drive/upload/drive/v3/files";
const REPORT_FOLDER_NAME = "RKInfinity Reports";

function authHeaders() {
  const lovableKey = process.env.LOVABLE_API_KEY;
  const driveKey = process.env.GOOGLE_DRIVE_API_KEY;
  if (!lovableKey) throw new Error("LOVABLE_API_KEY missing");
  if (!driveKey) throw new Error("GOOGLE_DRIVE_API_KEY missing");
  return {
    Authorization: `Bearer ${lovableKey}`,
    "X-Connection-Api-Key": driveKey,
  };
}

export async function ensureReportFolder(): Promise<string> {
  const headers = authHeaders();
  // Look up existing folder created by this app (drive.file scope).
  const q = encodeURIComponent(
    `name='${REPORT_FOLDER_NAME}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
  );
  const list = await fetch(`${DRIVE_BASE}/files?q=${q}&fields=files(id,name)`, { headers });
  if (list.ok) {
    const data = (await list.json()) as { files?: Array<{ id: string }> };
    if (data.files && data.files.length > 0) return data.files[0].id;
  }

  // Create the folder
  const create = await fetch(`${DRIVE_BASE}/files?fields=id`, {
    method: "POST",
    headers: { ...headers, "Content-Type": "application/json" },
    body: JSON.stringify({
      name: REPORT_FOLDER_NAME,
      mimeType: "application/vnd.google-apps.folder",
    }),
  });
  if (!create.ok) {
    throw new Error(`Drive folder create failed: ${create.status} ${await create.text()}`);
  }
  const created = (await create.json()) as { id: string };
  return created.id;
}

export async function uploadReportToDrive(opts: {
  filename: string;
  mimeType: string;
  body: string; // text/html/csv content
}): Promise<{ id: string; webViewLink?: string }> {
  const headers = authHeaders();
  const folderId = await ensureReportFolder();

  const boundary = `rk_${Math.random().toString(36).slice(2)}`;
  const metadata = {
    name: opts.filename,
    mimeType: opts.mimeType,
    parents: [folderId],
  };

  const multipartBody =
    `--${boundary}\r\n` +
    `Content-Type: application/json; charset=UTF-8\r\n\r\n` +
    `${JSON.stringify(metadata)}\r\n` +
    `--${boundary}\r\n` +
    `Content-Type: ${opts.mimeType}\r\n\r\n` +
    `${opts.body}\r\n` +
    `--${boundary}--`;

  const res = await fetch(`${DRIVE_UPLOAD}?uploadType=multipart&fields=id,webViewLink`, {
    method: "POST",
    headers: {
      ...headers,
      "Content-Type": `multipart/related; boundary=${boundary}`,
    },
    body: multipartBody,
  });
  if (!res.ok) {
    throw new Error(`Drive upload failed: ${res.status} ${await res.text()}`);
  }
  return (await res.json()) as { id: string; webViewLink?: string };
}
