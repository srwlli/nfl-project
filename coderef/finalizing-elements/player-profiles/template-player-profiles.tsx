import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DesignShowcaseLayout } from "@/components/design-showcase-layout"
import { DesignSection } from "@/components/design-section"
import { DESIGN_STYLES } from "@/lib/design-styles"

export default function PlayerPagesShowcase() {
  const designs = [
    {
      ...DESIGN_STYLES.modernDashboard,
      component: (
        <Card className="overflow-hidden">
          {/* Hero Header */}
          <div className="relative bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-white">
            <div className="flex items-start gap-6">
              <div className="flex h-32 w-32 items-center justify-center rounded-lg bg-white/10 text-6xl font-bold backdrop-blur">
                9
              </div>
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-3">
                  <h3 className="text-4xl font-bold">Troy Aikman</h3>
                  <Badge variant="secondary" className="bg-yellow-500 text-yellow-950">
                    Hall of Fame
                  </Badge>
                </div>
                <p className="text-xl text-blue-100">Quarterback • Dallas Cowboys</p>
                <div className="flex gap-4 text-sm">
                  <span>6'4" • 220 lbs</span>
                  <span>•</span>
                  <span>Born: Nov 21, 1966</span>
                  <span>•</span>
                  <span>College: UCLA</span>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="secondary">
                    Follow
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-white/20 text-white hover:bg-white/10 bg-transparent"
                  >
                    Share
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Stats Bar */}
          <div className="grid grid-cols-5 border-b border-border bg-muted/30">
            <div className="border-r border-border p-4 text-center">
              <div className="text-2xl font-bold">32,942</div>
              <div className="text-xs text-muted-foreground">Pass Yards</div>
            </div>
            <div className="border-r border-border p-4 text-center">
              <div className="text-2xl font-bold">165</div>
              <div className="text-xs text-muted-foreground">Touchdowns</div>
            </div>
            <div className="border-r border-border p-4 text-center">
              <div className="text-2xl font-bold">86.7</div>
              <div className="text-xs text-muted-foreground">Passer Rating</div>
            </div>
            <div className="border-r border-border p-4 text-center">
              <div className="text-2xl font-bold">3</div>
              <div className="text-xs text-muted-foreground">Super Bowls</div>
            </div>
            <div className="p-4 text-center">
              <div className="text-2xl font-bold">6</div>
              <div className="text-xs text-muted-foreground">Pro Bowls</div>
            </div>
          </div>

          {/* Tabbed Content */}
          <Tabs defaultValue="overview" className="p-6">
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="stats">Stats</TabsTrigger>
              <TabsTrigger value="games">Game Logs</TabsTrigger>
              <TabsTrigger value="splits">Splits</TabsTrigger>
              <TabsTrigger value="awards">Achievements</TabsTrigger>
              <TabsTrigger value="media">Media</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-6 pt-6">
              <div className="grid gap-6 md:grid-cols-2">
                <Card className="p-6">
                  <h4 className="mb-4 font-semibold">Career Highlights</h4>
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <span>🏆</span>
                      <span>3× Super Bowl Champion (XXVII, XXVIII, XXX)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>⭐</span>
                      <span>6× Pro Bowl Selection (1991-1996)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>🏆</span>
                      <span>3× All-Pro (1992, 1993, 1995)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span>⭐</span>
                      <span>Hall of Fame Inductee (2016)</span>
                    </div>
                  </div>
                </Card>
                <Card className="p-6">
                  <h4 className="mb-4 font-semibold">Biographical Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Full Name</span>
                      <span className="font-medium">Troy Kenneth Aikman</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Birthplace</span>
                      <span className="font-medium">Henryetta, OK</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Draft</span>
                      <span className="font-medium">1989, Rd 1, Pick 1</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Career Span</span>
                      <span className="font-medium">1989-2000 (12 seasons)</span>
                    </div>
                  </div>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      ),
    },
    {
      ...DESIGN_STYLES.dataHeavy,
      component: (
        <Card className="overflow-hidden font-mono">
          {/* Compact Header */}
          <div className="border-b border-border bg-muted/50 p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-3">
                  <span className="text-4xl font-bold">#9</span>
                  <div>
                    <h3 className="text-2xl font-bold">Troy Aikman</h3>
                    <p className="text-sm text-muted-foreground">QB • Dallas Cowboys • 1989-2000</p>
                  </div>
                </div>
              </div>
              <Badge className="bg-yellow-600">HOF 2016</Badge>
            </div>
          </div>

          {/* Dense Stats Table */}
          <div className="overflow-x-auto p-6">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-2 text-left font-semibold">CATEGORY</th>
                  <th className="pb-2 text-right font-semibold">CAREER</th>
                  <th className="pb-2 text-right font-semibold">RANK</th>
                  <th className="pb-2 text-right font-semibold">PER GAME</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2">Pass Attempts</td>
                  <td className="py-2 text-right font-semibold">4,694</td>
                  <td className="py-2 text-right text-muted-foreground">4th</td>
                  <td className="py-2 text-right">30.1</td>
                </tr>
                <tr>
                  <td className="py-2">Completions</td>
                  <td className="py-2 text-right font-semibold">3,064</td>
                  <td className="py-2 text-right text-muted-foreground">5th</td>
                  <td className="py-2 text-right">19.6</td>
                </tr>
                <tr>
                  <td className="py-2">Completion %</td>
                  <td className="py-2 text-right font-semibold">65.3%</td>
                  <td className="py-2 text-right text-muted-foreground">20th</td>
                  <td className="py-2 text-right">—</td>
                </tr>
                <tr>
                  <td className="py-2">Passing Yards</td>
                  <td className="py-2 text-right font-semibold">32,942</td>
                  <td className="py-2 text-right text-muted-foreground">7th</td>
                  <td className="py-2 text-right">210.9</td>
                </tr>
                <tr>
                  <td className="py-2">Touchdowns</td>
                  <td className="py-2 text-right font-semibold">165</td>
                  <td className="py-2 text-right text-muted-foreground">8th</td>
                  <td className="py-2 text-right">1.06</td>
                </tr>
                <tr>
                  <td className="py-2">Interceptions</td>
                  <td className="py-2 text-right font-semibold">141</td>
                  <td className="py-2 text-right text-muted-foreground">28th</td>
                  <td className="py-2 text-right">0.90</td>
                </tr>
                <tr>
                  <td className="py-2">Passer Rating</td>
                  <td className="py-2 text-right font-semibold">86.7</td>
                  <td className="py-2 text-right text-muted-foreground">12th</td>
                  <td className="py-2 text-right">—</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-6 border-t border-border pt-4">
              <h4 className="mb-3 text-sm font-semibold">SEASON-BY-SEASON</h4>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-2 text-left font-semibold">YEAR</th>
                    <th className="pb-2 text-right font-semibold">G</th>
                    <th className="pb-2 text-right font-semibold">CMP</th>
                    <th className="pb-2 text-right font-semibold">ATT</th>
                    <th className="pb-2 text-right font-semibold">YDS</th>
                    <th className="pb-2 text-right font-semibold">TD</th>
                    <th className="pb-2 text-right font-semibold">INT</th>
                    <th className="pb-2 text-right font-semibold">RAT</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  <tr>
                    <td className="py-2">1989</td>
                    <td className="py-2 text-right">11</td>
                    <td className="py-2 text-right">155</td>
                    <td className="py-2 text-right">293</td>
                    <td className="py-2 text-right">1,749</td>
                    <td className="py-2 text-right">9</td>
                    <td className="py-2 text-right">18</td>
                    <td className="py-2 text-right">84.0</td>
                  </tr>
                  <tr>
                    <td className="py-2">1992</td>
                    <td className="py-2 text-right">16</td>
                    <td className="py-2 text-right">346</td>
                    <td className="py-2 text-right">473</td>
                    <td className="py-2 text-right">4,694</td>
                    <td className="py-2 text-right">23</td>
                    <td className="py-2 text-right">14</td>
                    <td className="py-2 text-right font-semibold">89.5 ★</td>
                  </tr>
                  <tr>
                    <td className="py-2">1993</td>
                    <td className="py-2 text-right">16</td>
                    <td className="py-2 text-right">383</td>
                    <td className="py-2 text-right">518</td>
                    <td className="py-2 text-right">3,100</td>
                    <td className="py-2 text-right">15</td>
                    <td className="py-2 text-right">6</td>
                    <td className="py-2 text-right font-semibold">99.0 ★</td>
                  </tr>
                  <tr>
                    <td className="py-2">1995</td>
                    <td className="py-2 text-right">16</td>
                    <td className="py-2 text-right">280</td>
                    <td className="py-2 text-right">432</td>
                    <td className="py-2 text-right">3,518</td>
                    <td className="py-2 text-right">23</td>
                    <td className="py-2 text-right">12</td>
                    <td className="py-2 text-right font-semibold">92.6 ★</td>
                  </tr>
                </tbody>
              </table>
              <p className="mt-2 text-xs text-muted-foreground">★ = Super Bowl Championship Season</p>
            </div>
          </div>
        </Card>
      ),
    },
    {
      ...DESIGN_STYLES.cardBased,
      component: (
        <div className="space-y-4">
          {/* Hero Card */}
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-white">
              <div className="flex items-center gap-6">
                <div className="flex h-24 w-24 items-center justify-center rounded-full bg-white/20 text-5xl font-bold backdrop-blur">
                  9
                </div>
                <div className="flex-1">
                  <h3 className="text-3xl font-bold">Troy Aikman</h3>
                  <p className="text-lg text-blue-100">Quarterback • Dallas Cowboys</p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="secondary" className="bg-yellow-500 text-yellow-950">
                      Hall of Fame 2016
                    </Badge>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      Retired 2000
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="text-2xl">📈</div>
                <div>
                  <div className="text-2xl font-bold">32,942</div>
                  <div className="text-sm text-muted-foreground">Career Passing Yards</div>
                  <div className="mt-1 text-xs text-muted-foreground">7th All-Time</div>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🏆</div>
                <div>
                  <div className="text-2xl font-bold">3</div>
                  <div className="text-sm text-muted-foreground">Super Bowl Championships</div>
                  <div className="mt-1 text-xs text-muted-foreground">XXVII, XXVIII, XXX</div>
                </div>
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center gap-3">
                <div className="text-2xl">⭐</div>
                <div>
                  <div className="text-2xl font-bold">86.7</div>
                  <div className="text-sm text-muted-foreground">Career Passer Rating</div>
                  <div className="mt-1 text-xs text-muted-foreground">12th All-Time</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Content Cards */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="text-lg">📅</div>
                <h4 className="font-semibold">Career Timeline</h4>
              </div>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold">
                    89
                  </div>
                  <div>
                    <div className="font-medium">Drafted #1 Overall</div>
                    <div className="text-sm text-muted-foreground">Dallas Cowboys, 1989 NFL Draft</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-yellow-500/20 text-xs font-bold">
                    93
                  </div>
                  <div>
                    <div className="font-medium">First Super Bowl Win</div>
                    <div className="text-sm text-muted-foreground">Super Bowl XXVII MVP</div>
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold">
                    00
                  </div>
                  <div>
                    <div className="font-medium">Retirement</div>
                    <div className="text-sm text-muted-foreground">After 12 seasons, 165 games</div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <div className="text-lg">🏆</div>
                <h4 className="font-semibold">Major Achievements</h4>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2">
                  <span>Super Bowl Championships</span>
                  <span className="font-bold">3</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2">
                  <span>Pro Bowl Selections</span>
                  <span className="font-bold">6</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2">
                  <span>All-Pro Selections</span>
                  <span className="font-bold">3</span>
                </div>
                <div className="flex items-center justify-between rounded-lg bg-muted/50 p-2">
                  <span>Hall of Fame Induction</span>
                  <span className="font-bold">2016</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      ),
    },
    {
      ...DESIGN_STYLES.classicReference,
      component: (
        <Card className="overflow-hidden border-2 border-border">
          {/* Traditional Header */}
          <div className="border-b-2 border-border bg-muted/30 p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="mb-2 flex items-center gap-3">
                  <span className="text-5xl font-black">#9</span>
                  <div>
                    <h3 className="font-serif text-3xl font-bold uppercase tracking-tight">Troy Aikman</h3>
                    <p className="font-mono text-sm uppercase tracking-wide text-muted-foreground">
                      Quarterback • Dallas Cowboys
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex gap-4 border-t border-border pt-3 font-mono text-xs uppercase">
                  <span>Born: Nov 21, 1966</span>
                  <span>•</span>
                  <span>Henryetta, OK</span>
                  <span>•</span>
                  <span>6'4" 220 lbs</span>
                </div>
              </div>
              <div className="rounded border-2 border-yellow-600 bg-yellow-50 px-3 py-2 text-center">
                <div className="font-mono text-xs font-bold uppercase text-yellow-900">Hall of Fame</div>
                <div className="font-serif text-lg font-bold text-yellow-900">2016</div>
              </div>
            </div>
          </div>

          {/* Stats Section */}
          <div className="p-6">
            <h4 className="mb-4 border-b border-border pb-2 font-mono text-sm font-bold uppercase tracking-wide">
              Career Statistics (1989-2000)
            </h4>
            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h5 className="mb-3 font-mono text-xs font-bold uppercase text-muted-foreground">Passing</h5>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex justify-between border-b border-dashed border-border pb-1">
                    <span>Games Played</span>
                    <span className="font-bold">165</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-border pb-1">
                    <span>Completions/Attempts</span>
                    <span className="font-bold">3,064 / 4,694</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-border pb-1">
                    <span>Completion Percentage</span>
                    <span className="font-bold">65.3%</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-border pb-1">
                    <span>Passing Yards</span>
                    <span className="font-bold">32,942</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-border pb-1">
                    <span>Touchdowns</span>
                    <span className="font-bold">165</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-border pb-1">
                    <span>Interceptions</span>
                    <span className="font-bold">141</span>
                  </div>
                  <div className="flex justify-between border-b border-dashed border-border pb-1">
                    <span>Passer Rating</span>
                    <span className="font-bold">86.7</span>
                  </div>
                </div>
              </div>
              <div>
                <h5 className="mb-3 font-mono text-xs font-bold uppercase text-muted-foreground">Honors</h5>
                <div className="space-y-2 font-mono text-sm">
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600">★</span>
                    <span>3× Super Bowl Champion (XXVII, XXVIII, XXX)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-yellow-600">★</span>
                    <span>Super Bowl XXVII MVP</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600">●</span>
                    <span>6× Pro Bowl (1991-1996)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600">●</span>
                    <span>3× First-Team All-Pro</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600">◆</span>
                    <span>Pro Football Hall of Fame (2016)</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <span className="text-orange-600">◆</span>
                    <span>Cowboys Ring of Honor</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ),
    },
    {
      ...DESIGN_STYLES.premiumGlass,
      component: (
        <Card className="overflow-hidden">
          {/* Hero Section with Image Placeholder */}
          <div className="relative h-64 bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
            <div className="absolute inset-0 bg-[url('/abstract-football-pattern.png')] bg-cover bg-center opacity-20" />
            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/80 to-transparent p-8">
              <div className="flex items-end gap-6">
                <div className="flex h-32 w-32 items-center justify-center rounded-lg border-4 border-white/20 bg-white/10 text-6xl font-bold text-white backdrop-blur">
                  9
                </div>
                <div className="flex-1 text-white">
                  <h3 className="text-balance text-4xl font-bold leading-tight">Troy Aikman</h3>
                  <p className="mt-1 text-xl text-white/80">The Architect of a Dynasty</p>
                  <div className="mt-3 flex gap-3">
                    <Badge className="bg-yellow-500 text-yellow-950">Hall of Fame</Badge>
                    <Badge variant="outline" className="border-white/30 text-white">
                      3× Super Bowl Champion
                    </Badge>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-8">
            <div className="mb-6 grid grid-cols-4 gap-4 border-b border-border pb-6">
              <div className="text-center">
                <div className="text-3xl font-bold">12</div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Seasons</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">165</div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Games</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">32,942</div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Pass Yards</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold">86.7</div>
                <div className="text-xs uppercase tracking-wide text-muted-foreground">Rating</div>
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="mb-4 text-sm font-bold uppercase tracking-wide">The Legacy</h4>
                <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                  Troy Aikman defined an era of Dallas Cowboys football, leading America's Team to three Super Bowl
                  championships in four years. His precision passing, leadership, and clutch performances in the biggest
                  moments cemented his place among the all-time greats. From the #1 overall pick in 1989 to Hall of Fame
                  induction in 2016, Aikman's journey represents the pinnacle of quarterback excellence.
                </p>
              </div>
              <div>
                <h4 className="mb-4 text-sm font-bold uppercase tracking-wide">Quick Facts</h4>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <div className="text-lg">📄</div>
                    <div className="text-sm">
                      <div className="font-medium">College: UCLA Bruins</div>
                      <div className="text-xs text-muted-foreground">All-American, 1988</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <div className="text-lg">🏆</div>
                    <div className="text-sm">
                      <div className="font-medium">Draft: 1989, 1st Overall</div>
                      <div className="text-xs text-muted-foreground">Dallas Cowboys</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                    <div className="text-lg">🎥</div>
                    <div className="text-sm">
                      <div className="font-medium">Current: FOX Sports Analyst</div>
                      <div className="text-xs text-muted-foreground">Lead NFL Broadcaster</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>
      ),
    },
  ]

  return (
    <DesignShowcaseLayout
      title="NFL Player Profile Pages"
      description="Five comprehensive player profile designs showcasing hero headers, tabbed navigation, career statistics, achievements, game logs, and media galleries."
    >
      {designs.map((design, index) => (
        <DesignSection
          key={index}
          number={index + 1}
          title={design.title}
          description={design.description}
          badge={design.badge}
        >
          {design.component}
        </DesignSection>
      ))}
    </DesignShowcaseLayout>
  )
}
