import GameCard from "./GameCard"

function RelatedGames({ games, currentGameId }) {
  return (
    <div className="mt-6">
      <h3 className="text-2xl font-bold mb-6 text-white">Related Games</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {games.map((game) => (
          <GameCard key={game.id} game={game} />
        ))}
      </div>
    </div>
  )
}

export default RelatedGames
