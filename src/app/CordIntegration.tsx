"use client";

import { CordProvider } from "@cord-sdk/react";

type Props = {
  clientAuthToken: string | null;
};
const CordIntegration = ({
  clientAuthToken,
  children,
}: React.PropsWithChildren<Props>) => {
  return (
    <div>
      {clientAuthToken ? (
        <CordProvider clientAuthToken={clientAuthToken}>
          {children}
        </CordProvider>
        
      ): <p>something went wrong</p>}
    </div>
  );
};

export default CordIntegration;
