import { Board, Piece, PieceColor, PieceType, Position, Move } from '../types/chess'

export function createInitialBoard(): Board {
  const board: Board = Array(8).fill(null).map(() => Array(8).fill(null))

  const backRow: PieceType[] = ['rook', 'knight', 'bishop', 'queen', 'king', 'bishop', 'knight', 'rook']

  for (let col = 0; col < 8; col++) {
    board[0][col] = { type: backRow[col], color: 'black', hasMoved: false }
    board[1][col] = { type: 'pawn', color: 'black', hasMoved: false }
    board[6][col] = { type: 'pawn', color: 'white', hasMoved: false }
    board[7][col] = { type: backRow[col], color: 'white', hasMoved: false }
  }

  return board
}

export function cloneBoard(board: Board): Board {
  return board.map(row =>
    row.map(cell => (cell ? { ...cell } : null))
  )
}

export function getPieceAt(board: Board, pos: Position): Piece | null {
  if (pos.row < 0 || pos.row > 7 || pos.col < 0 || pos.col > 7) return null
  return board[pos.row][pos.col]
}

export function isInBounds(row: number, col: number): boolean {
  return row >= 0 && row <= 7 && col >= 0 && col <= 7
}

function getRawMoves(board: Board, pos: Position, enPassantTarget: Position | null): Position[] {
  const piece = getPieceAt(board, pos)
  if (!piece) return []

  const moves: Position[] = []
  const { row, col } = pos
  const { type, color } = piece

  switch (type) {
    case 'pawn': {
      const direction = color === 'white' ? -1 : 1
      const startRow = color === 'white' ? 6 : 1

      // Forward one
      if (isInBounds(row + direction, col) && !getPieceAt(board, { row: row + direction, col })) {
        moves.push({ row: row + direction, col })
        // Forward two from start
        if (row === startRow && !getPieceAt(board, { row: row + 2 * direction, col })) {
          moves.push({ row: row + 2 * direction, col })
        }
      }

      // Captures
      for (const dc of [-1, 1]) {
        const newRow = row + direction
        const newCol = col + dc
        if (isInBounds(newRow, newCol)) {
          const target = getPieceAt(board, { row: newRow, col: newCol })
          if (target && target.color !== color) {
            moves.push({ row: newRow, col: newCol })
          }
          // En passant
          if (enPassantTarget && enPassantTarget.row === newRow && enPassantTarget.col === newCol) {
            moves.push({ row: newRow, col: newCol })
          }
        }
      }
      break
    }

    case 'knight': {
      const knightMoves = [
        [-2, -1], [-2, 1], [-1, -2], [-1, 2],
        [1, -2], [1, 2], [2, -1], [2, 1]
      ]
      for (const [dr, dc] of knightMoves) {
        const newRow = row + dr
        const newCol = col + dc
        if (isInBounds(newRow, newCol)) {
          const target = getPieceAt(board, { row: newRow, col: newCol })
          if (!target || target.color !== color) {
            moves.push({ row: newRow, col: newCol })
          }
        }
      }
      break
    }

    case 'bishop': {
      const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]
      for (const [dr, dc] of directions) {
        for (let i = 1; i < 8; i++) {
          const newRow = row + dr * i
          const newCol = col + dc * i
          if (!isInBounds(newRow, newCol)) break
          const target = getPieceAt(board, { row: newRow, col: newCol })
          if (!target) {
            moves.push({ row: newRow, col: newCol })
          } else {
            if (target.color !== color) moves.push({ row: newRow, col: newCol })
            break
          }
        }
      }
      break
    }

    case 'rook': {
      const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]]
      for (const [dr, dc] of directions) {
        for (let i = 1; i < 8; i++) {
          const newRow = row + dr * i
          const newCol = col + dc * i
          if (!isInBounds(newRow, newCol)) break
          const target = getPieceAt(board, { row: newRow, col: newCol })
          if (!target) {
            moves.push({ row: newRow, col: newCol })
          } else {
            if (target.color !== color) moves.push({ row: newRow, col: newCol })
            break
          }
        }
      }
      break
    }

    case 'queen': {
      const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
      for (const [dr, dc] of directions) {
        for (let i = 1; i < 8; i++) {
          const newRow = row + dr * i
          const newCol = col + dc * i
          if (!isInBounds(newRow, newCol)) break
          const target = getPieceAt(board, { row: newRow, col: newCol })
          if (!target) {
            moves.push({ row: newRow, col: newCol })
          } else {
            if (target.color !== color) moves.push({ row: newRow, col: newCol })
            break
          }
        }
      }
      break
    }

    case 'king': {
      const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
      for (const [dr, dc] of directions) {
        const newRow = row + dr
        const newCol = col + dc
        if (isInBounds(newRow, newCol)) {
          const target = getPieceAt(board, { row: newRow, col: newCol })
          if (!target || target.color !== color) {
            moves.push({ row: newRow, col: newCol })
          }
        }
      }

      // Castling
      if (!piece.hasMoved) {
        // King-side
        const kRook = getPieceAt(board, { row, col: 7 })
        if (kRook && kRook.type === 'rook' && !kRook.hasMoved) {
          if (!getPieceAt(board, { row, col: 5 }) && !getPieceAt(board, { row, col: 6 })) {
            if (!isSquareAttacked(board, { row, col: 4 }, color === 'white' ? 'black' : 'white') &&
                !isSquareAttacked(board, { row, col: 5 }, color === 'white' ? 'black' : 'white') &&
                !isSquareAttacked(board, { row, col: 6 }, color === 'white' ? 'black' : 'white')) {
              moves.push({ row, col: 6 })
            }
          }
        }
        // Queen-side
        const qRook = getPieceAt(board, { row, col: 0 })
        if (qRook && qRook.type === 'rook' && !qRook.hasMoved) {
          if (!getPieceAt(board, { row, col: 1 }) && !getPieceAt(board, { row, col: 2 }) && !getPieceAt(board, { row, col: 3 })) {
            if (!isSquareAttacked(board, { row, col: 4 }, color === 'white' ? 'black' : 'white') &&
                !isSquareAttacked(board, { row, col: 3 }, color === 'white' ? 'black' : 'white') &&
                !isSquareAttacked(board, { row, col: 2 }, color === 'white' ? 'black' : 'white')) {
              moves.push({ row, col: 2 })
            }
          }
        }
      }
      break
    }
  }

  return moves
}

function isSquareAttacked(board: Board, pos: Position, byColor: PieceColor): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c]
      if (piece && piece.color === byColor) {
        const attackMoves = getAttackMoves(board, { row: r, col: c })
        if (attackMoves.some(m => m.row === pos.row && m.col === pos.col)) {
          return true
        }
      }
    }
  }
  return false
}

function getAttackMoves(board: Board, pos: Position): Position[] {
  const piece = getPieceAt(board, pos)
  if (!piece) return []

  const moves: Position[] = []
  const { row, col } = pos
  const { type, color } = piece

  // For pawns, only diagonal attack squares
  if (type === 'pawn') {
    const direction = color === 'white' ? -1 : 1
    for (const dc of [-1, 1]) {
      const newRow = row + direction
      const newCol = col + dc
      if (isInBounds(newRow, newCol)) {
        moves.push({ row: newRow, col: newCol })
      }
    }
    return moves
  }

  if (type === 'king') {
    const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]]
    for (const [dr, dc] of directions) {
      const newRow = row + dr
      const newCol = col + dc
      if (isInBounds(newRow, newCol)) {
        moves.push({ row: newRow, col: newCol })
      }
    }
    return moves
  }

  // For other pieces, use raw moves without castling
  return getRawMoves(board, pos, null)
}

export function findKing(board: Board, color: PieceColor): Position | null {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c]
      if (piece && piece.type === 'king' && piece.color === color) {
        return { row: r, col: c }
      }
    }
  }
  return null
}

export function isKingInCheck(board: Board, color: PieceColor): boolean {
  const kingPos = findKing(board, color)
  if (!kingPos) return false
  const enemy = color === 'white' ? 'black' : 'white'
  return isSquareAttacked(board, kingPos, enemy)
}

function wouldBeInCheck(board: Board, from: Position, to: Position, color: PieceColor, enPassantTarget: Position | null): boolean {
  const newBoard = cloneBoard(board)
  const piece = newBoard[from.row][from.col]

  // En passant capture
  if (piece && piece.type === 'pawn' && enPassantTarget &&
      to.row === enPassantTarget.row && to.col === enPassantTarget.col) {
    const capturedRow = color === 'white' ? to.row + 1 : to.row - 1
    newBoard[capturedRow][to.col] = null
  }

  newBoard[to.row][to.col] = newBoard[from.row][from.col]
  newBoard[from.row][from.col] = null

  // Castling - move rook too
  if (piece && piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
    if (to.col === 6) {
      newBoard[from.row][5] = newBoard[from.row][7]
      newBoard[from.row][7] = null
    } else if (to.col === 2) {
      newBoard[from.row][3] = newBoard[from.row][0]
      newBoard[from.row][0] = null
    }
  }

  return isKingInCheck(newBoard, color)
}

export function getValidMoves(board: Board, pos: Position, enPassantTarget: Position | null): Position[] {
  const piece = getPieceAt(board, pos)
  if (!piece) return []

  const rawMoves = getRawMoves(board, pos, enPassantTarget)
  return rawMoves.filter(to => !wouldBeInCheck(board, pos, to, piece.color, enPassantTarget))
}

export function hasAnyValidMove(board: Board, color: PieceColor, enPassantTarget: Position | null): boolean {
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = board[r][c]
      if (piece && piece.color === color) {
        const moves = getValidMoves(board, { row: r, col: c }, enPassantTarget)
        if (moves.length > 0) return true
      }
    }
  }
  return false
}

export function makeMove(board: Board, from: Position, to: Position, enPassantTarget: Position | null, promotionType?: PieceType): {
  newBoard: Board
  move: Move
  newEnPassantTarget: Position | null
} {
  const newBoard = cloneBoard(board)
  const piece = { ...newBoard[from.row][from.col]! }
  const captured = newBoard[to.row][to.col]
  let isEnPassant = false
  let isCastling = false
  let newEnPassant: Position | null = null

  // En passant
  if (piece.type === 'pawn' && enPassantTarget && to.row === enPassantTarget.row && to.col === enPassantTarget.col) {
    isEnPassant = true
    const capturedRow = piece.color === 'white' ? to.row + 1 : to.row - 1
    newBoard[capturedRow][to.col] = null
  }

  // Set en passant target
  if (piece.type === 'pawn' && Math.abs(to.row - from.row) === 2) {
    newEnPassant = {
      row: (from.row + to.row) / 2,
      col: from.col
    }
  }

  // Castling
  if (piece.type === 'king' && Math.abs(to.col - from.col) === 2) {
    isCastling = true
    if (to.col === 6) {
      newBoard[from.row][5] = { ...newBoard[from.row][7]!, hasMoved: true }
      newBoard[from.row][7] = null
    } else if (to.col === 2) {
      newBoard[from.row][3] = { ...newBoard[from.row][0]!, hasMoved: true }
      newBoard[from.row][0] = null
    }
  }

  // Promotion
  if (piece.type === 'pawn' && (to.row === 0 || to.row === 7)) {
    piece.type = promotionType || 'queen'
  }

  piece.hasMoved = true
  newBoard[to.row][to.col] = piece
  newBoard[from.row][from.col] = null

  const notation = getMoveNotation(piece, from, to, captured, isEnPassant, isCastling, promotionType)

  const capturedPiece = isEnPassant
    ? { type: 'pawn' as PieceType, color: piece.color === 'white' ? 'black' as PieceColor : 'white' as PieceColor, hasMoved: true }
    : captured

  return {
    newBoard,
    move: {
      from,
      to,
      piece,
      captured: capturedPiece,
      isEnPassant,
      isCastling,
      promotionTo: promotionType,
      notation
    },
    newEnPassantTarget: newEnPassant
  }
}

function getMoveNotation(piece: Piece, from: Position, to: Position, captured: Piece | null, isEnPassant: boolean, isCastling: boolean, promotionType?: PieceType): string {
  if (isCastling) {
    return to.col === 6 ? 'O-O' : 'O-O-O'
  }

  const files = 'abcdefgh'
  const ranks = '87654321'
  const pieceSymbols: Record<PieceType, string> = {
    king: 'K', queen: 'Q', rook: 'R', bishop: 'B', knight: 'N', pawn: ''
  }

  let notation = ''

  if (piece.type === 'pawn') {
    if (captured || isEnPassant) {
      notation += files[from.col] + 'x'
    }
  } else {
    notation += pieceSymbols[piece.type]
    if (captured) notation += 'x'
  }

  notation += files[to.col] + ranks[to.row]

  if (promotionType) {
    notation += '=' + pieceSymbols[promotionType]
  }

  if (isEnPassant) {
    notation += ' e.p.'
  }

  return notation
}

export function isInsufficientMaterial(board: Board): boolean {
  const pieces: Piece[] = []
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (board[r][c]) pieces.push(board[r][c]!)
    }
  }

  // King vs King
  if (pieces.length === 2) return true

  // King + Bishop vs King or King + Knight vs King
  if (pieces.length === 3) {
    const nonKing = pieces.find(p => p.type !== 'king')
    if (nonKing && (nonKing.type === 'bishop' || nonKing.type === 'knight')) return true
  }

  return false
}

export const PIECE_UNICODE: Record<PieceColor, Record<PieceType, string>> = {
  white: {
    king: '♔',
    queen: '♕',
    rook: '♖',
    bishop: '♗',
    knight: '♘',
    pawn: '♙'
  },
  black: {
    king: '♚',
    queen: '♛',
    rook: '♜',
    bishop: '♝',
    knight: '♞',
    pawn: '♟'
  }
}