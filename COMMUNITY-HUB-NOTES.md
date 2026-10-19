# Unified community and hero top ten

Local implementation, 18 October 2026. No deployment or external configuration change was performed.

- `#community` combines the character ranking and shared builds in two in-page tabs. `#arab-board` is a backwards-compatible alias. The duplicate navigation entry was removed.
- Each character profile has a compact top-ten panel beside its content on desktop and below on narrow screens. Its community link opens the same selected character in the full ranking.
- “نسبة الفوز”: minimum 30 recorded matches on that hero, sorted by win rate, then matches, then account ID.
- “الأكثر لعبًا”: minimum one recorded match on that hero, sorted by match count, then win rate, then account ID.
- Only opted-in registered members are included. Ordering and the requested result limit are applied on the server, not by reordering an already-truncated win-rate list in the browser.
- Every displayed row includes its statistics update date. Counts represent the source's available records, not a claim of complete match history or official skill ranking.

The local preview does not currently have the community backend configured. It displays truthful setup/empty states and ships no fabricated members. Real names appear when the existing backend is configured and actual members join with Steam and opt in.

Validation: all 35 automated tests passed, including membership filtering, distinct sorting rules, thresholds and request validation. Browser checks covered the merged page, the old route alias, top-ten rendering using test-only network fixtures, both sort options, character-filter links, complete story visibility, and desktop/mobile overflow. Fixtures are not part of the site data.
