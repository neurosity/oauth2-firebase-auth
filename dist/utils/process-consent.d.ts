import * as express from "express";
export declare const processConsent: (resp: express.Response, { action, authToken, userId, }: {
    action?: string | undefined;
    authToken: any;
    userId: string;
}) => Promise<void>;
