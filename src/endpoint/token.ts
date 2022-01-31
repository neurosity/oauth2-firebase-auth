import * as functions from "firebase-functions";
import {
  DefaultClientCredentialFetcherProvider,
  TokenEndpoint,
} from "oauth2-nodejs";
import * as cors from "cors";

import { RequestWrapper } from "../models";
import { CustomGrantHandlerProvider } from "../granttype";
import { CloudFirestoreDataHandlerFactory } from "../data";

const corsHandler = cors({ origin: true });

export function token() {
  return functions.https.onRequest(async (req, resp) => {
    corsHandler(req, resp, async () => {
      if (req.method === "POST") {
        const request = new RequestWrapper(req);
        const tokenEndpoint = new TokenEndpoint();
        const clientCredentialFetcherProvider =
          new DefaultClientCredentialFetcherProvider();

        tokenEndpoint.grantHandlerProvider = new CustomGrantHandlerProvider(
          clientCredentialFetcherProvider
        );
        tokenEndpoint.clientCredentialFetcherProvider =
          clientCredentialFetcherProvider;
        tokenEndpoint.dataHandlerFactory =
          new CloudFirestoreDataHandlerFactory();

        try {
          const tokenEndpointResponse = await tokenEndpoint.handleRequest(
            request
          );

          resp
            .status(tokenEndpointResponse.code)
            .json(tokenEndpointResponse.body);
        } catch (e) {
          console.error(e);
          resp.status(500).send(e.toString());
        }
      } else {
        resp.status(405).send("Method not allowed");
      }
    });
  });
}
