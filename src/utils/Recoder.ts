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

export const transWavBlob: any = async (wavBlob: any, fileName: string, total: number, cd, currentIndex: number) => {
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
  setTimeout(() => {
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
  }, currentIndex * 200);
 
  // debugger
  // return resultBlob

  // //数据格式二 Base64 模拟
  // const reader: any=new FileReader();
  // reader.onloadend=function(){
  // 	var base64=(/.+;\s*base64\s*,\s*(.+)$/i.exec(reader.result)||[])[1];

  // 	//数据格式二核心代码，以上代码无关紧要
  // 	var bstr=atob(base64),n=bstr.length,u8arr=new Uint8Array(n);
  // 	while(n--){
  // 		u8arr[n]=bstr.charCodeAt(n);
  // 	};

  // 	Recorder.Wav2Other(set,new Blob([u8arr.buffer]),function(blob,duration,rec){
  // 	},function(msg){
  // 	});
  // };
  // reader.readAsDataURL(wavBlob);
};
