import TicTacToe from "@/components/TicTacToe";
import MetaBoard from "@/components/MetaBoard";
import { useState, useCallback, useMemo, createContext, useContext, ReactNode } from "react";

type Player = "X" | "O";
type Winner = Player | "draw" | null;

// Context for sharing game state
interface GameContextType {
  boardWinners: (Winner)[];
  currentPlayer: Player;
  requiredBoard: number | null;
  metaWinner: Winner;
  resetTrigger: number;
  actions: {
    setBoardWinner: (boardIndex: number, winner: Winner) => void;
    setCurrentPlayer: (player: Player) => void;
    setRequiredBoard: (boardIndex: number | null) => void;
    resetGame: () => void;
    handleMove: (boardIndex: number, cellIndex: number) => void;
    isBoardActive: (boardIndex: number) => boolean;
  };
}

export const GameContext = createContext<GameContextType | undefined>(undefined);

// Custom hook to use the context
function useGameContext() {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGameContext must be used within a GameProvider');
  }
  return context;
}

// Provider component that wraps the game
function GameProvider({ children }: { children: ReactNode }) {
  // All the existing state logic
  const [boardWinners, setBoardWinners] = useState<(Winner)[]>([
    null, null, null, null, null, null, null, null, null
  ]);
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  const [requiredBoard, setRequiredBoard] = useState<number | null>(null);
  const [resetTrigger, setResetTrigger] = useState(0);

  // Compute meta-winner from board winners
  const metaWinner: Winner = useMemo(() => {
    const WINS = [
      [0,1,2],[3,4,5],[6,7,8],
      [0,3,6],[1,4,7],[2,5,8],
      [0,4,8],[2,4,6]
    ];
    for (const [a,b,c] of WINS) {
      const va = boardWinners[a];
      if (va && va !== "draw" && va === boardWinners[b] && va === boardWinners[c]) {
        return va;
      }
    }
    if (boardWinners.every(w => w !== null)) return "draw";
    return null;
  }, [boardWinners]);

  const handleWinnerChange = useCallback((boardIndex: number, winner: Winner) => {
    setBoardWinners(prev => {
      const next = [...prev];
      next[boardIndex] = winner;
      return next;
    });
    
    // Handle the circular constraint case
    if (winner !== null && requiredBoard === boardIndex) {
      setRequiredBoard(null);
    }
  }, [requiredBoard]);

  const handleMove = useCallback((boardIndex: number, cellIndex: number) => {
    if (requiredBoard !== null && requiredBoard !== boardIndex) return;

    const targetBoard = cellIndex;
    if (boardWinners[targetBoard] !== null) {
      setRequiredBoard(null);
    } else {
      setRequiredBoard(targetBoard);
    }
    setCurrentPlayer(p => (p === "X" ? "O" : "X"));
  }, [requiredBoard, boardWinners]);

  const isBoardActive = useCallback((index: number) => {
    if (metaWinner) return false;
    if (boardWinners[index] !== null) return false;
    if (requiredBoard === null) return true;
    const isActive = requiredBoard === index;
    console.log(`Board ${index}: requiredBoard=${requiredBoard}, isActive=${isActive}`);
    return isActive;
  }, [requiredBoard, boardWinners, metaWinner]);

  const resetGame = useCallback(() => {
    setBoardWinners([null, null, null, null, null, null, null, null, null]);
    setCurrentPlayer("X");
    setRequiredBoard(null);
    setResetTrigger(prev => prev + 1);
  }, []);

  const contextValue: GameContextType = {
    boardWinners,
    currentPlayer,
    requiredBoard,
    metaWinner,
    resetTrigger,
    actions: {
      setBoardWinner: handleWinnerChange,
      setCurrentPlayer,
      setRequiredBoard,
      resetGame,
      handleMove,
      isBoardActive
    }
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

// Main App component that uses context
function AppContent() {
  const { boardWinners, currentPlayer, requiredBoard, metaWinner, resetTrigger, actions } = useGameContext();

  return (
    <div className="min-h-screen p-8 relative">
      {/* Meta Board */}
      <MetaBoard boardWinners={boardWinners} />
      {metaWinner && (
        <div className="text-center my-4">
          <div className="text-xl font-bold mb-4">Meta Winner: {metaWinner}</div>
          <button 
            onClick={actions.resetGame}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            New Game
          </button>
        </div>
      )}
      {!metaWinner && (
        <div className="text-center my-4 text-xl font-bold">
          Current Player: {currentPlayer}
          {requiredBoard !== null && (
            <div className="text-lg text-blue-600 mt-2">
              Must play in board {requiredBoard + 1}
            </div>
          )}
          {requiredBoard === null && (
            <div className="text-lg text-green-600 mt-2">
              Can play in any available board
            </div>
          )}
          <div className="mt-4">
            <button 
              onClick={actions.resetGame}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Reset Game
            </button>
          </div>
        </div>
      )}
      
      {/* Main 3x3 TicTacToe Grid */}
      <div className="grid grid-cols-3 max-w-2xl mx-auto">
        {/* Row 1 */}
        <div className={`border-gray-800 border-r-8 border-b-8 ${requiredBoard === 0 ? 'bg-blue-100' : actions.isBoardActive(0) ? 'bg-green-50' : 'bg-gray-50'}`}>
          <TicTacToe 
            boardIndex={0}
            resetTrigger={resetTrigger}
          />
        </div>
        <div className={`border-gray-800 border-r-8 border-b-8 ${requiredBoard === 1 ? 'bg-blue-100' : actions.isBoardActive(1) ? 'bg-green-50' : 'bg-gray-50'}`}>
          <TicTacToe 
            boardIndex={1}
            resetTrigger={resetTrigger}
          />
        </div>
        <div className={`border-gray-800 border-b-8 ${requiredBoard === 2 ? 'bg-blue-100' : actions.isBoardActive(2) ? 'bg-green-50' : 'bg-gray-50'}`}>
          <TicTacToe 
            boardIndex={2}
            resetTrigger={resetTrigger}
          />
        </div>
        
        {/* Row 2 */}
        <div className={`border-gray-800 border-r-8 border-b-8 ${requiredBoard === 3 ? 'bg-blue-100' : actions.isBoardActive(3) ? 'bg-green-50' : 'bg-gray-50'}`}>
          <TicTacToe 
            boardIndex={3}
            resetTrigger={resetTrigger}
          />
        </div>
        <div className={`border-gray-800 border-r-8 border-b-8 ${requiredBoard === 4 ? 'bg-blue-100' : actions.isBoardActive(4) ? 'bg-green-50' : 'bg-gray-50'}`}>
          <TicTacToe 
            boardIndex={4}
            resetTrigger={resetTrigger}
          />
        </div>
        <div className={`border-gray-800 border-b-8 ${requiredBoard === 5 ? 'bg-blue-100' : actions.isBoardActive(5) ? 'bg-green-50' : 'bg-gray-50'}`}>
          <TicTacToe 
            boardIndex={5}
            resetTrigger={resetTrigger}
          />
        </div>
        
        {/* Row 3 */}
        <div className={`border-gray-800 border-r-8 ${requiredBoard === 6 ? 'bg-blue-100' : actions.isBoardActive(6) ? 'bg-green-50' : 'bg-gray-50'}`}>
          <TicTacToe 
            boardIndex={6}
            resetTrigger={resetTrigger}
          />
        </div>
        <div className={`border-gray-800 border-r-8 ${requiredBoard === 7 ? 'bg-blue-100' : actions.isBoardActive(7) ? 'bg-green-50' : 'bg-gray-50'}`}>
          <TicTacToe 
            boardIndex={7}
            resetTrigger={resetTrigger}
          />
        </div>
        <div className={`border-gray-800 ${requiredBoard === 8 ? 'bg-blue-100' : actions.isBoardActive(8) ? 'bg-green-50' : 'bg-gray-50'}`}>
          <TicTacToe 
            boardIndex={8}
            resetTrigger={resetTrigger}
          />
        </div>
      </div>
    </div>
  );
}

// Export the App with Provider wrapper
export default function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

