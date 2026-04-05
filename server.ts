import express from 'express';
import { createServer as createViteServer } from 'vite';
import { Server } from 'socket.io';
import http from 'http';

const app = express();
app.use(express.json({ limit: '50mb' }));

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  },
});

const PORT = 3000;
const ROOM_RETENTION_MS = 3600000;

interface PlayerState {
  id: string;
  role: 'him' | 'her';
  name: string;
  position: number;
  coins: number;
  exp: number;
  level: number;
  inventory: { remoteDice: number; shield: number; booster: number; wishCoupon: number; customDare: number };
  shieldActive: boolean;
  boosterActive: boolean;
  remoteDiceValue: number | null;
  disconnected: boolean;
  frozen: boolean;
  itemLocked: boolean;
}

interface GameLog {
  id: string;
  timestamp: number;
  message: string;
}

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: number;
}

interface GameState {
  roomId: string;
  players: {
    him: PlayerState | null;
    her: PlayerState | null;
  };
  turn: 'him' | 'her';
  customDares: string[];
  logs: GameLog[];
  chatMessages: ChatMessage[];
  boardLevel: number;
  himCompletedLap: boolean;
  herCompletedLap: boolean;
  questionBankId: string;
  questionBanks: Record<number, {
    truth: string[];
    dare: string[];
    punishment: string[];
  }>;
  cleanupTimeoutId?: NodeJS.Timeout;
}

const rooms = new Map<string, GameState>();

const ITEM_LEVELS: Record<string, number> = {
  remoteDice: 1,
  shield: 1,
  booster: 2,
  customDare: 2,
  wishCoupon: 3,
};

function addLog(room: GameState, message: string) {
  room.logs.unshift({
    id: Math.random().toString(36).substring(2, 9),
    timestamp: Date.now(),
    message
  });
  if (room.logs.length > 50) {
    room.logs.pop();
  }
}

function addExp(player: PlayerState, amount: number) {
  player.exp += amount;
  const expNeeded = 100;
  while (player.exp >= expNeeded) {
    player.exp -= expNeeded;
    player.level += 1;
  }
}

io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('createRoom', ({ questionBank }: { questionBank?: any }, callback) => {
    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const bankId = questionBank?.id || 'normal';
    const banks = questionBank?.levels || { 1: { truth: [], dare: [], punishment: [] }, 2: { truth: [], dare: [], punishment: [] }, 3: { truth: [], dare: [], punishment: [] } };
    rooms.set(roomId, {
      roomId,
      players: { him: null, her: null },
      turn: 'him',
      customDares: [],
      logs: [],
      chatMessages: [],
      boardLevel: 1,
      himCompletedLap: false,
      herCompletedLap: false,
      questionBankId: bankId,
      questionBanks: banks,
    });
    callback({ roomId, questionBankId: bankId });
  });

  socket.on('saveCustomQuestions', ({ roomId, questionBanks }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    room.questionBanks = questionBanks;
    io.to(roomId).emit('gameStateUpdate', room);
  });

  socket.on('joinRoom', ({ roomId, role, name }, callback) => {
    const room = rooms.get(roomId);
    if (!room) {
      return callback({ error: 'Room not found' });
    }
    
    const existingPlayer = room.players[role as 'him' | 'her'];
    
    // 角色已被占用且未断线
    if (existingPlayer && !existingPlayer.disconnected) {
      return callback({ error: 'Role already taken' });
    }
    
    // 断线重连：恢复玩家数据
    if (existingPlayer && existingPlayer.disconnected) {
      existingPlayer.id = socket.id;
      existingPlayer.disconnected = false;
      if (name) existingPlayer.name = name;
      if (room.cleanupTimeoutId) {
        clearTimeout(room.cleanupTimeoutId);
        room.cleanupTimeoutId = undefined;
      }
      socket.join(roomId);
      (socket as any).roomId = roomId;
      (socket as any).role = role;
      addLog(room, `${existingPlayer.name} 重新连接了`);
      io.to(roomId).emit('gameStateUpdate', room);
      return callback({ success: true, room });
    }

    const displayName = name || (role === 'him' ? '他' : '她');

    // 新玩家加入
    const playerState: PlayerState = {
      id: socket.id,
      role: role as 'him' | 'her',
      name: displayName,
      position: 1,
      coins: 0,
      exp: 0,
      level: 1,
      inventory: { remoteDice: 0, shield: 0, booster: 0, wishCoupon: 0, customDare: 0 },
      shieldActive: false,
      boosterActive: false,
      remoteDiceValue: null,
      disconnected: false,
      frozen: false,
      itemLocked: false,
    };

    room.players[role as 'him' | 'her'] = playerState;
    socket.join(roomId);
    
    (socket as any).roomId = roomId;
    (socket as any).role = role;

    addLog(room, `${displayName} 加入了房间`);
    io.to(roomId).emit('gameStateUpdate', room);
    callback({ success: true, room });
  });

  socket.on('rollDice', ({ roomId, role }) => {
    const room = rooms.get(roomId);
    if (!room || room.turn !== role) return;

    const player = room.players[role];
    if (!player) return;

    // 检查是否被禁足
    if (player.frozen) {
      player.frozen = false;
      room.turn = role === 'him' ? 'her' : 'him';
      addLog(room, `${player.name} 被禁足，跳过本回合`);
      io.to(roomId).emit('gameStateUpdate', room);
      return;
    }

    // 检查道具锁定，清除状态
    if (player.itemLocked) {
      player.itemLocked = false;
    }

    let roll = Math.floor(Math.random() * 6) + 1;
    if (player.remoteDiceValue !== null) {
      roll = player.remoteDiceValue;
      player.remoteDiceValue = null;
    }

    let finalRoll = roll;
    if (player.boosterActive) {
      finalRoll *= 2;
      player.boosterActive = false;
    }

    // Check if passing finish line (tile 32)
    if (player.position + finalRoll > 32) {
      player.coins += 50;
      addExp(player, 50);
      addLog(room, `${player.name} 经过终点，获得 50 金币和 50 经验！`);
      
      // Mark lap completion
      if (role === 'him') {
        room.himCompletedLap = true;
      } else {
        room.herCompletedLap = true;
      }
      
      // Check if both players completed lap
      if (room.himCompletedLap && room.herCompletedLap) {
        const maxLevel = 3;
        if (room.boardLevel < maxLevel) {
          room.boardLevel += 1;
          addLog(room, `🎯 棋盘升级！当前等级 Lv.${room.boardLevel}，题目更加刺激了！`);
          io.to(roomId).emit('boardLevelUp', { level: room.boardLevel });
        }
        room.himCompletedLap = false;
        room.herCompletedLap = false;
      }
    }

    // New board has 32 tiles
    player.position = ((player.position + finalRoll - 1) % 32) + 1;
    
    addLog(room, `${player.name} 掷出了 ${finalRoll} 点`);

    // Random special event (10% chance)
    let triggeredEvent: string | null = null;
    if (Math.random() < 0.1) {
      const events = ['meteor', 'heartlink', 'blessing', 'timespace', 'fortune', 'lock', 'rainbow'];
      triggeredEvent = events[Math.floor(Math.random() * events.length)];
      
      // Apply event effects
      const him = room.players.him;
      const her = room.players.her;
      
      if (triggeredEvent === 'meteor') {
        const items = ['remoteDice', 'shield', 'booster'] as const;
        const randomItem = items[Math.floor(Math.random() * items.length)];
        if (him) him.inventory[randomItem]++;
        if (her) her.inventory[randomItem]++;
        addLog(room, `🌟 特殊事件：流星许愿！双方各获得一个随机道具`);
      } else if (triggeredEvent === 'heartlink' && him && her) {
        const avgPos = Math.floor((him.position + her.position) / 2);
        him.position = avgPos;
        her.position = avgPos;
        addLog(room, `💕 特殊事件：心心相印！双方位置同步`);
      } else if (triggeredEvent === 'blessing') {
        player.coins += 50;
        addExp(player, 30);
        addLog(room, `✨ 特殊事件：爱神祝福！获得50金币和30经验`);
      } else if (triggeredEvent === 'timespace' && him && her) {
        him.position = Math.floor(Math.random() * 32) + 1;
        her.position = Math.floor(Math.random() * 32) + 1;
        addLog(room, `🌀 特殊事件：时空裂隙！双方被传送`);
      } else if (triggeredEvent === 'fortune' && him && her) {
        him.coins += 30;
        her.coins += 30;
        addLog(room, `💰 特殊事件：财神驾到！双方各获得30金币`);
      } else if (triggeredEvent === 'lock' && him && her) {
        const target = role === 'him' ? her : him;
        target.itemLocked = true;
        addLog(room, `🔒 特殊事件：爱情锁链！对方下回合不能使用道具`);
      } else if (triggeredEvent === 'rainbow') {
        player.remoteDiceValue = 6;
        addLog(room, `🌈 特殊事件：幸运彩虹！下次掷骰子必定为6点`);
      }
      
      io.to(roomId).emit('specialEvent', { event: triggeredEvent, role });
    }

    // Switch turn
    room.turn = role === 'him' ? 'her' : 'him';

    io.to(roomId).emit('diceRolled', { role, roll, finalRoll, newPosition: player.position, room, triggeredEvent });
  });

  socket.on('buyItem', ({ roomId, role, item, cost }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const player = room.players[role as 'him' | 'her'];
    if (!player || player.coins < cost) return;
    
    const requiredLevel = ITEM_LEVELS[item] || 1;
    if (player.level < requiredLevel) return;

    player.coins -= cost;
    player.inventory[item as 'remoteDice' | 'shield' | 'booster' | 'wishCoupon' | 'customDare']++;
    
    const itemNames: Record<string, string> = {
      remoteDice: '遥控骰子',
      shield: '免罚金牌',
      booster: '双倍引擎',
      wishCoupon: '现实心愿券',
      customDare: '空白大冒险卡'
    };
    addLog(room, `${player.name} 购买了 ${itemNames[item] || item}`);
    
    io.to(roomId).emit('gameStateUpdate', room);
  });

  socket.on('useItem', ({ roomId, role, item, value }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const player = room.players[role as 'him' | 'her'];
    if (!player || player.inventory[item as 'remoteDice' | 'shield' | 'booster' | 'wishCoupon' | 'customDare'] <= 0) return;

    // 检查道具是否被锁定
    if (player.itemLocked) {
      return;
    }

    player.inventory[item as 'remoteDice' | 'shield' | 'booster' | 'wishCoupon' | 'customDare']--;

    const itemNames: Record<string, string> = {
      remoteDice: '遥控骰子',
      shield: '免罚金牌',
      booster: '双倍引擎',
      wishCoupon: '现实心愿券',
      customDare: '空白大冒险卡'
    };
    addLog(room, `${player.name} 使用了 ${itemNames[item] || item}`);

    if (item === 'remoteDice' && value) {
      player.remoteDiceValue = value;
    } else if (item === 'shield') {
      player.shieldActive = true;
    } else if (item === 'booster') {
      player.boosterActive = true;
    } else if (item === 'wishCoupon') {
      io.to(roomId).emit('wishUsed', { role });
    } else if (item === 'customDare' && value) {
      room.customDares.push(value);
      io.to(roomId).emit('customDareAdded', { role });
    }

    io.to(roomId).emit('gameStateUpdate', room);
  });

  socket.on('triggerFate', ({ roomId, role }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const fateTypes = ['swap', 'steal', 'bonus', 'forward', 'backward', 'wheel', 'shieldbuy', 'dash', 'itemswap', 'leveldown', 'gift', 'freeze'];
    const fate = fateTypes[Math.floor(Math.random() * fateTypes.length)];
    
    const him = room.players.him;
    const her = room.players.her;
    const triggerPlayer = room.players[role as 'him' | 'her'];
    const targetPlayer = role === 'him' ? her : him;
    
    if (fate === 'swap' && him && her) {
      const temp = him.position;
      him.position = her.position;
      her.position = temp;
      addLog(room, `${triggerPlayer?.name || '玩家'} 触发了命运：乾坤大挪移！双方互换位置`);
    } else if (fate === 'steal' && him && her) {
      const target = role === 'him' ? her : him;
      const stealer = role === 'him' ? him : her;
      const amount = Math.floor(target.coins / 2);
      target.coins -= amount;
      stealer.coins += amount;
      addLog(room, `${triggerPlayer?.name || '玩家'} 触发了命运：散财童子！偷取了对方 ${amount} 金币`);
    } else if (fate === 'bonus' && triggerPlayer) {
      triggerPlayer.coins += 50;
      addLog(room, `${triggerPlayer.name} 触发了命运：天降甘霖！获得了 50 金币`);
    } else if (fate === 'forward' && triggerPlayer) {
      triggerPlayer.position = ((triggerPlayer.position + 3 - 1) % 32) + 1;
      addLog(room, `${triggerPlayer.name} 触发了命运：顺风顺水！前进了 3 步`);
    } else if (fate === 'backward' && triggerPlayer) {
      triggerPlayer.position -= 2;
      if (triggerPlayer.position < 1) {
        triggerPlayer.position = 32 + triggerPlayer.position;
      }
      if (triggerPlayer.position < 1) triggerPlayer.position = 1;
      addLog(room, `${triggerPlayer.name} 触发了命运：逆水行舟！后退了 2 步`);
    } else if (fate === 'wheel') {
      // 命运轮盘：再触发一个随机命运（排除 wheel）
      const otherFates = ['swap', 'steal', 'bonus', 'forward', 'backward', 'shieldbuy', 'dash', 'itemswap', 'leveldown', 'gift', 'freeze'];
      const newFate = otherFates[Math.floor(Math.random() * otherFates.length)];
      addLog(room, `${triggerPlayer?.name || '玩家'} 触发了命运：命运轮盘！再转一次...`);
      // 递归处理新命运
      fate = newFate;
      if (fate === 'swap' && him && her) {
        const temp = him.position;
        him.position = her.position;
        her.position = temp;
        addLog(room, `→ 命运轮盘结果：乾坤大挪移！双方互换位置`);
      } else if (fate === 'steal' && him && her) {
        const target = role === 'him' ? her : him;
        const stealer = role === 'him' ? him : her;
        const amount = Math.floor(target.coins / 2);
        target.coins -= amount;
        stealer.coins += amount;
        addLog(room, `→ 命运轮盘结果：散财童子！偷取了对方 ${amount} 金币`);
      } else if (fate === 'bonus' && triggerPlayer) {
        triggerPlayer.coins += 50;
        addLog(room, `→ 命运轮盘结果：天降甘霖！获得了 50 金币`);
      } else if (fate === 'forward' && triggerPlayer) {
        triggerPlayer.position = ((triggerPlayer.position + 3 - 1) % 32) + 1;
        addLog(room, `→ 命运轮盘结果：顺风顺水！前进了 3 步`);
      } else if (fate === 'backward' && triggerPlayer) {
        triggerPlayer.position -= 2;
        if (triggerPlayer.position < 1) triggerPlayer.position = 32 + triggerPlayer.position;
        if (triggerPlayer.position < 1) triggerPlayer.position = 1;
        addLog(room, `→ 命运轮盘结果：逆水行舟！后退了 2 步`);
      } else if (fate === 'shieldbuy' && triggerPlayer) {
        if (triggerPlayer.coins >= 20) {
          triggerPlayer.coins -= 20;
          triggerPlayer.shieldActive = true;
          addLog(room, `→ 命运轮盘结果：破财消灾！损失20金币获得护盾`);
        } else {
          addLog(room, `→ 命运轮盘结果：破财消灾！金币不足，无事发生`);
        }
      } else if (fate === 'dash' && triggerPlayer) {
        const shopPositions = [3, 7, 11, 19, 23, 27, 31];
        const nextShop = shopPositions.find(pos => pos > triggerPlayer.position) || shopPositions[0];
        triggerPlayer.position = nextShop;
        addLog(room, `→ 命运轮盘结果：秒速前进！传送到商店格 ${nextShop}`);
      } else if (fate === 'itemswap' && him && her) {
        const items = ['remoteDice', 'shield', 'booster', 'wishCoupon', 'customDare'] as const;
        const randomItem = items[Math.floor(Math.random() * items.length)];
        const temp = him.inventory[randomItem];
        him.inventory[randomItem] = her.inventory[randomItem];
        her.inventory[randomItem] = temp;
        addLog(room, `→ 命运轮盘结果：物品互换！双方交换了道具`);
      } else if (fate === 'leveldown' && targetPlayer) {
        if (targetPlayer.level > 1) {
          targetPlayer.level -= 1;
          addLog(room, `→ 命运轮盘结果：等级压制！对方等级-1`);
        } else {
          addLog(room, `→ 命运轮盘结果：等级压制！对方已经是最低等级`);
        }
      } else if (fate === 'gift' && triggerPlayer) {
        const items = ['remoteDice', 'shield', 'booster'] as const;
        const randomItem = items[Math.floor(Math.random() * items.length)];
        triggerPlayer.inventory[randomItem]++;
        addLog(room, `→ 命运轮盘结果：意外惊喜！获得一个随机道具`);
      } else if (fate === 'freeze' && targetPlayer) {
        targetPlayer.frozen = true;
        addLog(room, `→ 命运轮盘结果：禁足令！对方下回合不能移动`);
      }
    } else if (fate === 'shieldbuy' && triggerPlayer) {
      if (triggerPlayer.coins >= 20) {
        triggerPlayer.coins -= 20;
        triggerPlayer.shieldActive = true;
        addLog(room, `${triggerPlayer.name} 触发了命运：破财消灾！损失20金币获得护盾`);
      } else {
        addLog(room, `${triggerPlayer.name} 触发了命运：破财消灾！金币不足，无事发生`);
      }
    } else if (fate === 'dash' && triggerPlayer) {
      const shopPositions = [3, 7, 11, 19, 23, 27, 31];
      const nextShop = shopPositions.find(pos => pos > triggerPlayer.position) || shopPositions[0];
      triggerPlayer.position = nextShop;
      addLog(room, `${triggerPlayer.name} 触发了命运：秒速前进！传送到商店格 ${nextShop}`);
    } else if (fate === 'itemswap' && him && her) {
      const items = ['remoteDice', 'shield', 'booster', 'wishCoupon', 'customDare'] as const;
      const randomItem = items[Math.floor(Math.random() * items.length)];
      const temp = him.inventory[randomItem];
      him.inventory[randomItem] = her.inventory[randomItem];
      her.inventory[randomItem] = temp;
      addLog(room, `${triggerPlayer?.name || '玩家'} 触发了命运：物品互换！双方交换了道具`);
    } else if (fate === 'leveldown' && targetPlayer) {
      if (targetPlayer.level > 1) {
        targetPlayer.level -= 1;
        addLog(room, `${triggerPlayer?.name || '玩家'} 触发了命运：等级压制！对方等级-1`);
      } else {
        addLog(room, `${triggerPlayer?.name || '玩家'} 触发了命运：等级压制！对方已经是最低等级`);
      }
    } else if (fate === 'gift' && triggerPlayer) {
      const items = ['remoteDice', 'shield', 'booster'] as const;
      const randomItem = items[Math.floor(Math.random() * items.length)];
      triggerPlayer.inventory[randomItem]++;
      addLog(room, `${triggerPlayer.name} 触发了命运：意外惊喜！获得一个随机道具`);
    } else if (fate === 'freeze' && targetPlayer) {
      targetPlayer.frozen = true;
      addLog(room, `${triggerPlayer?.name || '玩家'} 触发了命运：禁足令！对方下回合不能移动`);
    }
    
    io.to(roomId).emit('fateTriggered', { role, fate, room });
    io.to(roomId).emit('gameStateUpdate', room);
  });

  socket.on('consumeShield', ({ roomId, role }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const player = room.players[role as 'him' | 'her'];
    if (player) {
      player.shieldActive = false;
      io.to(roomId).emit('gameStateUpdate', room);
    }
  });

  socket.on('addCoins', ({ roomId, role, amount, reason }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const player = room.players[role as 'him' | 'her'];
    if (player) {
      player.coins += amount;
      addLog(room, `${player.name} ${reason || '获得奖励'}，获得了 ${amount} 金币`);
      io.to(roomId).emit('gameStateUpdate', room);
    }
  });

  socket.on('addExp', ({ roomId, role, amount, reason }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const player = room.players[role as 'him' | 'her'];
    if (player) {
      const oldLevel = player.level;
      addExp(player, amount);
      if (player.level > oldLevel) {
        addLog(room, `${player.name} 升级了！当前等级 Lv.${player.level}`);
        io.to(roomId).emit('levelUp', { role, level: player.level });
      }
      if (reason) {
        addLog(room, `${player.name} ${reason}，获得了 ${amount} 经验`);
      }
      io.to(roomId).emit('gameStateUpdate', room);
    }
  });

  socket.on('spendCoins', ({ roomId, role, amount, reason }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const player = room.players[role as 'him' | 'her'];
    if (player && player.coins >= amount) {
      player.coins -= amount;
      if (reason) {
        addLog(room, `${player.name} ${reason}，花费了 ${amount} 金币`);
      }
      io.to(roomId).emit('gameStateUpdate', room);
    }
  });

  socket.on('addCustomQuestion', ({ roomId, type, question, level }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const targetLevel = level || room.boardLevel || 1;
    if (!room.questionBanks[targetLevel]) {
      room.questionBanks[targetLevel] = { truth: [], dare: [], punishment: [] };
    }
    if (type === 'truth') {
      room.questionBanks[targetLevel].truth.push(question);
    } else if (type === 'dare') {
      room.questionBanks[targetLevel].dare.push(question);
    } else if (type === 'punishment') {
      room.questionBanks[targetLevel].punishment.push(question);
    }
    addLog(room, `${type === 'truth' ? '真心话' : type === 'dare' ? '大冒险' : '惩罚'}题目已添加`);
    io.to(roomId).emit('gameStateUpdate', room);
  });

  socket.on('removeCustomQuestion', ({ roomId, type, index, level }) => {
    const room = rooms.get(roomId);
    if (!room) return;
    const targetLevel = level || room.boardLevel || 1;
    if (!room.questionBanks[targetLevel]) return;
    if (type === 'truth') {
      room.questionBanks[targetLevel].truth.splice(index, 1);
    } else if (type === 'dare') {
      room.questionBanks[targetLevel].dare.splice(index, 1);
    } else if (type === 'punishment') {
      room.questionBanks[targetLevel].punishment.splice(index, 1);
    }
    io.to(roomId).emit('gameStateUpdate', room);
  });

  socket.on('syncModal', ({ roomId, modalType, modalState, modalPlayer, isOpen }) => {
    socket.to(roomId).emit('modalSynced', { modalType, modalState, modalPlayer, isOpen });
  });

  socket.on('chatMessage', ({ roomId, role, message }) => {
    const room = rooms.get(roomId);
    if (!room) return;

    const trimmedMessage = message.trim();
    if (!trimmedMessage || trimmedMessage.length > 200) return;

    const player = room.players[role as 'him' | 'her'];
    if (!player) return;

    const chatMessage: ChatMessage = {
      id: Math.random().toString(36).substring(2, 9),
      sender: player.name,
      message: trimmedMessage,
      timestamp: Date.now(),
    };

    room.chatMessages.push(chatMessage);
    if (room.chatMessages.length > 100) {
      room.chatMessages.shift();
    }

    io.to(roomId).emit('chatMessage', chatMessage);
  });

  socket.on('requestStateSync', ({ roomId }) => {
    const room = rooms.get(roomId);
    if (room) {
      socket.emit('gameStateUpdate', room);
    }
  });

  socket.on('disconnect', () => {
    const roomId = (socket as any).roomId;
    const role = (socket as any).role;
    if (roomId && role) {
      const room = rooms.get(roomId);
      if (room && room.players[role]) {
        const playerName = room.players[role]!.name;
        room.players[role]!.disconnected = true;
        addLog(room, `${playerName} 断开连接`);
        io.to(roomId).emit('gameStateUpdate', room);
        
        const him = room.players.him;
        const her = room.players.her;
        if ((!him || him.disconnected) && (!her || her.disconnected)) {
          if (room.cleanupTimeoutId) {
            clearTimeout(room.cleanupTimeoutId);
          }
          room.cleanupTimeoutId = setTimeout(() => {
            rooms.delete(roomId);
            console.log(`Room ${roomId} cleaned up after 1 hour`);
          }, ROOM_RETENTION_MS);
        }
      }
    }
    console.log('User disconnected:', socket.id);
  });
});

app.post('/api/ai-proxy', async (req, res) => {
  const { model, messages, temperature, max_tokens, apiKey } = req.body;
  
  console.log('代理收到请求:', { model, apiKey: apiKey?.substring(0, 10) + '...' });
  
  try {
    const response = await fetch('https://coding.dashscope.aliyuncs.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model,
        messages,
        temperature,
        max_tokens
      })
    });
    
    const data = await response.json();
    console.log('百炼API返回:', JSON.stringify(data).substring(0, 200));
    res.json(data);
  } catch (error: any) {
    console.error('代理错误:', error);
    res.status(500).json({ error: error.message });
  }
});

async function startServer() {
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (req, res) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
