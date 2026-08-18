export interface User {
  id: string;
  email: string;
  password_hash: string;
  full_name: string;
  role: string;
  created_at: string;
  updated_at: string;
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
  video_type?: 'meme' | 'lifestyle' | 'tutorial' | 'comparison' | 'concept' | 'hype';
  code_snippet?: string;
  code_language?: string;
  key_takeaways?: string[];
  narration_transcript?: string;
  hype_score: number; // 0 to 1 (1 = clickbait hype)
  credibility_score: number; // 0 to 1
  learning_value_score: number; // 0 to 1
  created_at: string;
}

export interface ReelInteraction {
  id: string;
  user_id: string;
  reel_id: number;
  watch_percentage: number;
  liked: boolean;
  saved: boolean;
  shared: boolean;
  skipped: boolean;
  rewatched: boolean;
  created_at: string;
  updated_at: string;
}

export interface InterestItem {
  topic: string;
  confidence: number; // 0.0 to 1.0
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

export interface SavedReel {
  id: string;
  user_id: string;
  reel_id: number;
  created_at: string;
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

export interface SupportFeedback {
  id: string;
  user_id: string;
  feedback_type: 'Bug' | 'Bad Recommendation' | 'Incorrect Interest' | 'Content Problem' | 'General Feedback';
  message: string;
  status: string;
  created_at: string;
}
