export type AccessTokens = {
    siteCode: string;
    apiKey: string;
    pcDeviceCode: string;
    secretKey: string;
};

export type AKaartUserRecord = {
    cheques: Array<{
        chequeId: number
    }>
}

export const gatewayUrl = "";

export const debugConfig: AccessTokens = {
    apiKey: "",
    siteCode: "",
    secretKey: "",
    pcDeviceCode: ""
};


export const generateHeadersFromAccessTokens = ({
    siteCode,
    apiKey,
    pcDeviceCode,
    secretKey
}: AccessTokens) => ({
    "site-code": siteCode,
    apikey: apiKey,
    "pc-device-code": pcDeviceCode,
    "secret-key": secretKey
});
