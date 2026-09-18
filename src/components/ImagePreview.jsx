import './ImagePreview.css'

/**
 * 大图预览遮罩。组件常驻、靠 .open 切换样式，
 * 进出场动画完全由 CSS transition 完成，无需任何 JS 动画逻辑。
 */
export default function ImagePreview({ src, onClose }) {
  const open = Boolean(src)

  return (
    <div className={`preview-overlay${open ? ' open' : ''}`} onClick={open ? onClose : undefined}>
      <button className="close-btn" onClick={onClose} aria-label="Close Preview">
        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
      <div className="preview-content">
        {src && <img src={src} alt="Full size preview" onClick={e => e.stopPropagation()} />}
      </div>
    </div>
  )
}
