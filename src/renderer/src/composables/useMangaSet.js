import { ref } from 'vue';

export function useMangaSet() {
  const mangaSet = ref([]);
  const MangaIndex = ref(0);
  const ChapterIndex = ref(0);
  const PageIndex = ref(0);

  // ========================
  // 从本地获取漫画结构数据
  // ========================
  const fetchMangaSetLocal = async () => {
  const structure = await window.api.getMangaStructure();
  console.log('漫画结构数据：', structure);
    mangaSet.value = structure.mangas;

console.log(mangaSet.value);
    console.log('成功获取漫画结构数据');
  };

  const initializeMangaSet = async () => {
    console.log('正在初始化漫画结构数据...');
    await fetchMangaSetLocal();
  };
  const getImagesUrl = (MangaIndex_,ChapterIndex_,PageIndex_)=>{
    let url = '';
    try {
      url = mangaSet.value[MangaIndex_].chapters[ChapterIndex_].images[PageIndex_].path;
    }catch (error) {
      console.error('获取漫画图片URL失败：', error);
    }

    console.log(`获取漫画图片URL - 漫画索引: ${MangaIndex_}, 章节索引: ${ChapterIndex_}, 页码索引: ${PageIndex_}`);
    console.log(mangaSet.value[MangaIndex_].chapters);
    return url;
    
  }
  const findMangaIndex= (mangaName)=>{
        let index = 0;
       for(let i = 0; i < mangaSet.value.length; i++){
        if(mangaSet.value[i].name == mangaName){
          index = i;
          break;
        } 
        }
        return index;
  };
  const findChapterIndex = (chapterName)=>{
    let index = 0;  
    for(let i = 0; i < mangaSet.value[MangaIndex.value].chapters.length; i++){
      if(mangaSet.value[MangaIndex.value].chapters[i].name == chapterName){
        index = i;
        break;
      } 
      }
      return index;
  };


  const switchComic = (mangaName)=>{
     let index =  findMangaIndex(mangaName);
     MangaIndex.value = index; 
     ChapterIndex.value = 0;
     PageIndex.value = 0;
     console.log(`切换漫画到 ${mangaName}，索引: ${index}`);
     
  };
  

  const switchChapter = (chapterName)=>{

    let index = findChapterIndex(chapterName);
    ChapterIndex.value = index;
    PageIndex.value = 0;
    console.log(`切换章节到 ${chapterName}，索引: ${index}`);
  }
  
  const switchPage = (num)=>{
    if (PageIndex.value + num < 0 || PageIndex.value + num >= mangaSet.value[MangaIndex.value].chapters[ChapterIndex.value].images.length) {
      console.warn('页码索引超出范围');
      changeChapter(num > 0 ? 1 : -1);
      PageIndex.value = 0;
      return;
    }
    PageIndex.value = PageIndex.value + num;

  }
  
  const changeChapter = (num)=>{
    if(ChapterIndex.value + num < 0 || ChapterIndex.value + num >= mangaSet.value[MangaIndex.value].chapters.length){
      console.warn('章节索引超出范围');
      ChapterIndex.value = 0;
      PageIndex.value = 0;
      return;
    }

    ChapterIndex.value = num + ChapterIndex.value;
    PageIndex.value = 0;
  }


    return {
    switchChapter,
    changeChapter,
    switchPage,
    mangaSet,
    MangaIndex,
    ChapterIndex,
    PageIndex,
    fetchMangaSetLocal,
    initializeMangaSet,
    getImagesUrl,
    switchComic
  };

}


