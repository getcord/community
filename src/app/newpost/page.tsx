import Composer from '@/app/components/Composer';
import { Category } from '@/app/types';
import { randomUUID } from 'crypto';

function getData() {
  return randomUUID();
}

export default function NewPost({
  searchParams,
}: {
  searchParams?: { category: Category };
}) {
  const threadID = getData();
  return (
    <Composer defaultCategory={searchParams?.category} threadID={threadID} />
  );
}
