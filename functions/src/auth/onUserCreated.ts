import { beforeUserCreated } from 'firebase-functions/v2/identity';
import { admin, db } from '../admin';

export const onUserCreated = beforeUserCreated(async (event) => {
  const user = event.data;

  await db.doc(`users/${user.uid}`).set({
    email: user.email || '',
    displayName: user.displayName || user.email?.split('@')[0] || '',
    role: 'player',
    leagueId: null,
    teamId: null,
    playerId: null,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    lastLogin: admin.firestore.FieldValue.serverTimestamp(),
  });
});
