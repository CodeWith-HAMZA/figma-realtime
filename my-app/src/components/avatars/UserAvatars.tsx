import React from "react";
import { useOthers, useSelf, useUpdateMyPresence } from "@liveblocks/react";

// Helper to get initials from a name
function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export default function UserAvatars() {
  // Get info about other users in the room
  const others = useOthers();
  // Optionally, include yourself
  const self = useSelf();

  const updateMyPresence = useUpdateMyPresence();

  // Combine self and others for the avatar stack
  const users = [
    ...(self ? [self] : []),
    ...others,
  ];

  // Example: set presence on mount
  React.useEffect(() => {
    updateMyPresence({
      name: "Alice",
      avatar: "https://i.pravatar.cc/150?u=alice", // or your avatar URL
    });
  }, [updateMyPresence]);

  return (
    <div style={{ display: "flex", alignItems: "center" }}>
      {users.map((user, idx) => {
        // You can store avatar info in presence, e.g. user.presence.avatar
        const avatarUrl = user.presence?.avatar;
        const name = user.presence?.name || "User";
        return (
          <div
            key={user.connectionId}
            style={{
              width: 32,
              height: 32,
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid white",
              marginLeft: idx === 0 ? 0 : -12,
              background: "#eee",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: "bold",
              fontSize: 14,
              boxShadow: "0 0 0 1px #ccc",
            }}
            title={name}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span>{getInitials(name)}</span>
            )}
          </div>
        );
      })}
    </div>
  );
} 