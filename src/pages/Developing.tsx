import { Link } from 'react-router-dom'
import './Developing.css'

export default function Developing() {
  return (
    <div className="developing-page">
      <div className="developing-container">
        <h1 className="developing-text">功能开发中...</h1>
        <p className="developing-subtext">工程师正在拼命钻研，敬请期待！</p>
        <Link to="/tools" className="back-btn">返回功能界面</Link>
      </div>
    </div>
  )
}
