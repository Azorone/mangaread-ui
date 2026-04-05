import { ref, watch } from 'vue';

/**
 * 分页管理composable
 * 负责页面导航和缓存加载
 */
export function usePagination(imageCache) {
  const currentPage = ref(1);
  const totalPages = ref(100);

  // ========================
  // 页面加载（优先从缓存）
  // ========================
  const loadPageFromCache = async () => {
    // 优先从缓存获取
    const cachedImage = imageCache.getImageFromCache(currentPage.value);
    if (cachedImage) {
      console.log(`从缓存加载第 ${currentPage.value} 页`);
      return cachedImage;
    } else {
      // 缓存没有就启动预取
      console.log(`缓存中没有第 ${currentPage.value} 页，触发预取`);
      await imageCache.prefetchImagesToCache(currentPage.value, totalPages.value);
      const retryImage = imageCache.getImageFromCache(currentPage.value);
      if (retryImage) {
        return retryImage;
      }
    }
    return null;
  };

  // 上一页
  const prevPage = async () => {
    if (currentPage.value > 1) {
      currentPage.value--;
      return await loadPageFromCache();
    }
  };

  // 下一页
  const nextPage = async () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
      return await loadPageFromCache();
    }
  };

  return {
    currentPage,
    totalPages,
    // 方法
    loadPageFromCache,
    prevPage,
    nextPage
  };
}
