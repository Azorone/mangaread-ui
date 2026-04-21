import { ref } from 'vue'
import Cropper from 'cropperjs'

/**
 * 图片裁剪管理composable
 * 负责Cropper初始化、图片编辑操作
 */
export function useCropper(imageRef) {
  const cropper = ref(null)
  const isCropping = ref(false)
  const croppedList = ref([])

  // ========================
  // 初始化Cropper
  // ========================
  const initCropper = () => {
    // 确保图片DOM节点已存在
    if (!imageRef.value) return

    // 初始化Cropper实例，配置裁剪参数
    cropper.value = new Cropper(imageRef.value, {
      viewMode: 0, // 0: 自由放大/缩小，图片能充分利用容器空间
      autoCrop: false, // 禁用自动裁剪，需手动启用
      movable: true, // 支持移动图片
      zoomable: true, // 支持缩放图片
      scalable: false, // 禁用缩放选区
      rotatable: true, // 支持旋转图片
      background: false, // 禁用背景
      checkCrossOrigin: false, // 禁用跨域检查，支持自定义协议
      
      ready() {
        // Cropper初始化完成时的回调
        console.log('漫画图片加载完成，裁剪器就绪')
        // 自动适配屏幕大小
       fitToScreen()
      }
    })
  }

  // ========================
  // 自适应屏幕尺寸
  // ========================
  const fitToScreen = () => {
    // 确保Cropper实例存在
    if (!cropper.value) return

    try {
      // 获取容器（视口）尺寸
      const containerData = cropper.value.getContainerData()
      // 获取原始图片尺寸
      const imageData = cropper.value.getImageData()

      // 基础检查：确保获取到了数据
      if (!containerData || !imageData) {
        console.warn('容器或图片数据未就绪，跳过自适应操作')
        return
      }

      // 如果容器尺寸异常小，尝试等待后重试
      if (containerData.width < 50 || containerData.height < 50) {
        console.warn('容器尺寸过小，延迟重试自适应')
        setTimeout(fitToScreen, 200)
        return
      }
      if (imageData.naturalHeight/imageData.naturalWidth > 1.5) {
        let  r = containerData.width / imageData.naturalWidth;
        cropper.value.zoomTo(r);
       cropper.value.moveTo(
       0,0
      )
        return
      }
      // 计算缩放比例（取宽高较小值，确保图片完全显示）
      const ratio = Math.min(
        containerData.width / imageData.naturalWidth,
        containerData.height / imageData.naturalHeight
      )

      // 缩放到计算的比例
      cropper.value.zoomTo(ratio)
      // 将图片居中显示
      cropper.value.moveTo(
        (containerData.width - imageData.naturalWidth * ratio) / 2,
        (containerData.height - imageData.naturalHeight * ratio) / 2
      )
    } catch (error) {
      // 捕获任何错误，防止应用崩溃
      console.warn('自适应屏幕时出错：', error)
    }
  }

  // ========================
  // 右键点击事件 - 确认裁剪
  // ========================
  const handleRightClick = () => {
    // 仅在裁剪模式启用且Cropper存在时响应
    if (!isCropping.value || !cropper.value) return

    // 获取当前选区数据
    const cropData = cropper.value.getData()
    // 检查选区是否有意义（宽高都>10px）
    if (cropData.width > 10 && cropData.height > 10) {
      // 保存裁剪后的图片到列表
      getCroppedImage()
      // 清除选区框
      cropper.value.clear()
      console.log('右键确认：裁剪成功并已存入列表')
    }
  }

  // ========================
  // 切换裁剪模式
  // ========================
  const toggleCrop = () => {
    // 确保Cropper实例存在
    if (!cropper.value) return
    // 切换裁剪模式状态
    isCropping.value = !isCropping.value

    if (isCropping.value) {
      // 启用裁剪模式，显示选区框
     // cropper.value.crop()
    } else {
      // 禁用裁剪模式，清除选区框
      //cropper.value.clear()
    }
  }

  // ========================
  // 图片缩放和旋转
  // ========================
  // 缩放图片 (value正值放大，负值缩小)
  const zoom = (value) => cropper.value?.zoom(value)
  // 旋转图片 (度数，正值顺时针)
  const rotate = (deg) => cropper.value?.rotate(deg)
  // 移动图片 (offsetX: 水平位移，正值向右，负值向左)
  const move = (offsetX, offsetY = 0) => cropper.value?.move(offsetX, offsetY)

  // ========================
  // 获取裁剪后的图片
  // ========================
  const getCroppedImage = () => {
    // 确保Cropper实例存在
    if (!cropper.value) return

    try {
      // 获取裁剪后的Canvas画布对象
      // maxWidth/maxHeight: 限制导出图片的最大尺寸
      const canvas = cropper.value.getCroppedCanvas({
        maxWidth: 2048,
        maxHeight: 2048
      })

      // 检查canvas是否有效
      if (!canvas) {
        console.error('Canvas获取失败')
        return
      }

      // 将Canvas转换为Base64编码的PNG图片
      const base64 = canvas.toDataURL('image/png')

      // 检查base64是否有效（应该以data:image开头）
      if (!base64 || !base64.startsWith('data:image')) {
        console.error('Base64图片数据无效')
        return
      }

      // 将新裁剪的图片添加到列表开头（最新的在前）
      croppedList.value.unshift(base64)
      console.log('图片已保存，当前列表数:', croppedList.value.length)
    } catch (error) {
      console.error('获取裁剪图片时出错：', error)
    }
  }

  // 销毁Cropper
  const destroyCropper = () => {
    if (cropper.value) {
      cropper.value.destroy()
      cropper.value = null
    }
  }

  return {
    cropper,
    isCropping,
    croppedList,
    // 方法
    initCropper,
    fitToScreen,
    handleRightClick,
    toggleCrop,
    zoom,
    rotate,
    move,
    getCroppedImage,
    destroyCropper
  }
}
