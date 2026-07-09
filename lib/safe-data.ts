import type { Couple, Settings, User } from "@prisma/client";

export type SafeUser = Omit<User, "passwordHash">;
export type SafeCouple = Omit<Couple, "codeHash"> & { users: SafeUser[]; settings: Settings | null };

export function safeUser(user: User): SafeUser {
  const { passwordHash: _passwordHash, ...safe } = user;
  return safe;
}

export function safeCouple(couple: Couple & { users: User[]; settings: Settings | null }): SafeCouple {
  const { codeHash: _codeHash, users, ...rest } = couple;
  return { ...rest, users: users.map(safeUser), settings: couple.settings };
}
