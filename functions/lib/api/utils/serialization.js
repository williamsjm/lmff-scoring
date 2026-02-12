"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.serializeDoc = serializeDoc;
exports.toTimestamp = toTimestamp;
const admin_1 = require("../../admin");
function isTimestamp(value) {
    return (value !== null &&
        typeof value === 'object' &&
        'toDate' in value &&
        typeof value.toDate === 'function');
}
function serializeDoc(data) {
    const result = {};
    for (const [key, value] of Object.entries(data)) {
        if (isTimestamp(value)) {
            result[key] = value.toDate().toISOString();
        }
        else if (Array.isArray(value)) {
            result[key] = value.map((item) => typeof item === 'object' && item !== null ? serializeDoc(item) : item);
        }
        else if (value !== null && typeof value === 'object') {
            result[key] = serializeDoc(value);
        }
        else {
            result[key] = value;
        }
    }
    return result;
}
function toTimestamp(isoString) {
    return admin_1.admin.firestore.Timestamp.fromDate(new Date(isoString));
}
//# sourceMappingURL=serialization.js.map