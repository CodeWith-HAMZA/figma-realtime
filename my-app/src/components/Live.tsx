"use client";
import {
  LiveblocksProvider,
  useBroadcastEvent,
  useMyPresence,
  useOthers,
} from "@liveblocks/react";
import { LIVE_BLOCKS_PUBLIC_KEY } from "@/constants/config";
import LiveCursors from "./cursor/LiveCursors";
import { useCallback, useState } from "react";
import CursorChat from "./cursor/CursorChat";
import { CursorMode, CursorState } from "@/types/type";

const Live = () => {
  const others = useOthers();
  const [myPresence, setMyPresence] = useMyPresence();
  const broadcast = useBroadcastEvent();
  // track cursor state for current user
  const [cursorState, setCursorState] = useState({
    mode: CursorMode.Hidden,
    message: null,

    x: 0,
    y: 0,
  });

  // handle mouse move event
  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    // e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();

    const x = e.clientX - rect.x;
    const y = e.clientY - rect.y;
    console.log(x, y);

    // updating the state for all the users (sharing current-)
    setMyPresence({
      x: e.clientX - 40,
      y: e.clientY,
      message: "Hello",
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    setMyPresence({
      cursor: null,
      message: null,
    });

    setCursorState({
      mode: CursorMode.Hidden,
      message: null,
      x: 0,
      y: 0,
    });
  }, []);
  const handleMouseEnter = useCallback(() => {
    setMyPresence({
      cursor: {
        x: 0,
        y: 0,
        message: "Hello",
      },
    });
  }, []);
  return (
    <div
      onPointerMove={handleMouseMove}
      onPointerLeave={handleMouseLeave}
      className="min-h-screen bg-black"
    > 
      {myPresence?.cursor && (
        <CursorChat
          myPresence={myPresence}
          setCursorState={setCursorState}
          setMyPresence={setMyPresence}
          cursorState={cursorState}
        />
      )}
    />
      <LiveCursors others={others} />
    </div>
  );
};

export default Live;
