# Git Auto-Sync & Commit Cadence Rule

## Rule: Continuous Git Synchronization (Every ~10 Minutes)
- **Periodic Sync**: Automatically commit and push verified changes to GitHub (`origin/main`) periodically (roughly every 10 minutes of active development or upon completing major milestones).
- **Pre-Push Validation**: Always run `npm run build` and ensure `mobile/assets/web/` is synchronized with `dist/` before committing.
- **Descriptive Commits**: Use conventional commit messages describing the exact changes (e.g. `feat:`, `fix:`, `perf:`, `chore:`).
- **Working Tree Cleanliness**: Keep the working directory clean with `.gitignore` properly excluding build caches and temporary scratch files.
