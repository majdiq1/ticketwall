// Linear — all open issues across the workspace, on your desktop.
//
// Token lives in ~/.linear-widget-token (one line, your personal API key).
// Get one: Linear → Settings → Security & access → Personal API keys.

import { run, css } from "uebersicht";

/* ─── config ─────────────────────────────────────────────── */

const TOKEN_FILE = "$HOME/.linear-widget-token";
const LIMIT = 150; // most recently updated open issues to pull
const POSITION = "bottom: 40px; left: 36px;";
const WIDTH = 380;
const HEIGHT = 361;   // fixed so the column spaces evenly
const LIST_HEIGHT = 274; // shortened to make room for the two widgets above

export const refreshFrequency = 60000; // 1 minute

/* ─── data ───────────────────────────────────────────────── */

const QUERY = `query {
  issues(
    first: ${LIMIT}
    orderBy: updatedAt
    filter: { state: { type: { nin: ["completed", "canceled", "duplicate"] } } }
  ) {
    nodes {
      identifier
      title
      url
      priority
      state { name type color }
      assignee { displayName }
      team { key name }
    }
  }
}`;

const BODY = JSON.stringify({ query: QUERY });

export const command = [
  `mkdir -p "$HOME/.cache/ai-usage"; date +%s > "$HOME/.cache/ai-usage/linear-beat";`,
  `TOKEN_FILE="${TOKEN_FILE}";`,
  `if [ ! -f "$TOKEN_FILE" ]; then echo '{"widgetError":"no-token"}'; exit 0; fi;`,
  `TOKEN=$(tr -d '[:space:]' < "$TOKEN_FILE");`,
  `curl -sS -X POST https://api.linear.app/graphql`,
  `-H 'Content-Type: application/json'`,
  `-H "Authorization: $TOKEN"`,
  `-d '${BODY}'`
].join(" ");

/* ─── state types ────────────────────────────────────────── */

// Order of the summary bar: workflow progression, left to right.
const TYPES = [
  { key: "triage", label: "triage", fallback: "#EBA13C" },
  { key: "backlog", label: "backlog", fallback: "#7A8394" },
  { key: "unstarted", label: "todo", fallback: "#B4BCCC" },
  { key: "started", label: "in progress", fallback: "#F2C94C" }
];

// Order of the grouped list: most active first.
const GROUP_RANK = { started: 0, unstarted: 1, triage: 2, backlog: 3 };

const URGENT = "#F0563E";

/* ─── styles ─────────────────────────────────────────────── */

export const className = `
  ${POSITION}
  width: ${WIDTH}px;
  height: ${HEIGHT}px;
  font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", sans-serif;
  color: #E9EDF5;
  background: rgba(20, 25, 36, 0.82);
  -webkit-backdrop-filter: blur(24px) saturate(140%);
  border: 1px solid rgba(255, 255, 255, 0.10);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.45);
  -webkit-font-smoothing: antialiased;
`;

const head = css`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 14px 16px 0;
  cursor: pointer;
  &:hover .refreshhint {
    opacity: 1;
  }
`;

const refreshHint = css`
  opacity: 0;
  margin-left: 7px;
  font-size: 9.5px;
  font-weight: 400;
  color: #5A6478;
`;

const mark = css`
  font-size: 13px;
  font-weight: 600;
  letter-spacing: -0.1px;
`;

const counts = css`
  display: flex;
  gap: 12px;
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  color: #8B95AB;
`;

const urgentCount = css`
  color: ${URGENT};
`;

const bar = css`
  display: flex;
  gap: 2px;
  height: 6px;
  margin: 12px 16px 0;
`;

const seg = css`
  border-radius: 3px;
  min-width: 3px;
`;

const legend = css`
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  padding: 11px 16px 13px;
  font-size: 11px;
  color: #8B95AB;
`;

const legendItem = css`
  display: flex;
  align-items: center;
  gap: 5px;
`;

const swatch = css`
  width: 6px;
  height: 6px;
  border-radius: 2px;
  flex: none;
`;

const legendNum = css`
  color: #E9EDF5;
  font-variant-numeric: tabular-nums;
`;

const list = css`
  max-height: ${LIST_HEIGHT}px;
  overflow-y: auto;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.12);
    border-radius: 3px;
  }
`;

const groupHead = css`
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px 7px;
  background: rgba(20, 25, 36, 0.94);
  -webkit-backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
`;

const teamKey = css`
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 10px;
  letter-spacing: 0.3px;
  color: #E9EDF5;
  background: rgba(255, 255, 255, 0.08);
  padding: 2px 5px;
  border-radius: 4px;
`;

const groupLabel = css`
  font-size: 11.5px;
  color: #8B95AB;
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const groupCount = css`
  font-size: 11px;
  color: #5A6478;
  font-variant-numeric: tabular-nums;
`;

const rowBase = `
  align-items: center;
  gap: 9px;
  padding: 7px 16px;
  border-left: 2px solid transparent;
  cursor: default;
  &:hover {
    background: rgba(255, 255, 255, 0.05);
  }
`;

const row = css`
  display: grid;
  grid-template-columns: 7px 58px 1fr;
  ${rowBase}
`;

const rowWithWho = css`
  display: grid;
  grid-template-columns: 7px 58px 1fr 24px;
  ${rowBase}
`;

const rowUrgent = css`
  border-left-color: ${URGENT};
`;

const dot = css`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex: none;
`;

const ident = css`
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 10.5px;
  letter-spacing: 0.2px;
  color: #8B95AB;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const title = css`
  font-size: 12.5px;
  line-height: 1.3;
  color: #E9EDF5;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const who = css`
  font-size: 9.5px;
  letter-spacing: 0.3px;
  color: #5A6478;
  text-align: right;
`;

const note = css`
  padding: 9px 16px 11px;
  font-size: 10.5px;
  color: #5A6478;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
`;

const panel = css`
  padding: 16px;
  font-size: 12.5px;
  line-height: 1.5;
  color: #8B95AB;
`;

const panelTitle = css`
  font-size: 13px;
  font-weight: 600;
  color: #E9EDF5;
  margin-bottom: 6px;
`;

const code = css`
  display: block;
  margin: 9px 0;
  padding: 8px 10px;
  font-family: ui-monospace, "SF Mono", Menlo, monospace;
  font-size: 10.5px;
  line-height: 1.6;
  color: #C9D2E3;
  background: rgba(0, 0, 0, 0.32);
  border-radius: 7px;
  white-space: pre-wrap;
  word-break: break-all;
`;

/* ─── helpers ────────────────────────────────────────────── */

function initials(person) {
  if (!person || !person.displayName) return "—";
  var parts = person.displayName.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function typeColors(issues) {
  // Use the real state colours Linear returns, picking the most common per type.
  var tally = {};
  issues.forEach(function (i) {
    var st = i.state || {};
    if (!st.type || !st.color) return;
    if (!tally[st.type]) tally[st.type] = {};
    tally[st.type][st.color] = (tally[st.type][st.color] || 0) + 1;
  });
  var out = {};
  TYPES.forEach(function (t) {
    var seen = tally[t.key];
    out[t.key] = t.fallback;
    if (seen) {
      var best = 0;
      Object.keys(seen).forEach(function (c) {
        if (seen[c] > best) {
          best = seen[c];
          out[t.key] = c;
        }
      });
    }
  });
  return out;
}

function byPriority(a, b) {
  // Urgent (1) first, "no priority" (0) last.
  var pa = a.priority === 0 ? 9 : a.priority;
  var pb = b.priority === 0 ? 9 : b.priority;
  return pa - pb;
}

// Group by team when there's more than one, otherwise by state —
// so the header row always carries information rather than repeating itself.
function groupIssues(issues) {
  var keys = {};
  issues.forEach(function (i) {
    if (i.team && i.team.key) keys[i.team.key] = true;
  });
  var byTeam = Object.keys(keys).length > 1;

  var map = {};
  issues.forEach(function (i) {
    var g;
    if (byTeam) {
      var t = i.team || { key: "—", name: "No team" };
      g = { id: t.key, kind: "team", badge: t.key, label: t.name, rank: 0 };
    } else {
      var s = i.state || { name: "No state", type: "backlog", color: "#7A8394" };
      var rank = GROUP_RANK[s.type];
      g = {
        id: s.name,
        kind: "state",
        color: s.color,
        label: s.name,
        rank: rank === undefined ? 4 : rank
      };
    }
    if (!map[g.id]) {
      map[g.id] = {
        id: g.id,
        kind: g.kind,
        badge: g.badge,
        color: g.color,
        label: g.label,
        rank: g.rank,
        issues: []
      };
    }
    map[g.id].issues.push(i);
  });

  var groups = Object.keys(map).map(function (k) {
    map[k].issues.sort(byPriority);
    return map[k];
  });

  groups.sort(function (a, b) {
    if (a.kind === "team") return b.issues.length - a.issues.length;
    return a.rank - b.rank;
  });
  return groups;
}

function Shell(props) {
  return <div className={panel}>{props.children}</div>;
}

/* ─── render ─────────────────────────────────────────────── */

export const render = function (props) {
  var output = props.output;
  var error = props.error;

  if (error) {
    return (
      <Shell>
        <div className={panelTitle}>The fetch command failed</div>
        <div>{String(error)}</div>
      </Shell>
    );
  }

  if (!output) {
    return <Shell>Loading issues…</Shell>;
  }

  var data;
  try {
    data = JSON.parse(output);
  } catch (e) {
    return (
      <Shell>
        <div className={panelTitle}>Linear sent something unreadable</div>
        <code className={code}>{String(output).slice(0, 300)}</code>
      </Shell>
    );
  }

  if (data.widgetError === "no-token") {
    return (
      <Shell>
        <div className={panelTitle}>Add your Linear key to finish setup</div>
        <div>Create a personal API key in Linear under Settings → Security &amp; access, then run:</div>
        <code className={code}>
          echo "lin_api_YOURKEY" &gt; ~/.linear-widget-token{"\n"}chmod 600 ~/.linear-widget-token
        </code>
        <div>Then refresh widgets in Übersicht.</div>
      </Shell>
    );
  }

  if (data.errors && data.errors.length) {
    return (
      <Shell>
        <div className={panelTitle}>Linear rejected the request</div>
        <div>{data.errors[0].message}</div>
      </Shell>
    );
  }

  var issues =
    (data.data && data.data.issues && data.data.issues.nodes) || [];

  if (!issues.length) {
    return (
      <Shell>
        <div className={panelTitle}>Nothing open</div>
        <div>Every issue in the workspace is closed.</div>
      </Shell>
    );
  }

  var colors = typeColors(issues);

  var urgent = issues.filter(function (i) {
    return i.priority === 1;
  }).length;

  // Only spend a column on assignees when anyone is actually assigned.
  var showWho = issues.some(function (i) {
    return i.assignee && i.assignee.displayName;
  });

  var buckets = TYPES.map(function (t) {
    return {
      key: t.key,
      label: t.label,
      color: colors[t.key],
      count: issues.filter(function (i) {
        return i.state && i.state.type === t.key;
      }).length
    };
  }).filter(function (b) {
    return b.count > 0;
  });

  var groups = groupIssues(issues);

  return (
    <div>
      <div
        className={head}
        onClick={function () {
          run('touch "$HOME/Library/Application Support/Übersicht/widgets/linear.jsx"');
        }}
      >
        <div className={mark}>
          Linear
          <span className={"refreshhint " + refreshHint}>click to refresh</span>
        </div>
        <div className={counts}>
          {urgent > 0 ? <span className={urgentCount}>{urgent} urgent</span> : null}
          <span>{issues.length} open</span>
        </div>
      </div>

      <div className={bar}>
        {buckets.map(function (b) {
          return (
            <div
              key={b.key}
              className={seg}
              style={{ flexGrow: b.count, background: b.color }}
            />
          );
        })}
      </div>

      <div className={legend}>
        {buckets.map(function (b) {
          return (
            <div key={b.key} className={legendItem}>
              <span className={swatch} style={{ background: b.color }} />
              <span className={legendNum}>{b.count}</span>
              <span>{b.label}</span>
            </div>
          );
        })}
      </div>

      <div className={list}>
        {groups.map(function (group) {
          return (
            <div key={group.id}>
              <div className={groupHead}>
                {group.kind === "team" ? (
                  <span className={teamKey}>{group.badge}</span>
                ) : (
                  <span className={dot} style={{ background: group.color }} />
                )}
                <span className={groupLabel}>{group.label}</span>
                <span className={groupCount}>{group.issues.length}</span>
              </div>
              {group.issues.map(function (issue) {
                var stateColor =
                  (issue.state && issue.state.color) || "#7A8394";
                var cls = showWho ? rowWithWho : row;
                if (issue.priority === 1) cls = cls + " " + rowUrgent;
                return (
                  <div
                    key={issue.identifier}
                    className={cls}
                    onClick={function () {
                      // Open in the Linear desktop app. Matched by bundle id so
                      // it keeps working if the app is renamed; falls back to
                      // the browser if the app isn't installed.
                      run(
                        'open -b com.linear "' + issue.url + '" 2>/dev/null || ' +
                        'open "' + issue.url + '"'
                      );
                    }}
                  >
                    <span className={dot} style={{ background: stateColor }} />
                    <span className={ident}>{issue.identifier}</span>
                    <span className={title}>{issue.title}</span>
                    {showWho ? (
                      <span className={who}>{initials(issue.assignee)}</span>
                    ) : null}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {issues.length >= LIMIT ? (
        <div className={note}>
          Showing the {LIMIT} most recently updated open issues.
        </div>
      ) : null}
    </div>
  );
};
