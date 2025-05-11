"use client";
import React from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { signOut, getAuth } from "firebase/auth";
import { app } from "../config/firebaseConfig";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function Home() {
  const auth = getAuth(app);
  const { decodedToken }: any = useAuth();

  const LogOut = async () => {
    signOut(auth);
  };

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
        <Link
          href={"/game/1434222"}
          className="bg-[#000] hover:bg-slate-600 text-white px-3 py-2 rounded-lg"
          >
          New Game
        </Link>
        <Link
          href={`/chat/${decodedToken?.user_id === "6HIjX2VRyxOl3xAzutWwtrMc7y82" ? "93l8xQdLzDhtVLA5JbVaJpJxFvx1" : decodedToken?.user_id === "93l8xQdLzDhtVLA5JbVaJpJxFvx1" ? "6HIjX2VRyxOl3xAzutWwtrMc7y82" : "" }`}
          className="bg-[#000] hover:bg-slate-600 text-white px-3 py-2 rounded-lg"
          >
          Chat with {decodedToken?.user_id === "6HIjX2VRyxOl3xAzutWwtrMc7y82" ? "Pravin Murugesan" : "Pravin Shankar" }
        </Link>
          </main>
        )}

        {!decodedToken && (
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
