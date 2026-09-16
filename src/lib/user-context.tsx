"use client";

import { createContext, useContext, ReactNode } from "react";
import type { Role } from "@/lib/roles";

type CurrentUser = {
  id: string;
  name: string;
  email: string;
  role: Role;
};

const UserContext = createContext<CurrentUser | null>(null);

export function UserProvider({
  user,
  children,
}: {
  user: CurrentUser;
  children: ReactNode;
}) {
  return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
}

export function useCurrentUser() {
  const user = useContext(UserContext);
  if (!user) {
    throw new Error("useCurrentUser debe usarse dentro de UserProvider");
  }
  return user;
}
