const BASE_URL = '/api';

function getAuthToken(): string | null {
  return localStorage.getItem('techreel_token');
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getAuthToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  if (token) {
    (headers as any)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      // Don't auto-redirect if checking auth status
      if (endpoint !== '/auth/me') {
        // localStorage.removeItem('techreel_token');
      }
    }
    throw new Error(data.message || `Request failed with status ${response.status}`);
  }

  return data;
}

export const authAPI = {
  register: (body: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login: (body: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(body) }),
  logout: () => request<any>('/auth/logout', { method: 'POST' }),
  getMe: () => request<any>('/auth/me'),
  forgotPassword: (email: string) => request<any>('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
};

export const reelAPI = {
  getAllReels: (params?: { q?: string; category?: string; difficulty?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.q) searchParams.set('q', params.q);
    if (params?.category) searchParams.set('category', params.category);
    if (params?.difficulty) searchParams.set('difficulty', params.difficulty);
    const queryStr = searchParams.toString() ? `?${searchParams.toString()}` : '';
    return request<any>(`/reels${queryStr}`);
  },
  getReelById: (id: number) => request<any>(`/reels/${id}`),
  recordInteraction: (id: number, interactionData: {
    watch_percentage?: number;
    liked?: boolean;
    saved?: boolean;
    shared?: boolean;
    skipped?: boolean;
    rewatched?: boolean;
  }) => request<any>(`/reels/${id}/interactions`, {
    method: 'POST',
    body: JSON.stringify(interactionData),
  }),
};

export const interestAPI = {
  getProfile: () => request<any>('/interests'),
  analyze: (currentReelId?: number | null) => request<any>('/interests/analyze', {
    method: 'POST',
    body: JSON.stringify({ current_reel_id: currentReelId }),
  }),
  reset: () => request<any>('/interests/reset', { method: 'POST' }),
};

export const recommendationAPI = {
  getRecommendations: () => request<any>('/recommendations'),
  generate: (currentReelId?: number | null) => request<any>('/recommendations/generate', {
    method: 'POST',
    body: JSON.stringify({ current_reel_id: currentReelId }),
  }),
  recordFeedback: (id: string, data: {
    is_useful: boolean | null;
    feedback_reason?: string;
    comments?: string;
  }) => request<any>(`/recommendations/${id}/feedback`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};

export const savedAPI = {
  getSaved: () => request<any>('/saved'),
  saveReel: (reelId: number) => request<any>(`/saved/${reelId}`, { method: 'POST' }),
  unsaveReel: (reelId: number) => request<any>(`/saved/${reelId}`, { method: 'DELETE' }),
};

export const profileAPI = {
  getProfile: () => request<any>('/profile'),
  updateProfile: (data: any) => request<any>('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  deleteAccount: () => request<any>('/profile', { method: 'DELETE' }),
};

export const preferencesAPI = {
  getPreferences: () => request<any>('/preferences'),
  updatePreferences: (data: any) => request<any>('/preferences', { method: 'PUT', body: JSON.stringify(data) }),
};

export const feedbackAPI = {
  submit: (data: { feedback_type: string; message: string; rating?: number }) => request<any>('/feedback', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  submitSupportFeedback: (data: { feedback_type: string; message: string; rating?: number }) => request<any>('/feedback', {
    method: 'POST',
    body: JSON.stringify(data),
  }),
};
