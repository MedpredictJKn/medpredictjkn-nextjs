'use client';

export function setAuthCookie(token: string) {
  // Set secure cookie with httpOnly flag via API
  fetch('/api/auth/set-cookie', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token }),
  }).catch(err => console.error('Failed to set auth cookie:', err));
}

export function getAuthToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export function clearAuth() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  // Clear cookie via API
  fetch('/api/auth/clear-cookie', { method: 'POST' }).catch(err =>
    console.error('Failed to clear auth cookie:', err)
  );
}

export function setUserData(user: any) {
  if (typeof window === 'undefined') return;
  localStorage.setItem('user', JSON.stringify(user));
}

export function getUserData() {
  if (typeof window === 'undefined') return null;
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}
