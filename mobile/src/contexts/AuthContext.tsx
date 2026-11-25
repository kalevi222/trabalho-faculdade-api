import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api, setApiToken, setOnUnauthorized } from '../services/api';
import { User } from '../types';

const TOKEN_KEY = '@trabalho_faculdade:token';
const USER_KEY = '@trabalho_faculdade:user';

interface AuthContextData {
  user: User | null;
  token: string | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const signOut = async () => {
    setApiToken(null);
    setToken(null);
    setUser(null);
    await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
  };

  useEffect(() => {
    setOnUnauthorized(() => {
      void signOut();
    });

    const loadSession = async () => {
      try {
        const [[, storedToken], [, storedUser]] = await AsyncStorage.multiGet([
          TOKEN_KEY,
          USER_KEY,
        ]);

        if (storedToken && storedUser) {
          setApiToken(storedToken);
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Erro ao carregar sessão:', err);
      } finally {
        setLoading(false);
      }
    };

    void loadSession();
  }, []);

  const persistSession = async (nextToken: string, nextUser: User) => {
    setApiToken(nextToken);
    setToken(nextToken);
    setUser(nextUser);
    await AsyncStorage.multiSet([
      [TOKEN_KEY, nextToken],
      [USER_KEY, JSON.stringify(nextUser)],
    ]);
  };

  const signIn = async (email: string, password: string) => {
    const response = await api.post<{ token: string; user: User }>('/auth/login', {
      email,
      password,
    });
    await persistSession(response.data.token, response.data.user);
  };

  const signUp = async (name: string, email: string, password: string) => {
    const response = await api.post<{ token: string; user: User }>('/auth/register', {
      name,
      email,
      password,
    });
    await persistSession(response.data.token, response.data.user);
  };

  const refreshProfile = async () => {
    const response = await api.get<User>('/auth/me');
    setUser(response.data);
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(response.data));
  };

  return (
    <AuthContext.Provider
      value={{ user, token, loading, signIn, signUp, signOut, refreshProfile, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
