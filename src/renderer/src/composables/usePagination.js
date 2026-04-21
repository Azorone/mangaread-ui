import { ref} from 'vue';

/**
 * 分页管理composable
 * 负责页面导航和缓存加载
 */
export function usePagination(mangaSet) {
  const currentPage = ref(1);
  const totalPages = ref(100);
  const loadPageFromCache = async () => {
    // 对于本地文件，直接返回，无需缓存
    return null;
  };

  // 上一页
  const prevPage = () => {
    if (currentPage.value > 1) {
      currentPage.value--;
      mangaSet.switchPage(-1);
    }
  };

  // 下一页
  const nextPage = () => {
    if (currentPage.value < totalPages.value) {
      currentPage.value++;
       mangaSet.switchPage(1);
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
