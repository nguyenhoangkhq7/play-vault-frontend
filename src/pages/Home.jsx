
import HeroSlideshow from "../components/home/hero-slideshow";
import GameGrid from "../components/home/game-grid";
import GameCategories from "../components/home/game-categories";
import DetailedGameIntroduction from "../components/home/detailed-game-introduction";

export default function Home() {
    return (
<>
      <HeroSlideshow />
      <GameCategories />
      <DetailedGameIntroduction />
      <GameGrid />

</>

    );
}
