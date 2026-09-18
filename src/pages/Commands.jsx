import { Fragment } from 'react'
import Footer from '@/components/Footer'
import { useJson } from '@/hooks/useJson'
import './Commands.css'

export default function Commands() {
  const categories = useJson('/commandPage/commands.json')

  return (
    <div className="commands-page">
      <div className="commands-container">
        <div className="page-header">
          <h1 className="page-title">指令列表</h1>
          <p className="page-subtitle">查看所有可以使用的指令</p>
        </div>

        <div className="command-table-container">
          {categories?.map(category => (
            <Fragment key={category.title}>
              {/* 分类标题行 */}
              <div className="table-row category-row">
                <div className="category-cell">{category.title}</div>
              </div>

              {/* 指令行 */}
              {category.commands.map(cmd => (
                <div className="table-row" key={cmd.main}>
                  <div className="col-cmd">
                    <span className="cmd-pill">{cmd.main}</span>
                    {cmd.sub && cmd.sub !== '无' && <span className="cmd-sub-text"> {cmd.sub}</span>}
                  </div>
                  <div className="col-desc">{cmd.desc}</div>
                </div>
              ))}
            </Fragment>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  )
}
