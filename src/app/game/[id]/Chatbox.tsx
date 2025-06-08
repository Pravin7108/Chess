"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter,useParams } from "next/navigation";
import {app} from "../../../config/firebaseConfig";
import {getDatabase,ref,set,push,onValue, onDisconnect,serverTimestamp} from "firebase/database"


interface Data{
    params:string | null,decodedToken:{name:string,uid:string} | null;opponentOnline:boolean | null;lastSeen:number
}

const ChatBox = ({params,decodedToken,opponentOnline,lastSeen}:Data) => {

  const router = useRouter();
  const scrollRef:any = useRef(null);
  const [friendName,setFriedName] = useState('');

  useEffect(()=>{
    if(typeof window !== "undefined"){
      const friend:string = sessionStorage.getItem('friendName') || "";
      setFriedName(friend);
    }
  },[])
  

  const [array,setArray]=useState<any>([])

  const [messageText,setMessage] = useState('');



  const fetchData=async(roomId:string)=>{
    try {
        const db = getDatabase(app);
        const dbRef = ref(db,`chats/${roomId}/messages`);

        const allStatusRef = ref(db, '/status');

// onValue(allStatusRef, (snapshot) => {
//   const statuses = snapshot.val();
//   console.log(statuses);
  
//   setOnline(statuses[params.id]?.state)
// });

        const unsubscribe :any = onValue(dbRef,(snapshot)=>{
            if(snapshot.exists()){
                setArray(Object.values(snapshot.val()))
            }else{
                setArray([])
            }
        });
         return () => unsubscribe();
    } catch (error) {
        console.log(error)
    }
  }

  useEffect(()=>{
    fetchData('Bro')
    },[params])


  useEffect(()=>{
    if(array.length > 0){
        scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  },[array])
  



  const sendMessage = async (roomId: string,) => {
  setMessage('')
  const db = getDatabase(app);
  const messagesRef = ref(db, `chats/${roomId}/messages`);
  const newMsgRef = push(messagesRef);

  await set(newMsgRef, {
    sender:decodedToken?.name,
    userId:decodedToken?.uid,
    message:messageText.trim(),
    timestamp: Date.now()
  });

  fetchData(roomId)
};


const dateConstructor = lastSeen && new Date(lastSeen).toLocaleDateString('en-US',{day:"2-digit",month:"short",year:"numeric",hour:"2-digit",minute:"2-digit"})


  

  return (
    <div className="">
      <main className="w-[90%] px-3 relative lg:w-[50%] bg-purple-100 mx-auto overflow-hidden border border-slate-700 rounded-lg h-16 mb-4">
        <span className=" h-16 font-semibold flex flex-col mt-3">
          <span>
          {decodedToken?.name || "Waiting for opponent"} {decodedToken && <span className={`${opponentOnline ? "bg-green-500" : "bg-red-500"} px-2 rounded-xl font-light text-white text-xs `}>{opponentOnline ? "online" : "offline"}</span>}
          </span>

          {!opponentOnline && <span className="font-light text-xs">last seen on {dateConstructor || "..."}</span>}
           {/* {isOnline == "online" ? <span className="text-green-500"> - Online</span> : <span className="text-red-500">Offline</span>} */}
           
        </span>    

      </main>

      <main className="w-[90%] lg:w-[50%] bg-purple-100 mx-auto overflow-hidden border border-slate-700 rounded-lg ">
        <section className=" h-full relative w-full">

       <div className="p-2 pb-20 m-3 h-[75vh] overflow-auto no-scrollbar">
          
          
            {decodedToken && array.map((i:any,index:number)=>
            <div key={index} className={`${i.userId !== params ? "justify-start " : "justify-end "} my-4 flex`}>

                <div className={`${i.userId !== params ? "flex-row-reverse" : ""} gap-3 flex items-center max-w-[50%]`}>
                    
                <div className="flex flex-col gap-2">
                    <span className=" bg-white px-3 bg-gradient-to-tr from-blue-400 via-violet-400 text-white to-indigo-200 py-1 rounded-2xl text-sm">{i.message}</span>
                <sub className=" tracking-wider text-[10px]">{(new Date(i.timestamp).toLocaleTimeString())}</sub></div>
                <span className="rounded-full p-4 relative bg-blue-500 text-white">
                    <span title={i.sender} className="absolute -translate-x-[50%] top-1/2 -translate-y-[50%] left-[50%] select-none">{i?.sender?.slice(0,1)}</span>
                    </span>
                </div>
            </div>)}

                <div ref={scrollRef} />
        </div>




          <div  className="absolute border border-slate-700 -translate-x-[50%] overflow-hidden left-[50%] shadow-lg rounded-full w-[95%] bottom-5 lg:bottom-1 mx-auto">
            <div className="flex items-center justify-between bg-white">
              <input disabled={!decodedToken} onKeyDown={(e)=>{if(e.key === 'Enter'){sendMessage('Bro')}}} placeholder="Message..." value={messageText} onChange={(e)=>setMessage(e.target.value)} autoFocus className="placeholder:text-blue-300 border caret-blue-500 rounded-tl-full rounded-bl-full pl-5 py-3 focus:outline-none w-[90%] outlin-none border-none" />
              <svg role="button" onClick={()=>{decodedToken && sendMessage('Bro')}}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="size-7 mr-5  text-blue-500 cursor-pointer hover:text-blue-800"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
                />
              </svg>
            </div>

          </div>

        </section>
      </main>
    </div>
  );
};

export default ChatBox;
