import { ref } from 'vue';

/**
 * 图片缓存管理composable
 * 负责图片列表获取、预取、缓存管理
 */
export function useImageCache() {
  // ========================
  // 漫画图片列表相关
  // ========================
  const mangaImageList = ref([]);
  const currentMangaId = ref(1);
  const pageUrlMap = new Map();

  // ========================
  // 图片缓存容器相关
  // ========================
  const imageCacheQueue = ref([]);
  const prefetchCountSetting = ref(5);
  const maxCacheSizeSetting = ref(20);
  const showCacheSettings = ref(false);
  const isPrefetching = ref(false);
  const cacheSizeInBytes = ref(0);

  // ========================
  // 从服务器获取漫画图片列表（模拟JSON数据）
  // ========================
  const fetchMangaImageList = async (mangaId) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const imageList = [];
        for (let page = 1; page <= 100; page++) {
          imageList.push({
            id: page,
            page: page,
            chapter: Math.ceil(page / 20),
            url: `https://picsum.photos/1200/1800?id=${mangaId}_${page}`,
            title: `第${page}页`,
            size: 0,
            timestamp: Date.now() - (100 - page) * 1000
          });
        }
        console.log(`成功获取漫画 ${mangaId} 的图片列表，共 ${imageList.length} 张`);
        mangaImageList.value = imageList;
        
        imageList.forEach(img => {
          pageUrlMap.set(img.page, img);
        });
        
        resolve(imageList);
      }, 200);
    });
  };

  // 根据页码获取图片URL
  const getImageUrlByPage = (pageNum) => {
    if (pageUrlMap.has(pageNum)) {
      return pageUrlMap.get(pageNum);
    }
    
    const imageData = mangaImageList.value.find(img => img.page === pageNum);
    if (imageData) {
      pageUrlMap.set(pageNum, imageData);
      return imageData;
    }
    
    console.warn(`页码 ${pageNum} 未找到对应的图片数据`);
    return null;
  };

  // 根据页码列表获取多张图片的URL数据
  const getImageUrlsByPages = (pageNumbers) => {
    return pageNumbers
      .map(page => getImageUrlByPage(page))
      .filter(item => item !== null);
  };

  // 从URL获取图片二进制数据并转换为Base64
  const fetchImageFromServer = async (imageData) => {
    return new Promise(async (resolve) => {
      try {
        if (!imageData || !imageData.url) {
          throw new Error('图片数据无效');
        }
        
        const response = await fetch(imageData.url);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const blob = await response.blob();
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64Data = e.target.result;
          resolve({
            data: base64Data,
            size: blob.size,
            timestamp: Date.now()
          });
        };
        reader.onerror = () => {
          throw new Error('Failed to read blob as data URL');
        };
        reader.readAsDataURL(blob);
      } catch (error) {
        console.error('获取图片时出错：', error);
        resolve(null);
      }
    });
  };

  // 预取图片到缓存容器（根据页码预取）
  const prefetchImagesToCache = async (currentPage, totalPages) => {
    if (isPrefetching.value) return;
    if (mangaImageList.value.length === 0) return;
    
    isPrefetching.value = true;

    try {
      const startPage = currentPage;
      const endPage = Math.min(
        currentPage + prefetchCountSetting.value - 1,
        totalPages
      );
      
      const pagesToPrefetch = [];
      for (let page = startPage; page <= endPage; page++) {
        const isInCache = imageCacheQueue.value.some(item => item.page === page);
        if (!isInCache) {
          pagesToPrefetch.push(page);
        }
      }
      
      if (pagesToPrefetch.length > 0) {
        const imageDataList = getImageUrlsByPages(pagesToPrefetch);
        const promises = imageDataList.map(imgData => 
          fetchImageFromServer(imgData)
        );
        
        const fetchedImages = await Promise.all(promises);
        
        fetchedImages.forEach((imageData, index) => {
          if (imageData) {
            const page = pagesToPrefetch[index];
            imageCacheQueue.value.push({
              page: page,
              data: imageData.data,
              size: imageData.size,
              timestamp: imageData.timestamp
            });
            cacheSizeInBytes.value += imageData.size;
          }
        });
        
        const successCount = fetchedImages.filter(d => d !== null).length;
        if (successCount > 0) {
          const pageRange = pagesToPrefetch.length === 1 
            ? `第${pagesToPrefetch[0]}页` 
            : `第${pagesToPrefetch[0]}-${pagesToPrefetch[pagesToPrefetch.length - 1]}页`;
          console.log(`预取了 ${successCount} 张图片（${pageRange}），当前缓存: ${imageCacheQueue.value.length} 张，内存占用: ${(cacheSizeInBytes.value / 1024 / 1024).toFixed(2)} MB`);
        }
      }
      
      while (imageCacheQueue.value.length > maxCacheSizeSetting.value) {
        const removed = imageCacheQueue.value.shift();
        if (removed) {
          cacheSizeInBytes.value -= removed.size;
        }
        console.log('缓存超过最大数量，清理最老的图片');
      }
    } catch (error) {
      console.error('预取图片时出错：', error);
    } finally {
      isPrefetching.value = false;
    }
  };

  // 从缓存中获取图片二进制数据（Base64格式）
  const getImageFromCache = (pageNum = null) => {
    let cachedImage = null;
    let index = -1;
    if (pageNum !== null) {
      index = imageCacheQueue.value.findIndex(item => item.page === pageNum);
      if (index !== -1) {
        cachedImage = imageCacheQueue.value[index];
      }
    } else {
      if (imageCacheQueue.value.length > 0) {
        cachedImage = imageCacheQueue.value[0];
        index = 0;
      }
    }
    if (cachedImage) {
      imageCacheQueue.value.splice(index, 1);
      cacheSizeInBytes.value -= cachedImage.size;
      return cachedImage.data;
    }
    return null;
  };

  // 保存缓存设置
  const saveCacheSettings = async (currentPage, totalPages) => {
    prefetchCountSetting.value = Math.max(1, Math.min(20, prefetchCountSetting.value));
    maxCacheSizeSetting.value = Math.max(
      prefetchCountSetting.value,
      Math.min(100, maxCacheSizeSetting.value)
    );
    
    showCacheSettings.value = false;
    
    console.log(`缓存设置已保存 - 预取数: ${prefetchCountSetting.value}, 最大容量: ${maxCacheSizeSetting.value}`);
    await prefetchImagesToCache(currentPage, totalPages);
  };

  return {
    // 漫画图片列表
    mangaImageList,
    currentMangaId,
    pageUrlMap,
    // 缓存相关
    imageCacheQueue,
    prefetchCountSetting,
    maxCacheSizeSetting,
    showCacheSettings,
    isPrefetching,
    cacheSizeInBytes,
    // 方法
    fetchMangaImageList,
    getImageUrlByPage,
    getImageUrlsByPages,
    fetchImageFromServer,
    prefetchImagesToCache,
    getImageFromCache,
    saveCacheSettings
  };
}
