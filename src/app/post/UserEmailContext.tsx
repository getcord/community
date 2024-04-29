import { createContext, useCallback, useMemo, useState } from 'react';

type UserEmailContextType = {
  userEmails: Record<string, string>;
  fetchUserEmail: (userID: string) => Promise<void>;
};

export const UserEmailContext = createContext<UserEmailContextType>({
  userEmails: {},
  fetchUserEmail: async () => {},
});

export function UserEmailProvider({ children }: { children: React.ReactNode }) {
  const [userEmails, setUserEmails] = useState<Record<string, string>>({});

  const fetchUserEmail = useCallback(async (userID: string) => {
    const r = await fetch(`/api/user?userID=${userID}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    const response = await r.json();

    if (response.email) {
      setUserEmails((prev) => {
        return { ...prev, [userID]: response.email };
      });
    }
  }, []);

  const contextValue = useMemo(() => {
    return { fetchUserEmail, userEmails };
  }, [fetchUserEmail, userEmails]);

  return (
    <UserEmailContext.Provider value={contextValue}>
      {children}
    </UserEmailContext.Provider>
  );
}
