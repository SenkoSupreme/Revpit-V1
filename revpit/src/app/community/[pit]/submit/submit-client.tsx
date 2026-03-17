'use client';

import { useRouter } from 'next/navigation';
import { SubmitDrop } from '@/components/community/submit-drop';

interface Props {
  pitId:          string;
  pitDisplayName: string;
  userId:         string;
}

export function SubmitDropClient({ pitId, pitDisplayName, userId }: Props) {
  const router = useRouter();

  return (
    <SubmitDrop
      pitId={pitId}
      pitDisplayName={pitDisplayName}
      userId={userId}
      onSuccess={(dropId) => router.push(`/community/drop/${dropId}`)}
    />
  );
}
