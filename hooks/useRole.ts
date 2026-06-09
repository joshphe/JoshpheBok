'use client';

import { useState, useEffect } from 'react';

const AUTH_KEY = 'mybok_auth';

export type Role = 'guest' | 'blogger' | 'loading';

let _cached: Role = 'loading';

export function getRole(): Role {
  if (_cached !== 'loading') return _cached;
  if (typeof window === 'undefined') return 'loading';
  const saved = sessionStorage.getItem(AUTH_KEY);
  _cached = saved === 'blogger' ? 'blogger' : saved === 'guest' ? 'guest' : 'loading';
  return _cached;
}

export function useRole(): Role {
  const [role, setRole] = useState<Role>(getRole);

  useEffect(() => {
    const saved = sessionStorage.getItem(AUTH_KEY);
    const r: Role = saved === 'blogger' ? 'blogger' : saved === 'guest' ? 'guest' : 'loading';
    setRole(r);
    _cached = r;
  }, []);

  return role;
}
