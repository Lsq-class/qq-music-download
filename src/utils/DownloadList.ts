import { blobToAwv, blobToMp3 } from "./utils";

export class FileDownloader {
  maxConcurrentDownloads: number;
  downloadQueue: any[];
  numActiveDownloads: number;
  constructor(maxConcurrentDownloads = 1) {
    this.maxConcurrentDownloads = maxConcurrentDownloads;
    this.downloadQueue = [];
    this.numActiveDownloads = 0;
  }

  addToDownloadQueue(fileUrl: any, fileName: any, cd: any) {
    this.downloadQueue.push({ fileUrl, fileName });
    this.processDownloadQueue(cd);
  }

  processDownloadQueue(cd) {
    while (
      this.numActiveDownloads < this.maxConcurrentDownloads &&
      this.downloadQueue.length > 0
    ) {
      const { fileUrl, fileName } = this.downloadQueue.shift();
      this.startDownload(fileUrl, fileName, cd);
    }
  }

  startDownload(fileUrl: RequestInfo | URL, fileName: any, cd) {
    this.numActiveDownloads++;

    fetch(fileUrl)
      .then((response) => {
        // this.downloadFileConvert(response, fileName)
        // return response.blob()
        return response.arrayBuffer()
      })
      .then((blob) => {
        // this.downloadFile(blob, fileName);
        let buffer: any = blob
        blobToAwv(buffer, fileName, this.maxConcurrentDownloads, cd, this.numActiveDownloads)
        // this.downloadFileMp3(buffer, fileName)
      })
      .catch((error) => {
        console.error("Error downloading file:", error);
      })
      .finally(() => {
        this.numActiveDownloads--;
        this.processDownloadQueue(cd);
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
//   async downloadFileConvert(response: any, fileName: any) {
//     const file = new File([await response.blob()], fileName, { type: response.headers.get('content-type') });

//     const formData = new FormData();
//     formData.append('file', file);
//     formData.append('targetformat', 'mp3');
//     formData.append('audiobitratetype', "0");
//     formData.append('customaudiobitrate', "");
//     formData.append('audiosamplingtype', "0");
//     formData.append('customaudiosampling', "");
//     formData.append('code', "82000");
//     formData.append('filelocation', "local");
//     formData.append('legal', "Our PHP programs can only be used in aconvert.com. We DO NOT allow using our PHP programs in any third-party websites, software or apps. We will report abuse to your cloud provider, Google Play and App store if illegal usage found!");
//     const uploadResponse: any = await fetch('/postFilesToMp3/convert/convert9.php', {
//       method: 'POST',
//       body: formData,
//     });

//     if (uploadResponse.state === "SUCCESS") {
//       console.log('SUCCESS');
//     } else {
//       console.error('Error uploading file:', await uploadResponse.text());
//     }

//   }
}
