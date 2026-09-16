import Image from "next/image";
import Link from "next/link";

type Game = {
  href: string;
  title: string;
  thumbnail?: string;
};

const games: Game[] = [
  {
    href: "/dynamite",
    title: "Dynamite",
    thumbnail: "/images/game-dynamite.png",
  },
  {
    href: "/snow-throw",
    title: "Snow Throw",
    thumbnail: "/images/game-snowthrow.png",
  },
  {
    href: "#",
    title: "TBD!",
    thumbnail: "",
  },
];

export default function Home() {
  return (
    <main className="min-h-dvh mix-blend-difference flex flex-col items-center justify-center gap-y-12 pb-24 blur-[0.5px]">

      {/* INTRO */}
      <h1 className="text-center sm:text-[20em] text-[10em] leading-none font-montreal-bold-italic-ultra-squeezed uppercase">
        Carroll.cool
      </h1>

      {/* GAMES */}
      <div className="w-full max-w-2xl flex flex-col items-center justify-center gap-y-4 mb-12">
        <hr className="w-full border-t-2 border-white" />
        <p className="px-2 lg:text-7xl md:text-6xl sm:text-5xl text-4xl text-center leading-none uppercase">
          Cool <span className="italic">👾</span> games
        </p>
        {/* LIST */}
        <ul className="xl:w-5xl w-full grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-x-4 gap-y-10 sm:gap-x-8 py-4 px-16">
          {games.map((game) => (
            <li key={game.href}>
              <Link href={game.href} className="group block">
                <div className="relative aspect-square overflow-hidden bg-white shadow-2xl group-hover:scale-105 -skew-x-10 group-hover:skew-x-0 transition-transform duration-100">
                  {game.thumbnail ? (
                    <Image
                      src={game.thumbnail}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 33vw, 280px"
                      className="object-cover [image-rendering:pixelated] border-18 border-white"
                    />
                  ) : null}
                </div>
                <p className="mt-3 text-center lg:text-7xl md:text-6xl sm:text-5xl text-4xl leading-none font-medium group-hover:underline">
                  {game.title}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* PROJECTS */}
      <div className="w-full max-w-2xl flex flex-col items-center justify-center gap-y-4 mb-12">
        <hr className="w-full border-t-2 border-white" />
        <p className="px-2 lg:text-7xl md:text-6xl sm:text-5xl text-4xl text-center leading-none uppercase">
          Cool <span className="italic">🛠️</span> projects
        </p>
        <p className="px-2 lg:text-7xl md:text-6xl sm:text-5xl text-4xl text-center leading-none uppercase">
          Coming soon...
        </p>
      </div>

      {/* ART */}
      <div className="w-full max-w-2xl flex flex-col items-center justify-center gap-y-4 mb-12">
        <hr className="w-full border-t-2 border-white" />
        <p className="px-2 lg:text-7xl md:text-6xl sm:text-5xl text-4xl text-center leading-none uppercase">
          Cool <span className="italic">🎨</span> art
        </p>
        <p className="px-2 lg:text-7xl md:text-6xl sm:text-5xl text-4xl text-center leading-none uppercase">
          Coming soon...
        </p>
      </div>

      {/* ABOUT */}
      <div className="w-full flex flex-col items-center justify-center gap-y-4 mb-12">
        <hr className="w-full max-w-2xl border-t-2 border-white" />
        <p className="px-2 text-center lg:text-7xl md:text-6xl sm:text-5xl text-4xl text-center leading-none uppercase">
          About <span className="italic">🙌</span> Carrolls
        </p>
        <p className="text-center text-balance lg:text-7xl md:text-6xl sm:text-5xl text-4xl">
          Carrolls are wild and crazy kooks who work hard and play hard. We believe the coolest stuff is part work part play and is best enjoyed when shared. Enjoy our stuff!
        </p>
        <p className="text-center text-balance lg:text-7xl md:text-6xl sm:text-5xl text-4xl">
          Made with love by Clyde, John, Marigold, Hannah, and David Carroll <span className="italic">✌️</span>
        </p>
      </div>

    </main>
  );
}
