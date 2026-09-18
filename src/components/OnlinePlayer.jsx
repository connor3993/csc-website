import './OnlinePlayer.css'

export default function OnlinePlayer({ online, max = 20 }) {
  return (
    <div className="server-status">
      <span className="status-dot"></span>
      在线人数: {online} / {max}
    </div>
  )
}
