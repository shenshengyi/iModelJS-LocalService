"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const imodeljs_backend_1 = require("@bentley/imodeljs-backend");
const presentation_backend_1 = require("@bentley/presentation-backend");
const imodeljs_common_1 = require("@bentley/imodeljs-common");
const PresentationRpcInterface_1 = require("@bentley/presentation-common/lib/presentation-common/PresentationRpcInterface");
function getSupportedRpcs() {
    return [
        imodeljs_common_1.IModelReadRpcInterface,
        imodeljs_common_1.IModelTileRpcInterface,
        PresentationRpcInterface_1.PresentationRpcInterface,
        imodeljs_common_1.SnapshotIModelRpcInterface,
    ];
}
exports.getSupportedRpcs = getSupportedRpcs;
(async () => {
    try {
        await imodeljs_backend_1.IModelHost.startup();
        presentation_backend_1.Presentation.initialize();
        let init;
        init = (await Promise.resolve().then(() => require("./web/BackendServer"))).default;
        const rpcs = getSupportedRpcs();
        init(rpcs);
    }
    catch (error) {
        process.exitCode = 1;
    }
})();
//# sourceMappingURL=index.js.map