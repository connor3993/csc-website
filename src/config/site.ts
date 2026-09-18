/**
 * 全站唯一的服务器信息数据源。
 * 名称 / IP / 群号 / 外链等只在这里维护，组件从配置读取，
 * 避免同一字符串散落在多个组件里各改各的。
 */
export const SITE = {
  name: 'CSC Museum',
  ip: 'csc2022.top',
  port: '进群查看->674166080',
  // mcstatus.io 查询用的 Bedrock 端口
  statusPort: 49886,
  qqGroup: '674166080',
  qqJoinUrl: 'https://qm.qq.com/q/k7TDguPCne',
  bilibili: 'https://space.bilibili.com/3494373285169866',
  bilibiliName: 'B站:Chips呀',
  // 接口异常时的版本兜底值
  fallbackVersion: '1.21.132',
}
