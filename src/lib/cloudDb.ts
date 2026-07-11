'use client';

import { UserProfile } from './localDb';
import { db, isFirebaseConfigured } from './firebase';
import { doc, setDoc, getDocs, collection, deleteDoc } from 'firebase/firestore';

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

// Auto-migrate and filter out any remaining mock profiles from browser caches
if (isClient) {
  try {
    const rawStuds = localStorage.getItem('cloud_students');
    if (rawStuds) {
      const parsed = JSON.parse(rawStuds) as any[];
      const mockNames = ['rohit murmu', 'ananya sen', 'priya das', 'subhasis chatterjee', 'amit patel', 'sunita sharma', 'rohan mehta', 'vikram singh'];
      const filtered = parsed.filter((s: any) => s && s.name && !mockNames.includes(s.name.toLowerCase()));
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
  // Broadcast sync trigger locally
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
  try {
    const channel = new BroadcastChannel('examsprint-sync');
    const listener = (event: MessageEvent) => {
      if (event.data?.type === 'sync') {
        callback(event.data.key);
      }
    };
    channel.addEventListener('message', listener);
    return () => {
      channel.removeEventListener('message', listener);
      channel.close();
    };
  } catch (e) {
    return () => {};
  }
}

// ── Firebase Write-Through Cache Engine ───────────────────────────────────────
// Asynchronously synchronizes LocalStorage state with Firebase Firestore if available.
if (isClient && isFirebaseConfigured && db) {
  // Pull initial snapshot from Firestore and update Cache
  const syncFromFirestore = async () => {
    try {
      // 1. Batches
      const batchSnap = await getDocs(collection(db, 'batches'));
      const fbBatches: Batch[] = [];
      batchSnap.forEach((doc: any) => fbBatches.push(doc.data() as Batch));
      if (fbBatches.length > 0) setStored('cloud_batches', fbBatches);

      // 2. Students
      const studSnap = await getDocs(collection(db, 'students'));
      const fbStuds: StudentProgress[] = [];
      studSnap.forEach((doc: any) => fbStuds.push(doc.data() as StudentProgress));
      if (fbStuds.length > 0) setStored('cloud_students', fbStuds);

      // 3. Homeworks
      const hwSnap = await getDocs(collection(db, 'homeworks'));
      const fbHws: Homework[] = [];
      hwSnap.forEach((doc: any) => fbHws.push(doc.data() as Homework));
      setStored('cloud_homeworks', fbHws);

      // 4. Announcements
      const annSnap = await getDocs(collection(db, 'announcements'));
      const fbAnns: Announcement[] = [];
      annSnap.forEach((doc: any) => fbAnns.push(doc.data() as Announcement));
      setStored('cloud_announcements', fbAnns);

      // 5. Assignments Map
      const mapSnap = await getDocs(collection(db, 'student_batches'));
      const fbMap: Record<string, string[]> = {};
      mapSnap.forEach((doc: any) => {
        const d = doc.data();
        if (d.email && d.batches) fbMap[d.email] = d.batches;
      });
      if (Object.keys(fbMap).length > 0) setStored('cloud_student_batches', fbMap);

    } catch (err) {
      console.warn("Firestore collection sync error:", err);
    }
  };

  syncFromFirestore();
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
    return getStored<StudentProgress[]>('cloud_students', INITIAL_STUDENTS);
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
