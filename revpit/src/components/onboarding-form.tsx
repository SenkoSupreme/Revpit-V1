'use client';

import { useState, useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { completeOnboarding } from '@/app/onboarding/actions';
import type { OnboardingState } from '@/app/onboarding/actions';
import { tokens } from '@/lib/design-tokens';
import styles from './onboarding-form.module.css';

// ─── Constants ────────────────────────────────────────────────────────────────

const { white, grey, accent, black } = tokens.colors;
const { display, body, mono }        = tokens.fonts;

const STEPS = [
  { n: 1, label: 'Profile'  },
  { n: 2, label: 'Car'      },
  { n: 3, label: 'Social'   },
] as const;

// ─── Submit button ────────────────────────────────────────────────────────────

function FinalSubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className={styles.btnPrimary} disabled={pending}>
      {pending ? 'Setting up…' : 'Complete Setup'}
    </button>
  );
}

// ─── Progress indicator ───────────────────────────────────────────────────────

function StepIndicator({ current }: { current: number }) {
  const pct = ((current - 1) / (STEPS.length - 1)) * 100;

  return (
    <div style={{ marginBottom: 36 }}>
      {/* Fill bar */}
      <div className={styles.progressTrack}>
        <div className={styles.progressFill} style={{ width: `${pct}%` }} />
      </div>

      {/* Nodes */}
      <div className={styles.stepsRow}>
        {STEPS.map((s, i) => {
          const done   = current > s.n;
          const active = current === s.n;

          return (
            <div key={s.n} style={{ display: 'contents' }}>
              {i > 0 && (
                <div
                  className={`${styles.stepConnector} ${done || active ? styles.stepConnectorDone : ''}`}
                />
              )}
              <div className={styles.stepNode}>
                <div
                  className={[
                    styles.stepCircle,
                    active ? styles.stepCircleActive : '',
                    done   ? styles.stepCircleDone   : '',
                  ].join(' ')}
                >
                  {done ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                      <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  ) : s.n}
                </div>
                <span
                  className={[
                    styles.stepLabel,
                    active ? styles.stepLabelActive : '',
                    done   ? styles.stepLabelDone   : '',
                  ].join(' ')}
                >
                  {s.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Step 1: Profile ──────────────────────────────────────────────────────────

type Step1Props = {
  username: string; setUsername: (v: string) => void;
  bio:      string; setBio:      (v: string) => void;
  onNext: () => void;
};

function Step1({ username, setUsername, bio, setBio, onNext }: Step1Props) {
  const [errors, setErrors] = useState<{ username?: string }>({});

  function validate() {
    if (!username.trim() || username.trim().length < 3) {
      setErrors({ username: 'At least 3 characters required.' });
      return false;
    }
    if (!/^[a-zA-Z0-9_]+$/.test(username.trim())) {
      setErrors({ username: 'Letters, numbers, and underscores only.' });
      return false;
    }
    return true;
  }

  return (
    <div>
      <h2 style={{ fontFamily: display, fontSize: 26, letterSpacing: '0.05em', color: white, margin: '0 0 6px' }}>
        SET UP YOUR PROFILE
      </h2>
      <p style={{ fontFamily: body, fontSize: 13, color: grey[500], marginBottom: 28 }}>
        Choose your pilot identity on REVPIT.
      </p>

      <div className={styles.field}>
        <label htmlFor="ob-username" className={styles.label}>Username</label>
        <input
          id="ob-username"
          type="text"
          className={styles.input}
          placeholder="e.g. apex_driver"
          value={username}
          maxLength={24}
          autoFocus
          onChange={(e) => {
            setUsername(e.target.value);
            setErrors({});
          }}
        />
        {errors.username && <span className={styles.fieldError}>{errors.username}</span>}
        <span className={styles.hint}>3–24 characters. Letters, numbers, underscores only.</span>
      </div>

      <div className={styles.field}>
        <label htmlFor="ob-bio" className={`${styles.label} ${styles.labelOptional}`}>Bio</label>
        <textarea
          id="ob-bio"
          className={styles.textarea}
          placeholder="Tell the community about yourself and your build…"
          value={bio}
          maxLength={160}
          onChange={(e) => setBio(e.target.value)}
          style={{ minHeight: 80 }}
        />
        <span className={styles.hint} style={{ textAlign: 'right', display: 'block' }}>
          {bio.length}/160
        </span>
      </div>

      <div className={styles.actions} style={{ justifyContent: 'flex-end' }}>
        <button
          type="button"
          className={styles.btnPrimary}
          onClick={() => validate() && onNext()}
        >
          Next: Add Car
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Car ──────────────────────────────────────────────────────────────

type Step2Props = {
  make:  string; setMake:  (v: string) => void;
  model: string; setModel: (v: string) => void;
  year:  string; setYear:  (v: string) => void;
  mods:  string; setMods:  (v: string) => void;
  onNext: () => void;
  onBack: () => void;
};

function Step2({ make, setMake, model, setModel, year, setYear, mods, setMods, onNext, onBack }: Step2Props) {
  const [errors, setErrors] = useState<{ make?: string; model?: string; year?: string }>({});
  const maxYear = new Date().getFullYear() + 1;

  function validate() {
    const errs: typeof errors = {};
    if (!make.trim())  errs.make  = 'Required.';
    if (!model.trim()) errs.model = 'Required.';
    const y = parseInt(year, 10);
    if (isNaN(y) || y < 1900 || y > maxYear) errs.year = `Enter a year between 1900–${maxYear}.`;
    setErrors(errs);
    return Object.keys(errs).length === 0;
  }

  return (
    <div>
      <h2 style={{ fontFamily: display, fontSize: 26, letterSpacing: '0.05em', color: white, margin: '0 0 6px' }}>
        ADD YOUR FIRST CAR
      </h2>
      <p style={{ fontFamily: body, fontSize: 13, color: grey[500], marginBottom: 28 }}>
        Your primary build. You can add more cars later.
      </p>

      <div className={styles.fieldRow}>
        <div>
          <label htmlFor="ob-make" className={styles.label}>Make</label>
          <input
            id="ob-make"
            type="text"
            className={styles.input}
            placeholder="BMW"
            value={make}
            autoFocus
            onChange={(e) => { setMake(e.target.value); setErrors((p) => ({ ...p, make: undefined })); }}
          />
          {errors.make && <span className={styles.fieldError}>{errors.make}</span>}
        </div>
        <div>
          <label htmlFor="ob-model" className={styles.label}>Model</label>
          <input
            id="ob-model"
            type="text"
            className={styles.input}
            placeholder="M3 Competition"
            value={model}
            onChange={(e) => { setModel(e.target.value); setErrors((p) => ({ ...p, model: undefined })); }}
          />
          {errors.model && <span className={styles.fieldError}>{errors.model}</span>}
        </div>
      </div>

      <div className={styles.field}>
        <label htmlFor="ob-year" className={styles.label}>Year</label>
        <input
          id="ob-year"
          type="number"
          className={styles.input}
          placeholder="2023"
          value={year}
          min={1900}
          max={maxYear}
          onChange={(e) => { setYear(e.target.value); setErrors((p) => ({ ...p, year: undefined })); }}
          style={{ maxWidth: 160 }}
        />
        {errors.year && <span className={styles.fieldError}>{errors.year}</span>}
      </div>

      <div className={styles.field}>
        <label htmlFor="ob-mods" className={`${styles.label} ${styles.labelOptional}`}>Modifications</label>
        <textarea
          id="ob-mods"
          className={styles.textarea}
          placeholder={'Stage 2 ECU tune\nCold air intake\nCoilover suspension\nBrembo big brake kit'}
          value={mods}
          onChange={(e) => setMods(e.target.value)}
        />
        <span className={styles.hint}>One mod per line. Add as many as you like.</span>
      </div>

      <div className={styles.actions}>
        <button type="button" className={styles.btnSecondary} onClick={onBack}>Back</button>
        <button type="button" className={styles.btnPrimary} onClick={() => validate() && onNext()}>
          Next: Social
        </button>
      </div>
    </div>
  );
}

// ─── Step 3: Social ───────────────────────────────────────────────────────────

type Step3Props = {
  handle:    string; setHandle:    (v: string) => void;
  followers: string; setFollowers: (v: string) => void;
  onBack: () => void;
  // step 1 + 2 data passed as hidden form inputs
  username: string; bio: string;
  make: string; model: string; year: string; mods: string;
  serverError: string | null;
};

function Step3({
  handle, setHandle, followers, setFollowers,
  onBack, username, bio, make, model, year, mods, serverError,
}: Step3Props) {
  const [state, action] = useActionState<OnboardingState, FormData>(
    completeOnboarding,
    { error: serverError },
  );

  return (
    <div>
      <h2 style={{ fontFamily: display, fontSize: 26, letterSpacing: '0.05em', color: white, margin: '0 0 6px' }}>
        CONNECT SOCIAL
      </h2>
      <p style={{ fontFamily: body, fontSize: 13, color: grey[500], marginBottom: 28 }}>
        Link your presence. Follower counts boost your REVPIT score.
      </p>

      {state.error && (
        <p className={styles.errorBanner} role="alert">{state.error}</p>
      )}

      <form action={action}>
        {/* ── Hidden: step 1 + 2 data ───────────────────────────────── */}
        <input type="hidden" name="username" value={username} />
        <input type="hidden" name="bio"      value={bio} />
        <input type="hidden" name="make"     value={make} />
        <input type="hidden" name="model"    value={model} />
        <input type="hidden" name="year"     value={year} />
        <input type="hidden" name="mods"     value={mods} />

        {/* ── Instagram ─────────────────────────────────────────────── */}
        <div className={styles.platformCard}>
          <div className={styles.platformHeader}>
            <div className={styles.platformDot} style={{ background: '#E1306C' }} />
            <span style={{ fontFamily: mono, fontSize: 12, fontWeight: 700, letterSpacing: '0.06em', color: white }}>
              Instagram
            </span>
          </div>

          <div className={styles.fieldRow} style={{ marginBottom: 0 }}>
            <div>
              <label htmlFor="ob-ig" className={styles.label}>Handle</label>
              <div className={styles.inputPrefix}>
                <span className={styles.prefixGlyph}>@</span>
                <input
                  id="ob-ig"
                  type="text"
                  name="instagram_handle"
                  className={styles.input}
                  placeholder="yourhandle"
                  value={handle}
                  autoFocus
                  onChange={(e) => setHandle(e.target.value.replace(/^@/, ''))}
                />
              </div>
            </div>
            <div>
              <label htmlFor="ob-followers" className={styles.label}>Followers</label>
              <input
                id="ob-followers"
                type="number"
                name="social_followers"
                className={styles.input}
                placeholder="0"
                value={followers}
                min={0}
                onChange={(e) => setFollowers(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* ── Coming soon platforms ─────────────────────────────────── */}
        {(['TikTok', 'YouTube'] as const).map((platform) => (
          <div key={platform} className={styles.comingSoon}>
            <div
              className={styles.platformDot}
              style={{ background: platform === 'TikTok' ? '#69C9D0' : '#FF0000' }}
            />
            <span style={{ fontFamily: mono, fontSize: 11, color: grey[700], letterSpacing: '0.06em' }}>
              {platform} — Coming soon
            </span>
          </div>
        ))}

        <div className={styles.actions}>
          <button type="button" className={styles.btnSecondary} onClick={onBack}>Back</button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              type="submit"
              className={styles.skipLink}
              name="instagram_handle"
              value=""
            >
              Skip for now
            </button>
            <FinalSubmitButton />
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export function OnboardingForm() {
  const [step, setStep]           = useState(1);
  const [direction, setDirection] = useState<'forward' | 'back'>('forward');

  // Step 1
  const [username, setUsername] = useState('');
  const [bio,      setBio]      = useState('');

  // Step 2
  const [make,  setMake]  = useState('');
  const [model, setModel] = useState('');
  const [year,  setYear]  = useState('');
  const [mods,  setMods]  = useState('');

  // Step 3
  const [handle,    setHandle]    = useState('');
  const [followers, setFollowers] = useState('');

  function goNext() { setDirection('forward'); setStep((s) => s + 1); }
  function goBack() { setDirection('back');    setStep((s) => s - 1); }

  return (
    <div
      style={{
        width: '100%',
        maxWidth: 520,
        backgroundColor: grey[900],
        border: `1px solid ${grey[700]}`,
        borderRadius: 3,
        padding: '36px 36px 32px',
      }}
    >
      <StepIndicator current={step} />

      <div
        key={step}
        className={direction === 'forward' ? styles.stepForward : styles.stepBack}
      >
        {step === 1 && (
          <Step1
            username={username} setUsername={setUsername}
            bio={bio}           setBio={setBio}
            onNext={goNext}
          />
        )}
        {step === 2 && (
          <Step2
            make={make}   setMake={setMake}
            model={model} setModel={setModel}
            year={year}   setYear={setYear}
            mods={mods}   setMods={setMods}
            onNext={goNext}
            onBack={goBack}
          />
        )}
        {step === 3 && (
          <Step3
            handle={handle}       setHandle={setHandle}
            followers={followers} setFollowers={setFollowers}
            onBack={goBack}
            username={username}   bio={bio}
            make={make}           model={model}
            year={year}           mods={mods}
            serverError={null}
          />
        )}
      </div>
    </div>
  );
}
