import Footer from '@/components/Footer'
import ImagePreview from '@/components/ImagePreview'
import SmartImage from '@/components/SmartImage'
import { useImagePreview } from '@/hooks/useImagePreview'
import { ImageData, SiteData, useJson, zipImages } from '@/hooks/useJson'
import './AboutUs.css'

// 团队成员：后续加人只需往数组里补一条（原版靠注释掉的 HTML 块）
const TEAM = [
  { name: 'TheChips2557', role: '腐竹/Owner', desc: '负责服务器的整体运营与维护，把控发展方向。' },
]

// 两个图片板块结构一致，抽成小组件数据驱动渲染
type PhotoSectionProps = {
  title: string
  sectionClass: string
  images: ImageData[]
  itemClass?: string
  alt: string
  onOpen: (image: string) => void
}

function PhotoSection({ title, sectionClass, images, itemClass, alt, onOpen }: PhotoSectionProps) {
  return (
    <section className={`photo-section ${sectionClass}`}>
      <h2 className="section-title">{title}</h2>
      <div className="photo-grid">
        {images.map((img, index) => (
          <div key={index} className={`photo-item${itemClass ? ` ${itemClass}` : ''}`} onClick={() => onOpen(img.full)}>
            <div className="photo-frame">
              <SmartImage src={img.thumb} loading="lazy" alt={alt} />
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default function AboutUs() {
  const data = useJson<SiteData>('/imgs/data.json')
  const playerImages = data?.player ? zipImages(data.player, data.player_thumb) : []
  const groupImages = data?.groupPhoto ? zipImages(data.groupPhoto, data.groupPhoto_thumb) : []
  const { selectedImage, openPreview, closePreview } = useImagePreview()

  return (
    <div className="about-us-container">
      <div className="about-us-content">
        <h2 className="section-title">CSC Team</h2>
        <div className="cards-wrapper">
          {TEAM.map(member => (
            <div className="team-card" key={member.name}>
              <div className="card-content">
                <h2>{member.name}</h2>
                <span className="role-badge">{member.role}</span>
                <p className="description">{member.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* 玩家风采板块 */}
        <PhotoSection
          title="CSC Player / 玩家风采"
          sectionClass="player-section"
          images={playerImages}
          alt="Player selfie"
          onOpen={openPreview}
        />

        {/* 集体合影板块 */}
        <PhotoSection
          title="CSC Memories / 集体合影"
          sectionClass="group-section"
          images={groupImages}
          itemClass="wide"
          alt="Group memory"
          onOpen={openPreview}
        />
      </div>

      <ImagePreview src={selectedImage} onClose={closePreview} />
      <Footer />
    </div>
  )
}
