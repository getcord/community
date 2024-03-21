import { fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import { CORD_USER_COOKIE, NEXT_URL_COOKIE } from '@/consts';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default function SignIn() {
  async function create(formData: FormData) {
    'use server';

    const name = formData.get('name');
    if (!name || typeof name !== 'string') {
      return;
    }

    await fetchCordRESTApi(`users/${name}`, 'PUT', {
      name,
      addGroups: ['community_all'],
    });
    // Temporarily out logged in/logged out states using cookies, will be adding auth0
    // and removing most of this

    cookies().set(CORD_USER_COOKIE, name);
    const urlCallback = cookies().get(NEXT_URL_COOKIE);
    if (urlCallback?.value) {
      cookies().delete(NEXT_URL_COOKIE);
      redirect(urlCallback.value);
    }
    redirect('/');
  }

  return (
    <form action={create}>
      <h1>Welcome to Cord</h1>
      <label>
        What would you like to use as your username
        <input name="name"></input>
      </label>
      <button>Join the community</button>
    </form>
  );
}
