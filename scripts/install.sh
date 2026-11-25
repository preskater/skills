#!/usr/bin/env bash
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SKILLS_DIR="$REPO_ROOT/skills"
AGENTS_HOME="$HOME/.agents/skills"
CLAUDE_HOME="$HOME/.claude/skills"

BUNDLE="all"
DRY_RUN=0
UNINSTALL=0
FORCE=0

usage() {
  cat <<'EOF'
Install Preskater skills into the user-level skill directories.

Usage: scripts/install.sh [options]

Options:
  --bundle <name>   engineer | reviewer | on-call | architect | all (default: all)
  --dry-run         Print actions without changing anything
  --uninstall       Remove links created by this script
  --force           Replace existing files or links at the target path
  -h, --help        Show this help

Links are created in:
  ~/.agents/skills   read by Codex and OpenCode
  ~/.claude/skills   read by Claude Code
EOF
}

while [[ $# -gt 0 ]]; do
  case "$1" in
    --bundle)
      BUNDLE="${2:?--bundle needs a value}"
      shift 2
      ;;
    --bundle=*)
      BUNDLE="${1#*=}"
      shift
      ;;
    --dry-run)
      DRY_RUN=1
      shift
      ;;
    --uninstall)
      UNINSTALL=1
      shift
      ;;
    --force)
      FORCE=1
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "unknown option: $1" >&2
      usage >&2
      exit 1
      ;;
  esac
done

case "$BUNDLE" in
  all)
    SKILLS=(preskater-plan preskater-implement preskater-verify preskater-review preskater-triage preskater-pr)
    ;;
  engineer)
    SKILLS=(preskater-plan preskater-implement preskater-verify preskater-review preskater-pr)
    ;;
  reviewer)
    SKILLS=(preskater-review preskater-verify)
    ;;
  on-call)
    SKILLS=(preskater-triage preskater-implement preskater-verify preskater-pr)
    ;;
  architect)
    SKILLS=(preskater-plan preskater-review)
    ;;
  *)
    echo "unknown bundle: $BUNDLE" >&2
    exit 1
    ;;
esac

run() {
  if [[ $DRY_RUN -eq 1 ]]; then
    echo "would: $*"
  else
    "$@"
  fi
}

link_one() {
  local name="$1"
  local dest="$2"
  local src="$SKILLS_DIR/$name"
  local target="$dest/$name"

  if [[ ! -d "$src" ]]; then
    echo "missing skill directory: $src" >&2
    exit 1
  fi

  if [[ ! -d "$dest" ]]; then
    run mkdir -p "$dest"
  fi

  if [[ -L "$target" ]]; then
    local current
    current="$(readlink "$target")"
    if [[ "$current" == "$src" ]]; then
      echo "ok    $target"
      return
    fi
    if [[ $FORCE -eq 1 ]]; then
      run rm "$target"
    else
      echo "skip  $target (points to $current; use --force)" >&2
      return
    fi
  elif [[ -e "$target" ]]; then
    if [[ $FORCE -eq 1 ]]; then
      run rm -rf "$target"
    else
      echo "skip  $target (exists; use --force)" >&2
      return
    fi
  fi

  run ln -s "$src" "$target"
  echo "link  $target -> $src"
}

unlink_one() {
  local name="$1"
  local dest="$2"
  local target="$dest/$name"
  local src="$SKILLS_DIR/$name"

  if [[ ! -L "$target" ]]; then
    return
  fi

  local current
  current="$(readlink "$target")"
  if [[ "$current" == "$src" ]]; then
    run rm "$target"
    echo "unlink $target"
  else
    echo "skip  $target (not managed by this repo)" >&2
  fi
}

for name in "${SKILLS[@]}"; do
  if [[ $UNINSTALL -eq 1 ]]; then
    unlink_one "$name" "$AGENTS_HOME"
    unlink_one "$name" "$CLAUDE_HOME"
  else
    link_one "$name" "$AGENTS_HOME"
    link_one "$name" "$CLAUDE_HOME"
  fi
done

if [[ $UNINSTALL -eq 0 ]]; then
  cat <<'EOF'

Installed. Verify discovery:

  ls -l ~/.agents/skills ~/.claude/skills

Try it:
  Claude Code  /preskater-plan
  Codex        $preskater-plan
  OpenCode     @preskater-plan
EOF
fi
