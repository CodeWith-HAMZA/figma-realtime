"use client";

import { useOthers } from "@liveblocks/react/suspense";
import Live from "./Live";

export function CollaborativeApp() {
  const others = useOthers();
  const userCount = others.length;
  return <Live />
}
