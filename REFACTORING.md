# 🎨 Manga Reader 重构文档

## 概述

将原始的 1500+ 行单一 Vue 组件文件重构为模块化的 composables 架构，提高代码的可维护性和可读性。

## 📁 新的文件结构

```
src/renderer/src/
├── components/
│   └── mangareader.vue          # 主组件 - 仅包含模板、样式和全局逻辑
└── composables/
    ├── useImageCache.js         # 图片缓存管理
    ├── useCropper.js            # 图片裁剪功能
    ├── useLightbox.js           # 灯箱预览功能
    ├── usePagination.js         # 分页管理
    ├── useSidebar.js            # 侧边栏管理
    └── useKeyboard.js           # 键盘快捷键处理
```

## 📦 Composables 详细说明

### 1. **useImageCache.js** - 图片缓存管理
负责所有与图片缓存相关的逻辑：

**状态（Refs）：**
- `mangaImageList` - 漫画图片列表数组
- `currentMangaId` - 当前漫画ID
- `pageUrlMap` - 页码到图片数据的映射（Map对象）
- `imageCacheQueue` - 缓存队列，使用LRU策略
- `prefetchCountSetting` - 预取数量配置（1-20）
- `maxCacheSizeSetting` - 最大缓存数配置（5-100）
- `showCacheSettings` - 缓存设置面板显示状态
- `isPrefetching` - 预取进行中状态
- `cacheSizeInBytes` - 当前缓存占用的字节数

**方法：**
- `fetchMangaImageList(mangaId)` - 从服务器获取漫画图片列表
- `getImageUrlByPage(pageNum)` - 根据页码获取图片数据
- `getImageUrlsByPages(pageNumbers)` - 批量获取多个页面的图片数据
- `fetchImageFromServer(imageData)` - 获取图片并转换为Base64
- `prefetchImagesToCache(currentPage, totalPages)` - 预取图片到缓存
- `getImageFromCache(pageNum)` - 从缓存获取并移除图片
- `saveCacheSettings(currentPage, totalPages)` - 保存缓存配置

---

### 2. **useCropper.js** - 图片裁剪功能
负责 Cropper 的初始化和所有图片编辑操作：

**状态（Refs）：**
- `cropper` - Cropper 实例引用
- `isCropping` - 裁剪模式开关
- `croppedList` - 已裁剪图片列表

**方法：**
- `initCropper()` - 初始化 Cropper 实例
- `fitToScreen()` - 自动适应屏幕尺寸
- `toggleCrop()` - 切换裁剪模式
- `zoom(value)` - 缩放操作
- `rotate(degree)` - 旋转操作
- `getCroppedImage()` - 获取裁剪后的图片
- `handleRightClick()` - 右键点击处理（确认裁剪）
- `destroyCropper()` - 销毁 Cropper 实例

---

### 3. **useLightbox.js** - 灯箱预览
负责裁剪图片的全屏预览功能：

**状态（Refs）：**
- `showLightbox` - 灯箱显示状态
- `activePreviewIndex` - 当前预览图片索引

**方法：**
- `openLightbox(index)` - 打开灯箱
- `closeLightbox()` - 关闭灯箱
- `prevPreview()` - 上一张预览
- `nextPreview()` - 下一张预览

---

### 4. **usePagination.js** - 分页管理
负责页面导航和缓存加载的整合：

**状态（Refs）：**
- `currentPage` - 当前页码
- `totalPages` - 总页数

**方法：**
- `loadPageFromCache()` - 从缓存加载页面（优先级：缓存 > 预取 > 等待）
- `prevPage()` - 上一页
- `nextPage()` - 下一页

---

### 5. **useSidebar.js** - 侧边栏管理
负责所有侧边栏相关功能（目录、漫画列表、历史记录）：

**状态（Refs）：**
- `showContents` - 目录显示状态
- `showMangaList` - 漫画列表显示状态
- `showHistory` - 历史记录显示状态
- `mangaList` - 漫画列表数据
- `contentsList` - 目录列表数据
- `historyList` - 阅读历史数据

**方法：**
- `toggleContents()` - 切换目录显示
- `toggleMangaList()` - 切换漫画列表显示
- `toggleHistory()` - 切换历史记录显示
- `selectContent(content)` - 选择目录项
- `selectManga(manga)` - 选择漫画
- `selectHistory(item)` - 选择历史记录项
- `addHistory(mangaId, page)` - 添加到历史记录
- `clearHistory()` - 清空历史记录

---

### 6. **useKeyboard.js** - 键盘快捷键
负责所有键盘事件的处理：

**方法：**
- `handleKeyDown(e)` - 键盘事件处理函数
- `setupKeyboardListener()` - 设置键盘监听器
- `removeKeyboardListener()` - 移除键盘监听器

**支持的快捷键：**
- `←/→ (ArrowLeft/ArrowRight)` - 上一页/下一页
- `+/-` - 放大/缩小
- `Ctrl+R` - 旋转90度
- `C` - 切换裁剪模式
- `Esc` - 取消裁剪

---

## 🔄 数据流向

### 初始化流程
1. 组件挂载 (`onMounted`)
2. 初始化 Cropper
3. 获取漫画图片列表 (`fetchMangaImageList`)
4. 执行第一次预取 (`prefetchImagesToCache`)
5. 加载第一页 (`loadPageFromCache`)
6. 设置键盘监听

### 翻页流程
1. 用户按键或点击按钮
2. 触发 `prevPage()` 或 `nextPage()`
3. 调用 `loadPageFromCache()`
4. 优先从缓存取，如不存在则触发预取
5. 显示图片并更新 Cropper

### 缓存更新流程
1. 每3秒检查一次是否需要补充缓存
2. 计算当前页 + 预取数量的范围
3. 批量获取缺失的图片
4. 添加到缓存队列
5. 超过容量时触发 LRU 清理

---

## 🎯 优势

✅ **模块化架构** - 清晰的责任划分，每个 composable 专注于特定功能
✅ **可维护性强** - 函数和状态组织更清晰，易于理解和修改
✅ **可复用性高** - Composables 可在其他组件中重用
✅ **易于测试** - 独立的 composables 更容易进行单元测试
✅ **性能优化** - 代码分离使得 Tree-shaking 更有效
✅ **文档清晰** - 每个 composable 的职责一目了然

---

## 📝 原文件备份

原始的单一组件文件已备份为 `mangareader.vue.bak`

---

## 🚀 使用方式

所有的 composables 已在主组件 `mangareader.vue` 中导入和使用：

```javascript
import { useImageCache } from '../composables/useImageCache';
import { useCropper } from '../composables/useCropper';
import { useLightbox } from '../composables/useLightbox';
import { usePagination } from '../composables/usePagination';
import { useSidebar } from '../composables/useSidebar';
import { useKeyboard } from '../composables/useKeyboard';

// 初始化所有 composables
const imageCache = useImageCache();
const pagination = usePagination(imageCache);
const sidebar = useSidebar(imageCache, pagination);
const cropper = useCropper(imageRef);
const lightbox = useLightbox(cropper.croppedList);
const keyboard = useKeyboard(pagination, cropper);
```

---

## 🔗 依赖关系

```
主组件 (mangareader.vue)
├── useImageCache (独立)
├── useCropper (依赖: imageRef)
├── useLightbox (依赖: cropper.croppedList)
├── usePagination (依赖: imageCache)
├── useSidebar (依赖: imageCache, pagination)
└── useKeyboard (依赖: pagination, cropper)
```

---

## 📈 代码规模对比

| 指标 | 原始 | 重构后 |
|------|------|--------|
| mangareader.vue | 1500+ 行 | ~200 行 |
| useImageCache.js | - | 200 行 |
| useCropper.js | - | 150 行 |
| useLightbox.js | - | 30 行 |
| usePagination.js | - | 40 行 |
| useSidebar.js | - | 140 行 |
| useKeyboard.js | - | 60 行 |
| **总计** | 1500+ 行 | ~820 行（更清晰） |

---

## ✨ 后续改进建议

1. 【可选】将 composables 再进行细粒度划分
2. 【可选】为每个 composable 添加单元测试
3. 【可选】创建 utils 模块处理通用工具函数
4. 【可选】使用 TypeScript 为 composables 添加类型定义
5. 【可选】创建 stores 模块使用 Pinia 进行状态管理

---

## 📞 支持

如有问题或建议，欢迎反馈！

