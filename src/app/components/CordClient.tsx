'use client';
import { betaV2 } from '@cord-sdk/react';
import { UserDataContextType } from '@cord-sdk/react/dist/mjs/types/experimental/hooks/useComponentUserData';

export const CordTimestamp = betaV2.Timestamp;
export const CordAvatar = betaV2.Avatar;
export const CordMessageContent = betaV2.MessageContent;

export function CordUserDataProvider({
  value,
  children,
}: React.PropsWithChildren<{ value: UserDataContextType }>) {
  return (
    <betaV2.UserDataContext.Provider value={value}>
      {children}
    </betaV2.UserDataContext.Provider>
  );
}
