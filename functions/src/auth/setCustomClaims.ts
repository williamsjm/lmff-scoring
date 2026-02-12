import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { admin } from '../admin';

export const setUserRole = onCall(async (request) => {
  if (!request.auth?.token?.role ||
      (request.auth.token.role !== 'admin' && request.auth.token.role !== 'super_admin')) {
    throw new HttpsError('permission-denied', 'Only admins can set user roles');
  }

  const { uid, role, leagueId } = request.data;

  if (!uid || !role) {
    throw new HttpsError('invalid-argument', 'uid and role are required');
  }

  const validRoles = ['admin', 'captain', 'player'];
  if (!validRoles.includes(role)) {
    throw new HttpsError('invalid-argument', `Invalid role: ${role}`);
  }

  await admin.auth().setCustomUserClaims(uid, { role, leagueId: leagueId || null });

  await admin.firestore().doc(`users/${uid}`).update({
    role,
    leagueId: leagueId || null,
    updatedAt: admin.firestore.FieldValue.serverTimestamp(),
  });

  return { success: true };
});
