"use client";
import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
import Image from "next/image";
import Link from "next/link";

type Users = {
  displayName: string;
  email: string;
  photoURL: string;
  uid: string;
};

interface FriendList {
  users: Users[];
}

const FriendList = () => {
  const [friendList, setFriendList] = useState<FriendList | null>(null);
  const { decodedToken }: any = useAuth();

  const userList = async () => {
    try {
      const res = await axios.get(`/api/getUsers`);
      if (res.status === 200) {
        setFriendList(res.data);
      }
    } catch (error: any) {
      if (error.response) {
        console.log(error);
      }
    }
  };

  useEffect(() => {
    if (decodedToken) {
      userList();
    }
  }, [decodedToken]);

  const setStorage=(name:string)=>{
    sessionStorage.setItem("friendName",name)
  }

  return (
    <>
    <span className="text-indigo-500 font-semibold text-left">Choose your opponent</span>
    {friendList ? <main className="w-[600px] rounded-2xl p-4 border border-slate-200 shadow-lg ">
      <div className="max-h-[500px] overflow-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-5 duration-200">

          {friendList?.users
            ?.filter((o) => o?.uid !== decodedToken?.user_id)
            ?.map((i: Users, index: number) => (
                <Link href={'/chat/'+i.uid} onClick={()=>setStorage(i.displayName)} key={index} className="flex p-2 h-fit cursor-pointer hover:bg-gradient-to-br hover:shadow shadow-blue-500 from-blue-300 to-indigo-400 group ease-in-out transition-all  items-center w-full gap-3 border border-indigo-600 rounded-xl">
                <Image src={i.photoURL} alt="dp" width={50} height={50}
                className="rounded-full border-2 border-slate-400"
                />{" "}
                <span className="font-semibold text-lg w-fit line-clamp-1 group-hover:text-white">
                {i?.displayName}
                </span>
              </Link>
            ))}

      </div>
    </main>
    :

    <span className="animate-pulse bg-slate-600 w-[100px] text-center text-white rounded-lg px-4 py-2">
        Fetching...
    </span>
    }
            </>
  );
};

export default FriendList;
