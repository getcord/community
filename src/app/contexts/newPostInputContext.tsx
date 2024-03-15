"use client";

import { createContext, useMemo, useState } from "react";

type NewPostInputContextProps = {
  setTitle: (title: string) => void;
  title: string;
  setCategory: (category: string) => void;
  category: string;
};
export const NewPostInputContext = createContext<NewPostInputContextProps>({
  setTitle: () => {},
  title: "",
  setCategory: () => {},
  category: "",
});

export function NewPostInputProvider(props: React.PropsWithChildren<unknown>) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");

  const value = useMemo(
    () => ({
      category,
      setCategory,
      title,
      setTitle,
    }),
    [category, title]
  );

  return (
    <NewPostInputContext.Provider value={value}>
      {props.children}
    </NewPostInputContext.Provider>
  );
}
