// 
import { CursorMode } from "@/types/type";
import CursorSVG from "../../../public/assets/public/assets/CursorSVG";

function CursorChat({ myPresence, setCursorState, setMyPresence, cursorState }: { myPresence: any, setCursorState: any, setMyPresence: any, cursorState: any }) {
    console.log(myPresence, setCursorState, setMyPresence, cursorState)
    return (
        <div className="absolute top-0 left-0 w-full h-full bg-blue" style={{
            transform: `translate(${myPresence.cursor.x}px, ${myPresence.cursor.y}px)`,
        }}>
         <>
            
            <CursorSVG color={'#000'} />
            <div className="absolute top-0   left-0 w-full h-full bg-blue-500 px-4 py-2 rounded-md" >
            {/* previous message */}
            {
                cursorState?.previousMessage && (
                    <div>
                        <p>{cursorState.previousMessage}</p>
                    </div>
                )
            }

                <input type="text" className="w-full h-full bg-white" />
                </div>
        
        </> 

        {cursorState.mode === CursorMode.Chat && <div className="w-full h-full bg-black" />}
        {cursorState.mode === CursorMode.ReactionSelector && <div className="w-full h-full bg-black" />}
        {cursorState.mode === CursorMode.Reaction && <div className="w-full h-full bg-black" />}
        </div>
    )
}

export default CursorChat;