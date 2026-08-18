import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  User,
  UserProfile,
  Reel,
  ReelInteraction,
  InterestProfile,
  Recommendation,
  RecommendationFeedback,
  SavedReel,
  UserPreferences,
  SupportFeedback,
} from '../types';

interface DatabaseData {
  users: User[];
  user_profiles: UserProfile[];
  reels: Reel[];
  reel_interactions: ReelInteraction[];
  interest_profiles: InterestProfile[];
  recommendations: Recommendation[];
  recommendation_feedback: RecommendationFeedback[];
  saved_reels: SavedReel[];
  user_preferences: UserPreferences[];
  support_feedback: SupportFeedback[];
}

const DATA_DIR = path.join(process.cwd(), '.data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

const INITIAL_REELS: Reel[] = [
  {
    id: 1,
    title: "Every Java Developer Has Experienced This 😂",
    description: "A programmer spends 6 hours debugging a NullPointerException only to find a missing annotation.",
    creator: "CodeComedy",
    category: "Programming",
    tags: ["Java", "Programming", "Developer", "Meme", "Debugging"],
    difficulty: "Beginner",
    duration_seconds: 42,
    thumbnail_url: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&auto=format&fit=crop&q=80",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    video_type: "meme",
    code_language: "java",
    code_snippet: `@RestController
@RequestMapping("/api/orders")
public class OrderController {
    // Missing @Autowired or constructor injection caused NullPointerException!
    @Autowired
    private OrderService orderService;

    @PostMapping("/checkout")
    public ResponseEntity<Order> processOrder(@RequestBody OrderRequest req) {
        if (req == null || req.getItems().isEmpty()) {
            throw new IllegalArgumentException("Cart cannot be empty");
        }
        return ResponseEntity.ok(orderService.createOrder(req));
    }
}`,
    key_takeaways: [
      "Spring Boot field injection can fail silently at test time; prefer constructor-based Dependency Injection.",
      "Always check for NullPointerExceptions before accessing nested collections in DTOs.",
      "Use Optional<T> and @NotNull annotations for defensive programming."
    ],
    narration_transcript: "POV: You have spent 6 straight hours debugging a mysterious NullPointerException in production, checking logs, database connections, and cache layers, only to realize you forgot the @Autowired annotation on line 6.",
    hype_score: 0.1,
    credibility_score: 0.85,
    learning_value_score: 0.6,
    created_at: "2026-01-10T10:00:00Z"
  },
  {
    id: 2,
    title: "A Day in the Life of a Software Engineer",
    description: "Morning standup, writing scalable microservices, code reviews, debugging pipelines and deploying to prod.",
    creator: "Alex Tech",
    category: "Career",
    tags: ["Software Engineering", "Career", "Day in the Life", "Lifestyle"],
    difficulty: "Beginner",
    duration_seconds: 58,
    thumbnail_url: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
    video_type: "lifestyle",
    code_language: "typescript",
    code_snippet: `// Real engineering workflow: CI/CD Health Pipeline Check
interface DeploymentPipeline {
  branch: 'main';
  testsPassed: boolean;
  canaryCoverage: number; // target >= 99.9%
}

async function verifyRelease(pipeline: DeploymentPipeline) {
  console.log("🚀 Verifying zero-downtime blue/green deployment...");
  if (!pipeline.testsPassed || pipeline.canaryCoverage < 99.9) {
    throw new Error("Canary metrics degraded. Rolling back container automatically.");
  }
  return { status: "HEALTHY", trafficRouted: "100%" };
}`,
    key_takeaways: [
      "Modern SWE is 40% writing code and 60% system communication, architecture reviews, and observability.",
      "Automated canary deployments ensure regressions never affect 100% of live users.",
      "Effective asynchronous code reviews speed up team velocity significantly."
    ],
    narration_transcript: "9:00 AM: Coffee & quick asynchronous standup. 10:00 AM: Profiling memory leak on the payment gateway. 1:00 PM: Code reviews for junior teammates. 3:00 PM: Deploying canary containers with zero downtime.",
    hype_score: 0.2,
    credibility_score: 0.9,
    learning_value_score: 0.7,
    created_at: "2026-01-11T12:00:00Z"
  },
  {
    id: 3,
    title: "Every Coding Interview Ever 😂",
    description: "Interviewer asks to invert a binary tree on a whiteboard in 5 minutes while interviewer looks unimpressed.",
    creator: "AlgoHumor",
    category: "Career",
    tags: ["DSA", "Coding Interview", "Algorithms", "Career", "Humor"],
    difficulty: "Intermediate",
    duration_seconds: 45,
    thumbnail_url: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=600&auto=format&fit=crop&q=80",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    video_type: "meme",
    code_language: "python",
    code_snippet: `class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# Inverting a Binary Tree (LeetCode 226)
def invertTree(root: TreeNode) -> TreeNode:
    if not root:
        return None
    # Swap children recursively
    root.left, root.right = invertTree(root.right), invertTree(root.left)
    return root`,
    key_takeaways: [
      "Tree problems almost always have elegant recursive solutions based on DFS or BFS.",
      "Time Complexity: O(N) where N is the number of nodes because we visit each node exactly once.",
      "Space Complexity: O(H) where H is tree height for the recursion call stack."
    ],
    narration_transcript: "Candidate: 'I have 10 years of experience designing distributed Cassandra clusters handling 500k queries per second.' Interviewer: 'That is great, now invert this binary tree on this whiteboard without using any IDE.'",
    hype_score: 0.15,
    credibility_score: 0.88,
    learning_value_score: 0.65,
    created_at: "2026-01-12T14:30:00Z"
  },
  {
    id: 4,
    title: "MacBook Pro M3 vs ThinkPad for Developers: Real Benchmarks",
    description: "Compilation times, Docker container memory overhead, battery life, and keyboard feel for software devs.",
    creator: "HardwareDev",
    category: "Hardware",
    tags: ["Hardware", "Laptop", "Developer Hardware", "MacBook", "Benchmarking"],
    difficulty: "Beginner",
    duration_seconds: 60,
    thumbnail_url: "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?w=600&auto=format&fit=crop&q=80",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyBlazes.mp4",
    video_type: "comparison",
    code_language: "bash",
    code_snippet: `# Benchmark: Rust & TypeScript monorepo compile times
# MacBook Pro M3 Max (16-Core, 36GB Unified Memory):
$ time cargo build --release
real    0m38.42s
user    4m12.18s
sys     0m08.92s

# ThinkPad X1 Carbon Gen 11 (Intel Core i7-1370P, 32GB RAM):
$ time cargo build --release
real    1m14.88s
user    5m48.33s
sys     0m18.40s`,
    key_takeaways: [
      "Apple Silicon unified memory architecture offers superior throughput for local LLMs and compilation workloads.",
      "ThinkPad remains superior for native Linux kernel debugging and hardware modularity/repairs.",
      "Battery life under high Docker loads: M3 Max lasts 9+ hours vs 3.5 hours on x86 Intel."
    ],
    narration_transcript: "We tested Rust compilation, 12 simultaneous Docker microservices, and local Ollama inference across 40 hours of heavy programming. Here are the exact thermals, watts consumed, and compilation speeds.",
    hype_score: 0.1,
    credibility_score: 0.95,
    learning_value_score: 0.8,
    created_at: "2026-01-13T09:15:00Z"
  },
  {
    id: 5,
    title: "The Most Insane Gaming Moment in Esports History 😂",
    description: "Clutch 1v5 defusal round with hilarious caster voice reactions and crazy gameplay.",
    creator: "EsportsClips",
    category: "Gaming",
    tags: ["Gaming", "Entertainment", "Clips", "Esports"],
    difficulty: "Beginner",
    duration_seconds: 35,
    thumbnail_url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=600&auto=format&fit=crop&q=80",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
    video_type: "meme",
    code_language: "json",
    code_snippet: `{
  "clip_type": "esports_highlight",
  "game": "Tactical FPS",
  "round": "15-14 Tournament Final",
  "situation": "1v5 Clutch Defusal",
  "reaction_time_ms": 142,
  "hype_factor": "Maximum"
}`,
    key_takeaways: [
      "Entertainment clips generate quick engagement but weak technical signals.",
      "TechReel AI recognizes this as gaming leisure rather than software engineering skill development.",
      "Signals from this category do not skew algorithms towards superficial gaming recommendations."
    ],
    narration_transcript: "Down 1 to 5 with 12 seconds on the clock, no flashbangs left, and the casters are already declaring the match over. Watch this unbelievable crosshair snap!",
    hype_score: 0.3,
    credibility_score: 0.7,
    learning_value_score: 0.1,
    created_at: "2026-01-14T18:00:00Z"
  },
  {
    id: 6,
    title: "How ChatGPT Actually Works (Under the Hood)",
    description: "Tokens, Transformers, Attention Mechanism, and Next-Token Prediction explained clearly in 60 seconds without math buzzwords.",
    creator: "AIExplained",
    category: "AI",
    tags: ["AI", "LLM", "Machine Learning", "Transformers", "Neural Networks"],
    difficulty: "Intermediate",
    duration_seconds: 59,
    thumbnail_url: "https://images.unsplash.com/photo-1677442136019-21780efad99a?w=600&auto=format&fit=crop&q=80",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    video_type: "concept",
    code_language: "python",
    code_snippet: `import torch
import torch.nn.functional as F

# Self-Attention Formula: Attention(Q, K, V) = softmax(Q * K^T / sqrt(d_k)) * V
def scaled_dot_product_attention(Q, K, V, mask=None):
    d_k = Q.size(-1)
    scores = torch.matmul(Q, K.transpose(-2, -1)) / (d_k ** 0.5)
    
    if mask is not None:
        scores = scores.masked_fill(mask == 0, -1e9)
        
    weights = F.softmax(scores, dim=-1)
    return torch.matmul(weights, V), weights`,
    key_takeaways: [
      "Transformers process tokens in parallel using Self-Attention matrices (Queries, Keys, Values).",
      "Next-token prediction assigns probability distributions across a fixed vocabulary (e.g. 100k tokens).",
      "Temperature controls the randomness of softmax sampling when selecting output tokens."
    ],
    narration_transcript: "Every sentence you type gets chunked into numerical tokens, projected into high-dimensional vector space, and compared across all other tokens through self-attention matrix multiplication.",
    hype_score: 0.05,
    credibility_score: 0.98,
    learning_value_score: 0.95,
    created_at: "2026-01-15T11:20:00Z"
  },
  {
    id: 7,
    title: "10 AI Tools That Will Get You a Job & Make You Rich! 🚀",
    description: "Sensationalized claims about secret AI tools that promise to replace college and make you $10,000/month overnight.",
    creator: "HypeGuru",
    category: "AI",
    tags: ["AI", "Career", "Hype", "Tools", "Clickbait"],
    difficulty: "Beginner",
    duration_seconds: 50,
    thumbnail_url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=80",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
    video_type: "hype",
    code_language: "text",
    code_snippet: `⚠️ HYPE DETECTION AUDIT:
- Claim: "Earn $10,000 in your sleep with this 1 prompt"
- Quality Score: 0.15 (Filtered Out)
- Credibility Penalty: -0.80
- Verdict: Flagged as Clickbait Hype Loop. Filtered from smart recommendations.`,
    key_takeaways: [
      "TechReel AI specifically filters out clickbait and hype farming to protect your learning roadmap.",
      "Real software engineering value comes from fundamental concepts (data structures, networking, architecture).",
      "High watch time on hype reels is dampened to prevent toxic recommendation spirals."
    ],
    narration_transcript: "Stop going to university! These 10 secret automated AI tools will make you rich and guarantee you a FAANG job with zero coding knowledge! (Flagged as Clickbait by TechReel AI Engine).",
    hype_score: 0.95,
    credibility_score: 0.2,
    learning_value_score: 0.15,
    created_at: "2026-01-16T16:45:00Z"
  },
  {
    id: 8,
    title: "What Happens When You Type a URL into Your Browser?",
    description: "DNS resolution, TCP 3-way handshake, TLS negotiation, HTTP request routing, and DOM rendering flow.",
    creator: "ByteByteGo Style",
    category: "Technology",
    tags: ["Networking", "HTTP", "Web", "System Design", "DNS"],
    difficulty: "Intermediate",
    duration_seconds: 55,
    thumbnail_url: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
    video_type: "concept",
    code_language: "text",
    code_snippet: `Step 1: Browser Cache → OS Cache → DNS Resolver (Recursive lookup)
Step 2: TCP 3-Way Handshake (SYN → SYN-ACK → ACK)
Step 3: TLS 1.3 Handshake (Diffie-Hellman Key Exchange + Certificate verify)
Step 4: HTTP/2 or HTTP/3 GET Request sent over encrypted tunnel
Step 5: CDN / Reverse Proxy routes to Application Server
Step 6: HTML Stream received → DOM Tree + CSSOM Tree → Render Tree → Layout → Paint`,
    key_takeaways: [
      "DNS hierarchy: Root Server (.) → Top-Level Domain (.com) → Authoritative Name Server.",
      "TLS 1.3 reduces the handshake overhead to just 1 Round Trip Time (1-RTT).",
      "Critical Rendering Path involves building the DOM and CSSOM before compositing pixels on screen."
    ],
    narration_transcript: "In under 200 milliseconds: Your browser checks local DNS cache, resolves the IP address, completes a TCP handshake and TLS 1.3 exchange, downloads the initial HTML payload, and executes the render tree layout.",
    hype_score: 0.05,
    credibility_score: 0.96,
    learning_value_score: 0.94,
    created_at: "2026-01-17T08:30:00Z"
  },
  {
    id: 9,
    title: "How Backend Systems Work: API → Server → Database",
    description: "A clear visual architectural breakdown of how requests travel through load balancers, caching layers, application servers, and SQL databases.",
    creator: "SystemArchitect",
    category: "System Design",
    tags: ["System Design", "Backend", "Databases", "APIs", "Software Engineering"],
    difficulty: "Intermediate",
    duration_seconds: 59,
    thumbnail_url: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=80",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4",
    video_type: "concept",
    code_language: "sql",
    code_snippet: `-- Scalable Layered Query Pattern:
-- 1. Read from Redis Cache first: GET user:1001
-- 2. On Cache Miss: Query indexed PostgreSQL replica
SELECT u.id, u.email, u.full_name, p.primary_goal
FROM users u
INNER JOIN user_profiles p ON u.id = p.user_id
WHERE u.id = 'usr_988273'
LIMIT 1;
-- 3. Populate Redis with TTL: SETEX user:1001 3600 <JSON_PAYLOAD>`,
    key_takeaways: [
      "Load Balancers (e.g., NGINX, ALB) distribute traffic using round-robin or least-connections algorithms.",
      "Cache-Aside pattern prevents database saturation during high-traffic spikes.",
      "Database replication with read-replicas decouples heavy read queries from transactional writes."
    ],
    narration_transcript: "When a user clicks submit: The request hits an edge load balancer, routes to stateless API servers, checks an in-memory Redis cache, and queries a sharded PostgreSQL cluster with connection pooling.",
    hype_score: 0.05,
    credibility_score: 0.97,
    learning_value_score: 0.96,
    created_at: "2026-01-18T13:00:00Z"
  },
  {
    id: 10,
    title: "How to Approach DSA Problems in Technical Interviews",
    description: "The 5-step framework top candidates use: Clarify constraints, talk through brute force, optimize with hash maps / two-pointers, write clean code, and dry run edge cases.",
    creator: "InterviewPro",
    category: "Career",
    tags: ["DSA", "Coding Interview", "Algorithms", "Career", "Problem Solving"],
    difficulty: "Intermediate",
    duration_seconds: 56,
    thumbnail_url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    video_type: "tutorial",
    code_language: "python",
    code_snippet: `# The 5-Step Interview Strategy: Two Sum (Hash Map O(N))
def twoSum(nums: list[int], target: int) -> list[int]:
    lookup = {} # val -> index
    for i, num in enumerate(nums):
        complement = target - num
        if complement in lookup:
            return [lookup[complement], i]
        lookup[num] = i
    return []

# Step 1: Clarify (Negative numbers? Guaranteed solution?)
# Step 2: Brute Force (O(N^2) nested loop)
# Step 3: Optimize to O(N) using Hash Map lookup`,
    key_takeaways: [
      "Never start coding immediately. Spend 2-3 minutes clarifying constraints and edge cases.",
      "State the brute-force complexity first to demonstrate foundational understanding before jumping to optimal algorithms.",
      "Dry-run your solution with an empty list and duplicate elements to catch edge bugs."
    ],
    narration_transcript: "Step 1: Clarify assumptions. Step 2: Speak your brute force thoughts out loud. Step 3: Optimize using standard patterns like Two Pointers, Sliding Window, or Hash Maps. Step 4: Write clean, idiomatic code. Step 5: Test edge cases.",
    hype_score: 0.1,
    credibility_score: 0.94,
    learning_value_score: 0.92,
    created_at: "2026-01-19T15:20:00Z"
  },
  {
    id: 11,
    title: "How RAG (Retrieval-Augmented Generation) Actually Works",
    description: "Vector embeddings, cosine similarity search, chunking documents, and injecting relevant context into LLM prompts.",
    creator: "AIExplained",
    category: "AI",
    tags: ["AI", "RAG", "LLM", "Vector DB", "Embeddings"],
    difficulty: "Advanced",
    duration_seconds: 60,
    thumbnail_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
    video_type: "concept",
    code_language: "python",
    code_snippet: `# Retrieval Augmented Generation Pipeline
def rag_generate(user_query: str, vector_store, llm_client) -> str:
    # 1. Embed query into vector embedding
    query_vector = embed_model.get_embedding(user_query)
    
    # 2. Similarity search in Pinecone / ChromaDB
    relevant_chunks = vector_store.similarity_search(query_vector, top_k=3)
    context_text = "\\n\\n".join([chunk.text for chunk in relevant_chunks])
    
    # 3. Augment Prompt with Ground Truth Context
    prompt = f"Context:\\n{context_text}\\n\\nQuestion: {user_query}\\nAnswer:"
    return llm_client.generate(prompt)`,
    key_takeaways: [
      "RAG eliminates LLM hallucinations by grounding responses in private corporate documents or databases.",
      "Document chunking strategies (e.g. 500-token chunks with 50-token overlap) strongly influence retrieval accuracy.",
      "Cosine distance calculates how semantically similar a user's question is to indexed paragraphs."
    ],
    narration_transcript: "Instead of fine-tuning expensive models, RAG converts your documents into mathematical vectors, retrieves the top 3 most relevant paragraphs using cosine similarity, and feeds them into the LLM context window.",
    hype_score: 0.05,
    credibility_score: 0.97,
    learning_value_score: 0.95,
    created_at: "2026-01-20T10:00:00Z"
  },
  {
    id: 12,
    title: "Why Redis is 100x Faster Than Traditional SQL Databases",
    description: "In-memory data structures, single-threaded event loop architecture, I/O multiplexing, and persistent snapshots.",
    creator: "BackendMastery",
    category: "Databases",
    tags: ["Databases", "Redis", "Backend", "Caching", "System Design"],
    difficulty: "Intermediate",
    duration_seconds: 52,
    thumbnail_url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=600&auto=format&fit=crop&q=80",
    video_url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackSeeTheWorld.mp4",
    video_type: "concept",
    code_language: "bash",
    code_snippet: `# Redis CLI In-Memory Operations (Sub-millisecond latency):
127.0.0.1:6379> SET user:token:9988 "jwt_active_session_abc123" EX 3600
OK (0.12ms)

# Atomic Increment for Rate Limiting
127.0.0.1:6379> INCR api:rate_limit:client_ip:192.168.1.1
(integer) 1

# Sorted Sets for Real-time Leaderboards
127.0.0.1:6379> ZADD leaderboard 2400 "sana_dev"
(integer) 1`,
    key_takeaways: [
      "Redis holds all data directly in RAM, bypassing slow disk I/O seek times entirely.",
      "The single-threaded event loop avoids expensive thread context switching and lock contention.",
      "I/O multiplexing (epoll/kqueue) allows a single Redis instance to handle tens of thousands of concurrent connections."
    ],
    narration_transcript: "Why does Redis return queries in 0.2 milliseconds while MySQL takes 20 milliseconds? Because RAM throughput is 100 gigabytes per second, and Redis executes operations on a non-blocking single-threaded event loop.",
    hype_score: 0.08,
    credibility_score: 0.95,
    learning_value_score: 0.93,
    created_at: "2026-01-21T11:40:00Z"
  }
];

class Database {
  private data: DatabaseData;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadData();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseData {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseData;
        
        // Ensure all tables exist and merge any rich reel fields
        const mergedReels = (parsed.reels && parsed.reels.length > 0 ? parsed.reels : INITIAL_REELS).map(reel => {
          const init = INITIAL_REELS.find(r => r.id === reel.id);
          return init ? { ...init, ...reel, video_url: init.video_url || reel.video_url, code_snippet: init.code_snippet || reel.code_snippet, key_takeaways: init.key_takeaways || reel.key_takeaways, narration_transcript: init.narration_transcript || reel.narration_transcript } : reel;
        });

        return {
          users: parsed.users || [],
          user_profiles: parsed.user_profiles || [],
          reels: mergedReels,
          reel_interactions: parsed.reel_interactions || [],
          interest_profiles: parsed.interest_profiles || [],
          recommendations: parsed.recommendations || [],
          recommendation_feedback: parsed.recommendation_feedback || [],
          saved_reels: parsed.saved_reels || [],
          user_preferences: parsed.user_preferences || [],
          support_feedback: parsed.support_feedback || [],
        };
      }
    } catch (err) {
      console.error('Error reading database file, initializing fresh:', err);
    }

    const defaultData: DatabaseData = {
      users: [],
      user_profiles: [],
      reels: INITIAL_REELS,
      reel_interactions: [],
      interest_profiles: [],
      recommendations: [],
      recommendation_feedback: [],
      saved_reels: [],
      user_preferences: [],
      support_feedback: [],
    };
    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(data: DatabaseData) {
    try {
      this.ensureDirectory();
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (err) {
      console.error('Failed to write database file:', err);
    }
  }

  private persist() {
    this.saveData(this.data);
  }

  // --- USERS ---
  findUserByEmail(email: string): User | undefined {
    return this.data.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  }

  findUserById(id: string): User | undefined {
    return this.data.users.find(u => u.id === id);
  }

  createUser(user: Omit<User, 'id' | 'created_at' | 'updated_at'>): User {
    const now = new Date().toISOString();
    const newUser: User = {
      id: crypto.randomUUID(),
      ...user,
      created_at: now,
      updated_at: now,
    };
    this.data.users.push(newUser);

    // Initialize default profile
    const profile: UserProfile = {
      id: crypto.randomUUID(),
      user_id: newUser.id,
      bio: "Tech enthusiast & student",
      avatar_url: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(newUser.full_name)}`,
      education_level: "Undergraduate",
      primary_goal: "Explore Tech & Career Growth",
      onboarding_completed: false,
      created_at: now,
      updated_at: now,
    };
    this.data.user_profiles.push(profile);

    // Initialize default preferences
    const prefs: UserPreferences = {
      id: crypto.randomUUID(),
      user_id: newUser.id,
      recommendation_style: 'mixed',
      difficulty_preference: 'adaptive',
      personalization_enabled: true,
      selected_initial_topics: [],
      created_at: now,
      updated_at: now,
    };
    this.data.user_preferences.push(prefs);

    // Initialize empty interest profile
    const interest: InterestProfile = {
      id: crypto.randomUUID(),
      user_id: newUser.id,
      primary_interests: [],
      secondary_interests: [],
      overall_confidence: 'Low',
      raw_analysis_summary: "No interactions recorded yet. Start watching and exploring reels to train your personalized AI model.",
      version: 1,
      updated_at: now,
    };
    this.data.interest_profiles.push(interest);

    this.persist();
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | undefined {
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) return undefined;
    this.data.users[index] = {
      ...this.data.users[index],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    this.persist();
    return this.data.users[index];
  }

  deleteUser(id: string): boolean {
    const initialUsersCount = this.data.users.length;
    this.data.users = this.data.users.filter(u => u.id !== id);
    if (this.data.users.length === initialUsersCount) return false;

    // Cascade delete across all tables
    this.data.user_profiles = this.data.user_profiles.filter(p => p.user_id !== id);
    this.data.reel_interactions = this.data.reel_interactions.filter(i => i.user_id !== id);
    this.data.interest_profiles = this.data.interest_profiles.filter(p => p.user_id !== id);
    this.data.recommendations = this.data.recommendations.filter(r => r.user_id !== id);
    this.data.recommendation_feedback = this.data.recommendation_feedback.filter(f => f.user_id !== id);
    this.data.saved_reels = this.data.saved_reels.filter(s => s.user_id !== id);
    this.data.user_preferences = this.data.user_preferences.filter(p => p.user_id !== id);
    this.data.support_feedback = this.data.support_feedback.filter(f => f.user_id !== id);

    this.persist();
    return true;
  }

  // --- USER PROFILE ---
  getProfile(userId: string): UserProfile | undefined {
    return this.data.user_profiles.find(p => p.user_id === userId);
  }

  updateProfile(userId: string, updates: Partial<UserProfile>): UserProfile {
    let profile = this.data.user_profiles.find(p => p.user_id === userId);
    const now = new Date().toISOString();
    if (!profile) {
      profile = {
        id: crypto.randomUUID(),
        user_id: userId,
        bio: "",
        avatar_url: "",
        education_level: "Undergraduate",
        primary_goal: "Explore Tech",
        onboarding_completed: false,
        created_at: now,
        updated_at: now,
        ...updates,
      };
      this.data.user_profiles.push(profile);
    } else {
      Object.assign(profile, updates, { updated_at: now });
    }
    this.persist();
    return profile;
  }

  // --- USER PREFERENCES ---
  getPreferences(userId: string): UserPreferences {
    let prefs = this.data.user_preferences.find(p => p.user_id === userId);
    if (!prefs) {
      const now = new Date().toISOString();
      prefs = {
        id: crypto.randomUUID(),
        user_id: userId,
        recommendation_style: 'mixed',
        difficulty_preference: 'adaptive',
        personalization_enabled: true,
        selected_initial_topics: [],
        created_at: now,
        updated_at: now,
      };
      this.data.user_preferences.push(prefs);
      this.persist();
    }
    return prefs;
  }

  updatePreferences(userId: string, updates: Partial<UserPreferences>): UserPreferences {
    const prefs = this.getPreferences(userId);
    Object.assign(prefs, updates, { updated_at: new Date().toISOString() });
    this.persist();
    return prefs;
  }

  // --- REELS ---
  getAllReels(): Reel[] {
    return this.data.reels;
  }

  getReelById(id: number): Reel | undefined {
    return this.data.reels.find(r => r.id === id);
  }

  // --- REEL INTERACTIONS ---
  getInteractionsByUser(userId: string): ReelInteraction[] {
    return this.data.reel_interactions.filter(i => i.user_id === userId);
  }

  getInteraction(userId: string, reelId: number): ReelInteraction | undefined {
    return this.data.reel_interactions.find(i => i.user_id === userId && i.reel_id === reelId);
  }

  recordInteraction(
    userId: string,
    reelId: number,
    interactionData: Partial<ReelInteraction>
  ): ReelInteraction {
    const now = new Date().toISOString();
    let interaction = this.data.reel_interactions.find(
      i => i.user_id === userId && i.reel_id === reelId
    );

    if (!interaction) {
      interaction = {
        id: crypto.randomUUID(),
        user_id: userId,
        reel_id: reelId,
        watch_percentage: interactionData.watch_percentage ?? 0,
        liked: !!interactionData.liked,
        saved: !!interactionData.saved,
        shared: !!interactionData.shared,
        skipped: !!interactionData.skipped,
        rewatched: !!interactionData.rewatched,
        created_at: now,
        updated_at: now,
      };
      this.data.reel_interactions.push(interaction);
    } else {
      interaction.watch_percentage = Math.max(interaction.watch_percentage, interactionData.watch_percentage ?? interaction.watch_percentage);
      if (interactionData.liked !== undefined) interaction.liked = interactionData.liked;
      if (interactionData.saved !== undefined) interaction.saved = interactionData.saved;
      if (interactionData.shared !== undefined) interaction.shared = interactionData.shared;
      if (interactionData.skipped !== undefined) interaction.skipped = interactionData.skipped;
      if (interactionData.rewatched !== undefined) interaction.rewatched = interactionData.rewatched;
      interaction.updated_at = now;
    }

    // Keep saved_reels table in sync
    if (interaction.saved) {
      this.saveReel(userId, reelId);
    } else if (interactionData.saved === false) {
      this.unsaveReel(userId, reelId);
    }

    this.persist();
    return interaction;
  }

  // --- SAVED REELS ---
  getSavedReels(userId: string): Reel[] {
    const savedIds = this.data.saved_reels
      .filter(s => s.user_id === userId)
      .map(s => s.reel_id);
    return this.data.reels.filter(r => savedIds.includes(r.id));
  }

  isReelSaved(userId: string, reelId: number): boolean {
    return this.data.saved_reels.some(s => s.user_id === userId && s.reel_id === reelId);
  }

  saveReel(userId: string, reelId: number): SavedReel {
    let saved = this.data.saved_reels.find(s => s.user_id === userId && s.reel_id === reelId);
    if (!saved) {
      saved = {
        id: crypto.randomUUID(),
        user_id: userId,
        reel_id: reelId,
        created_at: new Date().toISOString(),
      };
      this.data.saved_reels.push(saved);
      this.persist();
    }
    return saved;
  }

  unsaveReel(userId: string, reelId: number): boolean {
    const initialLen = this.data.saved_reels.length;
    this.data.saved_reels = this.data.saved_reels.filter(
      s => !(s.user_id === userId && s.reel_id === reelId)
    );

    // Also update interaction record if present
    const interaction = this.data.reel_interactions.find(
      i => i.user_id === userId && i.reel_id === reelId
    );
    if (interaction) {
      interaction.saved = false;
      interaction.updated_at = new Date().toISOString();
    }

    this.persist();
    return this.data.saved_reels.length < initialLen;
  }

  // --- INTEREST PROFILE ---
  getInterestProfile(userId: string): InterestProfile {
    let profile = this.data.interest_profiles.find(p => p.user_id === userId);
    if (!profile) {
      const now = new Date().toISOString();
      profile = {
        id: crypto.randomUUID(),
        user_id: userId,
        primary_interests: [],
        secondary_interests: [],
        overall_confidence: 'Low',
        raw_analysis_summary: "No interactions recorded yet. Start exploring Reels to generate recommendations.",
        version: 1,
        updated_at: now,
      };
      this.data.interest_profiles.push(profile);
      this.persist();
    }
    return profile;
  }

  updateInterestProfile(
    userId: string,
    updates: Partial<InterestProfile>
  ): InterestProfile {
    const profile = this.getInterestProfile(userId);
    Object.assign(profile, updates, {
      version: profile.version + 1,
      updated_at: new Date().toISOString(),
    });
    this.persist();
    return profile;
  }

  resetInterestProfile(userId: string): InterestProfile {
    const profile = this.getInterestProfile(userId);
    profile.primary_interests = [];
    profile.secondary_interests = [];
    profile.overall_confidence = 'Low';
    profile.raw_analysis_summary = "Interest profile has been reset. Fresh interactions will rebuild your profile from scratch.";
    profile.version = profile.version + 1;
    profile.updated_at = new Date().toISOString();
    this.persist();
    return profile;
  }

  // --- RECOMMENDATIONS & HISTORY ---
  getRecommendations(userId: string, limit = 20): Recommendation[] {
    return this.data.recommendations
      .filter(r => r.user_id === userId)
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, limit);
  }

  getRecommendationById(id: string, userId: string): Recommendation | undefined {
    return this.data.recommendations.find(r => r.id === id && r.user_id === userId);
  }

  createRecommendation(
    userId: string,
    recData: Omit<Recommendation, 'id' | 'user_id' | 'created_at'>
  ): Recommendation {
    const newRec: Recommendation = {
      id: crypto.randomUUID(),
      user_id: userId,
      ...recData,
      created_at: new Date().toISOString(),
    };
    this.data.recommendations.unshift(newRec);
    this.persist();
    return newRec;
  }

  // --- RECOMMENDATION FEEDBACK ---
  getFeedback(userId: string, recommendationId: string): RecommendationFeedback | undefined {
    return this.data.recommendation_feedback.find(
      f => f.user_id === userId && f.recommendation_id === recommendationId
    );
  }

  recordFeedback(
    userId: string,
    recommendationId: string,
    isUseful: boolean | null,
    reason?: string,
    comments?: string
  ): RecommendationFeedback {
    let feedback = this.getFeedback(userId, recommendationId);
    const now = new Date().toISOString();
    if (!feedback) {
      feedback = {
        id: crypto.randomUUID(),
        recommendation_id: recommendationId,
        user_id: userId,
        is_useful: isUseful,
        feedback_reason: reason,
        comments: comments,
        created_at: now,
      };
      this.data.recommendation_feedback.push(feedback);
    } else {
      feedback.is_useful = isUseful;
      feedback.feedback_reason = reason;
      feedback.comments = comments;
    }
    this.persist();
    return feedback;
  }

  // --- SUPPORT FEEDBACK ---
  createSupportFeedback(
    userId: string,
    type: SupportFeedback['feedback_type'],
    message: string
  ): SupportFeedback {
    const feedback: SupportFeedback = {
      id: crypto.randomUUID(),
      user_id: userId,
      feedback_type: type,
      message,
      status: 'Received',
      created_at: new Date().toISOString(),
    };
    this.data.support_feedback.push(feedback);
    this.persist();
    return feedback;
  }

  // --- MYSQL SCHEMA EXPORT ---
  getMySQLSchemaSQL(): string {
    return `
-- ==============================================================================
-- TechReel AI - Complete Production MySQL DDL Schema
-- Relational Schema with Foreign Keys, Indexes & Constraints
-- ==============================================================================

CREATE DATABASE IF NOT EXISTS techreel_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE techreel_ai;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  role VARCHAR(50) DEFAULT 'student',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_email (email)
) ENGINE=InnoDB;

-- 2. User Profiles Table
CREATE TABLE IF NOT EXISTS user_profiles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  bio TEXT,
  avatar_url VARCHAR(512),
  education_level VARCHAR(100) DEFAULT 'Undergraduate',
  primary_goal VARCHAR(255) DEFAULT 'Explore Tech & Career Growth',
  onboarding_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 3. Reels Table
CREATE TABLE IF NOT EXISTS reels (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  creator VARCHAR(100) NOT NULL,
  category VARCHAR(100) NOT NULL,
  tags JSON,
  difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Beginner',
  duration_seconds INT NOT NULL,
  thumbnail_url VARCHAR(512),
  video_type VARCHAR(50) DEFAULT 'concept',
  hype_score DECIMAL(3,2) DEFAULT 0.00,
  credibility_score DECIMAL(3,2) DEFAULT 0.90,
  learning_value_score DECIMAL(3,2) DEFAULT 0.85,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reels_category (category),
  INDEX idx_reels_difficulty (difficulty)
) ENGINE=InnoDB;

-- 4. Reel Interactions Table
CREATE TABLE IF NOT EXISTS reel_interactions (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  reel_id INT NOT NULL,
  watch_percentage INT DEFAULT 0,
  liked BOOLEAN DEFAULT FALSE,
  saved BOOLEAN DEFAULT FALSE,
  shared BOOLEAN DEFAULT FALSE,
  skipped BOOLEAN DEFAULT FALSE,
  rewatched BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_user_reel (user_id, reel_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reel_id) REFERENCES reels(id) ON DELETE CASCADE,
  INDEX idx_interactions_user (user_id)
) ENGINE=InnoDB;

-- 5. Interest Profiles Table
CREATE TABLE IF NOT EXISTS interest_profiles (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  primary_interests JSON NOT NULL,
  secondary_interests JSON NOT NULL,
  overall_confidence ENUM('High', 'Medium', 'Low') DEFAULT 'Low',
  raw_analysis_summary TEXT,
  version INT DEFAULT 1,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Recommendations Table
CREATE TABLE IF NOT EXISTS recommendations (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  current_reel_id INT NULL,
  current_reel_title VARCHAR(255),
  detected_interest VARCHAR(255) NOT NULL,
  why_detected TEXT NOT NULL,
  recommended_title VARCHAR(255) NOT NULL,
  recommended_description TEXT,
  category VARCHAR(100) NOT NULL,
  difficulty ENUM('Beginner', 'Intermediate', 'Advanced') DEFAULT 'Intermediate',
  confidence ENUM('High', 'Medium', 'Low') DEFAULT 'Medium',
  why_recommendation TEXT NOT NULL,
  educational_value TEXT NOT NULL,
  hype_filtered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (current_reel_id) REFERENCES reels(id) ON DELETE SET NULL,
  INDEX idx_recommendations_user (user_id, created_at)
) ENGINE=InnoDB;

-- 7. Recommendation Feedback Table
CREATE TABLE IF NOT EXISTS recommendation_feedback (
  id VARCHAR(36) PRIMARY KEY,
  recommendation_id VARCHAR(36) NOT NULL,
  user_id VARCHAR(36) NOT NULL,
  is_useful BOOLEAN NULL,
  feedback_reason VARCHAR(100),
  comments TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (recommendation_id) REFERENCES recommendations(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_feedback_user_rec (user_id, recommendation_id)
) ENGINE=InnoDB;

-- 8. Saved Reels Table
CREATE TABLE IF NOT EXISTS saved_reels (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  reel_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uniq_saved (user_id, reel_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reel_id) REFERENCES reels(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 9. User Preferences Table
CREATE TABLE IF NOT EXISTS user_preferences (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL UNIQUE,
  recommendation_style ENUM('technical', 'educational', 'career', 'mixed') DEFAULT 'mixed',
  difficulty_preference ENUM('beginner', 'intermediate', 'advanced', 'adaptive') DEFAULT 'adaptive',
  personalization_enabled BOOLEAN DEFAULT TRUE,
  selected_initial_topics JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 10. Support Feedback Table
CREATE TABLE IF NOT EXISTS support_feedback (
  id VARCHAR(36) PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  feedback_type ENUM('Bug', 'Bad Recommendation', 'Incorrect Interest', 'Content Problem', 'General Feedback') NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(50) DEFAULT 'Received',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
`;
  }
}

export const db = new Database();
