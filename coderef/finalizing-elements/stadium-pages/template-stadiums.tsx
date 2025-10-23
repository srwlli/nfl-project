import { DesignShowcaseLayout, DesignSection } from "@/components/design-showcase-layout"
import { DESIGN_STYLES } from "@/lib/design-styles"

export default function StadiumsPage() {
  return (
    <DesignShowcaseLayout
      title="Stadium Pages"
      description="Comprehensive NFL stadium pages with venue information, team history, capacity details, amenities, directions, and notable moments. Features stadium comparisons, records, and game history."
    >
      {/* Modern Dashboard Style */}
      <DesignSection title="Stadium Overview - Hero Section" designStyle={DESIGN_STYLES.modernDashboard.name}>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          {/* Stadium Hero Image */}
          <div className="relative h-64 bg-gradient-to-br from-red-500/20 to-yellow-500/20 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl mb-4">🏟️</div>
              <div className="text-sm text-muted-foreground">Stadium Photo</div>
            </div>
          </div>

          {/* Stadium Header */}
          <div className="p-6 border-b border-border">
            <h1 className="text-3xl font-bold mb-2">Arrowhead Stadium</h1>
            <p className="text-muted-foreground mb-4">Kansas City, Missouri • Home of Kansas City Chiefs</p>

            <div className="flex flex-wrap gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Opened:</span>
                <span className="font-medium">1972</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Capacity:</span>
                <span className="font-medium">76,416</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Surface:</span>
                <span className="font-medium">Natural Grass</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Roof:</span>
                <span className="font-medium">Open-Air</span>
              </div>
            </div>
          </div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-6">
            {[
              { label: "Total Games", value: "900+", sublabel: "Since 1972" },
              { label: "Home Record", value: "465-410", sublabel: "Chiefs wins" },
              { label: "Luxury Suites", value: "112", sublabel: "Premium seating" },
              { label: "Parking Spaces", value: "9,500", sublabel: "$25-$50" },
            ].map((stat, i) => (
              <div key={i} className="text-center p-4 bg-background rounded-lg">
                <div className="text-2xl font-bold mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </DesignSection>

      {/* Data-Heavy Stats Style */}
      <DesignSection title="Stadium Facts & Specifications" designStyle={DESIGN_STYLES.dataHeavy.name}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Basic Information</h3>
            <div className="space-y-3">
              {[
                { label: "Location", value: "Kansas City, Missouri" },
                { label: "Opened", value: "September 10, 1972" },
                { label: "Capacity", value: "76,416" },
                { label: "Surface Type", value: "Natural Grass" },
                { label: "Roof Type", value: "Open-Air" },
                { label: "Architect", value: "Kivett & Myers" },
                { label: "Build Cost", value: "$43 million (1972)" },
                { label: "Total Games", value: "900+ (franchise history)" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}:</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Facilities */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="font-semibold mb-4">Facilities & Amenities</h3>
            <div className="space-y-3">
              {[
                { label: "Seating Levels", value: "3 decks" },
                { label: "Luxury Suites", value: "112" },
                { label: "Club Seats", value: "6,500+" },
                { label: "Accessible Seating", value: "1,000+" },
                { label: "Food Courts", value: "25+" },
                { label: "Restaurants", value: "5 full-service" },
                { label: "WiFi", value: "Yes (premium)" },
                { label: "Video Boards", value: "Multiple" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{item.label}:</span>
                  <span className="font-medium">{item.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Team History */}
          <div className="bg-card border border-border rounded-lg p-6 md:col-span-2">
            <h3 className="font-semibold mb-4">Team Timeline</h3>
            <div className="space-y-4">
              <div className="border-l-4 border-primary pl-4">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-semibold">Kansas City Chiefs</h4>
                  <span className="text-xs px-2 py-1 bg-primary/10 text-primary rounded">1972-Present</span>
                </div>
                <div className="grid grid-cols-3 gap-4 text-sm mb-2">
                  <div>
                    <span className="text-muted-foreground">Years:</span> <span className="font-medium">53</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Games:</span> <span className="font-medium">900+</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Record:</span> <span className="font-medium">465-410</span>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Notable: 53-year tenure, multiple Super Bowl championships, home to Patrick Mahomes era
                </p>
              </div>
            </div>
          </div>
        </div>
      </DesignSection>

      {/* Card-Based Modular Style */}
      <DesignSection title="Stadium Records & Notable Moments" designStyle={DESIGN_STYLES.cardBased.name}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            {
              category: "Passing Record",
              record: "424 yards",
              player: "Matt Ryan",
              team: "Falcons",
              date: "Oct 2, 2016",
              color: "blue",
            },
            {
              category: "Rushing Record",
              record: "200+ yards",
              player: "Jamaal Charles",
              team: "Chiefs",
              date: "Dec 14, 2008",
              color: "green",
            },
            {
              category: "Receiving Record",
              record: "215 yards",
              player: "Travis Kelce",
              team: "Chiefs",
              date: "Oct 15, 2023",
              color: "purple",
            },
            {
              category: "Highest Score",
              record: "59 points",
              player: "Chiefs vs Raiders",
              team: "Chiefs",
              date: "Nov 5, 2017",
              color: "red",
            },
            {
              category: "Largest Margin",
              record: "51 points",
              player: "Chiefs vs Jets",
              team: "Chiefs",
              date: "Sep 25, 2016",
              color: "orange",
            },
            {
              category: "Attendance Record",
              record: "76,416",
              player: "Sold Out",
              team: "Multiple games",
              date: "Various",
              color: "yellow",
            },
          ].map((record, i) => (
            <div key={i} className="bg-card border border-border rounded-lg p-5 hover:border-primary transition-colors">
              <div className="flex items-start justify-between mb-3">
                <h4 className="font-semibold text-sm">{record.category}</h4>
                <span className={`text-xs px-2 py-1 bg-${record.color}-500/10 text-${record.color}-500 rounded`}>
                  Record
                </span>
              </div>
              <div className="text-2xl font-bold mb-2">{record.record}</div>
              <div className="text-sm mb-1">{record.player}</div>
              <div className="text-xs text-muted-foreground">{record.team}</div>
              <div className="text-xs text-muted-foreground mt-2">{record.date}</div>
            </div>
          ))}
        </div>
      </DesignSection>

      {/* Classic Reference Style */}
      <DesignSection title="Stadium Capacity Comparison" designStyle={DESIGN_STYLES.classicReference.name}>
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="bg-muted px-6 py-4 border-b border-border">
            <h3 className="font-semibold">NFL Stadium Capacity Rankings</h3>
            <p className="text-sm text-muted-foreground mt-1">How Arrowhead compares to other NFL venues</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide">Rank</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide">Stadium</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide">Team</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide">Capacity</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide">Difference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  { rank: 1, stadium: "MetLife Stadium", team: "Giants/Jets", capacity: "82,500", diff: "+6,084" },
                  { rank: 2, stadium: "Lambeau Field", team: "Packers", capacity: "81,441", diff: "+5,025" },
                  { rank: 3, stadium: "AT&T Stadium", team: "Cowboys", capacity: "80,000", diff: "+3,584" },
                  {
                    rank: 4,
                    stadium: "Arrowhead Stadium",
                    team: "Chiefs",
                    capacity: "76,416",
                    diff: "—",
                    highlight: true,
                  },
                  { rank: 5, stadium: "Empower Field", team: "Broncos", capacity: "76,125", diff: "-291" },
                  { rank: 6, stadium: "Bank of America", team: "Panthers", capacity: "75,523", diff: "-893" },
                ].map((row, i) => (
                  <tr key={i} className={row.highlight ? "bg-primary/5" : "hover:bg-muted/50"}>
                    <td className="px-6 py-4 text-sm font-medium">{row.rank}</td>
                    <td className="px-6 py-4 text-sm font-medium">{row.stadium}</td>
                    <td className="px-6 py-4 text-sm">{row.team}</td>
                    <td className="px-6 py-4 text-sm font-medium">{row.capacity}</td>
                    <td className="px-6 py-4 text-sm">
                      {row.diff === "—" ? (
                        <span className="text-muted-foreground">{row.diff}</span>
                      ) : row.diff.startsWith("+") ? (
                        <span className="text-green-500">{row.diff}</span>
                      ) : (
                        <span className="text-red-500">{row.diff}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-muted/50 border-t border-border">
            <div className="flex items-center justify-between text-sm">
              <div className="text-muted-foreground">
                Arrowhead Stadium ranks <span className="font-semibold text-foreground">4th</span> in NFL capacity
              </div>
              <div className="text-muted-foreground">
                <span className="font-semibold text-foreground">+7.6%</span> larger than average (71,000)
              </div>
            </div>
          </div>
        </div>
      </DesignSection>

      {/* Premium Glassmorphic Style */}
      <DesignSection title="Directions & Getting There" designStyle={DESIGN_STYLES.premiumGlass.name}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Address & Parking */}
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Address & Location</h3>
                <p className="text-xs text-muted-foreground">How to get to Arrowhead</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="bg-background/50 border border-border rounded-lg p-4">
                <div className="text-sm font-medium mb-2">Stadium Address</div>
                <div className="text-sm text-muted-foreground">
                  1 Arrowhead Drive
                  <br />
                  Kansas City, Missouri 64129
                  <br />
                  USA
                </div>
              </div>

              <div className="bg-background/50 border border-border rounded-lg p-4">
                <div className="text-sm font-medium mb-2">Parking Information</div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Spaces:</span>
                    <span className="font-medium">9,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Cost:</span>
                    <span className="font-medium">$25-$50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Reserved:</span>
                    <span className="font-medium">2,000 spaces</span>
                  </div>
                </div>
              </div>

              <button className="w-full px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90">
                View Interactive Map
              </button>
            </div>
          </div>

          {/* Transportation */}
          <div className="bg-gradient-to-br from-green-500/10 via-green-500/5 to-transparent border border-green-500/20 rounded-xl p-6 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                  />
                </svg>
              </div>
              <div>
                <h3 className="font-semibold">Transportation Options</h3>
                <p className="text-xs text-muted-foreground">Multiple ways to arrive</p>
              </div>
            </div>

            <div className="space-y-3">
              {[
                {
                  method: "Driving",
                  details: "I-70 East from downtown KC",
                  time: "~10 min",
                  icon: "🚗",
                },
                {
                  method: "Public Transit",
                  details: "RideKC Route 12, 28",
                  time: "~15 min",
                  icon: "🚌",
                },
                {
                  method: "Ride Share",
                  details: "Uber/Lyft drop-off area",
                  time: "~10 min",
                  icon: "🚕",
                },
                {
                  method: "Hotel Shuttle",
                  details: "Many hotels provide service",
                  time: "Varies",
                  icon: "🏨",
                },
              ].map((option, i) => (
                <div key={i} className="bg-background/50 border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{option.icon}</div>
                    <div className="flex-1">
                      <div className="text-sm font-medium">{option.method}</div>
                      <div className="text-xs text-muted-foreground">{option.details}</div>
                    </div>
                    <div className="text-xs text-muted-foreground">{option.time}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DesignSection>
    </DesignShowcaseLayout>
  )
}
