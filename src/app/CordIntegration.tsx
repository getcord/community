'use client';

import { CordProvider } from '@cord-sdk/react';

type Props = {
  clientAuthToken: string | null;
};
const CordIntegration = ({
  clientAuthToken,
  children,
}: React.PropsWithChildren<Props>) => {
  return (
    <div>
        <CordProvider clientAuthToken={clientAuthToken}>
          {children}
        </CordProvider>
    </div>
  );
};

export default CordIntegration;
