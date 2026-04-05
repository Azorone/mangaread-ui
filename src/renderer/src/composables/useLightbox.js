import { ref } from 'vue';

/**
 * 灯箱预览管理composable
 * 负责裁剪图片的预览和浏览
 */
export function useLightbox(croppedList) {
  const showLightbox = ref(false);
  const activePreviewIndex = ref(0);

  // ========================
  // 灯箱控制
  // ========================
  const openLightbox = (index = 0) => {
    showLightbox.value = true;
    activePreviewIndex.value = index;
  };

  const closeLightbox = () => {
    showLightbox.value = false;
  };

  // 上一张预览
  const prevPreview = () => {
    if (croppedList.value.length === 0) return;
    
    activePreviewIndex.value = (activePreviewIndex.value - 1 + croppedList.value.length) % croppedList.value.length;
  };

  // 下一张预览
  const nextPreview = () => {
    if (croppedList.value.length === 0) return;
    
    activePreviewIndex.value = (activePreviewIndex.value + 1) % croppedList.value.length;
  };

  return {
    showLightbox,
    activePreviewIndex,
    // 方法
    openLightbox,
    closeLightbox,
    prevPreview,
    nextPreview
  };
}
