'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { submitQuest } from '@/app/quests/actions';
import { tokens } from '@/lib/design-tokens';

const { accent, grey, black } = tokens.colors;
const { mono }                = tokens.fonts;

function SubmitBtn() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      style={{
        height: 36,
        padding: '0 20px',
        background: pending ? grey[700] : accent,
        color: pending ? grey[500] : black,
        border: 'none',
        borderRadius: 3,
        fontFamily: mono,
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        cursor: pending ? 'not-allowed' : 'pointer',
        transition: 'opacity 0.15s, background 0.15s',
        whiteSpace: 'nowrap',
      }}
    >
      {pending ? 'Submitting…' : 'Submit Quest'}
    </button>
  );
}

export function QuestSubmitButton({ questId }: { questId: string }) {
  const boundAction = submitQuest.bind(null, questId);
  const [state, action] = useActionState(async (_: unknown, fd: FormData) => {
    return boundAction();
  }, { error: undefined as string | undefined });

  return (
    <div>
      <form action={action as unknown as (fd: FormData) => void}>
        <SubmitBtn />
      </form>
      {state?.error && (
        <p
          style={{
            fontFamily: mono,
            fontSize: 10,
            color: '#FF6B6B',
            marginTop: 6,
            letterSpacing: '0.04em',
          }}
        >
          {state.error}
        </p>
      )}
    </div>
  );
}
