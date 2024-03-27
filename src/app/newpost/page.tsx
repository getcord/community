// We need to make sure that Vercel will not cache the result of the fetch
// within kv or else increment will not work properly.  It needs to hit
// the redis instance each time this is called with no caching
export const dynamic = 'force-dynamic';

import { kv } from '@vercel/kv';

import Composer from '@/app/components/Composer';
import { Category } from '@/app/types';
import { randomUUID } from 'crypto';

async function getData() {
  const nextThreadID = await kv.incr('nextThreadID');
  return `${nextThreadID}`;
}

export default async function NewPost({
  searchParams,
}: {
  searchParams?: { category: Category };
}) {
  const threadID = await getData();

  return (
    <>
      <Composer defaultCategory={searchParams?.category} threadID={threadID} />
    </>
  );
}
