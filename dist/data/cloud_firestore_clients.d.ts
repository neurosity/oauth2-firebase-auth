export declare class Client {
    private _clientId;
    private _providerName;
    private _scopes;
    private _responseTypes;
    private _grantTypes;
    private _userId;
    private _clientSecret;
    private _implicitConsent;
    private _browserRedirect;
    get clientId(): string;
    set clientId(value: string);
    get providerName(): string;
    set providerName(value: string);
    get scopes(): string[];
    set scopes(value: string[]);
    get responseTypes(): string[];
    set responseTypes(value: string[]);
    get grantTypes(): string[];
    set grantTypes(value: string[]);
    get userId(): string;
    set userId(value: string);
    get clientSecret(): string;
    set clientSecret(value: string);
    get implicitConsent(): boolean;
    set implicitConsent(value: boolean);
    get browserRedirect(): boolean;
    set browserRedirect(value: boolean);
}
export declare class CloudFirestoreClients {
    static fetch(clientId: string): Promise<Client | undefined>;
}
