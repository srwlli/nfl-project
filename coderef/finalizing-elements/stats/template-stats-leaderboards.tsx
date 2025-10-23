import { DesignShowcaseLayout, DesignSection } from "@/components/design-showcase-layout"
import { DESIGN_STYLES } from "@/lib/design-styles"

export default function HistoricalStatsPage() {
  return (
    <DesignShowcaseLayout
      title="Historical Stats Display"
      description="Browse and explore NFL statistics from 1970-2024 with advanced filtering and comparison tools"
    >
      <DesignSection title="Stats Browser - Filterable Table" designStyle={DESIGN_STYLES.modernDashboard.name}>
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex flex-wrap gap-3">
            <select className="px-4 py-2 rounded-lg border border-border bg-background">
              <option>Season: 2024</option>
              <option>2023</option>
              <option>2022</option>
              <option>2021</option>
              <option>2020</option>
            </select>
            <select className="px-4 py-2 rounded-lg border border-border bg-background">
              <option>Position: All</option>
              <option>QB</option>
              <option>RB</option>
              <option>WR</option>
              <option>TE</option>
            </select>
            <select className="px-4 py-2 rounded-lg border border-border bg-background">
              <option>Team: All</option>
              <option>Cowboys</option>
              <option>49ers</option>
              <option>Patriots</option>
            </select>
            <select className="px-4 py-2 rounded-lg border border-border bg-background">
              <option>Sort by: Passing Yards</option>
              <option>Touchdowns</option>
              <option>Completions</option>
              <option>Rating</option>
            </select>
          </div>

          {/* Stats Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-semibold">Rank</th>
                  <th className="text-left p-3 font-semibold">Player</th>
                  <th className="text-left p-3 font-semibold">Pos</th>
                  <th className="text-left p-3 font-semibold">Team</th>
                  <th className="text-right p-3 font-semibold">CMP</th>
                  <th className="text-right p-3 font-semibold">ATT</th>
                  <th className="text-right p-3 font-semibold">YDS</th>
                  <th className="text-right p-3 font-semibold">TD</th>
                  <th className="text-right p-3 font-semibold">INT</th>
                  <th className="text-right p-3 font-semibold">Rating</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    rank: 1,
                    player: "Patrick Mahomes",
                    pos: "QB",
                    team: "KC",
                    cmp: 401,
                    att: 597,
                    yds: 5250,
                    td: 41,
                    int: 12,
                    rating: 105.2,
                  },
                  {
                    rank: 2,
                    player: "Josh Allen",
                    pos: "QB",
                    team: "BUF",
                    cmp: 387,
                    att: 560,
                    yds: 4544,
                    td: 35,
                    int: 14,
                    rating: 96.3,
                  },
                  {
                    rank: 3,
                    player: "Jalen Hurts",
                    pos: "QB",
                    team: "PHI",
                    cmp: 306,
                    att: 460,
                    yds: 3701,
                    td: 23,
                    int: 15,
                    rating: 89.1,
                  },
                  {
                    rank: 4,
                    player: "Dak Prescott",
                    pos: "QB",
                    team: "DAL",
                    cmp: 410,
                    att: 590,
                    yds: 4516,
                    td: 36,
                    int: 9,
                    rating: 99.6,
                  },
                  {
                    rank: 5,
                    player: "Tua Tagovailoa",
                    pos: "QB",
                    team: "MIA",
                    cmp: 388,
                    att: 548,
                    yds: 4624,
                    td: 29,
                    int: 14,
                    rating: 92.7,
                  },
                ].map((stat) => (
                  <tr key={stat.rank} className="border-b border-border hover:bg-accent/50 transition-colors">
                    <td className="p-3 font-bold text-muted-foreground">{stat.rank}</td>
                    <td className="p-3 font-semibold">{stat.player}</td>
                    <td className="p-3 text-sm text-muted-foreground">{stat.pos}</td>
                    <td className="p-3 text-sm">{stat.team}</td>
                    <td className="p-3 text-right font-mono text-sm">{stat.cmp}</td>
                    <td className="p-3 text-right font-mono text-sm">{stat.att}</td>
                    <td className="p-3 text-right font-mono text-sm font-bold">{stat.yds}</td>
                    <td className="p-3 text-right font-mono text-sm text-primary">{stat.td}</td>
                    <td className="p-3 text-right font-mono text-sm">{stat.int}</td>
                    <td className="p-3 text-right font-mono text-sm font-bold">{stat.rating}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">Showing 1-5 of 150 players</div>
            <div className="flex gap-2">
              <button className="px-3 py-1 rounded border border-border hover:bg-accent">Previous</button>
              <button className="px-3 py-1 rounded border border-border bg-primary text-primary-foreground">1</button>
              <button className="px-3 py-1 rounded border border-border hover:bg-accent">2</button>
              <button className="px-3 py-1 rounded border border-border hover:bg-accent">3</button>
              <button className="px-3 py-1 rounded border border-border hover:bg-accent">Next</button>
            </div>
          </div>
        </div>
      </DesignSection>

      <DesignSection title="All-Time Leaders - Career Stats" designStyle={DESIGN_STYLES.dataHeavy.name}>
        <div className="space-y-6">
          {/* Era Selector */}
          <div className="flex gap-2 flex-wrap">
            {["All-Time", "1970s", "1980s", "1990s", "2000s", "2010s", "2020s"].map((era) => (
              <button
                key={era}
                className={`px-4 py-2 rounded-lg border ${
                  era === "All-Time"
                    ? "bg-primary text-primary-foreground border-primary"
                    : "border-border hover:bg-accent"
                }`}
              >
                {era}
              </button>
            ))}
          </div>

          {/* Leaders Grid */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Passing Yards */}
            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="text-lg font-bold mb-4">All-Time Passing Yards</h3>
              <div className="space-y-3">
                {[
                  { rank: 1, player: "Tom Brady", yds: "89,214", years: "2000-2022" },
                  { rank: 2, player: "Drew Brees", yds: "80,358", years: "2001-2020" },
                  { rank: 3, player: "Peyton Manning", yds: "71,940", years: "1998-2015" },
                  { rank: 4, player: "Brett Favre", yds: "71,838", years: "1991-2010" },
                  { rank: 5, player: "Philip Rivers", yds: "63,440", years: "2004-2020" },
                ].map((leader) => (
                  <div key={leader.rank} className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-muted-foreground w-8">{leader.rank}</span>
                      <div>
                        <div className="font-bold">{leader.player}</div>
                        <div className="text-xs text-muted-foreground">{leader.years}</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-primary">{leader.yds}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rushing Yards */}
            <div className="p-6 rounded-xl border border-border bg-card">
              <h3 className="text-lg font-bold mb-4">All-Time Rushing Yards</h3>
              <div className="space-y-3">
                {[
                  { rank: 1, player: "Emmitt Smith", yds: "18,355", years: "1990-2004" },
                  { rank: 2, player: "Walter Payton", yds: "16,726", years: "1975-1987" },
                  { rank: 3, player: "Frank Gore", yds: "16,000", years: "2005-2020" },
                  { rank: 4, player: "Barry Sanders", yds: "15,269", years: "1989-1998" },
                  { rank: 5, player: "Adrian Peterson", yds: "14,918", years: "2007-2021" },
                ].map((leader) => (
                  <div key={leader.rank} className="flex items-center justify-between p-3 rounded-lg bg-accent/30">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl font-bold text-muted-foreground w-8">{leader.rank}</span>
                      <div>
                        <div className="font-bold">{leader.player}</div>
                        <div className="text-xs text-muted-foreground">{leader.years}</div>
                      </div>
                    </div>
                    <div className="text-xl font-bold text-primary">{leader.yds}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Context Note */}
          <div className="p-4 rounded-lg bg-accent/20 border border-border">
            <p className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground">Note:</span> Statistics are adjusted for era. Modern
              passing rules favor higher yardage totals compared to 1970s-1990s.
            </p>
          </div>
        </div>
      </DesignSection>

      <DesignSection title="Season Comparison - Year by Year" designStyle={DESIGN_STYLES.cardBased.name}>
        <div className="space-y-6">
          {/* Year Selector */}
          <div className="flex items-center gap-4">
            <label className="font-semibold">Compare Seasons:</label>
            <select className="px-4 py-2 rounded-lg border border-border bg-background">
              <option>1995</option>
              <option>2000</option>
              <option>2010</option>
              <option>2020</option>
            </select>
            <span className="text-muted-foreground">vs</span>
            <select className="px-4 py-2 rounded-lg border border-border bg-background">
              <option>2024</option>
              <option>2023</option>
              <option>2022</option>
            </select>
          </div>

          {/* Comparison Cards */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* 1995 Season */}
            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">1995 Season</h3>
                <span className="px-3 py-1 rounded-full bg-accent text-sm font-semibold">Historical</span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Passing Leader</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">Brett Favre</div>
                      <div className="text-sm text-muted-foreground">Green Bay Packers</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">4,413 YDS</div>
                      <div className="text-sm text-muted-foreground">38 TD</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Rushing Leader</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">Emmitt Smith</div>
                      <div className="text-sm text-muted-foreground">Dallas Cowboys</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">1,773 YDS</div>
                      <div className="text-sm text-muted-foreground">25 TD</div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">Super Bowl XXX Champion</div>
                  <div className="font-bold">Dallas Cowboys</div>
                </div>
              </div>
            </div>

            {/* 2024 Season */}
            <div className="p-6 rounded-xl border border-border bg-card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold">2024 Season</h3>
                <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  Current
                </span>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Passing Leader</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">Patrick Mahomes</div>
                      <div className="text-sm text-muted-foreground">Kansas City Chiefs</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">5,250 YDS</div>
                      <div className="text-sm text-muted-foreground">41 TD</div>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Rushing Leader</div>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold">Christian McCaffrey</div>
                      <div className="text-sm text-muted-foreground">San Francisco 49ers</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-bold text-primary">1,459 YDS</div>
                      <div className="text-sm text-muted-foreground">14 TD</div>
                    </div>
                  </div>
                </div>
                <div className="pt-4 border-t border-border">
                  <div className="text-sm text-muted-foreground">Super Bowl LVIII Champion</div>
                  <div className="font-bold">Kansas City Chiefs</div>
                </div>
              </div>
            </div>
          </div>

          {/* Era Context */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
            <h4 className="font-bold mb-2">Era Comparison Insights</h4>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Passing yards increased 19% from 1995 to 2024 due to rule changes favoring offense</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Rushing yards decreased 18% as teams shifted to pass-heavy offenses</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-1">•</span>
                <span>Average QB rating improved from 85.3 (1995) to 92.1 (2024)</span>
              </li>
            </ul>
          </div>
        </div>
      </DesignSection>

      <DesignSection title="Player Career View - Historical Timeline" designStyle={DESIGN_STYLES.classicReference.name}>
        <div className="space-y-6">
          {/* Player Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-3xl font-bold mb-2">Tom Brady</h3>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>QB</span>
                <span>•</span>
                <span>2000-2022</span>
                <span>•</span>
                <span>23 Seasons</span>
                <span>•</span>
                <span className="text-primary font-semibold">Hall of Fame</span>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Career Passing Yards</div>
              <div className="text-3xl font-bold text-primary">89,214</div>
            </div>
          </div>

          {/* Career Stats Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-border">
                  <th className="text-left p-2 font-semibold">Year</th>
                  <th className="text-left p-2 font-semibold">Team</th>
                  <th className="text-right p-2 font-semibold">G</th>
                  <th className="text-right p-2 font-semibold">CMP</th>
                  <th className="text-right p-2 font-semibold">ATT</th>
                  <th className="text-right p-2 font-semibold">YDS</th>
                  <th className="text-right p-2 font-semibold">TD</th>
                  <th className="text-right p-2 font-semibold">INT</th>
                  <th className="text-right p-2 font-semibold">Rating</th>
                  <th className="text-left p-2 font-semibold">Awards</th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    year: 2007,
                    team: "NE",
                    g: 16,
                    cmp: 398,
                    att: 578,
                    yds: 4806,
                    td: 50,
                    int: 8,
                    rating: 117.2,
                    awards: "MVP, SB",
                  },
                  {
                    year: 2010,
                    team: "NE",
                    g: 16,
                    cmp: 324,
                    att: 492,
                    yds: 3900,
                    td: 36,
                    int: 4,
                    rating: 111.0,
                    awards: "MVP",
                  },
                  {
                    year: 2016,
                    team: "NE",
                    g: 12,
                    cmp: 291,
                    att: 432,
                    yds: 3554,
                    td: 28,
                    int: 2,
                    rating: 112.2,
                    awards: "SB MVP",
                  },
                  {
                    year: 2020,
                    team: "TB",
                    g: 16,
                    cmp: 401,
                    att: 610,
                    yds: 4633,
                    td: 40,
                    int: 12,
                    rating: 102.2,
                    awards: "SB MVP",
                  },
                  {
                    year: 2021,
                    team: "TB",
                    g: 17,
                    cmp: 485,
                    att: 719,
                    yds: 5316,
                    td: 43,
                    int: 12,
                    rating: 102.1,
                    awards: "MVP",
                  },
                ].map((season) => (
                  <tr key={season.year} className="border-b border-border hover:bg-accent/30">
                    <td className="p-2 font-semibold">{season.year}</td>
                    <td className="p-2">{season.team}</td>
                    <td className="p-2 text-right font-mono">{season.g}</td>
                    <td className="p-2 text-right font-mono">{season.cmp}</td>
                    <td className="p-2 text-right font-mono">{season.att}</td>
                    <td className="p-2 text-right font-mono font-bold">{season.yds}</td>
                    <td className="p-2 text-right font-mono text-primary">{season.td}</td>
                    <td className="p-2 text-right font-mono">{season.int}</td>
                    <td className="p-2 text-right font-mono font-bold">{season.rating}</td>
                    <td className="p-2 text-xs">{season.awards}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Career Highlights */}
          <div className="grid md:grid-cols-4 gap-4">
            {[
              { label: "Super Bowls", value: "7" },
              { label: "MVP Awards", value: "3" },
              { label: "Pro Bowls", value: "15" },
              { label: "All-Pro", value: "6" },
            ].map((stat) => (
              <div key={stat.label} className="p-4 rounded-lg border border-border bg-card text-center">
                <div className="text-3xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </DesignSection>

      <DesignSection title="Interactive Stats Explorer" designStyle={DESIGN_STYLES.premiumGlass.name}>
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search for any player, team, or season..."
              className="w-full px-6 py-4 rounded-xl border border-border bg-card/50 backdrop-blur-sm text-lg focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Quick Access Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            {[
              { title: "Current Season", subtitle: "2024 Stats", icon: "📊" },
              { title: "All-Time Leaders", subtitle: "Career Records", icon: "🏆" },
              { title: "Era Comparison", subtitle: "Decade Analysis", icon: "📈" },
            ].map((card) => (
              <button
                key={card.title}
                className="p-6 rounded-xl bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-sm border border-border hover:border-primary/50 transition-all text-left"
              >
                <div className="text-3xl mb-3">{card.icon}</div>
                <div className="font-bold text-lg mb-1">{card.title}</div>
                <div className="text-sm text-muted-foreground">{card.subtitle}</div>
              </button>
            ))}
          </div>

          {/* Featured Stat */}
          <div className="p-8 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border border-primary/30 backdrop-blur-sm">
            <div className="text-sm text-muted-foreground mb-2">STAT OF THE DAY</div>
            <h3 className="text-2xl font-bold mb-4">Most Passing Yards in a Single Season</h3>
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="text-4xl font-black text-primary mb-2">5,477</div>
                <div className="text-lg font-semibold">Peyton Manning</div>
                <div className="text-sm text-muted-foreground">Denver Broncos • 2013</div>
              </div>
              <div className="text-6xl opacity-20">🏈</div>
            </div>
            <p className="text-sm text-muted-foreground">
              Manning's 2013 season remains the single-season passing yards record, set during his age-37 season with 55
              touchdowns.
            </p>
          </div>

          {/* Data Freshness */}
          <div className="p-4 rounded-lg bg-accent/20 border border-border text-center">
            <p className="text-sm text-muted-foreground">
              Historical data: 1970-2023 (complete) • 2024 data through Week 7 (updated Oct 16, 2025)
            </p>
          </div>
        </div>
      </DesignSection>
    </DesignShowcaseLayout>
  )
}
