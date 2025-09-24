import TicTacToe from "@/components/TicTacToe";
import MetaBoard from "@/components/MetaBoard";
import { useState, useCallback, useMemo } from "react";

type Player = "X" | "O";
type Winner = Player | "draw" | null;

export default function App() {
  // Per-board winners (meta-board inputs)
  const [boardWinners, setBoardWinners] = useState<(Winner)[]>([
    null, null, null, null, null, null, null, null, null
  ]);

  // Frontend-only turn and constraint state
  const [currentPlayer, setCurrentPlayer] = useState<Player>("X");
  // null = any board; otherwise forced board index 0..8
  const [requiredBoard, setRequiredBoard] = useState<number | null>(null);
  
  // Reset trigger to reset all individual boards
  const [resetTrigger, setResetTrigger] = useState(0);

  // Reset the entire game
  const resetGame = useCallback(() => {
    setBoardWinners([null, null, null, null, null, null, null, null, null]);
    setCurrentPlayer("X");
    setRequiredBoard(null);
    setResetTrigger(prev => prev + 1); // Increment to trigger reset in all boards
  }, []);

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
    
    // Handle the circular constraint case: if a board is won and the required board
    // is the same as the board that was just won, then allow free play
    if (winner !== null && requiredBoard === boardIndex) {
      setRequiredBoard(null);
    }
  }, [requiredBoard]);

  // After a successful local move (already validated by disabling UI),
  // update required board and switch player.
  const handleMove = useCallback((boardIndex: number, cellIndex: number) => {
    // Enforce: ignore moves on non-required boards (should be disabled anyway)
    if (requiredBoard !== null && requiredBoard !== boardIndex) return;

    const targetBoard = cellIndex;
    // If target board is finished, open all boards; else constrain to that board
    if (boardWinners[targetBoard] !== null) {
      setRequiredBoard(null);
    } else {
      setRequiredBoard(targetBoard);
    }
    setCurrentPlayer(p => (p === "X" ? "O" : "X"));
  }, [requiredBoard, boardWinners]);

  // Is a board clickable this turn?
  const isBoardActive = useCallback((index: number) => {
    if (metaWinner) return false; // game over
    if (boardWinners[index] !== null) return false; // finished board
    if (requiredBoard === null) return true; // free choice
    return requiredBoard === index; // constrained
  }, [requiredBoard, boardWinners, metaWinner]);
  return (
    <div className="min-h-screen p-8 relative">
      {/* Meta Board */}
      <MetaBoard boardWinners={boardWinners} />
      {metaWinner && (
        <div className="text-center my-4">
          <div className="text-xl font-bold mb-4">Meta Winner: {metaWinner}</div>
          <button 
            onClick={resetGame}
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
              onClick={resetGame}
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
        <div className={`border-gray-800 border-r-8 border-b-8 ${requiredBoard === 0 ? 'bg-blue-100' : isBoardActive(0) ? 'bg-green-50' : 'bg-gray-50'}`}>
          <TicTacToe 
            isActive={isBoardActive(0)} 
            onWinnerChange={(winner) => handleWinnerChange(0, winner)} 
            onMove={(i)=>handleMove(0,i)} 
            currentPlayer={currentPlayer}
            boardIndex={0}
            resetTrigger={resetTrigger}
          />
        </div>
        <div className={`border-gray-800 border-r-8 border-b-8 ${requiredBoard === 1 ? 'bg-blue-100' : isBoardActive(1) ? 'bg-green-50' : 'bg-gray-50'}`}>
          <TicTacToe 
            isActive={isBoardActive(1)} 
            onWinnerChange={(winner) => handleWinnerChange(1, winner)} 
            onMove={(i)=>handleMove(1,i)} 
            currentPlayer={currentPlayer}
            boardIndex={1}
            resetTrigger={resetTrigger}
          />
        </div>
        <div className={`border-gray-800 border-b-8 ${requiredBoard === 2 ? 'bg-blue-100' : isBoardActive(2) ? 'bg-green-50' : 'bg-gray-50'}`}>
          <TicTacToe 
            isActive={isBoardActive(2)} 
            onWinnerChange={(winner) => handleWinnerChange(2, winner)} 
            onMove={(i)=>handleMove(2,i)} 
            currentPlayer={currentPlayer}
            boardIndex={2}
            resetTrigger={resetTrigger}
          />
        </div>
        
        {/* Row 2 */}
        <div className={`border-gray-800 border-r-8 border-b-8 ${requiredBoard === 3 ? 'bg-blue-100' : isBoardActive(3) ? 'bg-green-50' : 'bg-gray-50'}`}>
          <TicTacToe 
            isActive={isBoardActive(3)} 
            onWinnerChange={(winner) => handleWinnerChange(3, winner)} 
            onMove={(i)=>handleMove(3,i)} 
            currentPlayer={currentPlayer}
            boardIndex={3}
            resetTrigger={resetTrigger}
          />
        </div>
        <div className={`border-gray-800 border-r-8 border-b-8 ${requiredBoard === 4 ? 'bg-blue-100' : isBoardActive(4) ? 'bg-green-50' : 'bg-gray-50'}`}>
          <TicTacToe 
            isActive={isBoardActive(4)} 
            onWinnerChange={(winner) => handleWinnerChange(4, winner)} 
            onMove={(i)=>handleMove(4,i)} 
            currentPlayer={currentPlayer}
            boardIndex={4}
            resetTrigger={resetTrigger}
          />
        </div>
        <div className={`border-gray-800 border-b-8 ${requiredBoard === 5 ? 'bg-blue-100' : isBoardActive(5) ? 'bg-green-50' : 'bg-gray-50'}`}>
          <TicTacToe 
            isActive={isBoardActive(5)} 
            onWinnerChange={(winner) => handleWinnerChange(5, winner)} 
            onMove={(i)=>handleMove(5,i)} 
            currentPlayer={currentPlayer}
            boardIndex={5}
            resetTrigger={resetTrigger}
          />
        </div>
        
        {/* Row 3 */}
        <div className={`border-gray-800 border-r-8 ${requiredBoard === 6 ? 'bg-blue-100' : isBoardActive(6) ? 'bg-green-50' : 'bg-gray-50'}`}>
          <TicTacToe 
            isActive={isBoardActive(6)} 
            onWinnerChange={(winner) => handleWinnerChange(6, winner)} 
            onMove={(i)=>handleMove(6,i)} 
            currentPlayer={currentPlayer}
            boardIndex={6}
            resetTrigger={resetTrigger}
          />
        </div>
        <div className={`border-gray-800 border-r-8 ${requiredBoard === 7 ? 'bg-blue-100' : isBoardActive(7) ? 'bg-green-50' : 'bg-gray-50'}`}>
          <TicTacToe 
            isActive={isBoardActive(7)} 
            onWinnerChange={(winner) => handleWinnerChange(7, winner)} 
            onMove={(i)=>handleMove(7,i)} 
            currentPlayer={currentPlayer}
            boardIndex={7}
            resetTrigger={resetTrigger}
          />
        </div>
        <div className={`border-gray-800 ${requiredBoard === 8 ? 'bg-blue-100' : isBoardActive(8) ? 'bg-green-50' : 'bg-gray-50'}`}>
          <TicTacToe 
            isActive={isBoardActive(8)} 
            onWinnerChange={(winner) => handleWinnerChange(8, winner)} 
            onMove={(i)=>handleMove(8,i)} 
            currentPlayer={currentPlayer}
            boardIndex={8}
            resetTrigger={resetTrigger}
          />
        </div>
      </div>
    </div>
  );
}

