import { kv } from '@vercel/kv';

import Composer from '@/app/components/Composer';
import { Category } from '@/app/types';
import { randomUUID } from 'crypto';

async function getData() {
  return randomUUID();
}

export default async function NewPost({
  searchParams,
}: {
  searchParams?: { category: Category };
}) {
  const threadID = await getData();
  const n = await kv.incr('nextThreadID');
  return (
    <>
      <p>{n}</p>
      <Composer defaultCategory={searchParams?.category} threadID={threadID} />
    </>
  );
}
