'use client'
import { LiveblocksProvider, useMyPresence, useOthers  } from "@liveblocks/react";
import { LIVE_BLOCKS_PUBLIC_KEY } from "@/constants/config";
import LiveCursors from "./cursor/LiveCursors";
import { useCallback, useState } from "react";
import CursorChat from "./cursor/CursorChat";
import { CursorMode } from "@/types/type";

const Live = () => { 
    const others = useOthers();
    const [myPresence, setMyPresence] = useMyPresence()
     
    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault();
        // e.stopPropagation();
        const x = e.clientX -  e.currentTarget.getBoundingClientRect().x
        const y = e.clientY -  e.currentTarget.getBoundingClientRect().y
        console.log(x, y)
        setMyPresence({
            x: e.clientX - 40 ,
            y: e.clientY  ,
            message: "Hello"
        })
    }, [])
    const [cursorState, setCursorState] = useState( {
        mode: CursorMode.Hidden,
        message: null,
        x: 0,
        y: 0,
    })

    const handleMouseLeave = useCallback(() => {
        setMyPresence({
            cursor: null,
            message: null,
         })

         setCursorState({
            mode: CursorMode.Hidden,
            message: null,
            x: 0,
            y: 0,
         })
    }, [])
    const handleMouseEnter = useCallback(() => {
        setMyPresence({
            cursor: {
                x: 0,
                y: 0,
                message: "Hello"
            }
        })
    }, [])
    return (
        <div onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} className="min-h-screen  bg-black">
            {/* <div onMouseMove={handleMouseMove}> */}
        {myPresence?.cursor && <CursorChat myPresence={myPresence} setCursorState={setCursorState} setMyPresence={setMyPresence} cursorState={cursorState} />}
        <LiveCursors others={others} />
            </div>
        
    )
 };

export default Live;