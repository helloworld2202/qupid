

export enum Tab {
  Home = 'Home',
  Chat = 'Chat',
  Coaching = 'Coaching',
  My = 'My',
}

export interface Persona {
  id: string;
  name: string;
  age: number;
  gender: 'male' | 'female';
  job: string;
  mbti: string;
  avatar: string;
  intro: string;
  tags: string[];
  match_rate: number;
  system_instruction: string;
  personality_traits: string[];
  interests: { emoji: string; topic: string; description: string; }[];
  conversation_preview: { sender: 'ai'; text: string; }[];
}

export interface AICoach {
  id: string;
  name: string;
  avatar: string;
  specialty: string;
  tagline: string;
  intro: string;
  system_instruction: string;
}

export interface Message {
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp?: number;
}

export interface TutorialStep {
    step: number;
    title: string;
    description: string;
    quickReplies: string[];
    successCriteria: (message: string, context?: Message[]) => boolean;
}

export enum Screen {
  PersonaDetail,
  ConversationPrep,
  Chat,
  ConversationAnalysis,
  CustomPersona,
  StylingCoach,
  ProfileEdit,
  LearningGoals,
  NotificationSettings,
  DataExport,
  DeleteAccount,
  Badges,
  PerformanceDetail,
  Favorites,
  TutorialIntro,
  DesignGuide,
  LOGIN,
  SIGNUP,
}

export type NavigationScreen = Screen | 'HOME' | 'CHAT_TAB' | 'COACHING_TAB' | 'MY_TAB' | 'ONBOARDING' | 'SETTINGS' | 'PERSONA_SELECTION' | 'AUTH_CALLBACK' | string;

export interface UserProfile {
  id?: string;
  created_at?: string;
  name: string;
  user_gender: 'male' | 'female';
  partner_gender?: 'male' | 'female';
  experience: string;
  confidence: number;
  difficulty: number;
  interests: string[];
  isTutorialCompleted?: boolean;
  isGuest?: boolean;
  onboarding_completed?: boolean;
}

export interface ConversationAnalysis {
    totalScore: number;
    feedback: string;
    friendliness: { score: number; feedback: string };
    curiosity: { score: number; feedback: string };
    empathy: { score: number; feedback: string };
    positivePoints: string[];
    pointsToImprove: { topic: string; suggestion: string }[];
}

export interface RealtimeFeedback {
    isGood: boolean;
    message: string;
}

export interface PerformanceData {
  weeklyScore: number;
  scoreChange: number;
  scoreChangePercentage: number;
  dailyScores: number[];
  radarData: {
    labels: string[];
    datasets: {
      label: string;
      data: number[];
      backgroundColor: string;
      borderColor: string;
      borderWidth: number;
    }[];
  };
  stats: {
    totalTime: string;
    sessionCount: number;
    avgTime: string;
    longestSession: { time: string; persona: string; };
    preferredType: string;
  };
  categoryScores: {
    title: string;
    emoji: string;
    score: number;
    change: number;
    goal: number;
  }[];
}


export interface Badge {
  id: string;
  icon: string;
  name: string;
  description: string;
  category: '대화' | '성장' | '특별';
  rarity: 'Common' | 'Rare' | 'Epic';
  acquired: boolean;
  progress?: { current: number; total: number; };
  featured?: boolean;
}