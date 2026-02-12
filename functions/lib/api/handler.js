"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = void 0;
const https_1 = require("firebase-functions/v2/https");
const app_1 = require("./app");
const app = (0, app_1.createApp)();
exports.api = (0, https_1.onRequest)({ region: 'us-central1', minInstances: 0 }, app);
//# sourceMappingURL=handler.js.map