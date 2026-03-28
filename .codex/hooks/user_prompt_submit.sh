#!/usr/bin/env bash
set -eu

json="$(cat)"
session_id="$(jq -r '.session_id' <<<"$json")"
cwd="$(jq -r '.cwd' <<<"$json")"
prompt="$(jq -r '.prompt' <<<"$json")"

repo_root="$(git -C "$cwd" rev-parse --show-toplevel)"
issue_url="$(jq -r '.url' "$repo_root/.codex/state/$session_id.json")"
body="$(printf '%s' "$prompt" | cut -c1-8000)"

cd "$repo_root"
gh issue comment "$issue_url" --body "🧑 User

$body"
