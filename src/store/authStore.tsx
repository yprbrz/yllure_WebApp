import { createContext, useContext, createSignal, ParentProps } from 'solid-js';

interface User {
  id: string;
  email: string;
  name?: string;
}

interface AuthContextValue {
  user: () => User | null;
  isAuthenticated: () => boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, name?: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>();

export function AuthProvider(props: ParentProps) {
  const [user, setUser] = createSignal<User | null>(null);

  const signIn = async (email: string, password: string) => {
    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const { user, token } = await response.json();
    localStorage.setItem('token', token);
    setUser(user);
  };

  const signUp = async (email: string, password: string, name?: string) => {
    const response = await fetch('http://localhost:3000/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error);
    }

    const { user, token } = await response.json();
    localStorage.setItem('token', token);
    setUser(user);
  };

  const signOut = async () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: () => !!user(),
      signIn,
      signUp,
      signOut
    }}>
      {props.children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}