import styles from './threadList.module.css';
import { ServerListThreads } from '@cord-sdk/types';
import Tile from '@/app/components/Tile';
import { buildQueryParams, fetchCordRESTApi } from '@/app/fetchCordRESTApi';
import { Category } from '@/app/types';
import { mapCategoryEndpointsToTitles } from '@/utils';
import { EVERYONE_GROUP_ID } from '@/consts';
import Button from '@/app/ui/Button';

const getThreadsData = async (category: Category | undefined) => {
  // Fetch all threads for the 'community_all' group and then any in the
  // particular category if specified
  const filter = buildQueryParams([
    {
      field: 'filter',
      value: JSON.stringify({
        ...(category && { metadata: { [category]: true } }),
        groupID: EVERYONE_GROUP_ID,
      }),
    },
  ]);

  const threadsData = await fetchCordRESTApi<ServerListThreads>(
    `threads${filter}`,
    'GET',
  );
  const pinnedResults = threadsData?.threads
    ? threadsData.threads.filter((thread) => {
        return thread.metadata.pinned ?? false;
      })
    : [];
  const categoryResults = threadsData?.threads
    ? threadsData.threads.filter((thread) => {
        return !thread.metadata.pinned;
      })
    : [];

  return {
    threads: [...pinnedResults, ...categoryResults],
  };
};

export default async function ThreadList({
  allowDiscussion,
  category,
}: {
  allowDiscussion: boolean;
  category?: Category;
}) {
  // do we want this to update? Probably? In that case we need to useThreads as well
  const { threads } = await getThreadsData(category);

  if (threads.length < 1) {
    // flickering -> to be fixed

    return (
      <>
        <ThreadListHeader
          category={category}
          allowDiscussion={allowDiscussion}
        />
        <p>No posts yet!</p>
      </>
    );
  }

  return (
    <>
      <ThreadListHeader category={category} allowDiscussion={allowDiscussion} />
      <section className={styles.container}>
        {threads?.length > 0 &&
          threads.map((thread) => {
            return (
              <Tile key={thread.id} threadID={thread.id} thread={thread} />
            );
          })}
      </section>
    </>
  );
}

export function ThreadListHeader({
  allowDiscussion,
  category,
}: {
  allowDiscussion: boolean;
  category?: Category;
}) {
  return (
    <>
      <div
        style={{
          padding: 16,
          background: '#F6F1FF',
          borderRadius: 16,
          color: '#333',
          marginBottom: 32,
        }}
      >
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <p>
            <strong>
              Cord{"'"}s hosted service (both free and paid versions), and the
              company, is shutting down in August.
            </strong>
          </p>
          <p>
            However, Cord{"'"}s code is becoming open source, and you can freely
            use it in your own infrastructure.
          </p>
          <p>
            Shutting down is sad for us - Cord{"'"}s employees, the clients who
            supported us along the journey, and investors. But we are very happy
            to be supported by our team and our investors in the decision to
            make Cord free for everyone to use. We have worked hard for years to
            make it easy for any developer to add real-time commenting and
            collaboration in their app, and we{"'"}ve built a solution used by
            tens of thousands of people across products and industries - from
            video players to digital whiteboards, collaborative drawing
            applications to finance and BI tools, and many more. We are deeply
            thankful to our customers for their support, feedback, and belief in
            us. We are incredibly proud of what we{"'"}ve accomplished, and
            incredibly grateful to our investors for their trust, support,
            advice - and for pushing for the right ending, where Cord is
            available for everyone to use.
          </p>
          <p>
            If you{"'"}re using Cord now, or want to get collaboration into your
            app, our{' '}
            <a href="https://github.com/getcord/cord-preview">
              Open Source repository
            </a>{' '}
            contains all the details about how to install the backend service,
            and the entire code for the SDK that you can host, package and ship
            with your application.
          </p>
          <p>
            We hope that Cord will continue to benefit people, develop and grow
            in your applications. We can{"'"}t wait to see what you build next.
          </p>
        </div>
      </div>
      <section className={styles.header}>
        <h1 className={styles.pageTitle}>
          {category ? mapCategoryEndpointsToTitles(category) : 'All Posts'}
        </h1>
        {allowDiscussion && (
          <Button behaveAs="a" href={`/newpost?category=${category}`}>
            + Start a discussion
          </Button>
        )}
      </section>
    </>
  );
}
