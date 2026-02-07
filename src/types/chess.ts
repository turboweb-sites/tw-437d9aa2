export type PieceColor = 'white' | 'black'

export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn'

export interface Piece {
  type: PieceType
  color: PieceColor
  hasMoved: boolean
}

export interface Position {
  row: number
  col: number
}

export type Board = (Piece | null)[][]

export interface Move {
  from: Position
  to: Position
  piece: Piece
  captured?: Piece | null
  isEnPassant?: boolean
  isCastling?: boolean
  promotionTo?: PieceType
  notation: string
}

export interface GameState {
  board: Board
  currentPlayer: PieceColor
  moves: Move[]
  isCheck: boolean
  isCheckmate: boolean
  isStalemate: boolean
  isDraw: boolean
  selectedPosition: Position | null
  validMoves: Position[]
  lastMove: Move | null
  capturedWhite: Piece[]
  capturedBlack: Piece[]
  enPassantTarget: Position | null
  promotionPending: Position | null
}