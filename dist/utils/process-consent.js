"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.processConsent = void 0;
const models_1 = require("../models");
const oauth2_nodejs_1 = require("oauth2-nodejs");
const data_1 = require("../data");
const utils_1 = require("../utils");
exports.processConsent = (resp, { action, authToken, userId, }, options = { redirect: true }) => __awaiter(void 0, void 0, void 0, function* () {
    const requestMap = new models_1.RequestMap();
    requestMap.setParameter("user_id", userId);
    requestMap.setParameter("state", authToken["state"]);
    requestMap.setParameter("client_id", authToken["client_id"]);
    requestMap.setParameter("redirect_uri", authToken["redirect_uri"]);
    requestMap.setParameter("response_type", authToken["response_type"]);
    requestMap.setParameter("scope", authToken["scope"]);
    const authorizationEndpoint = new oauth2_nodejs_1.AuthorizationEndpoint();
    authorizationEndpoint.dataHandlerFactory = new data_1.CloudFirestoreDataHandlerFactory();
    authorizationEndpoint.allowedResponseTypes = ["code", "token"];
    const authenticationResult = action === "allow"
        ? yield authorizationEndpoint.allow(requestMap)
        : yield authorizationEndpoint.deny(requestMap);
    if (options.redirect) {
        return utils_1.Navigation.backTo(resp, authenticationResult, authToken["redirect_uri"]);
    }
    else {
        const response = authenticationResult.value;
        return {
            url: utils_1.Navigation.buildUrl(authToken["redirect_uri"], response.query, response.fragment),
        };
    }
});
//# sourceMappingURL=process-consent.js.map