import Composer from '@/app/components/Composer';
import { Category } from '@/app/types';

export default function NewPost({
  searchParams,
}: {
  searchParams?: { category: Category };
}) {
  return <Composer defaultCategory={searchParams?.category} />;
}
