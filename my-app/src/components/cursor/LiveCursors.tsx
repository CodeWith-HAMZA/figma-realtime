import { LiveCursorProps } from "@/types/type";
import Cursor from "./Cursor";
import { Color } from "fabric";
import { COLORS } from "@/constants";

// Live Cursors empty component make
function LiveCursors({ others }:  LiveCursorProps) {
    // console.log(others);
    return (
        <>
            {others.map((other) => (
                <Cursor key={other.id} color={COLORS[Number(other.connectionId) % COLORS.length]} x={other.presence.x} y={other.presence.y} message={other.presence.message} />
            ))}
        </>
    )
}
 

export default LiveCursors;