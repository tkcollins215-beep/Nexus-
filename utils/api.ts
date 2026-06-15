import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import Constants from "expo-constants";

function resolveApiUrl(): string {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  const hostUri =
    Constants.expoConfig?.hostUri ??
    Constants.expoGoConfig?.debuggerHost ??
    (Constants.manifest as { debuggerHost?: string } | null)?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(":")[0];
    return `http://${host}:5000/api`;
  }

  return "http://localhost:5000/api";
}

const API_URL = resolveApiUrl();

export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.error) {
      return String(error.response.data.error);
    }
    if (error.code === "ERR_NETWORK" || !error.response) {
      return `Cannot reach server at ${API_URL}. Start the backend (npm run dev in /backend).`;
    }
    return error.message || fallback;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
}

const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
});

// Request interceptor to add token
apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error retrieving token:", error);
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      await AsyncStorage.removeItem("authToken");
      // Could navigate to login screen here
    }
    return Promise.reject(error);
  },
);

export const authApi = {
  register: (username, email, phone, password) =>
    apiClient.post("/auth/register", { username, email, phone, password }),
  login: (identifier, password) =>
    apiClient.post("/auth/login", { identifier, password }),
  getCurrentUser: () => apiClient.get("/auth/me"),
  logout: () => apiClient.post("/auth/logout"),
  updateProfile: (userId, data) => apiClient.put(`/auth/${userId}`, data),
  uploadAvatar: (userId: string, imageUri: string) => {
    const formData = new FormData();
    const filename = imageUri.split("/").pop() || "avatar.jpg";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : "image/jpeg";

    formData.append("avatar", {
      uri: imageUri,
      name: filename,
      type,
    } as unknown as Blob);

    return apiClient.post(`/auth/${userId}/avatar`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
      timeout: 30000,
    });
  },
};

export const conversationsApi = {
  getConversations: () => apiClient.get("/conversations"),
  getConversation: (conversationId) =>
    apiClient.get(`/conversations/${conversationId}`),
  createConversation: (participantIds, isGroupChat = false, groupName = null) =>
    apiClient.post("/conversations", {
      participantIds,
      isGroupChat,
      groupName,
    }),
  sendMessage: (conversationId, content, mediaUrl = null, mediaType = null) =>
    apiClient.post(`/conversations/${conversationId}/messages`, {
      content,
      mediaUrl,
      mediaType,
    }),
  sendAudioMessage: (
    conversationId: string,
    audioUri: string,
    duration: string,
  ) => {
    const formData = new FormData();
    const filename = audioUri.split("/").pop() || "voice.m4a";
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `audio/${match[1]}` : "audio/m4a";

    formData.append("audio", {
      uri: audioUri,
      name: filename,
      type,
    } as unknown as Blob);
    formData.append("duration", duration);

    return apiClient.post(
      `/conversations/${conversationId}/messages/audio`,
      formData,
      {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60000,
      },
    );
  },
  markAsRead: (conversationId) =>
    apiClient.put(`/conversations/${conversationId}/read`),
  deleteMessage: (conversationId, messageId) =>
    apiClient.delete(`/conversations/${conversationId}/messages/${messageId}`),
  editMessage: (conversationId, messageId, content) =>
    apiClient.put(`/conversations/${conversationId}/messages/${messageId}`, {
      content,
    }),

  // REACTIONS
  addReaction: (conversationId, messageId, emoji) =>
    apiClient.post(
      `/conversations/${conversationId}/messages/${messageId}/react`,
      { emoji },
    ),
  removeReaction: (conversationId, messageId, emoji) =>
    apiClient.post(
      `/conversations/${conversationId}/messages/${messageId}/react`,
      { emoji },
    ),

  // BOOKMARKS
  bookmarkMessage: (conversationId, messageId) =>
    apiClient.post(
      `/conversations/${conversationId}/messages/${messageId}/bookmark`,
    ),
  getBookmarks: (conversationId) =>
    apiClient.get(`/conversations/${conversationId}/bookmarks`),

  // THREADS
  getThread: (conversationId, messageId) =>
    apiClient.get(
      `/conversations/${conversationId}/messages/${messageId}/thread`,
    ),
  sendReply: (conversationId, content, replyToMessageId) =>
    apiClient.post(`/conversations/${conversationId}/messages`, {
      content,
      replyTo: replyToMessageId,
    }),

  // REMINDERS
  createReminder: (conversationId, messageId, remindAt) =>
    apiClient.post(
      `/conversations/${conversationId}/messages/${messageId}/remind`,
      { remindAt },
    ),
  getReminders: () => apiClient.get("/conversations/reminders/list"),
  completeReminder: (conversationId, reminderId) =>
    apiClient.put(
      `/conversations/${conversationId}/reminders/${reminderId}/complete`,
    ),

  // SEARCH
  searchMessages: (conversationId, query) =>
    apiClient.get(`/conversations/${conversationId}/search`, {
      params: { query },
    }),

  // PINNED MESSAGES
  pinMessage: (conversationId, messageId) =>
    apiClient.post(
      `/conversations/${conversationId}/messages/${messageId}/pin`,
    ),
  getPinnedMessages: (conversationId) =>
    apiClient.get(`/conversations/${conversationId}/pinned`),

  // ACTION ITEMS
  createActionItem: (
    conversationId,
    { messageId, text, assignedTo, dueDate, priority },
  ) =>
    apiClient.post(`/conversations/${conversationId}/action-items`, {
      messageId,
      text,
      assignedTo,
      dueDate,
      priority,
    }),
  getActionItems: (conversationId) =>
    apiClient.get(`/conversations/${conversationId}/action-items`),
  updateActionItem: (conversationId, itemId, isCompleted) =>
    apiClient.put(`/conversations/${conversationId}/action-items/${itemId}`, {
      isCompleted,
    }),
};

export const usersApi = {
  getAllUsers: () => apiClient.get("/auth"),
  getUserById: (userId) => apiClient.get(`/auth/${userId}`),
};

export default apiClient;
