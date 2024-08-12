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
  audio.muted = true;
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

const saveFileToLocal = (fileData: any, fileName: any) => {
  // 创建一个临时的 a 标签元素
  const tempLink = document.createElement("a");
  tempLink.style.display = "none";

  // 将 Blob 数据转换为 Data URL
  const dataUrl = URL.createObjectURL(fileData);

  // 设置 a 标签的 href 和 download 属性
  tempLink.href = dataUrl;
  tempLink.download = fileName;

  // 将 a 标签添加到 DOM 中
  document.body.appendChild(tempLink);

  // 触发 a 标签的点击事件
  tempLink.click();

  // 移除 a 标签
  document.body.removeChild(tempLink);

  // 释放 Data URL 占用的内存
  URL.revokeObjectURL(dataUrl);
};

const downloadFileFromLink = async (url: any, fileName: any) => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    saveFileToLocal(blob, fileName);
  } catch (error) {
    console.error("Error downloading file:", error);
  }
};

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
