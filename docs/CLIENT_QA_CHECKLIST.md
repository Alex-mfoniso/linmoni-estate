# Client QA checklist

- Confirm Client tabs read Home, Properties, Messages, Profile.
- Confirm no visible More tab and no changes to other role tab bars.
- Test expired token, inactive profile, wrong role, offline, timeout, and retry.
- Search/filter/sort; verify a superseded search does not overwrite current results.
- Paginate and pull to refresh; check loading, no-results, and API-error states.
- Save/unsave; force a failed write and confirm heart rollback.
- Open active/reserved/sold/rented properties; confirm only active can book.
- Submit future inspection; test past date, duplicate request, and cancellation cutoff.
- Start property conversation, send text, reopen, and verify membership protection.
- Read/delete notifications and mark all read.
- Edit profile; attempt role/status/Firebase UID injection and confirm rejection.
- Check VoiceOver/TalkBack labels, dynamic text, touch targets, image fallback/cache, and keyboard avoidance.
- Validate on Android device/emulator with real Firebase/MongoDB configuration.
