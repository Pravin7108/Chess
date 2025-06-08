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
        <section className="relative min-h-screen">
    <div className="absolute inset-0 bg-[url('/king.jpg')] bg-cover bg-no-repeat bg-center z-10" />
        <div className="absolute inset-0 bg-[#242424] bg-opacity-75 z-10" />

        <main className="flex justify-center items-center flex-col gap-5 z-20 min-h-screen">
            <div className="z-20 text-white">
                Log in to play with your mate
            </div>
            <button onClick={Signup} className="z-20 text-white shadow rounded-full px-4 duration-200 py-2 hover:text-white hover:bg-slate-700 border border-slate-600">
                Signin with Google
            </button>
        </main>
        </section>
    )
}

export default Login;