export interface UserProfile {
  name: string;
  avatar: string;
  age: string;
  gender: string;
  qualification: string;
  occupation: string;
  language: string;
  targetExam: string;
  targetYear: string;
  dailyHours: number;
  weakSubject: string;
  strongSubject: string;
  dailyGoal: string;
  themePreference: 'railway' | 'police' | 'ssc' | 'banking' | 'defence' | 'auto';
  xp: number;
  coins: number;
  level: number;
  streakCount: number;
  mobileNumber?: string;
  email?: string;
  collegeSchool?: string;
  district?: string;
  state?: string;
  role?: 'student' | 'teacher';
  profilePicture?: string;
}


export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  mathSolverResult?: any;
  bookmarked?: boolean;
}

export interface MockTestLog {
  id: string;
  examId: string;
  examName: string;
  dateString: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  incorrect: number;
  timeSpentSeconds: number;
  score: number;
  accuracy: number;
  speedSecPerQuest: number;
  selectionProbability: number;
}

export interface BookmarkItem {
  id: string;
  type: 'chat' | 'question' | 'formula';
  title: string;
  content: string;
  chapter?: string;
  shortcut?: string;
  timestamp: number;
}

const DB_NAME = "ExamSprintDB";
const DB_VERSION = 2;

export function initDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return reject("Server-side execution");
    
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => reject(request.error);
    request.onsuccess = (event) => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = request.result;
      
      // Profiles store
      if (!db.objectStoreNames.contains("profiles")) {
        db.createObjectStore("profiles", { keyPath: "id" });
      }
      
      // Chats store
      if (!db.objectStoreNames.contains("chats")) {
        db.createObjectStore("chats", { keyPath: "id" });
      }

      // Bookmarks store
      if (!db.objectStoreNames.contains("bookmarks")) {
        db.createObjectStore("bookmarks", { keyPath: "id" });
      }

      // Test logs store
      if (!db.objectStoreNames.contains("testlogs")) {
        db.createObjectStore("testlogs", { keyPath: "id" });
      }

      // Streaks store
      if (!db.objectStoreNames.contains("streaks")) {
        db.createObjectStore("streaks", { keyPath: "date" });
      }
    };
  });
}

// PROFILE OPERATIONS
export async function getProfile(): Promise<UserProfile | null> {
  try {
    const db = await initDb();
    return new Promise((resolve) => {
      const transaction = db.transaction("profiles", "readonly");
      const store = transaction.objectStore(valueNameMap("profiles"));
      const request = store.get("user");
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
  } catch (e) {
    return null;
  }
}

export async function saveProfile(profile: UserProfile): Promise<void> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("profiles", "readwrite");
      const store = transaction.objectStore(valueNameMap("profiles"));
      const request = store.put({ id: "user", ...profile });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("IndexedDB error during profile save", e);
  }
}

// CHATS OPERATIONS
export async function getChats(examId: string): Promise<ChatMessage[]> {
  try {
    const db = await initDb();
    return new Promise((resolve) => {
      const transaction = db.transaction("chats", "readonly");
      const store = transaction.objectStore(valueNameMap("chats"));
      
      // Get all and filter
      const request = store.getAll();
      request.onsuccess = () => {
        const all = request.result || [];
        // Extract items for target exam and sort by timestamp
        const filtered = all
          .filter((c: any) => c.examId === examId)
          .sort((a: any, b: any) => a.timestamp - b.timestamp);
        resolve(filtered);
      };
      request.onerror = () => resolve([]);
    });
  } catch (e) {
    return [];
  }
}

export async function addChat(examId: string, message: Omit<ChatMessage, "id"> & { id?: string }): Promise<void> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("chats", "readwrite");
      const store = transaction.objectStore(valueNameMap("chats"));
      const record = {
        id: message.id || Math.random().toString(36).substring(7),
        examId,
        ...message
      };
      const request = store.put(record);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error(e);
  }
}

export async function deleteChat(id: string): Promise<void> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("chats", "readwrite");
      const store = transaction.objectStore(valueNameMap("chats"));
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error(e);
  }
}

export async function clearAllChats(examId: string): Promise<void> {
  try {
    const db = await initDb();
    const chats = await getChats(examId);
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("chats", "readwrite");
      const store = transaction.objectStore(valueNameMap("chats"));
      let count = 0;
      if (chats.length === 0) return resolve();
      for (const chat of chats) {
        const req = store.delete(chat.id);
        req.onsuccess = () => {
          count++;
          if (count === chats.length) resolve();
        };
        req.onerror = () => reject(req.error);
      }
    });
  } catch (e) {
    console.error(e);
  }
}

// BOOKMARKS OPERATIONS
export async function getBookmarks(): Promise<BookmarkItem[]> {
  try {
    const db = await initDb();
    return new Promise((resolve) => {
      const transaction = db.transaction("bookmarks", "readonly");
      const store = transaction.objectStore(valueNameMap("bookmarks"));
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch (e) {
    return [];
  }
}

export async function addBookmark(bookmark: BookmarkItem): Promise<void> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("bookmarks", "readwrite");
      const store = transaction.objectStore(valueNameMap("bookmarks"));
      const request = store.put(bookmark);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error(e);
  }
}

export async function removeBookmark(id: string): Promise<void> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("bookmarks", "readwrite");
      const store = transaction.objectStore(valueNameMap("bookmarks"));
      const request = store.delete(id);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error(e);
  }
}

// TEST LOGS
export async function getTestLogs(): Promise<MockTestLog[]> {
  try {
    const db = await initDb();
    return new Promise((resolve) => {
      const transaction = db.transaction("testlogs", "readonly");
      const store = transaction.objectStore(valueNameMap("testlogs"));
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => resolve([]);
    });
  } catch (e) {
    return [];
  }
}

export async function addTestLog(log: MockTestLog): Promise<void> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("testlogs", "readwrite");
      const store = transaction.objectStore(valueNameMap("testlogs"));
      const request = store.put(log);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error(e);
  }
}

// STREAKS OPERATIONS
export async function getStreakLog(): Promise<string[]> {
  try {
    const db = await initDb();
    return new Promise((resolve) => {
      const transaction = db.transaction("streaks", "readonly");
      const store = transaction.objectStore(valueNameMap("streaks"));
      const request = store.getAll();
      request.onsuccess = () => {
        const list = request.result || [];
        resolve(list.map((item: any) => item.date));
      };
      request.onerror = () => resolve([]);
    });
  } catch (e) {
    return [];
  }
}

export async function addStreakDay(dateString: string): Promise<void> {
  try {
    const db = await initDb();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction("streaks", "readwrite");
      const store = transaction.objectStore(valueNameMap("streaks"));
      const request = store.put({ date: dateString, completed: true });
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error(e);
  }
}

// Helper to make TS checker happy
function valueNameMap(name: string) {
  return name;
}
