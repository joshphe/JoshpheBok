'use client';

import { useState, useEffect } from 'react';

const AUTH_KEY = 'mybok_auth';

export type Role = 'guest' | 'blogger' | 'loading';

function readRole(): Role {
  if (typeof window === 'undefined') return 'loading';
  const saved = sessionStorage.getItem(AUTH_KEY);
  if (saved === 'blogger') return 'blogger';
  if (saved === 'guest') return 'guest';
  return 'loading';
}

export function getRole(): Role {
  return readRole();
}

export function useRole(): Role {
  const [role, setRole] = useState<Role>(readRole);

  useEffect(() => {
    setRole(readRole());
  }, []);

  return role;
}
