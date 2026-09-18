import './OnlinePlayer.css'

type OnlinePlayerProps = {
  online: number
  max?: number
}

export default function OnlinePlayer({ online, max = 20 }: OnlinePlayerProps) {
  return (
    <div className="server-status">
      <span className="status-dot"></span>
      在线人数: {online} / {max}
    </div>
  )
}
