'use client';

import { useState } from 'react';
import type { Tier } from '@/lib/scoring';
import { tokens } from '@/lib/design-tokens';
import styles from './leaderboard-table.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

export type LeaderboardRow = {
  rank:         number;
  id:           string;
  username:     string;
  handle:       string;
  avatarLetter: string;
  carName:      string;
  score:        number;
  tier:         Tier;
};

// ─── Design tokens ────────────────────────────────────────────────────────────

const { accent, grey, white } = tokens.colors;
const { mono, body }          = tokens.fonts;

const TIER_COLOR: Record<Tier, string> = {
  starter:  grey[500],
  advanced: grey[300],
  pro:      white,
  elite:    accent,
};

const TIER_LABEL: Record<Tier, string> = {
  starter:  'STARTER',
  advanced: 'ADVANCED',
  pro:      'PRO',
  elite:    'ELITE',
};

const FILTER_TABS = ['All Time', 'This Week', 'This Month'] as const;
type FilterTab = typeof FILTER_TABS[number];

// ─── Trend cell ───────────────────────────────────────────────────────────────

function TrendCell({ rank }: { rank: number }) {
  // Deterministic pseudo-trend from rank number (no real data yet)
  if (rank === 1) {
    return (
      <div className={styles.trendStable}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2 7l3-3 3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        STABLE
      </div>
    );
  }
  const delta = ((rank * 7) % 15) - 7;
  if (delta === 0) {
    return <div className={styles.trendNeutral}>— 0</div>;
  }
  if (delta > 0) {
    return (
      <div className={styles.trendUp}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2 7l3-4 3 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          <path d="M7 2h2v2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        +{delta}
      </div>
    );
  }
  return (
    <div className={styles.trendDown}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
        <path d="M2 3l3 4 3-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {delta}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LeaderboardTable({ rows }: { rows: LeaderboardRow[] }) {
  const [query,     setQuery]     = useState('');
  const [activeTab, setActiveTab] = useState<FilterTab>('All Time');

  const filtered = query.trim()
    ? rows.filter((r) =>
        r.username.toLowerCase().includes(query.toLowerCase()) ||
        r.handle.toLowerCase().includes(query.toLowerCase()),
      )
    : rows;

  return (
    <div>
      {/* ── Toolbar ─────────────────────────────────────────────────────── */}
      <div className={styles.toolbar}>
        {/* Filter tabs */}
        <div className={styles.filterTabs}>
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              className={`${styles.filterTab} ${activeTab === tab ? styles.filterTabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className={styles.searchWrap}>
          <svg
            className={styles.searchIcon}
            width="14"
            height="14"
            viewBox="0 0 16 16"
            fill="none"
            aria-hidden="true"
          >
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search driver or car..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Filter leaderboard"
          />
        </div>
      </div>

      {/* ── Table ───────────────────────────────────────────────────────── */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead className={styles.thead}>
            <tr>
              <th>RANK</th>
              <th>DRIVER &amp; MACHINE</th>
              <th>SCORE</th>
              <th>TIER</th>
              <th>TREND</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className={styles.empty}>
                  No pilots found for &ldquo;{query}&rdquo;
                </td>
              </tr>
            ) : (
              filtered.map((row) => {
                const isGold    = row.rank <= 3;
                const tierColor = isGold ? '#D4A500' : TIER_COLOR[row.tier];

                return (
                  <tr
                    key={row.id}
                    className={`${styles.row} ${isGold ? styles.rowFirst : ''} hover-shift`}
                    style={isGold ? {
                      backgroundColor: 'rgba(18,14,9,1)',
                      borderLeft:      '4px solid #D4A500',
                    } : { borderLeft: '4px solid transparent' }}
                  >
                    {/* Rank */}
                    <td className={`${styles.rankCell} ${isGold ? styles.rankFirst : ''}`}>
                      {isGold ? (
                        <span className={styles.rankGold} style={{ color: '#D4A500' }}>
                          #{row.rank}
                          {row.rank === 1 && (
                            <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{ marginLeft: 4 }} aria-hidden="true">
                              <path d="M5.5 1l1.1 3.3H10L7.2 6.2l1.1 3.3L5.5 7.7 2.7 9.5l1.1-3.3L1 4.3h3.4z" fill="#D4A500" />
                            </svg>
                          )}
                        </span>
                      ) : (
                        `#${row.rank}`
                      )}
                    </td>

                    {/* Driver */}
                    <td>
                      <div className={styles.userCell}>
                        <div
                          className={`${styles.avatar} ${isGold ? styles.avatarFirst : ''}`}
                          style={isGold ? { boxShadow: '0 0 0 2px #0E0D0C, 0 0 0 3px #D4A500' } : undefined}
                        >
                          {row.avatarLetter.toUpperCase()}
                        </div>
                        <div style={{ minWidth: 0 }}>
                          <span className={styles.username}>{row.username}</span>
                          <span className={styles.carSub}>{row.carName.toUpperCase()}</span>
                        </div>
                      </div>
                    </td>

                    {/* Score */}
                    <td
                      className={`${styles.scoreCell} ${isGold ? styles.scoreFirst : ''}`}
                      style={isGold ? { color: '#D4A500' } : undefined}
                    >
                      {row.score.toLocaleString()}
                    </td>

                    {/* Tier */}
                    <td className={styles.tierCell}>
                      <span
                        className={styles.tierBadge}
                        style={{
                          color:           tierColor,
                          backgroundColor: `${tierColor}18`,
                          borderColor:     `${tierColor}44`,
                        }}
                      >
                        {TIER_LABEL[row.tier]}
                      </span>
                    </td>

                    {/* Trend */}
                    <td className={styles.trendCell}>
                      <TrendCell rank={row.rank} />
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ── Footer count ────────────────────────────────────────────────── */}
      <div className={styles.tableFooter}>
        <span>SHOWING TOP {filtered.length} OF {rows.length} DRIVERS</span>
      </div>
    </div>
  );
}
