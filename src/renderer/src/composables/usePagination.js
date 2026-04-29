import { ref} from 'vue';

/**
 * 分页管理composable
 * 负责页面导航和缓存加载
 */
export function usePagination(mangaSet) {
  const currentPage = ref(1);
  const totalPages = ref(100);

  const initializePagination = async () => {
    console.log('正在初始化分页数据...');
    // 这里可以根据漫画结构数据设置总页数
    totalPages.value = mangaSet.mangaSet.value[mangaSet.MangaIndex.value].chapters[mangaSet.ChapterIndex.value].images.length;
    let totalImages = 0;
    for(let i =0; i < mangaSet.mangaSet.value[mangaSet.MangaIndex.value].chapters.length; i++){
      totalImages += mangaSet.mangaSet.value[mangaSet.MangaIndex.value].chapters[i].images.length;
    }
    totalPages.value = totalImages;
    console.log(`总页数设置为 ${totalPages.value}`);
  
  }

  // 上一页
  const prevPage = () => {
   
      currentPage.value--;
      mangaSet.switchPage(-1);
    
  };

  // 下一页
  const nextPage = () => {
  
      currentPage.value++;
       mangaSet.switchPage(1);
    
  };

  return {
    currentPage,
    totalPages,
    // 方法
    prevPage,
    nextPage,
    initializePagination
  };
}
