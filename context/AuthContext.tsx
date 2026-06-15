import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useCallback, useContext, useReducer } from 'react';
import { authApi, getApiErrorMessage } from '../utils/api';

interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  status?: string;
  lastSeen?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isSignout: boolean;
  error: string | null;
}

interface AuthContextType {
  state: AuthState;
  signIn: (identifier: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (username: string, email: string, phone: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
}

function normalizeUser(user: Record<string, unknown> | null): User | null {
  if (!user) return null;
  return {
    _id: String(user._id ?? user.id),
    username: String(user.username),
    email: String(user.email),
    avatar: user.avatar ? String(user.avatar) : undefined,
    status: user.status ? String(user.status) : undefined,
    lastSeen: user.lastSeen ? String(user.lastSeen) : undefined,
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isSignout: false,
  error: null,
};

function authReducer(state: AuthState, action: any) {
  switch (action.type) {
    case 'RESTORE_TOKEN':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isLoading: false,
      };
    case 'SIGN_IN':
      return {
        ...state,
        isSignout: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'SIGN_UP':
      return {
        ...state,
        isSignout: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        isSignout: true,
        user: null,
        token: null,
      };
    case 'SET_ERROR':
      return {
        ...state,
        error: action.payload,
      };
    case 'UPDATE_USER':
      return {
        ...state,
        user: action.payload,
      };
    default:
      return state;
  }
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [state, dispatch] = useReducer(authReducer, initialState as AuthState);

  // Restore token on app start
  React.useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        if (token) {
          const response = await authApi.getCurrentUser();
          dispatch({
            type: 'RESTORE_TOKEN',
            payload: { token, user: normalizeUser(response.data) },
          });
        } else {
          dispatch({
            type: 'RESTORE_TOKEN',
            payload: { token: null, user: null },
          });
        }
      } catch (e) {
        console.error('Failed to restore token:', e);
        dispatch({
          type: 'RESTORE_TOKEN',
          payload: { token: null, user: null },
        });
      }
    };

    bootstrapAsync();
  }, []);

  const authContext = {
    state,
    signIn: useCallback(async (identifier, password) => {
      try {
        const response = await authApi.login(identifier, password);
        const { token, user } = response.data;
        await AsyncStorage.setItem('authToken', token);
        dispatch({ type: 'SIGN_IN', payload: { user: normalizeUser(user), token } });
        return { success: true };
      } catch (error) {
        const message = getApiErrorMessage(error, 'Login failed');
        dispatch({ type: 'SET_ERROR', payload: message });
        return { success: false, error: message };
      }
    }, []),
    signUp: useCallback(async (username, email, phone, password) => {
      try {
        const response = await authApi.register(username, email, phone, password);
        const { token, user } = response.data;
        await AsyncStorage.setItem('authToken', token);
        dispatch({ type: 'SIGN_UP', payload: { user: normalizeUser(user), token } });
        return { success: true };
      } catch (error) {
        const message = getApiErrorMessage(error, 'Registration failed');
        dispatch({ type: 'SET_ERROR', payload: message });
        return { success: false, error: message };
      }
    }, []),
    signOut: useCallback(async () => {
      try {
        await authApi.logout();
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        await AsyncStorage.removeItem('authToken');
        dispatch({ type: 'SIGN_OUT' });
      }
    }, []),
    updateUser: useCallback((user: User) => {
      dispatch({ type: 'UPDATE_USER', payload: user });
    }, []),
  };

  return <AuthContext.Provider value={authContext}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
