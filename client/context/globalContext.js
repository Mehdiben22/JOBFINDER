import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";


const GlobalContext = createContext();

axios.defaults.baseURL = "http://localhost:3001";
axios.defaults.withCredentials = true; //sending cookie

export const GlobalContextProvider = ({children}) => {

     const router = useRouter()

    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [auth0User, setAuth0User] = useState(null);
    const [userProfile, setUserProfile] = useState({});
    const [loading, setLoading] = useState(false);

    //check the auth
    useEffect(() => {
        const checkAuth = async() => {
            setLoading(true);
            try{
             const res = await axios.get("api/v1/check-auth");
             console.log(res.data);
             setIsAuthenticated(res.data.isAuthenticated);
             setAuth0User(res.data.user);
             setLoading(false);
            }catch(error){
             console.log("No authenticated user", error)
            }finally {
                setLoading(false);
            };
        };
        checkAuth();
    },[]);
    return (
        //transmettre une valeur a mon component
        <GlobalContext.Provider value={"Hello from context"}>
            {children}
        </GlobalContext.Provider>
    );
};

//useGlobalContext() is a custom hook that simplifies accessing the context in any component.
export const useGlobalContext = () => {
    return useContext(GlobalContext);
};