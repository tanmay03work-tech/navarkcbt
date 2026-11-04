export type UserRole = 'SUPER_ADMIN' | 'INSTITUTION_ADMIN' | 'TEACHER' | 'STUDENT';

export interface InstitutionBranding {
  institutionName?: string;
  tagline?: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  secondaryColor?: string;
  loginHeading?: string;
  loginSubheading?: string;
  bannerText?: string;
}

export interface InstitutionSettings {
  branding?: InstitutionBranding;
  [key: string]: any;
}

export interface Institution {
  id: string;
  name: string;
  code: string; // e.g. "APEX", "ZENITH"
  slug: string;
  logoUrl?: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED';
  settings?: InstitutionSettings;
  totalStudents: number;
  totalTeachers: number;
  totalExams: number;
  createdAt: string;
}

export interface InstitutionRequest {
  id: string;
  institutionName: string;
  proposedCode: string;
  contactPerson: string;
  email: string;
  phone: string;
  address: string;
  studentEstimate: number;
  notes?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  requestedAt: string;
  reviewedAt?: string;
  internalNotes?: string;
}

export interface User {
  id: string;
  userId: string; // Institution-scoped, e.g. "STU001", "TCH101", "ADMIN"
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  institutionId?: string;
  institutionCode?: string;
  institutionName?: string;
  batchId?: string;
  batchName?: string;
  status: 'ACTIVE' | 'INACTIVE';
  avatarUrl?: string;
  specialization?: string[];
  lastLoginAt?: string;
  createdAt: string;
}

export interface Batch {
  id: string;
  institutionId: string;
  name: string; // e.g. "Class 12 - Batch Alpha", "JEE Advanced 2026"
  code: string; // e.g. "JEE-A-26"
  courseName: string; // e.g. "Senior Secondary Physics & Chemistry"
  academicYear: string;
  studentCount: number;
  assignedTeacherIds: string[];
  status: 'ACTIVE' | 'ARCHIVED';
  createdAt: string;
}

export interface Subject {
  id: string;
  institutionId: string;
  name: string; // e.g. "Physics", "Mathematics", "Organic Chemistry"
  code: string; // e.g. "PHY-101"
  description: string;
  topicCount: number;
  questionCount: number;
  status: 'ACTIVE' | 'ARCHIVED';
}

export interface QuestionSet {
  id: string;
  institutionId: string;
  title: string;
  subjectId?: string;
  subjectName?: string;
  status: 'ACTIVE' | 'ARCHIVED';
  questionCount: number;
  createdAt: string;
}

export type QuestionType = 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'NUMERICAL' | 'TRUE_FALSE';
export type DifficultyLevel = 'EASY' | 'MEDIUM' | 'HARD';

export interface QuestionOption {
  id: string;
  text: string;
  isCorrect?: boolean;
}

export interface Question {
  id: string;
  institutionId: string;
  questionBankId?: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  type: QuestionType;
  difficulty: DifficultyLevel;
  text: string;
  imageUrl?: string;
  options: QuestionOption[];
  correctAnswerText?: string; // For numerical questions
  explanation: string;
  positiveMarks: number;
  negativeMarks: number;
  authorId: string;
  authorName: string;
  status: 'PUBLISHED' | 'DRAFT';
  usageCount: number;
  createdAt: string;
}

export type ExamStatus = 'DRAFT' | 'SCHEDULED' | 'LIVE' | 'COMPLETED' | 'ARCHIVED';

export interface Exam {
  id: string;
  institutionId: string;
  title: string;
  code: string;
  description: string;
  subjectId: string;
  subjectName: string;
  assignedBatchIds: string[];
  assignedBatchNames: string[];
  status: ExamStatus;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  totalMarks: number;
  passMarks: number;
  questionCount: number;
  questionIds: string[];
  negativeMarking: boolean;
  shuffleQuestions: boolean;
  showResultsImmediately: boolean;
  instructions: string[];
  createdBy: string;
  authorName: string;
  totalRegisteredStudents: number;
  totalSubmissions: number;
  averageScore?: number;
  highestScore?: number;
  createdAt: string;
}

export type QuestionPaletteStatus = 
  | 'NOT_VISITED'
  | 'VISITED'
  | 'ANSWERED'
  | 'MARKED_FOR_REVIEW'
  | 'ANSWERED_AND_MARKED';

export interface StudentAnswer {
  questionId: string;
  selectedOptionIds: string[]; // For single or multi choice
  textResponse?: string; // For numerical
  paletteStatus: QuestionPaletteStatus;
  timeSpentSeconds: number;
}

export interface ExamAttempt {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  studentUserId: string;
  studentName: string;
  batchId: string;
  batchName: string;
  institutionId: string;
  startedAt: string;
  submittedAt?: string;
  timeSpentMinutes: number;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'AUTO_SUBMITTED' | 'DISQUALIFIED';
  answers: Record<string, StudentAnswer>;
  score?: number;
  totalMarks: number;
  percentage?: number;
  rank?: number;
  isPassed?: boolean;
}

export interface ExamResult {
  id: string;
  examId: string;
  examTitle: string;
  examCode: string;
  studentId: string;
  studentUserId: string;
  studentName: string;
  batchId: string;
  batchName: string;
  institutionId: string;
  submittedAt: string;
  score: number;
  totalMarks: number;
  percentage: number;
  isPassed: boolean;
  rank: number;
  totalParticipants: number;
  correctAnswersCount: number;
  incorrectAnswersCount: number;
  unattemptedCount: number;
  timeTakenMinutes: number;
  accuracy: number;
  subjectBreakdown: {
    subjectName: string;
    score: number;
    totalMarks: number;
    percentage: number;
  }[];
}

export interface StudyMaterial {
  id: string;
  institutionId: string;
  title: string;
  subjectId: string;
  subjectName: string;
  topic: string;
  assignedBatchIds: string[];
  assignedBatchNames: string[];
  fileType: 'PDF' | 'DOC' | 'ZIP' | 'NOTES';
  fileSize: string;
  downloadUrl?: string;
  authorName: string;
  uploadedAt: string;
}

export interface Announcement {
  id: string;
  institutionId: string;
  title: string;
  content: string;
  targetAudience: 'ALL' | 'STUDENTS' | 'TEACHERS' | 'BATCH';
  batchId?: string;
  batchName?: string;
  authorName: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  publishedAt: string;
}

export interface AppNotification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'EXAM_REMINDER' | 'RESULT_PUBLISHED' | 'ANNOUNCEMENT' | 'SYSTEM';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

