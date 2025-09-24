import React from "react";

type Player = "X" | "O";
type Cell = Player | null;

type Props = {
  onWin?: (winner: Player | "draw" | null) => void;
  isActive?: boolean;
  onWinnerChange?: (winner: Player | "draw" | null) => void;
  onMove?: (cellIndex: number) => void;
  currentPlayer?: Player;
  boardIndex?: number;
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



export default function TicTacToe({ onWin, isActive = true, onWinnerChange, onMove, currentPlayer = "X", boardIndex = 0 }: Props) {
  const [state, setState] = React.useState<GameStateDTO | null>(null);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

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

  // Notify parent when result changes
  React.useEffect(() => {
    if (!state) return;
    
    let currentWinner: Player | "draw" | null = null;
    if (state.winner) currentWinner = state.winner;
    else if (state.is_draw) currentWinner = "draw";
    
    if (onWin && currentWinner) {
      onWin(currentWinner);
    }
    
    if (onWinnerChange) {
      onWinnerChange(currentWinner);
    }
  }, [state?.winner, state?.is_draw]);

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
    if (!state || loading || !isActive) return;
    // Light client-side guard to avoid noisy 400s:
    if (state.winner || state.is_draw || state.board[i] !== null) return;

    setLoading(true);
    setError(null);
    try {
      const next = await playMove(i);
      setState(next);
      // Notify parent/meta-game about the move so it can enforce board constraints
      if (onMove) onMove(i);
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
      {/* <div className="text-center mb-2 text-xl font-semibold">{status}</div> */}
      <div className="grid grid-cols-3 gap-2">
        {board.map((c, i) => (
          <button
            key={i}
            className="aspect-square rounded-2xl border-2 border-gray-800 text-3xl font-bold flex items-center justify-center disabled:opacity-50"
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