#!/usr/bin/env bash
# PreToolUse hook: block Claude from writing to secrets/credentials files.
# .env.example is allowed (template); anything else .env-shaped is blocked.

set -u

INPUT=$(cat)
FILE=$(echo "$INPUT" | jq -r '.tool_input.file_path // empty')
[ -z "$FILE" ] && exit 0

# Get just the basename for clearer matching.
BASENAME=$(basename "$FILE")

# .env.example is intentional template territory — allow.
if [ "$BASENAME" = ".env.example" ] || [ "$BASENAME" = ".env.sample" ]; then
  exit 0
fi

# Block writes to anything that looks like a secrets file.
if echo "$FILE" | grep -qE '(/\.env$|/\.env\.|\.env$|secrets/|credentials\.json|service-account.*\.json|id_rsa|id_ed25519|\.pem$|\.key$|\.pfx$|\.p12$)'; then
  echo "BLOCKED: Refusing to write to a secrets/credentials file:" >&2
  echo "  $FILE" >&2
  echo "If intentional, edit it manually outside Claude Code, or update .claude/scripts/check-secrets.sh." >&2
  exit 2
fi

exit 0
