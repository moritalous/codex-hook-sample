#!/usr/bin/env bash
set -eu

json="$(cat)"
session_id="$(jq -r '.session_id' <<<"$json")"
cwd="$(jq -r '.cwd' <<<"$json")"
model="$(jq -r '.model' <<<"$json")"
message="$(jq -r '.last_assistant_message' <<<"$json")"

repo_root="$(git -C "$cwd" rev-parse --show-toplevel)"
issue_url="$(jq -r '.url' "$repo_root/.codex/state/$session_id.json")"
body="$(printf '%s' "$message" | cut -c1-8000)"

if [ -z "$body" ]; then
  body="(空返答でした)"
fi

cd "$repo_root"
gh issue comment "$issue_url" --body "🤖 Codex ($model)

$body" >/dev/null
printf '{}\n'
