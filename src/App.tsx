import { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import GameBoard, { BOARD_TILES } from './components/GameBoard';
import ChallengeModal from './components/Modals/ChallengeModal';
import { useTheme } from './contexts/ThemeContext';
import ShopModal from './components/Modals/ShopModal';
import RewardModal from './components/Modals/RewardModal';
import RemoteDiceModal from './components/Modals/RemoteDiceModal';
import QuizModal from './components/Modals/QuizModal';
import FateModal from './components/Modals/FateModal';
import CustomDareModal from './components/Modals/CustomDareModal';
import FinishBoxModal from './components/Modals/FinishBoxModal';
import LevelUpModal from './components/Modals/LevelUpModal';
import EventModal from './components/Modals/EventModal';
import CustomQuestionModal from './components/Modals/CustomQuestionModal';
import StartScreen from './components/StartScreen';
import { socket } from './socket';
import { useToast } from './components/Toast';
import { getStoredRoom, setStoredRoom, clearStoredRoom } from './hooks/useLocalStorage';
import { QuestionBank } from './data/questionBanks';

const QUIZ_QUESTIONS = [
  "你们第一次约会是在哪里？",
  "对方最喜欢吃的一道菜是什么？",
  "你们第一次接吻是在什么时间/地点？",
  "对方最害怕的动物/昆虫是什么？",
  "对方最喜欢的颜色是什么？",
  "你们在一起的纪念日是哪一天？",
  "对方生气时最常说的一句话是什么？",
  "对方最想去旅游的城市/国家是哪里？",
  "对方最喜欢的一部电影是什么？",
  "对方的口头禅是什么？"
];

export default function App() {
  const toast = useToast();
  const { isDark } = useTheme();
  const [roomId, setRoomId] = useState<string>('');
  const [role, setRole] = useState<'him' | 'her' | null>(null);
  const [gameState, setGameState] = useState<any>(null);
  const [storedRoomInfo, setStoredRoomInfo] = useState<{ roomId: string; role: 'him' | 'her' } | null>(null);

  const [activeModal, setActiveModal] = useState<'none' | 'challenge' | 'shop' | 'reward' | 'remoteDice' | 'quiz' | 'fate' | 'customDare' | 'customQuestion' | 'finishBox' | 'event'>('none');
  const [modalPlayer, setModalPlayer] = useState<'him' | 'her' | null>(null);
  const [sharedChallengeState, setSharedChallengeState] = useState<any>(null);
  const [sharedQuizState, setSharedQuizState] = useState<any>(null);
  const [fateEvent, setFateEvent] = useState<string>('');
  const [specialEventId, setSpecialEventId] = useState<string>('');
  const [isRolling, setIsRolling] = useState(false);
  const [diceResult, setDiceResult] = useState<number | null>(null);
  const [levelUpInfo, setLevelUpInfo] = useState<{ show: boolean; level: number }>({ show: false, level: 1 });
  const [customQuestionBanks, setCustomQuestionBanks] = useState<{ truth: string[]; dare: string[]; punishment: string[] }>({ truth: [], dare: [], punishment: [] });

  const [localHimPos, setLocalHimPos] = useState(1);
  const [localHerPos, setLocalHerPos] = useState(1);
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  useEffect(() => {
    const stored = getStoredRoom();
    if (stored) {
      setStoredRoomInfo(stored);
    }
  }, []);

  useEffect(() => {
    socket.on('gameStateUpdate', (state) => {
      setGameState(state);
      if (state.customQuestionBanks) {
        setCustomQuestionBanks(state.customQuestionBanks);
      }
      if (!isRolling) {
        if (state.players.him) setLocalHimPos(state.players.him.position);
        if (state.players.her) setLocalHerPos(state.players.her.position);
      }
    });

    socket.on('diceRolled', ({ role: rollerRole, roll, finalRoll, newPosition, room }) => {
      setIsRolling(true);
      
      let shuffleCount = 0;
      const shuffleInterval = setInterval(() => {
        setDiceResult(Math.floor(Math.random() * 6) + 1);
        shuffleCount++;
        if (shuffleCount > 10) {
          clearInterval(shuffleInterval);
          setDiceResult(roll);
          
          let currentStep = 0;
          const moveInterval = setInterval(() => {
            currentStep++;
            
            if (rollerRole === 'him') {
              setLocalHimPos(prev => prev >= 32 ? 1 : prev + 1);
            } else {
              setLocalHerPos(prev => prev >= 32 ? 1 : prev + 1);
            }

            if (currentStep >= finalRoll) {
              clearInterval(moveInterval);
              setTimeout(() => {
                setIsRolling(false);
                setDiceResult(null);
                setGameState(room);
                
                // Only trigger modal for the person who rolled
                if (role === rollerRole) {
                  const landedTile = BOARD_TILES.find(t => t.id === newPosition);
                  if (landedTile) {
                    setModalPlayer(rollerRole);
                    if (landedTile.type === 'coin') {
                      setActiveModal('reward');
                      socket.emit('syncModal', { roomId, modalType: 'reward', isOpen: true, modalPlayer: rollerRole });
                    } else if (landedTile.type === 'heart') {
                      setActiveModal('challenge');
                      // ChallengeModal will initialize its state and call onStateChange to sync it
                    } else if (landedTile.type === 'shop') {
                      setActiveModal('shop');
                      socket.emit('syncModal', { roomId, modalType: 'shop', isOpen: true, modalPlayer: rollerRole });
                    } else if (landedTile.type === 'quiz') {
                      const randomQuestion = QUIZ_QUESTIONS[Math.floor(Math.random() * QUIZ_QUESTIONS.length)];
                      const initialQuizState = {
                        question: randomQuestion,
                        himAnswer: null,
                        herAnswer: null,
                        stage: 'answering'
                      };
                      setSharedQuizState(initialQuizState);
                      setActiveModal('quiz');
                      socket.emit('syncModal', { roomId, modalType: 'quiz', modalState: initialQuizState, isOpen: true, modalPlayer: rollerRole });
                    } else if (landedTile.type === 'fate') {
                      socket.emit('triggerFate', { roomId, role });
                    } else if (landedTile.type === 'finish') {
                      setActiveModal('finishBox');
                      socket.emit('syncModal', { roomId, modalType: 'finishBox', isOpen: true, modalPlayer: rollerRole });
                    }
                  }
                }
              }, 800);
            }
          }, 300);
        }
      }, 50);
    });

    socket.on('modalSynced', ({ modalType, modalState, modalPlayer: mp, isOpen }) => {
      if (!isOpen) {
        setActiveModal('none');
        return;
      }
      setActiveModal(modalType);
      setModalPlayer(mp);
      if (modalType === 'challenge' && modalState) {
        setSharedChallengeState(modalState);
      }
      if (modalType === 'quiz' && modalState) {
        setSharedQuizState(modalState);
      }
    });

    socket.on('fateTriggered', ({ role: triggerRole, fate }) => {
      setFateEvent(fate);
      setActiveModal('fate');
      setModalPlayer(triggerRole);
    });

    socket.on('wishUsed', ({ role: triggerRole }) => {
      if (triggerRole !== role) {
        toast.showToast(`${triggerRole === 'him' ? '他' : '她'} 对你使用了一张【现实心愿券】！请在现实中满足TA的一个愿望吧！`, 'info');
      }
    });

    socket.on('levelUp', ({ role: levelUpRole, level }) => {
      if (levelUpRole === role) {
        setLevelUpInfo({ show: true, level });
      }
    });

    socket.on('customDareAdded', ({ role: triggerRole }) => {
      if (triggerRole !== role) {
        toast.showToast(`${triggerRole === 'him' ? '他' : '她'} 悄悄往题库里塞了一张大冒险卡片...`, 'info');
      }
    });

    socket.on('boardLevelUp', ({ level }) => {
      toast.showToast(`🔥 棋盘升级到 Lv.${level}！题目更刺激了！`, 'success');
    });

    socket.on('specialEvent', ({ event, role: triggerRole }) => {
      setSpecialEventId(event);
      setActiveModal('event');
      setModalPlayer(triggerRole);
    });

    socket.on('chatMessage', (msg) => {
      setChatMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off('gameStateUpdate');
      socket.off('diceRolled');
      socket.off('modalSynced');
      socket.off('fateTriggered');
      socket.off('wishUsed');
      socket.off('customDareAdded');
      socket.off('levelUp');
      socket.off('boardLevelUp');
      socket.off('specialEvent');
      socket.off('chatMessage');
    };
  }, [isRolling, role, roomId]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && roomId && role) {
        socket.emit('requestStateSync', { roomId });
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [roomId, role]);

  const handleJoinCreatedRoom = (selectedRole: 'him' | 'her') => {
    socket.emit('joinRoom', { roomId, role: selectedRole }, (res: any) => {
      if (res.error) {
        toast.showToast(res.error, 'error');
      } else {
        setRole(selectedRole);
        setGameState(res.room);
        setChatMessages((res.room.chatMessages || []).reverse());
        setStoredRoom(roomId, selectedRole);
      }
    });
  };

  const handleCreateRoom = (questionBank: QuestionBank, callback: (roomId: string) => void) => {
    socket.emit('createRoom', { questionBank }, (res: any) => {
      setRoomId(res.roomId);
      callback(res.roomId);
    });
  };

  const handleJoinRoomFromStart = (targetRoomId: string, selectedRole: 'him' | 'her', name: string) => {
    socket.emit('joinRoom', { roomId: targetRoomId, role: selectedRole, name }, (res: any) => {
      if (res.error) {
        toast.showToast(res.error === 'Room not found' ? '房间不存在或已过期，请重新创建/加入' : res.error, 'error');
        clearStoredRoom();
      } else {
        setRoomId(targetRoomId);
        setRole(selectedRole);
        setGameState(res.room);
        setChatMessages((res.room.chatMessages || []).reverse());
        setStoredRoom(targetRoomId, selectedRole);
      }
    });
  };

  if (!role || !gameState) {
    return (
      <StartScreen
        onCreateRoom={handleCreateRoom}
        onJoinRoom={handleJoinRoomFromStart}
        hasStoredRoom={!!storedRoomInfo}
        storedRoomInfo={storedRoomInfo}
      />
    );
  }

  const myPlayer = gameState.players[role];
  if (!myPlayer) {
    return (
      <div 
        className="min-h-screen flex flex-col items-center justify-center p-4"
        style={{ backgroundColor: isDark ? '#0f172a' : '#f8fafc' }}
      >
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
          <h1 className="text-3xl font-bold text-primary mb-4">连接已断开</h1>
          <p className="text-slate-600 mb-8">您已从房间中移除或房间已解散。</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors"
          >
            返回首页
          </button>
        </div>
      </div>
    );
  }

  const isMyTurn = gameState.turn === role;
  const bothJoined = !!gameState.players.him && !!gameState.players.her;
  const canRoll = isMyTurn && bothJoined;

  const handleRollDice = () => {
    if (isRolling || !canRoll) return;
    socket.emit('rollDice', { roomId, role });
  };

  const handleBuyItem = (item: 'remoteDice' | 'shield' | 'booster' | 'wishCoupon' | 'customDare', cost: number) => {
    socket.emit('buyItem', { roomId, role, item, cost });
  };

  const handleUseItem = (item: 'remoteDice' | 'shield' | 'booster' | 'wishCoupon' | 'customDare') => {
    if (myPlayer.inventory[item] > 0) {
      if (item === 'remoteDice') {
        setActiveModal('remoteDice');
      } else if (item === 'customDare') {
        setActiveModal('customDare');
      } else {
        socket.emit('useItem', { roomId, role, item });
        if (item === 'shield') toast.showToast('已装备甜心护盾，可免受一次惩罚！', 'success');
        if (item === 'booster') toast.showToast('已装备爱情助推器，下次掷骰子步数翻倍！', 'success');
        if (item === 'wishCoupon') toast.showToast('已使用现实心愿券！快去向TA提出你的要求吧！', 'info');
      }
    }
  };

  const handleRemoteDiceSelect = (val: number) => {
    socket.emit('useItem', { roomId, role, item: 'remoteDice', value: val });
    setActiveModal('none');
    toast.showToast(`已装备遥控骰子，下次掷骰子必定为 ${val} 点！`, 'success');
  };

  const handleCloseModal = () => {
    const currentModal = activeModal;
    setActiveModal('none');
    if (modalPlayer === role) {
      socket.emit('syncModal', { roomId, modalType: currentModal, isOpen: false, modalPlayer: role });
    }
  };

  const handleCompleteChallenge = () => {
    socket.emit('addExp', { roomId, role, amount: 30, reason: '完成心动挑战' });
    handleCloseModal();
  };

  const handleConsumeShield = () => {
    socket.emit('consumeShield', { roomId, role });
  };

  return (
    <div 
      className="relative flex min-h-screen w-full flex-col overflow-x-hidden"
      style={{ backgroundColor: isDark ? '#0f172a' : '#f8fafc' }}
    >
      <Header />

      <main className="flex flex-1 flex-col lg:flex-row p-4 md:p-8 gap-8 max-w-[1440px] mx-auto w-full">
        <Sidebar 
          inventory={myPlayer.inventory}
          onUseItem={handleUseItem}
          turn={gameState.turn}
          himName={gameState.players.him?.name || '他'}
          herName={gameState.players.her?.name || '她'}
          himCoins={gameState.players.him?.coins || 0}
          herCoins={gameState.players.her?.coins || 0}
          himExp={gameState.players.him?.exp || 0}
          herExp={gameState.players.her?.exp || 0}
          himLevel={gameState.players.him?.level || 1}
          herLevel={gameState.players.her?.level || 1}
          himShield={gameState.players.him?.shieldActive || false}
          herShield={gameState.players.her?.shieldActive || false}
          himBooster={gameState.players.him?.boosterActive || false}
          herBooster={gameState.players.her?.boosterActive || false}
          isMyTurn={canRoll}
          roomId={roomId}
          himJoined={!!gameState.players.him}
          herJoined={!!gameState.players.her}
          logs={gameState.logs || []}
          onRollDice={handleRollDice}
          isRolling={isRolling}
          diceResult={diceResult}
        />
        <GameBoard 
          himPosition={localHimPos} 
          herPosition={localHerPos} 
          turn={gameState.turn} 
          himJoined={!!gameState.players.him}
          herJoined={!!gameState.players.her}
          himName={gameState.players.him?.name || '他'}
          herName={gameState.players.her?.name || '她'}
          messages={chatMessages}
          onSendMessage={(message) => socket.emit('chatMessage', { roomId, role, message })}
          currentPlayer={myPlayer.name}
        />
      </main>

      <ChallengeModal
        isOpen={activeModal === 'challenge'}
        onClose={handleCloseModal}
        onComplete={handleCompleteChallenge}
        onSkip={handleCloseModal}
        hasShield={myPlayer.shieldActive}
        onConsumeShield={handleConsumeShield}
        isReadOnly={modalPlayer !== role}
        sharedState={sharedChallengeState}
        customDares={gameState.customDares}
        coins={myPlayer.coins}
        boardLevel={gameState.boardLevel || 1}
        questionBankId={gameState.questionBankId || 'normal'}
        customQuestionBanks={(() => {
          const level = gameState.boardLevel || 1;
          if (gameState.questionBanks && gameState.questionBanks[level]) {
            return gameState.questionBanks[level];
          }
          if (gameState.questionBanks && gameState.questionBanks[1]) {
            return gameState.questionBanks[1];
          }
          return { truth: [], dare: [], punishment: [] };
        })()}
        onSpendCoins={(amount) => {
          socket.emit('spendCoins', { roomId, role, amount, reason: '换一个问题' });
        }}
        onStateChange={(state) => {
          if (modalPlayer === role) {
            socket.emit('syncModal', { roomId, modalType: 'challenge', modalState: state, isOpen: true, modalPlayer: role });
          }
        }}
      />

      <ShopModal
        isOpen={activeModal === 'shop'}
        onClose={handleCloseModal}
        coins={modalPlayer === 'him' ? (gameState.players.him?.coins || 0) : (modalPlayer === 'her' ? (gameState.players.her?.coins || 0) : myPlayer.coins)}
        level={modalPlayer === 'him' ? (gameState.players.him?.level || 1) : (modalPlayer === 'her' ? (gameState.players.her?.level || 1) : myPlayer.level)}
        onBuyItem={handleBuyItem}
        isReadOnly={modalPlayer !== role}
      />

      <RewardModal
        isOpen={activeModal === 'reward'}
        onClose={() => {
          socket.emit('addCoins', { roomId, role, amount: 50, reason: '获得奖励' });
          handleCloseModal();
        }}
        amount={50}
        isReadOnly={modalPlayer !== role}
      />

      <RemoteDiceModal
        isOpen={activeModal === 'remoteDice'}
        onClose={handleCloseModal}
        onSelect={handleRemoteDiceSelect}
      />

      <QuizModal
        isOpen={activeModal === 'quiz'}
        onClose={handleCloseModal}
        question={sharedQuizState?.question || "加载中..."}
        himName={gameState.players.him?.name || '他'}
        herName={gameState.players.her?.name || '她'}
        isReadOnly={modalPlayer !== role}
        sharedState={sharedQuizState}
        onStateChange={(state) => {
          if (modalPlayer === role) {
            socket.emit('syncModal', { roomId, modalType: 'quiz', modalState: state, isOpen: true, modalPlayer: role });
          }
        }}
        onSubmit={(answer) => {
          const newState = sharedQuizState ? { ...sharedQuizState } : { himAnswer: null, herAnswer: null, stage: 'answering', question: "加载中..." };
          if (role === 'him') newState.himAnswer = answer;
          if (role === 'her') newState.herAnswer = answer;
          if (newState.himAnswer && newState.herAnswer) {
            newState.stage = 'judging';
          }
          setSharedQuizState(newState);
          socket.emit('syncModal', { roomId, modalType: 'quiz', modalState: newState, isOpen: true, modalPlayer: modalPlayer });
        }}
        onJudge={(isMatch) => {
          const newState = { ...sharedQuizState, stage: 'result', isMatch };
          setSharedQuizState(newState);
          socket.emit('syncModal', { roomId, modalType: 'quiz', modalState: newState, isOpen: true, modalPlayer: modalPlayer });
          
          if (isMatch) {
            socket.emit('addCoins', { roomId, role: 'him', amount: 30, reason: '默契满分' });
            socket.emit('addCoins', { roomId, role: 'her', amount: 30, reason: '默契满分' });
          }
        }}
      />

      <FateModal
        isOpen={activeModal === 'fate'}
        onClose={handleCloseModal}
        fate={fateEvent}
        isReadOnly={modalPlayer !== role}
      />

      <CustomDareModal
        isOpen={activeModal === 'customDare'}
        onClose={handleCloseModal}
        onSubmit={(dare) => {
          socket.emit('useItem', { roomId, role, item: 'customDare', value: dare });
          handleCloseModal();
          toast.showToast('大冒险已悄悄放入题库！', 'success');
        }}
      />

      <FinishBoxModal
        isOpen={activeModal === 'finishBox'}
        onClose={handleCloseModal}
        isReadOnly={modalPlayer !== role}
        onSelect={(boxIndex) => {
          handleCloseModal();
        }}
      />

      <LevelUpModal
        isOpen={levelUpInfo.show}
        level={levelUpInfo.level}
        onClose={() => setLevelUpInfo({ show: false, level: 1 })}
      />

      <EventModal
        isOpen={activeModal === 'event'}
        eventId={specialEventId}
        onClose={handleCloseModal}
        isReadOnly={modalPlayer !== role}
      />

      <CustomQuestionModal
        isOpen={activeModal === 'customQuestion'}
        onClose={() => setActiveModal('none')}
        customQuestions={gameState.customQuestionBanks || { truth: [], dare: [], punishment: [] }}
        onAddQuestion={(type, question) => {
          socket.emit('addCustomQuestion', { roomId, type, question });
        }}
        onRemoveQuestion={(type, index) => {
          socket.emit('removeCustomQuestion', { roomId, type, index });
        }}
      />
    </div>
  );
}
