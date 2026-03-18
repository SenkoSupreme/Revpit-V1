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

// ─── Trend indicator ──────────────────────────────────────────────────────────

function TrendCell({ rank }: { rank: number }) {
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
  if (delta === 0) return <div className={styles.trendNeutral}>— 0</div>;
  if (delta > 0) {
    return (
      <div className={styles.trendUp}>
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
          <path d="M2 7l3-4 3 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
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

        <div className={styles.searchWrap}>
          <svg
            className={styles.searchIcon}
            width="14" height="14" viewBox="0 0 16 16"
            fill="none" aria-hidden="true"
          >
            <circle cx="6.5" cy="6.5" r="5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            className={styles.searchInput}
            type="search"
            placeholder="Search pilot..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Filter leaderboard"
          />
        </div>
      </div>

      {/* ── Column labels ───────────────────────────────────────────────── */}
      <div className={styles.colHeaders}>
        <div className={`${styles.colHeaderRank} ${styles.colLabel}`}>RANK</div>
        <div className={styles.colHeaderAvatar} />
        <div className={`${styles.colHeaderDriver} ${styles.colLabel}`}>PILOT</div>
        <div className={`${styles.colHeaderScore} ${styles.colLabel}`}>SCORE</div>
        <div className={`${styles.colHeaderTier} ${styles.colLabel}`}>TIER</div>
        <div className={`${styles.colHeaderTrend} ${styles.colLabel}`}>TREND</div>
      </div>

      {/* ── Card list ───────────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          No pilots found for &ldquo;{query}&rdquo;
        </div>
      ) : (
        <div className={styles.cardList}>
          {filtered.map((row) => {
            const isGold   = row.rank <= 3;
            const isFirst  = row.rank === 1;
            const isElite  = row.tier === 'elite' && !isGold;
            const tierColor = isGold ? '#D4A500' : TIER_COLOR[row.tier];

            const cardClass = [
              styles.card,
              isGold  ? styles.cardGold   : '',
              isElite ? styles.cardAccent : '',
            ].join(' ');

            const rankClass = [
              styles.rankNum,
              isFirst            ? styles.rankNumGold   : '',
              !isFirst && isGold ? styles.rankNumAccent : '',
            ].join(' ');

            const avatarClass = [
              styles.avatar,
              isFirst            ? styles.avatarFirst  : '',
              !isFirst && isGold ? styles.avatarAccent : '',
            ].join(' ');

            const scoreClass = [
              styles.scoreVal,
              isFirst            ? styles.scoreValGold   : '',
              !isFirst && isGold ? styles.scoreValAccent : '',
            ].join(' ');

            return (
              <div key={row.id} className={cardClass}>
                {/* Rank */}
                <div className={styles.rankBlock}>
                  <span className={rankClass}>{row.rank}</span>
                </div>

                {/* Avatar */}
                <div className={avatarClass}>
                  {row.avatarLetter.toUpperCase()}
                </div>

                {/* Driver info */}
                <div className={styles.driverInfo}>
                  <span className={styles.username}>{row.username}</span>
                  <span className={styles.handle}>@{row.handle}</span>
                </div>

                {/* Score */}
                <div className={styles.scoreBlock}>
                  <span className={scoreClass}>{row.score.toLocaleString()}</span>
                  <span className={styles.scorePts}>PTS</span>
                </div>

                {/* Tier badge */}
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

                {/* Trend */}
                <div className={styles.trendWrap}>
                  <TrendCell rank={row.rank} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <div className={styles.tableFooter}>
        SHOWING {filtered.length} OF {rows.length} PILOTS
      </div>
    </div>
  );
}
