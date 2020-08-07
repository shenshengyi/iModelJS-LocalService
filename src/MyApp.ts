/*---------------------------------------------------------------------------------------------
 * Copyright (c) Bentley Systems, Incorporated. All rights reserved.
 * See LICENSE.md in the project root for license terms and full copyright notice.
 *--------------------------------------------------------------------------------------------*/
import { ClientRequestContext, Config } from "@bentley/bentleyjs-core";
import {
  BrowserAuthorizationCallbackHandler,
  BrowserAuthorizationClient,
  BrowserAuthorizationClientConfiguration,
  FrontendAuthorizationClient,
} from "@bentley/frontend-authorization-client";
import {
  BentleyCloudRpcParams,
  RpcConfiguration,
  BentleyCloudRpcManager,
  RpcInterfaceDefinition,
  IModelReadRpcInterface,
  SnapshotIModelRpcInterface,
  IModelTileRpcInterface,
} from "@bentley/imodeljs-common";
import {
  FrontendRequestContext,
  IModelApp,
  IModelAppOptions,
} from "@bentley/imodeljs-frontend";
import { UrlDiscoveryClient } from "@bentley/itwin-client";
import { Presentation } from "@bentley/presentation-frontend";
import { AppNotificationManager, UiFramework } from "@bentley/ui-framework";
import { AppState, AppStore } from "./AppState";
import { PresentationRpcInterface } from "@bentley/presentation-common";

export function getSupportedRpcs(): RpcInterfaceDefinition[] {
  return [
    IModelReadRpcInterface,
    IModelTileRpcInterface,
    PresentationRpcInterface,
    SnapshotIModelRpcInterface,
  ];
}

export function initRpc(rpcParams?: BentleyCloudRpcParams): RpcConfiguration {
  let config: RpcConfiguration;
  const rpcInterfaces = getSupportedRpcs();
  // initialize RPC for web apps
  if (!rpcParams)
    rpcParams = {
      info: { title: "ninezone-sample-app", version: "v1.0" },
      uriPrefix: "http://localhost:3001",
    };
  config = BentleyCloudRpcManager.initializeClient(rpcParams, rpcInterfaces);
  return config;
}

/**
 * List of possible backends that ninezone-sample-app can use
 */
export enum UseBackend {
  /** Use local ninezone-sample-app backend */
  Local = 0,

  /** Use deployed general-purpose backend */
  GeneralPurpose = 1,
}

// subclass of IModelApp needed to use imodeljs-frontend
export class NineZoneSampleApp {
  private static _appState: AppState;

  public static get oidcClient(): FrontendAuthorizationClient {
    return IModelApp.authorizationClient as FrontendAuthorizationClient;
  }

  public static get store(): AppStore {
    return this._appState.store;
  }

  public static async startup(): Promise<void> {
    // Use the AppNotificationManager subclass from ui-framework to get prompts and messages
    const opts: IModelAppOptions = {};
    opts.notifications = new AppNotificationManager();
    opts.applicationVersion = "1.0.0";

    await IModelApp.startup(opts);

    // initialize OIDC
    await NineZoneSampleApp.initializeOidc();

    // contains various initialization promises which need
    // to be fulfilled before the app is ready
    const initPromises = new Array<Promise<any>>();

    // initialize RPC communication
    initPromises.push(NineZoneSampleApp.initializeRpc());

    // initialize localization for the app
    initPromises.push(
      IModelApp.i18n.registerNamespace("NineZoneSample").readFinished
    );

    // create the application state store for Redux
    this._appState = new AppState();

    // initialize UiFramework
    initPromises.push(UiFramework.initialize(this.store, IModelApp.i18n));

    // initialize Presentation
    initPromises.push(
      Presentation.initialize({
        activeLocale: IModelApp.i18n.languageList()[0],
      })
    );

    // the app is ready when all initialization promises are fulfilled
    await Promise.all(initPromises);
  }

  private static async initializeRpc(): Promise<void> {
    const rpcParams = await this.getConnectionInfo();
    initRpc(rpcParams);
  }

  private static async initializeOidc() {
    const scope =
      "openid email profile organization imodelhub context-registry-service:read-only product-settings-service projectwise-share urlps-third-party";
    // imjs_browser_test_client_id="imodeljs-spa-samples-2686"
    //const clientId = Config.App.getString("imjs_browser_test_client_id");
    //imjs_browser_test_redirect_uri="http://localhost:3000/signin-callback.html"
    //imjs_browser_test_post_signout_redirect_uri="http://localhost:3000/"
    const clientId = "imodeljs-spa-samples-2686";
    // const redirectUri = Config.App.getString("imjs_browser_test_redirect_uri");
    // const postSignoutRedirectUri = Config.App.get(
    //   "imjs_browser_test_post_signout_redirect_uri"
    // );
    const postSignoutRedirectUri = "http://localhost:3000/";
    const redirectUri = "http://localhost:3000/signin-callback.html";
    const oidcConfiguration: BrowserAuthorizationClientConfiguration = {
      clientId,
      redirectUri,
      postSignoutRedirectUri,
      scope: scope + " imodeljs-router",
      responseType: "code",
    };
    await BrowserAuthorizationCallbackHandler.handleSigninCallback(
      oidcConfiguration.redirectUri
    );
    IModelApp.authorizationClient = new BrowserAuthorizationClient(
      oidcConfiguration
    );
    try {
      await (NineZoneSampleApp.oidcClient as BrowserAuthorizationClient).signInSilent(
        new ClientRequestContext()
      );
    } catch (err) {}
  }

  private static async getConnectionInfo(): Promise<
    BentleyCloudRpcParams | undefined
  > {
    const usedBackend = Config.App.getNumber("imjs_backend", UseBackend.Local);

    // if (usedBackend === UseBackend.GeneralPurpose) {
    //   const urlClient = new UrlDiscoveryClient();
    //   const requestContext = new FrontendRequestContext();
    //   const orchestratorUrl = await urlClient.discoverUrl(
    //     requestContext,
    //     "iModelJsOrchestrator.K8S",
    //     undefined
    //   );
    //   return {
    //     info: { title: "general-purpose-imodeljs-backend", version: "v2.0" },
    //     uriPrefix: orchestratorUrl,
    //   };
    // }

    if (usedBackend === UseBackend.Local) return undefined;

    throw new Error(
      `Invalid backend "${usedBackend}" specified in configuration`
    );
  }
}
