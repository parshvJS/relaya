import { useState, useCallback, useRef } from 'react';
import AIApiClient, { SSEEvent, SessionResponse, SwarmResponse } from '@/lib/aiApiClient';

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  swarmId?: number;
  agentDetails?: SwarmResponse;
}

export interface FileUploadProgress {
  current: number;
  total: number;
  fileName: string;
  percentage: number;
}

export interface AISessionState {
  sessionId: string | null;
  conversationId: string | null;
  messages: AIMessage[];
  isLoading: boolean;
  loadingStatus: string;
  error: string | null;
  swarmIds: number[];
  fileUploadProgress: FileUploadProgress | null;
}

export function useAISession() {
  const [state, setState] = useState<AISessionState>({
    sessionId: null,
    conversationId: null,
    messages: [],
    isLoading: false,
    loadingStatus: '',
    error: null,
    swarmIds: [],
    fileUploadProgress: null,
  });

  const currentResponseRef = useRef<string>('');
  const currentMessageIdRef = useRef<string>('');

  // Initialize AI API client
  const initialize = useCallback(async () => {
    try {
      await AIApiClient.initialize();
      return true;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to initialize AI client',
      }));
      return false;
    }
  }, []);

  // Create new session
  const createSession = useCallback(async (initialPrompt: string): Promise<string | null> => {
    try {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      const session: SessionResponse = await AIApiClient.createSession(initialPrompt);

      setState((prev) => ({
        ...prev,
        sessionId: session.sessionid,
        isLoading: false,
      }));

      return session.sessionid;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Failed to create session',
        isLoading: false,
      }));
      return null;
    }
  }, []);

  // Upload files (sequential)
  const uploadFiles = useCallback(
    async (files: File[]): Promise<boolean> => {
      if (!state.sessionId) {
        setState((prev) => ({
          ...prev,
          error: 'No active session. Please create a session first.',
        }));
        return false;
      }

      try {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        await AIApiClient.vectorizeDocuments(
          state.sessionId,
          files,
          (current, total, fileName) => {
            setState((prev) => ({
              ...prev,
              fileUploadProgress: {
                current,
                total,
                fileName,
                percentage: Math.round((current / total) * 100),
              },
            }));
          }
        );

        setState((prev) => ({
          ...prev,
          fileUploadProgress: null,
          isLoading: false,
        }));

        return true;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to upload files',
          isLoading: false,
          fileUploadProgress: null,
        }));
        return false;
      }
    },
    [state.sessionId]
  );

  // Send message and handle streaming response
  const sendMessage = useCallback(
    async (prompt: string, files?: File[]): Promise<void> => {
      try {
        // Initialize if not already done
        const initialized = await initialize();
        if (!initialized) {
          throw new Error('Failed to initialize AI client');
        }

        // Create session if not exists
        let sessionId = state.sessionId;
        if (!sessionId) {
          sessionId = await createSession(prompt);
          if (!sessionId) {
            throw new Error('Failed to create session');
          }
        }

        // Upload files if provided
        if (files && files.length > 0) {
          const uploaded = await uploadFiles(files);
          if (!uploaded) {
            throw new Error('Failed to upload files');
          }
        }

        // Add user message
        const userMessage: AIMessage = {
          id: `user-${Date.now()}`,
          role: 'user',
          content: prompt,
          timestamp: new Date(),
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, userMessage],
          isLoading: true,
          error: null,
          loadingStatus: 'Initiating chat...',
        }));

        // Initialize response
        currentResponseRef.current = '';
        currentMessageIdRef.current = `assistant-${Date.now()}`;

        const assistantMessage: AIMessage = {
          id: currentMessageIdRef.current,
          role: 'assistant',
          content: '',
          timestamp: new Date(),
        };

        setState((prev) => ({
          ...prev,
          messages: [...prev.messages, assistantMessage],
        }));

        // Start chat
        await AIApiClient.startChat(
          {
            prompt,
            sessionId,
          },
          (event: SSEEvent) => {
            // Handle different event types
            if (event.type === 'conversationId') {
              setState((prev) => ({
                ...prev,
                conversationId: event.cid || null,
              }));
            } else if (event.type === 'loadingStatus') {
              setState((prev) => ({
                ...prev,
                loadingStatus: event.status || '',
              }));
            } else if (event.type === 'swarmId') {
              if (event.swarmId) {
                setState((prev) => ({
                  ...prev,
                  swarmIds: [...prev.swarmIds, event.swarmId!],
                }));
              }
            } else if (event.type === 'finalResponse') {
              // Append token to response
              currentResponseRef.current += event.content || '';

              // Update message
              setState((prev) => ({
                ...prev,
                messages: prev.messages.map((msg) =>
                  msg.id === currentMessageIdRef.current
                    ? { ...msg, content: currentResponseRef.current }
                    : msg
                ),
              }));
            }
          },
          () => {
            // On complete
            setState((prev) => ({
              ...prev,
              isLoading: false,
              loadingStatus: 'Complete',
            }));
          },
          (error) => {
            // On error
            setState((prev) => ({
              ...prev,
              error: error.message,
              isLoading: false,
              loadingStatus: '',
            }));
          }
        );
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error instanceof Error ? error.message : 'Failed to send message',
          isLoading: false,
          loadingStatus: '',
        }));
      }
    },
    [state.sessionId, initialize, createSession, uploadFiles]
  );

  // Get swarm details
  const getSwarmDetails = useCallback(async (swarmId: number): Promise<SwarmResponse | null> => {
    try {
      const details = await AIApiClient.getSwarmDetails(swarmId);
      return details;
    } catch (error) {
      console.error('Failed to get swarm details:', error);
      return null;
    }
  }, []);

  // Reset session
  const resetSession = useCallback(() => {
    setState({
      sessionId: null,
      conversationId: null,
      messages: [],
      isLoading: false,
      loadingStatus: '',
      error: null,
      swarmIds: [],
      fileUploadProgress: null,
    });
    currentResponseRef.current = '';
    currentMessageIdRef.current = '';
  }, []);

  return {
    ...state,
    initialize,
    createSession,
    uploadFiles,
    sendMessage,
    getSwarmDetails,
    resetSession,
  };
}
