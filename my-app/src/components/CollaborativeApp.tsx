"use client";

import { useOthers } from "@liveblocks/react/suspense";

export function CollaborativeApp() {
  const others = useOthers();
  const userCount = others.length;
  return <div>There are {JSON.stringify(others)} other user(s) online</div>;
}
