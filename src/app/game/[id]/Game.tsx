"use client";
import React, { useCallback, useEffect, useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";

export default function Game() {

  const [windowLoaded,setWindowLoaded] = useState<Boolean>(false);

  useEffect(()=>{
    if(typeof window !== 'undefined'){
      setWindowLoaded(true)
    }
  },[])

  const [chess, setChess] = useState(new Chess());
  const [movements, setMovements] = useState<any>([]);

  const getGameStatus = () => {
    if (chess.game_over()) {
      if (chess.in_checkmate()) return "Checkmate !";
      if (chess.in_stalemate()) return "Stalemate !";
      if (chess.in_draw()) return "Draw !";

      return "Game Over";
    }

    if (chess.in_check()) return "Check !";

    return `${chess.turn() === "w" ? "White" : "Black"}'s move`;
  };

  const Drop = useCallback(
    (sourceSquare: any, targetSquare: any,piece:any) => {
      const thePiece = piece.slice(1);
      
      try {
        const move = chess.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: thePiece === "Q" ? "q" : thePiece === "N" ? "n" : thePiece === "B" ? "b" :"r",
        });

        if (move) {
          setChess(new Chess(chess.fen()));
          const notation = `${move.san}`;
          setMovements((prev: any) => [...prev, notation]);

          return true;
        }
      } catch (error) {
        return false;
      }

      return true;
    },
    [chess]
  );

  useEffect(()=>{

    const handlePop=()=>{
      history.pushState(null,'',location.href);
    };
    
    const handleUnload=(event:BeforeUnloadEvent)=>{
      event.preventDefault();
      event.returnValue = ''
    };
    
    history.pushState(null,'',location.href);
    window.addEventListener("popstate",handlePop);
    window.addEventListener("beforeunload",handleUnload);

    return ()=>{
      window.removeEventListener('popstate',handlePop);
      window.removeEventListener('beforeunload',handleUnload);
    }
  },[])

  const Undo = () => {
    chess.undo()
  };

  const [opening,setOpening] = useState<number>(2);

  useEffect(()=>{
    const time = setTimeout(()=>{
      if(opening !== 0){
        setOpening(prev=>prev-1)
      }
    },1000);

    return ()=>clearTimeout(time);
  },[opening])



  const Load=()=>{
    return (
      <>
      <main className={`transform absolute z-20  inset-x-0 ${(opening == 0) ? "-translate-y-full" : "translate-y-0 "} duration-300 ease-in-out flex items-center justify-center h-screen bg-blue-200 bg-opacity-25`}>
        <div className="border-2 border-blue-100 bg-blue-100/50 shadow-lg shadow-blue-500 rounded-xl py-20 px-40">
        <span className="text-lg font-semibold select-none">Welcome to Pravin's Chess</span>
        </div>
      </main>
      </>
    )
  }

  return (
    <main className="relative">
    {Load()}
    <div
  className={`bg-blue-200 bg-opacity-25 h-full py-3 flex flex-col lg:flex-row lg:justify-center
    transition-opacity duration-300 ${opening === 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
>

        <main className="lg:w-1/2">
          <div className="flex justify-center h-[40px]">
            <span
              className={
                !chess.game_over()
                  ? "bg-[#000] text-center text-white py-2 px-1 rounded w-[150px]"
                  : "font-bold bg-slate-200 animate-pulse text-center text-red-500 py-2 px-1 rounded w-[150px]"
              }
            >
              {getGameStatus()}
            </span>
          </div>

          <div className=" lg:w-[70%] mx-auto mt-5">
            <Chessboard
              boardOrientation={chess.turn() === "b" ? 'black' : "white"}
              arePremovesAllowed
              onPieceDrop={Drop}
              position={chess.fen()}
              customBoardStyle={{
                borderRadius: "5px",
                boxShadow: "0 3px 10px #000000",
              }}
              customLightSquareStyle={{ background: "#ffffff" }}
              customDarkSquareStyle={{ backgroundColor: "rgb(129, 125, 125)" }}
            />
          </div>

          <div className="ml-10 mt-4 space-x-3">
            <button
              onClick={() => {
                setChess(new Chess());
                setMovements([]);
              }}
              className="border-2 border-slate-500 rounded px-4 hover:font-semibold w-[80px] hover:text-red-500"
            >
              RESET
            </button>
            <button
              onClick={() => {
                Undo();
              }}
              className="border-2 border-slate-500 rounded px-4 hover:font-semibold w-[80px]"
            >
              UNDO
            </button>
          </div>
        </main>

        <main className="lg:w-1/2">
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
        </main>
      </div>
    </main>
  );

}
