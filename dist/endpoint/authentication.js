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
exports.customAuthentication = exports.githubAccountAuthentication = exports.facebookAccountAuthentication = exports.googleAccountAuthentication = void 0;
const functions = require("firebase-functions");
const admin = require("firebase-admin");
const express = require("express");
const cors = require("cors");
const path = require("path");
const qs = require("qs");
const models_1 = require("../models");
const utils_1 = require("../utils");
const data_1 = require("../data");
class AuthenticationApp {
    static create(providerName, authenticationUrl) {
        const authenticationApp = express();
        authenticationApp.use(cors({ origin: true }));
        authenticationApp.set("views", path.join(__dirname, "../../views"));
        authenticationApp.get("/", (req, resp) => {
            const request = new models_1.RequestWrapper(req);
            const authToken = request.getParameter("auth_token");
            const payload = {
                authToken,
            };
            if (authenticationUrl) {
                const strippedUrl = authenticationUrl.split("?")[0];
                const urlWithPayload = `${strippedUrl}?${qs.stringify(payload)}`;
                resp.redirect(urlWithPayload);
            }
            else {
                resp.render("authentication.ejs", Object.assign(Object.assign({}, payload), { projectId: process.env.GCLOUD_PROJECT, projectApiKey: utils_1.Configuration.instance.project_apikey, providerName: providerName }));
            }
        });
        authenticationApp.post("/", (req, resp) => __awaiter(this, void 0, void 0, function* () {
            const request = new models_1.RequestWrapper(req);
            const encryptedAuthToken = request.getParameter("auth_token");
            const idTokenString = request.getParameter("id_token");
            const success = request.getParameter("success");
            const error = request.getParameter("error");
            const authToken = JSON.parse(utils_1.Crypto.decrypt(request.getParameter("auth_token")));
            if (success === "true") {
                try {
                    const idToken = yield admin.auth().verifyIdToken(idTokenString);
                    if (idToken.aud === process.env.GCLOUD_PROJECT) {
                        // Check for implicit consent
                        const client = yield data_1.CloudFirestoreClients.fetch(authToken["client_id"]);
                        // Call here to prevent unnecessary redirect to /consent
                        if (client === null || client === void 0 ? void 0 : client.implicitConsent) {
                            const payload = yield utils_1.processConsent(resp, {
                                action: "allow",
                                authToken,
                                userId: idToken.sub,
                            }, { redirect: !(client === null || client === void 0 ? void 0 : client.browserRedirect) });
                            // If we're here, then we're relying on browser to carry out redirect to prevent hitting CORS
                            return resp.json(payload);
                        }
                        else {
                            const encryptedUserId = utils_1.Crypto.encrypt(idToken.sub);
                            utils_1.Navigation.redirect(resp, "/authorize/consent", {
                                auth_token: encryptedAuthToken,
                                user_id: encryptedUserId,
                            });
                        }
                    }
                }
                catch (e) {
                    console.log("e", e);
                }
            }
            else {
                console.log("error", error);
            }
            utils_1.Navigation.redirect(resp, authToken["redirect_uri"], {
                error: "access_denied",
            });
            return;
        }));
        return authenticationApp;
    }
}
function googleAccountAuthentication() {
    return functions.https.onRequest(AuthenticationApp.create("Google"));
}
exports.googleAccountAuthentication = googleAccountAuthentication;
function facebookAccountAuthentication() {
    return functions.https.onRequest(AuthenticationApp.create("Facebook"));
}
exports.facebookAccountAuthentication = facebookAccountAuthentication;
function githubAccountAuthentication() {
    return functions.https.onRequest(AuthenticationApp.create("Github"));
}
exports.githubAccountAuthentication = githubAccountAuthentication;
function customAuthentication(authenticationUrl) {
    return functions.https.onRequest(AuthenticationApp.create("Custom", authenticationUrl));
}
exports.customAuthentication = customAuthentication;
//# sourceMappingURL=authentication.js.map