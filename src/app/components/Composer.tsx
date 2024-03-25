'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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
import { EVERYONE_GROUP_ID } from '@/consts';
import { useRouter } from 'next/navigation';
import { CATEGORIES, Category } from '@/app/types';
import Button from '@/app/ui/Button';

// We create a context as it is the easiest way to share data across replaced
// Composer components
type NewPostInputContextProps = {
  setTitle: (title: string) => void;
  title: string;
  setCategories: (categories: Category[]) => void;
  categories: Category[];
};

const NewPostInputContext = createContext<NewPostInputContextProps>({
  setTitle: () => {},
  title: '',
  setCategories: (_categories) => {},
  categories: [],
});

function NewPostInputProvider(
  props: React.PropsWithChildren<{ defaultCategory?: Category }>,
) {
  const [title, setTitle] = useState('');
  const [categories, setCategories] = useState<Category[]>(
    props.defaultCategory ? [props.defaultCategory] : [],
  );

  const value = useMemo(
    () => ({
      title,
      setTitle,
      categories,
      setCategories,
    }),
    [categories, title],
  );

  return (
    <NewPostInputContext.Provider value={value}>
      {props.children}
    </NewPostInputContext.Provider>
  );
}

function CommunityComposer(props: ComposerProps) {
  const router = useRouter();
  const { title, setTitle, categories, setCategories } =
    useContext(NewPostInputContext);

  const onSubmit = useCallback(
    ({ message }: { message: Partial<ClientMessageData> }) => {
      if (!title || !message) {
        return;
      }
      router.push('/');
      props.onSubmit({ message });
    },
    [title, props, router],
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
            categories={CATEGORIES.map((c) => c)}
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
              if (!title) {
                return;
              }
              setTitle('');
              props.onResetState();
            }}
          />
        </div>
      </section>
    </>
  );
}

function CommunityComposerLayout(props: ComposerLayoutProps) {
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

      {sendButton?.element}
    </>
  );
}

function CommunitySendButton(props: SendButtonProps) {
  return (
    <Button
      displayAs={'button'}
      onClick={props.onClick}
      style={{ justifySelf: 'end' }}
    >
      Submit
    </Button>
  );
}

function ComposerImpl() {
  const { title, categories } = useContext(NewPostInputContext);
  const metadata: EntityMetadata = { pinned: false };
  categories.forEach((category) => (metadata[category] = true));
  const [threadUrl, setThreadUrl] = useState('');

  useEffect(() => {
    // we can access window here as this useEffect will run client-side
    setThreadUrl(window.location.href);
  }, []);

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
            url: threadUrl,
          }}
        />
      </experimental.Replace>
    </div>
  );
}

export default function Composer({
  defaultCategory,
}: {
  defaultCategory?: Category;
}) {
  return (
    <NewPostInputProvider defaultCategory={defaultCategory}>
      <ComposerImpl />
    </NewPostInputProvider>
  );
}
