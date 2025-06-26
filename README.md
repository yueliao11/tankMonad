# Monad Tank Battle 🚗💥

一个建立在Monad区块链上的实时多人坦克战斗游戏，具有Web3身份验证和使用MultiSynq技术的同步游戏玩法。

## 🌟 功能特色

### 🎮 核心游戏玩法
- **实时多人战斗** - 最多10名玩家同时对战
- **3分钟战斗回合** - 快节奏、竞技性对战
- **怪物狩猎** - 通过消灭AI控制的怪物获得分数
- **坦克定制** - 独特颜色和玩家标识
- **实时排行榜** - 实时评分和排名
- **多种武器系统** - 6种不同类型的武器
- **装甲防护系统** - 6种装甲类型和伤害计算
- **物理碰撞系统** - 真实的碰撞检测和地图边界
- **视觉特效系统** - 粒子效果和爆炸动画
- **3D空间音效** - 沉浸式音频体验
- **移动端支持** - 触摸控制和自适应界面

### 🔗 Web3集成
- **Monad区块链支持** - 原生集成Monad测试网/主网
- **钱包认证** - MetaMask和其他Web3钱包
- **SIWE认证** - 使用以太坊登录进行安全身份验证
- **去中心化身份** - 钱包地址作为玩家标识符

### 🌐 多人游戏技术
- **MultiSynq同步** - 所有玩家间的确定性状态同步
- **P2P通信** - 无需后端服务器
- **实时更新** - 20 FPS物理模拟，60 FPS视觉插值
- **延迟补偿** - 即使在网络延迟情况下也能流畅游戏

### 🎨 3D图形
- **Three.js渲染** - 浏览器中的现代3D图形
- **React Three Fiber** - 声明式3D场景管理
- **动态光照** - 阴影、雾效和环境效果
- **流畅动画** - 插值运动和视觉效果

## 🚀 快速开始

### 先决条件
- Node.js 18+ 
- npm 或 yarn
- 支持WebGL的现代网络浏览器
- Web3钱包（推荐MetaMask）

### 安装

1. **克隆仓库**
   ```bash
   git clone <repository-url>
   cd monad-tank-battle
   ```

2. **安装依赖**
   ```bash
   npm install
   ```

3. **配置环境**
   ```bash
   cp .env.example .env
   ```
   
   编辑 `.env` 并添加您的WalletConnect项目ID:
   ```
   VITE_WALLET_CONNECT_PROJECT_ID=your_project_id_here
   ```

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

5. **在浏览器中打开**
   导航到 `http://localhost:3000`

## 🎯 游戏玩法详细介绍

### 基础操作
1. **连接钱包**
   - 点击"连接钱包"并选择您的Web3钱包
   - 确保已连接到Monad网络

2. **签名认证**
   - 签署SIWE消息以验证您的身份
   - 这将创建您的安全玩家会话

3. **加入战斗**
   - 自动进入当前战斗回合
   - 等待其他玩家加入（或与AI怪物对战）

### 控制系统

#### 桌面端控制
- **WASD** - 移动坦克（W=前进，S=后退，A/D=转向）
- **鼠标移动** - 瞄准炮塔
- **鼠标左键** - 开火
- **空格键** - 紧急制动
- **1-6数字键** - 切换武器类型
- **R键** - 重新装填弹药

#### 移动端控制
- **左侧虚拟摇杆** - 移动坦克
- **右侧虚拟摇杆** - 瞄准炮塔
- **右侧摇杆点击** - 开火
- **武器切换按钮** - 更换武器
- **重装按钮** - 重新装填
- **支持触觉反馈** - 增强沉浸感

### 🔫 武器系统

#### 1. 主炮 (Cannon)
- **伤害**: 100
- **射程**: 50单位
- **冷却时间**: 2000ms
- **弹药容量**: 20发
- **特点**: 高伤害，慢射速，适合远程狙击

#### 2. 机枪 (Machine Gun)
- **伤害**: 25
- **射程**: 30单位
- **冷却时间**: 200ms
- **弹药容量**: 200发
- **特点**: 连续射击，适合近距离战斗

#### 3. 火箭炮 (Rocket)
- **伤害**: 150
- **射程**: 40单位
- **冷却时间**: 3000ms
- **弹药容量**: 10发
- **特点**: 超高伤害，范围爆炸，但装填缓慢

#### 4. 等离子炮 (Plasma)
- **伤害**: 80
- **射程**: 35单位
- **冷却时间**: 1500ms
- **弹药容量**: 50发
- **特点**: 能量武器，无视部分装甲

#### 5. 霰弹炮 (Shotgun)
- **伤害**: 60 (总计)
- **射程**: 20单位
- **冷却时间**: 1000ms
- **弹药容量**: 30发
- **特点**: 散射弹药，近距离毁灭性伤害

#### 6. 狙击炮 (Sniper)
- **伤害**: 200
- **射程**: 80单位
- **冷却时间**: 4000ms
- **弹药容量**: 15发
- **特点**: 超远射程，一击必杀，但需要精确瞄准

### 🛡️ 装甲系统

#### 1. 轻型装甲 (Light Armor)
- **生命值**: 75
- **护盾**: 25
- **移动速度**: 110%
- **特殊能力**: 快速修复
- **适用**: 机动作战，快速突击

#### 2. 中型装甲 (Medium Armor)
- **生命值**: 100
- **护盾**: 50
- **移动速度**: 100%
- **特殊能力**: 平衡防护
- **适用**: 全能型坦克

#### 3. 重型装甲 (Heavy Armor)
- **生命值**: 150
- **护盾**: 0
- **移动速度**: 80%
- **特殊能力**: 撞击伤害
- **适用**: 前线坦克，承受伤害

#### 4. 反应装甲 (Reactive Armor)
- **生命值**: 100
- **护盾**: 30
- **移动速度**: 90%
- **特殊能力**: 爆炸反击
- **适用**: 近距离战斗

#### 5. 复合装甲 (Composite Armor)
- **生命值**: 120
- **护盾**: 40
- **移动速度**: 95%
- **特殊能力**: 伤害吸收
- **适用**: 持久战斗

#### 6. 能量装甲 (Energy Armor)
- **生命值**: 80
- **护盾**: 80
- **移动速度**: 105%
- **特殊能力**: 护盾快速恢复
- **适用**: 高科技作战

### 🎯 伤害计算系统

#### 命中位置伤害修正
- **正面装甲**: 0.8倍伤害
- **侧面装甲**: 1.0倍伤害
- **后部装甲**: 1.5倍伤害
- **炮塔**: 1.2倍伤害

#### 装甲抗性
每种装甲对不同武器类型有不同的抗性：
- **物理武器** vs **重型装甲**: 0.7倍伤害
- **能量武器** vs **能量装甲**: 0.6倍伤害
- **爆炸武器** vs **反应装甲**: 额外爆炸伤害

### 🗺️ 地图系统

#### 地图边界
- **地图大小**: 100×100单位
- **边界碰撞**: 坦克无法越界
- **视觉指示**: 边界有明显的围墙标识

#### 障碍物系统
- **岩石障碍**: 阻挡移动和射击
- **建筑掩体**: 可破坏的防护结构
- **战略位置**: 影响战术布置

### 🎵 音效系统

#### 武器音效
- **开火声音**: 每种武器有独特音效
- **弹药撞击**: 不同材质撞击声音
- **爆炸声效**: 多层次爆炸音效

#### 环境音效
- **引擎声音**: 坦克移动音效
- **履带声音**: 地面摩擦声音
- **环境音**: 风声、远距离战斗声

#### 3D空间音频
- **距离衰减**: 根据距离调整音量
- **方向定位**: 立体声定位
- **遮挡效果**: 障碍物影响声音传播

### 💥 视觉特效系统

#### 粒子效果类型
1. **爆炸效果** - 武器撞击和坦克毁灭
2. **火焰效果** - 持续燃烧动画
3. **烟雾效果** - 爆炸后烟雾
4. **火花效果** - 金属撞击火花
5. **尘土效果** - 坦克移动扬尘
6. **碎片效果** - 装甲破碎碎片
7. **枪口闪光** - 武器开火闪光
8. **护盾撞击** - 护盾受击效果
9. **子弹撞击** - 普通撞击效果
10. **引擎尾焰** - 坦克推进器效果
11. **能量光束** - 等离子武器效果
12. **电磁波** - EMP特效

#### 渲染优化
- **GPU加速粒子** - 利用GPU并行计算
- **LOD系统** - 根据距离调整质量
- **批处理渲染** - 减少绘制调用

### 🏆 游戏目标

#### 主要目标
- **消灭敌方坦克** - 获得击杀分数
- **摧毁怪物** - 获得狩猎积分
- **生存时间** - 存活越久分数越高
- **占领区域** - 控制战略要点

#### 评分系统
- **击杀敌方坦克**: +500分
- **消灭怪物**: +100分
- **助攻**: +50分
- **存活时间**: 每分钟+10分
- **连杀奖励**: 连续击杀额外分数

## 🛠️ 技术架构

### 前端技术栈
- **React 18** - 用户界面框架
- **TypeScript** - 类型安全开发
- **Vite** - 快速构建工具和开发服务器
- **Tailwind CSS** - 实用优先的样式
- **Three.js + React Three Fiber** - 3D图形
- **Zustand** - 状态管理

### Web3技术栈
- **Wagmi** - 以太坊React钩子
- **RainbowKit** - 钱包连接UI
- **SIWE** - 使用以太坊登录
- **Viem** - 以太坊客户端库

### 多人游戏技术栈
- **MultiSynq** - 确定性状态同步
- **模型-视图-会话** - 游戏架构模式
- **基于Actor的实体** - 坦克、怪物、子弹模型

### 游戏架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   TankGameView  │    │ TankGameModel   │    │  MultiSynq      │
│                 │    │                 │    │  Network        │
│ • 输入捕获      │◄──►│ • 游戏逻辑      │◄──►│                 │
│ • 3D渲染        │    │ • 碰撞检测      │    │ • 状态同步      │
│ • UI更新        │    │ • AI行为        │    │ • P2P通信       │
│ • 音效播放      │    │ • 物理模拟      │    │ • 网络优化      │
│ • 特效显示      │    │ • 武器系统      │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 新增系统架构

#### 物理系统 (physics.ts)
```typescript
export class CollisionSystem {
  // 地图边界检测
  static isWithinMapBounds(position: Position, radius: number): boolean
  
  // 圆形碰撞检测
  static circleCollision(pos1: Position, radius1: number, pos2: Position, radius2: number): boolean
  
  // 射线与盒子碰撞检测
  static rayBoxIntersection(rayOrigin: Position, rayDirection: Vector3, boxCenter: Position, boxSize: BoxSize): CollisionResult
}
```

#### 武器系统 (weaponSystem.ts)
```typescript
export class WeaponSystem {
  // 开火系统
  fire(ownerId: string, startPosition: Position, direction: Vector3, currentTime: number): Projectile[]
  
  // 弹药管理
  consumeAmmo(weaponType: WeaponType, amount: number): boolean
  
  // 重装系统
  reload(weaponType: WeaponType): void
}
```

#### 装甲系统 (armorSystem.ts)
```typescript
export class ArmorSystem {
  // 伤害计算
  takeDamage(damage: DamageInstance): DamageResult
  
  // 护盾系统
  regenerateShield(deltaTime: number): void
  
  // 特殊能力
  activateAbility(abilityType: ArmorAbilityType): boolean
}
```

#### 音频系统 (audioSystem.ts)
```typescript
export class AudioSystem {
  // 播放音效
  playSound(effect: SoundEffect, position?: Position, volumeMultiplier?: number): string | null
  
  // 3D音频定位
  updateListenerPosition(position: Position): void
  
  // 音量控制
  setVolume(category: AudioCategory, volume: number): void
}
```

## 🎮 游戏机制详解

### 战斗系统
- **坦克生命值**: 根据装甲类型变化（75-150 HP）
- **护盾系统**: 额外防护层，可再生
- **怪物生命值**: 50 HP  
- **子弹伤害**: 根据武器类型变化（25-200 HP）
- **怪物伤害**: 15 HP
- **武器冷却**: 根据武器类型变化（200-4000ms）
- **子弹速度**: 20单位/秒
- **子弹生存时间**: 3秒

### 移动系统
- **坦克速度**: 根据装甲影响（4-5.5单位/秒）
- **怪物速度**: 2单位/秒（追击时3单位/秒）
- **转向速度**: 基于输入的平滑旋转
- **物理模拟**: 摩擦力和动量模拟

### AI行为
- **怪物状态**: 空闲、追击、攻击
- **检测半径**: 15单位
- **攻击范围**: 3单位
- **寻路算法**: 直线追击配合障碍物规避

### 弹药系统
- **弹药容量**: 每种武器有不同容量
- **重装时间**: 根据武器类型变化
- **弹药类型**: 不同武器使用不同弹药
- **补给机制**: 可从地图补给点获取

## 🌍 部署

### 开发环境
```bash
npm run dev        # 启动开发服务器
npm run build      # 构建生产版本  
npm run preview    # 预览生产构建
npm run lint       # 运行ESLint
```

### 生产部署

1. **构建应用程序**
   ```bash
   npm run build
   ```

2. **部署到静态托管**
   - 将 `dist/` 文件夹上传到托管提供商
   - 推荐：Vercel、Netlify、GitHub Pages
   - 确保启用HTTPS（Web3必需）

3. **配置域名白名单**
   - 将您的域名添加到MultiSynq白名单
   - 或在开发时启用"允许localhost和本地网络"

### 环境配置

| 变量 | 描述 | 必需 |
|----------|-------------|----------|
| `VITE_WALLET_CONNECT_PROJECT_ID` | WalletConnect项目ID | 是 |
| `VITE_MULTISYNQ_API_KEY` | MultiSynq API密钥 | 否（默认为包含的密钥） |
| `VITE_MULTISYNQ_APP_ID` | 应用标识符 | 否（默认为已配置） |

## 🔧 开发

### 项目结构
```
src/
├── components/          # React组件
│   ├── auth/           # 认证界面
│   ├── game/           # 游戏UI和3D场景  
│   ├── ui/             # 可复用UI组件
│   └── meshes/         # 3D模型组件
├── game/               # 游戏逻辑
│   ├── models/         # MultiSynq模型（共享状态）
│   └── views/          # MultiSynq视图（本地状态）
├── hooks/              # 自定义React钩子
├── lib/                # 工具和配置
│   ├── physics.ts      # 物理引擎和碰撞检测
│   ├── weaponSystem.ts # 武器系统
│   ├── armorSystem.ts  # 装甲系统
│   └── audioSystem.ts  # 音频系统
├── store/              # Zustand状态存储
└── types/              # TypeScript类型定义
```

### 添加新功能

1. **游戏逻辑** - 扩展 `src/game/models/` 中的模型
2. **3D图形** - 在 `src/components/game/meshes/` 中添加组件
3. **UI元素** - 在 `src/components/ui/` 中创建组件
4. **Web3功能** - 在 `src/components/auth/` 中扩展认证
5. **物理系统** - 修改 `src/lib/physics.ts`
6. **武器系统** - 扩展 `src/lib/weaponSystem.ts`
7. **装甲系统** - 更新 `src/lib/armorSystem.ts`
8. **音效系统** - 添加到 `src/lib/audioSystem.ts`

### 测试多人游戏

1. **本地测试**
   - 打开多个浏览器窗口/标签页
   - 每个窗口作为单独的玩家
   - 使用开发者工具网络限速测试

2. **网络测试**
   - 部署到测试环境
   - 使用多个设备测试
   - 验证跨平台兼容性

## 🐛 故障排除

### 常见问题

**"连接MultiSynq失败"**
- 检查您的网络连接
- 验证MultiSynq API密钥有效
- 确保域名在MultiSynq仪表板中已列入白名单

**"钱包连接失败"**
- 确保已安装并解锁MetaMask
- 在钱包中切换到Monad网络
- 清除浏览器缓存和cookie

**"玩家间游戏不同步"**
- 检查浏览器控制台错误
- 验证所有玩家都在同一会话中
- 确保已启用JavaScript

**性能差/低FPS**
- 在游戏设置中降低图形质量
- 关闭其他浏览器标签页
- 更新图形驱动程序
- 使用Chrome/Firefox获得最佳性能

**移动端控制问题**
- 确保触摸事件正常工作
- 检查虚拟摇杆响应
- 验证触觉反馈功能

**音效问题**
- 检查浏览器音频权限
- 确保音量设置正确
- 验证3D音频定位功能

### 获取帮助

- 查看 [MultiSynq文档](https://multisynq.io/docs)
- 加入 [Monad Discord](https://discord.gg/monad)
- 通过GitHub issues报告错误
- 在项目讨论中提问

## 📊 性能优化

### 渲染优化
- **LOD系统** - 根据距离调整模型细节
- **视锥剔除** - 只渲染可见对象
- **批处理** - 减少绘制调用
- **纹理压缩** - 优化内存使用

### 网络优化
- **增量更新** - 只同步变化的数据
- **压缩** - 减少网络带宽使用
- **预测** - 本地预测减少延迟感知

### 音频优化
- **距离衰减** - 远距离声音自动静音
- **音效池** - 重用音频实例
- **压缩格式** - 使用适当的音频格式

## 📄 许可证

本项目在MIT许可证下授权 - 详情请参阅 [LICENSE](LICENSE) 文件。

## 🤝 贡献

1. Fork仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开Pull Request

## 🙏 致谢

- **MultiSynq** - 实时多人同步
- **Monad** - 高性能区块链平台
- **Three.js** - 3D图形库
- **React Three Fiber** - Three.js的React渲染器
- **RainbowKit** - 美观的钱包连接UX

---

使用 ❤️ 为Monad生态系统构建

## 🔐 认证流程

### 简化的认证步骤
1. **连接钱包** - 点击"Connect Wallet"选择你的钱包
2. **网络切换** - 如果不在Monad网络，点击"Switch to Monad Testnet"
3. **开始游戏** - 连接成功后自动进入游戏！

> **注意**: 我们已经移除了签名消息(SIWE)步骤，现在只需要连接钱包即可开始游戏。

### 支持的钱包
- MetaMask
- WalletConnect 兼容钱包
- Coinbase Wallet
- 其他 Web3 钱包
