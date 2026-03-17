'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { SignOutButton } from '@clerk/nextjs';
import { updateProfile, updateCar, type SettingsState } from '@/app/settings/actions';
import { tokens } from '@/lib/design-tokens';

const { white, grey, accent, black } = tokens.colors;
const { display, body, mono }        = tokens.fonts;

const INIT: SettingsState = { error: null, success: false };

// ─── Shared sub-components ────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p style={{ fontFamily: mono, fontSize: 9, letterSpacing: '0.12em', color: grey[500], textTransform: 'uppercase', marginBottom: 6 }}>
      {children}
    </p>
  );
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      style={{
        width:           '100%',
        height:          40,
        backgroundColor: grey[900],
        border:          `1px solid ${grey[700]}`,
        borderRadius:    4,
        padding:         '0 12px',
        fontFamily:      body,
        fontSize:        13,
        color:           white,
        outline:         'none',
        boxSizing:       'border-box',
        ...props.style,
      }}
    />
  );
}

function Textarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      style={{
        width:           '100%',
        backgroundColor: grey[900],
        border:          `1px solid ${grey[700]}`,
        borderRadius:    4,
        padding:         '10px 12px',
        fontFamily:      body,
        fontSize:        13,
        color:           white,
        outline:         'none',
        resize:          'vertical',
        boxSizing:       'border-box',
        minHeight:       80,
        ...props.style,
      }}
    />
  );
}

function SubmitBtn({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        height:          36,
        padding:         '0 20px',
        backgroundColor: pending ? grey[700] : accent,
        border:          'none',
        borderRadius:    3,
        fontFamily:      mono,
        fontSize:        10,
        fontWeight:      700,
        letterSpacing:   '0.12em',
        color:           pending ? grey[500] : black,
        cursor:          pending ? 'not-allowed' : 'pointer',
      }}
    >
      {pending ? 'SAVING...' : label}
    </button>
  );
}

function StatusBanner({ state }: { state: SettingsState }) {
  if (!state.error && !state.success) return null;
  return (
    <div
      style={{
        marginTop:    12,
        padding:      '10px 14px',
        borderRadius: 4,
        border:       `1px solid ${state.error ? '#ff4444' : accent}44`,
        backgroundColor: state.error ? '#ff000012' : `${accent}12`,
        fontFamily:   mono,
        fontSize:     10,
        letterSpacing:'0.08em',
        color:        state.error ? '#ff6666' : accent,
      }}
    >
      {state.error ?? 'SAVED SUCCESSFULLY'}
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2
      style={{
        fontFamily:    display,
        fontSize:      18,
        letterSpacing: '0.06em',
        color:         white,
        marginBottom:  20,
        lineHeight:    1,
      }}
    >
      {children}
    </h2>
  );
}

// ─── Profile section ──────────────────────────────────────────────────────────

interface ProfileSectionProps {
  bio:              string | null;
  instagram_handle: string | null;
  social_followers: number;
}

function ProfileSection({ bio, instagram_handle, social_followers }: ProfileSectionProps) {
  const [state, action] = useActionState(updateProfile, INIT);

  return (
    <section style={{ marginBottom: 48 }}>
      <SectionTitle>PROFILE</SectionTitle>
      <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 520 }}>
        <div>
          <Label>Bio</Label>
          <Textarea name="bio" defaultValue={bio ?? ''} placeholder="Tell the community about yourself and your build..." rows={3} />
        </div>
        <div>
          <Label>Instagram Handle</Label>
          <Input name="instagram_handle" defaultValue={instagram_handle ?? ''} placeholder="@yourhandle" />
        </div>
        <div>
          <Label>Social Followers</Label>
          <Input name="social_followers" type="number" min={0} defaultValue={social_followers} />
        </div>
        <div>
          <SubmitBtn label="SAVE PROFILE" />
        </div>
        <StatusBanner state={state} />
      </form>
    </section>
  );
}

// ─── Car section ──────────────────────────────────────────────────────────────

interface CarSectionProps {
  make:  string;
  model: string;
  year:  number;
  mods:  string | null;
}

function CarSection({ make, model, year, mods }: CarSectionProps) {
  const [state, action] = useActionState(updateCar, INIT);

  return (
    <section style={{ marginBottom: 48 }} id="car">
      <SectionTitle>YOUR CAR</SectionTitle>
      <form action={action} style={{ display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 520 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div>
            <Label>Make</Label>
            <Input name="make" defaultValue={make} placeholder="e.g. Nissan" required />
          </div>
          <div>
            <Label>Model</Label>
            <Input name="model" defaultValue={model} placeholder="e.g. Skyline GT-R" required />
          </div>
        </div>
        <div style={{ maxWidth: 160 }}>
          <Label>Year</Label>
          <Input name="year" type="number" min={1900} max={new Date().getFullYear() + 1} defaultValue={year} required />
        </div>
        <div>
          <Label>Mods / Build Notes</Label>
          <Textarea name="mods" defaultValue={mods ?? ''} placeholder="List your modifications, engine work, suspension, etc." rows={4} />
        </div>
        <div>
          <SubmitBtn label="SAVE CAR" />
        </div>
        <StatusBanner state={state} />
      </form>
    </section>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export interface SettingsFormProps {
  profile: ProfileSectionProps;
  car:     CarSectionProps | null;
}

export function SettingsForm({ profile, car }: SettingsFormProps) {
  const defaultCar: CarSectionProps = car ?? { make: '', model: '', year: new Date().getFullYear(), mods: null };

  return (
    <>
      <ProfileSection {...profile} />
      <div style={{ height: 1, backgroundColor: `rgba(255,255,255,0.06)`, margin: '0 0 40px' }} />
      <CarSection {...defaultCar} />
    </>
  );
}
