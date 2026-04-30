import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext(); // This crates a gobal continer which holds the user data  and can be accessed from any component in the app without prop drilling

export const useAuth = () => useContext(AuthContext); // This is a custom hook which will be used to access the user data from any component in the app

export function AuthProvider({ children }) {
  // This is a provider component which will wrap the entire app and provide the user data to all the components in the app
  const [user, setUser] = useState(null); // This state will hold the user data and will be updated when the user logs in or logs out
  const [loading, setLoading] = useState(true); // This state will hold the loading state of the user data and will be used to show a loading spinner while the user data is being fetched

  useEffect(() => {
    // Get current session on load

    supabase.auth.getSession().then(({ data: { session } }) => {
      // supabase.auth.getSession() this  ask supabase if the user is logged in or not and returns the session data if the user is logged in , this .then(({ data: { session } }) => { is used to destructure the session data from the response
      setUser(session?.user ?? null);
      setLoading(false); //Done checking auth status
    });

    const {
      data: { subscription } // This is used to listen for changes in the auth state and update the user data accordingly
  } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null); // This is used to update the user data when the user logs in or logs out, the session?.user ?? null is used to set the user data to null if the user is not logged in
    });

    // Cleanup listener on unmount
    return () => subscription.unsubscribe(); // This is used to clean up the listener when the component unmounts to prevent memory leaks
  }, []);

  const signUp = async (email, password) => {
    const { error } = await supabase.auth.signUp({ email, password });
    return { error };
  };

  const signIn = async (email, password) => {
  const { error } = await supabase.auth.signInWithPassword({ email, password })
  return { error }
}

  const signInWithGoogle = async () => {
    const {error} = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options:{
        redirectTo: window.location.origin + '/dashboard' // This is used to redirect the user to the dashboard page after successful login with google
      }
    })
    return { error };
  }

  const signOut = async () => {
    await supabase.auth.signOut();
  }

  return(
   <AuthContext.Provider value={{ user, loading, signUp, signIn, signInWithGoogle, signOut }}>
    {!loading && children}
  </AuthContext.Provider>
  )
}
