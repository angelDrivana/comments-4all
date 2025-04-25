import React from "react"

interface UserCursorProps {
  position: { x: number; y: number }
  username: string
}

export const UserCursor: React.FC<UserCursorProps> = ({ position, username }) => {
  return (
    <div
      className="absolute pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)"
      }}
    >
      <div className="relative">
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          className="text-blue-500"
        >
          <path
            d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.500002 16.8829L0.500002 1.19841L11.7841 12.3673H5.65376Z"
            fill="currentColor"
            stroke="white"
          />
        </svg>
        
        <div className="absolute top-5 left-0 bg-blue-500 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
          {username}
        </div>
      </div>
    </div>
  )
} 