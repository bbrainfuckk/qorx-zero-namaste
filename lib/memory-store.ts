import type { MemoryItem } from "./memory";

const DB_NAME = "qorx-zero";
const DB_VERSION = 1;
const STORE_NAME = "memories";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = () => reject(request.error);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };
    request.onsuccess = () => resolve(request.result);
  });
}

async function transact<T>(
  mode: IDBTransactionMode,
  action: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> {
  const database = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = database.transaction(STORE_NAME, mode);
    const request = action(transaction.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    transaction.oncomplete = () => database.close();
    transaction.onerror = () => reject(transaction.error);
  });
}

export async function listMemories(): Promise<MemoryItem[]> {
  const memories = await transact<MemoryItem[]>("readonly", (store) =>
    store.getAll(),
  );
  return memories.sort((left, right) =>
    right.createdAt.localeCompare(left.createdAt),
  );
}

export async function saveMemory(memory: MemoryItem): Promise<void> {
  await transact<IDBValidKey>("readwrite", (store) => store.put(memory));
}

export async function forgetMemory(id: string): Promise<void> {
  await transact<undefined>("readwrite", (store) => store.delete(id));
}

export async function clearMemories(): Promise<void> {
  await transact<undefined>("readwrite", (store) => store.clear());
}
