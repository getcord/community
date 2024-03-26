import { redirect } from 'next/navigation';

export default async function Profile({ params }: { params: { tab: string } }) {
  if (!params?.tab) {
    redirect('/notifications');
  }
}
