// We need to make sure that Vercel will not cache the result of the fetch
// within kv or else increment will not work properly.  It needs to hit
// the redis instance each time this is called with no caching
export const dynamic = 'force-dynamic';

import { kv } from '@vercel/kv';

import Composer from '@/app/components/Composer';
import { Category } from '@/app/types';
import { getUser } from '@/app/helpers/user';

async function getData() {
  const [nextThreadID, user] = await Promise.all([
    kv.incr('nextThreadID'),
    getUser(),
  ]);
  return {
    nextThreadID: `${nextThreadID}`,
    userIsAdmin: user.isAdmin ?? false,
  };
}

export default async function NewPost({
  searchParams,
}: {
  searchParams?: { category: Category };
}) {
  const { nextThreadID, userIsAdmin } = await getData();

  return (
    <>
      <Composer
        defaultCategory={searchParams?.category}
        threadID={nextThreadID}
        userIsAdmin={userIsAdmin}
      />
    </>
  );
}
