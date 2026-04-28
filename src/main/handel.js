const { ipcMain } = require("electron");
const path = require('path');
const fs = require('fs').promises;

// 获取截图存储目录路径
function getScreenshotsDir() {
  const { app } = require("electron");
  
  // 检查是否是开发环境
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    // 开发环境：在src目录的同级目录下
    return path.join(process.cwd(), 'Screenshots');
  } else {
    // 生产环境：在exe文件所在目录的同级目录下
    const exeDir = path.dirname(app.getPath('exe'));
    return path.join(exeDir, 'Screenshots');
  }
}

// 获取漫画存储目录路径
function getMangaStoreDir() {
  const { app } = require("electron");
  
  // 检查是否是开发环境
  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  
  if (isDev) {
    // 开发环境：使用相对路径
    return path.join(__dirname, '../../mangastore');
  } else {
    // 生产环境：在exe文件所在目录的同级目录下
    const exeDir = path.dirname(app.getPath('exe'));
    return path.join(exeDir, 'mangastore');
  }
}

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
        const destPath = getMangaStoreDir();
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
        const destPath = getMangaStoreDir();
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
        const jsonPath = path.join(getMangaStoreDir(), 'manga_structure.json');
        try {
            const data = await fs.readFile(jsonPath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            console.error('读取漫画结构json失败：', error);
            return { mangas: [] };
        }
    });

    ipcMain.handle("saveCroppedImage", async (event, base64Data, filename) => {
        const { app } = require("electron");
        try {
            // Create Screenshots directory
            const screenshotsDir = getScreenshotsDir();
            await fs.mkdir(screenshotsDir, { recursive: true });
            
            // Remove data URL prefix and decode
            const base64Image = base64Data.replace(/^data:image\/png;base64,/, '');
            const imageBuffer = Buffer.from(base64Image, 'base64');
            
            // Save file
            const filePath = path.join(screenshotsDir, filename);
            await fs.writeFile(filePath, imageBuffer);
            
            return { success: true, filePath };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("clearScreenshots", async () => {
        const { app } = require("electron");
        try {
            const screenshotsDir = getScreenshotsDir();
            
            // Check if directory exists
            try {
                await fs.access(screenshotsDir);
            } catch {
                // Directory doesn't exist, nothing to clear
                return { success: true, message: 'Screenshots directory does not exist' };
            }
            
            // Read all files in the directory
            const files = await fs.readdir(screenshotsDir);
            
            // Delete each file
            for (const file of files) {
                const filePath = path.join(screenshotsDir, file);
                const stat = await fs.stat(filePath);
                if (stat.isFile()) {
                    await fs.unlink(filePath);
                }
            }
            
            return { success: true, message: `Cleared ${files.length} files from Screenshots directory` };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("openScreenshotsFolder", async () => {
        const { app, shell } = require("electron");
        try {
            const screenshotsDir = getScreenshotsDir();
            
            // Ensure directory exists
            await fs.mkdir(screenshotsDir, { recursive: true });
            
            // Open folder in file explorer
            await shell.openPath(screenshotsDir);
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });

    ipcMain.handle("openMangaStoreFolder", async () => {
        const { app, shell } = require("electron");
        try {
            const mangaStoreDir = getMangaStoreDir();
            
            // Ensure directory exists
            await fs.mkdir(mangaStoreDir, { recursive: true });
            
            // Open folder in file explorer
            await shell.openPath(mangaStoreDir);
            
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    });
   
}
