"use client"


import React from "react";
import { signInWithPopup,GoogleAuthProvider,getAuth } from "firebase/auth";
import {app} from "../../config/firebaseConfig";
import Cookie from "js-cookie";
import { useRouter } from "next/navigation";

const Login=()=>{
    const router = useRouter();
    const auth = getAuth(app);

    const Signup=async()=>{
        const provider = new GoogleAuthProvider();
       const userAuth:any = await signInWithPopup(auth,provider);

       const token = userAuth.user.accessToken;
       Cookie.set('gameToken',token,{expires:60/1440});
       window.location.assign('/')
       
    }
    
    return (
        <main className="flex justify-center items-center flex-col gap-5 h-screen">
            <div>
                Log in to play with your mate
            </div>
            <button onClick={Signup} className="shadow rounded-full px-4 duration-200 py-2 hover:text-white hover:bg-slate-700 border border-slate-600">
                Signin with Google
            </button>
        </main>
    )
}

export default Login;