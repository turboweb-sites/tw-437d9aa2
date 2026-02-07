import { Board, Position, PieceColor, Move } from '../types/chess'
import { getValidMoves, isKingInCheck, makeMove } from './chessLogic'

// Оценка позиции (материал)
const PIECE_VALUES = {
  pawn: 1,
  knight: 3,
  bishop: 3,
  rook: 5,
  queen: 9,
  king: 0
}

// Оценка позиции на доске
function evaluateBoard(board: Board, color: PieceColor): number {
  let score = 0

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (!piece) continue

      const value = PIECE_VALUES[piece.type]
      const multiplier = piece.color === color ? 1 : -1
      score += value * multiplier

      // Бонус за контроль центра
      if ((row >= 3 && row <= 4) && (col >= 3 && col <= 4)) {
        score += 0.3 * multiplier
      }
    }
  }

  return score
}

// Получить все возможные ходы для цвета
function getAllPossibleMoves(board: Board, color: PieceColor, enPassantTarget: Position | null): Array<{from: Position, to: Position}> {
  const moves: Array<{from: Position, to: Position}> = []

  for (let row = 0; row < 8; row++) {
    for (let col = 0; col < 8; col++) {
      const piece = board[row][col]
      if (!piece || piece.color !== color) continue

      const from: Position = { row, col }
      const validMoves = getValidMoves(board, from, enPassantTarget)
      
      for (const to of validMoves) {
        moves.push({ from, to })
      }
    }
  }

  return moves
}

// Minimax с alpha-beta отсечением
function minimax(
  board: Board,
  depth: number,
  alpha: number,
  beta: number,
  maximizingPlayer: boolean,
  botColor: PieceColor,
  enPassantTarget: Position | null
): number {
  if (depth === 0) {
    return evaluateBoard(board, botColor)
  }

  const currentColor: PieceColor = maximizingPlayer ? botColor : (botColor === 'white' ? 'black' : 'white')
  const possibleMoves = getAllPossibleMoves(board, currentColor, enPassantTarget)

  if (possibleMoves.length === 0) {
    // Мат или пат
    const inCheck = isKingInCheck(board, currentColor)
    if (inCheck) {
      return maximizingPlayer ? -10000 : 10000 // Мат
    }
    return 0 // Пат
  }

  if (maximizingPlayer) {
    let maxEval = -Infinity
    for (const move of possibleMoves) {
      const { newBoard, newEnPassantTarget } = makeMove(board, move.from, move.to, enPassantTarget)
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, false, botColor, newEnPassantTarget)
      maxEval = Math.max(maxEval, evaluation)
      alpha = Math.max(alpha, evaluation)
      if (beta <= alpha) break
    }
    return maxEval
  } else {
    let minEval = Infinity
    for (const move of possibleMoves) {
      const { newBoard, newEnPassantTarget } = makeMove(board, move.from, move.to, enPassantTarget)
      const evaluation = minimax(newBoard, depth - 1, alpha, beta, true, botColor, newEnPassantTarget)
      minEval = Math.min(minEval, evaluation)
      beta = Math.min(beta, evaluation)
      if (beta <= alpha) break
    }
    return minEval
  }
}

// Получить лучший ход для бота
export function getBotMove(
  board: Board,
  botColor: PieceColor,
  enPassantTarget: Position | null,
  difficulty: 'easy' | 'medium' | 'hard' = 'medium'
): { from: Position; to: Position } | null {
  const depth = difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3
  const possibleMoves = getAllPossibleMoves(board, botColor, enPassantTarget)

  if (possibleMoves.length === 0) return null

  // На легком уровне иногда делаем случайный ход
  if (difficulty === 'easy' && Math.random() < 0.4) {
    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)]
  }

  let bestMove = possibleMoves[0]
  let bestValue = -Infinity

  for (const move of possibleMoves) {
    const { newBoard, newEnPassantTarget } = makeMove(board, move.from, move.to, enPassantTarget)
    const value = minimax(newBoard, depth - 1, -Infinity, Infinity, false, botColor, newEnPassantTarget)
    
    if (value > bestValue) {
      bestValue = value
      bestMove = move
    }
  }

  return bestMove
}