import Footer from '@/components/Footer'
import ImagePreview from '@/components/ImagePreview'
import SmartImage from '@/components/SmartImage'
import { useImagePreview } from '@/hooks/useImagePreview'
import { SiteData, useJson, zipImages } from '@/hooks/useJson'
import './Scenery.css'

// 每组 5 张：1 大 + 4 小
const GROUP_SIZE = 5

export default function Scenery() {
  const data = useJson<SiteData>('/imgs/data.json')
  const allImages = data?.building ? zipImages(data.building, data.building_thumb) : []
  const { selectedImage, openPreview, closePreview } = useImagePreview()

  const groups = []
  for (let i = 0; i < allImages.length; i += GROUP_SIZE) {
    groups.push(allImages.slice(i, i + GROUP_SIZE))
  }

  return (
    <div className="scenery-page">
      <header className="page-header">
        <h1>CSC 建筑风景</h1>
        <p>方块堆叠的艺术，记录世界的每一处精彩</p>
      </header>

      <div className="gallery-container">
        {groups.map((group, gIndex) => (
          <div key={gIndex} className={`gallery-group${gIndex % 2 !== 0 ? ' reverse' : ''}`}>
            {/* 主图 (大图) */}
            {group[0] && (
              <div className="photo-card main-card" onClick={() => openPreview(group[0].full)}>
                <div className="img-wrapper">
                  <SmartImage
                    src={group[0].full}
                    srcSet={`${group[0].thumb} 800w, ${group[0].full} 1920w`}
                    sizes="(max-width: 768px) 90vw, 55vw"
                    loading="lazy"
                    alt="Building showcase main"
                  />
                </div>
              </div>
            )}

            {/* 副图 (4张网格) */}
            <div className="sub-grid">
              {group.slice(1, 5).map((item, sIndex) => (
                <div key={sIndex} className="photo-card sub-card" onClick={() => openPreview(item.full)}>
                  <div className="img-wrapper">
                    <SmartImage src={item.thumb} loading="lazy" alt="Building showcase sub" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <ImagePreview src={selectedImage} onClose={closePreview} />
      <Footer />
    </div>
  )
}
