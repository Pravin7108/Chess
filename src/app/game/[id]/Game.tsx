"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Chess } from "chess.js";
import { app } from "../../../config/firebaseConfig";
import {
  onValue,
  update,
  set,
  ref,
  getDatabase,
  serverTimestamp,
  onDisconnect,
  push,
} from "firebase/database";
import { Chessboard } from "react-chessboard";
import { useParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import ChatBox from "./Chatbox";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Game() {
  const { decodedToken }: any = useAuth();
  const db = getDatabase(app);
  const params: any = useParams();
  const [playerColor, setPlayerColor] = useState<"white" | "black" | any>(null);

  useEffect(()=>{
     if(typeof window !== 'undefined'){
      const color:any =  sessionStorage.getItem('color') || "black";
      setPlayerColor(color)
    }
 },[])

  const [chess, setChess] = useState(new Chess());
  const [movements, setMovements] = useState<any>([]);
  const [fen, setFen] = useState(chess.fen());

  const [opponentId, setOpponentId] = useState<string | null>(null);
  const [opponentOnline, setOpponentOnline] = useState<null | boolean>(null);
  const [lastSeen, setLastSeen] = useState("");
  const [opponentInfo, setOpponentInfo] = useState(null);

  useEffect(() => {
    const userRef = ref(db, `/status/${decodedToken?.user_id}`);
    const connRef = ref(db, ".info/connected");

    const offline = { state: "offline", last_changed: serverTimestamp() };
    const online = { state: "online", last_changed: serverTimestamp() };

    const unsub = onValue(connRef, (s) => {
      if (s.val() === false) return;
      onDisconnect(userRef)
        .set(offline)
        .then(() => set(userRef, online));
    });

    return () => {
      set(userRef, offline); // mark offline on unmount
      unsub();
    };
  }, [decodedToken?.user_id]);

  /* 2. subscribe to game node – grabs FEN + players */
  /* 2. subscribe to game node – grabs FEN + players */
  useEffect(() => {
    if (!decodedToken?.user_id) return;

    const uid = decodedToken.user_id;
    const name = decodedToken.name || "Player"; // or get it from somewhere else
    const gRef = ref(db, `games/${params.id}`);

    const unsub = onValue(gRef, async (snap) => {
      const data = snap.val();
      if (!data) return;

      // ----------- FEN Sync -----------
      if (data.fen && data.fen !== chess.fen()) {
        const clone = new Chess();
        clone.load(data.fen);
        setChess(clone);
        setFen(clone.fen());
      }

      // ----------- Player Joining -----------
      const players = data.players ?? {};
      let white = players.white;
      let black = players.black;

      // Assign seat if available
      if (!white && !black) {
        await set(ref(db, `games/${params.id}/players/white`), {
          uid,
          name,
        });
        white = { uid, name };
      } else if (white && !black && white.uid !== uid) {
        await set(ref(db, `games/${params.id}/players/black`), {
          uid,
          name,
        });
        black = { uid, name };
      } else if (black && !white && black.uid !== uid) {
        await set(ref(db, `games/${params.id}/players/white`), {
          uid,
          name,
        });
        white = { uid, name };
      }

      // ----------- Set Local Color + Opponent -----------
      if (white?.uid === uid) {
        // setPlayerColor("white");
        setOpponentId(black?.uid || null);
        setOpponentInfo(black || null); // store full object
      } else if (black?.uid === uid) {
        // setPlayerColor("black");
        setOpponentId(white?.uid || null);
        setOpponentInfo(white || null); // store full object
      }
    });

    return unsub;
  }, [params.id, decodedToken?.user_id, chess]);

  /* 3. opponent presence listener (runs when we know the id) */
  useEffect(() => {
    if (!opponentId) return;
    const oppRef = ref(db, `/status/${opponentId}`);

    const unsub = onValue(oppRef, (snap) => {
      const data = snap.val();

      setOpponentOnline(data?.state === "online");
      setLastSeen(data?.last_changed);
    });

    return unsub;
  }, [opponentId]);

  /* 4. make a move */
  const handleDrop = useCallback(
    (sourceSquare: any, targetSquare: any, thePiece: any) => {
      if (chess.turn() == playerColor?.slice(0, 1)) {
        const clone = new Chess(chess.fen());
        const move = clone.move({
          from: sourceSquare,
          to: targetSquare,
          promotion:
            thePiece === "Q"
              ? "q"
              : thePiece === "N"
              ? "n"
              : thePiece === "B"
              ? "b"
              : "r",
        });
        if (!move) return false;

        setChess(clone);
        setFen(clone.fen());
        setMovements((prev: any) => [...prev, move.san]);

        set(ref(db, `games/${params.id}/fen`), clone.fen());

        return true;
      } else {
        return false;
      }
    },
    [chess, params.id, playerColor]
  );

  const getGameStatus = () => {
    if (chess.game_over()) {
      if (chess.in_checkmate()) return "Checkmate !";
      if (chess.in_stalemate()) return "Stalemate !";
      if (chess.in_draw()) return "Draw !";

      sessionStorage.clear();
      return "Game Over";
    }

    if (chess.in_check()) return "Check !";

    return `${chess.turn() === "w" ? "White" : "Black"}'s move`;
  };

  // const Drop = useCallback(
  //   (sourceSquare: any, targetSquare: any,piece:any) => {
  //     const thePiece = piece.slice(1);
  //         const clone = new Chess(chess.fen());

  //     try {
  //       const move = chess.move({
  //         from: sourceSquare,
  //         to: targetSquare,
  //         promotion: thePiece === "Q" ? "q" : thePiece === "N" ? "n" : thePiece === "B" ? "b" :"r",
  //       });

  //       if (move) {
  //         setChess(new Chess(chess.fen()));
  //         const notation = `${move.san}`;
  //         setMovements((prev: any) => [...prev, notation]);

  //     setChess(clone);
  //     setFen(clone.fen());
  //      push(ref(db, `games/${params.id}/moves`), move.san); // SAN notation list
  //     set(ref(db, `games/${params.id}/fen`), clone.fen());

  //         return true;
  //       }
  //     } catch (error) {
  //       return false;
  //     }

  //     return true;
  //   },
  //   [chess]
  // );

  useEffect(() => {
    const movesRef = ref(db, `games/${params.id}/moves`);
    const unsubscribe = onValue(movesRef, (snapshot) => {
      const data = snapshot.val();
      if (!data) {
        setMovements([]);
      } else {
        const moveList = Object.values(data);
        setMovements(moveList as string[]);
      }
    });

    return () => unsubscribe();
  }, [params.id]);

  useEffect(() => {
    const handlePop = () => {
      history.pushState(null, "", location.href);
    };

    const handleUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
      // window.location.replace('/');sessionStorage.clear()
    };

    history.pushState(null, "", location.href);
    window.addEventListener("popstate", handlePop);
    window.addEventListener("beforeunload", handleUnload);

    return () => {
      window.removeEventListener("popstate", handlePop);
      window.removeEventListener("beforeunload", handleUnload);
    };
  }, []);

  const [opening, setOpening] = useState<number>(2);

  useEffect(() => {
    const time = setTimeout(() => {
      if (opening !== 0) {
        setOpening((prev) => prev - 1);
      }
    }, 1000);

    return () => clearTimeout(time);
  }, [opening]);

  const gameRef = ref(db, `games/${params.id}/fen`);
  useEffect(() => {
    const unsubscribe = onValue(gameRef, (snapshot) => {
      const newFen = snapshot.val();
      if (newFen && newFen !== chess.fen()) {
        chess.load(newFen);
        setChess(new Chess());
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    alert("Game ID copied");
  };

  const Load = () => {
    return (
      <>
        <main
          className={`transform absolute z-20  inset-x-0 ${
            opening == 0 ? "-translate-y-full" : "translate-y-0 "
          } duration-300 ease-in-out flex items-center justify-center h-screen bg-blue-200 bg-opacity-25`}
        >
          <div className="border-2 border-blue-100 bg-blue-100/50 shadow-lg shadow-blue-500 rounded-xl py-20 px-40">
            <span className="lg:text-lg font-semibold select-none">
              Welcome to Pravin's Chess
            </span>
          </div>
        </main>
      </>
    );
  };

  return (
    <main className="relative">
      {Load()}
      <div className="absolute inset-0 bg-[url('/king.jpg')] bg-no-repeat bg-center bg-cover z-10" />
     <div className="absolute inset-0 bg-[#242424] bg-opacity-75 z-10" />
    
    
      <div
        className={`bg-blue-200 bg-opacity-25 h-screen py-3 gap-5 flex lg:block flex-col justify-center items-center
    transition-opacity duration-300 z-20 ${
      opening === 0 ? "opacity-100" : "opacity-0 pointer-events-none"
    }`}
      >
        <div className="flex flex-col gap-5 lg:flex-row  z-20 ">
          <main className="lg:w-1/2  z-20 ">
            <div className="flex justify-center items-center gap-5 h-[40px]  z-20 ">
              <span
                className={
                  !chess.game_over()
                    ? "bg-[#000] text-center text-white py-2 px-1 rounded w-[150px]"
                    : "font-bold bg-slate-200 animate-pulse text-center text-red-500 py-2 px-1 rounded w-[150px]"
                }
              >
                {getGameStatus()}
              </span>
              <span className="flex items-center text-white gap-2">
                Game ID - {params.id}{" "}
                <svg
                  onClick={() => handleCopy(params.id)}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-4 text-blue-500"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z"
                  />
                </svg>
              </span>
            </div>

            <div className=" lg:w-[70%] mx-auto mt-5">
              <Chessboard
                boardOrientation={playerColor}
                onPieceDrop={handleDrop}
                position={fen}
                customBoardStyle={{
                  borderRadius: "5px",
                  boxShadow: "0 3px 10px #000000",
                }}
                customLightSquareStyle={{ background: "#ffffff" }}
                customDarkSquareStyle={{
                  backgroundColor: "rgb(129, 125, 125)",
                }}
              />
            </div>
          </main>

          <main className="hidden lg:block lg:w-1/2  z-20 ">
            <ChatBox
              params={opponentId}
              decodedToken={opponentInfo}
              opponentOnline={opponentOnline}
              lastSeen={parseFloat(lastSeen)}
            />
          </main>

          <div className="lg:hidden  z-20 ">
            <Sheet>
              <SheetTrigger asChild>
                <button className="flex items-center gap-2 mx-2">
                  Chat with your opponent{" "}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="size-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.25 12.76c0 1.6 1.123 2.994 2.707 3.227 1.068.157 2.148.279 3.238.364.466.037.893.281 1.153.671L12 21l2.652-3.978c.26-.39.687-.634 1.153-.67 1.09-.086 2.17-.208 3.238-.365 1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0 0 12 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018Z"
                    />
                  </svg>
                </button>
              </SheetTrigger>
              <SheetContent className="h-screen w-screen rounded-none shadow-none">
                <ChatBox
                  params={opponentId}
                  decodedToken={opponentInfo}
                  opponentOnline={opponentOnline}
                  lastSeen={parseFloat(lastSeen)}
                />
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* <main className="lg:w-1/2">
          <div className="h-[45vh] lg:h-[90vh] overflow-auto  lg:w-[80%]">
            <table className="w-full">
              <thead className="text-center sticky top-0">
                <tr>
                  <td className="bg-gray-500 py-2 text-white">White</td>
                  <td className="bg-gray-500 py-2 text-white">Black</td>
                </tr>
              </thead>

              <tbody className="text-center">
                {movements
                  ?.reduce((rows: string[][], move: string, index: number) => {
                    if (index % 2 === 0) {
                      rows.push([move]);
                    } else {
                      rows[rows.length - 1].push(move);
                    }
                    return rows;
                  }, [])
                  .map((row: any, rowIndex: number) => (
                    <tr key={rowIndex}>
                      <td className="border border-slate-500 py-2">{row[0]}</td>
                      <td className="border border-slate-500 py-2">
                        {row[1]}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </main> */}

        <div className="flex justify-center  z-20 ">
          <button
            onClick={() => {
              window.location.replace("/");
              sessionStorage.clear();
            }}
            className="text-white bg-red-500 p-1  z-20  px-2 rounded"
          >
            Exit
          </button>
        </div>
      </div>
    </main>
  );
}
