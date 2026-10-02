// Tiny IndexedDB wrapper. Slots: { id, label, name, blob }
const DB_NAME = 'sijj-soundboard';
const STORE = 'slots';
const DEFAULT_SLOTS = 12;

function open() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => req.result.createObjectStore(STORE, { keyPath: 'id' });
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function tx(mode, fn) {
  const db = await open();
  return new Promise((resolve, reject) => {
    const t = db.transaction(STORE, mode);
    const result = fn(t.objectStore(STORE));
    t.oncomplete = () => resolve(result.result);
    t.onerror = () => reject(t.error);
  });
}

async function getSlots() {
  let slots = await tx('readonly', s => s.getAll());
  if (!slots.length) {
    slots = Array.from({ length: DEFAULT_SLOTS }, (_, i) => ({ id: i + 1, label: `Sijj ${i + 1}`, name: '', blob: null }));
    await Promise.all(slots.map(saveSlot));
  }
  return slots.sort((a, b) => a.id - b.id);
}

const saveSlot = slot => tx('readwrite', s => s.put(slot));
const deleteSlot = id => tx('readwrite', s => s.delete(id));
