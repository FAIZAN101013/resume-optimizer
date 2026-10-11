import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  /**
   * Creates the account. Supabase mails a verification code — we never
   * generate or store one ourselves, so expiry, single-use and rate limiting
   * are handled by the auth service rather than by us.
   *
   * Returns needsVerification so the UI knows whether to show the code step.
   * When "Confirm email" is off in Supabase, signUp returns a live session and
   * there is nothing to verify.
   */
  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    return {
      error,
      needsVerification: !error && !data.session,
    };
  };

  /** Exchanges the emailed code for a session. */
  const verifyOtp = async (email, token) => {
    const { error } = await supabase.auth.verifyOtp({
      email,
      token: token.trim(),
      type: "signup",
    });
    return { error };
  };

  /** Sends a fresh code if the first one expired or never arrived. */
  const resendCode = async (email) => {
    const { error } = await supabase.auth.resend({ type: "signup", email });
    return { error };
  };

  const signIn = async (email, password) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/dashboard" },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  /**
   * Fire-and-forget welcome email. The server derives the recipient from the
   * session token, so nothing here can redirect it elsewhere.
   *
   * Failures are swallowed: a missing welcome email must never block someone
   * from getting into the product they just signed up for.
   */
  const sendWelcomeEmail = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      await fetch("/api/send-welcome", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
    } catch (err) {
      console.warn("Welcome email could not be sent:", err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signUp,
        verifyOtp,
        resendCode,
        signIn,
        signInWithGoogle,
        signOut,
        sendWelcomeEmail,
      }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
}
