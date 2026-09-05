export interface PendingScan {
  id: string;
  createdAt: string;
  district: string;
  fileName: string;
  fileType: string;
  blob: Blob;
}

const DB_NAME = "alusathi-offline";
const STORE_NAME = "pending-scans";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function savePendingScan(file: File, district: string): Promise<void> {
  const database = await openDatabase();
  const item: PendingScan = {
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    district,
    fileName: file.name,
    fileType: file.type,
    blob: file,
  };
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).put(item);
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error || new Error("Save aborted"));
    transaction.onerror = () => reject(transaction.error);
  }).finally(() => database.close());
}

export async function listPendingScans(): Promise<PendingScan[]> {
  const database = await openDatabase();
  const items = await new Promise<PendingScan[]>((resolve, reject) => {
    const request = database.transaction(STORE_NAME, "readonly").objectStore(STORE_NAME).getAll();
    request.onsuccess = () => resolve(request.result as PendingScan[]);
    request.onerror = () => reject(request.error);
  }).finally(() => database.close());
  return items;
}

export async function deletePendingScan(id: string): Promise<void> {
  const database = await openDatabase();
  await new Promise<void>((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, "readwrite");
    transaction.objectStore(STORE_NAME).delete(id);
    transaction.oncomplete = () => resolve();
    transaction.onabort = () => reject(transaction.error || new Error("Delete aborted"));
    transaction.onerror = () => reject(transaction.error);
  }).finally(() => database.close());
}
