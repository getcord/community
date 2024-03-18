export const GROUP_ID = 'samplecord';
export const CORD_USER_COOKIE = 'cord-next-next-user-id';

export const CORD_API_URL = 'https://api.cord.com/v1/';
export const CORD_DOCS_URL = 'https://docs.cord.com';
export const CORD_CONSOLE_URL = 'https://console.cord.com';

export const CORD_APP_ID = process.env.CORD_APP_ID!;
export const CORD_SECRET = process.env.CORD_SECRET!;
export const EVERYONE_GROUP_ID = 'community_all';
export const NEXT_URL_COOKIE = 'community-url-callback';
export const SERVER_HOST = process.env.NEXT_PUBLIC_SERVER_HOST!;

export const USERS = [
  {
    // The user ID can be any identifier that makes sense to your application.
    // As long as it's unique per-user, Cord can use it to represent your user.
    user_id: 'tom',

    // By supplying the  `user_details` object, you can create the user in
    // Cord's backend on-the-fly. No need to pre-sync your users.
    user_details: {
      email: `sample-template-user1@cord.com`,
      name: 'Tom',
      profilePictureURL: 'https://app.cord.com/static/Tom.png',
    },
  },
  {
    user_id: 'myhoa',
    user_details: {
      email: `sample-template-user2@cord.com`,
      name: 'My Hoa',
      profilePictureURL: 'https://app.cord.com/static/MyHoa.png',
    },
  },
  {
    user_id: 'khadija',
    user_details: {
      email: `sample-template-user3@cord.com`,
      name: 'Khadija',
      profilePictureURL: 'https://app.cord.com/static/Khadija.png',
    },
  },
  {
    user_id: 'Jack',
    user_details: {
      email: `sample-template-user4@cord.com`,
      name: 'Jack',
      profilePictureURL: 'https://app.cord.com/static/Jackson.png',
    },
  },
];
