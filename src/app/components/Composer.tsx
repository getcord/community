'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { ClientMessageData, EntityMetadata } from '@cord-sdk/types';
import { experimental } from '@cord-sdk/react';
import styles from './composer.module.css';
import CategorySelector from '@/app/components/CategorySelector';
import {
  ComposerLayoutProps,
  ComposerProps,
  SendButtonProps,
} from '@cord-sdk/react/dist/mjs/types/experimental';
import { EVERYONE_GROUP_ID, SERVER_HOST } from '@/consts';
import { useRouter } from 'next/navigation';
import { CATEGORIES, Category } from '@/app/types';
import Button from '@/app/ui/Button';
import { slugify } from '@/utils';

// We create a context as it is the easiest way to share data across replaced
// Composer components
type NewPostInputContextProps = {
  setTitle: (title: string) => void;
  title: string;
  setCategories: (categories: Category[]) => void;
  categories: Category[];
  setError: (error: string) => void;
  error: string;
  threadID: string;
  userIsAdmin: boolean;
};

const NewPostInputContext = createContext<NewPostInputContextProps>({
  setTitle: () => {},
  title: '',
  setCategories: (_categories) => {},
  categories: [],
  setError: () => {},
  error: '',
  threadID: '',
  userIsAdmin: false,
});

function NewPostInputProvider(
  props: React.PropsWithChildren<{
    defaultCategory?: Category;
    threadID: string;
    userIsAdmin: boolean;
  }>,
) {
  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState<Category[]>(
    props.defaultCategory ? [props.defaultCategory] : [],
  );
  const [error, setError] = useState('');
  const threadID = props.threadID;
  const userIsAdmin = props.userIsAdmin;

  const value = useMemo(
    () => ({
      title,
      setTitle,
      categories,
      setCategories,
      error,
      setError,
      threadID,
      userIsAdmin,
    }),
    [categories, title, error, threadID, userIsAdmin],
  );

  return (
    <NewPostInputContext.Provider value={value}>
      {props.children}
    </NewPostInputContext.Provider>
  );
}

function CommunityComposer(props: ComposerProps) {
  const router = useRouter();
  const {
    title,
    setTitle,
    categories,
    setCategories,
    setError,
    threadID,
    userIsAdmin,
  } = useContext(NewPostInputContext);

  const onSubmit = useCallback(
    ({ message }: { message: Partial<ClientMessageData> }) => {
      if (!title || !message || !categories.length) {
        setError(`All fields are required and must be filled.`);
        return;
      }
      router.push(`/post/${threadID}/${slugify(title)}`);
      props.onSubmit({ message });
    },
    [title, props, router, categories, setError, threadID],
  );

  return (
    <>
      <h3>Start a new discussion</h3>
      <section className={styles.inputsContainer}>
        <div className={styles.inputContainer}>
          <label htmlFor="categorySelector" className={styles.label}>
            Category:
          </label>
          <CategorySelector
            id="categorySelector"
            categories={CATEGORIES.filter(
              (c) => c !== 'announcements' || userIsAdmin,
            ).map((c) => c)}
            selectedValues={categories}
            onSelectedValuesChange={setCategories}
          />
        </div>
        <div className={styles.inputContainer}>
          <label htmlFor="titleInput" className={styles.label}>
            Title:
          </label>
          <textarea
            className={styles.input}
            id="titleInput"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div className={styles.inputContainer}>
          <label htmlFor="titleInput" className={styles.label}>
            Message:
          </label>
          <experimental.CordComposer
            {...props}
            onSubmit={(message) => {
              onSubmit(message);
            }}
            onKeyDown={({ event }: { event: React.KeyboardEvent }) => {
              if (event.key === 'Enter') {
                return;
              }
              props.onKeyDown({ event });
            }}
            onResetState={() => {
              if (!title || !categories.length) {
                return;
              }
              setTitle('');
              setCategories([]);
              props.onResetState();
            }}
          />
        </div>
      </section>
    </>
  );
}

function CommunityComposerLayout(props: ComposerLayoutProps) {
  const { error } = useContext(NewPostInputContext);
  const sendButton = props.toolbarItems?.find(
    (item) => item.name === 'sendButton',
  );

  return (
    <>
      <experimental.ComposerLayout
        toolbarItems={props.toolbarItems?.filter(
          (item) => item.name !== 'sendButton',
        )}
        textEditor={props.textEditor}
      ></experimental.ComposerLayout>
      <span className={styles.error}>{error}</span>
      {sendButton?.element}
    </>
  );
}

function CommunitySendButton(props: SendButtonProps) {
  return (
    <Button
      behaveAs={'button'}
      onClick={props.onClick}
      style={{ justifySelf: 'end' }}
    >
      Submit
    </Button>
  );
}

function ComposerImpl() {
  const { title, categories, threadID } = useContext(NewPostInputContext);
  const metadata: EntityMetadata = { pinned: false };
  categories.forEach((category) => (metadata[category] = true));

  return (
    <div className={styles.container}>
      <experimental.Replace
        replace={{
          ComposerLayout: CommunityComposerLayout,
          Composer: CommunityComposer,
          SendButton: CommunitySendButton,
        }}
      >
        <experimental.SendComposer
          createThread={{
            groupID: EVERYONE_GROUP_ID,
            location: { page: 'posts' },
            name: title,
            metadata,
            url: `/post/${threadID}/${slugify(title)}`,
          }}
          threadId={threadID}
        />
      </experimental.Replace>
    </div>
  );
}

export default function Composer({
  defaultCategory,
  threadID,
  userIsAdmin,
}: {
  defaultCategory?: Category;
  threadID: string;
  userIsAdmin: boolean;
}) {
  return (
    <NewPostInputProvider
      defaultCategory={
        defaultCategory !== 'announcements' || userIsAdmin
          ? defaultCategory
          : undefined
      }
      threadID={threadID}
      userIsAdmin={userIsAdmin}
    >
      <ComposerImpl />
    </NewPostInputProvider>
  );
}
