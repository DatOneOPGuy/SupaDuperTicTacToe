import React from "react";

type Player = "X" | "O";
type Winner = Player | "draw" | null;

type Props = {
  boardWinners: Winner[];
};

export default function MetaBoard({ boardWinners }: Props) {
  return (
    <div className="absolute left-8 top-31 transform -translate-y-1/2 z-10">
      <h3 className="text-base font-semibold mb-3 text-center text-gray-700">Meta Board</h3>
      <div className="grid grid-cols-3 gap-2 w-32 h-32">
        {boardWinners.map((c, i) => (
          <div
            key={i}
            className="aspect-square rounded-2xl border-2 border-gray-800 text-3xl font-bold flex items-center justify-center"
          >
            {c || ""}
          </div>
        ))}
      </div>
    </div>
  );
}
