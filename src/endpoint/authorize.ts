import * as functions from "firebase-functions";
import * as express from "express";
import * as ejs from "ejs";
import * as cors from "cors";
import { RequestWrapper } from "../models";
import { AuthorizationEndpoint } from "oauth2-nodejs";
import {
  CloudFirestoreDataHandlerFactory,
  CloudFirestoreScopes,
  CloudFirestoreClients,
} from "../data";
import { Configuration, Crypto, Navigation, processConsent } from "../utils";

const authorizeApp = express();

authorizeApp.use(cors({ origin: true }));

authorizeApp.get("/entry", async (req, resp) => {
  const request = new RequestWrapper(req);
  const authorizationEndpoint = new AuthorizationEndpoint();

  authorizationEndpoint.dataHandlerFactory =
    new CloudFirestoreDataHandlerFactory();
  authorizationEndpoint.allowedResponseTypes = ["code", "token"];

  try {
    const authorizationEndpointResponse =
      await authorizationEndpoint.handleRequest(request);

    if (authorizationEndpointResponse.isSuccess()) {
      const redirect = request.getParameter("redirect") ?? "true";
      const authToken: { [key: string]: string | number } = {
        client_id: request.getParameter("client_id")!,
        redirect_uri: request.getParameter("redirect_uri")!,
        response_type: request.getParameter("response_type")!,
        scope: request.getParameter("scope")!,
        created_at: Date.now(),
      };

      const state = request.getParameter("state");

      if (state) {
        authToken["state"] = state;
      }

      const authTokenString = Crypto.encrypt(JSON.stringify(authToken));

      const url = Navigation.buildUrl("/authentication/", {
        auth_token: authTokenString,
      });

      if (redirect === "false") {
        resp.status(200).json({ ok: true, url });
        return;
      }

      Navigation.redirect(resp, "/authentication/", {
        auth_token: authTokenString,
      });
    } else {
      const error = authorizationEndpointResponse.error;
      resp.status(error.code).json(error.toJson());
    }
  } catch (e) {
    console.error(e);

    resp.status(500).send(e.toString());
  }
});

authorizeApp.get("/consent", async (req, resp) => {
  const request = new RequestWrapper(req);
  const responseType = request.getParameter("response_type") ?? "page";
  const encryptedAuthToken = request.getParameter("auth_token")!;
  const authToken = JSON.parse(Crypto.decrypt(encryptedAuthToken));
  const client = await CloudFirestoreClients.fetch(authToken["client_id"]);
  const encryptedUserId = request.getParameter("user_id")!;
  const scopes = await CloudFirestoreScopes.fetch();
  const consentViewTemplate = Configuration.instance.view_consent_template;

  const payload = {
    scope: authToken["scope"],
    encryptedAuthToken,
    encryptedUserId,
    scopes,
    providerName: client!["providerName"],
  };

  if (responseType === "raw") {
    resp.status(200).json(payload);
    return;
  }

  try {
    const template = await consentViewTemplate.provide();
    const html = ejs.render(template, payload);

    resp.status(200).send(html);
  } catch (e) {
    console.error(e);
    resp.status(500).send(e.toString());
  }
});

authorizeApp.post("/consent", async (req, resp) => {
  const requestWrapper = new RequestWrapper(req);
  const redirect = requestWrapper.getParameter("redirect") ?? "true";
  const encryptedAuthToken = requestWrapper.getParameter("auth_token")!;
  const authToken = JSON.parse(Crypto.decrypt(encryptedAuthToken));
  const encryptedUserId = requestWrapper.getParameter("user_id")!;
  const userId = Crypto.decrypt(encryptedUserId);
  const action = requestWrapper.getParameter("action");

  const payload = processConsent(
    resp,
    {
      action,
      authToken,
      userId,
    },
    { redirect: redirect === "true" }
  );

  resp.status(200).json(payload);
});

export function authorize() {
  return functions.https.onRequest(authorizeApp);
}
