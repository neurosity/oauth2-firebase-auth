import * as functions from "firebase-functions";
export declare function googleAccountAuthentication(): functions.HttpsFunction;
export declare function facebookAccountAuthentication(): functions.HttpsFunction;
export declare function githubAccountAuthentication(): functions.HttpsFunction;
export declare function customAuthentication(authenticationUrl: string): functions.HttpsFunction;
