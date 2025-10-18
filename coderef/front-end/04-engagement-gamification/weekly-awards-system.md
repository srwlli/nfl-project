# WEEKLY AWARDS SYSTEM SPECIFICATION

**Version**: 1.0
**Created**: October 16, 2025
**Component Type**: Recurring Recognition & Engagement Driver
**Priority**: HIGH (Weekly ritual, viral potential, community building)
**Estimated Size**: ~48 KB

---

## TABLE OF CONTENTS
1. [Executive Summary](#executive-summary)
2. [Normal/Serious Awards](#normal-serious-awards)
3. [Odd/Funny/Quirky Awards](#odd-funny-quirky-awards)
4. [Award Ceremony Page](#award-ceremony-page)
5. [User Notifications](#user-notifications)
6. [Data Structures](#data-structures)
7. [Implementation](#implementation)

---

## EXECUTIVE SUMMARY

### Mission
Create a weekly awards system that recognizes both exceptional achievements AND quirky/funny user behaviors, driving engagement, virality, and community culture through regular recognition and lighthearted competition.

### Why Weekly Awards Work
- **Recurring Ritual**: Users return every Tuesday to see who won
- **Social Proof**: Award winners get badge + bragging rights
- **Viral Sharing**: "I won Couch GM of the Week!" drives shares
- **FOMO**: "I was so close to winning!" drives more engagement
- **Community Culture**: Funny awards create inside jokes and personality
- **Retention**: Users engage more to win next week's awards

### Award Structure
- **40 Total Weekly Awards** (20 Normal + 20 Odd)
- **Every Tuesday at 12pm ET**: Awards announced
- **Winners Featured**: Homepage banner, profile badge, notifications
- **Rewards**: XP bonus, limited edition badge, social recognition
- **Multiple Winners**: Some awards have Top 3, others have single winner

---

## NORMAL/SERIOUS AWARDS

### Category 1: Prediction Excellence (5 Awards)

#### 1. 📊 **ORACLE OF THE WEEK**
**Criteria**: Most correct predictions this week (minimum 10 predictions)
**Reward**: +500 XP, Oracle badge, featured on homepage
**Typical Winner**: User who went 14/16 or 15/16 on weekly picks

**Example Announcement:**
```
🏆 ORACLE OF THE WEEK - Week 11, 2025

Winner: BuffaloKing_99
Record: 15/16 correct predictions (93.8%)
Only missed: Cowboys vs. Eagles (picked Cowboys)

"I studied injury reports all week and it paid off!"
- BuffaloKing_99

Reward: +500 XP, Oracle of the Week badge

Runners-Up:
🥈 ChiefsKingdom88 (14/16, 87.5%)
🥉 NFL_Prophet (14/16, 87.5%)
```

#### 2. 🎯 **UPSET SPECIAL**
**Criteria**: Most underdog/upset picks correct this week
**Reward**: +350 XP, Upset Master badge

**Example Winner**: User who correctly picked 3 underdog upsets (Browns over Ravens, Cardinals over 49ers, Jets over Bills)

#### 3. 🔥 **HOT STREAK KING**
**Criteria**: Longest active prediction streak (across multiple weeks)
**Reward**: +400 XP, Streak Master badge

**Example Winner**: User currently at 23 correct predictions in a row

#### 4. 💎 **PRIME TIME PROPHET**
**Criteria**: Perfect record on SNF/MNF/TNF games this week
**Reward**: +300 XP, Prime Time badge

#### 5. 📈 **MOST IMPROVED PREDICTOR**
**Criteria**: Biggest accuracy improvement week-over-week
**Reward**: +250 XP, Rising Star badge

**Example**: User went from 37.5% accuracy (Week 10) to 81.3% (Week 11)

---

### Category 2: Mini Games Mastery (5 Awards)

#### 6. 🎮 **GAMER OF THE WEEK**
**Criteria**: Most total mini game points earned this week
**Reward**: +500 XP, Gamer of the Week badge, featured leaderboard spot

**Example Winner**:
```
🏆 GAMER OF THE WEEK - Week 11, 2025

Winner: ReactKing_42
Total Points: 48,920 pts (347 games played)
Best Game: Stopwatch Challenge (47 perfect scores!)
Avg Score: 141 pts/game

"I couldn't stop playing. Send help."
- ReactKing_42

Reward: +500 XP, Gamer of the Week badge

Top 3 Games This Week:
1. Stopwatch Challenge: 8,247 pts
2. Reaction Time: 7,892 pts
3. Clip Speed Challenge: 6,541 pts
```

#### 7. ⚡ **SPEEDRUN CHAMPION**
**Criteria**: Fastest time in any mini game with leaderboard reset
**Reward**: +400 XP, Speed Demon badge

#### 8. 🎯 **PERFECT WEEK GAMER**
**Criteria**: Most perfect scores across all mini games this week
**Reward**: +450 XP, Perfectionist badge

#### 9. 🧠 **MEMORY MASTER**
**Criteria**: Best Memory Match average time (minimum 20 games)
**Reward**: +300 XP, Memory King badge

#### 10. 🎬 **CLIP CONNOISSEUR**
**Criteria**: Most correct video clip identifications this week
**Reward**: +350 XP, Clip Expert badge

---

### Category 3: Collection & Trading (3 Awards)

#### 11. 🃏 **COLLECTOR OF THE WEEK**
**Criteria**: Most player cards acquired this week (packs + trades)
**Reward**: +400 XP, Master Collector badge, free silver pack

**Example Winner**: User who opened 12 packs and completed 8 trades to get 47 new cards

#### 12. 💰 **TRADER OF THE WEEK**
**Criteria**: Most successful trades completed (volume + satisfaction rating)
**Reward**: +350 XP, Deal Maker badge

**Example**: User completed 15 trades with 100% positive feedback

#### 13. 💎 **LEGENDARY PULL**
**Criteria**: Rarest card pulled from pack this week
**Reward**: +500 XP, Lucky Strike badge

**Example**: User pulled 💎 Barry Sanders (1989) - Serial #3/25

---

### Category 4: Social & Community (4 Awards)

#### 14. 🗣️ **DEBATE CHAMPION**
**Criteria**: Most debate wins this week (majority vote)
**Reward**: +400 XP, Debate King badge

**Example Winner**:
```
🏆 DEBATE CHAMPION - Week 11, 2025

Winner: HotTakeHenry
Debates Won: 7/8 (87.5%)
Most Popular: "Lamar Jackson is the best dual-threat QB ever"
    → 84% community agreement (2,847 votes)

"I come prepared with receipts!"
- HotTakeHenry

Reward: +400 XP, Debate Champion badge
```

#### 15. 🔥 **VIRAL POST OF THE WEEK**
**Criteria**: Most upvoted post/comment this week
**Reward**: +500 XP, Viral Star badge, featured on homepage

**Example**: User's hot take got 4,247 upvotes: "The Bills are winning the Super Bowl. @ me in February."

#### 16. 📊 **RANKING GENIUS**
**Criteria**: Most popular custom ranking created this week
**Reward**: +350 XP, Ranking Master badge

**Example**: "Top 10 One-Hit Wonder Players" got 3,124 views and 512 upvotes

#### 17. 💬 **COMMUNITY MVP**
**Criteria**: Most helpful comments/replies (upvotes on comments)
**Reward**: +300 XP, Community Leader badge

---

### Category 5: Fantasy & Simulation (3 Awards)

#### 18. 🏈 **FANTASY GENIUS**
**Criteria**: Highest-rated fantasy draft team created this week
**Reward**: +400 XP, Draft Master badge

**Example**: User drafted a 98 OVR all-time team (2000s era only)

#### 19. 🎲 **ELO TOURNAMENT MASTER**
**Criteria**: Most accurate tournament simulation predictions
**Reward**: +350 XP, Simulation Expert badge

**Example**: User correctly predicted 15/16 matchup winners in 32-team tournament

#### 20. 🏆 **DYNASTY BUILDER**
**Criteria**: Most upvoted custom ELO tournament created
**Reward**: +300 XP, Dynasty badge

---

## ODD/FUNNY/QUIRKY AWARDS

### Category 6: Dedication (& Obsession) Awards (5 Awards)

#### 21. 🌙 **NIGHT OWL AWARD**
**Criteria**: Most activity between 2am - 5am local time
**Reward**: +200 XP, Night Owl badge, "I Have a Problem" title

**Example Announcement:**
```
🦉 NIGHT OWL AWARD - Week 11, 2025

Winner: InsomniacFan247
Active Hours: 38 sessions between 2am-5am
Peak Activity: 4:17am (playing mini games)
Sleep Deprivation Level: EXTREME

"I live in Europe... I swear..."
- InsomniacFan247 (IP shows Buffalo, NY 😂)

Reward: +200 XP, Night Owl badge
Community: Please get some sleep, king.
```

#### 22. 🔄 **REFRESH CHAMPION**
**Criteria**: Most page refreshes on game day waiting for score updates
**Reward**: +150 XP, Refresh Warrior badge, "F5 Gang" title

**Example**: User refreshed scoreboard 847 times during Sunday games

#### 23. 📱 **BATHROOM CHAMPION**
**Criteria**: Most sessions on mobile between 5-15 minutes (avg bathroom time)
**Reward**: +100 XP, Throne Time badge

**Example**: User had 47 mobile sessions averaging 8.2 minutes each. We all know what you were doing. 🚽

#### 24. 🏃 **SPEED READER AWARD**
**Criteria**: Shortest average time on articles (under 30 seconds) but still commenting
**Reward**: +100 XP, "Definitely Read That" badge

**Example**: User "read" 24 articles averaging 12 seconds each, then left detailed comments. Sure, buddy. 😂

#### 25. 🎯 **TAB HOARDER**
**Criteria**: Most simultaneous tabs/windows open on site at once
**Reward**: +150 XP, Tab Master badge

**Example**: User had 37 tabs open simultaneously. Close some tabs, man!

---

### Category 7: Statistical Oddities (5 Awards)

#### 26. 💀 **WORST PREDICTIONS**
**Criteria**: Worst prediction record this week (minimum 10 predictions)
**Reward**: +100 XP, "Trust Your Gut Less" badge, wooden spoon trophy

**Example Announcement:**
```
💀 WORST PREDICTIONS AWARD - Week 11, 2025

Winner: AlwaysWrongAl
Record: 2/16 correct (12.5%)
Got these right: Panthers over Cowboys (flukes), Jaguars over Titans
Missed EVERYTHING else, including all favorites

"I'm picking opposite next week."
- AlwaysWrongAl

Reward: +100 XP, Wooden Spoon badge
Community: Maybe just flip a coin? 😂

Fun Fact: You would've been better off picking by team colors!
```

#### 27. 🎲 **ALMOST AWARD**
**Criteria**: Most 2nd place finishes without a 1st place this week
**Reward**: +150 XP, "Always the Bridesmaid" badge

**Example**: User finished 2nd in 8 different mini game daily leaderboards. Never 1st. So close!

#### 28. 🔀 **CHAOS COORDINATOR**
**Criteria**: Predictions that made the least sense statistically but somehow worked
**Reward**: +200 XP, Chaos Agent badge

**Example**: User picked every underdog regardless of spread and went 9/16. Chaos!

#### 29. 📊 **PERFECTLY AVERAGE**
**Criteria**: Closest to exactly 50% correct predictions (minimum 20)
**Reward**: +100 XP, "Mr. Coinflip" badge

**Example**: User went 10/20 on predictions. Literally a coin flip.

#### 30. 🎰 **PACK LUCK EXTREME**
**Criteria**: Best OR worst pack opening luck this week (extreme variance)
**Reward**: +200 XP, either "Blessed by RNG Gods" or "Cursed by RNG" badge

**Example (Good)**: User opened 3 packs, got 2 legendaries. Insane luck!
**Example (Bad)**: User opened 15 packs, got zero gold+ cards. Brutal.

---

### Category 8: Hot Take & Debate Chaos (5 Awards)

#### 31. 🔥 **HOTTEST TAKE**
**Criteria**: Most controversial post/debate (closest to 50-50 split)
**Reward**: +250 XP, Controversy King badge

**Example Announcement:**
```
🔥 HOTTEST TAKE OF THE WEEK - Week 11, 2025

Winner: SpicyTakes_99
Hot Take: "Taysom Hill is a better athlete than Josh Allen"
Community Vote: 51% AGREE | 49% DISAGREE (8,492 votes)
Comments: 1,247 (mostly arguing)

"I stand by it. Josh is great but Taysom plays QB/RB/WR/TE!"
- SpicyTakes_99

Reward: +250 XP, Controversy King badge
Community: This one hurt. But respect. 🌶️
```

#### 32. 😤 **WORST TAKE**
**Criteria**: Post/debate with lowest agreement percentage
**Reward**: +100 XP, "Hot Garbage" badge

**Example**: User said "Nathan Peterman was underrated" - 4% agreement. NO.

#### 33. 🎤 **DEBATE LORD**
**Criteria**: Most debates started this week (regardless of wins)
**Reward**: +200 XP, Professional Arguer badge

**Example**: User started 27 debates in one week. Bro, go outside.

#### 34. 🧂 **SALTIEST FAN**
**Criteria**: Most comments about refs/bad calls after favorite team loses
**Reward**: +100 XP, Salt Shaker badge

**Example**: User left 47 comments blaming refs after Bills lost. Rent free.

#### 35. 🏆 **REVERSE JINX KING**
**Criteria**: Predicted their favorite team would lose, team won (or vice versa)
**Reward**: +150 XP, Reverse Psychology badge

**Example**: User predicted "Bills will lose by 20" before beating Chiefs by 14. Worked!

---

### Category 9: Collection Chaos (3 Awards)

#### 36. 💸 **BIGGEST OVERPAY**
**Criteria**: Worst trade value differential (paid way too much)
**Reward**: +100 XP, "Bad at Math" badge

**Example**: User traded 3 gold cards for 1 bronze card. Why?!

#### 37. 🤝 **CARD CHARITY**
**Criteria**: Gave away best cards in lopsided trades (helping new users)
**Reward**: +300 XP, Santa Claus badge, Good Samaritan title

**Example**: User gave away 5 gold cards to new players for basically nothing. Hero!

#### 38. 🗑️ **ROSTER HOARDER**
**Criteria**: Owns most cards but refuses to trade any
**Reward**: +100 XP, Dragon Hoarder badge

**Example**: User has 847 cards, declined 124 trade offers this week. Gollum energy.

---

### Category 10: Miscellaneous Madness (2 Awards)

#### 39. 🎨 **PROFILE PERFECTIONIST**
**Criteria**: Most profile edits in one week
**Reward**: +100 XP, Perfectionist badge

**Example**: User edited profile bio 34 times. Pick one and commit!

#### 40. 📸 **SCREENSHOT SHARER**
**Criteria**: Most profile cards generated and shared to social media
**Reward**: +200 XP, Brand Ambassador badge

**Example**: User shared 18 different profile cards to Twitter. Thanks for the marketing!

---

## AWARD CEREMONY PAGE

### Weekly Awards Homepage

```
╔════════════════════════════════════════════════════════════════╗
║  🏆 WEEKLY AWARDS - WEEK 11, 2025                             ║
║  Announced: Tuesday, November 12 at 12:00 PM ET               ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  🎉 CONGRATULATIONS TO THIS WEEK'S WINNERS! 🎉                ║
║                                                                ║
║  40 Awards • 127 Winners • 24,580 XP Distributed             ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║  🌟 FEATURED AWARDS (Top 5):                                  ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                                                ║
║  1. 📊 ORACLE OF THE WEEK                                     ║
║     Winner: BuffaloKing_99                                    ║
║     Record: 15/16 correct predictions (93.8%)                 ║
║     Reward: +500 XP, Oracle badge                             ║
║     [ View Full Stats ] [ Congratulate Winner ]               ║
║     ────────────────────────────────────────                  ║
║                                                                ║
║  2. 🎮 GAMER OF THE WEEK                                      ║
║     Winner: ReactKing_42                                      ║
║     Points: 48,920 pts (347 games played)                     ║
║     Reward: +500 XP, Gamer badge                              ║
║     [ View Full Stats ] [ Congratulate Winner ]               ║
║     ────────────────────────────────────────                  ║
║                                                                ║
║  3. 🔥 VIRAL POST OF THE WEEK                                 ║
║     Winner: HotTakeHenry                                      ║
║     Post: "Bills are winning the Super Bowl. @ me in Feb."    ║
║     Upvotes: 4,247 👍                                         ║
║     Reward: +500 XP, Viral Star badge                         ║
║     [ View Post ] [ Congratulate Winner ]                     ║
║     ────────────────────────────────────────                  ║
║                                                                ║
║  4. 🌙 NIGHT OWL AWARD (Funny)                                ║
║     Winner: InsomniacFan247                                   ║
║     Active: 38 sessions between 2am-5am                       ║
║     Reward: +200 XP, Night Owl badge                          ║
║     Comment: "Please get some sleep 😂"                       ║
║     [ View Full Stats ] [ Send Coffee ]                       ║
║     ────────────────────────────────────────                  ║
║                                                                ║
║  5. 💀 WORST PREDICTIONS (Funny)                              ║
║     Winner: AlwaysWrongAl                                     ║
║     Record: 2/16 correct (12.5%)                              ║
║     Reward: +100 XP, Wooden Spoon badge                       ║
║     Comment: "Try picking opposite next week 😂"              ║
║     [ View Full Stats ] [ Send Sympathy ]                     ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║  BROWSE ALL AWARDS:                                            ║
║  [ 📊 Predictions ] [ 🎮 Mini Games ] [ 🃏 Collections ]     ║
║  [ 💬 Social ] [ 🏈 Fantasy ] [ 😂 Funny Awards ]            ║
║                                                                ║
║  [ View Full Ceremony ] [ Past Weeks ] [ Award History ]      ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

### Individual Award Page

```
╔════════════════════════════════════════════════════════════════╗
║  🏆 ORACLE OF THE WEEK - Week 11, 2025                        ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  🥇 WINNER: BuffaloKing_99                                    ║
║                                                                ║
║  [Profile Photo]        BuffaloKing_99                        ║
║  ⭐⭐⭐⭐⭐              Level 47 • Legend Tier                ║
║                                                                ║
║  📊 WINNING STATS:                                             ║
║  • Record: 15/16 correct predictions (93.8%)                  ║
║  • Only miss: Cowboys vs. Eagles (picked Cowboys)             ║
║  • Best pick: Browns over Ravens (+240 underdog!)            ║
║  • Streak: 8 correct in a row                                 ║
║                                                                ║
║  💬 WINNER'S QUOTE:                                            ║
║  "I studied injury reports all week and it paid off! Josh     ║
║   Allen's health was the key to Bills-Chiefs outcome."        ║
║                                                                ║
║  🎁 REWARDS EARNED:                                            ║
║  • +500 XP (Now Level 47, 95% to Level 48)                   ║
║  • 🏆 Oracle of the Week badge (Limited Edition)             ║
║  • Featured on homepage for 7 days                            ║
║  • Profile highlight (gold border this week)                  ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║  🥈 RUNNERS-UP:                                                ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                                                ║
║  🥈 2nd Place: ChiefsKingdom88                                ║
║     Record: 14/16 (87.5%)                                     ║
║     Reward: +250 XP, Silver Oracle badge                      ║
║     [ View Profile ]                                          ║
║                                                                ║
║  🥉 3rd Place: NFL_Prophet                                    ║
║     Record: 14/16 (87.5%)                                     ║
║     Reward: +150 XP, Bronze Oracle badge                      ║
║     [ View Profile ]                                          ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║  💬 COMMUNITY REACTIONS (247 comments):                        ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                                                ║
║  🔥 ChiefsKingdom88 (2nd place):                              ║
║     "SO CLOSE! Congrats man, that Browns pick was genius."    ║
║     👍 124 likes                                               ║
║                                                                ║
║  😤 AlwaysWrongAl (Worst Predictions winner):                 ║
║     "How??? I went 2/16. Teach me your ways."                 ║
║     👍 89 likes                                                ║
║                                                                ║
║  🎯 NFL_Historian:                                             ║
║     "93.8% is INSANE. Best weekly performance I've seen!"     ║
║     👍 67 likes                                                ║
║                                                                ║
║  [ View All 247 Comments ] [ Congratulate Winner ]            ║
║                                                                ║
╠════════════════════════════════════════════════════════════════╣
║  📊 HISTORICAL CONTEXT:                                        ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                                                ║
║  • This is the 3rd best Oracle performance in 2025            ║
║  • Best ever: 16/16 perfect week (Week 7, BillsMafia_716)   ║
║  • Average winning record: 13.2/16 (82.5%)                    ║
║  • BuffaloKing_99 has won Oracle Award 2 times (Week 4, 11)  ║
║                                                                ║
║  [ View Past Oracle Winners ] [ View All-Time Leaderboard ]   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

## USER NOTIFICATIONS

### Winner Notification

```
╔════════════════════════════════════════════════════════════════╗
║  🎉 CONGRATULATIONS! YOU WON AN AWARD!                        ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  🏆 ORACLE OF THE WEEK - Week 11, 2025                        ║
║                                                                ║
║  You achieved the best prediction record this week!           ║
║                                                                ║
║  📊 Your Performance:                                          ║
║  • Record: 15/16 correct (93.8%)                              ║
║  • Global Rank: #1 out of 24,847 predictors                  ║
║                                                                ║
║  🎁 Rewards:                                                   ║
║  • +500 XP (You're now 95% to Level 48!)                     ║
║  • 🏆 Oracle of the Week badge (Limited Edition)             ║
║  • Featured on homepage for 7 days                            ║
║  • Gold profile border this week                              ║
║                                                                ║
║  [ View Full Award Page ] [ Share Achievement ]               ║
║                                                                ║
║  💬 Say Something:                                             ║
║  Leave a quote for the community to see!                      ║
║  [________________________________________]                   ║
║  [ Submit Quote ]                                             ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

### Runner-Up Notification

```
╔════════════════════════════════════════════════════════════════╗
║  🥈 YOU WERE SO CLOSE! RUNNER-UP!                             ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  🥈 ORACLE OF THE WEEK - 2nd Place                            ║
║                                                                ║
║  You finished 2nd this week!                                  ║
║                                                                ║
║  📊 Your Performance:                                          ║
║  • Record: 14/16 correct (87.5%)                              ║
║  • Gap to 1st: Just 1 more correct pick!                     ║
║                                                                ║
║  🎁 Rewards:                                                   ║
║  • +250 XP                                                    ║
║  • 🥈 Silver Oracle badge                                     ║
║                                                                ║
║  You were THIS close! Keep it up next week! 💪                ║
║                                                                ║
║  [ View Full Award Page ] [ View Winner ]                     ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

### Funny Award Notification

```
╔════════════════════════════════════════════════════════════════╗
║  🌙 YOU WON... THE NIGHT OWL AWARD? 😂                        ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Congrats (?)... you were the most active between 2am-5am!    ║
║                                                                ║
║  📊 Your Stats:                                                ║
║  • 38 sessions between 2am-5am                                ║
║  • Peak activity: 4:17am (playing Stopwatch Challenge)        ║
║  • Sleep deprivation level: EXTREME                           ║
║                                                                ║
║  🎁 Rewards:                                                   ║
║  • +200 XP                                                    ║
║  • 🦉 Night Owl badge                                         ║
║  • "I Have a Problem" title                                   ║
║                                                                ║
║  💬 Community Says:                                            ║
║  "Please get some sleep, king. We're worried about you."      ║
║                                                                ║
║  We love the dedication but PLEASE take care of yourself! ❤️  ║
║                                                                ║
║  [ View Full Award ] [ Share (For Some Reason) ]              ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝
```

---

## DATA STRUCTURES

### Award Schema
```json
{
  "award_id": "oracle_week11_2025",
  "award_type": "normal",
  "award_category": "prediction_excellence",
  "award_name": "Oracle of the Week",
  "award_emoji": "📊",
  "week": 11,
  "year": 2025,
  "season": "2025_regular",

  "announcement_date": "2025-11-12T12:00:00Z",
  "week_start": "2025-11-07",
  "week_end": "2025-11-13",

  "criteria": {
    "metric": "prediction_accuracy",
    "calculation": "correct_predictions / total_predictions",
    "minimum_threshold": 10,
    "description": "Most correct predictions this week (minimum 10 predictions)"
  },

  "winner": {
    "user_id": "user_bufking99_001",
    "username": "BuffaloKing_99",
    "profile_photo_url": "https://cdn.nfl.com/users/bufking99.jpg",
    "stats": {
      "correct_predictions": 15,
      "total_predictions": 16,
      "accuracy_percentage": 93.8,
      "global_rank": 1,
      "total_participants": 24847
    },
    "quote": "I studied injury reports all week and it paid off!",
    "rewards": {
      "xp": 500,
      "badge_id": "oracle_week11_2025",
      "badge_name": "Oracle of the Week",
      "badge_icon_url": "https://cdn.nfl.com/badges/oracle_week11.png",
      "badge_rarity": "limited_edition",
      "featured_homepage": true,
      "featured_duration_days": 7,
      "profile_border": "gold"
    }
  },

  "runners_up": [
    {
      "place": 2,
      "user_id": "user_chiefs88_002",
      "username": "ChiefsKingdom88",
      "stats": {
        "correct_predictions": 14,
        "total_predictions": 16,
        "accuracy_percentage": 87.5
      },
      "rewards": {
        "xp": 250,
        "badge_id": "oracle_silver_week11_2025",
        "badge_name": "Silver Oracle",
        "badge_icon_url": "https://cdn.nfl.com/badges/oracle_silver.png"
      }
    },
    {
      "place": 3,
      "user_id": "user_prophet_003",
      "username": "NFL_Prophet",
      "stats": {
        "correct_predictions": 14,
        "total_predictions": 16,
        "accuracy_percentage": 87.5
      },
      "rewards": {
        "xp": 150,
        "badge_id": "oracle_bronze_week11_2025",
        "badge_name": "Bronze Oracle",
        "badge_icon_url": "https://cdn.nfl.com/badges/oracle_bronze.png"
      }
    }
  ],

  "community_stats": {
    "total_comments": 247,
    "total_upvotes": 1842,
    "total_shares": 89,
    "sentiment": "positive"
  },

  "historical_context": {
    "rank_all_time": 3,
    "best_ever": {
      "user": "BillsMafia_716",
      "week": 7,
      "accuracy": 100.0
    },
    "average_winning_accuracy": 82.5,
    "times_won_by_user": 2
  }
}
```

### Funny Award Schema
```json
{
  "award_id": "night_owl_week11_2025",
  "award_type": "funny",
  "award_category": "dedication_obsession",
  "award_name": "Night Owl Award",
  "award_emoji": "🌙",
  "week": 11,
  "year": 2025,

  "announcement_date": "2025-11-12T12:00:00Z",

  "criteria": {
    "metric": "late_night_activity",
    "calculation": "sessions_between_2am_5am",
    "description": "Most activity between 2am - 5am local time"
  },

  "winner": {
    "user_id": "user_insomniac_004",
    "username": "InsomniacFan247",
    "stats": {
      "late_night_sessions": 38,
      "peak_activity_time": "4:17am",
      "most_played_game": "Stopwatch Challenge",
      "sleep_deprivation_level": "EXTREME"
    },
    "quote": "I live in Europe... I swear...",
    "actual_location": "Buffalo, NY",
    "community_comment": "Please get some sleep, king. We're worried about you.",
    "rewards": {
      "xp": 200,
      "badge_id": "night_owl_week11_2025",
      "badge_name": "Night Owl",
      "badge_icon_url": "https://cdn.nfl.com/badges/night_owl.png",
      "badge_rarity": "limited_edition",
      "title": "I Have a Problem"
    }
  },

  "humor_level": "high",
  "roast_severity": "light",
  "concern_level": "moderate"
}
```

---

## IMPLEMENTATION

### Phase 1: Core System (Week 1-2)
**Features**:
- Award calculation engine (automated criteria checking)
- 10 normal awards implemented
- Winner selection & notification system
- Basic award ceremony page
- Profile badge integration

**Success Metrics**:
- Awards announced on-time every Tuesday
- 90%+ winners notified within 1 hour
- Award page views: 5,000+ per week

---

### Phase 2: Funny Awards (Week 3)
**Features**:
- 10 funny/quirky awards implemented
- Humor calibration (not too mean, not too soft)
- Community reaction system
- Shareable award cards

**Success Metrics**:
- Funny award shares: 30%+ higher than normal awards
- Positive sentiment: 85%+ on funny awards
- "Night Owl Award" drives 20% more late-night engagement

---

### Phase 3: Social & Viral (Week 4)
**Features**:
- Enhanced sharing (Twitter, Facebook, Instagram)
- Award nomination system (community nominations)
- Award history & records page
- Leaderboards (most awards won)

**Success Metrics**:
- Award shares drive 500+ new signups per week
- 40% of winners share their award
- Award history page: 2,000+ views per week

---

## EXPECTED IMPACT

### Engagement
- **Weekly Return Rate**: +45% on Tuesdays (award day)
- **Competitive Behavior**: Users increase activity to win awards (+30% engagement)
- **FOMO**: "I was so close!" drives continued participation
- **Social Sharing**: 40%+ of winners share awards → viral growth

### Community Culture
- **Inside Jokes**: Funny awards create shared humor
- **Friendly Competition**: "I'm winning Oracle next week!"
- **Recognition**: Users feel valued and seen
- **Personality**: Platform develops unique voice and culture

### Retention
- **Weekly Ritual**: Tuesday becomes "Award Day" - users check in
- **Long-term Goals**: "I need to win GOAT of the Week someday"
- **Streak Protection**: Users maintain activity to stay competitive
- **Badge Collecting**: Limited edition badges drive collection behavior

---

## SUCCESS CRITERIA

✅ Awards announced every Tuesday at 12pm ET (100% on-time)
✅ Winner notifications sent within 1 hour of announcement
✅ Award page receives 5,000+ views per week
✅ 40%+ of winners share their award on social media
✅ Funny awards have 85%+ positive sentiment (not too mean)
✅ Weekly engagement increases 30%+ as users compete
✅ Award feature drives 500+ new signups per week via shares
✅ Users return every Tuesday to check awards (45% return rate)
✅ Community creates memes/jokes about awards (cultural impact)
✅ Award badges displayed on profile drive trophy collecting behavior

---

**END OF WEEKLY AWARDS SYSTEM SPECIFICATION**
