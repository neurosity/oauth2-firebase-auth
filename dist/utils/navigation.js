"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Navigation = void 0;
const url = require("url");
const querystring = require("querystring");
class Navigation {
    static buildUrl(uri, parameters, fragments) {
        const targetUrl = url.parse(uri, true);
        if (parameters) {
            const query = targetUrl.query;
            Object.keys(parameters).forEach((key) => {
                const value = parameters[key];
                query[key] = typeof value === "string" ? value : String(value);
            });
        }
        if (fragments) {
            targetUrl.hash = `#${querystring.stringify(fragments)}`;
        }
        return url.format(targetUrl);
    }
    static redirect(resp, uri, parameters, fragments) {
        const targetUrl = this.buildUrl(uri, parameters, fragments);
        resp.redirect(targetUrl);
    }
    static backTo(resp, result, redirectUri) {
        if (result.isSuccess()) {
            const response = result.value;
            this.redirect(resp, redirectUri, response.query, response.fragment);
        }
        else {
            this.redirect(resp, redirectUri, { error: result.error.getType() }, {});
        }
    }
    static sendError(resp, error) {
        resp.set("Content-Type", "application/json; charset=UTF-8");
        resp.status(error.code).send(error.toJson());
    }
}
exports.Navigation = Navigation;
//# sourceMappingURL=navigation.js.map