import Composer from '@/app/components/Composer';
import { NewPostInputProvider } from '@/app/contexts/newPostInputContext';

export default function NewPost() {
  return (
    <NewPostInputProvider>
      <Composer />
    </NewPostInputProvider>
  );
}
