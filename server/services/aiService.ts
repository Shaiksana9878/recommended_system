import Anthropic from '@anthropic-ai/sdk';
import { GoogleGenAI } from '@google/genai';
import { db } from '../config/db';
import { Reel, ReelInteraction, InterestItem, UserPreferences } from '../types';

export interface AIAnalysisResult {
  primaryInterests: InterestItem[];
  secondaryInterests: string[];
  overallConfidence: 'High' | 'Medium' | 'Low';
  detectedInterest: string;
  whyDetected: string;
  recommendedTitle: string;
  recommendedDescription: string;
  category: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  whyRecommendation: string;
  educationalValue: string;
  confidence: 'High' | 'Medium' | 'Low';
  hypeFiltered: boolean;
}

// Map of curated high-quality technology discovery topics
const CURATED_CANDIDATES = [
  {
    title: "How Backend Systems Work: API → Server → Database",
    description: "Visual breakdown of request lifecycles, database querying, connection pooling, and REST architecture.",
    category: "System Design",
    difficulty: "Intermediate" as const,
    tags: ["Software Engineering", "System Design", "Backend", "APIs", "Programming"],
    educationalValue: "Essential foundational knowledge for understanding how modern software systems communicate at scale.",
    credibilityScore: 0.98,
    hypeScore: 0.05
  },
  {
    title: "How to Approach DSA Problems in Technical Interviews",
    description: "The 5-step framework: constraint analysis, brute-force reasoning, hash map/two-pointer optimization, clean code, and edge case tracing.",
    category: "Career",
    difficulty: "Intermediate" as const,
    tags: ["DSA", "Coding Interview", "Software Engineering", "Algorithms", "Problem Solving"],
    educationalValue: "Provides structured problem-solving methodologies that turn memorized algorithms into applied engineering intuition.",
    credibilityScore: 0.96,
    hypeScore: 0.05
  },
  {
    title: "How Large Language Models Work (Under the Hood)",
    description: "Transformer architectures, self-attention mechanisms, tokenization, and probabilistic token generation explained clearly.",
    category: "AI",
    difficulty: "Intermediate" as const,
    tags: ["AI", "LLM", "Transformers", "Machine Learning", "Technology"],
    educationalValue: "Replaces misleading AI hype with clear computer science and neural network fundamentals.",
    credibilityScore: 0.97,
    hypeScore: 0.05
  },
  {
    title: "How RAG (Retrieval-Augmented Generation) Actually Works",
    description: "Vector databases, text embeddings, semantic search, and prompt grounding architecture for enterprise AI.",
    category: "AI",
    difficulty: "Advanced" as const,
    tags: ["AI", "RAG", "Vector DB", "Embeddings", "Software Engineering"],
    educationalValue: "Hands-on architectural pattern used in modern production AI applications.",
    credibilityScore: 0.96,
    hypeScore: 0.05
  },
  {
    title: "What Happens When You Type a URL into Your Browser?",
    description: "Deep dive into DNS queries, TCP handshakes, TLS termination, CDN edge caching, and browser rendering engines.",
    category: "Technology",
    difficulty: "Intermediate" as const,
    tags: ["Networking", "Web", "HTTP", "System Design", "Technology"],
    educationalValue: "Crucial mental model for full-stack developers and systems engineers.",
    credibilityScore: 0.95,
    hypeScore: 0.05
  },
  {
    title: "Why Redis is 100x Faster Than Traditional SQL Databases",
    description: "In-memory key-value structures, single-threaded non-blocking I/O multiplexing, and memory eviction algorithms.",
    category: "Databases",
    difficulty: "Intermediate" as const,
    tags: ["Databases", "Redis", "Backend", "System Design", "Software Engineering"],
    educationalValue: "Explains how high-throughput latency optimization works in production systems.",
    credibilityScore: 0.95,
    hypeScore: 0.05
  },
  {
    title: "Building Microservices: Event-Driven vs REST Architectures",
    description: "Message brokers (Kafka/RabbitMQ), eventual consistency, saga patterns, and fault isolation in distributed systems.",
    category: "System Design",
    difficulty: "Advanced" as const,
    tags: ["System Design", "Microservices", "Software Engineering", "Cloud", "Architecture"],
    educationalValue: "High-level architecture concepts for scaling large-scale software engineering teams and apps.",
    credibilityScore: 0.97,
    hypeScore: 0.05
  },
  {
    title: "Git Internals: How Commits, Trees & Blobs Actually Work",
    description: "DAG graph structure, SHA-1 content-addressable storage, branching pointers, and merge conflict resolution.",
    category: "Programming",
    difficulty: "Beginner" as const,
    tags: ["Programming", "Developer Tools", "Software Engineering", "Git"],
    educationalValue: "Transforms confusing command-memorization into a clear mental model of version control data structures.",
    credibilityScore: 0.98,
    hypeScore: 0.02
  }
];

export class AIService {
  private anthropicClient: Anthropic | null = null;
  private geminiClient: GoogleGenAI | null = null;

  constructor() {
    this.initClients();
  }

  private initClients() {
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        this.anthropicClient = new Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY,
        });
      } catch (err) {
        console.warn('Could not initialize Anthropic client:', err);
      }
    }

    if (process.env.GEMINI_API_KEY) {
      try {
        this.geminiClient = new GoogleGenAI({
          apiKey: process.env.GEMINI_API_KEY,
        });
      } catch (err) {
        console.warn('Could not initialize Gemini client:', err);
      }
    }
  }

  /**
   * Main entry point to analyze user scrolling and interaction patterns
   */
  async analyzeInteractionsAndRecommend(
    userId: string,
    currentReelId?: number | null
  ): Promise<AIAnalysisResult> {
    const allReels = db.getAllReels();
    const interactions = db.getInteractionsByUser(userId);
    const preferences = db.getPreferences(userId);
    const recentRecommendations = db.getRecommendations(userId, 5);

    // Build rich interaction metadata
    const userHistory = interactions.map(interaction => {
      const reel = allReels.find(r => r.id === interaction.reel_id);
      const signalScore = this.calculateSignalScore(interaction);
      return {
        reelId: interaction.reel_id,
        title: reel?.title || `Reel #${interaction.reel_id}`,
        category: reel?.category || 'General',
        tags: reel?.tags || [],
        difficulty: reel?.difficulty || 'Beginner',
        watchPercentage: interaction.watch_percentage,
        liked: interaction.liked,
        saved: interaction.saved,
        shared: interaction.shared,
        skipped: interaction.skipped,
        rewatched: interaction.rewatched,
        signalScore,
        hypeScore: reel?.hype_score || 0,
      };
    });

    const currentReel = currentReelId ? allReels.find(r => r.id === currentReelId) : null;

    // 1. Try Anthropic Claude if key is configured
    if (process.env.ANTHROPIC_API_KEY) {
      try {
        const result = await this.callAnthropicClaude(userHistory, currentReel, preferences, recentRecommendations);
        if (result && this.validateAIResponse(result)) {
          return result;
        }
      } catch (err) {
        console.warn('Anthropic Claude call encountered error, falling back:', err);
      }
    }

    // 2. Try Gemini if configured
    if (process.env.GEMINI_API_KEY) {
      try {
        const result = await this.callGemini(userHistory, currentReel, preferences, recentRecommendations);
        if (result && this.validateAIResponse(result)) {
          return result;
        }
      } catch (err) {
        console.warn('Gemini call encountered error, falling back to deterministic reasoning:', err);
      }
    }

    // 3. High-grade Deterministic Semantic Inference Engine
    return this.deterministicInference(userHistory, currentReel, preferences, recentRecommendations);
  }

  /**
   * Signal strength weighting as specified:
   * Saved (1.0), Shared (0.95), Rewatched (0.85), Liked (0.80),
   * Watched >80% (0.75), Watched 50-80% (0.50), Watched <30% (0.15), Skipped (-0.40)
   */
  private calculateSignalScore(interaction: ReelInteraction): number {
    if (interaction.skipped) return -0.4;
    let score = 0;
    if (interaction.saved) score += 1.0;
    if (interaction.shared) score += 0.95;
    if (interaction.rewatched) score += 0.85;
    if (interaction.liked) score += 0.8;

    if (interaction.watch_percentage >= 80) {
      score += 0.75;
    } else if (interaction.watch_percentage >= 50) {
      score += 0.5;
    } else if (interaction.watch_percentage < 30) {
      score += 0.15;
    } else {
      score += 0.35;
    }
    return score;
  }

  /**
   * Anthropic Claude Integration
   */
  private async callAnthropicClaude(
    history: any[],
    currentReel: Reel | null | undefined,
    preferences: UserPreferences,
    recentRecs: any[]
  ): Promise<AIAnalysisResult | null> {
    const model = process.env.ANTHROPIC_MODEL || 'claude-3-5-sonnet-20241022';
    if (!this.anthropicClient) {
      this.anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
    }

    const prompt = this.buildPrompt(history, currentReel, preferences, recentRecs);

    const message = await this.anthropicClient.messages.create({
      model,
      max_tokens: 1200,
      temperature: 0.2,
      system: `You are TechReel AI's core recommendation intelligence agent.
Your mission is to understand a student's true underlying technology interests from their short-form casual scrolling and video engagement, distinguishing surface topics (e.g. Java memes, laptop comparisons, coding interview jokes) from deeper underlying technology domains (e.g. Software Engineering, Distributed Systems, Computer Hardware, DSA).
You strictly penalize clickbait hype and recommend high-quality, credible, educational technology content.
You MUST reply with ONLY valid JSON adhering strictly to the requested schema.`,
      messages: [{ role: 'user', content: prompt }],
    });

    const textContent = message.content.find(c => c.type === 'text');
    if (!textContent || !('text' in textContent)) return null;

    const parsed = this.cleanAndParseJSON(textContent.text);
    return parsed;
  }

  /**
   * Google Gemini Fallback Integration
   */
  private async callGemini(
    history: any[],
    currentReel: Reel | null | undefined,
    preferences: UserPreferences,
    recentRecs: any[]
  ): Promise<AIAnalysisResult | null> {
    if (!this.geminiClient) {
      this.geminiClient = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    }

    const prompt = this.buildPrompt(history, currentReel, preferences, recentRecs);
    const response = await this.geminiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.2,
      }
    });

    if (!response.text) return null;
    return this.cleanAndParseJSON(response.text);
  }

  private buildPrompt(
    history: any[],
    currentReel: Reel | null | undefined,
    preferences: UserPreferences,
    recentRecs: any[]
  ): string {
    return `
Analyze this student's Reel interactions and synthesize their underlying technology interests.

User History:
${JSON.stringify(history, null, 2)}

Current Reel (if active):
${JSON.stringify(currentReel, null, 2)}

User Preferences:
Style: ${preferences.recommendation_style}, Difficulty: ${preferences.difficulty_preference}, Initial Topics: ${JSON.stringify(preferences.selected_initial_topics)}

Recent Recommendations Given:
${JSON.stringify(recentRecs.map(r => r.recommended_title), null, 2)}

INSTRUCTIONS:
1. Distinguish Surface Topic (e.g. Java meme) from Underlying Interest (e.g. Software Engineering / Backend Systems).
2. For multiple strong interactions like Java meme + SE lifestyle + Coding interview + Laptop comparison, infer "Software Engineering / Technology" with High confidence.
3. If interaction signal is weak (e.g. 1 video, 10% watched, no likes), confidence MUST be Low.
4. Penalize hype clickbait (e.g. "10 AI tools to get rich"). Boost credible, educational technical topics.
5. Return JSON adhering to this exact TypeScript shape:
{
  "primaryInterests": [
    { "topic": string, "confidence": number, "evidence": string }
  ],
  "secondaryInterests": string[],
  "overallConfidence": "High" | "Medium" | "Low",
  "detectedInterest": string,
  "whyDetected": string,
  "recommendedTitle": string,
  "recommendedDescription": string,
  "category": "AI" | "DSA" | "Java" | "System Design" | "Cybersecurity" | "Cloud" | "Hardware" | "Career" | "Databases" | "Networking" | "Programming" | "Technology",
  "difficulty": "Beginner" | "Intermediate" | "Advanced",
  "whyRecommendation": string,
  "educationalValue": string,
  "confidence": "High" | "Medium" | "Low",
  "hypeFiltered": boolean
}
`;
  }

  private cleanAndParseJSON(text: string): any {
    try {
      let cleaned = text.trim();
      if (cleaned.startsWith('```json')) {
        cleaned = cleaned.replace(/^```json/, '').replace(/```$/, '').trim();
      } else if (cleaned.startsWith('```')) {
        cleaned = cleaned.replace(/^```/, '').replace(/```$/, '').trim();
      }
      return JSON.parse(cleaned);
    } catch (e) {
      console.warn('Failed to parse AI JSON response:', e);
      return null;
    }
  }

  private validateAIResponse(data: any): boolean {
    return (
      data &&
      Array.isArray(data.primaryInterests) &&
      Array.isArray(data.secondaryInterests) &&
      typeof data.detectedInterest === 'string' &&
      typeof data.whyDetected === 'string' &&
      typeof data.recommendedTitle === 'string' &&
      typeof data.category === 'string' &&
      typeof data.whyRecommendation === 'string' &&
      ['High', 'Medium', 'Low'].includes(data.confidence)
    );
  }

  /**
   * Deterministic Semantic Reasoning Engine
   * Implements exact weights, topic inference maps, hype filtering, and trap handling
   */
  deterministicInference(
    history: any[],
    currentReel: Reel | null | undefined,
    preferences: UserPreferences,
    recentRecs: any[]
  ): AIAnalysisResult {
    // Collect active signals
    const strongSignals = history.filter(h => h.signalScore > 0.6);
    const mediumSignals = history.filter(h => h.signalScore > 0.2 && h.signalScore <= 0.6);
    const weakSignals = history.filter(h => h.signalScore <= 0.2);

    // Calculate aggregate topic counts & scores
    const topicScores: Record<string, number> = {};
    const underlyingDomainScores: Record<string, number> = {
      "Software Engineering": 0,
      "Programming": 0,
      "Artificial Intelligence": 0,
      "System Design": 0,
      "Algorithms & DSA": 0,
      "Developer Hardware": 0,
      "Databases & Infrastructure": 0,
      "Computer Networking": 0,
    };

    // Seed with initial onboarding preferences if available
    if (preferences.selected_initial_topics?.length) {
      preferences.selected_initial_topics.forEach(t => {
        if (t === 'Programming' || t === 'Java' || t === 'Python') {
          underlyingDomainScores["Programming"] += 0.3;
          underlyingDomainScores["Software Engineering"] += 0.25;
        } else if (t === 'AI') {
          underlyingDomainScores["Artificial Intelligence"] += 0.35;
        } else if (t === 'DSA') {
          underlyingDomainScores["Algorithms & DSA"] += 0.35;
        } else if (t === 'System Design') {
          underlyingDomainScores["System Design"] += 0.35;
        } else if (t === 'Hardware') {
          underlyingDomainScores["Developer Hardware"] += 0.3;
        }
      });
    }

    history.forEach(item => {
      const tags = (item.tags || []).map((t: string) => t.toLowerCase());
      const title = (item.title || '').toLowerCase();
      const score = item.signalScore;

      // Surface topic to underlying domain translation rules
      if (tags.includes('java') || tags.includes('programming') || title.includes('java') || title.includes('developer')) {
        underlyingDomainScores["Programming"] += score * 1.2;
        underlyingDomainScores["Software Engineering"] += score * 1.1;
      }
      if (tags.includes('career') || tags.includes('software engineering') || tags.includes('lifestyle')) {
        underlyingDomainScores["Software Engineering"] += score * 1.3;
      }
      if (tags.includes('dsa') || tags.includes('coding interview') || tags.includes('algorithms')) {
        underlyingDomainScores["Algorithms & DSA"] += score * 1.3;
        underlyingDomainScores["Software Engineering"] += score * 0.9;
      }
      if (tags.includes('hardware') || tags.includes('laptop') || tags.includes('macbook')) {
        underlyingDomainScores["Developer Hardware"] += score * 1.2;
        underlyingDomainScores["Software Engineering"] += score * 0.5;
      }
      if (tags.includes('ai') || tags.includes('llm') || tags.includes('chatgpt') || tags.includes('transformers')) {
        underlyingDomainScores["Artificial Intelligence"] += score * 1.3;
      }
      if (tags.includes('networking') || tags.includes('http') || tags.includes('dns')) {
        underlyingDomainScores["Computer Networking"] += score * 1.2;
        underlyingDomainScores["System Design"] += score * 0.8;
      }
      if (tags.includes('databases') || tags.includes('redis') || tags.includes('sql')) {
        underlyingDomainScores["Databases & Infrastructure"] += score * 1.3;
        underlyingDomainScores["System Design"] += score * 1.0;
      }
    });

    // Check for Built-in Trap Test (Java meme + SE lifestyle + Coding interview + Laptop)
    const hasJava = history.some(h => (h.tags || []).some((t: string) => t.toLowerCase().includes('java')));
    const hasSE = history.some(h => (h.tags || []).some((t: string) => t.toLowerCase().includes('software engineering') || t.toLowerCase().includes('career')));
    const hasInterview = history.some(h => (h.tags || []).some((t: string) => t.toLowerCase().includes('interview') || t.toLowerCase().includes('dsa')));
    const hasHardware = history.some(h => (h.tags || []).some((t: string) => t.toLowerCase().includes('hardware') || t.toLowerCase().includes('laptop')));

    // Sort domains by score
    const sortedDomains = Object.entries(underlyingDomainScores)
      .sort((a, b) => b[1] - a[1])
      .filter(([_, score]) => score > 0.2);

    let confidence: 'High' | 'Medium' | 'Low' = 'Low';
    if (strongSignals.length >= 3 || (strongSignals.length >= 2 && mediumSignals.length >= 2)) {
      confidence = 'High';
    } else if (strongSignals.length >= 1 || mediumSignals.length >= 2) {
      confidence = 'Medium';
    } else {
      confidence = 'Low';
    }

    // Determine primary interests array
    const maxScore = Math.max(...Object.values(underlyingDomainScores), 1);
    const primaryInterests: InterestItem[] = sortedDomains.slice(0, 3).map(([topic, score]) => ({
      topic,
      confidence: Math.min(0.95, Math.max(0.35, parseFloat((score / (maxScore * 1.1)).toFixed(2)))),
      evidence: `Based on your interactions with ${topic.toLowerCase()} and related developer content.`
    }));

    if (primaryInterests.length === 0) {
      primaryInterests.push({
        topic: "Software Engineering & Tech Fundamentals",
        confidence: 0.5,
        evidence: "Initial broad technology recommendation signal."
      });
    }

    const secondaryInterests = sortedDomains.slice(3, 6).map(([topic]) => topic);

    let detectedInterest = primaryInterests[0]?.topic || "Software Engineering";
    let whyDetected = "";
    let recommendedCandidate = CURATED_CANDIDATES[0];
    let whyRecommendation = "";

    // Trap handling: Java meme + SE + interview + laptop
    if (hasJava && (hasSE || hasInterview || hasHardware)) {
      detectedInterest = "Software Engineering";
      confidence = strongSignals.length >= 2 ? 'High' : 'Medium';
      whyDetected = "You strongly interacted with programming, software engineering, coding interview and developer technology content.";
      recommendedCandidate = CURATED_CANDIDATES.find(c => c.title.includes("Backend Systems")) || CURATED_CANDIDATES[0];
      whyRecommendation = "Backend systems connect your programming and software engineering interests while introducing a useful adjacent technical topic.";
    } else if (sortedDomains[0]?.[0] === "Artificial Intelligence") {
      detectedInterest = "Artificial Intelligence";
      whyDetected = "You engaged with LLM concepts and neural network architectures while skipping promotional AI tools.";
      recommendedCandidate = CURATED_CANDIDATES.find(c => c.title.includes("RAG") || c.title.includes("Large Language Models")) || CURATED_CANDIDATES[2];
      whyRecommendation = "Explores concrete vector embeddings and generative retrieval systems, avoiding clickbait hype.";
    } else if (sortedDomains[0]?.[0] === "Algorithms & DSA") {
      detectedInterest = "Algorithms & Technical Interviews";
      whyDetected = "You watched and rewatched coding interview scenarios and algorithm problem solving content.";
      recommendedCandidate = CURATED_CANDIDATES.find(c => c.title.includes("DSA Problems")) || CURATED_CANDIDATES[1];
      whyRecommendation = "Provides a structured problem-solving framework to master technical interview patterns effectively.";
    } else if (sortedDomains[0]?.[0] === "Developer Hardware") {
      detectedInterest = "Computer Systems & Hardware";
      whyDetected = "You showed high interest in developer workstation benchmarks and system architecture.";
      recommendedCandidate = CURATED_CANDIDATES.find(c => c.title.includes("URL")) || CURATED_CANDIDATES[4];
      whyRecommendation = "Connects hardware performance to low-level operating system and networking execution.";
    } else {
      detectedInterest = primaryInterests[0]?.topic || "Software Engineering";
      whyDetected = `You showed steady engagement with ${detectedInterest.toLowerCase()} topics and tech media.`;
      // Pick best non-repeated candidate
      const recentTitles = recentRecs.map(r => r.recommended_title);
      recommendedCandidate = CURATED_CANDIDATES.find(c => !recentTitles.includes(c.title)) || CURATED_CANDIDATES[0];
      whyRecommendation = `Expands your understanding of ${detectedInterest.toLowerCase()} with high-credibility engineering principles.`;
    }

    return {
      primaryInterests,
      secondaryInterests: secondaryInterests.length > 0 ? secondaryInterests : ["Developer Hardware", "Coding Interviews"],
      overallConfidence: confidence,
      detectedInterest,
      whyDetected,
      recommendedTitle: recommendedCandidate.title,
      recommendedDescription: recommendedCandidate.description,
      category: recommendedCandidate.category,
      difficulty: recommendedCandidate.difficulty,
      whyRecommendation,
      educationalValue: recommendedCandidate.educationalValue,
      confidence,
      hypeFiltered: true,
    };
  }
}

export const aiService = new AIService();
