# 聊天框 + 房间保留 + 后台同步

## TL;DR

> **Quick Summary**: 为"浪漫旅程"游戏添加3个功能：游戏内聊天框、房间保留1小时、后台切回自动同步
  
> **Deliverables**:
> - 聊天框组件 + WebSocket事件
> - 房间过期清理逻辑（1小时）
> - visibilitychange 自动同步
  
> **Estimated Effort**: Medium
> **Parallel Execution**: NO - sequential (3 features, each builds on previous patterns)
> **Critical Path**: 聊天框(前后端) → 房间保留 → 后台同步

---

## Context

### Original Request
用户反馈3个问题：
1. 缺少聊天功能 - 游戏过程中无法文字沟通
2. 双方退出后房间立即删除 - 无法延续上局
3. 切出界面后回来丢失进度 - 需要重新进入

### Metis Review Summary
**已确认事项**:
- 聊天：文字 + 系统emoji（直接在输入框输入Unicode字符即可）
- 房间保留：1小时 = 3600000ms
- 后台同步：visibilitychange 事件监听

**需要默认处理**:
- 聊天消息限制200字符
- 聊天历史保留100条（与logs一致）
- 聊天消息存储在独立数组，不混入game logs
- 清理超时需要取消已存在的timeout避免重复

---

## Work Objectives

### Core Objective
添加3个功能，提升用户体验：
1. 实时聊天 - 文字+emoji
2. 房间保留 - 断线1小时不过期
3. 后台同步 - 切回自动获取最新状态

### Concrete Deliverables
1. **server.ts**: 新增 `chatMessage` 事件 + 修改房间清理逻辑
2. **src/components/ChatPanel.tsx**: 聊天组件（新增）
3. **src/components/Sidebar.tsx**: 集成 ChatPanel
4. **src/App.tsx**: 新增 visibilitychange 监听 + 聊天状态管理

### Definition of Done
- [ ] 玩家在游戏内发送消息，另一玩家实时收到
- [ ] 双方断线后1小时内可凭房间号重新加入，游戏状态保留
- [ ] 切到其他标签页/APP后切回，自动同步最新进度

---

## Verification Strategy

### Test Decision
- **Infrastructure exists**: NO (项目无测试框架)
- **Automated tests**: None
- **Agent-Executed QA**: 手动测试场景验证

### QA Policy
每个任务完成后，通过以下方式验证：
- 启动 `npm run dev`
- 打开两个浏览器标签页模拟双方
- 执行具体操作步骤
- 观察结果是否符合预期

---

## Execution Strategy

### 串行任务流（顺序执行）

```
Wave 1: 聊天功能 - 后端
├── Task 1: server.ts - 添加 ChatMessage 接口和 chatMessage 事件处理
├── Task 2: server.ts - 消息验证（200字符限制）

Wave 2: 聊天功能 - 前端
├── Task 3: src/components/ChatPanel.tsx - 新建聊天组件
├── Task 4: src/components/Sidebar.tsx - 集成 ChatPanel
├── Task 5: src/App.tsx - 聊天状态管理和 WebSocket 监听

Wave 3: 房间保留功能
├── Task 6: server.ts - 添加房间过期清理逻辑（1小时）

Wave 4: 后台同步功能
├── Task 7: src/App.tsx - visibilitychange 监听 + 请求状态同步

Wave 5: 集成验证
└── Task 8: 整体功能验证
```

---

## TODOs

- [x] 1. **后端：添加聊天消息接口和事件处理**

  **What to do**:
  - 在 server.ts 添加 ChatMessage 接口
  - 新增 `chatMessage` socket 事件处理
  - 消息存储到 room.chatMessages 数组
  - 广播给房间内所有玩家
  - 限制历史消息100条

  **Must NOT do**:
  - 禁止存储超过200字符的消息
  - 禁止空消息
  - 不要将聊天混入 logs 数组

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high` - 需要理解现有代码模式和 socket 事件
  - **Skills**: []
  - **Skills Evaluated but Omitted**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 1
  - **Blocks**: Task 3-5 (前端聊天)
  - **Blocked By**: None

  **References**:
  - `server.ts:91-175` - socket 事件处理模式
  - `server.ts:71-80` - addLog 辅助函数模式
  - `server.ts:41-59` - GameState 接口定义

  **Acceptance Criteria**:
  - [ ] 发送 "Hello" 消息，另一玩家收到
  - [ ] 发送 250 字符消息，服务器拒绝
  - [ ] 发送 101 条消息，第一条被自动删除

  **QA Scenarios**:
  ```
  Scenario: 聊天消息发送和接收
    Tool: npm run dev + 两个浏览器标签页
    Preconditions: 两个玩家加入同一房间
    Steps:
      1. 在"他"标签页输入框输入 "你好 ❤️"
      2. 点击发送按钮
    Expected Result: "她"标签页聊天区域显示 "他: 你好 ❤️"
    Evidence: 页面截图

  Scenario: 消息长度限制
    Tool: 同上
    Preconditions: 两个玩家在线
    Steps:
      1. 输入超过200字符的消息
      2. 点击发送
    Expected Result: 消息不发送，无报错（静默丢弃）
    Evidence: 观察消息未出现在聊天区域
  ```

  **Commit**: YES
  - Message: `feat(chat): add chat message interface and handler`
  - Files: `server.ts`

---

- [x] 2. **前端：新建 ChatPanel 组件**

  **What to do**:
  - 创建 src/components/ChatPanel.tsx
  - 消息列表显示区域（滚动）
  - 输入框 + 发送按钮
  - 支持 Unicode emoji 输入
  - 时间戳显示

  **Must NOT do**:
  - 不要添加 emoji 选择器（用户说用系统自带）
  - 不要超出 Sidebar 样式范围

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering` - UI 组件开发
  - **Skills**: []
  - **Skills Evaluated but Omitted**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: Task 1

  **References**:
  - `src/components/Sidebar.tsx` - 样式参考
  - `src/components/Toast.tsx` - 组件结构参考
  - `src/index.css` - CSS 变量

  **Acceptance Criteria**:
  - [ ] 组件渲染，显示空聊天区域
  - [ ] 输入框可输入文字和 emoji

  **QA Scenarios**:
  ```
  Scenario: 聊天组件渲染
    Tool: 浏览器
    Preconditions: npm run dev 启动
    Steps:
      1. 进入游戏（创建或加入房间）
    Expected Result: 侧边栏上方显示聊天区域，有输入框和发送按钮
    Evidence: 截图

  Scenario: 输入框支持 emoji
    Tool: 浏览器
    Steps:
      1. 点击输入框
      2. 使用系统输入法输入 "❤️"
      3. 输入 "Hello"
    Expected Result: 输入框显示 "Hello❤️"
    Evidence: 截图
  ```

  **Commit**: YES
  - Message: `feat(chat): add ChatPanel component`
  - Files: `src/components/ChatPanel.tsx`

---

- [x] 3. **前端：Sidebar 集成 ChatPanel**

  **What to do**:
  - 在 Sidebar.tsx 导入 ChatPanel
  - 放置在 Game Feed（日志）上方
  - 传递必要 props（消息数组、发送回调）

  **Must NOT do**:
  - 不要修改现有组件的结构

  **Recommended Agent Profile**:
  - **Category**: `visual-engineering`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: Task 2

  **References**:
  - `src/components/Sidebar.tsx:168-195` - Game Feed 结构

  **Acceptance Criteria**:
  - [ ] ChatPanel 出现在 Sidebar 中，日志区域上方

  **Commit**: YES
  - Message: `feat(chat): integrate ChatPanel into Sidebar`
  - Files: `src/components/Sidebar.tsx`

---

- [x] 4. **前端：App.tsx 聊天状态管理**

  **What to do**:
  - 添加 chatMessages 状态
  - 监听 socket 的 chatMessage 事件
  - 处理发送聊天消息

  **Must NOT do**:
  - 不要影响现有功能

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 2
  - **Blocks**: None
  - **Blocked By**: Task 1

  **References**:
  - `src/App.tsx:66-204` - socket 事件监听模式
  - `src/App.tsx:331-352` - Sidebar props 传递

  **Acceptance Criteria**:
  - [ ] 发送消息后，消息出现在双方屏幕

  **QA Scenarios**:
  ```
  Scenario: 跨玩家聊天
    Tool: 两个浏览器标签页
    Preconditions: 两个玩家加入同一房间
    Steps:
      1. "他"发送 "想你了 ❤️"
    Expected Result: "她"屏幕聊天区域立即显示此消息
    Evidence: 截图时间戳
  ```

  **Commit**: YES
  - Message: `feat(chat): add chat state management in App.tsx`
  - Files: `src/App.tsx`

---

- [x] 5. **后端：房间1小时保留逻辑**

  **What to do**:
  - 在 GameState 接口添加 cleanupTimeoutId
  - 修改 disconnect 处理：不再立即删除房间
  - 两个玩家都断线时，设置 1 小时后清理
  - 有玩家重新加入时，取消清理计时器
  - 添加定期清理过期房间的逻辑

  **Must NOT do**:
  - 清理超时后不要遗漏 room
  - 不要在有玩家在线时启动清理

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 3
  - **Blocks**: None
  - **Blocked By**: Task 1-4

  **References**:
  - `server.ts:586-606` - disconnect 处理逻辑
  - `server.ts:598-602` - 当前房间删除逻辑

  **Acceptance Criteria**:
  - [ ] 双方都断线后，服务器不删除房间
  - [ ] 1小时后控制台输出清理日志

  **QA Scenarios**:
  ```
  Scenario: 房间保留
    Tool: npm run dev + 两个浏览器标签页
    Preconditions: 两个玩家加入房间
    Steps:
      1. 双方都关闭标签页（断开连接）
      2. 等待10秒（缩短测试时间）
      3. 一方重新加入同一房间号
    Expected Result: 房间仍存在，游戏状态保留
    Evidence: 重新加入后位置/金币/等级与断开前一致
  ```

  **Commit**: YES
  - Message: `feat(room): keep room for 1 hour after both disconnect`
  - Files: `server.ts`

---

- [x] 6. **前端：后台自动同步**

  **What to do**:
  - 在 App.tsx 添加 visibilitychange 事件监听
  - 页面从 hidden 变为 visible 时，请求最新游戏状态
  - 清理事件监听（useEffect return）

  **Must NOT do**:
  - 不要创建新的 WebSocket 连接

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: []

  **Parallelization**:
  - **Can Run In Parallel**: NO
  - **Parallel Group**: Wave 4
  - **Blocks**: None
  - **Blocked By**: Task 1-5

  **References**:
  - `src/App.tsx:58-205` - useEffect 模式

  **Acceptance Criteria**:
  - [ ] 切出标签页再切回，位置自动更新

  **QA Scenarios**:
  ```
  Scenario: 后台同步
    Tool: 两个浏览器标签页
    Preconditions: 两个玩家都在游戏中
    Steps:
      1. "她"切到其他标签页
      2. "他"掷骰子移动到新位置
      3. "她"切回游戏标签页
    Expected Result: "她"的位置自动更新到最新
    Evidence: 截图对比
  ```

  **Commit**: YES
  - Message: `feat(sync): auto sync on visibility change`
  - Files: `src/App.tsx`

---

- [x] 7. **后端：支持状态同步请求**

  **What to do**:
  - 新增 socket 事件 `requestStateSync`
  - 收到后返回当前游戏状态

  **Recommended Agent Profile**:
  - **Category**: `unspecified-high`
  - **Skills**: []
  - **Skills Evaluated but Omitted**: []

  **Acceptance Criteria**:
  - [ ] 客户端请求时能收到完整游戏状态

  **Commit**: YES
  - Message: `feat(sync): add requestStateSync event handler`
  - Files: `server.ts`

---

## Final Verification Wave

- [ ] F1. **功能完整性检查**
  - 聊天：双方发送/接收消息 ✅
  - 房间保留：1小时后清理 ✅
  - 后台同步：切回自动更新 ✅

- [ ] F2. **边界情况测试**
  - 空消息不发送 ✅
  - 超长消息被拒绝 ✅
  - 断线重连后聊天记录保留 ✅

---

## Commit Strategy

- `feat(chat): add chat message interface and handler` - server.ts
- `feat(chat): add ChatPanel component` - src/components/ChatPanel.tsx
- `feat(chat): integrate ChatPanel into Sidebar` - src/components/Sidebar.tsx
- `feat(chat): add chat state management in App.tsx` - src/App.tsx
- `feat(room): keep room for 1 hour after both disconnect` - server.ts
- `feat(sync): add requestStateSync event handler` - server.ts
- `feat(sync): auto sync on visibility change` - src/App.tsx

---

## Success Criteria

### Verification Commands
```bash
npm run dev  # 启动服务器
# 打开两个浏览器标签页测试
```

### Final Checklist
- [ ] 聊天功能正常：发送 → 接收
- [ ] 房间保留正常：断线 → 1小时内重连 → 状态保留
- [ ] 后台同步正常：切出 → 切回 → 状态更新