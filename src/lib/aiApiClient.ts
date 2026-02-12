// AI API Client with auth wrapper and token refresh
import { generateUUID } from './uuid';

const API_BASE_URL = 'https://socket-server-lke3f.ondigitalocean.app';

// Hard-coded credentials
const LOGIN_CREDENTIALS = {
  email: 'testuser_1748679648640',
  password: 'password123'
};

// Token storage keys
const STORAGE_KEYS = {
  ACCESS_TOKEN: 'ai_access_token',
  REFRESH_TOKEN: 'ai_refresh_token',
  USER_ID: 'ai_user_id'
};

// Types
export interface LoginResponse {
  statuscode: number;
  message: string;
  data: {
    accessToken: string;
    refreshToken: string;
    user: {
      id: string;
      email: string;
      [key: string]: any;
    };
  };
  success: boolean;
}

export interface SessionResponse {
  id: number;
  userid: string;
  chatname: string;
  sessionid: string;
  created_at: string;
  isExploited: boolean;
  exploitationCount: number;
  options: Record<string, any>;
}

export interface ChatRequest {
  prompt: string;
  sessionId: string;
  mode?: string;
  isSwarm?: boolean;
  swarmIds?: any[];
  isAutoSwarm?: boolean;
  workflowId?: any;
  collectionIds?: any[];
  intentModel?: any[];
  persistantAgent?: any[];
}

export interface SwarmResponse {
  id: number;
  created_at: string;
  personaId: string;
  goal: string;
  output: string;
  nextNode: any[];
  conversationIdentifier: number;
  sessionId: string;
}

export interface SSEEvent {
  type: string;
  data?: any;
  cid?: string;
  status?: string;
  content?: string;
  swarmId?: number;
}

// Token management
class TokenManager {
  private static instance: TokenManager;
  private isRefreshing = false;
  private refreshPromise: Promise<string> | null = null;

  static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  }

  getUserId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.USER_ID);
  }

  setTokens(accessToken: string, refreshToken: string, userId: string): void {
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(STORAGE_KEYS.USER_ID, userId);
  }

  clearTokens(): void {
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.USER_ID);
  }

  async refreshToken(): Promise<string> {
    // Always perform fresh login for every request
    if (this.isRefreshing && this.refreshPromise) {
      // If already refreshing, wait for it to complete
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performLogin();

    try {
      const token = await this.refreshPromise;
      return token;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performLogin(): Promise<string> {
    try {
      console.log('🔐 Calling login API for fresh access token...');

      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(LOGIN_CREDENTIALS),
      });

      if (!response.ok) {
        throw new Error(`Login failed: ${response.status}`);
      }

      const result: LoginResponse = await response.json();

      if (!result.success || !result.data) {
        throw new Error(result.message || 'Login failed');
      }

      this.setTokens(
        result.data.accessToken,
        result.data.refreshToken,
        result.data.user.id
      );

      console.log('✅ Fresh access token obtained');

      return result.data.accessToken;
    } catch (error) {
      console.error('❌ Login failed:', error);
      this.clearTokens();
      throw error;
    }
  }
}

/**
 * Auth wrapper for API calls
 *
 * IMPORTANT: This function calls the login API for EVERY request to ensure
 * we always have a fresh access token. This prevents any token expiration issues.
 *
 * Flow:
 * 1. Call login API with hard-coded credentials
 * 2. Get fresh access token
 * 3. Add token to Authorization header
 * 4. Make the actual API request
 */
async function authFetch(url: string, options: RequestInit = {}): Promise<Response> {
  const tokenManager = TokenManager.getInstance();

  // Always get a fresh token via login for every request
  const token = await tokenManager.refreshToken();

  // Add auth header
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
  };

  // Make the request
  const response = await fetch(url, { ...options, headers });

  return response;
}

// API Functions
export class AIApiClient {
  private static tokenManager = TokenManager.getInstance();

  // Initialize session by logging in
  static async initialize(): Promise<void> {
    try {
      // Perform initial login to get access token
      await this.tokenManager.refreshToken();
    } catch (error) {
      console.error('Failed to initialize AI API client:', error);
      throw error;
    }
  }

  // Create new chat session
  static async createSession(prompt: string): Promise<SessionResponse> {
    const userId = this.tokenManager.getUserId();

    if (!userId) {
      throw new Error('User ID not found. Please login first.');
    }

    // Note: sessionId is generated by the backend, not frontend
    const response = await authFetch(`${API_BASE_URL}/webhook/create-new-chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        userId,
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create session: ${response.status}`);
    }

    const data = await response.json();
    return Array.isArray(data) ? data[0] : data;
  }

  // Vectorize document
  static async vectorizeDocument(
    sessionId: string,
    file: File,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    const formData = new FormData();
    formData.append('type', 'chat');
    formData.append('sessionId', sessionId);
    formData.append('data', file);

    const response = await authFetch(`${API_BASE_URL}/webhook/vectorize-documents`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to vectorize document: ${response.status}`);
    }

    return await response.json();
  }

  // Vectorize multiple documents sequentially
  static async vectorizeDocuments(
    sessionId: string,
    files: File[],
    onProgress?: (current: number, total: number, fileName: string) => void
  ): Promise<any[]> {
    const results = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      if (onProgress) {
        onProgress(i + 1, files.length, file.name);
      }

      const result = await this.vectorizeDocument(sessionId, file);
      results.push(result);
    }

    return results;
  }

  // Start agentic chat with SSE
  static async startChat(
    chatRequest: ChatRequest,
    onEvent: (event: SSEEvent) => void,
    onComplete?: () => void,
    onError?: (error: Error) => void
  ): Promise<void> {
    try {
      // Get fresh token for this request
      const token = await this.tokenManager.refreshToken();

      const response = await fetch(`${API_BASE_URL}/api/core/chating`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          prompt: `${chatRequest.prompt}\n\ndont call document generation tool , i want direct answer`,
          sessionId: chatRequest.sessionId,
          mode: chatRequest.mode || 'quick',
          isSwarm: chatRequest.isSwarm !== undefined ? chatRequest.isSwarm : true,
          swarmIds: chatRequest.swarmIds || [],
          isAutoSwarm: chatRequest.isAutoSwarm !== undefined ? chatRequest.isAutoSwarm : true,
          workflowId: chatRequest.workflowId || null,
          collectionIds: chatRequest.collectionIds || [],
          intentModel: chatRequest.intentModel || [],
          persistantAgent: chatRequest.persistantAgent || [],
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat request failed: ${response.status}`);
      }

      // Handle SSE stream
      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Response body is not readable');
      }

      const decoder = new TextDecoder();
      let buffer = '';

      const processStream = async () => {
        while (true) {
          const { done, value } = await reader.read();
          if (done) {
            if (onComplete) onComplete();
            break;
          }

          buffer += decoder.decode(value, { stream: true });
          const parts = buffer.split('\n\n');
          buffer = parts.pop() || '';

          for (const part of parts) {
            if (!part.trim()) continue;

            const lines = part.split('\n');
            let eventType = 'message';
            let dataStr = '';

            for (const line of lines) {
              if (line.startsWith('event:')) {
                eventType = line.replace('event:', '').trim();
              } else if (line.startsWith('data:')) {
                dataStr += line.replace('data:', '').trim();
              }
            }

            let data: any = {};
            try {
              data = JSON.parse(dataStr);
            } catch {
              data = { content: dataStr };
            }

            // Emit event
            onEvent({ type: eventType, ...data });
          }
        }
      };

      await processStream();
    } catch (error) {
      if (onError) {
        onError(error as Error);
      } else {
        throw error;
      }
    }
  }

  // Get swarm/persona details
  static async getSwarmDetails(swarmId: number): Promise<SwarmResponse> {
    const response = await authFetch(`${API_BASE_URL}/webhook/get-persona-response`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: swarmId }),
    });

    if (!response.ok) {
      throw new Error(`Failed to get swarm details: ${response.status}`);
    }

    return await response.json();
  }

  // Parse agent output from swarm response
  static parseAgentOutput(output: string): {
    agent: string;
    title: string;
    goal: string;
    team: string;
    response: string;
  } | null {
    try {
      const agentMatch = output.match(/<\|agent\|>(.*?)<\|end\|>/s);
      if (!agentMatch) return null;

      const content = agentMatch[1];

      const titleMatch = content.match(/<\|title\|(.*?)<\|title\|>/);
      const goalMatch = content.match(/<\|goal\|(.*?)<\|goal\|>/);
      const teamMatch = content.match(/<\|team\|(.*?)<\|team\|>/);

      // Get response (everything after last closing tag)
      const responseMatch = content.match(/<\|team\|>.*?<\|team\|>(.*)/s);

      return {
        agent: 'agent',
        title: titleMatch?.[1]?.trim() || '',
        goal: goalMatch?.[1]?.trim() || '',
        team: teamMatch?.[1]?.trim() || '',
        response: responseMatch?.[1]?.trim() || '',
      };
    } catch (error) {
      console.error('Failed to parse agent output:', error);
      return null;
    }
  }
}

export default AIApiClient;
