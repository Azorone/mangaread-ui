/**
 * 键盘快捷键管理composable
 * 负责键盘事件处理
 */
export function useKeyboard(pagination, cropper) {
  // ========================
  // 键盘快捷键处理
  // ========================
  const handleKeyDown = async (e) => {
    // 忽略输入框中的按键
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return
    }

    switch (e.key) {
      // 方向键控制页面翻页
      case 'ArrowLeft':
        e.preventDefault()
        await pagination.prevPage()
        break
      case 'ArrowRight':
        e.preventDefault()
        await pagination.nextPage()
        break

      // +/- 缩放
      case '+':
      case '=':
        e.preventDefault()
        cropper.zoom(0.1)
        break
      case '-':
      case '_':
        e.preventDefault()
        cropper.zoom(-0.1)
        break

      // Ctrl+R 旋转
      case 'r':
      case 'R':
        if (e.ctrlKey) {
          e.preventDefault()
          cropper.rotate(90)
        }
        break

      // Esc 取消裁剪
      case 'Escape':
        if (cropper.isCropping.value) {
          e.preventDefault()
          cropper.toggleCrop()
        }
        break

      // C 启用/禁用裁剪模式
      case 'c':
      case 'C':
        e.preventDefault()
        cropper.toggleCrop()
        break
      // A 向左移动图片
      case 'a':
      case 'A':
        e.preventDefault()
        cropper.move(-10)
        break

      // D 向右移动图片
      case 'd':
      case 'D':
        e.preventDefault()
        cropper.move(10)
        break
      default:
        break
      case 'w':
        e.preventDefault()
        cropper.move(0, 20)
        break
      case 's':
        e.preventDefault()
        cropper.move(0, -10)
        break
       case 'W':
        e.preventDefault()
        cropper.move(0, 20)
        break
      case 'S':
        e.preventDefault()
        cropper.move(0, -10)
    }
  }

  // 安装和卸载事件监听
  const setupKeyboardListener = () => {
    window.addEventListener('keydown', handleKeyDown)
  }

  const removeKeyboardListener = () => {
    window.removeEventListener('keydown', handleKeyDown)
  }

  return {
    // 方法
    handleKeyDown,
    setupKeyboardListener,
    removeKeyboardListener
  }
}
