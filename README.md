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
# 4、js本地mp4格式文件转换为mp3

由于下载的音乐格式为mp4格式，因此我们需要使用js将mp4格式转为mp3。

首先我们需要提取mp4内音频文件，可使用AudioContext音频对象，将mp4内音频文件已wav格式导出。

```tsx
export const bufferToWavBlob = (buffer: any, fileName: string, total: number, cd: any) =>  {
  // 创建音频上下文
  const audioCtx = new AudioContext();
  // arrayBuffer转audioBuffer
  audioCtx.decodeAudioData(buffer, async function (audioBuffer) {
  // 提取音乐内的wavblob
    const blob = bufferToWav(audioBuffer, audioBuffer.sampleRate * audioBuffer.duration);
    });
}
function bufferToWav(abuffer, len) {
  var numOfChan = abuffer.numberOfChannels,
  length = len * numOfChan * 2 + 44,
  buffer = new ArrayBuffer(length),
  view = new DataView(buffer),
  channels = [], i, sample,
  offset = 0,
  pos = 0;
  // write WAVE header
  // "RIFF"
  setUint32(0x46464952);
  // file length - 8                      
  setUint32(length - 8);
  // "WAVE"                     
  setUint32(0x45564157);
  // "fmt " chunk
  setUint32(0x20746d66);  
  // length = 16                       
  setUint32(16);  
  // PCM (uncompressed)                               
  setUint16(1); 
  setUint16(numOfChan);
  setUint32(abuffer.sampleRate);
  // avg. bytes/sec
  setUint32(abuffer.sampleRate * 2 * numOfChan);
  // block-align
  setUint16(numOfChan * 2);
  // 16-bit (hardcoded in this demo)
  setUint16(16);                           
  // "data" - chunk
  setUint32(0x61746164); 
  // chunk length                   
  setUint32(length - pos - 4);                   
  // write interleaved data
  for(i = 0; i < abuffer.numberOfChannels; i++)
      channels.push(abuffer.getChannelData(i));

  while(pos < length) {
       // interleave channels
      for(i = 0; i < numOfChan; i++) {
          // clamp
          sample = Math.max(-1, Math.min(1, channels[i][offset])); 
          // scale to 16-bit signed int
          sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; 
          // write 16-bit sample
          view.setInt16(pos, sample, true);          
          pos += 2;
      }
      // next source sample
      offset++                                     
  }

  // create Blob
  return new Blob([buffer], {type: "audio/wav"});
  function setUint16(data) {
      view.setUint16(pos, data, true);
      pos += 2;
  }
  function setUint32(data) {
      view.setUint32(pos, data, true);
      pos += 4;
  }
```

后面就需要将wav格式音频转mp3.这里使用过lamejs但是效果很差。因此，

这里我们用到了一个js录音库。极力推荐yyds。 [xiangyuecn](https://github.com/xiangyuecn)/[**Recorder](https://github.com/xiangyuecn/Recorder).感谢该库作者提供wav转mp3格式**

[https://xiangyuecn.github.io/Recorder/assets/工具-代码运行和静态分发Runtime.html?idf=self_base_demo](https://xiangyuecn.github.io/Recorder/assets/%E5%B7%A5%E5%85%B7-%E4%BB%A3%E7%A0%81%E8%BF%90%E8%A1%8C%E5%92%8C%E9%9D%99%E6%80%81%E5%88%86%E5%8F%91Runtime.html?idf=self_base_demo)

```tsx
import Recorder from "recorder-core"; //注意如果未引用Recorder变量，可能编译时会被优化删除（如vue3 tree-shaking），请改成 import 'recorder-core'，或随便调用一下 Recorder.a=1 保证强引用
//import './你clone的目录/src/recorder-core.js' //clone源码可以按这个方式引入，下同
//require('./你clone的目录/src/recorder-core.js') //clone源码可以按这个方式引入，下同
//<script src="你clone的目录/src/recorder-core.js"> //这是html中script方式引入，下同

//按需引入你需要的录音格式支持文件，如果需要多个格式支持，把这些格式的编码引擎js文件统统引入进来即可
import "recorder-core/src/engine/mp3";
import "recorder-core/src/engine/mp3-engine";
import "recorder-core/src/engine/wav";
Recorder.Wav2Other = function (newSet, wavBlob, True, False) {
  const reader: any = new FileReader();
  reader.onloadend = function () {
    //检测wav文件头
    const wavView = new Uint8Array(reader.result);
    const eq = function (p, s) {
      for (var i = 0; i < s.length; i++) {
        if (wavView[p + i] != s.charCodeAt(i)) {
          return false;
        }
      }
      return true;
    };
    let pcm;
    if (eq(0, "RIFF") && eq(8, "WAVEfmt ")) {
      var numCh = wavView[22];
      if (wavView[20] == 1 && (numCh == 1 || numCh == 2)) {
        //raw pcm 单或双声道
        var sampleRate =
          wavView[24] +
          (wavView[25] << 8) +
          (wavView[26] << 16) +
          (wavView[27] << 24);
        var bitRate = wavView[34] + (wavView[35] << 8);
        //搜索data块的位置
        var dataPos = 0; // 44 或有更多块
        for (var i = 12, iL = wavView.length - 8; i < iL; ) {
          if (
            wavView[i] == 100 &&
            wavView[i + 1] == 97 &&
            wavView[i + 2] == 116 &&
            wavView[i + 3] == 97
          ) {
            //eq(i,"data")
            dataPos = i + 8;
            break;
          }
          i += 4;
          i +=
            4 +
            wavView[i] +
            (wavView[i + 1] << 8) +
            (wavView[i + 2] << 16) +
            (wavView[i + 3] << 24);
        }
        console.log("wav info", sampleRate, bitRate, numCh, dataPos);
        if (dataPos) {
          if (bitRate == 16) {
            pcm = new Int16Array(wavView.buffer.slice(dataPos));
          } else if (bitRate == 8) {
            pcm = new Int16Array(wavView.length - dataPos);
            //8位转成16位
            for (var j = dataPos, d = 0; j < wavView.length; j++, d++) {
              var b = wavView[j];
              pcm[d] = (b - 128) << 8;
            }
          }
        }
        if (pcm && numCh == 2) {
          //双声道简单转单声道
          var pcm1 = new Int16Array(pcm.length / 2);
          for (var i = 0; i < pcm1.length; i++) {
            pcm1[i] = (pcm[i * 2] + pcm[i * 2 + 1]) / 2;
          }
          pcm = pcm1;
        }
      }
    }
    if (!pcm) {
      False && False("非单或双声道wav raw pcm格式音频，无法转码");
      return;
    }

    var rec = Recorder(newSet).mock(pcm, sampleRate);
    rec.stop(function (blob, duration) {
      True(blob, duration, rec);
    }, False);
  };
  reader.readAsArrayBuffer(wavBlob);
};

export const transWavBlob: any = async (wavBlob: any, fileName: string, total: number, cd) => {
  if (!wavBlob) {
    return;
  }
  var set = {
    type: "mp3",
    sampleRate: 48000,
    bitRate: 96,
  };
  // let resultBlob =null
  //数据格式一 Blob
  Recorder.Wav2Other(
    set,
    wavBlob,
    function (blob, duration, rec) {
      console.log(
        blob,
        (window.URL || webkitURL).createObjectURL(blob),
        "log——audio", total + "process"
      );
      window.toAudioCount ++ 
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName + ".mp3");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      if (window.toAudioCount === total - 1) {
        cd();
      }
      // resultBlob = blob
    },
    function (msg) {}
  );
};

```

ok所有功能已经全部实现，但下载进度界面需要优化。
