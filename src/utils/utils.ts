import lamejs from 'lamejs'
import { transWavBlob } from './Recoder';

export const syncRecursive = (
  data: any,
  index: number,
  callback: any,
  asnyCallback?: any
) => {
  if (index >= data.length) {
    const audio: any = document.querySelector("audio");
    audio.muted = false;
    // 递归结束条件
    callback(data);
    return;
  }
  // 同步操作
  console.log("Processing data:", data[index]);
  if (asnyCallback) asnyCallback(index);
  const audio: any = document.querySelector("audio");

  if (index !== 1) {
    audio.muted = true;
  }
  data[index] = { ...data[index], downUrl: audio.src };
  const btn: any = document.querySelector(".btn_big_next");
  btn.click();
  //   downloadFileFromLink("https://ws6.stream.qqmusic.qq.com/" + preUrl, songName);
  // 使用定时器模拟异步操作
  setTimeout(() => {
    // 递归调用
    syncRecursive(data, index + 1, callback, asnyCallback);
  }, 2000);
};

// const saveFileToLocal = (fileData: any, fileName: any) => {
//   // 创建一个临时的 a 标签元素
//   const tempLink = document.createElement("a");
//   tempLink.style.display = "none";

//   // 将 Blob 数据转换为 Data URL
//   const dataUrl = URL.createObjectURL(fileData);

//   // 设置 a 标签的 href 和 download 属性
//   tempLink.href = dataUrl;
//   tempLink.download = fileName;

//   // 将 a 标签添加到 DOM 中
//   document.body.appendChild(tempLink);

//   // 触发 a 标签的点击事件
//   tempLink.click();

//   // 移除 a 标签
//   document.body.removeChild(tempLink);

//   // 释放 Data URL 占用的内存
//   URL.revokeObjectURL(dataUrl);
// };

// const downloadFileFromLink = async (url: any, fileName: any) => {
//   try {
//     const response = await fetch(url);
//     const blob = await response.blob();
//     saveFileToLocal(blob, fileName);
//   } catch (error) {
//     console.error("Error downloading file:", error);
//   }
// };

export const splitAndMoveElement = (arr: any, targetId: any) => {
  // 找到目标元素的索引
  const targetIndex = arr.findIndex((item: any) => item.id === targetId);

  if (targetIndex === -1) {
    // 没有找到目标元素,直接返回原数组
    return arr;
  } else if (targetIndex === 0) {
    // 目标元素已经在第一个位置,直接返回原数组
    return arr;
  }

  // 提取目标元素之后的部分
  const afterTargetElements = arr.slice(targetIndex);

  // 提取目标元素之前的部分
  const beforeTargetElements = arr.slice(0, targetIndex - 1);

  // 将目标元素之后的部分移动到前面
  return [...afterTargetElements, ...beforeTargetElements];
};
export const blobToMp3 = (blob) =>  {
  return new Promise ((resolve, reject) => {
  const reader: any = new FileReader ();
  reader.readAsArrayBuffer(blob);
  reader.onloadend = () => {
  const data = new Int16Array(reader.result);
  const buffer = [];
  for (let i =0; i< data.length; i++){
  buffer.push (data [i]);
  }
  const mp3encoder = new lamejs.Mp3Encoder(1, 44100, 128);
  const mp3Data = mp3encoder.encodeBuffer(buffer);
  const mp3Blob = new Blob([new Uint8Array (mp3Data)], { type: 'audio/mp3' });
  resolve (mp3Blob);
  };
  reader. onerror = reject;
  })
}
export const blobToAwv = (buffer: any, fileName: string, total: number, cd: any, currentIndex: number) =>  {
  // 创建音频上下文
  const audioCtx = new AudioContext();
  // arrayBuffer转audioBuffer
  audioCtx.decodeAudioData(buffer, async function (audioBuffer) {
    const blob = bufferToWave(audioBuffer, audioBuffer.sampleRate * audioBuffer.duration);
    transWavBlob(blob, fileName, total, cd, currentIndex)
    // let mp3Blob: any = await convertToMp3(blob)
    // // debugger
    // const url = URL.createObjectURL(mp3Blob);
    // const link = document.createElement("a");
    // link.href = url;
    // link.setAttribute("download", fileName + ".mp3");
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
    // URL.revokeObjectURL(url);
  });
}
function bufferToWave(abuffer, len) {
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
        if (channels[i][offset] !== undefined) {
          sample = Math.max(-1, Math.min(1, channels[i][offset])); 
          // scale to 16-bit signed int
          sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; 
          // write 16-bit sample
          
          
          view.setInt16(pos, sample, true);          
          pos += 2;
        } else {
          pos += 2;
          break;
        }
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
}
