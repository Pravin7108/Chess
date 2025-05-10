"use client"
import { useContext,createContext, useState, useEffect } from "react";
import Cookies from "js-cookie";
import jwt from "jsonwebtoken";

const AuthContext = createContext(null);

export const useAuth=()=>useContext(AuthContext);

export const AuthProvider=({children})=>{

    const [token,setToken] = useState(null);
    const [decodedToken,setDecodedToken] = useState(null);

    useEffect(()=>{
        const token = Cookies.get('gameToken');
        const decoded = token && jwt.decode(token);
        setToken(token);
        setDecodedToken(decoded)
    },[])


    return (
        <AuthContext.Provider value={{token,decodedToken}}>
            {children}
        </AuthContext.Provider>
    )
}