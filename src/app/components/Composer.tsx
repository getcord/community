'use client';

import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';
import type { ClientMessageData, EntityMetadata } from '@cord-sdk/types';
import { betaV2 } from '@cord-sdk/react';
import styles from './composer.module.css';
import CategorySelector from '@/app/components/CategorySelector';
import { EVERYONE_GROUP_ID, SERVER_HOST } from '@/consts';
import { useRouter } from 'next/navigation';
import { CATEGORIES, Category } from '@/app/types';
import Button from '@/app/ui/Button';
import { slugify } from '@/utils';
import { Label } from '@/app/ui/Input';
import CommunityTextEditor from '@/app/components/replacements/CommunityTextEditor';

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
  pinned: boolean;
  setPinned: (pinned: boolean) => void;
  locked: boolean;
  setLocked: (locked: boolean) => void;
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
  pinned: false,
  setPinned: () => {},
  locked: false,
  setLocked: () => {},
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
  const [pinned, setPinned] = useState(false);
  const [locked, setLocked] = useState(false);

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
      pinned,
      setPinned,
      locked,
      setLocked,
    }),
    [
      categories,
      title,
      error,
      threadID,
      userIsAdmin,
      pinned,
      setPinned,
      locked,
      setLocked,
    ],
  );

  return (
    <NewPostInputContext.Provider value={value}>
      {props.children}
    </NewPostInputContext.Provider>
  );
}

const CommunityComposer = forwardRef(function CommunityComposer(
  props: betaV2.ComposerProps,
  ref: React.ForwardedRef<HTMLElement>,
) {
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
      <h3>New post</h3>
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
          <input
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
          <betaV2.Composer
            {...props}
            ref={ref}
            onSubmit={async (message) => {
              onSubmit(message);
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
});

const CommunityComposerLayout = forwardRef(function CommunityComposerLayout(
  props: betaV2.ComposerLayoutProps,
  ref: React.ForwardedRef<HTMLElement>,
) {
  const { error, userIsAdmin, pinned, setPinned, locked, setLocked } =
    useContext(NewPostInputContext);
  const sendButton = props.toolbarItems?.find(
    (item) => item.name === 'sendButton',
  );

  return (
    <>
      <betaV2.ComposerLayout
        ref={ref}
        {...props}
        toolbarItems={props.toolbarItems?.filter(
          (item) => item.name !== 'sendButton',
        )}
      ></betaV2.ComposerLayout>
      <span className={styles.error}>{error}</span>
      {userIsAdmin && (
        <div className={styles.toggleContainer}>
          <Label htmlFor="pinned">Pinned</Label>
          <input
            type="checkbox"
            id="pinned"
            checked={pinned}
            onChange={() => setPinned(!pinned)}
            aria-label="Toggle pinned messages"
          />
          <Label htmlFor="locked">Locked</Label>
          <input
            type="checkbox"
            id="locked"
            checked={locked}
            onChange={() => setLocked(!locked)}
            aria-label="Toggle pinned messages"
          />
        </div>
      )}
      {sendButton?.element}
    </>
  );
});

function CommunitySendButton(props: betaV2.SendButtonProps) {
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
  const { title, categories, threadID, pinned, locked } =
    useContext(NewPostInputContext);
  const metadata: EntityMetadata = { pinned, locked };
  categories.forEach((category) => (metadata[category] = true));

  return (
    <div className={styles.container}>
      <betaV2.Replace
        replace={{
          ComposerLayout: CommunityComposerLayout,
          Composer: CommunityComposer,
          SendButton: CommunitySendButton,
          TextEditor: CommunityTextEditor,
        }}
      >
        <betaV2.SendComposer
          createThread={{
            groupID: EVERYONE_GROUP_ID,
            location: { page: 'posts' },
            name: title,
            metadata,
            url: `${SERVER_HOST}/post/${threadID}/${slugify(title)}`,
          }}
          threadID={threadID}
        />
      </betaV2.Replace>
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
