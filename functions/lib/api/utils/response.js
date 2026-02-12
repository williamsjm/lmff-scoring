"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendSuccess = sendSuccess;
function sendSuccess(res, data, statusCode = 200) {
    res.status(statusCode).json(data);
}
//# sourceMappingURL=response.js.map