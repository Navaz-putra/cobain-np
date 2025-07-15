
import { createContext, useContext, useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

interface AuthContextType {
  user: (User & { name?: string; role?: string }) | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  signUpWithEmail: (email: string, password: string, name: string) => Promise<{success: boolean, error?: string}>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<(User & { name?: string; role?: string }) | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state change:", event, session?.user?.email);
        setSession(session);
        if (session?.user) {
          // Extract name and role from user metadata and add it to the user object
          const userData = {
            ...session.user,
            name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || '',
            role: session.user.user_metadata?.role || 'auditor',
          };
          setUser(userData);
        } else {
          setUser(null);
        }
        setLoading(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("Getting initial session:", session?.user?.email);
      setSession(session);
      if (session?.user) {
        // Extract name and role from user metadata and add it to the user object
        const userData = {
          ...session.user,
          name: session.user.user_metadata?.name || session.user.user_metadata?.full_name || '',
          role: session.user.user_metadata?.role || 'auditor',
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
      console.log("Attempting login for:", email);
      
      // Special case for our superadmin user
      if (email === "navazputra@students.amikom.ac.id" && password === "@Dede792002") {
        console.log("Superadmin login detected");
        // Store user data in localStorage for the superadmin
        localStorage.setItem("cobain_user", JSON.stringify({
          id: "superadmin-id",
          email: "navazputra@students.amikom.ac.id",
          name: "Super Admin",
          role: "admin",
        }));
        
        // Create a user object that matches the expected User type structure
        const superAdminUser = {
          id: "superadmin-id",
          email: "navazputra@students.amikom.ac.id",
          app_metadata: {},
          user_metadata: { name: "Super Admin", role: "admin" },
          aud: "authenticated",
          created_at: new Date().toISOString(),
          name: "Super Admin",
          role: "admin"
        } as unknown as User & { name?: string; role?: string };
        
        setUser(superAdminUser);
        
        // Create a mock session for superadmin
        const mockSession = {
          access_token: "mock-access-token-for-superadmin",
          refresh_token: "mock-refresh-token",
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: "bearer",
          user: superAdminUser
        } as Session;
        
        setSession(mockSession);
        return true;
      }
      
      // Regular Supabase authentication for other users
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Supabase login error:", error.message);
        return false;
      }
      
      if (data.user) {
        console.log("Login successful for user:", data.user.email);
        return true;
      }
      
      return false;
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
      console.log("Attempting signup for:", email);
      
      // Create a customized email template by calling our edge function first
      try {
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
      } catch (emailError) {
        console.warn("Custom email function failed, continuing with standard signup:", emailError);
      }

      // Then perform the signup
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
            role: "auditor", // Default role for new signups
          },
          emailRedirectTo: `${window.location.origin}/email-confirmation`,
        },
      });

      if (error) {
        console.error("Signup error:", error.message);
        return { success: false, error: error.message };
      }

      console.log("Signup successful for:", email);
      return { success: true };
    } catch (error: any) {
      console.error("Unexpected signup error:", error);
      return { success: false, error: error.message || "Terjadi kesalahan saat pendaftaran" };
    }
  };

  const logout = async () => {
    console.log("Logging out user");
    // Clear local storage data first
    localStorage.removeItem("cobain_user");
    
    // Then sign out of Supabase (if using Supabase auth)
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
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
