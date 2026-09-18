import { SITE } from '@/config/site'
import './Footer.css'

export default function Footer() {
  return (
    <footer className="app-footer">
      <div className="footer-content">
        <div className="footer-links">
          <a href={SITE.bilibili} target="_blank" rel="noopener noreferrer" className="footer-link">
            {SITE.bilibiliName}
          </a>
          <span className="separator">/</span>
          <a href={SITE.qqJoinUrl} target="_blank" rel="noopener noreferrer" className="footer-link">
            QQ群:{SITE.qqGroup}
          </a>
        </div>
        <p>&copy; 2026 {SITE.name}. All Rights Reserved.</p>
        <div className="footer-bottom">
          <span className="dev-credit">Dev by Connor</span>
        </div>
      </div>
    </footer>
  )
}
