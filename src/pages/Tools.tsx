import { Link } from 'react-router-dom'
import './Tools.css'

export default function Tools() {
  return (
    <div className="split-container">
      <div className="split-section-wrapper">
        <a href="http://mc9.yunmaoc.com:49887/" target="_blank" rel="noopener noreferrer" className="split-section s1">
          <div className="content">
            <h2>卫星云图</h2>
            <p>Satellite Map</p>
          </div>
        </a>
        <Link to="/developing" className="split-section s2">
          <div className="content">
            <h2>语音聊天</h2>
            <p>Voice Chat</p>
          </div>
        </Link>
      </div>
    </div>
  )
}
