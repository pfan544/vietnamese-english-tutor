#!/usr/bin/env bash
# PostToolUse hook: auto-format files Claude writes/edits.
# Triggered after Write, Edit, MultiEdit tool calls.
# Failures here never block Claude — formatting is best-effort.

set -u

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')

# No file path → nothing to do.
[ -z "$FILE" ] && exit 0
# File doesn't exist (e.g., MultiEdit on a deleted target) → skip.
[ ! -f "$FILE" ] && exit 0

cd "$CLAUDE_PROJECT_DIR" || exit 0

# Prettier handles JS/TS/JSON/MD/CSS/HTML.
case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs|*.json|*.md|*.mdx|*.css|*.scss|*.html|*.yaml|*.yml)
    npx --no-install prettier --write --log-level silent "$FILE" 2>/dev/null || true
    ;;
esac

# ESLint --fix only on JS/TS source files.
case "$FILE" in
  *.ts|*.tsx|*.js|*.jsx|*.mjs|*.cjs)
    npx --no-install eslint --fix --quiet "$FILE" 2>/dev/null || true
    ;;
esac

exit 0
