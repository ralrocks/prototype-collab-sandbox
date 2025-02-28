
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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        setSession(data.session);
        setUser(data.session?.user || null);
        
        if (data.session?.user) {
          try {
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', data.session.user.id)
              .single();
            
            if (error) throw error;
            setProfile(profileData);
            console.log('Profile loaded:', profileData);
          } catch (error) {
            console.error('Error fetching profile:', error);
          }
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
        try {
          const { data: profileData, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', newSession.user.id)
            .single();
          
          if (error) throw error;
          setProfile(profileData);
          console.log('Profile updated on auth change:', profileData);
        } catch (error) {
          console.error('Error fetching profile:', error);
          setProfile(null);
        }
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
      
      // Don't clear API key on signout
      // localStorage.removeItem('PERPLEXITY_API_KEY');
      
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
      
      // Refresh profile data
      try {
        const { data: newProfile, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (fetchError) throw fetchError;
        setProfile(newProfile);
      } catch (err) {
        console.error('Error refreshing profile:', err);
        toast.error('Profile updated but could not refresh data');
      }
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
