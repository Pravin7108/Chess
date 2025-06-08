"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { signOut, getAuth } from "firebase/auth";
import { app } from "../config/firebaseConfig";
import Cookies from "js-cookie";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button";
import Image from "next/image";
import FriendList from "@/components/FriendList";
import { useRouter } from "next/navigation";

export default function Home() {
  const auth = getAuth(app);
  const { decodedToken }: any = useAuth();
  const router = useRouter();

  const LogOut = async () => {
    signOut(auth);
  };

  const [value,setValue] = useState('');


  return (
    <>
      <main className="min-h-screen flex justify-center items-center flex-col gap-10">
        {decodedToken && (
          <main className="flex flex-col items-center gap-3">
            <div className="rounded-full border size-32 overflow-hidden group">
              <Image
                src={decodedToken?.picture}
                alt="picture"
                className="object-cover w-full h-full transition-transform duration-300 ease-in-out group-hover:scale-125"
                width={100} unoptimized
                height={100}
              />
            </div>
            <span className="text-slate-500 font-semibold">Welcome back , {decodedToken?.name} !</span>

            <div className="flex items-center gap-10 my-6">
        <Link
          href={"/game/" + new Date().getTime()}
          onClick={()=>sessionStorage.setItem('color',"white")}
          className="bg-[#000] hover:bg-slate-600 text-white px-3 py-2 rounded-lg"
          >
          New Game
        </Link>

<Dialog>
           <DialogTrigger asChild>
        <button className="hover:bg-slate-100 duration-200 rounded-md py-2 px-2">Join a game</button>
        </DialogTrigger>

         <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Enter Game ID</DialogTitle>
            <DialogDescription>
              Ask your friend to share the game id.
            </DialogDescription>
          </DialogHeader>

          <div>
            <input value={value} className="border border-slate-400 py-2 rounded px-3" onChange={(e)=> setValue(e.target.value)} />
          </div>

          <DialogFooter>
            <div className="flex items-center gap-4">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <button onClick={()=>{if(value.trim() !== ""){router.push(`/game/${value}`);sessionStorage.setItem('color',"black")}}} className="text-white bg-slate-700 py-1 px-4 rounded">Join</button>
              </div>
          </DialogFooter>
        </DialogContent></Dialog>
            </div>


<FriendList/>


        {/* <Link
          href={`/chat/${decodedToken?.user_id === "6HIjX2VRyxOl3xAzutWwtrMc7y82" ? "93l8xQdLzDhtVLA5JbVaJpJxFvx1" : decodedToken?.user_id === "93l8xQdLzDhtVLA5JbVaJpJxFvx1" ? "6HIjX2VRyxOl3xAzutWwtrMc7y82" : "" }`}
          className="bg-[#000] hover:bg-slate-600 text-white px-3 py-2 rounded-lg"
          >
          Chat with {decodedToken?.user_id === "6HIjX2VRyxOl3xAzutWwtrMc7y82" ? "Pravin Murugesan" : "Pravin Shankar" }
        </Link> */}
          </main>
        )}

        {(typeof window !== "undefined" && !decodedToken) && (
          <div className="flex flex-col items-centet gap-8">
            <main>
              To start a new game , Log in here !
            </main>
          <Link href={"/login"} className="bg-slate-300 text-center rounded px-3 py-1">
            Login
          </Link>
          </div>
        )}

        {decodedToken && (
          <button
            onClick={() => {
              LogOut();
              Cookies.remove("gameToken");
              window.location.reload();
            }}
            className="bg-red-500 text-white hover:bg-red-600 px-3 py-1 rounded"
          >
            Log out
          </button>
        )}
      </main>
    </>
  );
}
