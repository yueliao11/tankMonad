# 键盘鼠标操作调试指南 🎮🔍

## 🎯 调试日志系统已添加

现在游戏中包含了完整的实时调试日志，可以帮助诊断控制问题。

### 📋 如何使用调试日志

1. **打开浏览器开发者工具**
   - 按 `F12` 或右键选择"检查"
   - 切换到 `Console` 标签页

2. **测试键盘控制**
   - 按下 `W`、`A`、`S`、`D` 或方向键
   - 观察控制台输出

3. **测试鼠标控制**
   - 移动鼠标（偶尔会显示位置）
   - 点击鼠标左键
   - 观察控制台输出

### 🔍 调试日志说明

#### **PlayerControls 组件日志** (客户端输入处理)

```
🎮 PlayerControls: Adding event listeners
📊 Control State on mount: {session: true, user: true, userAddress: "0x123..."}
✅ Event listeners added successfully
```

#### **键盘输入日志**
```
🎮 KeyDown Event: KeyW Session: true User: true
⬆️ Forward key pressed
🔄 Sending moveForward: true
📤 sendInput called with: {moveForward: true}
🔄 Control state change: {old: {...}, new: {...}, change: {...}}
📡 Publishing input to address: 0x123...
📊 Final input data: {moveForward: true, ...}
✅ Input published successfully
```

#### **鼠标输入日志**
```
🖱️ Mouse Click! 0 Session: true User: true
🔫 sendShoot called with direction: {x: 0.12, z: 1}
📡 Publishing shoot to address: 0x123...
🎯 Shoot data: {direction: {x: 0.12, z: 1}}
✅ Shoot published successfully
```

#### **TankModel 接收日志** (MultiSynq模型层)

```
🔔 TankModel subscribing to events for address: 0x123...
✅ Event subscriptions created successfully
🏗️ Tank created for 0x123... at {x: 1.2, y: 0, z: -0.8}
```

#### **输入处理日志**
```
🎮 TankModel.onInput for 0x123...: {moveForward: true, ...}
📊 Current state: alive=true, locked=false
🔄 Input state updated: {old: {...}, new: {...}, change: {...}}
```

#### **移动处理日志**
```
🚶 TankModel.updateMovement for 0x123...: {forward: true, backward: false, left: false, right: false, position: {...}, rotation: 1.23}
🏃 Tank moving: {moveVector: {x: 0.05, z: 0.12}, magnitude: 1, speed: 2.5, deltaTime: 0.05}
```

#### **射击处理日志**
```
🔫 TankModel.onShoot for 0x123...: {direction: {x: 0, z: 1}}
📊 Shoot state: alive=true, locked=false
✅ Spawning bullet at: {x: 2.3, y: 0.5, z: 1.8}
🎯 Bullet spawned successfully
```

### 🚨 常见问题诊断

#### **问题1: 没有任何键盘日志输出**
- **可能原因**: 事件监听器未添加或页面焦点问题
- **日志检查**: 查看是否有 "Adding event listeners" 和 "Event listeners added successfully"
- **解决方案**: 刷新页面，确保点击游戏画面获得焦点

#### **问题2: 有键盘日志但没有发送到MultiSynq**
- **可能原因**: Session或用户连接问题
- **日志检查**: 查看 `❌ Cannot send input: no session or user`
- **解决方案**: 检查调试面板中的连接状态

#### **问题3: 输入发送成功但TankModel没有接收**
- **可能原因**: 地址不匹配或订阅问题
- **日志检查**: 比较 "Publishing input to address" 和 TankModel 的地址
- **解决方案**: 确保地址完全匹配

#### **问题4: TankModel接收到输入但坦克不移动**
- **可能原因**: 游戏状态被锁定或物理更新问题
- **日志检查**: 查看 `❌ Input rejected: alive=false, locked=true`
- **解决方案**: 检查游戏状态和回合系统

#### **问题5: 所有日志都正常但视觉上没有移动**
- **可能原因**: 3D渲染或摄像机问题
- **日志检查**: 查看移动向量和位置更新
- **解决方案**: 检查3D场景渲染和摄像机跟随

### 📊 调试流程

1. **按任意键** → 应该看到键盘事件日志
2. **检查连接状态** → 确保Session和User都是true
3. **查看输入发送** → 确保有"Input published successfully"
4. **检查接收** → 确保TankModel有"onInput"日志
5. **验证移动** → 确保有"Tank moving"日志
6. **观察视觉** → 坦克应该在屏幕上移动

### 🛠️ 快速测试步骤

```
1. 打开F12控制台
2. 按W键 → 应该看到完整的输入链条
3. 点击鼠标 → 应该看到射击链条
4. 如果任何步骤失败，日志会显示具体问题
```

现在你可以精确诊断控制问题出现在哪个环节！🎯