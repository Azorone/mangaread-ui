const fs = require('fs').promises;
const path = require('path');

export async function useScanManga(mangaStorePath) {
  try {
    const mangaStructure = {
      mangas: []
    };

    // 读取mangastore目录下的漫画文件夹
    const mangaDirs = await fs.readdir(mangaStorePath, { withFileTypes: true });
    const mangaFolders = mangaDirs.filter(dirent => dirent.isDirectory());

    for (const mangaFolder of mangaFolders) {
      const mangaName = mangaFolder.name;
      const mangaPath = path.join('mangastore', mangaName);
      const fullMangaPath = path.join(mangaStorePath, mangaName);

      const manga = {
        name: mangaName,
        path: mangaPath,
        chapters: []
      };

      // 读取漫画目录下的章节文件夹
      const chapterDirs = await fs.readdir(fullMangaPath, { withFileTypes: true });
      const chapterFolders = chapterDirs.filter(dirent => dirent.isDirectory());

      for (const chapterFolder of chapterFolders) {
        const chapterName = chapterFolder.name;
        const chapterPath = path.join(mangaPath, chapterName);
        const fullChapterPath = path.join(fullMangaPath, chapterName);

        const chapter = {
          name: chapterName,
          path: chapterPath,
          images: []
        };

        // 读取章节目录下的图片文件
        const files = await fs.readdir(fullChapterPath);
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|bmp|webp)$/i.test(file));

        for (const imageFile of imageFiles) {
          const imagePath = path.join(chapterPath, imageFile);
          chapter.images.push({
            name: imageFile,
            path: imagePath
          });
        }

        // 按名称排序图片
        chapter.images.sort((a, b) => a.name.localeCompare(b.name));

        manga.chapters.push(chapter);
      }

      // 按名称排序章节
      manga.chapters.sort((a, b) => a.name.localeCompare(b.name));

      mangaStructure.mangas.push(manga);
    }

    // 按名称排序漫画
    mangaStructure.mangas.sort((a, b) => a.name.localeCompare(b.name));

    // 生成json文件路径
    const jsonFilePath = path.join(mangaStorePath, 'manga_structure.json');

    // 写入json文件
    await fs.writeFile(jsonFilePath, JSON.stringify(mangaStructure, null, 2), 'utf8');

    console.log('漫画结构json生成成功：', jsonFilePath);
    return mangaStructure;
  } catch (error) {
    console.error('扫描漫画目录时出错：', error);
    throw error;
  }
}