'use client';

import { UserProfile } from './localDb';
import { db, isFirebaseConfigured } from './firebase';
import { doc, setDoc, getDocs, collection, deleteDoc, onSnapshot } from 'firebase/firestore';

export interface Batch {
  id: string;
  name: string;
  description: string;
  examCategory: string;
  schedule: string;
  startDate: string;
  endDate: string;
  color: string;
  tags: string[];
  batchCode: string;
}

export interface Homework {
  id: string;
  batchId: string;
  batchName: string;
  title: string;
  notes: string;
  deadline: string;
  teacherName: string;
  uploadDate: string;
  fileName?: string;
  fileType?: 'image' | 'pdf';
  fileData?: string; // base64 representation of uploaded mock file
  completedBy: string[]; // list of student emails who completed it
  bookmarkedBy: string[]; // list of student emails who bookmarked it
  archivedBy: string[]; // list of student emails who archived it
  questionsCount?: number;
  solvedResults?: any[]; // Solved results array from Multi-Question solver
}

export interface Announcement {
  id: string;
  batchId: string;
  batchName: string;
  message: string;
  teacherName: string;
  timestamp: number;
}

export interface StudentProgress {
  email: string;
  name: string;
  targetExam: string;
  level: number;
  xp: number;
  streakCount: number;
  questionsSolved: number;
  aiUsageCount: number;
  accuracy: number;
  avgSolvingTimeSeconds: number;
  weakestSubject: string;
  strongestSubject: string;
  homeworkCompletionRate: number;
  studyHoursPerDay: number;
  district: string;
  state: string;
  highestQualification: string;
  registrationDate: string;
  lastActiveDate: string;
}

// Helper to check for SSR
const isClient = typeof window !== 'undefined';

// Initialize with empty arrays (NO mock students or batches)
const INITIAL_STUDENTS: StudentProgress[] = [];
const INITIAL_BATCHES: Batch[] = [];

const MOCK_STUDENT_NAMES = [
  'rohit murmu', 'ananya sen', 'priya das', 'subhasis chatterjee', 
  'amit patel', 'sunita sharma', 'rohan mehta', 'vikram singh'
];

export function isRealRegisteredStudent(email: string, name: string): boolean {
  if (!email || !name) return false;
  const emailLower = email.toLowerCase();
  const nameLower = name.toLowerCase();
  if (emailLower === 'ankush.santra@examsprint.ai') return false;
  if (MOCK_STUDENT_NAMES.includes(nameLower)) return false;
  return true;
}

// Auto-migrate and filter out any remaining mock profiles from browser caches
if (isClient) {
  try {
    const rawStuds = localStorage.getItem('cloud_students');
    if (rawStuds) {
      const parsed = JSON.parse(rawStuds) as any[];
      const filtered = parsed.filter((s: any) => s && s.name && isRealRegisteredStudent(s.email, s.name));
      if (filtered.length !== parsed.length) {
        localStorage.setItem('cloud_students', JSON.stringify(filtered));
      }
    }
  } catch (err) {
    console.error("Local storage migration clean error:", err);
  }
}

function getStored<T>(key: string, defaultValue: T): T {
  if (!isClient) return defaultValue;
  const stored = localStorage.getItem(key);
  if (!stored) {
    localStorage.setItem(key, JSON.stringify(defaultValue));
    return defaultValue;
  }
  try {
    return JSON.parse(stored);
  } catch {
    return defaultValue;
  }
}

function setStored<T>(key: string, value: T) {
  if (!isClient) return;
  localStorage.setItem(key, JSON.stringify(value));
  
  // Dispatch local window sync event so the active tab's components receive it
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('examsprint-sync-event', { detail: { key } }));
  }

  // Broadcast sync trigger locally to other tabs
  try {
    const channel = new BroadcastChannel('examsprint-sync');
    channel.postMessage({ type: 'sync', key });
  } catch (e) {
    // BroadcastChannel unsupported
  }
}

// Global Sync Channel
export function subscribeToCloudSync(callback: (key: string) => void): () => void {
  if (!isClient) return () => {};
  
  const handleSyncEvent = (event: any) => {
    const key = event.detail?.key || event.data?.key;
    callback(key);
  };

  try {
    const channel = new BroadcastChannel('examsprint-sync');
    const listener = (event: MessageEvent) => {
      if (event.data?.type === 'sync') {
        callback(event.data.key);
      }
    };
    channel.addEventListener('message', listener);
    window.addEventListener('examsprint-sync-event', handleSyncEvent);

    return () => {
      channel.removeEventListener('message', listener);
      channel.close();
      window.removeEventListener('examsprint-sync-event', handleSyncEvent);
    };
  } catch (e) {
    window.addEventListener('examsprint-sync-event', handleSyncEvent);
    return () => {
      window.removeEventListener('examsprint-sync-event', handleSyncEvent);
    };
  }
}

// ── Firebase Write-Through Cache Engine ───────────────────────────────────────
// Synchronizes LocalStorage state with Firebase Firestore in real-time.
if (isClient && isFirebaseConfigured && db) {
  // 1. Batches Real-time Listener
  onSnapshot(collection(db, 'batches'), (snapshot) => {
    try {
      const fbBatches: Batch[] = [];
      snapshot.forEach((doc: any) => {
        const val = doc.data();
        if (val && val.id) fbBatches.push(val as Batch);
      });
      const local = getStored<Batch[]>('cloud_batches', INITIAL_BATCHES);
      if (JSON.stringify(local) !== JSON.stringify(fbBatches)) {
        setStored('cloud_batches', fbBatches);
      }
    } catch (err) {
      console.warn("Batches onSnapshot error:", err);
    }
  });

  // 2. Students Real-time Listener (Filtering mock and teacher accounts)
  onSnapshot(collection(db, 'students'), (snapshot) => {
    try {
      const fbStuds: StudentProgress[] = [];
      snapshot.forEach((doc: any) => {
        const data = doc.data() as StudentProgress;
        if (data && isRealRegisteredStudent(data.email, data.name)) {
          fbStuds.push(data);
        }
      });
      const local = getStored<StudentProgress[]>('cloud_students', INITIAL_STUDENTS);
      if (JSON.stringify(local) !== JSON.stringify(fbStuds)) {
        setStored('cloud_students', fbStuds);
      }
    } catch (err) {
      console.warn("Students onSnapshot error:", err);
    }
  });

  // 3. Homeworks Real-time Listener
  onSnapshot(collection(db, 'homeworks'), (snapshot) => {
    try {
      const fbHws: Homework[] = [];
      snapshot.forEach((doc: any) => {
        const val = doc.data();
        if (val && val.id) fbHws.push(val as Homework);
      });
      const local = getStored<Homework[]>('cloud_homeworks', []);
      if (JSON.stringify(local) !== JSON.stringify(fbHws)) {
        setStored('cloud_homeworks', fbHws);
      }
    } catch (err) {
      console.warn("Homeworks onSnapshot error:", err);
    }
  });

  // 4. Announcements Real-time Listener
  onSnapshot(collection(db, 'announcements'), (snapshot) => {
    try {
      const fbAnns: Announcement[] = [];
      snapshot.forEach((doc: any) => {
        const val = doc.data();
        if (val && val.id) fbAnns.push(val as Announcement);
      });
      const local = getStored<Announcement[]>('cloud_announcements', []);
      if (JSON.stringify(local) !== JSON.stringify(fbAnns)) {
        setStored('cloud_announcements', fbAnns);
      }
    } catch (err) {
      console.warn("Announcements onSnapshot error:", err);
    }
  });

  // 5. Assignments Map Real-time Listener
  onSnapshot(collection(db, 'student_batches'), (snapshot) => {
    try {
      const fbMap: Record<string, string[]> = {};
      snapshot.forEach((doc: any) => {
        const d = doc.data();
        if (d && d.email && d.batches) fbMap[d.email] = d.batches;
      });
      const local = getStored<Record<string, string[]>>('cloud_student_batches', {});
      if (JSON.stringify(local) !== JSON.stringify(fbMap)) {
        setStored('cloud_student_batches', fbMap);
      }
    } catch (err) {
      console.warn("Student_batches onSnapshot error:", err);
    }
  });
}

// Firestore async write helpers
async function writeToFirestore(collectionName: string, docId: string, data: any) {
  if (!isFirebaseConfigured || !db) return;
  try {
    await setDoc(doc(db, collectionName, docId), data, { merge: true });
  } catch (e) {
    console.error(`Error syncing ${collectionName}/${docId} to Firestore:`, e);
  }
}

async function deleteFromFirestore(collectionName: string, docId: string) {
  if (!isFirebaseConfigured || !db) return;
  try {
    await deleteDoc(doc(db, collectionName, docId));
  } catch (e) {
    console.error(`Error deleting ${collectionName}/${docId} in Firestore:`, e);
  }
}

// ── Database Methods ─────────────────────────────────────────────────────────

export const cloudDb = {
  // BATCHES
  getBatches: (): Batch[] => {
    return getStored<Batch[]>('cloud_batches', INITIAL_BATCHES);
  },
  saveBatch: (batch: Batch) => {
    const batches = cloudDb.getBatches();
    const index = batches.findIndex(b => b.id === batch.id);
    if (index >= 0) batches[index] = batch;
    else batches.push(batch);
    setStored('cloud_batches', batches);
    
    // Write-Through to Firestore
    writeToFirestore('batches', batch.id, batch);
  },
  deleteBatch: (batchId: string) => {
    const batches = cloudDb.getBatches();
    const filtered = batches.filter(b => b.id !== batchId);
    setStored('cloud_batches', filtered);
    
    // Cleanup assignments local cache
    const map = cloudDb.getStudentBatchesMap();
    Object.keys(map).forEach(email => {
      map[email] = map[email].filter(id => id !== batchId);
      writeToFirestore('student_batches', email.replace(/\./g, '_'), { email, batches: map[email] });
    });
    setStored('cloud_student_batches', map);

    // Delete in Firestore
    deleteFromFirestore('batches', batchId);
  },

  // STUDENTS
  getStudents: (): StudentProgress[] => {
    const all = getStored<StudentProgress[]>('cloud_students', INITIAL_STUDENTS);
    return all.filter(s => s && isRealRegisteredStudent(s.email, s.name));
  },
  saveStudent: (student: StudentProgress) => {
    const students = cloudDb.getStudents();
    const index = students.findIndex(s => s.email.toLowerCase() === student.email.toLowerCase());
    if (index >= 0) students[index] = student;
    else students.push(student);
    setStored('cloud_students', students);

    // Write-Through to Firestore
    writeToFirestore('students', student.email.toLowerCase(), student);
  },

  // STUDENT PROFILE REGISTRATION HELPER
  registerUserProfile: (profile: UserProfile, email: string) => {
    const students = cloudDb.getStudents();
    const existing = students.find(s => s.email.toLowerCase() === email.toLowerCase());
    
    const progress: StudentProgress = {
      email: email.toLowerCase(),
      name: profile.name,
      targetExam: profile.targetExam,
      level: existing?.level || 1,
      xp: existing?.xp || 0,
      streakCount: existing?.streakCount || 1,
      questionsSolved: existing?.questionsSolved || 0,
      aiUsageCount: existing?.aiUsageCount || 0,
      accuracy: existing?.accuracy || 90,
      avgSolvingTimeSeconds: existing?.avgSolvingTimeSeconds || 40,
      weakestSubject: profile.weakSubject || 'Quantitative Aptitude',
      strongestSubject: profile.strongSubject || 'General Intelligence',
      homeworkCompletionRate: existing?.homeworkCompletionRate || 0,
      studyHoursPerDay: profile.dailyHours || 4,
      district: (profile as any).district || 'Kolkata',
      state: (profile as any).state || 'West Bengal',
      highestQualification: profile.qualification || 'Graduate',
      registrationDate: existing?.registrationDate || new Date().toISOString().split('T')[0],
      lastActiveDate: new Date().toISOString().split('T')[0]
    };

    cloudDb.saveStudent(progress);
  },
  deleteStudentProfile: (email: string) => {
    const students = cloudDb.getStudents();
    const filtered = students.filter(s => s.email.toLowerCase() !== email.toLowerCase());
    setStored('cloud_students', filtered);

    // Clean student from batch assignments map
    const map = cloudDb.getStudentBatchesMap();
    const emailKey = email.toLowerCase();
    if (map[emailKey]) {
      delete map[emailKey];
      setStored('cloud_student_batches', map);
      writeToFirestore('student_batches', emailKey.replace(/\./g, '_'), { email: emailKey, batches: [] });
    }

    // Delete student document in Firestore
    deleteFromFirestore('students', emailKey);
  },

  // BATCH ASSIGNMENTS (Maps studentEmail -> batchId[])
  getStudentBatchesMap: (): Record<string, string[]> => {
    const defaultMap: Record<string, string[]> = {};
    return getStored<Record<string, string[]>>('cloud_student_batches', defaultMap);
  },
  assignStudentToBatch: (studentEmail: string, batchId: string) => {
    const map = cloudDb.getStudentBatchesMap();
    if (!map[studentEmail]) map[studentEmail] = [];
    if (!map[studentEmail].includes(batchId)) {
      map[studentEmail].push(batchId);
      setStored('cloud_student_batches', map);
      
      // Write-Through to Firestore
      writeToFirestore('student_batches', studentEmail.replace(/\./g, '_'), { email: studentEmail, batches: map[studentEmail] });

      // Trigger notification
      cloudDb.addNotification(studentEmail, `🎒 You have been added to the batch: ${cloudDb.getBatches().find(b => b.id === batchId)?.name || 'New Batch'}`, 'info');
    }
  },
  removeStudentFromBatch: (studentEmail: string, batchId: string) => {
    const map = cloudDb.getStudentBatchesMap();
    if (map[studentEmail]) {
      map[studentEmail] = map[studentEmail].filter(id => id !== batchId);
      setStored('cloud_student_batches', map);

      // Write-Through to Firestore
      writeToFirestore('student_batches', studentEmail.replace(/\./g, '_'), { email: studentEmail, batches: map[studentEmail] });
    }
  },

  // HOMEWORK
  getHomeworks: (): Homework[] => {
    return getStored<Homework[]>('cloud_homeworks', []);
  },
  addHomework: (hw: Omit<Homework, 'id' | 'uploadDate' | 'completedBy' | 'bookmarkedBy' | 'archivedBy'>) => {
    const hwList = cloudDb.getHomeworks();
    const newHw: Homework = {
      ...hw,
      id: 'hw-' + Math.random().toString(36).substring(7),
      uploadDate: new Date().toISOString().split('T')[0],
      completedBy: [],
      bookmarkedBy: [],
      archivedBy: []
    };
    hwList.push(newHw);
    setStored('cloud_homeworks', hwList);

    // Write-Through to Firestore
    writeToFirestore('homeworks', newHw.id, newHw);

    // Notify all students in the batch
    const map = cloudDb.getStudentBatchesMap();
    Object.entries(map).forEach(([email, batchIds]) => {
      if (batchIds.includes(hw.batchId)) {
        cloudDb.addNotification(email, `📝 New Homework Assigned: "${hw.title}" under batch ${hw.batchName}`, 'homework');
      }
    });
  },
  updateHomeworkStatus: (hwId: string, email: string, action: 'complete' | 'bookmark' | 'archive', value: boolean) => {
    const hws = cloudDb.getHomeworks();
    const index = hws.findIndex(h => h.id === hwId);
    if (index >= 0) {
      const field = action === 'complete' ? 'completedBy' : action === 'bookmark' ? 'bookmarkedBy' : action === 'archive' ? 'archivedBy' : 'completedBy';
      let list = hws[index][field] || [];
      if (value) {
        if (!list.includes(email)) list.push(email);
      } else {
        list = list.filter(e => e !== email);
      }
      hws[index][field] = list;
      setStored('cloud_homeworks', hws);

      // Write-Through to Firestore
      writeToFirestore('homeworks', hwId, hws[index]);

      // Re-calculate homework completion rates
      if (action === 'complete') {
        const studentHws = hws.filter(h => {
          const studentBatches = cloudDb.getStudentBatchesMap()[email] || [];
          return studentBatches.includes(h.batchId);
        });
        const completed = studentHws.filter(h => h.completedBy.includes(email)).length;
        
        const students = cloudDb.getStudents();
        const sIndex = students.findIndex(s => s.email.toLowerCase() === email.toLowerCase());
        if (sIndex >= 0) {
          const total = studentHws.length;
          students[sIndex].homeworkCompletionRate = total > 0 ? Math.round((completed / total) * 100) : 100;
          cloudDb.saveStudent(students[sIndex]);
        }
      }
    }
  },

  // ANNOUNCEMENTS
  getAnnouncements: (): Announcement[] => {
    return getStored<Announcement[]>('cloud_announcements', []);
  },
  addAnnouncement: (data: { batchId: string; message: string; teacherName: string; batchName?: string }) => {
    const { batchId, message, teacherName } = data;
    const anns = cloudDb.getAnnouncements();
    const batches = cloudDb.getBatches();
    const batchName = batches.find(b => b.id === batchId)?.name || 'Class Batch';
    
    const newAnn: Announcement = {
      id: 'ann-' + Math.random().toString(36).substring(7),
      batchId,
      batchName,
      message,
      teacherName,
      timestamp: Date.now()
    };
    anns.push(newAnn);
    setStored('cloud_announcements', anns);

    // Write-Through to Firestore
    writeToFirestore('announcements', newAnn.id, newAnn);

    // Notify all students in the batch
    const map = cloudDb.getStudentBatchesMap();
    Object.entries(map).forEach(([email, batchIds]) => {
      if (batchIds.includes(batchId)) {
        cloudDb.addNotification(email, `📢 Announcement for ${batchName}: "${message.substring(0, 40)}..."`, 'announcement');
      }
    });
  },

  // STUDENT NOTIFICATIONS (Simulated locally per-student email for user privacy)
  getNotifications: (email: string): any[] => {
    return getStored<any[]>(`notifications_${email.toLowerCase()}`, []);
  },
  addNotification: (email: string, message: string, type: 'homework' | 'announcement' | 'info') => {
    const list = cloudDb.getNotifications(email);
    list.unshift({
      id: 'notif-' + Math.random().toString(36).substring(7),
      message,
      type,
      timestamp: Date.now(),
      unread: true
    });
    setStored(`notifications_${email.toLowerCase()}`, list);
  },
  clearNotifications: (email: string) => {
    setStored(`notifications_${email.toLowerCase()}`, []);
  }
};
