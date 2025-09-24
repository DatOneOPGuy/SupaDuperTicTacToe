import { describe, expect, it, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import TicTacToe from "../components/TicTacToe";
import { GameContext } from "../App";

// Mock context for testing
const mockContextValue = {
  boardWinners: [null, null, null, null, null, null, null, null, null],
  currentPlayer: "X" as const,
  requiredBoard: null,
  metaWinner: null,
  resetTrigger: 0,
  actions: {
    setBoardWinner: vi.fn(),
    setCurrentPlayer: vi.fn(),
    setRequiredBoard: vi.fn(),
    resetGame: vi.fn(),
    handleMove: vi.fn(),
    isBoardActive: vi.fn(() => true), // Always active for testing
  }
};

// Wrapper component to provide mock context
function TestWrapper({ children }: { children: React.ReactNode }) {
  return (
    <GameContext.Provider value={mockContextValue}>
      {children}
    </GameContext.Provider>
  );
}

describe("TicTacToe component (API via MSW)", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  it("plays a simple game and updates board state", async () => {
    render(
      <TestWrapper>
        <TicTacToe boardIndex={0} resetTrigger={0} />
      </TestWrapper>
    );

    // Wait for game creation (MSW handles POST /tictactoe/new)
    await screen.findByLabelText("cell-0");

    // X 0, O 3, X 1, O 4, X 2 -> X wins (MSW script enforces this)
    fireEvent.click(screen.getByLabelText("cell-0"));
    // Wait for the move to be processed
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(screen.getByLabelText("cell-0")).toHaveTextContent("X");
    
    fireEvent.click(screen.getByLabelText("cell-3"));
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(screen.getByLabelText("cell-3")).toHaveTextContent("O");
    
    fireEvent.click(screen.getByLabelText("cell-1"));
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(screen.getByLabelText("cell-1")).toHaveTextContent("X");
    
    fireEvent.click(screen.getByLabelText("cell-4"));
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(screen.getByLabelText("cell-4")).toHaveTextContent("O");
    
    fireEvent.click(screen.getByLabelText("cell-2"));
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(screen.getByLabelText("cell-2")).toHaveTextContent("X");

    // Check that the context was notified about the winner
    expect(mockContextValue.actions.setBoardWinner).toHaveBeenCalledWith(0, "X");
  });

  it("prevents moves in occupied cells", async () => {
    render(
      <TestWrapper>
        <TicTacToe boardIndex={0} resetTrigger={0} />
      </TestWrapper>
    );
    const c0 = await screen.findByLabelText("cell-0");
    fireEvent.click(c0);
    await new Promise(resolve => setTimeout(resolve, 100));
    fireEvent.click(c0); // second click ignored/disabled
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(c0.textContent).toBe("X");
  });

  it("can reset when resetTrigger changes", async () => {
    const { rerender } = render(
      <TestWrapper>
        <TicTacToe boardIndex={0} resetTrigger={0} />
      </TestWrapper>
    );
    await screen.findByLabelText("cell-0");
    
    // Make a move
    fireEvent.click(screen.getByLabelText("cell-0"));
    await new Promise(resolve => setTimeout(resolve, 100));
    expect(screen.getByLabelText("cell-0")).toHaveTextContent("X");

    // Trigger reset by changing resetTrigger
    rerender(
      <TestWrapper>
        <TicTacToe boardIndex={0} resetTrigger={1} />
      </TestWrapper>
    );

    // board should be reset: cell-0 is empty again
    const c0 = await screen.findByLabelText("cell-0");
    expect(c0.textContent).toBe("");
  });
});
