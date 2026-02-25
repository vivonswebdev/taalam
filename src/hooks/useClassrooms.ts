import { useState, useCallback, useEffect } from "react";

// ─── Types ──────────────────────────────────────────────────
export interface Classroom {
  id: string;
  name: string;
  teacherName: string;
  joinCode: string;
  createdAt: string;
}

export interface ClassroomMember {
  classId: string;
  childId: string;
}

// ─── Storage ────────────────────────────────────────────────
const CLASSROOMS_KEY = "quranEasyClassrooms";
const MEMBERS_KEY = "quranEasyClassMembers";

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function generateJoinCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

// ─── Hook ───────────────────────────────────────────────────
export function useClassrooms() {
  const [classrooms, setClassrooms] = useState<Classroom[]>(() => {
    try {
      const s = localStorage.getItem(CLASSROOMS_KEY);
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });

  const [members, setMembers] = useState<ClassroomMember[]>(() => {
    try {
      const s = localStorage.getItem(MEMBERS_KEY);
      return s ? JSON.parse(s) : [];
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(CLASSROOMS_KEY, JSON.stringify(classrooms));
  }, [classrooms]);

  useEffect(() => {
    localStorage.setItem(MEMBERS_KEY, JSON.stringify(members));
  }, [members]);

  const createClassroom = useCallback((name: string, teacherName: string = ""): Classroom => {
    const c: Classroom = {
      id: generateId(),
      name,
      teacherName,
      joinCode: generateJoinCode(),
      createdAt: new Date().toISOString(),
    };
    setClassrooms((prev) => [...prev, c]);
    return c;
  }, []);

  const deleteClassroom = useCallback((id: string) => {
    setClassrooms((prev) => prev.filter((c) => c.id !== id));
    setMembers((prev) => prev.filter((m) => m.classId !== id));
  }, []);

  const addMember = useCallback((classId: string, childId: string) => {
    setMembers((prev) => {
      if (prev.some((m) => m.classId === classId && m.childId === childId)) return prev;
      return [...prev, { classId, childId }];
    });
  }, []);

  const removeMember = useCallback((classId: string, childId: string) => {
    setMembers((prev) => prev.filter((m) => !(m.classId === classId && m.childId === childId)));
  }, []);

  const getMembersForClass = useCallback(
    (classId: string): string[] => members.filter((m) => m.classId === classId).map((m) => m.childId),
    [members]
  );

  const getClassesForChild = useCallback(
    (childId: string): string[] => members.filter((m) => m.childId === childId).map((m) => m.classId),
    [members]
  );

  const shareClassroom = useCallback(async (classroom: Classroom) => {
    const url = `https://iqraacoran.lovable.app/join/${classroom.joinCode}`;
    const text = `Rejoignez ma classe Iqraa "${classroom.name}" avec le code : ${classroom.joinCode}\n${url}`;
    
    if (navigator.share) {
      try {
        await navigator.share({ title: `Classe Iqraa: ${classroom.name}`, text });
        return;
      } catch {}
    }
    // Fallback to WhatsApp
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
  }, []);

  return {
    classrooms,
    members,
    createClassroom,
    deleteClassroom,
    addMember,
    removeMember,
    getMembersForClass,
    getClassesForChild,
    shareClassroom,
  };
}
