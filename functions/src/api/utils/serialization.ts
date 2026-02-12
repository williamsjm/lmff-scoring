import { admin } from '../../admin';

type FirestoreTimestamp = admin.firestore.Timestamp;

function isTimestamp(value: unknown): value is FirestoreTimestamp {
  return (
    value !== null &&
    typeof value === 'object' &&
    'toDate' in value &&
    typeof (value as FirestoreTimestamp).toDate === 'function'
  );
}

export function serializeDoc(data: Record<string, unknown>): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (isTimestamp(value)) {
      result[key] = value.toDate().toISOString();
    } else if (Array.isArray(value)) {
      result[key] = value.map((item) =>
        typeof item === 'object' && item !== null ? serializeDoc(item as Record<string, unknown>) : item
      );
    } else if (value !== null && typeof value === 'object') {
      result[key] = serializeDoc(value as Record<string, unknown>);
    } else {
      result[key] = value;
    }
  }
  return result;
}

export function toTimestamp(isoString: string): admin.firestore.Timestamp {
  return admin.firestore.Timestamp.fromDate(new Date(isoString));
}
