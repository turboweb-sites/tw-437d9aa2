import { Move } from '../types/chess'

interface MoveHistoryProps {
  moves: Move[]
}

export default function MoveHistory({ moves }: MoveHistoryProps) {
  const pairs: { number: number; white: string; black?: string }[] = []

  for (let i = 0; i < moves.length; i += 2) {
    pairs.push({
      number: Math.floor(i / 2) + 1,
      white: moves[i].notation,
      black: moves[i + 1]?.notation
    })
  }

  return (
    <div className="bg-gray-800/80 backdrop-blur rounded-xl border border-gray-700 overflow-hidden w-full max-w-xs">
      <div className="px-4 py-3 border-b border-gray-700">
        <h3 className="text-gray-400 text-sm font-semibold uppercase tracking-wider">

        </h3>
      </div>

      <div className="max-h-64 overflow-y-auto custom-scrollbar">
        {pairs.length === 0 ? (
          <div className="text-gray-600 text-sm text-center py-8">
            Сделайте первый ход
          </div>
        ) : (
          <div className="divide-y divide-gray-700/50">
            {pairs.map((pair, idx) => (
              <div
                key={pair.number}
                className={`
                  flex items-center px-4 py-2 text-sm
                  ${idx === pairs.length - 1 ? 'bg-indigo-500/10' : 'hover:bg-gray-700/30'}
                  animate-slide-in transition-colors duration-150
                `}
                style={{ animationDelay: `${idx * 0.02}s` }}
              >
                <span className="text-gray-500 w-8 font-mono text-xs">{pair.number}.</span>
                <span className="text-white font-mono w-20">{pair.white}</span>
                <span className="text-gray-300 font-mono w-20">{pair.black || ''}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {pairs.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-700 text-xs text-gray-500">
          Всего ходов: {moves.length}
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #4b5563;
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #6b7280;
        }
      `}</style>
    </div>
  )
}