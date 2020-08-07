"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_server_1 = require("@bentley/express-server");
const imodeljs_common_1 = require("@bentley/imodeljs-common");
async function initialize(rpcs) {
    const rpcConfig = imodeljs_common_1.BentleyCloudRpcManager.initializeImpl({ info: { title: "ninezone-sample-app", version: "v1.0" } }, rpcs);
    const port = Number(process.env.PORT || 3001);
    const server = new express_server_1.IModelJsExpressServer(rpcConfig.protocol);
    await server.initialize(port);
}
exports.default = initialize;
//# sourceMappingURL=BackendServer.js.map