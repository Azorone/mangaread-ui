const { ipcMain } = require("electron");
const path = require('path');
const fs = require('fs').promises;

// 扫描漫画结构并生成json
async function scanMangaStructure(mangaStorePath) {
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
          const imagePath =  path.join(chapterPath, imageFile).replace(/\\/g, '/');
          chapter.images.push({
            name: imageFile,
            path: imagePath
          });
        }

        // 按名称排序图片
        chapter.images.sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));

        manga.chapters.push(chapter);
      }

      // 按名称排序章节
      manga.chapters.sort((a, b) => a.name.localeCompare(b.name, 'en', { numeric: true }));

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

export  const  RegisterHandel =function () {
    console.log("RegisterHandel----");
    ipcMain.handle("ping", async () => {
        return "pong";
    });

    ipcMain.handle("getAppVersion", async () => {
        const { app } = require("electron");
        return app.getVersion();
    });

    ipcMain.handle("getAppPath", async () => {
        const { app } = require("electron");
        return app.getAppPath(); 
    });

    ipcMain.handle("getUserDataPath", async () => {
        const { app } = require("electron");
        return app.getPath("userData"); 
    });

    ipcMain.handle("openFolderDialog", async () => {
        const { dialog } = require("electron");
        const result = await dialog.showOpenDialog({
            properties: ["openDirectory", "multiSelections"]
        });
        return result;
    });

    ipcMain.handle("importFolders", async (event, targetPaths) => {
        if (!Array.isArray(targetPaths)) targetPaths = [targetPaths];
        const destPath = path.join(__dirname, '../../mangastore');
        await fs.mkdir(destPath, { recursive: true });
        const results = [];
        let hasSuccess = false;
        for (const targetPath of targetPaths) {
            try {
                const folderName = path.basename(targetPath);
                const fullDestPath = path.join(destPath, folderName);
                await fs.cp(targetPath, fullDestPath, { recursive: true });
                results.push({ success: true, destPath: fullDestPath, source: targetPath });
                hasSuccess = true;
            } catch (error) {
                results.push({ success: false, error: error.message, source: targetPath });
            }
        }
        // 如果有成功导入的，重新扫描并生成json
        if (hasSuccess) {
            try {
                await scanMangaStructure(destPath);
            } catch (scanError) {
                console.error('生成漫画结构json失败：', scanError);
            }
        }
        return results;
    });

    ipcMain.handle("getMangaList", async () => {
        const destPath = path.join(__dirname, '../../mangastore');
        try {
            const folders = await fs.readdir(destPath, { withFileTypes: true });
            const mangaList = folders.filter(dirent => dirent.isDirectory()).map(dirent => ({
                id: dirent.name,
                title: dirent.name
            }));
            return mangaList;
        } catch (error) {
            return [];
        }
    });

    ipcMain.handle("getMangaStructure", async () => {
        const jsonPath = path.join(__dirname, '../../mangastore/manga_structure.json');
        try {
            const data = await fs.readFile(jsonPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('读取漫画结构json失败：', error);
            return { mangas: [] };
        }
    });
   
}
