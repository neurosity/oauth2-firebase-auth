import * as express from "express";
import { RequestMap } from "../models";
import { AuthorizationEndpoint } from "oauth2-nodejs";
import { CloudFirestoreDataHandlerFactory } from "../data";
import { Navigation } from "../utils";

export const processConsent = async (
  resp: express.Response,
  {
    action,
    authToken,
    userId,
  }: { action?: string; authToken: any; userId: string }
) => {
  const requestMap = new RequestMap();

  requestMap.setParameter("user_id", userId);
  requestMap.setParameter("state", authToken["state"]);
  requestMap.setParameter("client_id", authToken["client_id"]);
  requestMap.setParameter("redirect_uri", authToken["redirect_uri"]);
  requestMap.setParameter("response_type", authToken["response_type"]);
  requestMap.setParameter("scope", authToken["scope"]);

  const authorizationEndpoint = new AuthorizationEndpoint();

  authorizationEndpoint.dataHandlerFactory = new CloudFirestoreDataHandlerFactory();
  authorizationEndpoint.allowedResponseTypes = ["code", "token"];

  if (action === "allow") {
    Navigation.backTo(
      resp,
      await authorizationEndpoint.allow(requestMap),
      authToken["redirect_uri"]
    );
  } else {
    Navigation.backTo(
      resp,
      await authorizationEndpoint.deny(requestMap),
      authToken["redirect_uri"]
    );
  }
};
