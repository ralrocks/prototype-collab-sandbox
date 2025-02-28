
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { toast } from 'sonner';

interface ProfileType {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: ProfileType | null;
  signUp: (email: string, password: string, fullName: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  loading: boolean;
  updateProfile: (data: { fullName?: string; avatarUrl?: string }) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ProfileType | null>(null);
  const [loading, setLoading] = useState(true);

  // Function to fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }
      
      console.log('Profile data fetched successfully:', data);
      return data;
    } catch (error) {
      console.error('Exception fetching profile:', error);
      return null;
    }
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const { data } = await supabase.auth.getSession();
        console.log('Auth session data:', data);
        
        setSession(data.session);
        setUser(data.session?.user || null);
        
        if (data.session?.user) {
          const profileData = await fetchUserProfile(data.session.user.id);
          setProfile(profileData);
        }
      } catch (error) {
        console.error('Error in fetchUser:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      console.log('Auth state changed:', event, newSession);
      setSession(newSession);
      setUser(newSession?.user || null);
      
      if (newSession?.user) {
        const profileData = await fetchUserProfile(newSession.user.id);
        setProfile(profileData);
      } else {
        setProfile(null);
      }
      
      setLoading(false);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });
      
      if (error) throw error;
      toast.success('Sign up successful!');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign up');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      toast.success('Signed in successfully!');
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during sign in');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const signOut = async () => {
    try {
      setLoading(true);
      console.log('Signing out...');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('Sign out error:', error);
        throw error;
      }
      
      // Clear state after successful signout
      setSession(null);
      setUser(null);
      setProfile(null);
      
      toast.success('Signed out successfully!');
      
      // Force a page reload to clear any remaining state
      window.location.href = '/';
    } catch (error: any) {
      console.error('Sign out error caught:', error);
      toast.error(error.message || 'An error occurred during sign out');
      throw error;
    } finally {
      setLoading(false);
    }
  };
  
  const updateProfile = async (data: { fullName?: string; avatarUrl?: string }) => {
    try {
      if (!user) throw new Error('No user');
      
      const updates: Record<string, string> = {};
      if (data.fullName) updates.full_name = data.fullName;
      if (data.avatarUrl) updates.avatar_url = data.avatarUrl;
      
      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success('Profile updated successfully!');
      
      // Refresh profile data after update
      const profileData = await fetchUserProfile(user.id);
      setProfile(profileData);
    } catch (error: any) {
      toast.error(error.message || 'An error occurred while updating profile');
      throw error;
    }
  };
  
  const value = {
    session,
    user,
    profile,
    signUp,
    signIn,
    signOut,
    loading,
    updateProfile,
  };
  
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
