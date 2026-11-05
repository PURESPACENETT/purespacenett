export function buildAuthClaims(user: { id: string; email?: string | null }) {
  return {
    sub: user.id,
    ...(user.email ? { email: user.email } : {}),
  };
}
