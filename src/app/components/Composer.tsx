import { ComponentProps } from 'react';
import { Composer as CordComposer } from "@cord-sdk/react";
import styles from './composer.module.css';

interface Props extends ComponentProps<typeof CordComposer> {
  type: 'NO_PERMISSION' | 'ENABLED' // in future 'CORD_ONLY' ? 
} 

export default function Composer(props: Props) {
  if (props.type === 'NO_PERMISSION') {
    return <div className={styles.noPermission}>
      You do not have permission to send messages in this channel.
    </div>
  }
  return <div>
    <CordComposer style={{ width: '100%', display: 'block'}}  {...props} />
  </div>
}