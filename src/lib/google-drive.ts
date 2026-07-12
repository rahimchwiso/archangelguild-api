// Server-only: Google Apps Script Web App proxy for image upload/delete

export async function uploadToDrive(
  fileBuffer: Buffer,
  fileName: string,
  mimeType: string,
  category?: string | null
): Promise<{ fileId: string; publicUrl: string }> {
  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const apiKey = process.env.GOOGLE_APPS_SCRIPT_API_KEY;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!scriptUrl || !apiKey || !folderId) {
    throw new Error("Google Apps Script environment variables are not configured.");
  }

  const base64Data = fileBuffer.toString("base64");

  const response = await fetch(scriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      apiKey,
      action: "upload",
      folderId,
      base64Data,
      fileName,
      mimeType,
      subfolderName: category || "",
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Apps Script responded with status ${response.status}: ${text}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(`Google Apps Script upload failed: ${result.error}`);
  }

  const publicUrl = result.fileId
    ? `https://lh3.googleusercontent.com/d/${result.fileId}`
    : result.publicUrl;

  return { fileId: result.fileId, publicUrl };
}

export function extractFileId(url: string): string | null {
  if (!url) return null;
  const ucMatch = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
  if (ucMatch) return ucMatch[1];
  const fileMatch = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) return fileMatch[1];
  const lhMatch = url.match(/googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
  if (lhMatch) return lhMatch[1];
  return null;
}

export async function deleteFromDrive(fileId: string): Promise<void> {
  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const apiKey = process.env.GOOGLE_APPS_SCRIPT_API_KEY;

  if (!scriptUrl || !apiKey) {
    throw new Error("Google Apps Script environment variables are not configured.");
  }

  const response = await fetch(scriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey, action: "delete", fileId }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Apps Script responded with status ${response.status}: ${text}`);
  }

  const result = await response.json();
  if (result.error) {
    throw new Error(`Google Apps Script deletion failed: ${result.error}`);
  }
}

export async function listDriveFiles(): Promise<{
  files: Array<{
    id: string;
    name: string;
    mimeType: string;
    size: number;
    created: string;
    url: string;
    path: string;
  }>;
  storageUsed: number;
  storageLimit: number;
}> {
  const scriptUrl = process.env.GOOGLE_APPS_SCRIPT_URL;
  const apiKey = process.env.GOOGLE_APPS_SCRIPT_API_KEY;
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  if (!scriptUrl || !apiKey || !folderId) {
    throw new Error("Google Apps Script environment variables are not configured.");
  }

  const response = await fetch(scriptUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ apiKey, action: "list", folderId }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Google Apps Script responded with status ${response.status}: ${text}`);
  }

  const result = await response.json();
  if (!result.success) {
    throw new Error(`Google Apps Script file listing failed: ${result.error}`);
  }

  return {
    files: result.files || [],
    storageUsed: result.storageUsed || 0,
    storageLimit: result.storageLimit || 0,
  };
}
