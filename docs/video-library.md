# Video library

`src/data/videos.json` is the durable video archive, imported by `/videos`.
Rendering the page never requests the YouTube feed or channel. Six cards are
shown initially; the rest remain inert in a template until the visitor chooses
to see more. Thumbnails use native lazy loading, and no YouTube player is
created until a play button is clicked.

The `Update video library` GitHub workflow runs twice daily (05:23 and 17:23 UTC)
and can also be run manually. It reads the public Shorts tab, follows any
continuation pages, verifies the channel ID, and commits only when the saved
video list changes. The existing Vercel Git integration deploys that commit.
No API key, media downloads, runtime dependency, or visitor-side polling is
required. GitHub Actions records failures and uses the repository owner's
configured workflow notification settings.

On a fetch or parsing failure the job exits unsuccessfully without replacing
the archive. Partial successful lists are merged with the saved archive;
videos are never automatically removed merely because YouTube omitted them.
To deliberately remove a private/deleted video, remove its entry from the JSON.
Titles come from the channel; publication dates are retained when known and
otherwise omitted rather than guessed. New long-form uploads require adding
the Videos tab to the background collector; the current channel exposes Shorts.

Run `node scripts/sync-videos.mjs` to refresh and `node --test tests/videos.test.mjs`
to test channel validation, extraction, archive preservation, and upstream errors.
