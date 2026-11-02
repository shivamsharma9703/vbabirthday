# Vaishali's story — launch guide (the short version)

## One-time setup (about 10 minutes)

1. **GitHub → make the repo Private** (repo → Settings → Danger Zone → Change visibility). It holds your photos and story.
2. **Upload the four folders** `src`, `public`, `drizzle`, `supabase` (drag the folders themselves) to the repo → Commit.
   The loose files (package.json, vite.config.ts, …) are already there.
3. **Vercel → your project → Settings → Environment Variables**. Add two:

   | Name | Value |
   |---|---|
   | `ACCESS_CODE` | the word(s) Vaishali types at the gate. Several are allowed, separated by commas, e.g. `babyyy, babu, vegu` |
   | `PREVIEW_PASSPHRASE` | your private admin password for `/preview` (long, not a date) |

4. **Deployments → latest → ⋯ → Redeploy.** Open the address Vercel shows.

That's all. No database is needed: her progress lives on her phone.
(Optional: a free Supabase project + `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` variables add cross-device saving.
Run `drizzle/migrations/0000_private_story_progress.sql` in its SQL editor first.)

## Launch day

- Unlock times (India time): chapters 01–04 and 07 at midnight on their date; 05 at 6 AM and 06 at 6 PM on 5 November.
- Send her the link on 1 November. Tell her: open in **Safari**, then Share → **Add to Home Screen**.
- She needs iOS 16.4 or newer. On an older iPhone the page tells her to update.

## Test the whole week (any time)

Open `/preview`, enter your passphrase, tap **Unlock all chapters** or set a date, and walk through. Preview never touches
her saved progress. Tap **Exit preview** when finished.

## Things you can change later

| What | Where |
|---|---|
| Voice message (mp3, 1–2 min) | `public/assets/audio/shivam-message.mp3` |
| Chapter ambience (optional) | `public/assets/audio/day01-room.mp3` … `day07-room.mp3` |
| Photos and captions | `src/lib/story/photos.ts`, `public/assets/photos` |
| Story text | `src/chapters/ChapterNN.tsx` |

## Run it on your own computer

```
npm install
ACCESS_CODE=word PREVIEW_PASSPHRASE=secret npm run dev
```
Add `STORY_NOW_OVERRIDE=2026-11-06T09:00:00+05:30` to pretend it's launch week (ignored in production).
