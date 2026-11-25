# Phase 3 - parent accounts: screens
- /welcome: start screen with "おうちの方：とうろく / ログイン" and "おためしで あそぶ" (trial mode, current behaviour).
- /register and /login (parent, polite Japanese, show password rules, errors in plain words).
- /who: "だれが あそぶ？" child picker with character-style avatar cards and "＋ こどもを ついか" (goes through the parent PIN).
- Header: current child name with a switch button; small "おうちの方" button -> PIN pad -> /parent.
- /parent: overview cards per child (progress, streak, mastery radar link, last study), settings (daily limit, PIN, password), add/edit/remove child,
  logout, delete account (double confirmation).
- Same cinematic look as the rest of the app, mobile first (360-430px wide). Accessible labels.
- Existing pages keep working for trial mode. Use Playwright to screenshot the new screens to docs/run3/screens/ and look at them; fix layout problems.
