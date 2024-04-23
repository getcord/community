import { useCallback } from 'react';
import { betaV2 } from '@cord-sdk/react';

// This TextEditor replaces the default TextEditor in Cord for Community.
// The only thing it does differently is allow for Enter to not submit the
// message but instead to enter a new line in the editor.  Use anywhere you
// want this behavior

export default function CommunityTextEditor(props: betaV2.TextEditorProps) {
  const onKeyDown = useCallback(
    ({ event }: { event: React.KeyboardEvent }) => {
      // Override Enter to not be a submit by treating it as if the user were
      // holding down the shift key
      // This will cause us to not send by default on Enter and require users
      // to hit the submit button
      if (event.key === 'Enter') {
        event.shiftKey = true;
      }
      props.onKeyDown({ event });
    },
    [props],
  );
  return (
    <betaV2.TextEditor {...props} onKeyDown={onKeyDown}></betaV2.TextEditor>
  );
}
