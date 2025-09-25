import { describe, expect, it } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import MetaBoard from "../components/MetaBoard";

describe("MetaBoard component", () => {
  it("renders empty meta board with no winners", () => {
    const boardWinners = [null, null, null, null, null, null, null, null, null];
    render(<MetaBoard boardWinners={boardWinners} />);
    
    expect(screen.getByText("Meta Board")).toBeInTheDocument();
    
    // Check that all 9 cells are rendered and empty
    const cells = screen.getAllByRole("generic");
    const metaCells = cells.filter(cell => 
      cell.className.includes("aspect-square") && 
      cell.className.includes("rounded-2xl")
    );
    expect(metaCells).toHaveLength(9);
    
    // All cells should be empty
    metaCells.forEach(cell => {
      expect(cell.textContent).toBe("");
    });
  });

  it("renders meta board with some winners", () => {
    const boardWinners = ["X", "O", null, "X", null, "O", null, null, "draw"];
    render(<MetaBoard boardWinners={boardWinners} />);
    
    expect(screen.getByText("Meta Board")).toBeInTheDocument();
    
    // Check specific winners are displayed
    const cells = screen.getAllByRole("generic");
    const metaCells = cells.filter(cell => 
      cell.className.includes("aspect-square") && 
      cell.className.includes("rounded-2xl")
    );
    
    expect(metaCells[0]).toHaveTextContent("X");
    expect(metaCells[1]).toHaveTextContent("O");
    expect(metaCells[2]).toHaveTextContent("");
    expect(metaCells[3]).toHaveTextContent("X");
    expect(metaCells[4]).toHaveTextContent("");
    expect(metaCells[5]).toHaveTextContent("O");
    expect(metaCells[6]).toHaveTextContent("");
    expect(metaCells[7]).toHaveTextContent("");
    expect(metaCells[8]).toHaveTextContent("draw");
  });

  it("renders meta board with all winners", () => {
    const boardWinners = ["X", "O", "X", "O", "X", "O", "O", "X", "O"];
    render(<MetaBoard boardWinners={boardWinners} />);
    
    expect(screen.getByText("Meta Board")).toBeInTheDocument();
    
    const cells = screen.getAllByRole("generic");
    const metaCells = cells.filter(cell => 
      cell.className.includes("aspect-square") && 
      cell.className.includes("rounded-2xl")
    );
    
    // All cells should have content
    metaCells.forEach((cell, index) => {
      expect(cell.textContent).toBe(boardWinners[index]);
    });
  });

  it("renders meta board with draw results", () => {
    const boardWinners = ["draw", "draw", "draw", null, null, null, null, null, null];
    render(<MetaBoard boardWinners={boardWinners} />);
    
    expect(screen.getByText("Meta Board")).toBeInTheDocument();
    
    const cells = screen.getAllByRole("generic");
    const metaCells = cells.filter(cell => 
      cell.className.includes("aspect-square") && 
      cell.className.includes("rounded-2xl")
    );
    
    expect(metaCells[0]).toHaveTextContent("draw");
    expect(metaCells[1]).toHaveTextContent("draw");
    expect(metaCells[2]).toHaveTextContent("draw");
    expect(metaCells[3]).toHaveTextContent("");
    expect(metaCells[4]).toHaveTextContent("");
    expect(metaCells[5]).toHaveTextContent("");
    expect(metaCells[6]).toHaveTextContent("");
    expect(metaCells[7]).toHaveTextContent("");
    expect(metaCells[8]).toHaveTextContent("");
  });

  it("has correct CSS classes and structure", () => {
    const boardWinners = [null, null, null, null, null, null, null, null, null];
    render(<MetaBoard boardWinners={boardWinners} />);
    
    const container = screen.getByText("Meta Board").parentElement;
    expect(container).toHaveClass("absolute", "left-8", "top-31", "transform", "-translate-y-1/2", "z-10");
    
    const title = screen.getByText("Meta Board");
    expect(title).toHaveClass("text-base", "font-semibold", "mb-3", "text-center", "text-gray-700");
    
    const grid = container?.querySelector(".grid");
    expect(grid).toHaveClass("grid", "grid-cols-3", "gap-2", "w-32", "h-32");
  });
});
