"use client";
import {
  RoomProvider,
  useBroadcastEvent,
  useEventListener,
  useMyPresence,
  useOthers,
} from "@liveblocks/react";
import React, { useState, useCallback, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/router";
import Cursor from "../components/cursor/Cursor";
import FlyingReaction from "../components/reactions/FlyingReaction";
import ReactionSelector from "../components/reactions/ReactionSelector";
import useInterval from "../hooks/useInterval";
import { Room } from "@/components/Room";
import { COLORS } from "@/constants/index";
import UserAvatars from "@/components/avatars/UserAvatars";
import { Canvas, Object } from "fabric";
import { handleCanvasMouseDown, handleResize, initializeFabric } from "@/lib/canvas";
import * as fabric from "fabric";

/**
 * This file shows how to create Live Cursors with a small chat and interactions
 *
 * Because it's a bit more advanced that others examples, it's implemented using typescript to ensure that we introduce less bug while maintaining it.
 * It also uses Tailwind CSS for the styling
 */

 
enum CursorMode {
  Hidden,
  Chat,
  ReactionSelector,
  Reaction,
}

type CursorState =
  | {
      mode: CursorMode.Hidden;
    }
  | {
      mode: CursorMode.Chat;
      message: string;
      previousMessage: string | null;
    }
  | {
      mode: CursorMode.ReactionSelector;
    }
  | {
      mode: CursorMode.Reaction;
      reaction: string;
      isPressed: boolean;
    };

type Reaction = {
  value: string;
  timestamp: number;
  point: { x: number; y: number };
};

type ReactionEvent = {
  x: number;
  y: number;
  value: string;
};

function Navbar() {
  return  <nav className="w-full h-12  flex items-center justify-between px-6 bg-white border-b border-gray-200 shadow-sm z-10 relative">
  {/* Left: Logo/Title */}
  <div className="flex items-center gap-2">
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="28" height="28" rx="6" fill="#6366F1"/>
      <text x="14" y="19" textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">F</text>
    </svg>
    <span className="font-semibold text-lg text-gray-800 tracking-tight select-none">Figma Realtime</span>
  </div>
  {/* Center: (optional, can add search or menu here) */}
  <div className="flex-1 flex justify-center">
    {/* Placeholder for center content if needed */}
  </div>
  {/* Right: User Avatars */}
  <div className="flex items-center gap-4">
    <UserAvatars />
  </div>
</nav> 
}

type LiveProps = {
  canvasRef?: React.MutableRefObject<HTMLCanvasElement | null>;
  fabricRef?: React.MutableRefObject<Canvas | null>;
  shapeRef?: React.MutableRefObject<Object | null>;
}

function Live({ canvasRef, fabricRef, shapeRef }: LiveProps) {
  const others = useOthers();
  const [{ cursor }, updateMyPresence] = useMyPresence();
  const broadcast = useBroadcastEvent();

  // cursor state (tracking for/of current user)
  const [state, setState] = useState<CursorState>({ mode: CursorMode.Hidden }); 

  // 
  const [reactions, setReactions] = useState<Reaction[]>([]);

  // Canvas initialization
  useEffect(() => {
    console.log('Live component - Canvas initialization started');
    console.log('Canvas ref in Live:', canvasRef?.current);
    console.log('Fabric ref in Live:', fabricRef);
    
    if (!canvasRef?.current) {
      console.log('Canvas ref not available in Live component');
      return;
    }
    
    if (!fabricRef) {
      console.log('Fabric ref not available in Live component');
      return;
    }
    
    console.log('Initializing canvas in Live component...');
    const canvas = initializeFabric({canvasRef, fabricRef});
    console.log('Canvas initialized in Live:', canvas);
    
    if (!canvas) {
      console.log('Canvas initialization failed in Live');
      return;
    }
    
    // Set canvas dimensions
    const container = document.getElementById('canvas');
    if (container) {
      canvas.setWidth(container.clientWidth);
      canvas.setHeight(container.clientHeight);
      console.log('Canvas dimensions set in Live:', container.clientWidth, container.clientHeight);
    }
    
    // Add direct event listeners to canvas element for debugging
    const canvasElement = canvasRef.current;
    if (canvasElement) {
      canvasElement.addEventListener('mousedown', (e) => {
        console.log('Direct mousedown event on canvas element in Live', e);
      });
      
      canvasElement.addEventListener('click', (e) => {
        console.log('Direct click event on canvas element in Live', e);
      });
    }
    
    canvas.on('after:render', () => {
      console.log('after:render in Live');
    })

    canvas.on('mouse:down', (options) => {
      console.log('mouse:down triggered in Live', options);
      
      // Simple test: create a rectangle on click
      const pointer = canvas.getPointer(options.e);
      console.log('Pointer position in Live:', pointer);
      
      const rect = new fabric.Rect({
        left: pointer.x,
        top: pointer.y,
        width: 100,
        height: 100,
        fill: 'red',
      });
      
      canvas.add(rect);
      canvas.renderAll();
      console.log('Rectangle added to canvas in Live');
    })

    canvas.on('mouse:up', () => {
      console.log('mouse:up in Live');
    })

    canvas.on('mouse:move', () => {
      console.log('mouse:move in Live');
    })

    canvas.on('mouse:over', () => {
      console.log('mouse:over in Live');
    })

    // Force a render to ensure canvas is visible
    canvas.renderAll();
    
    // Cleanup function
    return () => {
      if (fabricRef.current) {
        fabricRef.current.dispose();
      }
    };
  }, []);

  const setReaction = useCallback((reaction: string) => {
    setState({ mode: CursorMode.Reaction, reaction, isPressed: false });
  }, []);

  // Remove reactions that are not visible anymore (every 1 sec)
  useInterval(() => {
    setReactions((reactions) =>
      reactions.filter((reaction) => reaction.timestamp > Date.now() - 4000)
    );
  }, 1000);


  // kind of like throttling controlling
  useInterval(() => {
    console.log(' state', state)
    if (state.mode === CursorMode.Reaction && state.isPressed && cursor) {
      setReactions((reactions) =>
        reactions.concat([
          {
            point: { x: cursor.x, y: cursor.y },
            value: state.reaction,
            timestamp: Date.now(),
          },
        ])
      );

      // broadcast the reaction (sharing the reaction-value to all the users)
      broadcast({
        x: cursor.x,
        y: cursor.y,
        value: state.reaction,
      });
    }
  }, 100);

  useEffect(() => {
    function onKeyUp(e: KeyboardEvent) {
      if (e.key === "/") {
        setState({ mode: CursorMode.Chat, previousMessage: null, message: "" });
      } else if (e.key === "Escape") {
        updateMyPresence({ message: "" });
        setState({ mode: CursorMode.Hidden });
      } else if (e.key === "e") {
        setState({ mode: CursorMode.ReactionSelector });
      }
    }

    window.addEventListener("keyup", onKeyUp);

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "/") {
        e.preventDefault();
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keyup", onKeyUp);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [updateMyPresence]);

  useEventListener((eventData) => {
    const event = eventData.event as ReactionEvent;
    setReactions((reactions) =>
      reactions.concat([
        {
          point: { x: event.x, y: event.y },
          value: event.value,
          timestamp: Date.now(),
        },
      ])
    );
  });

  return (
    <> 
      <div
        className="h-screen w-full touch-none bg-neutral-800 overflow-hidden"
        style={{
          cursor:
            state.mode === CursorMode.Chat
              ? "none"
              : "url(cursor.svg) 0 0, auto",
        }}
        onPointerMove={(event) => {
          event.preventDefault();
          if (cursor == null || state.mode !== CursorMode.ReactionSelector) {
            updateMyPresence({
              cursor: {
                x: Math.round(event.clientX),
                y: Math.round(event.clientY),
              },
            });
          }
        }}
        onPointerLeave={() => {
          setState({
            mode: CursorMode.Hidden,
          });
          updateMyPresence({
            cursor: null,
          });
        }}
        onPointerDown={(event) => {
          updateMyPresence({
            cursor: {
              x: Math.round(event.clientX),
              y: Math.round(event.clientY),
            },
          });
          setState((state) =>
            state.mode === CursorMode.Reaction
              ? { ...state, isPressed: true }
              : state
          );
        }}
        onPointerUp={() => {
          setState((state) =>
            state.mode === CursorMode.Reaction
              ? { ...state, isPressed: false }
              : state
          );
        }}
        
        id="canvas"
      >
        {/* <Navbar /> */}
        <canvas 
          ref={canvasRef} 
          className=" h-full w-full border border-gray-300" 
          // style={{ 
          //   width: '100%', 
          //   height: '100%',
          //   display: 'block'
          // }}
        />
        {reactions.map((reaction) => {
          return (
            <FlyingReaction
              key={reaction.timestamp.toString()}
              x={reaction.point.x}
              y={reaction.point.y}
              timestamp={reaction.timestamp}
              value={reaction.value}
            />
          );
        })}
        {cursor && (
          <div
            className="absolute top-0 left-0"
            style={{
              transform: `translateX(${cursor.x}px) translateY(${cursor.y}px)`,
            }}
          >
            {state.mode === CursorMode.Chat && (
              <>
                <img src="cursor.svg" />

                <div
                  className="absolute top-5 left-2 bg-blue-500 px-4 py-2 text-sm leading-relaxed text-white"
                  onKeyUp={(e) => e.stopPropagation()}
                  style={{
                    borderRadius: 20,
                  }}
                >
                  {state.previousMessage && <div>{state.previousMessage}</div>}
                  <input
                    className="w-60 border-none	bg-transparent text-white placeholder-blue-300 outline-none"
                    autoFocus={true}
                    onChange={(e) => {
                      updateMyPresence({ message: e.target.value });
                      setState({
                        mode: CursorMode.Chat,
                        previousMessage: null,
                        message: e.target.value,
                      });
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        setState({
                          mode: CursorMode.Chat,
                          previousMessage: state.message,
                          message: "",
                        });
                      } else if (e.key === "Escape") {
                        setState({
                          mode: CursorMode.Hidden,
                        });
                      }
                    }}
                    placeholder={state.previousMessage ? "" : "Say something…"}
                    value={state.message}
                    maxLength={50}
                  />
                </div>
              </>
            )}
            {state.mode === CursorMode.ReactionSelector && (
              <ReactionSelector
                setReaction={(reaction) => {
                  setReaction(reaction);
                }}
              />
            )}
            {state.mode === CursorMode.Reaction && (
              <div className="pointer-events-none absolute top-3.5 left-1 select-none">
                {state.reaction}
              </div>
            )}
          </div>
        )}

        {others.map(({ connectionId, presence }) => {
          if (presence == null || !presence.cursor) {
            return null;
          }

          return (
            <Cursor
              key={connectionId}
              color={COLORS[connectionId % COLORS.length]}
              x={presence.cursor.x}
              y={presence.cursor.y}
              message={presence.message}
            />
          );
        })}

        {/* <>
        </> */}
      </div>
    </>
  );
}
// leftsidebar 
function LeftSidebar() {
  return (
    <div className="w-1/4">
      <div className="w-full h-full bg-gray-100">
        <h1>Left Sidebar</h1>
      </div>
    </div>
  )
}
// rightsidebar 
function RightSidebar() {
  return (
    <div className="w-1/4">
      <div className="w-full h-full bg-gray-100">
        <h1>Right Sidebar</h1>
      </div>
    </div>
  )
}
export default function Home() {

  // const [selectedTool, setSelectedTool] = useState<'select' | 'pencil' | 'eraser' | 'rectangle' | 'circle' | 'line' | 'text'>("select");
  const selectedTool = useRef<'select' | 'pencil' | 'eraser' | 'rectangle' | 'circle' | 'line' | 'text'>("select");

  const canvasRef = useRef<HTMLCanvasElement>(null); // for canvas element reference
  const [canvasReady, setCanvasReady] = useState(false);

  const fabricRef = useRef<Canvas | null>(null); // for operations performing on canvas
  const shapeRef = useRef<Object | null>(null); // for shape reference
  const selectedShapeRef = useRef<string>('rectangle'); // for selected shape reference

  // const [isDrawing, setIsDrawing] = useState(false);
  const isDrawing = useRef(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [isScaling, setIsScaling] = useState(false);

   // Handle window resize
   useEffect(() => {
    const handleWindowResize = () => {
      if (fabricRef.current) {
        // Import the handleResize function properly
        const { handleResize } = require("@/lib/canvas");
        handleResize({ canvas: fabricRef.current });
        console.log('Window resized');
      }
    };

    window.addEventListener('resize', handleWindowResize);
    
    return () => {
      window.removeEventListener('resize', handleWindowResize);
    };
   }, []);

  return (
    <Room>
      {/* Figma-like Navbar */}
       
      {/* Main content below navbar */}
      {/* left and right side bar and in bteween live compononte will render  */}
      <div className="flex">
         
        <LeftSidebar />
        <Live canvasRef={canvasRef} fabricRef={fabricRef} shapeRef={shapeRef} />
        <RightSidebar />
      </div>
    </Room>
  );
}
