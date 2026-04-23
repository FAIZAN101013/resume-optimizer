import { createContext, useContext , useEffect , useState } from "react";
import { supabase } from "../lib/supabase";




const AuthContext = createContext()  // This crates a gobal continer which holds the user data  and can be accessed from any component in the app without prop drilling

export const useAuth = ()=> useContext(AuthContext)  // This is a custom hook which will be used to access the user data from any component in the app

export function AuthProvider({children}) {  // This is a provider component which will wrap the entire app and provide the user data to all the components in the app
    const [user,setUser] = useState(null)  // This state will hold the user data and will be updated when the user logs in or logs out
    const [loading,setLoading] = useState(true) // This state will hold the loading state of the user data and will be used to show a loading spinner while the user data is being fetched

    useEffect(()=>{

        // Get current session on load

        supabase.auth.getSession().then(({data: {session }}) => {   // supabase.auth.getSession() this  ask supabase if the user is logged in or not and returns the session data if the user is logged in , this .then(({ data: { session } }) => { is used to destructure the session data from the response
            setUser(session?.user ?? null) 
            setLoading(false) //Done checking auth status
        })
    })
}