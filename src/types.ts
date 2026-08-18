export interface User {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  bio: string;
  avatar_url: string;
  education_level: string;
  primary_goal: string;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserPreferences {
  id: string;
  user_id: string;
  recommendation_style: 'technical' | 'educational' | 'career' | 'mixed';
  difficulty_preference: 'beginner' | 'intermediate' | 'advanced' | 'adaptive';
  personalization_enabled: boolean;
  selected_initial_topics: string[];
  created_at: string;
  updated_at: string;
}

export interface Reel {
  id: number;
  title: string;
  description: string;
  creator: string;
  category: string;
  tags: string[];
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration_seconds: number;
  thumbnail_url?: string;
  video_url?: string;
  video_type?: string;
  code_snippet?: string;
  code_language?: string;
  key_takeaways?: string[];
  narration_transcript?: string;
  hype_score?: number;
  credibility_score?: number;
  learning_value_score?: number;
  created_at?: string;
  userInteraction?: {
    watch_percentage: number;
    liked: boolean;
    saved: boolean;
    shared: boolean;
    skipped: boolean;
    rewatched: boolean;
  } | null;
  isSaved?: boolean;
  isLiked?: boolean;
}

export interface InterestItem {
  topic: string;
  confidence: number;
  evidence?: string;
}

export interface InterestProfile {
  id: string;
  user_id: string;
  primary_interests: InterestItem[];
  secondary_interests: string[];
  overall_confidence: 'High' | 'Medium' | 'Low';
  raw_analysis_summary: string;
  version: number;
  updated_at: string;
  totalInteractions?: number;
  totalLikes?: number;
  totalSaved?: number;
}

export interface RecommendationFeedback {
  id: string;
  recommendation_id: string;
  user_id: string;
  is_useful: boolean | null;
  feedback_reason?: string;
  comments?: string;
  created_at: string;
}

export interface Recommendation {
  id: string;
  user_id: string;
  current_reel_id?: number | null;
  current_reel_title?: string;
  detected_interest: string;
  why_detected: string;
  recommended_title: string;
  recommended_description?: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  confidence: 'High' | 'Medium' | 'Low';
  why_recommendation: string;
  educational_value: string;
  hype_filtered: boolean;
  created_at: string;
  feedback?: RecommendationFeedback | null;
}
