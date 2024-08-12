import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { FileDownloader } from "./utils/DownloadList";
declare global {
  interface Window {
    isExceOne: any;
    toAudioCount: number
  }
  interface XMLHttpRequest {
    callbacks: any;
  }
}
// Usage example
const fileDownloader = new FileDownloader(10);
ReactDOM.createRoot(
  (() => {
    const app = document.createElement("div");
    document.body.append(app);
    window.toAudioCount = 0
    return app;
    
  })()
).render(
  <React.StrictMode>
    <App
      DownloadList={(url: any, filename: any) =>
        fileDownloader.addToDownloadQueue(url, filename, () => {})
      }
    />
  </React.StrictMode>
);
