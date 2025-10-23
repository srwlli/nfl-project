"use client"

import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function NextDownMetricsPage() {
  return (
    <div className="min-h-screen bg-black text-gray-100">
      <div className="border-b-2 border-cyan-500/30 bg-gradient-to-r from-gray-900 via-black to-gray-900 px-6 py-3">
        <div className="mx-auto flex max-w-7xl items-center justify-between font-mono text-xs uppercase tracking-wider">
          <div className="flex items-center gap-6">
            <span className="text-cyan-400">WEEK 7</span>
            <span className="text-gray-400">Sunday, October 20, 2024</span>
            <span className="text-gray-400">4:25 PM ET</span>
            <span className="text-gray-400">CBS</span>
          </div>
          <Badge className="bg-green-500/20 text-green-400 border border-green-500/50 font-mono">FINAL</Badge>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-6 p-6">
        <Card className="border-2 border-gray-800 bg-gradient-to-br from-gray-900 to-black p-6 shadow-[0_0_30px_rgba(6,182,212,0.15)]">
          <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-8">
            {/* Away Team */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-red-500/10 border-2 border-red-500/30 font-mono text-2xl font-black">
                  SF
                </div>
                <div>
                  <div className="font-mono text-sm uppercase tracking-wider text-gray-400">Away</div>
                  <div className="text-xl font-bold">San Francisco 49ers</div>
                  <div className="font-mono text-sm text-gray-400">
                    5-2 <span className="text-red-400">→ 5-3</span>
                  </div>
                </div>
              </div>
              <div className="text-5xl font-black tabular-nums text-gray-100">28</div>
            </div>

            {/* VS Divider */}
            <div className="flex flex-col items-center gap-2">
              <div className="h-20 w-px bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent" />
              <div className="font-mono text-xs uppercase tracking-widest text-cyan-400">VS</div>
              <div className="h-20 w-px bg-gradient-to-b from-transparent via-cyan-500/50 to-transparent" />
            </div>

            {/* Home Team */}
            <div className="space-y-3 text-right">
              <div className="flex items-center justify-end gap-3">
                <div>
                  <div className="font-mono text-sm uppercase tracking-wider text-gray-400">Home</div>
                  <div className="text-xl font-bold">Kansas City Chiefs</div>
                  <div className="font-mono text-sm text-gray-400">
                    6-1 <span className="text-green-400">→ 7-1</span>
                  </div>
                </div>
                <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-red-500/10 border-2 border-red-500/30 font-mono text-2xl font-black">
                  KC
                </div>
              </div>
              <div className="text-5xl font-black tabular-nums text-green-400">35</div>
            </div>
          </div>

          {/* Quarter by Quarter */}
          <div className="mt-6 grid grid-cols-5 gap-2 border-t-2 border-gray-800 pt-4">
            {[
              { q: "Q1", away: 7, home: 7 },
              { q: "Q2", away: 7, home: 7 },
              { q: "Q3", away: 7, home: 7 },
              { q: "Q4", away: 7, home: 14 },
              { q: "FINAL", away: 28, home: 35, final: true },
            ].map((quarter) => (
              <div
                key={quarter.q}
                className={`rounded-lg border-2 ${quarter.final ? "border-cyan-500/50 bg-cyan-500/5" : "border-gray-800 bg-gray-900/50"} p-3 text-center`}
              >
                <div className="font-mono text-xs uppercase tracking-wider text-gray-400">{quarter.q}</div>
                <div className="mt-1 font-mono text-lg font-bold tabular-nums">
                  {quarter.away}-{quarter.home}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Game Info Cards */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: "VENUE", value: "Arrowhead Stadium" },
            { label: "WEATHER", value: "72°F, Clear" },
            { label: "ATTENDANCE", value: "76,416" },
          ].map((info) => (
            <Card
              key={info.label}
              className="border-2 border-gray-800 bg-gradient-to-br from-gray-900 to-black p-4 hover:border-cyan-500/30 transition-colors"
            >
              <div className="font-mono text-xs uppercase tracking-wider text-cyan-400">{info.label}</div>
              <div className="mt-1 text-lg font-bold">{info.value}</div>
            </Card>
          ))}
        </div>

        {/* Season Context */}
        <Card className="border-2 border-gray-800 bg-gradient-to-br from-gray-900 to-black p-6">
          <h2 className="mb-4 font-mono text-sm uppercase tracking-wider text-cyan-400">
            Season Context & Playoff Implications
          </h2>
          <div className="grid gap-6 md:grid-cols-2">
            {/* KC */}
            <div className="space-y-3 rounded-lg border-2 border-green-500/20 bg-green-500/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">Kansas City Chiefs</span>
                <Badge className="bg-green-500/20 text-green-400 border border-green-500/50 font-mono text-xs">
                  CLINCHED PLAYOFFS
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 font-mono text-sm">
                <div>
                  <div className="text-gray-400">Division</div>
                  <div className="text-green-400">1st AFC West (7-1)</div>
                </div>
                <div>
                  <div className="text-gray-400">Conference</div>
                  <div className="text-green-400">1st AFC (7-1)</div>
                </div>
                <div>
                  <div className="text-gray-400">Playoff Prob</div>
                  <div className="text-green-400">99.8%</div>
                </div>
                <div>
                  <div className="text-gray-400">Streak</div>
                  <div className="text-green-400">W4</div>
                </div>
              </div>
              <div className="flex gap-4 border-t border-green-500/20 pt-3 font-mono text-xs">
                <span>
                  Home: <span className="text-green-400">4-0</span>
                </span>
                <span>
                  Away: <span className="text-green-400">3-1</span>
                </span>
                <span>
                  Div: <span className="text-green-400">2-0</span>
                </span>
              </div>
            </div>

            {/* SF */}
            <div className="space-y-3 rounded-lg border-2 border-amber-500/20 bg-amber-500/5 p-4">
              <div className="flex items-center justify-between">
                <span className="text-lg font-bold">San Francisco 49ers</span>
                <Badge className="bg-amber-500/20 text-amber-400 border border-amber-500/50 font-mono text-xs">
                  IN THE HUNT
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-3 font-mono text-sm">
                <div>
                  <div className="text-gray-400">Division</div>
                  <div className="text-amber-400">2nd NFC West (5-3)</div>
                </div>
                <div>
                  <div className="text-gray-400">Conference</div>
                  <div className="text-amber-400">5th NFC (5-3)</div>
                </div>
                <div>
                  <div className="text-gray-400">Playoff Prob</div>
                  <div className="text-amber-400">72.4%</div>
                </div>
                <div>
                  <div className="text-gray-400">Streak</div>
                  <div className="text-red-400">L1</div>
                </div>
              </div>
              <div className="flex gap-4 border-t border-amber-500/20 pt-3 font-mono text-xs">
                <span>
                  Home: <span className="text-amber-400">3-1</span>
                </span>
                <span>
                  Away: <span className="text-amber-400">2-2</span>
                </span>
                <span>
                  Div: <span className="text-amber-400">1-1</span>
                </span>
              </div>
            </div>
          </div>
        </Card>

        {/* Betting Results */}
        <Card className="border-2 border-gray-800 bg-gradient-to-br from-gray-900 to-black p-6">
          <h2 className="mb-4 font-mono text-sm uppercase tracking-wider text-cyan-400">Betting Results</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border-2 border-gray-800 bg-gray-900/50 p-4">
              <div className="mb-3 font-mono text-xs uppercase tracking-wider text-gray-400">Spread</div>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Opening:</span>
                  <span>KC -3.5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Closing:</span>
                  <span>KC -4.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Actual:</span>
                  <span className="text-green-400">KC +7</span>
                </div>
              </div>
              <Badge className="mt-3 w-full justify-center bg-green-500/20 text-green-400 border border-green-500/50 font-mono">
                KC COVERED
              </Badge>
            </div>

            <div className="rounded-lg border-2 border-gray-800 bg-gray-900/50 p-4">
              <div className="mb-3 font-mono text-xs uppercase tracking-wider text-gray-400">Total (O/U)</div>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Opening:</span>
                  <span>48.5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Closing:</span>
                  <span>49.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Actual:</span>
                  <span className="text-green-400">63</span>
                </div>
              </div>
              <Badge className="mt-3 w-full justify-center bg-green-500/20 text-green-400 border border-green-500/50 font-mono">
                OVER
              </Badge>
            </div>

            <div className="rounded-lg border-2 border-gray-800 bg-gray-900/50 p-4">
              <div className="mb-3 font-mono text-xs uppercase tracking-wider text-gray-400">Moneyline</div>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">KC:</span>
                  <span>-185</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">SF:</span>
                  <span>+155</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Winner:</span>
                  <span className="text-green-400">KC</span>
                </div>
              </div>
              <Badge className="mt-3 w-full justify-center bg-green-500/20 text-green-400 border border-green-500/50 font-mono">
                KC -185
              </Badge>
            </div>
          </div>
        </Card>

        {/* Player Milestones */}
        <Card className="border-2 border-gray-800 bg-gradient-to-br from-gray-900 to-black p-6">
          <h2 className="mb-4 font-mono text-sm uppercase tracking-wider text-cyan-400">
            Player Milestones & Achievements
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {[
              {
                player: "Patrick Mahomes",
                team: "KC",
                pos: "QB",
                icon: "🏆",
                color: "amber",
                milestone: "300th Career TD Pass",
                desc: "Became 7th QB in NFL history to reach 300 career touchdown passes",
              },
              {
                player: "Travis Kelce",
                team: "KC",
                pos: "TE",
                icon: "⭐",
                color: "green",
                milestone: "100th Career TD Reception",
                desc: "First tight end in Chiefs history to reach 100 career receiving touchdowns",
              },
              {
                player: "Christian McCaffrey",
                team: "SF",
                pos: "RB",
                icon: "📊",
                color: "blue",
                milestone: "5th Consecutive 100-Yard Game",
                desc: "Extended streak of 100+ rushing yards to 5 games",
              },
              {
                player: "Patrick Mahomes",
                team: "KC",
                pos: "QB",
                icon: "🎯",
                color: "purple",
                milestone: "Perfect Passer Rating",
                desc: "Achieved 158.3 passer rating (28/35, 342 YDS, 4 TD, 0 INT)",
              },
            ].map((m, i) => (
              <div
                key={i}
                className={`rounded-lg border-2 border-${m.color}-500/20 bg-${m.color}-500/5 p-4 hover:border-${m.color}-500/40 transition-colors`}
              >
                <div className="mb-2 flex items-center justify-between">
                  <div>
                    <div className="font-bold">{m.player}</div>
                    <div className="font-mono text-xs text-gray-400">
                      {m.team} · {m.pos}
                    </div>
                  </div>
                  <div className="text-2xl">{m.icon}</div>
                </div>
                <div className={`mb-1 font-mono text-sm font-bold text-${m.color}-400`}>{m.milestone}</div>
                <div className="text-sm text-gray-400">{m.desc}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Game Narrative */}
        <Card className="border-2 border-gray-800 bg-gradient-to-br from-gray-900 to-black p-6">
          <h2 className="mb-4 font-mono text-sm uppercase tracking-wider text-cyan-400">Game Narrative</h2>

          <div className="mb-6 rounded-lg border-2 border-gray-800 bg-gray-900/50 p-4">
            <h3 className="mb-2 font-mono text-xs uppercase tracking-wider text-gray-400">Game Summary</h3>
            <p className="text-sm leading-relaxed text-gray-300">
              Patrick Mahomes threw for 342 yards and 4 touchdowns as the Kansas City Chiefs defeated the San Francisco
              49ers 35-28 in a thrilling AFC-NFC showdown at Arrowhead Stadium. The Chiefs defense forced a crucial
              fourth-quarter interception to seal the victory and improve to 7-1 on the season.
            </p>
          </div>

          <div className="mb-6">
            <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-gray-400">Key Turning Points</h3>
            <div className="space-y-3">
              {[
                {
                  num: 1,
                  title: "Mahomes 300th TD Pass (Q2, 11:23)",
                  desc: "Historic 24-yard touchdown to Rashee Rice gave KC momentum and a 14-7 lead",
                  color: "amber",
                },
                {
                  num: 2,
                  title: "McDuffie Interception (Q4, 6:42)",
                  desc: "Trent McDuffie's interception of Brock Purdy ended SF's comeback attempt",
                  color: "red",
                },
                {
                  num: 3,
                  title: "Kelce 100th TD (Q4, 2:18)",
                  desc: "Travis Kelce's milestone 100th career TD reception extended KC's lead to 35-28",
                  color: "green",
                },
              ].map((tp) => (
                <div key={tp.num} className="flex gap-3 rounded-lg border-2 border-gray-800 bg-gray-900/50 p-3">
                  <div
                    className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-${tp.color}-500/20 border-2 border-${tp.color}-500/50 font-mono text-sm font-bold text-${tp.color}-400`}
                  >
                    {tp.num}
                  </div>
                  <div>
                    <div className="font-mono text-sm font-bold">{tp.title}</div>
                    <div className="text-sm text-gray-400">{tp.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-gray-400">Star Performers</h3>
            <div className="grid gap-3 md:grid-cols-3">
              {[
                {
                  player: "Patrick Mahomes",
                  team: "KC",
                  pos: "QB",
                  stats: "28/35, 342 YDS, 4 TD",
                  hl: "158.3 Rating",
                  color: "green",
                },
                {
                  player: "Travis Kelce",
                  team: "KC",
                  pos: "TE",
                  stats: "9 REC, 124 YDS, 2 TD",
                  hl: "100th Career TD",
                  color: "amber",
                },
                {
                  player: "Christian McCaffrey",
                  team: "SF",
                  pos: "RB",
                  stats: "22 CAR, 112 YDS, 1 TD",
                  hl: "5th Straight 100+",
                  color: "blue",
                },
              ].map((p, i) => (
                <div key={i} className="rounded-lg border-2 border-gray-800 bg-gray-900/50 p-3 text-center">
                  <div className="text-2xl">⭐</div>
                  <div className="mt-2 font-bold">{p.player}</div>
                  <div className="font-mono text-xs text-gray-400">
                    {p.team} · {p.pos}
                  </div>
                  <div className="mt-2 font-mono text-sm">{p.stats}</div>
                  <Badge
                    className={`mt-2 bg-${p.color}-500/20 text-${p.color}-400 border border-${p.color}-500/50 font-mono text-xs`}
                  >
                    {p.hl}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Historical Context */}
        <Card className="border-2 border-gray-800 bg-gradient-to-br from-gray-900 to-black p-6">
          <h2 className="mb-4 font-mono text-sm uppercase tracking-wider text-cyan-400">Historical Context</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border-2 border-gray-800 bg-gray-900/50 p-4">
              <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-gray-400">Head-to-Head History</h3>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">All-Time Series:</span>
                  <span>SF leads 8-7</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">At Arrowhead:</span>
                  <span>KC leads 4-3</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Last Meeting:</span>
                  <span>Super Bowl LVIII</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Result:</span>
                  <span className="text-green-400">KC 25, SF 22 (OT)</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border-2 border-gray-800 bg-gray-900/50 p-4">
              <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-gray-400">Notable Context</h3>
              <ul className="space-y-2 text-sm text-gray-300">
                <li className="flex gap-2">
                  <span className="text-cyan-400">•</span>
                  <span>Super Bowl rematch from February 2024</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-400">•</span>
                  <span>Mahomes improved to 3-0 vs 49ers in his career</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-400">•</span>
                  <span>First regular season meeting since 2018</span>
                </li>
                <li className="flex gap-2">
                  <span className="text-cyan-400">•</span>
                  <span>Both teams entered as Super Bowl favorites</span>
                </li>
              </ul>
            </div>
          </div>
        </Card>

        {/* Player Statistics */}
        <Card className="border-2 border-gray-800 bg-gradient-to-br from-gray-900 to-black p-6">
          <h2 className="mb-4 font-mono text-sm uppercase tracking-wider text-cyan-400">
            Player Statistics (Box Score)
          </h2>
          <Tabs defaultValue="offense" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-gray-900 border-2 border-gray-800">
              <TabsTrigger
                value="offense"
                className="font-mono data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
              >
                OFFENSE
              </TabsTrigger>
              <TabsTrigger
                value="defense"
                className="font-mono data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
              >
                DEFENSE
              </TabsTrigger>
              <TabsTrigger
                value="special"
                className="font-mono data-[state=active]:bg-cyan-500/20 data-[state=active]:text-cyan-400"
              >
                SPECIAL TEAMS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="offense" className="space-y-6 mt-6">
              {/* Passing */}
              <div>
                <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-gray-400">Passing</h3>
                <div className="overflow-x-auto">
                  <table className="w-full font-mono text-sm">
                    <thead>
                      <tr className="border-b-2 border-cyan-500/30 text-xs uppercase tracking-wider text-gray-400">
                        <th className="pb-2 text-left">Player</th>
                        <th className="pb-2 text-center">C/ATT</th>
                        <th className="pb-2 text-center">YDS</th>
                        <th className="pb-2 text-center">TD</th>
                        <th className="pb-2 text-center">INT</th>
                        <th className="pb-2 text-center">RTG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { player: "P. Mahomes", team: "KC", catt: "28/35", yds: 342, td: 4, int: 0, rtg: 138.4 },
                        { player: "B. Purdy", team: "SF", catt: "24/38", yds: 298, td: 2, int: 1, rtg: 94.2 },
                      ].map((p, i) => (
                        <tr key={i} className="border-b border-gray-800 hover:bg-cyan-500/5 transition-colors">
                          <td className="py-3">
                            {p.player} <span className="text-gray-500">({p.team})</span>
                          </td>
                          <td className="text-center">{p.catt}</td>
                          <td className="text-center text-cyan-400 font-bold">{p.yds}</td>
                          <td className="text-center">{p.td}</td>
                          <td className="text-center">{p.int}</td>
                          <td className="text-center text-green-400">{p.rtg}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Rushing */}
              <div>
                <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-gray-400">Rushing</h3>
                <div className="overflow-x-auto">
                  <table className="w-full font-mono text-sm">
                    <thead>
                      <tr className="border-b-2 border-cyan-500/30 text-xs uppercase tracking-wider text-gray-400">
                        <th className="pb-2 text-left">Player</th>
                        <th className="pb-2 text-center">CAR</th>
                        <th className="pb-2 text-center">YDS</th>
                        <th className="pb-2 text-center">AVG</th>
                        <th className="pb-2 text-center">TD</th>
                        <th className="pb-2 text-center">LONG</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { player: "C. McCaffrey", team: "SF", car: 22, yds: 112, avg: 5.1, td: 1, long: 31 },
                        { player: "I. Pacheco", team: "KC", car: 18, yds: 89, avg: 4.9, td: 1, long: 24 },
                        { player: "J. Mason", team: "SF", car: 8, yds: 34, avg: 4.3, td: 0, long: 12 },
                      ].map((p, i) => (
                        <tr key={i} className="border-b border-gray-800 hover:bg-cyan-500/5 transition-colors">
                          <td className="py-3">
                            {p.player} <span className="text-gray-500">({p.team})</span>
                          </td>
                          <td className="text-center">{p.car}</td>
                          <td className="text-center text-cyan-400 font-bold">{p.yds}</td>
                          <td className="text-center">{p.avg}</td>
                          <td className="text-center">{p.td}</td>
                          <td className="text-center">{p.long}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Receiving */}
              <div>
                <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-gray-400">Receiving</h3>
                <div className="overflow-x-auto">
                  <table className="w-full font-mono text-sm">
                    <thead>
                      <tr className="border-b-2 border-cyan-500/30 text-xs uppercase tracking-wider text-gray-400">
                        <th className="pb-2 text-left">Player</th>
                        <th className="pb-2 text-center">REC</th>
                        <th className="pb-2 text-center">TGT</th>
                        <th className="pb-2 text-center">YDS</th>
                        <th className="pb-2 text-center">AVG</th>
                        <th className="pb-2 text-center">TD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { player: "T. Kelce", team: "KC", pos: "TE", rec: 9, tgt: 11, yds: 124, avg: 13.8, td: 2 },
                        { player: "B. Aiyuk", team: "SF", pos: "WR", rec: 8, tgt: 13, yds: 118, avg: 14.8, td: 1 },
                        { player: "R. Rice", team: "KC", pos: "WR", rec: 7, tgt: 9, yds: 96, avg: 13.7, td: 1 },
                        { player: "D. Samuel", team: "SF", pos: "WR", rec: 6, tgt: 10, yds: 82, avg: 13.7, td: 0 },
                      ].map((p, i) => (
                        <tr key={i} className="border-b border-gray-800 hover:bg-cyan-500/5 transition-colors">
                          <td className="py-3">
                            {p.player}{" "}
                            <span className="text-gray-500">
                              ({p.team} · {p.pos})
                            </span>
                          </td>
                          <td className="text-center">{p.rec}</td>
                          <td className="text-center">{p.tgt}</td>
                          <td className="text-center text-cyan-400 font-bold">{p.yds}</td>
                          <td className="text-center">{p.avg}</td>
                          <td className="text-center">{p.td}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="defense" className="space-y-6 mt-6">
              {/* Tackles & Sacks */}
              <div>
                <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-gray-400">Tackles & Sacks</h3>
                <div className="overflow-x-auto">
                  <table className="w-full font-mono text-sm">
                    <thead>
                      <tr className="border-b-2 border-cyan-500/30 text-xs uppercase tracking-wider text-gray-400">
                        <th className="pb-2 text-left">Player</th>
                        <th className="pb-2 text-center">TOT</th>
                        <th className="pb-2 text-center">SOLO</th>
                        <th className="pb-2 text-center">ASST</th>
                        <th className="pb-2 text-center">SACKS</th>
                        <th className="pb-2 text-center">TFL</th>
                        <th className="pb-2 text-center">PD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        {
                          player: "N. Bosa",
                          team: "SF",
                          pos: "DE",
                          tot: 8,
                          solo: 6,
                          asst: 2,
                          sacks: 2.0,
                          tfl: 3,
                          pd: 1,
                        },
                        {
                          player: "C. Jones",
                          team: "KC",
                          pos: "DT",
                          tot: 7,
                          solo: 5,
                          asst: 2,
                          sacks: 1.5,
                          tfl: 2,
                          pd: 0,
                        },
                        {
                          player: "F. Warner",
                          team: "SF",
                          pos: "LB",
                          tot: 11,
                          solo: 7,
                          asst: 4,
                          sacks: 0.0,
                          tfl: 1,
                          pd: 2,
                        },
                        {
                          player: "N. Bolton",
                          team: "KC",
                          pos: "LB",
                          tot: 9,
                          solo: 6,
                          asst: 3,
                          sacks: 0.0,
                          tfl: 0,
                          pd: 1,
                        },
                      ].map((p, i) => (
                        <tr key={i} className="border-b border-gray-800 hover:bg-cyan-500/5 transition-colors">
                          <td className="py-3">
                            {p.player}{" "}
                            <span className="text-gray-500">
                              ({p.team} · {p.pos})
                            </span>
                          </td>
                          <td className="text-center text-cyan-400 font-bold">{p.tot}</td>
                          <td className="text-center">{p.solo}</td>
                          <td className="text-center">{p.asst}</td>
                          <td className="text-center text-red-400">{p.sacks}</td>
                          <td className="text-center">{p.tfl}</td>
                          <td className="text-center">{p.pd}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Interceptions */}
              <div>
                <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-gray-400">Interceptions</h3>
                <div className="overflow-x-auto">
                  <table className="w-full font-mono text-sm">
                    <thead>
                      <tr className="border-b-2 border-cyan-500/30 text-xs uppercase tracking-wider text-gray-400">
                        <th className="pb-2 text-left">Player</th>
                        <th className="pb-2 text-center">INT</th>
                        <th className="pb-2 text-center">YDS</th>
                        <th className="pb-2 text-center">TD</th>
                        <th className="pb-2 text-center">LONG</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="border-b border-gray-800 hover:bg-cyan-500/5 transition-colors">
                        <td className="py-3">
                          T. McDuffie <span className="text-gray-500">(KC · CB)</span>
                        </td>
                        <td className="text-center text-red-400 font-bold">1</td>
                        <td className="text-center">18</td>
                        <td className="text-center">0</td>
                        <td className="text-center">18</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="special" className="space-y-6 mt-6">
              {/* Kicking */}
              <div>
                <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-gray-400">Kicking</h3>
                <div className="overflow-x-auto">
                  <table className="w-full font-mono text-sm">
                    <thead>
                      <tr className="border-b-2 border-cyan-500/30 text-xs uppercase tracking-wider text-gray-400">
                        <th className="pb-2 text-left">Player</th>
                        <th className="pb-2 text-center">FGM/FGA</th>
                        <th className="pb-2 text-center">LONG</th>
                        <th className="pb-2 text-center">XPM/XPA</th>
                        <th className="pb-2 text-center">PTS</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { player: "H. Butker", team: "KC", fg: "2/2", long: 48, xp: "5/5", pts: 11 },
                        { player: "J. Moody", team: "SF", fg: "1/1", long: 42, xp: "4/4", pts: 7 },
                      ].map((p, i) => (
                        <tr key={i} className="border-b border-gray-800 hover:bg-cyan-500/5 transition-colors">
                          <td className="py-3">
                            {p.player} <span className="text-gray-500">({p.team})</span>
                          </td>
                          <td className="text-center">{p.fg}</td>
                          <td className="text-center">{p.long}</td>
                          <td className="text-center">{p.xp}</td>
                          <td className="text-center text-cyan-400 font-bold">{p.pts}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Punting */}
              <div>
                <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-gray-400">Punting</h3>
                <div className="overflow-x-auto">
                  <table className="w-full font-mono text-sm">
                    <thead>
                      <tr className="border-b-2 border-cyan-500/30 text-xs uppercase tracking-wider text-gray-400">
                        <th className="pb-2 text-left">Player</th>
                        <th className="pb-2 text-center">PUNTS</th>
                        <th className="pb-2 text-center">YDS</th>
                        <th className="pb-2 text-center">AVG</th>
                        <th className="pb-2 text-center">LONG</th>
                        <th className="pb-2 text-center">IN20</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { player: "M. Wishnowsky", team: "SF", punts: 4, yds: 186, avg: 46.5, long: 58, in20: 2 },
                        { player: "T. Townsend", team: "KC", punts: 3, yds: 142, avg: 47.3, long: 52, in20: 1 },
                      ].map((p, i) => (
                        <tr key={i} className="border-b border-gray-800 hover:bg-cyan-500/5 transition-colors">
                          <td className="py-3">
                            {p.player} <span className="text-gray-500">({p.team})</span>
                          </td>
                          <td className="text-center">{p.punts}</td>
                          <td className="text-center">{p.yds}</td>
                          <td className="text-center text-cyan-400 font-bold">{p.avg}</td>
                          <td className="text-center">{p.long}</td>
                          <td className="text-center">{p.in20}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Returns */}
              <div>
                <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-gray-400">Kick Returns</h3>
                <div className="overflow-x-auto">
                  <table className="w-full font-mono text-sm">
                    <thead>
                      <tr className="border-b-2 border-cyan-500/30 text-xs uppercase tracking-wider text-gray-400">
                        <th className="pb-2 text-left">Player</th>
                        <th className="pb-2 text-center">RET</th>
                        <th className="pb-2 text-center">YDS</th>
                        <th className="pb-2 text-center">AVG</th>
                        <th className="pb-2 text-center">LONG</th>
                        <th className="pb-2 text-center">TD</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { player: "R. James", team: "SF", ret: 3, yds: 68, avg: 22.7, long: 28, td: 0 },
                        { player: "R. Rice", team: "KC", ret: 2, yds: 51, avg: 25.5, long: 29, td: 0 },
                      ].map((p, i) => (
                        <tr key={i} className="border-b border-gray-800 hover:bg-cyan-500/5 transition-colors">
                          <td className="py-3">
                            {p.player} <span className="text-gray-500">({p.team})</span>
                          </td>
                          <td className="text-center">{p.ret}</td>
                          <td className="text-center">{p.yds}</td>
                          <td className="text-center text-cyan-400 font-bold">{p.avg}</td>
                          <td className="text-center">{p.long}</td>
                          <td className="text-center">{p.td}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Scoring Summary */}
        <Card className="border-2 border-gray-800 bg-gradient-to-br from-gray-900 to-black p-6">
          <h2 className="mb-4 font-mono text-sm uppercase tracking-wider text-cyan-400">Scoring Summary</h2>
          <div className="space-y-6">
            {[
              {
                q: "1st Quarter",
                plays: [
                  {
                    time: "8:42",
                    desc: "SF - B. Aiyuk 12 yd pass from B. Purdy (J. Moody kick)",
                    drive: "9 plays, 75 yards, 4:18",
                    score: "SF 7-0",
                  },
                  {
                    time: "3:15",
                    desc: "KC - T. Kelce 8 yd pass from P. Mahomes (H. Butker kick)",
                    drive: "11 plays, 80 yards, 5:27",
                    score: "7-7",
                  },
                ],
              },
              {
                q: "2nd Quarter",
                plays: [
                  {
                    time: "11:23",
                    desc: "KC - R. Rice 24 yd pass from P. Mahomes (H. Butker kick)",
                    drive: "6 plays, 68 yards, 2:41",
                    score: "SF 7-14",
                  },
                  {
                    time: "2:08",
                    desc: "SF - C. McCaffrey 3 yd run (J. Moody kick)",
                    drive: "12 plays, 85 yards, 6:15",
                    score: "14-14",
                  },
                ],
              },
              {
                q: "3rd Quarter",
                plays: [
                  {
                    time: "9:18",
                    desc: "KC - T. Kelce 15 yd pass from P. Mahomes (H. Butker kick)",
                    drive: "8 plays, 72 yards, 3:52",
                    score: "SF 14-21",
                  },
                  {
                    time: "4:33",
                    desc: "SF - D. Samuel 18 yd pass from B. Purdy (J. Moody kick)",
                    drive: "10 plays, 78 yards, 4:45",
                    score: "21-21",
                  },
                ],
              },
              {
                q: "4th Quarter",
                plays: [
                  {
                    time: "8:14",
                    desc: "KC - I. Pacheco 8 yd run (H. Butker kick)",
                    drive: "7 plays, 58 yards, 3:21",
                    score: "SF 21-28",
                  },
                  {
                    time: "5:02",
                    desc: "SF - J. Moody 42 yd field goal",
                    drive: "8 plays, 51 yards, 3:12",
                    score: "24-28",
                  },
                  {
                    time: "2:18",
                    desc: "KC - T. Kelce 6 yd pass from P. Mahomes (H. Butker kick)",
                    drive: "5 plays, 48 yards, 2:44",
                    score: "SF 24-35",
                  },
                  {
                    time: "0:42",
                    desc: "SF - J. Moody 48 yd field goal",
                    drive: "6 plays, 45 yards, 1:36",
                    score: "28-35",
                  },
                ],
              },
            ].map((quarter) => (
              <div key={quarter.q}>
                <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-cyan-400">{quarter.q}</h3>
                <div className="space-y-2">
                  {quarter.plays.map((play, i) => (
                    <div key={i} className="rounded-lg border-2 border-gray-800 bg-gray-900/50 p-3">
                      <div className="mb-1 flex items-center justify-between">
                        <span className="font-mono text-xs text-gray-400">{play.time}</span>
                        <span className="font-mono text-sm font-bold">{play.score}</span>
                      </div>
                      <div className="mb-1 text-sm">{play.desc}</div>
                      <div className="font-mono text-xs text-gray-400">{play.drive}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Team Statistics */}
        <Card className="border-2 border-gray-800 bg-gradient-to-br from-gray-900 to-black p-6">
          <h2 className="mb-4 font-mono text-sm uppercase tracking-wider text-cyan-400">Team Statistics Comparison</h2>
          <Tabs defaultValue="kc" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-900 border-2 border-gray-800">
              <TabsTrigger
                value="kc"
                className="font-mono data-[state=active]:bg-green-500/20 data-[state=active]:text-green-400"
              >
                KANSAS CITY CHIEFS
              </TabsTrigger>
              <TabsTrigger
                value="sf"
                className="font-mono data-[state=active]:bg-red-500/20 data-[state=active]:text-red-400"
              >
                SAN FRANCISCO 49ERS
              </TabsTrigger>
            </TabsList>

            <TabsContent value="kc" className="mt-6">
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { label: "Total Yards", value: "398", color: "green" },
                  { label: "First Downs", value: "28", color: "green" },
                  { label: "Passing Yards", value: "342", color: "green" },
                  { label: "Rushing Yards", value: "89", color: "zinc" },
                  { label: "Yards Per Play", value: "6.8", color: "green" },
                  { label: "Penalties", value: "4-32", color: "zinc" },
                  { label: "Time of Possession", value: "27:42", color: "zinc" },
                  { label: "Turnovers", value: "0", color: "green" },
                  { label: "3rd Down", value: "8/14 (57%)", color: "green" },
                  { label: "4th Down", value: "1/1 (100%)", color: "green" },
                  { label: "Red Zone", value: "4/5 (80%)", color: "green" },
                  { label: "Sacks Allowed", value: "2", color: "zinc" },
                ].map((stat, i) => (
                  <div key={i} className="rounded-lg border-2 border-gray-800 bg-gray-900/50 p-4 text-center">
                    <div className="font-mono text-xs uppercase tracking-wider text-gray-400">{stat.label}</div>
                    <div className={`mt-2 text-3xl font-black tabular-nums text-${stat.color}-400`}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="sf" className="mt-6">
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  { label: "Total Yards", value: "342", color: "zinc" },
                  { label: "First Downs", value: "24", color: "zinc" },
                  { label: "Passing Yards", value: "298", color: "zinc" },
                  { label: "Rushing Yards", value: "146", color: "green" },
                  { label: "Yards Per Play", value: "5.9", color: "zinc" },
                  { label: "Penalties", value: "6-48", color: "red" },
                  { label: "Time of Possession", value: "32:18", color: "green" },
                  { label: "Turnovers", value: "1", color: "red" },
                  { label: "3rd Down", value: "6/13 (46%)", color: "zinc" },
                  { label: "4th Down", value: "0/2 (0%)", color: "red" },
                  { label: "Red Zone", value: "3/4 (75%)", color: "zinc" },
                  { label: "Sacks Allowed", value: "3", color: "red" },
                ].map((stat, i) => (
                  <div key={i} className="rounded-lg border-2 border-gray-800 bg-gray-900/50 p-4 text-center">
                    <div className="font-mono text-xs uppercase tracking-wider text-gray-400">{stat.label}</div>
                    <div className={`mt-2 text-3xl font-black tabular-nums text-${stat.color}-400`}>{stat.value}</div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </Card>

        {/* Game Information */}
        <Card className="border-2 border-gray-800 bg-gradient-to-br from-gray-900 to-black p-6">
          <h2 className="mb-4 font-mono text-sm uppercase tracking-wider text-cyan-400">Game Information</h2>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-lg border-2 border-gray-800 bg-gray-900/50 p-4">
              <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-gray-400">Officials</h3>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Referee:</span>
                  <span>Carl Cheffers</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Umpire:</span>
                  <span>Roy Ellison</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Head Linesman:</span>
                  <span>Derick Bowers</span>
                </div>
              </div>
            </div>

            <div className="rounded-lg border-2 border-gray-800 bg-gray-900/50 p-4">
              <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-gray-400">Broadcast</h3>
              <div className="space-y-2 font-mono text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Network:</span>
                  <span>CBS</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Play-by-Play:</span>
                  <span>Jim Nantz</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Analyst:</span>
                  <span>Tony Romo</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Advanced Analytics */}
        <Card className="border-2 border-gray-800 bg-gradient-to-br from-gray-900 to-black p-6">
          <h2 className="mb-4 font-mono text-sm uppercase tracking-wider text-cyan-400">Advanced Analytics</h2>

          <div className="mb-6 rounded-lg border-2 border-gray-800 bg-gray-900/50 p-4">
            <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-gray-400">
              Expected Points Added (EPA)
            </h3>
            <div className="space-y-4">
              {[
                { label: "Total EPA", kc: "+12.4", sf: "-8.2", kcPct: 60, sfPct: 40, kcColor: "green", sfColor: "red" },
                {
                  label: "Passing EPA",
                  kc: "+18.6",
                  sf: "+6.4",
                  kcPct: 74,
                  sfPct: 26,
                  kcColor: "green",
                  sfColor: "zinc",
                },
                {
                  label: "Rushing EPA",
                  kc: "-6.2",
                  sf: "+8.8",
                  kcPct: 41,
                  sfPct: 59,
                  kcColor: "red",
                  sfColor: "green",
                },
              ].map((metric, i) => (
                <div key={i}>
                  <div className="mb-2 flex justify-between font-mono text-sm">
                    <span className="text-gray-400">{metric.label}</span>
                    <div className="flex gap-4">
                      <span className={`text-${metric.kcColor}-400`}>KC {metric.kc}</span>
                      <span className={`text-${metric.sfColor}-400`}>SF {metric.sf}</span>
                    </div>
                  </div>
                  <div className="flex h-2 overflow-hidden rounded-full bg-gray-800">
                    <div className={`bg-${metric.kcColor}-500`} style={{ width: `${metric.kcPct}%` }} />
                    <div className={`bg-${metric.sfColor}-500`} style={{ width: `${metric.sfPct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border-2 border-gray-800 bg-gray-900/50 p-4">
            <h3 className="mb-3 font-mono text-xs uppercase tracking-wider text-gray-400">
              Success Rate & Explosive Plays
            </h3>
            <div className="space-y-3 font-mono text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Success Rate:</span>
                <div className="flex gap-4">
                  <span className="text-green-400">KC 58%</span>
                  <span className="text-zinc-400">SF 48%</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Explosive Plays (20+):</span>
                <div className="flex gap-4">
                  <span className="text-green-400">KC 8</span>
                  <span className="text-zinc-400">SF 6</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Avg Yards Per Play:</span>
                <div className="flex gap-4">
                  <span className="text-green-400">KC 6.8</span>
                  <span className="text-zinc-400">SF 5.9</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Video Highlights */}
        <Card className="border-2 border-gray-800 bg-gradient-to-br from-gray-900 to-black p-6">
          <h2 className="mb-4 font-mono text-sm uppercase tracking-wider text-cyan-400">Video Highlights</h2>
          <div className="grid gap-4 md:grid-cols-3">
            {[
              {
                title: "Mahomes 300th TD Pass",
                desc: "Historic 24-yard TD to Rice",
                dur: "2:34",
                cat: "Milestone",
                color: "amber",
              },
              {
                title: "McDuffie Game-Sealing INT",
                desc: "Crucial 4th quarter interception",
                dur: "1:18",
                cat: "Turning Point",
                color: "red",
              },
              {
                title: "Kelce 100th Career TD",
                desc: "6-yard TD reception milestone",
                dur: "1:52",
                cat: "Milestone",
                color: "amber",
              },
              {
                title: "McCaffrey 31-Yard Run",
                desc: "Explosive rushing play",
                dur: "2:08",
                cat: "Big Play",
                color: "green",
              },
              {
                title: "Game Highlights",
                desc: "Full game recap and analysis",
                dur: "3:42",
                cat: "Full Recap",
                color: "blue",
              },
              {
                title: "Post-Game Interviews",
                desc: "Mahomes & Kelce reactions",
                dur: "4:15",
                cat: "Interviews",
                color: "purple",
              },
            ].map((video, i) => (
              <div
                key={i}
                className="group cursor-pointer rounded-lg border-2 border-gray-800 bg-gray-900/50 p-4 hover:border-cyan-500/50 transition-all"
              >
                <div className="mb-3 flex h-32 items-center justify-center rounded-lg bg-gradient-to-br from-gray-800 to-gray-900 group-hover:from-cyan-500/10 group-hover:to-purple-500/10 transition-all">
                  <div className="text-4xl">▶</div>
                </div>
                <div className="mb-1 flex items-center justify-between">
                  <Badge
                    className={`bg-${video.color}-500/20 text-${video.color}-400 border border-${video.color}-500/50 font-mono text-xs`}
                  >
                    {video.cat}
                  </Badge>
                  <span className="font-mono text-xs text-gray-400">{video.dur}</span>
                </div>
                <div className="font-bold">{video.title}</div>
                <div className="text-sm text-gray-400">{video.desc}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}
