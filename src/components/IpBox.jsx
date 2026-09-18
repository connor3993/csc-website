import { useState } from 'react'
import { copyText } from '@/utils/clipboard'
import copyIcon from '@/assets/icons/copy.png'
import checkIcon from '@/assets/icons/check.png'
import './IpBox.css'

// 两行结构完全一致，抽成数据驱动渲染
const FIELDS = [
  { key: 'ip', label: 'IP', title: '点击复制 IP' },
  { key: 'port', label: 'PORT', title: '点击复制端口' },
]

export default function IpBox({ ip, port }) {
  const values = { ip, port }
  // 当前显示「已复制」状态的字段（null = 无）
  const [copied, setCopied] = useState(null)

  const handleCopy = async field => {
    try {
      await copyText(values[field])
      setCopied(field)
      setTimeout(() => setCopied(cur => (cur === field ? null : cur)), 1500)
    } catch (err) {
      console.error('Copy failed', err)
      alert('复制失败，请手动复制：\n' + values[field])
    }
  }

  return (
    <div className="ip-card">
      {FIELDS.map(({ key, label, title }) => (
        <div key={key} className={`${key}-row`} onClick={() => handleCopy(key)} title={title}>
          <div className="info-group">
            <span className="label">{label}</span>
            <span className="value">{values[key]}</span>
          </div>
          <div className={`icon-wrapper${copied === key ? ' success' : ''}`}>
            <img
              src={copied === key ? checkIcon : copyIcon}
              alt={copied === key ? 'Copied' : 'Copy'}
              className="icon-img"
            />
          </div>
        </div>
      ))}
    </div>
  )
}
