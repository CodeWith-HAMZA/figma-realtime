// cursor component

import { LiveCursorProps } from "@/types/type";
import { LiveObject } from "@liveblocks/client";
import CursorSVG from "../../../public/assets/public/assets/CursorSVG";
 

const Cursor = ({  color, x, y, message }: { color: string, x: number, y: number, message: string }) => { 
    console.log(color, x, y, message);
    return (
        <div className="pointer-events-none absolute  " style={{
            transform: `translate(${x}px, ${y}px)`,
        }}>
            {/* <div className="w-4 h-4 bg-red-500 rounded-full" style={{ backgroundColor: color }}></div> */}
            <CursorSVG color={color} />
        </div>  
    )
};
export default Cursor;