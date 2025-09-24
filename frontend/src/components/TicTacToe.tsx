import React, { useContext } from "react";
import { GameContext } from "@/App";

type Player = "X" | "O";
type Cell = Player | null;

type Props = {
  boardIndex: number;
  resetTrigger: number;
};

// ----- Backend DTOs -----
type GameStateDTO = {
  id: string;
  board: Cell[];
  winner: Player | null;
  is_draw: boolean;
  status: string;
};

// Prefer env, fallback to localhost:8000
const API_BASE =
  (import.meta as any)?.env?.VITE_API_URL?.replace(/\/$/, "") ??
  "http://localhost:8000";



export default function TicTacToe({ boardIndex, resetTrigger }: Props) {
  // Get context data
  const gameContext = useContext(GameContext);
  
  // Local state for this specific board
  const [state, setState] = React.useState<GameStateDTO | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Extract what we need from context
  const currentPlayer = gameContext?.currentPlayer || "X";
  const isActive = gameContext?.actions?.isBoardActive(boardIndex) || false;

  // Create a new game on mount
  React.useEffect(() => {
    let canceled = false;
    async function start() {
      setError(null);
      setLoading(true);
      try {
        const gs = await createGame();
        if (!canceled) setState(gs);
      } catch (e: any) {
        if (!canceled) setError(e?.message ?? "Failed to start game");
      } finally {
        if (!canceled) setLoading(false);
      }
    }
    start();
    return () => {
      canceled = true;
    };
  }, []);

  // Reset game when resetTrigger changes
  React.useEffect(() => {
    if (resetTrigger !== undefined) {
      reset();
    }
  }, [resetTrigger]);

  // Notify context when result changes
  React.useEffect(() => {
    if (!state || !gameContext) return;
    
    let currentWinner: Player | "draw" | null = null;
    if (state.winner) currentWinner = state.winner;
    else if (state.is_draw) currentWinner = "draw";
    
    // Update context with winner
    if (gameContext.actions?.setBoardWinner) {
      gameContext.actions.setBoardWinner(boardIndex, currentWinner);
    }
  }, [state?.winner, state?.is_draw, boardIndex, gameContext]);

  async function createGame(): Promise<GameStateDTO> {
    const r = await fetch(`${API_BASE}/tictactoe/new`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ starting_player: "X" }),
    });
    if (!r.ok) throw new Error(`Create failed: ${r.status}`);
    return r.json();
  }

  async function playMove(index: number): Promise<GameStateDTO> {
    if (!state) throw new Error("No game");
    const r = await fetch(`${API_BASE}/tictactoe/${state.id}/move`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ index, player: currentPlayer }),
    });
    if (!r.ok) {
      const detail = await r.json().catch(() => ({}));
      throw new Error(detail?.detail ?? `Move failed: ${r.status}`);
    }
    return r.json();
  }

  async function handleClick(i: number) {
    if (!state || loading || !gameContext) return;
    
    // Strict check: only allow moves on active boards
    if (!isActive) {
      console.log(`Board ${boardIndex} is not active, ignoring click`);
      return;
    }
    
    // Light client-side guard to avoid noisy 400s:
    if (state.winner || state.is_draw || state.board[i] !== null) return;

    setLoading(true);
    setError(null);
    try {
      const next = await playMove(i);
      setState(next);
      // Notify context about the move
      if (gameContext.actions?.handleMove) {
        gameContext.actions.handleMove(boardIndex, i);
      }
    } catch (e: any) {
      setError(e?.message ?? "Move failed");
    } finally {
      setLoading(false);
    }
  }

  async function reset() {
    setLoading(true);
    setError(null);
    try {
      const gs = await createGame();
      setState(gs);
    } catch (e: any) {
      setError(e?.message ?? "Failed to reset");
    } finally {
      setLoading(false);
    }
  }

  if (error) {
    return (
      <div className="max-w-sm mx-auto p-4">
        <div className="mb-2 text-red-600 font-semibold">Error: {error}</div>
        <button className="rounded-2xl px-4 py-2 border" onClick={reset}>
          Retry
        </button>
      </div>
    );
  }

  if (!state) {
    return (
      <div className="max-w-sm mx-auto p-4">
        <div className="text-center">Loading…</div>
      </div>
    );
  }

  const { board, status } = state;

  return (
    <div className="w-full p-4">
      <div className="grid grid-cols-3 gap-2">
        {board.map((c, i) => (
          <button
            key={i}
            className={`aspect-square rounded-2xl border-2 text-3xl font-bold flex items-center justify-center ${
              !isActive 
                ? 'border-gray-400 bg-gray-100 text-gray-400 cursor-not-allowed' 
                : 'border-gray-800 hover:bg-gray-50'
            } disabled:opacity-50`}
            onClick={() => handleClick(i)}
            aria-label={`cell-${i}`}
            disabled={loading || c !== null || state.winner !== null || state.is_draw || !isActive}
          >
            {c}
          </button>
        ))}
      </div>
       {/*
      <div className="text-center mt-3">
        <button className="rounded-2xl px-4 py-2 border" onClick={reset} disabled={loading}>
          New Game
        </button>
      </div>
      */}
    </div>
  );
}