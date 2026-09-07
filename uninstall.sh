#!/usr/bin/env bash
rm -f "$HOME/Library/Application Support/Übersicht/widgets/linear.jsx"
echo "Widget removed."
[ "${1:-}" = "--all" ] && { rm -f "$HOME/.linear-widget-token"; echo "Linear key removed."; } \
  || echo "Kept ~/.linear-widget-token — pass --all to remove it."
