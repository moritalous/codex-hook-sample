#!/usr/bin/env bash
set -euo pipefail

json="$(cat)"
session_id="$(jq -r '.session_id' <<<"$json")"
cwd="$(jq -r '.cwd' <<<"$json")"
model="$(jq -r '.model' <<<"$json")"
transcript_path="$(jq -r '.transcript_path // empty' <<<"$json")"
fallback_message="$(jq -r '.last_assistant_message // empty' <<<"$json")"

repo_root="$(git -C "$cwd" rev-parse --show-toplevel)"
issue_url="$(jq -r '.url' "$repo_root/.codex/state/$session_id.json")"

extract_from_transcript() {
  local path="$1"

  jq -rs '
    map(select(.type == "response_item"))
    | map(.payload)
    | map(select(.type == "message" and .role == "assistant"))
    | map({
        phase: (.phase // ""),
        text: ([.content[]? | select(.type == "output_text") | .text] | join(""))
      })
    | map(select(.text != ""))
    | (
        map(select(.text | contains("<proposed_plan>"))) | last
      ) // (
        map(select(.phase == "final_answer")) | last
      ) // (
        last
      ) // {}
    | .text // empty
  ' "$path"
}

body=""
if [ -n "$transcript_path" ] && [ -f "$transcript_path" ]; then
  body="$(extract_from_transcript "$transcript_path")"
fi

if [ -z "$body" ]; then
  body="$fallback_message"
fi

body="$(printf '%s' "$body" | cut -c1-8000)"

if [ -z "$body" ]; then
  body="(空返答でした)"
fi

cd "$repo_root"
gh issue comment "$issue_url" --body "🤖 Codex ($model)

$body" >/dev/null
printf '{}\n'
