import { createContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types/user';
import { getMe, googleLogin as apiGoogleLogin, updatePhone as apiUpdatePhone } from '../api/auth';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  needsPhone: boolean;
}

interface AuthContextType extends AuthState {
  loginWithGoogle: (credential: string) => Promise<void>;
  updatePhone: (phone: string) => Promise<void>;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const needsPhone = user !== null && !user.phone_number;

  useEffect(() => {
    const hydrate = async () => {
      if (token) {
        try {
          const userData = await getMe();
          setUser(userData);
        } catch (error) {
          localStorage.removeItem('token');
          setToken(null);
          setUser(null);
        }
      }
      setIsLoading(false);
    };
    hydrate();
  }, [token]);

  const loginWithGoogle = async (credential: string) => {
    const data = await apiGoogleLogin(credential);
    localStorage.setItem('token', data.access_token);
    setToken(data.access_token);
    setUser(data.user);
  };

  const updatePhone = async (phone: string) => {
    const updatedUser = await apiUpdatePhone(phone);
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, needsPhone, loginWithGoogle, updatePhone, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
