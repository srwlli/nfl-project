import { DesignShowcaseLayout, DesignSection } from "@/components/design-showcase-layout"
import { DESIGN_STYLES } from "@/lib/design-styles"

export default function MatchupPreviewPage() {
  return (
    <DesignShowcaseLayout
      title="Matchup Preview"
      description="Comprehensive NFL game matchup preview with betting lines, team comparisons, injury reports, key matchups, weather analysis, power ratings, and expert picks. The ultimate betting-focused game preview."
    >
      {/* Modern Dashboard Style */}
      <DesignSection title="Game Hero & Betting Lines" designStyle={DESIGN_STYLES.modernDashboard.name}>
        <div className="space-y-6">
          {/* Hero Section */}
          <div className="bg-card border border-border rounded-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center text-sm font-bold">
                  KC
                </div>
                <div>
                  <h2 className="text-xl font-bold">Kansas City Chiefs</h2>
                  <p className="text-sm text-muted-foreground">8-2 (1st AFC West)</p>
                </div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold mb-1">@</div>
                <div className="text-xs text-muted-foreground">Sunday, 8:20 PM ET</div>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <h2 className="text-xl font-bold">Buffalo Bills</h2>
                  <p className="text-sm text-muted-foreground">7-3 (1st AFC East)</p>
                </div>
                <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center text-sm font-bold">
                  BUF
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-6">
              <span>Highmark Stadium, Orchard Park, NY</span>
              <span>•</span>
              <span>NBC</span>
              <span>•</span>
              <span>Outdoor</span>
            </div>

            {/* Betting Lines */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-background border border-border rounded-lg p-4 text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Spread</div>
                <div className="text-xl font-bold mb-1">KC -3.5</div>
                <div className="text-xs text-muted-foreground">(-110)</div>
              </div>
              <div className="bg-background border border-border rounded-lg p-4 text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Total (O/U)</div>
                <div className="text-xl font-bold mb-1">51.5</div>
                <div className="text-xs text-muted-foreground">(-110)</div>
              </div>
              <div className="bg-background border border-border rounded-lg p-4 text-center">
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Moneyline</div>
                <div className="text-xl font-bold mb-1">KC -165</div>
                <div className="text-xs text-muted-foreground">BUF +145</div>
              </div>
            </div>

            {/* Alerts */}
            <div className="mt-4 space-y-2">
              <div className="flex items-center gap-2 text-sm p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <span>🔥</span>
                <span>Sharp Action: 62% of bets on BUF, but line moved to KC -3.5</span>
              </div>
              <div className="flex items-center gap-2 text-sm p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <span>⚠️</span>
                <span>Key Injury: BUF WR2 Gabe Davis (OUT)</span>
              </div>
            </div>
          </div>
        </div>
      </DesignSection>

      {/* Data-Heavy Stats Style */}
      <DesignSection title="Quick Stats Comparison" designStyle={DESIGN_STYLES.dataHeavy.name}>
        <div className="bg-card border border-border rounded-lg p-6">
          <h3 className="font-semibold mb-6 text-center">Team Performance Comparison</h3>

          <div className="space-y-4">
            {[
              {
                label: "Points Per Game",
                away: "28.5",
                awayRank: "3rd",
                home: "25.2",
                homeRank: "8th",
                awayBetter: true,
              },
              {
                label: "Points Allowed",
                away: "19.8",
                awayRank: "8th",
                home: "22.5",
                homeRank: "15th",
                awayBetter: true,
              },
              {
                label: "Total Yards/Game",
                away: "365.2",
                awayRank: "7th",
                home: "340.8",
                homeRank: "14th",
                awayBetter: true,
              },
              {
                label: "Pass EPA/Play",
                away: "+0.18",
                awayRank: "5th",
                home: "+0.10",
                homeRank: "10th",
                awayBetter: true,
              },
              {
                label: "Rush EPA/Play",
                away: "+0.02",
                awayRank: "12th",
                home: "+0.05",
                homeRank: "9th",
                awayBetter: false,
              },
              { label: "ATS Record", away: "6-4", awayRank: "60%", home: "5-5", homeRank: "50%", awayBetter: true },
              { label: "O/U Record", away: "7-3 O", awayRank: "70%", home: "4-6 U", homeRank: "40%", awayBetter: true },
            ].map((stat, i) => (
              <div key={i} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="w-32 text-right">
                    <div className="font-medium">{stat.away}</div>
                    <div className="text-xs text-muted-foreground">({stat.awayRank})</div>
                  </div>
                  <div className="flex-1 mx-4">
                    <div className="text-xs text-center text-muted-foreground mb-1">{stat.label}</div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${stat.awayBetter ? "bg-red-500" : "bg-blue-500"}`}
                        style={{ width: stat.awayBetter ? "60%" : "40%" }}
                      />
                    </div>
                  </div>
                  <div className="w-32 text-left">
                    <div className="font-medium">{stat.home}</div>
                    <div className="text-xs text-muted-foreground">({stat.homeRank})</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DesignSection>

      {/* Card-Based Modular Style */}
      <DesignSection title="Betting Analysis & Trends" designStyle={DESIGN_STYLES.cardBased.name}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* ATS Trends */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h4 className="font-semibold mb-4">Against The Spread (ATS)</h4>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">KC Chiefs</span>
                  <span className="text-sm text-green-500">6-4 (60%)</span>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Away:</span>
                    <span>3-2</span>
                  </div>
                  <div className="flex justify-between">
                    <span>As Favorite:</span>
                    <span>5-3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Division:</span>
                    <span>2-1</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">BUF Bills</span>
                  <span className="text-sm text-muted-foreground">5-5 (50%)</span>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Home:</span>
                    <span>3-2</span>
                  </div>
                  <div className="flex justify-between">
                    <span>As Underdog:</span>
                    <span>2-2</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Division:</span>
                    <span>2-1</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded text-xs">
              <span className="font-medium">Trend:</span> KC is 3-2 ATS on the road. BUF struggles to cover at home
              (3-2).
            </div>
          </div>

          {/* O/U Trends */}
          <div className="bg-card border border-border rounded-lg p-5">
            <h4 className="font-semibold mb-4">Over/Under (O/U)</h4>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">KC Chiefs</span>
                  <span className="text-sm text-green-500">7-3 O (70%)</span>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Away:</span>
                    <span>3-2 O</span>
                  </div>
                  <div className="flex justify-between">
                    <span>As Favorite:</span>
                    <span>6-2 O</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Division:</span>
                    <span>3-0 O</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">BUF Bills</span>
                  <span className="text-sm text-blue-500">4-6 U (60%)</span>
                </div>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex justify-between">
                    <span>Home:</span>
                    <span>2-3 U</span>
                  </div>
                  <div className="flex justify-between">
                    <span>As Favorite:</span>
                    <span>3-3 P</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Division:</span>
                    <span>1-2 U</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/20 rounded text-xs">
              <span className="font-medium">Trend:</span> KC games go OVER (70%). BUF games lean UNDER (60%).
              Contrasting styles.
            </div>
          </div>

          {/* Situational Spots */}
          <div className="bg-card border border-border rounded-lg p-5 md:col-span-2">
            <h4 className="font-semibold mb-4">Situational Spots</h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { icon: "✅", label: "KC: Coming off bye week", detail: "Teams off bye: 35-28 ATS (55.6%)" },
                { icon: "⚠️", label: "BUF: Standard week rest", detail: "No rest advantage" },
                { icon: "📅", label: "Prime Time: Sunday Night", detail: "SNF totals go UNDER 55%" },
                { icon: "🏟️", label: "Stadium: BUF at home", detail: "Home field advantage ~3 points" },
              ].map((spot, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-background rounded-lg">
                  <span className="text-xl">{spot.icon}</span>
                  <div>
                    <div className="text-sm font-medium mb-1">{spot.label}</div>
                    <div className="text-xs text-muted-foreground">{spot.detail}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DesignSection>

      {/* Classic Reference Style */}
      <DesignSection title="Injury Report & Key Matchups" designStyle={DESIGN_STYLES.classicReference.name}>
        <div className="space-y-6">
          {/* Injury Report */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="bg-muted px-6 py-4 border-b border-border">
              <h3 className="font-semibold">Injury Report</h3>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold mb-3">KC Chiefs</h4>
                <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <span>✅</span>
                    <span>No significant injuries (Full strength)</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">BUF Bills</h4>
                <div className="space-y-3">
                  <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-red-500 text-white rounded">OUT</span>
                        <span className="font-medium">WR Gabe Davis (hamstring)</span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-red-500/20 text-red-500 rounded">HIGH IMPACT</span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>• 2nd in receiving yards (520 YDS, 4 TD)</div>
                      <div>• Allen loses deep threat (15.8 aDot)</div>
                      <div>• Expect more targets to Diggs + TE Knox</div>
                      <div>• Total may drop 2-3 points</div>
                    </div>
                  </div>

                  <div className="p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs px-2 py-1 bg-orange-500 text-white rounded">DOUBTFUL</span>
                        <span className="font-medium">CB Tre'Davious White (knee)</span>
                      </div>
                      <span className="text-xs px-2 py-1 bg-orange-500/20 text-orange-500 rounded">
                        MODERATE IMPACT
                      </span>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <div>• CB1, top coverage corner</div>
                      <div>• Backup allows 72% completion</div>
                      <div>• Mahomes may target his side more</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Matchups */}
          <div className="bg-card border border-border rounded-lg overflow-hidden">
            <div className="bg-muted px-6 py-4 border-b border-border">
              <h3 className="font-semibold">Key Matchups</h3>
            </div>

            <div className="divide-y divide-border">
              {[
                {
                  title: "KC Passing Offense vs BUF Secondary",
                  awayLabel: "KC Pass Attack",
                  homeLabel: "BUF Pass Defense",
                  awayStats: ["Pass EPA: +0.18 (5th)", "YPG: 268.5 (5th)", "Comp%: 68.5% (7th)"],
                  homeStats: ["Pass EPA: -0.08 (9th)", "YA: 215.6 (9th)", "Comp%: 62.0% (12th)"],
                  advantage: "KC",
                  analysis: "Mahomes vs backup CB (White out). Expect 300+ passing yards for KC.",
                },
                {
                  title: "BUF Rushing Offense vs KC Run Defense",
                  awayLabel: "BUF Rush Attack",
                  homeLabel: "KC Run Defense",
                  awayStats: ["Rush EPA: +0.05 (9th)", "YPG: 110.2 (12th)", "YPC: 4.3 (15th)"],
                  homeStats: ["Rush EPA: -0.05 (10th)", "YA: 109.8 (12th)", "YPC: 4.2 (14th)"],
                  advantage: "EVEN",
                  analysis: "Josh Allen scrambles (6.2 YPC) will be key factor. Expect 8-10 designed runs.",
                },
              ].map((matchup, i) => (
                <div key={i} className="p-6">
                  <h4 className="font-semibold mb-4">{matchup.title}</h4>

                  <div className="grid grid-cols-2 gap-6 mb-4">
                    <div>
                      <div className="text-sm font-medium mb-2">{matchup.awayLabel}</div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        {matchup.awayStats.map((stat, j) => (
                          <div key={j}>{stat}</div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium mb-2">{matchup.homeLabel}</div>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        {matchup.homeStats.map((stat, j) => (
                          <div key={j}>{stat}</div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-background rounded-lg">
                    <span className="text-sm font-medium">Advantage:</span>
                    <span
                      className={`text-sm font-bold ${matchup.advantage === "KC" ? "text-red-500" : matchup.advantage === "BUF" ? "text-blue-500" : "text-muted-foreground"}`}
                    >
                      {matchup.advantage}
                    </span>
                  </div>

                  <div className="mt-3 text-xs text-muted-foreground">{matchup.analysis}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DesignSection>

      {/* Premium Glassmorphic Style */}
      <DesignSection title="Expert Pick & Prediction" designStyle={DESIGN_STYLES.premiumGlass.name}>
        <div className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border border-green-500/20 rounded-xl p-6 backdrop-blur-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center text-2xl">🏆</div>
            <div>
              <h3 className="font-semibold text-lg">Expert Pick</h3>
              <p className="text-xs text-muted-foreground">Final verdict with analysis</p>
            </div>
          </div>

          {/* Best Bet */}
          <div className="bg-background/50 border border-green-500/30 rounded-lg p-5 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-muted-foreground mb-1">BEST BET</div>
                <div className="text-2xl font-bold text-green-500">OVER 51.5</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Confidence</div>
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <span key={i} className="text-xl">
                      🔥
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2 text-sm">
              <div className="flex items-start gap-2">
                <span className="text-green-500">✅</span>
                <span>KC averages 28.5 PPG (3rd in NFL) - 70% of games go OVER</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">✅</span>
                <span>BUF averages 25.2 PPG (8th in NFL) - High-powered offense</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">✅</span>
                <span>Head-to-head: 60% OVER rate (avg 53.7 points)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-green-500">✅</span>
                <span>Weather: 45°F, wind 8mph (minimal impact)</span>
              </div>
            </div>
          </div>

          {/* Alternate Plays */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Alternate Plays</h4>

            <div className="bg-background/50 border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">KC -3.5</span>
                <div className="flex gap-1">
                  <span className="text-sm">🔥🔥</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">Sharp money on KC, but BUF at home is tough</div>
            </div>

            <div className="bg-background/50 border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">BUF Moneyline +145</span>
                <div className="flex gap-1">
                  <span className="text-sm">🔥🔥🔥</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground">Value play - our model gives BUF 42% win chance</div>
            </div>
          </div>

          {/* Projected Score */}
          <div className="mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <div className="text-sm text-muted-foreground mb-2">Projected Final Score</div>
              <div className="text-3xl font-bold mb-2">KC 27, BUF 24</div>
              <div className="text-sm text-muted-foreground">Win Probability: KC 58% | BUF 42%</div>
            </div>
          </div>
        </div>
      </DesignSection>
    </DesignShowcaseLayout>
  )
}
