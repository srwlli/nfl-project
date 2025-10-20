Here is a detailed execution plan to build and deploy the Player News Scraper to fetch and integrate player news for your site, aligned with your detailed requirements and best practices.

***

### Player News Scraper Execution Plan

#### Phase 1: Preparation & Setup (0.5 hours)

- Review the current player profiles database schema and confirm foreign keys.
- Create the `news_category_enum` type and `player_news` table with all columns and indexes.
- Validate database migration scripts and push migrations to Supabase.
- Set up environment variables for API URLs and keys (if needed).

***

#### Phase 2: Development of Scraper (2-3 hours)

- **API Integration**
  - Implement `fetchNewsFromESPN(playerId, limit=50)` to call ESPN player news endpoint.
  - Build fallback function `fetchFromRotoWire(playerId)` to pull news if ESPN data is incomplete.
  
- **Data Transformation**
  - Develop `transformNewsData(rawData)` to map ESPN API fields into internal schema fields.
  - Include fields: `headline`, `description`, `published_at`, `news_category`, `external_id`, `is_breaking`, `priority`, and `source`.

- **Categorization**
  - Implement keyword-based categorization for injury, trade, performance, contract, personal, other.
  - Log uncategorized items for future model training.

- **Deduplication**
  - Check for existing news by `external_id`; skip duplicates.
  - Add fuzzy matching fallback (e.g., Levenshtein) on headlines published within 1 hour.

- **Error Handling & Rate Limiting**
  - Add retry and backoff on API failures.
  - Enforce 1 request/second limit via delay or token bucket.
  - Log failures and continue processing other players.

- **Batch Processing**
  - Implement batch fetching for groups of 100 players to optimize runtime.

***

#### Phase 3: Testing & Validation (1 hour)

- Write unit tests for:
  - API response parsing
  - Categorization logic accuracy (>80%)
  - Deduplication correctness
  - Breaking news detection (published <1 hour)

- Perform manual integration tests with:
  - Real ESPN API docs and sample player IDs
  - Verification of news insertion and indexes in Supabase

***

#### Phase 4: Scheduler & Automation (0.5 hours)

- Add scraper to scheduler with cron syntax `0 6-23 * * *` (hourly between 6 AM and 11 PM ET).
- Set up separate dev mode schedule (every 15 minutes) for faster testing.
- Enable logs for monitoring scraper execution times, errors, and counts.

***

#### Phase 5: Player Profile Integration & Display (1-2 hours)

- Add news section on player profiles page, showing latest 10 news.
- Add filters by category and breaking news badges.
- Implement load more and search by player name.
- Ensure mobile-responsive and SEO-friendly URLs.

***

#### Phase 6: Dedicated News Feed Page (1-2 hours)

- Build paginated/infinite scroll news feed page.
- Add filters: team, player, category, and date range.
- Highlight breaking news prominently with auto-refreshing top section.
- Style components to match Next Down Metrics theme.

***

#### Phase 7: Monitoring & Maintenance (Ongoing)

- Monitor scheduler logs for errors and rate-limit alerts.
- Manage database size by archiving/removing news older than 30 days.
- Collect categorization errors for ML model training.
- Plan future enhancements like multiple sources, sentiment analysis, and user notifications.

### Success Criteria

- Reliable hourly news updates with no API rate-limit violations.
- News is categorized with >80% accuracy.
- No duplicate news stored.
- News displayed correctly on player profiles and news feed page.
- Responsive UI matching platform theme.
- System performance: scraping completes within 30 seconds.

***

This plan covers end-to-end delivery from database schema setup through scraper deployment, player UI integration, and maintenance, ensuring a robust and scalable player news feature.