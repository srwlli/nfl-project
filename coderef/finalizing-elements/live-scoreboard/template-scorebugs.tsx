import { DesignShowcaseLayout } from "@/components/design-showcase-layout"
import { DesignSection } from "@/components/design-section"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GAMES } from "@/lib/mock-data"
import { DESIGN_STYLES } from "@/lib/design-styles"

export default function ScorebugShowcase() {
  const game = GAMES.liveGame

  const designs = [
    {
      ...DESIGN_STYLES.modernDashboard,
      component: (
        <div className="flex items-center justify-between rounded-xl border-2 border-border bg-card p-6 shadow-lg">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-xl shadow-md"
              style={{ backgroundColor: game.homeTeam.colors.primary }}
            >
              <span className="text-sm font-bold text-white">{game.homeTeam.abbreviation}</span>
            </div>
            <div>
              <div className="text-sm font-medium text-muted-foreground">{game.homeTeam.city}</div>
              <div className="text-4xl font-bold tabular-nums">{game.homeScore}</div>
              <div className="text-xs text-muted-foreground">
                {game.homeTeam.record.wins}-{game.homeTeam.record.losses}
              </div>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2">
            <Badge variant="outline" className="text-xs">
              Live
            </Badge>
            <div className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{game.quarter}</div>
            <div className="text-2xl font-mono font-bold">{game.timeRemaining}</div>
            <div className="text-sm font-medium text-amber-500">{game.network}</div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-sm font-medium text-muted-foreground">{game.awayTeam.city}</div>
              <div className="text-4xl font-bold tabular-nums">{game.awayScore}</div>
              <div className="text-xs text-muted-foreground">
                {game.awayTeam.record.wins}-{game.awayTeam.record.losses}
              </div>
            </div>
            <div
              className="flex h-16 w-16 items-center justify-center rounded-xl shadow-md"
              style={{ backgroundColor: game.awayTeam.colors.primary }}
            >
              <span className="text-sm font-bold text-white">{game.awayTeam.abbreviation}</span>
            </div>
          </div>
        </div>
      ),
    },
    {
      ...DESIGN_STYLES.dataHeavy,
      component: (
        <div className="space-y-4 rounded-xl border-2 border-primary/20 bg-primary/5 p-6">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg" style={{ backgroundColor: game.homeTeam.colors.primary }} />
                <div>
                  <span className="text-base font-bold">
                    {game.homeTeam.city} {game.homeTeam.name}
                  </span>
                  <div className="text-sm text-muted-foreground">
                    Record: {game.homeTeam.record.wins}-{game.homeTeam.record.losses} • Home
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <div>Mahomes: 245 YDS, 2 TD, 0 INT</div>
                <div>Kelce: 6 REC, 78 YDS</div>
              </div>
            </div>
            <div className="text-5xl font-black tabular-nums">{game.homeScore}</div>
          </div>
          <div className="flex items-center justify-between border-t pt-4">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-lg" style={{ backgroundColor: game.awayTeam.colors.primary }} />
                <div>
                  <span className="text-base font-bold">
                    {game.awayTeam.city} {game.awayTeam.name}
                  </span>
                  <div className="text-sm text-muted-foreground">
                    Record: {game.awayTeam.record.wins}-{game.awayTeam.record.losses} • Away
                  </div>
                </div>
              </div>
              <div className="text-sm text-muted-foreground">
                <div>Jackson: 198 YDS, 1 TD, 1 INT</div>
                <div>Andrews: 4 REC, 52 YDS</div>
              </div>
            </div>
            <div className="text-5xl font-black tabular-nums">{game.awayScore}</div>
          </div>
          <div className="flex items-center justify-between border-t pt-3">
            <span className="text-sm font-medium">
              {game.quarter} • {game.timeRemaining} • {game.network}
            </span>
            {game.odds && (
              <div className="text-sm font-medium text-muted-foreground">
                Spread: {game.odds.spread} • O/U: {game.odds.overUnder}
              </div>
            )}
          </div>
        </div>
      ),
    },
    {
      ...DESIGN_STYLES.cardBased,
      component: (
        <div className="space-y-3">
          <Card className="overflow-hidden">
            <div
              className="flex items-center justify-between p-4 text-white"
              style={{ backgroundColor: game.homeTeam.colors.primary }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                  <span className="text-sm font-bold">{game.homeTeam.abbreviation}</span>
                </div>
                <div>
                  <div className="text-sm font-medium">
                    {game.homeTeam.city} {game.homeTeam.name}
                  </div>
                  <div className="text-xs text-white/80">
                    Record: {game.homeTeam.record.wins}-{game.homeTeam.record.losses}
                  </div>
                </div>
              </div>
              <div className="text-4xl font-black">{game.homeScore}</div>
            </div>
          </Card>
          <Card className="bg-muted/50 p-3">
            <div className="flex items-center justify-center gap-3 text-center">
              <Badge variant="outline">{game.quarter}</Badge>
              <span className="text-lg font-mono font-bold">{game.timeRemaining}</span>
              <Badge className="bg-amber-500 hover:bg-amber-500">{game.network}</Badge>
            </div>
          </Card>
          <Card className="overflow-hidden">
            <div
              className="flex items-center justify-between p-4 text-white"
              style={{ backgroundColor: game.awayTeam.colors.primary }}
            >
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-white/20">
                  <span className="text-sm font-bold">{game.awayTeam.abbreviation}</span>
                </div>
                <div>
                  <div className="text-sm font-medium">
                    {game.awayTeam.city} {game.awayTeam.name}
                  </div>
                  <div className="text-xs text-white/80">
                    Record: {game.awayTeam.record.wins}-{game.awayTeam.record.losses}
                  </div>
                </div>
              </div>
              <div className="text-4xl font-black">{game.awayScore}</div>
            </div>
          </Card>
        </div>
      ),
    },
    {
      ...DESIGN_STYLES.classicReference,
      component: (
        <div className="overflow-hidden rounded-lg border-2 border-border">
          <table className="w-full font-mono text-sm">
            <thead className="bg-muted">
              <tr>
                <th className="border-r p-3 text-left font-bold">TEAM</th>
                <th className="border-r p-3 text-center font-bold">REC</th>
                <th className="p-3 text-center font-bold">SCORE</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t">
                <td className="border-r p-3 font-bold">
                  {game.homeTeam.city} {game.homeTeam.name}
                </td>
                <td className="border-r p-3 text-center">
                  {game.homeTeam.record.wins}-{game.homeTeam.record.losses}
                </td>
                <td className="p-3 text-center text-2xl font-black">{game.homeScore}</td>
              </tr>
              <tr className="border-t">
                <td className="border-r p-3 font-bold">
                  {game.awayTeam.city} {game.awayTeam.name}
                </td>
                <td className="border-r p-3 text-center">
                  {game.awayTeam.record.wins}-{game.awayTeam.record.losses}
                </td>
                <td className="p-3 text-center text-2xl font-black">{game.awayScore}</td>
              </tr>
              <tr className="border-t bg-muted/50">
                <td colSpan={3} className="p-3 text-center">
                  <span className="font-bold">{game.quarter.toUpperCase()}</span> • {game.timeRemaining} •{" "}
                  {game.network} •{" "}
                  <Badge variant="outline" className="ml-1">
                    LIVE
                  </Badge>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ),
    },
    {
      ...DESIGN_STYLES.premiumGlass,
      component: (
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 shadow-2xl">
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent" />
          <div className="relative space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                  <span className="text-base font-bold text-white">{game.homeTeam.abbreviation}</span>
                </div>
                <div>
                  <div className="text-sm font-medium text-white/60">
                    {game.homeTeam.city} {game.homeTeam.name}
                  </div>
                  <div className="text-4xl font-bold text-white">{game.homeScore}</div>
                  <div className="text-xs text-white/50">
                    Record: {game.homeTeam.record.wins}-{game.homeTeam.record.losses}
                  </div>
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm font-semibold uppercase tracking-wide text-white/60">{game.quarter}</div>
                <div className="text-3xl font-mono font-bold text-white">{game.timeRemaining}</div>
                <div className="mt-1 text-sm font-medium text-amber-400">{game.network}</div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <div className="text-sm font-medium text-white/60">
                    {game.awayTeam.city} {game.awayTeam.name}
                  </div>
                  <div className="text-4xl font-bold text-white">{game.awayScore}</div>
                  <div className="text-xs text-white/50">
                    Record: {game.awayTeam.record.wins}-{game.awayTeam.record.losses}
                  </div>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                  <span className="text-base font-bold text-white">{game.awayTeam.abbreviation}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <DesignShowcaseLayout
      title="NFL Scorebug Design Showcase"
      description="5 distinct design styles for displaying live game data"
    >
      {designs.map((design, index) => (
        <DesignSection key={index} number={index + 1} title={design.name} description={design.description}>
          {design.component}
        </DesignSection>
      ))}
    </DesignShowcaseLayout>
  )
}
