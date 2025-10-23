import { DesignShowcaseLayout } from "@/components/design-showcase-layout"
import { DesignSection } from "@/components/design-section"
import { DESIGN_STYLES } from "@/lib/design-styles"

export default function TeamPagesPage() {
  const designs = [
    {
      ...DESIGN_STYLES.modernDashboard,
      component: (
        <div className="rounded-lg border border-border bg-card p-6">
          {/* Team Header */}
          <div className="mb-6 flex items-start gap-6 border-b border-border pb-6">
            <div className="flex h-24 w-24 items-center justify-center rounded-lg bg-[#003594] text-4xl font-bold text-white">
              DAL
            </div>
            <div className="flex-1 space-y-2">
              <h3 className="text-3xl font-bold">Dallas Cowboys</h3>
              <div className="flex items-center gap-4 text-sm">
                <span className="rounded-full bg-green-500/10 px-3 py-1 font-semibold text-green-600">6-2</span>
                <span className="text-muted-foreground">1st NFC East</span>
                <span className="text-muted-foreground">78% Playoff Probability</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Next: vs PHI</span>
                <span>•</span>
                <span>SUN 3:00 PM ET</span>
                <span>•</span>
                <span>AT&T Stadium</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="mb-6 grid grid-cols-4 gap-4">
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="text-sm text-muted-foreground">Points Per Game</div>
              <div className="mt-1 text-2xl font-bold">28.5</div>
              <div className="text-xs text-muted-foreground">5th in NFL</div>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="text-sm text-muted-foreground">Yards Per Game</div>
              <div className="mt-1 text-2xl font-bold">427.3</div>
              <div className="text-xs text-muted-foreground">3rd in NFL</div>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="text-sm text-muted-foreground">Points Allowed</div>
              <div className="mt-1 text-2xl font-bold">21.3</div>
              <div className="text-xs text-muted-foreground">2nd in NFL</div>
            </div>
            <div className="rounded-lg border border-border bg-background p-4">
              <div className="text-sm text-muted-foreground">Turnover Diff</div>
              <div className="mt-1 text-2xl font-bold text-green-600">+8</div>
              <div className="text-xs text-muted-foreground">1st in NFL</div>
            </div>
          </div>

          {/* Key Players */}
          <div className="mb-6">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Key Players</h4>
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#003594] text-lg font-bold text-white">
                  9
                </div>
                <div>
                  <div className="font-semibold">Troy Aikman</div>
                  <div className="text-xs text-muted-foreground">QB • 3,518 YDS • 23 TD</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#003594] text-lg font-bold text-white">
                  22
                </div>
                <div>
                  <div className="font-semibold">Emmitt Smith</div>
                  <div className="text-xs text-muted-foreground">RB • 1,563 YDS • 12 TD</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border bg-background p-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#003594] text-lg font-bold text-white">
                  88
                </div>
                <div>
                  <div className="font-semibold">Michael Irvin</div>
                  <div className="text-xs text-muted-foreground">WR • 1,021 YDS • 8 TD</div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Games */}
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">Recent Games</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-green-500/10 text-sm font-bold text-green-600">
                    W
                  </div>
                  <span className="font-medium">vs NYG</span>
                </div>
                <span className="font-bold">28-23</span>
                <span className="text-sm text-muted-foreground">Oct 5</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-green-500/10 text-sm font-bold text-green-600">
                    W
                  </div>
                  <span className="font-medium">@ PHI</span>
                </div>
                <span className="font-bold">21-14</span>
                <span className="text-sm text-muted-foreground">Sep 28</span>
              </div>
              <div className="flex items-center justify-between rounded-lg border border-border bg-background p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded bg-red-500/10 text-sm font-bold text-red-600">
                    L
                  </div>
                  <span className="font-medium">vs WAS</span>
                </div>
                <span className="font-bold">23-31</span>
                <span className="text-sm text-muted-foreground">Sep 21</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      ...DESIGN_STYLES.dataHeavy,
      component: (
        <div className="rounded-lg border border-border bg-card p-6">
          {/* Compact Header */}
          <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
            <div className="flex items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded bg-[#003594] text-2xl font-bold text-white">
                DAL
              </div>
              <div>
                <h3 className="text-2xl font-bold">Dallas Cowboys</h3>
                <div className="text-sm text-muted-foreground">6-2 • 1st NFC East</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground">Next Game</div>
              <div className="font-semibold">vs PHI • SUN 3:00 PM</div>
            </div>
          </div>

          {/* Comprehensive Stats Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="pb-3 text-left font-semibold">Category</th>
                  <th className="pb-3 text-right font-semibold">Value</th>
                  <th className="pb-3 text-right font-semibold">Rank</th>
                  <th className="pb-3 text-right font-semibold">League Avg</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-3 font-medium">Points Per Game</td>
                  <td className="py-3 text-right font-bold">28.5</td>
                  <td className="py-3 text-right text-green-600">5th</td>
                  <td className="py-3 text-right text-muted-foreground">23.2</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Total Yards Per Game</td>
                  <td className="py-3 text-right font-bold">427.3</td>
                  <td className="py-3 text-right text-green-600">3rd</td>
                  <td className="py-3 text-right text-muted-foreground">352.8</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Passing Yards Per Game</td>
                  <td className="py-3 text-right font-bold">285.2</td>
                  <td className="py-3 text-right text-green-600">8th</td>
                  <td className="py-3 text-right text-muted-foreground">245.1</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Rushing Yards Per Game</td>
                  <td className="py-3 text-right font-bold">142.1</td>
                  <td className="py-3 text-right text-green-600">3rd</td>
                  <td className="py-3 text-right text-muted-foreground">107.7</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Points Allowed Per Game</td>
                  <td className="py-3 text-right font-bold">21.3</td>
                  <td className="py-3 text-right text-green-600">2nd</td>
                  <td className="py-3 text-right text-muted-foreground">23.2</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Yards Allowed Per Game</td>
                  <td className="py-3 text-right font-bold">325.7</td>
                  <td className="py-3 text-right text-green-600">4th</td>
                  <td className="py-3 text-right text-muted-foreground">352.8</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Sacks</td>
                  <td className="py-3 text-right font-bold">18</td>
                  <td className="py-3 text-right text-yellow-600">12th</td>
                  <td className="py-3 text-right text-muted-foreground">15.2</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Interceptions</td>
                  <td className="py-3 text-right font-bold">9</td>
                  <td className="py-3 text-right text-green-600">6th</td>
                  <td className="py-3 text-right text-muted-foreground">6.8</td>
                </tr>
                <tr>
                  <td className="py-3 font-medium">Turnover Differential</td>
                  <td className="py-3 text-right font-bold text-green-600">+8</td>
                  <td className="py-3 text-right text-green-600">1st</td>
                  <td className="py-3 text-right text-muted-foreground">+0.2</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Division Standings */}
          <div className="mt-6 border-t border-border pt-6">
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              NFC East Standings
            </h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded bg-primary/5 p-2 font-semibold">
                <span>1. Dallas Cowboys</span>
                <span>6-2 (.750)</span>
              </div>
              <div className="flex items-center justify-between p-2 text-muted-foreground">
                <span>2. Philadelphia Eagles</span>
                <span>5-3 (.625)</span>
              </div>
              <div className="flex items-center justify-between p-2 text-muted-foreground">
                <span>3. Washington Commanders</span>
                <span>4-3 (.571)</span>
              </div>
              <div className="flex items-center justify-between p-2 text-muted-foreground">
                <span>4. New York Giants</span>
                <span>3-5 (.375)</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      ...DESIGN_STYLES.cardBased,
      component: (
        <div className="space-y-4">
          {/* Hero Card */}
          <div className="relative overflow-hidden rounded-lg border border-border bg-gradient-to-br from-[#003594] to-[#002a75] p-8 text-white">
            <div className="relative z-10">
              <div className="mb-4 flex items-center gap-4">
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-white/10 text-3xl font-bold backdrop-blur">
                  DAL
                </div>
                <div>
                  <h3 className="text-3xl font-bold">Dallas Cowboys</h3>
                  <div className="text-lg opacity-90">America's Team</div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div>
                  <div className="text-sm opacity-75">Record</div>
                  <div className="text-2xl font-bold">6-2</div>
                </div>
                <div className="h-12 w-px bg-white/20" />
                <div>
                  <div className="text-sm opacity-75">Division</div>
                  <div className="text-2xl font-bold">1st</div>
                </div>
                <div className="h-12 w-px bg-white/20" />
                <div>
                  <div className="text-sm opacity-75">Playoff Odds</div>
                  <div className="text-2xl font-bold">78%</div>
                </div>
              </div>
            </div>
          </div>

          {/* Grid of Info Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Next Game</div>
              <div className="mb-1 text-lg font-bold">vs Philadelphia Eagles</div>
              <div className="text-sm text-muted-foreground">SUN 3:00 PM ET</div>
              <div className="text-sm text-muted-foreground">AT&T Stadium</div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Offense</div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>PPG</span>
                  <span className="font-bold">28.5 (5th)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>YPG</span>
                  <span className="font-bold">427.3 (3rd)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Pass YPG</span>
                  <span className="font-bold">285.2 (8th)</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border border-border bg-card p-4">
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Defense</div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>PA/G</span>
                  <span className="font-bold">21.3 (2nd)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Sacks</span>
                  <span className="font-bold">18 (12th)</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>INTs</span>
                  <span className="font-bold">9 (6th)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Roster Preview Card */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h4 className="mb-4 text-lg font-bold">Roster Highlights</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#003594] text-xl font-bold text-white">
                  9
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Troy Aikman</div>
                  <div className="text-xs text-muted-foreground">Quarterback</div>
                  <div className="mt-1 text-sm font-medium">3,518 YDS • 23 TD • 12 INT</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#003594] text-xl font-bold text-white">
                  22
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Emmitt Smith</div>
                  <div className="text-xs text-muted-foreground">Running Back</div>
                  <div className="mt-1 text-sm font-medium">1,563 YDS • 12 TD</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#003594] text-xl font-bold text-white">
                  88
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Michael Irvin</div>
                  <div className="text-xs text-muted-foreground">Wide Receiver</div>
                  <div className="mt-1 text-sm font-medium">68 REC • 1,021 YDS • 8 TD</div>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border border-border p-3">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#003594] text-xl font-bold text-white">
                  54
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Charles Haley</div>
                  <div className="text-xs text-muted-foreground">Defensive End</div>
                  <div className="mt-1 text-sm font-medium">8.5 Sacks • 2nd on team</div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule Card */}
          <div className="rounded-lg border border-border bg-card p-6">
            <h4 className="mb-4 text-lg font-bold">Schedule</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-4 rounded-lg border border-border p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-green-500/10 font-bold text-green-600">
                  W
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Week 6 • vs New York Giants</div>
                  <div className="text-sm text-muted-foreground">Oct 5, 2025</div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold">28-23</div>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border-2 border-primary bg-primary/5 p-3">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-primary/10 font-bold text-primary">
                  •
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Week 7 • @ Philadelphia Eagles</div>
                  <div className="text-sm text-muted-foreground">Oct 19, 2025 • 3:00 PM ET</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-primary">UPCOMING</div>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border border-border p-3 opacity-60">
                <div className="flex h-10 w-10 items-center justify-center rounded bg-muted font-bold text-muted-foreground">
                  —
                </div>
                <div className="flex-1">
                  <div className="font-semibold">Week 8 • @ Baltimore Ravens</div>
                  <div className="text-sm text-muted-foreground">Oct 26, 2025 • TBD</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      ...DESIGN_STYLES.classicReference,
      component: (
        <div className="rounded-lg border border-border bg-card p-6 font-mono text-sm">
          {/* ASCII-style Header */}
          <div className="mb-6 border-b-2 border-border pb-4">
            <div className="mb-2 text-2xl font-bold">DALLAS COWBOYS</div>
            <div className="flex gap-8 text-xs">
              <span>RECORD: 6-2 (.750)</span>
              <span>DIVISION: 1st NFC East</span>
              <span>CONFERENCE: 2nd NFC</span>
              <span>PLAYOFF ODDS: 78%</span>
            </div>
          </div>

          {/* Team Stats Table */}
          <div className="mb-6">
            <div className="mb-2 font-bold">TEAM STATISTICS (2025 Season)</div>
            <div className="overflow-x-auto">
              <pre className="text-xs leading-relaxed">
                {`┌──────────────────────────┬─────────┬──────┬────────────┐
│ CATEGORY                 │  VALUE  │ RANK │ LEAGUE AVG │
├──────────────────────────┼─────────┼──────┼────────────┤
│ Points Per Game          │   28.5  │  5th │    23.2    │
│ Total Yards Per Game     │  427.3  │  3rd │   352.8    │
│ Passing Yards Per Game   │  285.2  │  8th │   245.1    │
│ Rushing Yards Per Game   │  142.1  │  3rd │   107.7    │
│ Points Allowed Per Game  │   21.3  │  2nd │    23.2    │
│ Yards Allowed Per Game   │  325.7  │  4th │   352.8    │
│ Sacks                    │     18  │ 12th │    15.2    │
│ Interceptions            │      9  │  6th │     6.8    │
│ Turnover Differential    │     +8  │  1st │    +0.2    │
└──────────────────────────┴─────────┴──────┴────────────┘`}
              </pre>
            </div>
          </div>

          {/* Roster Table */}
          <div className="mb-6">
            <div className="mb-2 font-bold">KEY PLAYERS</div>
            <div className="overflow-x-auto">
              <pre className="text-xs leading-relaxed">
                {`┌────┬──────────────────┬─────┬──────────────────────────────┐
│ NO │ NAME             │ POS │ STATS                        │
├────┼──────────────────┼─────┼──────────────────────────────┤
│  9 │ Troy Aikman      │ QB  │ 3,518 YDS • 23 TD • 12 INT   │
│ 22 │ Emmitt Smith     │ RB  │ 1,563 YDS • 12 TD • 4.8 AVG  │
│ 88 │ Michael Irvin    │ WR  │ 68 REC • 1,021 YDS • 8 TD    │
│ 54 │ Charles Haley    │ DE  │ 8.5 SACKS • 2nd on team      │
└────┴──────────────────┴─────┴──────────────────────────────┘`}
              </pre>
            </div>
          </div>

          {/* Schedule */}
          <div className="mb-6">
            <div className="mb-2 font-bold">SCHEDULE & RESULTS</div>
            <div className="overflow-x-auto">
              <pre className="text-xs leading-relaxed">
                {`┌──────┬────────────┬─────────────────────┬──────────┬────────┐
│ WEEK │    DATE    │ OPPONENT            │   TIME   │ RESULT │
├──────┼────────────┼─────────────────────┼──────────┼────────┤
│  1   │ Sep 5      │ @ Kansas City       │ 8:15 PM  │ L21-28 │
│  2   │ Sep 12     │ vs Washington       │ 1:00 PM  │ W28-23 │
│  3   │ Sep 19     │ @ Denver            │ 4:15 PM  │ W34-24 │
│  4   │ Sep 26     │ @ Philadelphia      │ 1:00 PM  │ W21-14 │
│  5   │ Oct 3      │ vs New York Giants  │ 1:00 PM  │ W28-23 │
│  6   │ Oct 10     │ Bye Week            │    —     │   —    │
│  7   │ Oct 19     │ @ Philadelphia      │ 3:00 PM  │  TBD   │
│  8   │ Oct 26     │ @ Baltimore         │   TBD    │  TBD   │
└──────┴────────────┴─────────────────────┴──────────┴────────┘`}
              </pre>
            </div>
          </div>

          {/* Division Standings */}
          <div>
            <div className="mb-2 font-bold">NFC EAST STANDINGS</div>
            <div className="overflow-x-auto">
              <pre className="text-xs leading-relaxed">
                {`┌────┬─────────────────────────┬─────┬─────┬──────┬──────┐
│ RK │ TEAM                    │  W  │  L  │ PCT  │  GB  │
├────┼─────────────────────────┼─────┼─────┼──────┼──────┤
│ 1  │ Dallas Cowboys          │  6  │  2  │ .750 │  —   │
│ 2  │ Philadelphia Eagles     │  5  │  3  │ .625 │ 1.0  │
│ 3  │ Washington Commanders   │  4  │  3  │ .571 │ 2.5  │
│ 4  │ New York Giants         │  3  │  5  │ .375 │ 4.0  │
└────┴─────────────────────────┴─────┴─────┴──────┴──────┘`}
              </pre>
            </div>
          </div>
        </div>
      ),
    },
    {
      ...DESIGN_STYLES.premiumGlass,
      component: (
        <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-br from-[#003594]/5 via-background to-[#ACC0C6]/5 p-8">
          {/* Hero Section */}
          <div className="relative mb-8 overflow-hidden rounded-2xl border border-border/50 bg-gradient-to-br from-[#003594] to-[#002a75] p-8 backdrop-blur-xl">
            <div className="absolute inset-0 bg-[url('/abstract-football-pattern.png')] opacity-5" />
            <div className="relative z-10 flex items-center gap-6">
              <div className="flex h-28 w-28 items-center justify-center rounded-2xl bg-white/10 text-4xl font-bold text-white shadow-2xl backdrop-blur">
                DAL
              </div>
              <div className="flex-1 text-white">
                <h3 className="mb-2 text-4xl font-bold">Dallas Cowboys</h3>
                <div className="mb-3 flex items-center gap-4 text-lg">
                  <span className="rounded-full bg-white/20 px-4 py-1 font-bold backdrop-blur">6-2</span>
                  <span className="opacity-90">1st NFC East</span>
                  <span className="opacity-75">•</span>
                  <span className="opacity-90">78% Playoff Probability</span>
                </div>
                <div className="flex items-center gap-3 text-sm opacity-75">
                  <span>Next: vs Philadelphia Eagles</span>
                  <span>•</span>
                  <span>SUN 3:00 PM ET</span>
                  <span>•</span>
                  <span>AT&T Stadium</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid with Glass Cards */}
          <div className="mb-8 grid grid-cols-4 gap-4">
            <div className="rounded-xl border border-border/50 bg-background/60 p-4 backdrop-blur-sm">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Points Per Game
              </div>
              <div className="mb-1 text-3xl font-bold">28.5</div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[85%] bg-gradient-to-r from-green-500 to-emerald-500" />
                </div>
                <span className="text-xs font-semibold text-green-600">5th</span>
              </div>
            </div>
            <div className="rounded-xl border border-border/50 bg-background/60 p-4 backdrop-blur-sm">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Total Yards
              </div>
              <div className="mb-1 text-3xl font-bold">427.3</div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[90%] bg-gradient-to-r from-blue-500 to-cyan-500" />
                </div>
                <span className="text-xs font-semibold text-blue-600">3rd</span>
              </div>
            </div>
            <div className="rounded-xl border border-border/50 bg-background/60 p-4 backdrop-blur-sm">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Points Allowed
              </div>
              <div className="mb-1 text-3xl font-bold">21.3</div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-[95%] bg-gradient-to-r from-green-500 to-emerald-500" />
                </div>
                <span className="text-xs font-semibold text-green-600">2nd</span>
              </div>
            </div>
            <div className="rounded-xl border border-border/50 bg-background/60 p-4 backdrop-blur-sm">
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Turnover Diff
              </div>
              <div className="mb-1 text-3xl font-bold text-green-600">+8</div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                  <div className="h-full w-full bg-gradient-to-r from-green-500 to-emerald-500" />
                </div>
                <span className="text-xs font-semibold text-green-600">1st</span>
              </div>
            </div>
          </div>

          {/* Key Players with Glass Effect */}
          <div className="mb-8 rounded-xl border border-border/50 bg-background/60 p-6 backdrop-blur-sm">
            <h4 className="mb-4 text-lg font-bold">Star Players</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-4 rounded-lg border border-border/50 bg-background/40 p-4 backdrop-blur">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#003594] to-[#002a75] text-2xl font-bold text-white shadow-lg">
                  9
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold">Troy Aikman</div>
                  <div className="text-xs text-muted-foreground">Quarterback</div>
                  <div className="mt-1 flex gap-3 text-sm font-medium">
                    <span>3,518 YDS</span>
                    <span>•</span>
                    <span>23 TD</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border border-border/50 bg-background/40 p-4 backdrop-blur">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#003594] to-[#002a75] text-2xl font-bold text-white shadow-lg">
                  22
                </div>
                <div className="flex-1">
                  <div className="text-lg font-bold">Emmitt Smith</div>
                  <div className="text-xs text-muted-foreground">Running Back</div>
                  <div className="mt-1 flex gap-3 text-sm font-medium">
                    <span>1,563 YDS</span>
                    <span>•</span>
                    <span>12 TD</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Games Timeline */}
          <div className="rounded-xl border border-border/50 bg-background/60 p-6 backdrop-blur-sm">
            <h4 className="mb-4 text-lg font-bold">Recent Performance</h4>
            <div className="space-y-3">
              <div className="flex items-center gap-4 rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-lg font-bold text-green-600">
                  W
                </div>
                <div className="flex-1">
                  <div className="font-semibold">vs New York Giants</div>
                  <div className="text-sm text-muted-foreground">Week 6 • Oct 5, 2025</div>
                </div>
                <div className="text-2xl font-bold">28-23</div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border border-green-500/20 bg-green-500/5 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-500/20 text-lg font-bold text-green-600">
                  W
                </div>
                <div className="flex-1">
                  <div className="font-semibold">@ Philadelphia Eagles</div>
                  <div className="text-sm text-muted-foreground">Week 4 • Sep 28, 2025</div>
                </div>
                <div className="text-2xl font-bold">21-14</div>
              </div>
              <div className="flex items-center gap-4 rounded-lg border border-red-500/20 bg-red-500/5 p-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-500/20 text-lg font-bold text-red-600">
                  L
                </div>
                <div className="flex-1">
                  <div className="font-semibold">vs Washington Commanders</div>
                  <div className="text-sm text-muted-foreground">Week 3 • Sep 21, 2025</div>
                </div>
                <div className="text-2xl font-bold">23-31</div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ]

  return (
    <DesignShowcaseLayout
      title="NFL Team Pages"
      description="5 design variations for comprehensive team information displays"
    >
      {designs.map((design, index) => (
        <DesignSection key={index} number={index + 1} title={design.name} description={design.description}>
          {design.component}
        </DesignSection>
      ))}
    </DesignShowcaseLayout>
  )
}
