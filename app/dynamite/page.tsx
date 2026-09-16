import { GameFrame } from "@/components/game-frame";

export const metadata = {
  title: "Dynamite",
};

type DynamitePageProps = {
  searchParams: Promise<{ level?: string | string[] }>;
};

function levelQuery(level: string | string[] | undefined): string {
  const value = Array.isArray(level) ? level[0] : level;
  const parsed = Number.parseInt(value ?? "", 10);
  if (parsed >= 1 && parsed <= 5) {
    return `?level=${parsed}`;
  }
  return "";
}

export default async function DynamitePage({ searchParams }: DynamitePageProps) {
  const { level } = await searchParams;
  return (
    <GameFrame
      src={`/games/dynamite/index.html${levelQuery(level)}`}
      title="Dynamite"
    />
  );
}
