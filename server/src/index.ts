/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { app as electron } from "electron";
import { Logger, LogLevel } from "@bentley/bentleyjs-core";
import { IModelHost } from "@bentley/imodeljs-backend";
import { Presentation } from "@bentley/presentation-backend";
import {
  IModelTileRpcInterface,
  RpcInterfaceDefinition,
  IModelReadRpcInterface,
  SnapshotIModelRpcInterface,
} from "@bentley/imodeljs-common";

// import { getSupportedRpcs } from "../common/rpcs";
// import { AppLoggerCategory } from "../common/LoggerCategory";
import { PresentationRpcInterface } from "@bentley/presentation-common/lib/presentation-common/PresentationRpcInterface";

// Setup logging immediately to pick up any logging during IModelHost.startup()
// Logger.initializeToConsole();
// Logger.setLevelDefault(LogLevel.Warning);
// Logger.setLevel(AppLoggerCategory.Backend, LogLevel.Info);
/**
 * Returns a list of RPCs supported by this application
 */
export function getSupportedRpcs(): RpcInterfaceDefinition[] {
  return [
    IModelReadRpcInterface,
    IModelTileRpcInterface,
    PresentationRpcInterface,
    SnapshotIModelRpcInterface,
  ];
}
(async () => {
  try {
    // Initialize iModelHost
    await IModelHost.startup();

    // Initialize Presentation
    Presentation.initialize();

    // Get platform-specific initialization function
    let init: (rpcs: RpcInterfaceDefinition[]) => void;
    init = (await import("./web/BackendServer")).default;

    // Get RPCs supported by this backend
    const rpcs = getSupportedRpcs();

    // Invoke platform-specific initialization
    init(rpcs);
  } catch (error) {
    // Logger.logError(AppLoggerCategory.Backend, error);
    process.exitCode = 1;
  }
})(); // tslint:disable-line:no-floating-promises
