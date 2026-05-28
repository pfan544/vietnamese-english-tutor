#!/usr/bin/env bash
# PreToolUse hook: block clearly dangerous bash commands.
# Exit code 2 blocks the tool call; stderr is fed back to Claude as feedback.
# This is a deny-list, not a sandbox — it catches obvious mistakes, not adversarial input.

set -u

INPUT=$(cat)
CMD=$(echo "$INPUT" | jq -r '.tool_input.command // empty')
[ -z "$CMD" ] && exit 0

# Patterns. Each labeled for clearer rejection messages.
# Format: LABEL|REGEX (pipe-delimited; regex uses extended grep syntax).
PATTERNS=(
  "rm -rf on / or ~|(^|[^A-Za-z0-9_])rm[[:space:]]+-[rRfF]+[[:space:]]+(/|~|\\\$HOME)([[:space:]]|/\\*|$)"
  "DROP TABLE/DATABASE/SCHEMA|(^|[^A-Za-z0-9_])DROP[[:space:]]+(TABLE|DATABASE|SCHEMA)"
  "TRUNCATE TABLE|(^|[^A-Za-z0-9_])TRUNCATE[[:space:]]+TABLE"
  "git push --force (use --force-with-lease)|git[[:space:]]+push.*--force([[:space:]]|$)"
  "--no-verify (skips git and security hooks)|--no-verify([[:space:]]|$)"
  "chmod 777|chmod[[:space:]]+(-R[[:space:]]+)?777"
  "overwriting .env file|>[[:space:]]*\\.?env(\\.|[[:space:]]|$)"
  "curl | sh (remote code execution)|curl[^|]*\\|[[:space:]]*(ba)?sh"
  "sudo (privilege escalation)|(^|[^A-Za-z0-9_])sudo([[:space:]]|$)"
)

for entry in "${PATTERNS[@]}"; do
  LABEL="${entry%%|*}"
  REGEX="${entry#*|}"
  if echo "$CMD" | grep -qE "$REGEX"; then
    echo "BLOCKED: ${LABEL}" >&2
    echo "Command: ${CMD}" >&2
    echo "If this is genuinely intentional, run it manually outside Claude Code." >&2
    exit 2
  fi
done

exit 0
