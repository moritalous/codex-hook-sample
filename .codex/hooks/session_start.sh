#!/usr/bin/env bash
set -eu

json="$(cat)"
session_id="$(jq -r '.session_id' <<<"$json")"
cwd="$(jq -r '.cwd' <<<"$json")"
source="$(jq -r '.source' <<<"$json")"
label="codex-chat-log"

repo_root="$(git -C "$cwd" rev-parse --show-toplevel)"
mkdir -p "$repo_root/.codex/state"

if [ -f "$repo_root/.codex/state/$session_id.json" ]; then
  exit 0
fi

cd "$repo_root"
gh label create "$label" \
  --color 1D76DB \
  --description "Codex hook generated chat log issue" \
  --force >/dev/null

issue_url="$(
  gh issue create \
    --title "Codex session $session_id" \
    --label "$label" \
    --body "session_id: $session_id
source: $source
"
)"

gh issue view "$issue_url" --json number,url,title > ".codex/state/$session_id.json"
