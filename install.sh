#!/usr/bin/env bash
set -euo pipefail
SRC="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
WIDGETS="$HOME/Library/Application Support/Übersicht/widgets"
say()  { printf '\n\033[1m%s\033[0m\n' "$*"; }
ok()   { printf '  \033[32m✓\033[0m %s\n' "$*"; }
warn() { printf '  \033[33m!\033[0m %s\n' "$*"; }
[ "$(uname)" = "Darwin" ] || { echo "macOS only."; exit 1; }

say "Übersicht"
if [ -d "/Applications/Übersicht.app" ]; then ok "already installed"
elif command -v brew >/dev/null 2>&1; then brew install --cask ubersicht && ok "installed"
else warn "install it from https://tracesof.net/uebersicht/ then run this again"; exit 1; fi
mkdir -p "$WIDGETS"

say "Widget"
cp "$SRC/widget/linear.jsx" "$WIDGETS/linear.jsx"; ok "linear.jsx"

say "Linear key"
if [ -s "$HOME/.linear-widget-token" ]; then ok "already saved"
else
  echo "  Linear → Settings → Security & access → Personal API keys"
  printf "  Paste your key (Return to skip): "
  read -r K; K="$(printf '%s' "$K" | tr -d '[:space:]')"
  if [ -n "$K" ]; then printf '%s' "$K" > "$HOME/.linear-widget-token"
    chmod 600 "$HOME/.linear-widget-token"; ok "saved to ~/.linear-widget-token"
  else warn "skipped — the widget will show setup steps until you add it"; fi
fi

say "Done"
echo "  Übersicht menu bar → Refresh All Widgets"
echo "  Remove it again with ./uninstall.sh"
