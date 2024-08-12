油猴插件开发学习。mp4格式提取音频。

---如果觉得可以请观众老爷给个免费的star！！！！---

QQ音乐歌单一键式本地下载、音乐下载。
（注意：使用前请登录qq音乐账号，再下载音乐，若遇到下载失败，请刷新后重试，或者检查网络流畅）
使用流程： 进入qq音乐官网https://y.qq.com/n/ryqq。
再选择需要下载的歌单播放歌单全部音乐。进入播放界面提示是否下载。
点击确认获取本地音乐（歌曲多可能需要一段时间）。等待一段时间后，即可下载歌单内全部音乐。
（适用于u盘音响设备，或者车内音响设备音乐下载本地）*****请勿运用到商业用途。若用于商业用途与本人无关。

![image](https://github.com/user-attachments/assets/fe8f5f6d-bd78-4464-9b18-911aa6ecc359)


学习资料

# 1、准备好我们的开发环境、运行环境

## 1、编写代码的工具，推荐vscode

https://code.visualstudio.com/

## 2、安装nodejs并安装yarn包管理工具。

https://nodejs.org/zh-cn

## 3、在浏览器插件应用市场安装油猴插件。

[https://chromewebstore.google.com/detail/篡改猴/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=zh-cn](https://chromewebstore.google.com/detail/%E7%AF%A1%E6%94%B9%E7%8C%B4/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=zh-cn)

# 2、使用vite-plugin-monkey创建项目

1、安装vite-plugin-monkey并创建项目。

https://github.com/lisonge/vite-plugin-monkey/blob/main/README_zh.md

2、设置qq音乐官网匹配脚本，使用yarn dev启动项目

# 3、脚本开发

通过qq音乐官网查找音乐下载链接。

音乐播放链接

![bbb](https://github.com/user-attachments/assets/df683897-0002-4df8-a6c9-c98429df89b2)


查找出数据从这个接口中获取

![aaa](https://github.com/user-attachments/assets/a08e1621-b859-4487-961a-de7bac904c0e)


因此进入官网可劫持该请求数据提取出进入的第一首歌的下载链接（直接获取也可以，可以借此机会学习接口数据的劫持）

```tsx
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
              // 匹配cgi-bin/musics.fcg接口，获取歌曲列表，当前下载链接
              if (xhr.responseURL.indexOf("cgi-bin/musics.fcg") !== -1) {
                let list = JSON.parse(xhr.response);
								// 获取到接口返回的数据
              } else {

              }
            } else {

            }
          });
        });

```

其它歌曲如何获取呢？

点击播放器的下一首按钮即可获取该标签内的

![image](https://github.com/user-attachments/assets/eae22758-d780-42e4-81c6-15750bbfd364)


```tsx
// 模拟点击下一首按钮
const btn: any = document.querySelector(".btn_big_next");
btn.click();
// 等待接口请求结束，将获取到的下载链接放入歌单列表数据中
SetTimeout(() => {
	const audio: any = document.querySelector("audio");
	data[index] = { ...data[index], downUrl: audio.src };
}, 2000)

```

将所有的歌曲下载链接放入下载队列中下载。

```tsx
// 新建下载队列类
export class FileDownloader {
  maxConcurrentDownloads: number;
  downloadQueue: any[];
  numActiveDownloads: number;
  constructor(maxConcurrentDownloads = 1) {
    this.maxConcurrentDownloads = maxConcurrentDownloads;
    this.downloadQueue = [];
    this.numActiveDownloads = 0;
  }

  addToDownloadQueue(fileUrl: any, fileName: any) {
    this.downloadQueue.push({ fileUrl, fileName });
    this.processDownloadQueue();
  }

  processDownloadQueue() {
    while (
      this.numActiveDownloads < this.maxConcurrentDownloads &&
      this.downloadQueue.length > 0
    ) {
      const { fileUrl, fileName } = this.downloadQueue.shift();
      this.startDownload(fileUrl, fileName);
    }
  }

  startDownload(fileUrl: RequestInfo | URL, fileName: any) {
    this.numActiveDownloads++;

    fetch(fileUrl)
      .then((response) => {
        // this.downloadFileConvert(response, fileName)
        return response.blob()})
      .then((blob) => {
        this.downloadFile(blob, fileName);
      })
      .catch((error) => {
        console.error("Error downloading file:", error);
      })
      .finally(() => {
        this.numActiveDownloads--;
        this.processDownloadQueue();
      });
  }

  downloadFile(blob: Blob | MediaSource, fileName: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", fileName + ".mp3");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// songList为歌单列表，使用计时器避免下载过快导致下载错误
const fileDownloader = new FileDownloader(songList?.length);
songList?.forEach(
  (item: any, i: number) => {
    setTimeout(() => {
      fileDownloader.addToDownloadQueue(
      item?.downUrl,
      item?.name
    )}, 800 * i);
  },
);

```
