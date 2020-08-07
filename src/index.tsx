import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { RobotWorldApp } from "./TestViewer";
import { IModelApp } from "@bentley/imodeljs-frontend";
import { NineZoneSampleApp } from "./MyApp";
import { ConfigurableUiManager } from "@bentley/ui-framework";
class TestView extends React.Component {
  public constructor() {
    super({});
    this.onClick.bind(this);
  }
  private onClick = async () => {
    const h: HTMLElement | null = document.getElementById("NBA");
    if (h) {
      RobotWorldApp.openView(h as HTMLDivElement);
    } else {
      alert("无法找到html");
    }
  };
  public render() {
    return (
      <div>
        <button onClick={this.onClick}>打开</button>
        <div id={"NBA"} style={{ width: 300, height: 500 }}>
          hh
        </div>
      </div>
    );
  }
}

// ReactDOM.render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
//   document.getElementById("root")
// );
async function Start() {
  await NineZoneSampleApp.startup();
  ConfigurableUiManager.initialize();
}
Start();
ReactDOM.render(<TestView />, document.getElementById("root"));
// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
