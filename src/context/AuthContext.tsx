import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { mockUsers } from '../data/mockData';

interface AuthContextType {
  currentUser: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signUp: (name: string, email: string, password: string, phone: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  useEffect(() => {
    // Check if user is already logged in (from localStorage in a real app)
    const storedUser = localStorage.getItem('tagalong-user');
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // In a real app, this would make an API call to verify credentials
    try {
      // For demo, just check if user exists in mock data
      const user = mockUsers.find(u => u.email === email);
      if (user) {
        setCurrentUser(user);
        setIsAuthenticated(true);
        localStorage.setItem('tagalong-user', JSON.stringify(user));
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('tagalong-user');
  };

  const signUp = async (
    name: string, 
    email: string, 
    password: string, 
    phone: string
  ): Promise<boolean> => {
    // In a real app, this would make an API call to create user
    try {
      // Check if email already exists
      const existingUser = mockUsers.find(u => u.email === email);
      if (existingUser) {
        return false;
      }
      
      // Create new user (in a real app, this would be done on the backend)
      const newUser: User = {
        id: `user${mockUsers.length + 1}`,
        name,
        email,
        phone,
        avatar: 'https://images.pexels.com/photos/1851164/pexels-photo-1851164.jpeg?auto=compress&cs=tinysrgb&w=600',
        isVerified: false,
        rating: 0,
        reviews: []
      };
      
      // Update current user state
      setCurrentUser(newUser);
      setIsAuthenticated(true);
      localStorage.setItem('tagalong-user', JSON.stringify(newUser));
      
      return true;
    } catch (error) {
      console.error('Sign up error:', error);
      return false;
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, isAuthenticated, login, logout, signUp }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};