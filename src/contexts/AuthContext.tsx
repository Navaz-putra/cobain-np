
import { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: (User & { name?: string }) | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{success: boolean, error?: string}>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<(User & { name?: string }) | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        if (session?.user) {
          // Extract name from user metadata and add it to the user object
          const userData = {
            ...session.user,
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || '',
          };
          setUser(userData);
        } else {
          setUser(null);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        // Extract name from user metadata and add it to the user object
        const userData = {
          ...session.user,
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || '',
        };
        setUser(userData);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Special case for our superadmin user
      if (email === "navazputra@students.amikom.ac.id" && password === "@Dede792002") {
        // Store user data in localStorage for the superadmin
        localStorage.setItem("cobain_user", JSON.stringify({
          id: "superadmin-id",
          email: "navazputra@students.amikom.ac.id",
          name: "Super Admin",
          role: "admin",
        }));
        
        // Although we're not using Supabase auth in this specific case,
        // we need to set the user and session state to maintain consistency
        const superAdminUser = {
          id: "superadmin-id",
          email: "navazputra@students.amikom.ac.id",
          user_metadata: { name: "Super Admin" },
          name: "Super Admin"
        };
        
        setUser(superAdminUser as User & { name?: string });
        return true;
      }
      
      // Regular Supabase authentication for other users
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error.message);
        return false;
      }
      return true;
    } catch (error) {
      console.error("Unexpected login error:", error);
      return false;
    }
  };

  const signUpWithEmail = async (
    email: string, 
    password: string, 
    name: string
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      // Create a customized email template by calling our edge function first
      await fetch("https://dcslbtsxmctxkudozrck.supabase.co/functions/v1/custom-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "confirmation",
          email: email,
          name: name,
          redirectTo: `${window.location.origin}/email-confirmation`,
        }),
      });

      // Then perform the signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          },
          emailRedirectTo: `${window.location.origin}/email-confirmation`,
        },
      });

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message || "Terjadi kesalahan saat pendaftaran" };
    }
  };

  const logout = async () => {
    // Clear local storage data first
    localStorage.removeItem("cobain_user");
    
    // Then sign out of Supabase (if using Supabase auth)
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        isAuthenticated: !!user,
        login,
        signUpWithEmail,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
