#!/usr/bin/env bash
# Stop hook: run tests before allowing Claude to end the session.
# stop_hook_active prevents infinite loops: if Claude triggers Stop after a
# test-fix attempt, this hook acknowledges it instead of looping forever.

set -u

INPUT=$(cat)
ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')

# Already in a hook-driven retry loop → allow stop, let user see the result.
[ "$ACTIVE" = "true" ] && exit 0

cd "$CLAUDE_PROJECT_DIR" || exit 0

# No package.json yet (very early project state) → nothing to test.
[ ! -f package.json ] && exit 0

# No test script defined → nothing to test.
if ! grep -q '"test"' package.json; then
  exit 0
fi

# Run the test suite. --silent suppresses npm's own noise; test runner output
# still surfaces on failure via stderr.
if npm test --silent; then
  exit 0
else
  echo "TESTS FAILED — fix before completing the task." >&2
  echo "Run: npm test  (for full output)" >&2
  exit 2
fi
