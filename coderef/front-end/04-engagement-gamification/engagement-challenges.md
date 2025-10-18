# Engagement Page: Quizzes, Challenges & Games Specification

**Date**: October 16, 2025
**Purpose**: Gamified engagement platform with 25+ quiz/challenge types to drive user retention and daily interaction
**Status**: Research Complete - Ready for Implementation
**Research**: Duolingo gamification patterns, ESPN interactive quizzes, sports trivia apps, competitive gaming platforms

---

## Executive Summary

**Mission**: Transform passive data browsing into active engagement through gamified challenges, quizzes, and competitive play.

**Key Insight**: Users don't just want to *read* stats—they want to *test their knowledge* and *compete* against other fans.

**Engagement Driver**: Daily challenges, leaderboards, high score chasing, and achievement unlocking create habit-forming behavior.

**Target**: 1+ billion page views/year from gamification alone (based on sports app benchmarks)

---

## The 25+ Challenge Types

### **CATEGORY 1: PLAYER IDENTIFICATION (8 Types)**

#### 1. **"Guess the Player - By Stats"**
```
Player stats shown (hidden name):
• 4,694 passing yards this season
• 35 touchdowns
• 7 interceptions
• 65% completion rate
• 6'4" | 230 lbs

[Guess] [Skip] [Give Up]
→ Shows: Difficulty (Easy/Medium/Hard)
→ Reward: +10 pts for correct, streak counter
```

**Features**:
- Difficulty tiers (rookie, pro, hall of fame)
- Time pressure (30 sec limit for hard mode)
- Multiple choice + open answer
- Hints system (show team, show year, show era)
- Streak multiplier (3x bonus at 5-win streak)

---

#### 2. **"Who is This Player - Career Story"**
```
CAREER NARRATIVE CLUE:
"Drafted in 2004 as 1st overall pick. Won
3 Super Bowls with New England. Played for
Tampa Bay at end of career. Threw 600+ TDs."

[Brady] [Peyton Manning] [Tom Brees]
→ Only description, no stats shown
→ Difficulty: MEDIUM
```

**Features**:
- Narrative-based identification
- Multiple choice only
- 4-6 answer options
- Context clues (era, team, achievements)
- Reward: +15 pts for correct

---

#### 3. **"Combine Results Matching"**
```
COMBINE MEASUREMENTS SHOWN:
• 40-yard dash: 4.71 sec
• Bench press: 225 lbs × 25 reps
• Vertical jump: 31.5 inches
• 3-cone drill: 6.98 sec

Which player has these exact combine results?
[4 Player Options]
→ Match combine data to player
→ Difficulty: HARD
```

**Features**:
- Specific combine metrics
- Match to actual players
- Only scouts remember these!
- High difficulty = high reward (+25 pts)
- Leaderboard tracked

---

#### 4. **"Blind Stats - Guess The Position"**
```
STATS SHOWN (No position/name):
• 127 receptions
• 1,863 receiving yards
• 12 touchdowns
• 89 targets

What position is this?
[WR] [TE] [RB] [FB]
→ Guess position only
→ Difficulty: EASY-MEDIUM
```

**Features**:
- See stats, guess position
- Multiple choice (4-5 options)
- Reward: +5 pts (easy)
- Chains: Get 3 in a row = bonus
- Used to test stat knowledge

---

#### 5. **"Height & Weight Guessing"**
```
PLAYER NAME & PHOTO SHOWN:
"Patrick Mahomes"

Estimate his measurements:
Height: [5'10" | 6'0" | 6'2" | 6'4"]
Weight: [200 lbs | 220 lbs | 240 lbs | 260 lbs]

→ Exact match required
→ Difficulty: MEDIUM
```

**Features**:
- See player, guess physical specs
- Multiple choice for each attribute
- Both must be correct for points
- Reward: +8 pts if both correct
- Context: Famous tall/short players

---

#### 6. **"Jersey Number Guessing"**
```
PLAYER & STATS SHOWN:
"Troy Aikman"
Status: Hall of Famer
Teams: Dallas Cowboys
Stats: 32,942 passing yards

What was his jersey number?
[6] [7] [8] [9] [10]

→ Simple but tests fan knowledge
→ Difficulty: EASY
```

**Features**:
- Multiple choice (5 options)
- Just the number
- Quick 10-second challenges
- Reward: +3 pts
- Bulk up speed (play 10 in row)

---

#### 7. **"Career Timeline Ordering"**
```
Order these events in Troy Aikman's career:
1. First NFL game
2. Super Bowl VI win
3. Hall of Fame induction
4. Retired

[Drag to reorder or click in order]

→ Test knowledge of career progression
→ Difficulty: MEDIUM
```

**Features**:
- Drag-and-drop or click interface
- 3-5 events to order
- Points based on accuracy
- Reward: +12 pts for perfect order
- Show correct vs. your order

---

#### 8. **"Dead or Alive? Hall of Famer Status"**
```
PLAYER SHOWN:
[Photo of Hall of Famer]
"Gino Marchetti"

Is he:
[In Hall of Fame] [Not Yet] [Deceased]

→ Multiple choice
→ Test knowledge of current HOF status
→ Difficulty: MEDIUM-HARD
```

**Features**:
- Photo shown
- 2-3 status options
- Reward: +7 pts
- Streak counter
- Educational (learn HOF status)

---

### **CATEGORY 2: STAT COMPARISON CHALLENGES (7 Types)**

#### 9. **"Pick The Better Player - This Season"**
```
THIS SEASON STATS:
Patrick Mahomes vs. Josh Allen

MAHOMES:
• 3,518 passing yards
• 23 TDs, 12 INTs
• 64.8% completion

ALLEN:
• 3,731 passing yards
• 28 TDs, 15 INTs
• 63.1% completion

Who had the better season?
[Mahomes] [Allen] [About Equal]

→ Difficulty: MEDIUM
→ Reward: +20 pts
```

**Features**:
- Two players, head-to-head stats
- Pick winner or tie
- Timed (30 seconds)
- Wrong = 0 pts, right = +20
- Streak multiplier (5x at 10-win streak)

---

#### 10. **"Tournament Bracket - Best QB Ever"**
```
FINALS MATCHUP:
Tom Brady vs. Joe Montana

HEAD-TO-HEAD COMPARISON:
Brady: 7 Super Bowls, 87,000 yards, 700 TDs
Montana: 4 Super Bowls, 40,500 yards, 244 TDs

Who would you pick for GOAT?
[Brady] [Montana] [Toss-up]

→ Subjective, but show voting results
→ See how many agree with you
→ Difficulty: HARD (opinion-based)
```

**Features**:
- Bracket-style tournament
- Play-by-play matchups (16 → 8 → 4 → 2 → Final)
- Compare stats, records, achievements
- Vote on each matchup
- See crowd voting results
- Reward: +50 pts to complete bracket
- Track your bracket vs. crowd

---

#### 11. **"Stat Progression Line Chart"**
```
CAREER STAT PROGRESSION SHOWN:
[Line chart of receiving yards by year]

Year 1: 87 yards
Year 2: 412 yards
Year 3: 890 yards
Year 4: 1,250 yards
Year 5: 1,520 yards

Who is this?
[4 Player Options]

→ Identify player by progression curve
→ Difficulty: HARD
```

**Features**:
- Visual line chart
- Show stat progression over career
- Multiple choice
- Reward: +18 pts
- Tests knowledge of career arcs

---

#### 12. **"Average or Above Average?"**
```
STAT SHOWN:
"1,250 receiving yards in one season"

Is this average or above average
for a WR in 2024?
[Average] [Above Average] [Exceptional]

→ Quick reality check
→ Difficulty: EASY-MEDIUM
```

**Features**:
- Single stat shown
- 3 options (average, above, exceptional)
- Quick 10-second challenges
- Reward: +6 pts
- Learn NFL context

---

#### 13. **"Higher or Lower - Stat Comparison"**
```
Patrick Mahomes career passing yards:
~15,000 yards

Is Tom Brady's career passing yards:
[HIGHER] [LOWER]

Answer: HIGHER (87,000 yards)

→ Quick comparison
→ Difficulty: EASY
```

**Features**:
- One stat given
- Compare to another player
- Higher/Lower choice
- Rapid-fire format
- Reward: +4 pts each
- Play 10 in a row for chain bonus

---

#### 14. **"Pro Bowl/All-Pro Predictor"**
```
2024 REGULAR SEASON PERFORMANCE:
Patrick Mahomes
• 3,518 passing yards
• 23 TDs
• Kansas City Chiefs: 9-1

Predict his awards:
[Pro Bowl: Yes/No]
[All-Pro: Yes/No]
[MVP Vote Top 3: Yes/No]

→ Predict awards based on performance
→ Difficulty: MEDIUM-HARD
```

**Features**:
- See season stats
- Predict awards
- Multiple checkboxes
- Compare predictions after awards announced
- Reward: +25 pts per correct prediction

---

#### 15. **"Ranking Challenge - Best to Worst"**
```
RANK THESE 5 QBs BY CAREER PASSING YARDS:
• Patrick Mahomes
• Peyton Manning
• Tom Brady
• Drew Brees
• Dan Marino

[Drag to rank or click numbers]

→ Order from most to least
→ Difficulty: MEDIUM
```

**Features**:
- Drag-and-drop or click-to-order
- 5-10 players to rank
- Points based on accuracy
- Reward: +15 pts for perfect order
- Show leaderboard of rankings

---

### **CATEGORY 3: TRIVIA & KNOWLEDGE (5 Types)**

#### 16. **"Stadium Trivia"**
```
Which stadium holds the record for
most Super Bowls hosted?

[3] [4] [5] [7]

Correct: 5 Super Bowls (Miami Orange Bowl)

→ Difficulty: HARD
→ Reward: +12 pts
```

**Features**:
- Stadium-specific facts
- Multiple choice
- 4-6 options
- Reward: +12 pts for correct
- Learn stadium history

---

#### 17. **"Era Matching - Player to Decade"**
```
PLAYER STATS SHOWN:
8,000 passing yards, 60 TDs,
3 Super Bowls, 1970s style stats

What era did this QB play?
[1970s] [1980s] [1990s] [2000s]

→ Match stats to correct era
→ Difficulty: MEDIUM
```

**Features**:
- See career stats
- Guess which era/decade
- Multiple choice
- Reward: +14 pts
- Learn historical context

---

#### 18. **"Super Bowl Trivia"**
```
Super Bowl LVIII (2024):
Kansas City Chiefs vs San Francisco 49ers

Final score was:
[22-25 OT] [25-22 OT] [28-25 OT] [25-23 OT]

Correct: Kansas City 25, San Francisco 22 (OT)

→ Remember famous games
→ Difficulty: MEDIUM
```

**Features**:
- Ask about recent/famous SBs
- Final scores, MVPs, records
- Multiple choice
- Reward: +13 pts
- Educational about big games

---

#### 19. **"Hall of Fame Vote - Who Gets In?"**
```
PLAYER ELIGIBILITY YEAR:
This player is first-ballot eligible
for Hall of Fame:

9 Pro Bowls
5 All-Pro selections
1 Super Bowl win
Stats: Elite for 12 seasons

Should they be inducted?
[YES] [NO] [FUTURE]

→ Vote and see crowd results
→ Difficulty: SUBJECTIVE
```

**Features**:
- Show career credentials
- Vote on HOF worthiness
- See what % of crowd agrees
- Debate-style engagement
- Reward: +10 pts for voting

---

#### 20. **"Pick The Draft Class"**
```
FAMOUS PLAYERS, SAME DRAFT CLASS:
• Patrick Mahomes
• Deshaun Watson
• Mitchell Trubisky

What year were they drafted?
[2015] [2016] [2017] [2018]

→ Match players to draft year
→ Difficulty: MEDIUM-HARD
```

**Features**:
- Show player names
- Pick draft year
- Multiple choice
- Reward: +11 pts
- Learn draft history

---

### **CATEGORY 4: PREDICTION CHALLENGES (3 Types)**

#### 21. **"Week By Week Prediction"**
```
CURRENT WEEK 7 STANDINGS

Predict the playoff teams:
Kansas City Chiefs: [In Playoffs] [Out]
Buffalo Bills: [In Playoffs] [Out]
Pittsburgh Steelers: [In Playoffs] [Out]
Baltimore Ravens: [In Playoffs] [Out]

→ Predict end-of-season outcomes
→ Locked in, compare after season
→ Difficulty: HARD
```

**Features**:
- Current standings shown
- Predict final playoff teams
- Checkboxes for each team
- Locked predictions
- Scored after season ends
- Reward: +50 pts for perfect prediction

---

#### 22. **"Season Record Prediction"**
```
Current record: 6-2 after 8 weeks

KANSAS CITY CHIEFS

Predict their final season record:
[9-8] [10-7] [11-6] [12-5] [13-4]

→ Prediction locked until season ends
→ Compare accuracy
→ Difficulty: HARD
```

**Features**:
- Current record shown
- Predict final record
- 4-5 options
- Locked until season ends
- Leaderboard of predictions
- Reward: +30 pts for correct

---

#### 23. **"MVP Prediction"**
```
CURRENT MVP RACE (Week 7):

Lamar Jackson: 3,518 passing yards, 28 TDs
Patrick Mahomes: 3,251 passing yards, 25 TDs
Josh Allen: 2,890 passing yards, 22 TDs

Who will win the 2024 MVP?
[Lamar Jackson] [Patrick Mahomes] [Josh Allen]

→ Predict winner
→ Locked, compare after voting
→ Difficulty: HARD
```

**Features**:
- Show leader stats
- Predict MVP
- Locked prediction
- Scored after voting
- Reward: +40 pts if correct
- Compare against crowd predictions

---

### **CATEGORY 5: SPEED & REFLEX CHALLENGES (2 Types)**

#### 24. **"Rapid Fire Stats"**
```
10 QUICK QUESTIONS - 30 SECONDS EACH

Q1: QB with most passing yards?
[Brady] [Brees] [Manning] [Marino]

Q2: RB with most rushing TDs all-time?
[Emmitt Smith] [Jerry Rice] [Walter Payton] [Barry Sanders]

Q3: Sacks leader this season?
[Aaron Donald] [Micah Parsons] [T.J. Watt] [Nick Bosa]

→ Go as fast as you can
→ Difficulty: MEDIUM-HARD
→ Time pressure = higher difficulty
```

**Features**:
- 10 rapid-fire questions
- 30 seconds per question timer
- Multiple choice
- Speed bonus (answer in <10 sec = 1.5x points)
- Reward: +8-12 pts per correct answer
- Leaderboard for speed

---

#### 25. **"Memory Matching - Stats"**
```
CARD MATCHING GAME:

[Hidden Card] [Hidden Card] [Hidden Card]
[Hidden Card] [Hidden Card] [Hidden Card]
[Hidden Card] [Hidden Card] [Hidden Card]

Flip cards to match:
Player name → Career passing yards
Player name → Career passing yards
...

→ Memory game with stats
→ Difficulty: EASY-MEDIUM
→ Fast-paced fun
```

**Features**:
- 12-16 hidden cards
- Match player to stat
- Flip to reveal
- Time tracked
- Reward: +5 pts per match
- Bonus if complete in <60 sec

---

### **BONUS CATEGORY: ADVANCED CHALLENGES (3 Types)**

#### 26. **"Scenario Analysis - Game Theory"**
```
CHAMPIONSHIP SCENARIO:

Down 3 points, 2 minutes left.
Possession: Kansas City at Dallas 40-yard line.

What's the best play call?
A) Run the football (chew clock)
B) Pass play (risk incomplete)
C) Two-minute warning (save timeout)

Explain your choice → Community votes

→ Scenario-based decision making
→ Difficulty: EXPERT
→ Subjective grading
```

**Features**:
- Real game scenarios
- Multiple strategy options
- Write explanation
- Community voting on best choice
- Reward: +25 pts if crowd agrees
- Debate/discussion format

---

#### 27. **"Career Arc Prediction"**
```
YOUNG PLAYER CAREER PROJECTION:

2021: 500 receiving yards
2022: 850 receiving yards
2023: 1,200 receiving yards
2024: 1,450 receiving yards

Predict his 2025 projection:
[1,600] [1,800] [2,000] [Decline < 1,450]

→ Extrapolate career trajectory
→ Difficulty: HARD
→ Requires trend analysis
```

**Features**:
- Show career progression
- Predict next year
- Multiple choice
- Reward: +20 pts if correct
- Learn trend analysis

---

#### 28. **"Advanced Stats Quiz"**
```
WHAT IS EPA (EXPECTED POINTS ADDED)?

A) Expected Player Achievement
B) Expected Points Above average
C) Expected Points Added on each play
D) Exceptional Performance Analysis

→ Learn advanced analytics
→ Multiple choice
→ Difficulty: HARD
```

**Features**:
- Advanced stat definitions
- Multiple choice
- Educational
- Reward: +8 pts
- Learn sports analytics
- Unlock "Expert" badge after 5 correct

---

### **BONUS: COMMUNITY FEATURES**

#### 29. **"Daily Challenge"**
```
DAILY CHALLENGE (Resets at midnight):

"Guess The Player - By Stats"
(Same challenge for all players)

Your Score: 24 pts
Leaderboard Position: #47 (out of 50,000)
Time Left Today: 12 hours

→ One challenge per day
→ Everyone plays same challenge
→ Global leaderboard
→ Reward: +25 pts to complete
```

**Features**:
- Changes daily (midnight reset)
- Same challenge for all players
- Global leaderboard
- Streaks (consecutive daily plays)
- Bonus for 7-day streak (×3 multiplier)

---

#### 30. **"Challenge Your Friends"**
```
HEAD-TO-HEAD CHALLENGE:

You: Patrick Mahomes Quiz

Share Link: [Copy]
→ Friends challenge you to same quiz
→ Post score
→ Compete in real-time
→ Difficulty: Variable

Features:
- Challenge specific players
- Share link on social
- Real-time scoring
- Leaderboard of challengers
- Reward: +15 pts per friend beaten
```

---

## 🎮 Gamification Mechanics

### **Progression System**
```
Levels (Based on Total Points):
└─ Rookie (0-1,000 pts)
└─ Pro (1,001-5,000 pts)
└─ All-Star (5,001-15,000 pts)
└─ Hall of Famer (15,001+ pts)

Badges (Achievements):
└─ 🎯 Accuracy (100 correct in a row)
└─ ⚡ Speed Demon (Complete 10 in 5 min)
└─ 🏆 Perfect Bracket (All predictions correct)
└─ 🧠 Stats Master (Expert category 10/10)
└─ 💯 Perfectionist (50 perfect scores)
└─ 🔥 On Fire (10-day streak)
└─ 🌍 Global Champion (Top 100 leaderboard)
└─ 👥 Social Butterfly (Challenge 20 friends)
```

### **Streaks & Multipliers**
```
Win Streak Multiplier:
1-2 wins:  1x points (baseline)
3-5 wins:  2x points
6-10 wins: 3x points
11-20 wins: 5x points
20+ wins: 10x points (LEGENDARY)

Daily Streak Multiplier:
1-3 days:   1x
4-7 days:   1.5x
8-14 days:  2x
15-30 days: 3x
30+ days:   5x (ELITE)
```

### **Leaderboards**
```
1. Global All-Time
   └─ Top 100 players by total points

2. This Week
   └─ Weekly reset, top performers

3. This Month
   └─ Monthly reset, seasonal competition

4. Friends
   └─ Compare against friends only

5. By Challenge Type
   └─ Best player ID-ers, best predictors, etc.

6. Speed Challenge
   └─ Fastest completion times

7. Accuracy Rating
   └─ Highest % correct answers

8. Streak Leaders
   └─ Current active streaks

9. New Players
   └─ Players in first 30 days

10. By Era
    └─ Best players at each era trivia
```

### **Rewards & Incentives**
```
Point System:
• Easy question: +3-5 pts
• Medium question: +8-12 pts
• Hard question: +15-25 pts
• Expert question: +30-50 pts

Streak Bonuses:
• 3-win streak: +50 bonus
• 10-win streak: +250 bonus
• 30-day streak: +1,000 bonus

Rewards Tiers:
• 100 pts → Unlock Expert category
• 500 pts → Get custom avatar
• 1,000 pts → Pro badge
• 5,000 pts → All-Star status
• 15,000 pts → Hall of Famer status
• 50,000 pts → Legend status

Redeemable Rewards:
• Points → Donate to charity
• High scores → NFT badge (optional)
• Achievements → Social media share
• Rankings → Bragging rights
```

---

## 📊 Data Models

### **Challenge Schema**
```json
{
  "challenge": {
    "id": "player-guess-001",
    "type": "player_identification_stats",
    "difficulty": "medium",
    "category": "player_identification",
    "question_text": "Guess the player by stats",
    "stats_shown": {
      "passing_yards": 3518,
      "touchdowns": 23,
      "interceptions": 12,
      "completion_pct": 64.8
    },
    "correct_answer": "patrick-mahomes",
    "answer_options": [
      "patrick-mahomes",
      "josh-allen",
      "lamar-jackson",
      "jalen-hurts"
    ],
    "time_limit": 30,
    "points_value": 20,
    "streak_multiplier": true
  }
}
```

### **Score Schema**
```json
{
  "user_score": {
    "user_id": "user-12345",
    "challenge_id": "player-guess-001",
    "points_earned": 30,
    "time_taken": 12,
    "correct": true,
    "streak_bonus": 50,
    "total_points": 80,
    "leaderboard_rank": 47,
    "timestamp": "2025-10-16T14:32:00Z"
  }
}
```

### **Leaderboard Schema**
```json
{
  "leaderboard": {
    "id": "global_all_time",
    "period": "all_time",
    "entries": [
      {
        "rank": 1,
        "user_id": "user-001",
        "username": "StatsKing",
        "total_points": 125000,
        "level": "Legend",
        "badges": 24,
        "current_streak": 47
      }
    ]
  }
}
```

---

## 🎯 Implementation Phases

### Phase 1: MVP (Week 1-2)
- ✅ 8 core challenge types
- ✅ Basic scoring system
- ✅ Personal leaderboard
- ✅ Point tracking
- ✅ Simple UI

### Phase 2: Enhanced (Week 3-4)
- ✅ 20 challenge types
- ✅ Streak multipliers
- ✅ Daily challenges
- ✅ Weekly leaderboard
- ✅ Achievement badges

### Phase 3: Advanced (Week 5-6)
- ✅ All 30 challenge types
- ✅ Friends challenges
- ✅ Global leaderboards
- ✅ Social sharing
- ✅ Notifications for streaks

### Phase 4: Polish (Week 7+)
- ✅ Analytics dashboard
- ✅ Seasonal competitions
- ✅ Special events
- ✅ Limited-time challenges
- ✅ Reward redemption

---

## 📱 Responsive Design

**Desktop**:
- Full leaderboard visible
- Challenge cards in grid
- Stats displayed in detail
- Comparison charts
- Progress bars

**Tablet**:
- 2-column layout
- Simplified leaderboard
- Card-based challenges
- Touch-optimized buttons

**Mobile**:
- Single column
- Full-width cards
- Simplified UI
- Touch-friendly (48px+ buttons)
- Minimal text

---

## 🔗 API Endpoints Needed

```
GET  /v1/challenges                     → All challenges
GET  /v1/challenges/{challenge_id}      → Specific challenge
POST /v1/challenges/{challenge_id}/submit → Submit answer
GET  /v1/leaderboard/{type}             → Leaderboards
GET  /v1/user/scores                    → User's scores
GET  /v1/user/streaks                   → Current streaks
GET  /v1/user/badges                    → Earned badges
GET  /v1/daily-challenge                → Today's challenge
POST /v1/challenge/{friend_id}          → Challenge friend
GET  /v1/challenges/random              → Random challenge
```

---

## ✅ Success Criteria

✅ Users spend 15+ min/day on engagement features
✅ 30-day retention rate 60%+
✅ Leaderboard drives competitive play
✅ Streaks encourage daily return
✅ Badges unlock sense of achievement
✅ Mobile experience equals desktop
✅ Challenges load in <2 seconds
✅ No bugs in scoring logic
✅ Accessible keyboard navigation

---

## 🎯 Expected Impact

**Engagement Metrics**:
- ✅ +300% session time increase
- ✅ +200% daily active users
- ✅ +150% repeat visitor rate
- ✅ +500% challenge completions/day
- ✅ +80% social sharing (friends challenges)

**Retention Metrics**:
- ✅ 60%+ 7-day retention
- ✅ 40%+ 30-day retention
- ✅ 5+ challenges per session average
- ✅ 4+ visits per week average

---

## 📚 Additional Resources

**Related Components**:
- Player Cards (for images/names)
- Historical Stats (for data)
- All-Time Games (for context)
- Super Bowl (for trivia)

**Tech Stack**:
- Frontend: React + Framer Motion (animations for score reveals)
- Backend: Node.js + Express (fast scoring)
- Database: PostgreSQL (leaderboard queries)
- Real-time: Socket.io (live leaderboard updates)
- Caching: Redis (leaderboard caching)

---

**Status**: Engagement Page Specification Complete - Ready for Implementation
**Related**: All player, stats, and historical components feed into engagement
**Owner**: Frontend team (Next.js implementation)
**Impact**: 300%+ engagement increase expected

