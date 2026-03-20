'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { setUserRole, grantRoleByEmail } from '../actions';
import type { SetRoleState } from '../actions';
import styles from '../admin.module.css';

// ─── Set role for existing user ────────────────────────────────────────────────

function SetRoleSubmit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={styles.formBtn} style={{ height: 28, padding: '0 12px', fontSize: 9 }}>
      {pending ? '...' : 'SET'}
    </button>
  );
}

const roleInit: SetRoleState = { error: null };

export function SetRoleForm({ clerkId, currentRole }: { clerkId: string; currentRole: string }) {
  const [state, action] = useActionState(setUserRole, roleInit);

  return (
    <form action={action} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
      <input type="hidden" name="clerk_id" value={clerkId} />
      <select name="role" defaultValue={currentRole} className={styles.formSelect} style={{ height: 28, fontSize: 10, padding: '0 28px 0 8px', minWidth: 100 }}>
        <option value="user">User</option>
        <option value="moderator">Moderator</option>
        <option value="admin">Admin</option>
      </select>
      <SetRoleSubmit />
      {state.error && (
        <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, color: '#FF4444' }}>{state.error}</span>
      )}
      {state.success && (
        <span style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#00D68F', letterSpacing: '0.08em' }}>✓ SAVED</span>
      )}
    </form>
  );
}

// ─── Grant role by email (pre-grant) ──────────────────────────────────────────

function GrantSubmit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={styles.formBtn}>
      {pending ? 'GRANTING...' : 'GRANT ROLE'}
    </button>
  );
}

export function GrantEmailForm() {
  const [state, action] = useActionState(grantRoleByEmail, roleInit);

  return (
    <form action={action}>
      <div className={styles.formRow}>
        <input
          name="email"
          type="email"
          placeholder="user@example.com"
          required
          className={styles.formInput}
          style={{ minWidth: 240 }}
        />
        <select name="role" required className={styles.formSelect} style={{ minWidth: 140 }}>
          <option value="moderator">Moderator</option>
          <option value="admin">Admin</option>
        </select>
        <GrantSubmit />
      </div>
      {state.error && (
        <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: '#FF4444', marginTop: 8 }}>{state.error}</p>
      )}
      {state.success && (
        <p style={{ fontFamily: '"JetBrains Mono", monospace', fontSize: 9, color: '#00D68F', marginTop: 8, letterSpacing: '0.1em' }}>✓ ROLE GRANTED</p>
      )}
    </form>
  );
}
