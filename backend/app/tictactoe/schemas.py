from __future__ import annotations

from typing import Literal

from pydantic import BaseModel, Field

Player = Literal["X", "O"]


class GameCreate(BaseModel):
    starting_player: Player | None = Field(default="X")


class GameStateDTO(BaseModel):
    id: str
    board: list[Player | None]
    winner: Player | None
    is_draw: bool
    status: str


class MoveRequest(BaseModel):
    index: int
    player: Player
