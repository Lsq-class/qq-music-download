import { useEffect, useState } from "react";
import "./App.css";
import { splitAndMoveElement, syncRecursive } from "./utils/utils";
import { FileDownloader } from "./utils/DownloadList";
function App(props: any) {

  const [loadding, setLoading] = useState<boolean>(false);
  const [process, setProcess] = useState<number>(0);
  const [totalNum, setTotalNum] = useState<number>(0);

  useEffect(() => {
    if (!window.isExceOne) {
      window.isExceOne = true;
      const msg = confirm("是否下载播放列表音乐.tip: 下载网页播放器内全部音乐，若需要挑选请点击取消，修改播放器内音乐，刷新页面点击确认等待全部下载！！！");
      if (msg === true) {
        setLoading(true);
        const body: any = document.querySelector("#app");
        body.style.visibility = "hidden";
        const addXMLRequestCallback = (callback: any) => {
          let oldSend: any = null;
          let i = null;
          // @ts-ignore
          if (XMLHttpRequest.callbacks) {
            // @ts-ignore
            XMLHttpRequest.callbacks.push(callback);
          } else {
            // @ts-ignore
            XMLHttpRequest.callbacks = [callback];
            oldSend = XMLHttpRequest.prototype.send;
            XMLHttpRequest.prototype.send = function () {
              // @ts-ignore
              for (i = 0; i < XMLHttpRequest.callbacks.length; i++) {
                // @ts-ignore
                XMLHttpRequest.callbacks[i](this);
              }
              oldSend.apply(this, arguments);
            };
          }
        };
        addXMLRequestCallback((xhr: any) => {
          xhr.addEventListener("loadend", function () {
            if (xhr.readyState == 4 && xhr.status == 200) {
              if (xhr.responseURL.indexOf("cgi-bin/musics.fcg") !== -1) {
                let list = JSON.parse(xhr.response);
                let preUrl: any = undefined;
                let songList: any = undefined;
                let songId: any = undefined;
                let songName = undefined;
                let currentIndex = undefined;
                Object.keys(list)?.forEach((item: any) => {
                  if (preUrl === undefined) {
                    preUrl = list[item]?.data?.midurlinfo?.[0]?.purl;
                  }
                  if (songList === undefined) {
                    songList = list[item]?.data?.tracks;
                  }
                  if (songId === undefined) {
                    songId = list[item]?.data?.songID;
                  }
                });
                if (songId !== undefined) {
                  songName = songList?.filter(
                    (item: any) => item?.id === songId
                  )?.[0]?.name;
                  currentIndex = songList?.findIndex(
                    (item: any) => item?.id === songId
                  );
                  songList = splitAndMoveElement(songList, songId);
                  setTotalNum(songList?.length);
                }
                if (preUrl !== undefined && songName !== undefined) {
                  const btn: any = document.querySelector(".btn_big_next");
                  btn.click();
                  songList[0] = {
                    ...songList[0],
                    downUrl: "https://ws6.stream.qqmusic.qq.com/" + preUrl,
                  };
                  syncRecursive(songList, 1, (data: any) => {
                    console.log(data, "allData");
                    const fileDownloader = new FileDownloader(songList?.length);
                    songList?.forEach(
                      (item: any, i: number) => {
                        setTimeout(() => {
                          fileDownloader.addToDownloadQueue(
                            item?.downUrl,
                            item?.name
                          );
                        }, 800 * i);
                      },
                    );
                    const body: any = document.querySelector("#app");
                    body.style.visibility = "visible";
                    setLoading(false);
                  },
                  (index: any) => {
                    setProcess(index);
                  });
                  
                  console.log(preUrl, "aaaa");
                }
                // if (songId === undefined) {
                //   const body: any = document.querySelector("#app");
                //   body.style.visibility = "visible";
                //   setLoading(false);
                // }
              } else {
                
              }
            } else {
              // const body: any = document.querySelector("#app");
              // body.style.visibility = "visible";
              // setLoading(false);
            }
          });
        });
      } else {
      }
    }
  }, []);

  return loadding ? (
    <div
      style={{
        width: "100%",
        height: "100vh",
        zIndex: 999999,
        background: "#cecece",
        fontSize: 24,
        color: "white",
        position: "absolute",
        top: 0,
        left: 0,
      }}
    >
      下载中... {"(" + process + "/" + totalNum + ")"}
    </div>
  ) : (
    <></>
  );
}

export default App;
