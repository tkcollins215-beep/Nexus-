// User types
export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  createdAt: string;
  updatedAt: string;
}

// Message types
export interface Message {
  _id: string;
  conversationId: string;
  sender: User;
  content: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'audio' | 'file';
  createdAt: string;
  updatedAt: string;
  readBy: string[];
}

// Conversation types
export interface Conversation {
  _id: string;
  participants: User[];
  isGroupChat: boolean;
  groupName?: string;
  groupImage?: string;
  lastMessage?: Message;
  createdAt: string;
  updatedAt: string;
  unreadCount?: number;
}

// Navigation types
export interface ChatRouteParams {
  conversationId: string;
  title?: string;
}

// Auth context types
export interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

export interface AuthContextType {
  state: AuthState;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (username: string, email: string, phone: string, password: string) => Promise<void>;
  signOut: () => void;
}

// Component prop types
export interface ConversationItemProps {
  conversation: Conversation & { currentUserId?: string };
  onPress: () => void;
}

export interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  senderName?: string;
}

export interface MessageInputProps {
  onSend: (content: string) => Promise<void>;
  isLoading?: boolean;
}
