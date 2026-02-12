"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.api = exports.propagateTeamChanges = exports.onUserCreated = exports.setUserRole = exports.getStandingsByMatchday = exports.recalculateStandings = void 0;
var onMatchWrite_1 = require("./standings/onMatchWrite");
Object.defineProperty(exports, "recalculateStandings", { enumerable: true, get: function () { return onMatchWrite_1.recalculateStandings; } });
var getStandingsByMatchday_1 = require("./standings/getStandingsByMatchday");
Object.defineProperty(exports, "getStandingsByMatchday", { enumerable: true, get: function () { return getStandingsByMatchday_1.getStandingsByMatchday; } });
var setCustomClaims_1 = require("./auth/setCustomClaims");
Object.defineProperty(exports, "setUserRole", { enumerable: true, get: function () { return setCustomClaims_1.setUserRole; } });
var onUserCreated_1 = require("./auth/onUserCreated");
Object.defineProperty(exports, "onUserCreated", { enumerable: true, get: function () { return onUserCreated_1.onUserCreated; } });
var onTeamUpdate_1 = require("./denormalization/onTeamUpdate");
Object.defineProperty(exports, "propagateTeamChanges", { enumerable: true, get: function () { return onTeamUpdate_1.propagateTeamChanges; } });
var handler_1 = require("./api/handler");
Object.defineProperty(exports, "api", { enumerable: true, get: function () { return handler_1.api; } });
//# sourceMappingURL=index.js.map