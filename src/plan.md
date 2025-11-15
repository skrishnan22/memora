# Review Functionality Plan

1. **Surface metrics from IndexedDB**
   - Implement typed helpers in `src/index-db.ts` to fetch counts (total words, reviewed today, mastered, streak).
   - Add a small data hook/provider for the review UI that fetches these metrics on mount and exposes loading/error states.
   - Bind `StatCard` props to live data instead of hardcoded numbers; show placeholders while loading.

2. **Drive vocab card from real data**
   - Create a review session provider that loads the day’s queue (due words per SM-2 scheduling) from IndexedDB.
   - Store current index + word metadata and expose state/actions for revealing meanings.
   - Feed `VocabCard` with the active word instead of static props.

3. **Capture feedback for SM-2 updates**
   - Map action buttons (or multiple difficulty buttons) to SM-2 scores and update intervals/easiness factor per response.
   - Persist results in IndexedDB after each answer.

4. **Enable navigation between words**
   - After logging feedback, advance to the next due word and update the progress bar.
   - Optionally allow manual navigation (keyboard/arrows) but ensure scoring only happens once per card.
   - Handle session completion summary.

5. **Handle empty state**
   - When no words are due, replace the card with an “All caught up” message/illustration and disable action buttons.
   - Surface guidance (add new words, check streak, etc.).
