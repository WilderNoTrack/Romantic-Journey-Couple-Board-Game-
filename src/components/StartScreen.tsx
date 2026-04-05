import { useState, useEffect } from 'react';
import { Heart, Copy, Check, ArrowRight, X, Plus, Trash2, Edit3, Download, Upload, BookOpen, Moon, Sun, Clipboard, FileText } from 'lucide-react';
import FloatingHearts from './FloatingHearts';
import MusicToggle from './MusicToggle';
import RulesPanel from './RulesPanel';
import { useTheme } from '../contexts/ThemeContext';
import { getStoredRoom, setStoredRoom, clearStoredRoom } from '../hooks/useLocalStorage';
import { useToast } from './Toast';
import { QuestionBank, DEFAULT_QUESTION_BANKS } from '../data/questionBanks';
import { getCustomBanks, saveCustomBanks, addCustomBank, updateCustomBank, deleteCustomBank, getSelectedBankId, setSelectedBankId, exportCustomBank, importCustomBank } from '../services/bankStorage';

interface StartScreenProps {
  onCreateRoom: (questionBank: QuestionBank, callback: (roomId: string) => void) => void;
  onJoinRoom: (roomId: string, role: 'him' | 'her', name: string) => void;
  hasStoredRoom: boolean;
  storedRoomInfo: { roomId: string; role: 'him' | 'her' } | null;
}

const VERSION = 'v2.0.0';

export default function StartScreen({ onCreateRoom, onJoinRoom, hasStoredRoom, storedRoomInfo }: StartScreenProps) {
  const toast = useToast();
  const { isDark, toggleDark } = useTheme();
  
  const [roomId, setRoomId] = useState<string>('');
  const [inputRoomId, setInputRoomId] = useState<string>('');
  const [copied, setCopied] = useState(false);
  const [step, setStep] = useState<'initial' | 'created' | 'joining'>('initial');
  
  const [selectedBankId, setSelectedBankId] = useState<string>('normal');
  const [showBankSelector, setShowBankSelector] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [editingBank, setEditingBank] = useState<QuestionBank | null>(null);
  const [showRules, setShowRules] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState<'him' | 'her' | null>(null);
  const [playerName, setPlayerName] = useState('');
  
  const [keywords, setKeywords] = useState<string>('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [showPromptModal, setShowPromptModal] = useState(false);
  
  const [newBankName, setNewBankName] = useState('');
  const [customBanks, setCustomBanks] = useState<QuestionBank[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setInputRoomId(roomParam.toUpperCase());
    } else if (hasStoredRoom && storedRoomInfo) {
      setInputRoomId(storedRoomInfo.roomId);
    }
    
    setCustomBanks(getCustomBanks());
    setSelectedBankId(getSelectedBankId());
  }, [hasStoredRoom, storedRoomInfo]);

  const getAllBanks = (): QuestionBank[] => {
    const defaults = Object.values(DEFAULT_QUESTION_BANKS);
    return [...defaults, ...customBanks];
  };

  const getCurrentBank = (): QuestionBank | undefined => {
    return getAllBanks().find(b => b.id === selectedBankId);
  };

  const handleSelectBank = (id: string) => {
    setSelectedBankId(id);
    setSelectedBankId(id);
    setShowBankSelector(false);
  };

  const handleCreateRoom = () => {
    const bank = getCurrentBank();
    if (!bank) {
      toast.showToast('请选择题库', 'error');
      return;
    }
    onCreateRoom(bank, (newRoomId) => {
      setRoomId(newRoomId);
      setStep('created');
    });
  };

  const handleCopyRoomId = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('room', roomId);
    navigator.clipboard.writeText(url.toString());
    setCopied(true);
    toast.showToast('邀请链接已复制！快发给 TA 吧！', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJoinAs = (role: 'him' | 'her') => {
    const targetRoomId = step === 'created' ? roomId : inputRoomId;
    if (!targetRoomId) {
      toast.showToast('请输入房间号', 'error');
      return;
    }
    setSelectedRole(role);
    setShowNameModal(true);
  };

  const handleConfirmJoin = () => {
    const targetRoomId = step === 'created' ? roomId : inputRoomId;
    if (!targetRoomId || !selectedRole) return;
    setStoredRoom(targetRoomId, selectedRole);
    onJoinRoom(targetRoomId, selectedRole, playerName.trim());
    setShowNameModal(false);
    setPlayerName('');
  };

  const handleQuickRejoin = () => {
    if (storedRoomInfo) {
      setSelectedRole(storedRoomInfo.role);
      setShowNameModal(true);
    }
  };

  const handleNewBank = () => {
    if (!newBankName.trim()) {
      toast.showToast('请输入题库名称', 'error');
      return;
    }
    const bank = addCustomBank(newBankName.trim());
    setCustomBanks(getCustomBanks());
    setSelectedBankId(bank.id);
    setNewBankName('');
    setShowEditor(true);
    setEditingBank(bank);
  };

  const handleEditBank = (bank: QuestionBank) => {
    setEditingBank({...bank});
    setShowEditor(true);
  };

  const handleSaveBank = () => {
    if (!editingBank) return;
    updateCustomBank(editingBank);
    setCustomBanks(getCustomBanks());
    toast.showToast('题库已保存', 'success');
  };

  const handleDeleteBank = (id: string) => {
    deleteCustomBank(id);
    setCustomBanks(getCustomBanks());
    if (selectedBankId === id) {
      setSelectedBankId('normal');
      setSelectedBankId('normal');
    }
    toast.showToast('题库已删除', 'success');
  };

  const PROMPT_TEMPLATE = `你是一个情侣游戏题目的生成助手。请根据用户提供的要求生成情侣游戏题目。

【分级说明】
- 等级 1（温馨甜蜜）：轻亲密、思念、回忆为主，适度甜蜜
- 等级 2（适度刺激）：中等亲密、互动、适当暴露
- 等级 3（热情强烈）：高亲密、激情、全面互动、露骨

【重要提醒 - 必须遵守】
- 每个分类必须生成至少 8 条题目
- 共 9 个分类，总共至少 72 条题目
- 禁止输出"题目 1"、"1."等编号
- 题目直接写内容，每行一条

【具体场景要求】
每个题目都要有具体场景描述（在哪里、做什么、怎么做），让用户清楚知道任务内容。

【敏感词替换规则（生成题目时使用这些词）】
- 脱掉全部衣服
- 亲密接触
- 私密部位
- 胸口
- 臀部
- 达到巅峰
- 爱的液体
- 自行互动

【输出格式 - 必须严格遵守，每行一条，不能有编号】

等级 1-真心话:
内容
内容
内容
内容
内容
内容
内容
内容

等级 1-大冒险:
内容
内容
内容
内容
内容
内容
内容
内容

等级 1-惩罚:
内容
内容
内容
内容
内容
内容
内容
内容

等级 2-真心话:
内容
内容
内容
内容
内容
内容
内容
内容

等级 2-大冒险:
内容
内容
内容
内容
内容
内容
内容
内容

等级 2-惩罚:
内容
内容
内容
内容
内容
内容
内容
内容

等级 3-真心话:
内容
内容
内容
内容
内容
内容
内容
内容

等级 3-大冒险:
内容
内容
内容
内容
内容
内容
内容
内容

等级 3-惩罚:
内容
内容
内容
内容
内容
内容
内容
内容

要求：{KEYWORDS}`;

  const handleGeneratePrompt = () => {
    if (!keywords.trim()) {
      toast.showToast('请输入要求', 'error');
      return;
    }
    const prompt = PROMPT_TEMPLATE.replace('{KEYWORDS}', keywords);
    setGeneratedPrompt(prompt);
    setShowPromptModal(true);
  };

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(generatedPrompt);
    toast.showToast('提示词已复制！发给 AI 后把返回内容粘贴回来', 'success');
  };

  const parseAiResponse = (content: string) => {
    const result: Record<number, Record<string, string[]>> = {
      1: { truth: [], dare: [], punishment: [] },
      2: { truth: [], dare: [], punishment: [] },
      3: { truth: [], dare: [], punishment: [] },
    };

    const sections = [
      '等级 1-真心话', '等级 1-大冒险', '等级 1-惩罚',
      '等级 2-真心话', '等级 2-大冒险', '等级 2-惩罚',
      '等级 3-真心话', '等级 3-大冒险', '等级 3-惩罚'
    ];

    const categoryMap: Record<string, { level: number; category: string }> = {
      '等级 1-真心话': { level: 1, category: 'truth' },
      '等级 1-大冒险': { level: 1, category: 'dare' },
      '等级 1-惩罚': { level: 1, category: 'punishment' },
      '等级 2-真心话': { level: 2, category: 'truth' },
      '等级 2-大冒险': { level: 2, category: 'dare' },
      '等级 2-惩罚': { level: 2, category: 'punishment' },
      '等级 3-真心话': { level: 3, category: 'truth' },
      '等级 3-大冒险': { level: 3, category: 'dare' },
      '等级 3-惩罚': { level: 3, category: 'punishment' },
    };

    let currentSection = '';
    const lines = content.split('\n');

    for (const line of lines) {
      let trimmed = line.trim();
      
      if (!trimmed) continue;
      if (trimmed === '...' || trimmed.includes('...')) continue;
      if (trimmed === '内容') continue;
      if (trimmed.startsWith('内容')) {
        trimmed = trimmed.replace(/^内容/, '').trim();
      }
      
      let foundSection = false;
      for (const section of sections) {
        if (trimmed.includes(section)) {
          currentSection = section;
          foundSection = true;
          break;
        }
      }

      if (foundSection) continue;

      if (currentSection && trimmed.length > 5) {
        const info = categoryMap[currentSection];
        if (info) {
          result[info.level][info.category].push(trimmed);
        }
      }
    }

    return result;
  };

  const handleParseResponse = () => {
    if (!aiResponse.trim()) {
      toast.showToast('请粘贴 AI 返回的内容', 'error');
      return;
    }

    if (!editingBank) {
      toast.showToast('请先创建或编辑一个题库', 'error');
      return;
    }

    try {
      const parsed = parseAiResponse(aiResponse);
      
      const newLevels = {
        1: { truth: parsed[1]?.truth || [], dare: parsed[1]?.dare || [], punishment: parsed[1]?.punishment || [] },
        2: { truth: parsed[2]?.truth || [], dare: parsed[2]?.dare || [], punishment: parsed[2]?.punishment || [] },
        3: { truth: parsed[3]?.truth || [], dare: parsed[3]?.dare || [], punishment: parsed[3]?.punishment || [] },
      };
      
      setEditingBank({
        ...editingBank,
        levels: newLevels
      });
      
      const totalCount = 
        (parsed[1].truth.length + parsed[1].dare.length + parsed[1].punishment.length) +
        (parsed[2].truth.length + parsed[2].dare.length + parsed[2].punishment.length) +
        (parsed[3].truth.length + parsed[3].dare.length + parsed[3].punishment.length);
      
      toast.showToast(`解析成功！共 ${totalCount} 条题目`, 'success');
      setShowPromptModal(false);
      setAiResponse('');
    } catch (error: any) {
      toast.showToast('解析失败，请检查格式', 'error');
    }
  };

  const handleExport = () => {
    if (!editingBank) return;
    const json = exportCustomBank(editingBank);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${editingBank.name}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const bank = importCustomBank(text);
      if (bank) {
        updateCustomBank(bank);
        setCustomBanks(getCustomBanks());
        toast.showToast('题库导入成功', 'success');
      } else {
        toast.showToast('题库格式错误', 'error');
      }
    };
    input.click();
  };

  const currentBank = getCurrentBank();

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden"
      style={{ background: 'var(--bg-gradient)' }}
    >
      <FloatingHearts />
      
      <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
        <MusicToggle />
        <button 
          onClick={toggleDark}
          className="p-2 rounded-full bg-[var(--bg-primary)] shadow-sm hover:shadow-md transition-all border border-[var(--border-primary)]"
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-[var(--text-secondary)]" />}
        </button>
      </div>

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center gap-2 mb-4">
            <Heart className="w-8 h-8 text-pink-500 fill-current animate-pulse" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-500 via-rose-400 to-pink-600 bg-clip-text text-transparent">
              浪漫旅程
            </h1>
            <Heart className="w-8 h-8 text-pink-500 fill-current animate-pulse" />
          </div>
          <p className="text-[var(--text-tertiary)] text-lg">双人情侣棋盘冒险游戏</p>
          <p className="text-[var(--text-muted)] text-xs mt-2">{VERSION}</p>
        </div>

        {hasStoredRoom && storedRoomInfo && step === 'initial' && (
          <div className="mb-4 p-4 bg-gradient-to-r from-primary/10 to-pink-100 rounded-xl border border-primary/20">
            <p className="text-sm text-[var(--text-secondary)] mb-2">
              检测到上次房间 <span className="font-mono font-bold text-primary">{storedRoomInfo.roomId}</span>
            </p>
            <div className="flex gap-2">
              <button onClick={handleQuickRejoin} className="flex-1 flex items-center justify-center gap-2 bg-primary text-white font-bold py-2 rounded-lg hover:opacity-90">
                <ArrowRight className="w-4 h-4" />快速重连
              </button>
              <button onClick={() => clearStoredRoom()} className="px-4 text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] text-sm">清除</button>
            </div>
          </div>
        )}

        {step === 'initial' && (
          <div className="space-y-4">
            <button
              onClick={handleCreateRoom}
              className="w-full text-white font-bold py-4 rounded-xl shadow-lg bg-gradient-to-r from-pink-500 to-rose-500 shadow-pink-500/30 hover:shadow-pink-500/50 transition-all transform hover:scale-[1.02]"
            >
              🎮 开始游戏
            </button>

            <button
              onClick={() => setShowRules(true)}
              className="w-full flex items-center justify-center gap-2 text-[var(--text-secondary)] font-medium py-3 rounded-xl border-2 border-[var(--border-primary)] hover:border-pink-300 hover:text-pink-500 transition-all"
            >
              <BookOpen className="w-5 h-5" />
              查看游戏规则
            </button>

            <div className="bg-[var(--bg-primary)] backdrop-blur rounded-xl border border-[var(--border-primary)] p-4">
              <p className="text-sm font-medium text-[var(--text-secondary)] mb-2">当前题库</p>
              <button
                onClick={() => setShowBankSelector(true)}
                className="w-full p-3 bg-[var(--bg-tertiary)] rounded-lg text-left flex items-center justify-between hover:bg-[var(--bg-secondary)]"
              >
                <span className="font-medium text-[var(--text-primary)]">{currentBank?.name || '请选择题库'}</span>
                <span className="text-[var(--text-tertiary)]">▼</span>
              </button>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex-grow border-t border-[var(--border-primary)]"></div>
              <span className="text-[var(--text-tertiary)] text-sm">或</span>
              <div className="flex-grow border-t border-[var(--border-primary)]"></div>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                placeholder="输入房间号"
                value={inputRoomId}
                onChange={(e) => setInputRoomId(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 rounded-xl border-2 border-[var(--border-primary)] focus:border-pink-400 focus:outline-none text-center uppercase font-mono text-lg bg-[var(--bg-elevated)] text-[var(--text-primary)]"
              />
              <div className="flex gap-3">
                <button onClick={() => handleJoinAs('him')} className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-3 rounded-xl">
                  👨 加入为"他"
                </button>
                <button onClick={() => handleJoinAs('her')} className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-3 rounded-xl">
                  👩 加入为"她"
                </button>
              </div>
            </div>
          </div>
        )}

        {step === 'created' && (
          <div className="space-y-6">
            <div className="bg-[var(--bg-tertiary)] p-6 rounded-xl border border-[var(--border-primary)] text-center">
              <p className="text-sm text-[var(--text-tertiary)] mb-2">房间已创建</p>
              <div className="flex items-center justify-center gap-3">
                <p className="text-3xl font-mono font-bold tracking-widest text-[var(--text-primary)]">{roomId}</p>
                <button onClick={handleCopyRoomId} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg">
                  {copied ? <Check className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6 text-[var(--text-tertiary)]" />}
                </button>
              </div>
            </div>
            <p className="text-[var(--text-secondary)] text-center">请选择你的角色：</p>
            <div className="flex gap-3">
              <button onClick={() => handleJoinAs('him')} className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold py-4 rounded-xl">
                👨 我是"他"
              </button>
              <button onClick={() => handleJoinAs('her')} className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold py-4 rounded-xl">
                👩 我是"她"
              </button>
            </div>
            <button onClick={() => setStep('initial')} className="w-full text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] text-sm">← 返回</button>
          </div>
        )}
      </div>

      <div className="absolute bottom-4 text-center text-xs text-[var(--text-tertiary)]">Made with 💕 for couples</div>

      {/* 题库选择弹窗 */}
      {showBankSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-elevated)] rounded-2xl max-w-md w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">选择题库</h2>
              <button onClick={() => setShowBankSelector(false)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg"><X className="w-5 h-5 text-[var(--text-tertiary)]" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {getAllBanks().map(bank => (
                <div key={bank.id} className="flex items-center gap-2">
                  <button
                    onClick={() => handleSelectBank(bank.id)}
                    className={`flex-1 p-3 rounded-lg text-left flex items-center justify-between ${
                      selectedBankId === bank.id ? 'bg-[var(--bg-pink)] border-2 border-pink-500' : 'bg-[var(--bg-tertiary)] border-2 border-transparent'
                    }`}
                  >
                    <span className="text-[var(--text-primary)]">{bank.name}</span>
                    {selectedBankId === bank.id && <Check className="w-5 h-5 text-pink-500" />}
                  </button>
                  {bank.isCustom && (
                    <>
                      <button onClick={() => handleEditBank(bank)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg"><Edit3 className="w-4 h-4" /></button>
                      <button onClick={() => handleDeleteBank(bank.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg"><Trash2 className="w-4 h-4" /></button>
                    </>
                  )}
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-tertiary)] space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newBankName}
                  onChange={(e) => setNewBankName(e.target.value)}
                  placeholder="新建题库名称"
                  className="flex-1 px-3 py-2 border border-[var(--border-primary)] rounded-lg bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                />
                <button onClick={handleNewBank} className="px-4 py-2 bg-pink-500 text-white rounded-lg flex items-center gap-1">
                  <Plus className="w-4 h-4" />新建
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 题库编辑器弹窗 */}
      {showEditor && editingBank && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-elevated)] rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between">
              <input
                value={editingBank.name}
                onChange={(e) => setEditingBank({...editingBank, name: e.target.value})}
                className="text-xl font-bold border-b border-transparent hover:border-[var(--border-primary)] focus:border-pink-500 focus:outline-none bg-[var(--bg-elevated)] text-[var(--text-primary)]"
              />
              <button onClick={() => setShowEditor(false)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg"><X className="w-5 h-5 text-[var(--text-tertiary)]" /></button>
            </div>
            
            <div className="p-4 border-b bg-[var(--bg-purple)]">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-[var(--text-primary)]">AI 生成题目</span>
              </div>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  placeholder="输入关键词（如：异地恋、新婚、夏日...）"
                  className="flex-1 px-3 py-2 border border-[var(--border-primary)] rounded-lg text-sm bg-[var(--bg-elevated)] text-[var(--text-primary)]"
                />
                <button
                  onClick={handleGeneratePrompt}
                  className="px-4 py-2 bg-purple-500 text-white rounded-lg text-sm hover:bg-purple-600 transition-colors"
                >
                  ✨ 生成提示词
                </button>
              </div>
              <p className="text-xs text-[var(--text-tertiary)]">
                1. 点击"生成提示词" → 2. 复制发给 AI（ChatGPT 等） → 3. 粘贴返回内容 → 4. 点击解析
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {[1, 2, 3].map(level => (
                <div key={level}>
                  <h3 className="font-bold mb-2">等级 {level}</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="text-sm text-[var(--text-tertiary)]">真心话</label>
                      <textarea
                        value={editingBank.levels[level]?.truth?.join('\n') || ''}
                        onChange={(e) => {
                          const lines = e.target.value.split('\n').filter(l => l.trim());
                          editingBank.levels[level] = {...editingBank.levels[level], truth: lines};
                          setEditingBank({...editingBank});
                        }}
                        className="w-full p-2 border border-[var(--border-primary)] rounded-lg text-sm resize-none bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                        rows={4}
                        placeholder="每行一条..."
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[var(--text-tertiary)]">大冒险</label>
                      <textarea
                        value={editingBank.levels[level]?.dare?.join('\n') || ''}
                        onChange={(e) => {
                          const lines = e.target.value.split('\n').filter(l => l.trim());
                          editingBank.levels[level] = {...editingBank.levels[level], dare: lines};
                          setEditingBank({...editingBank});
                        }}
                        className="w-full p-2 border border-[var(--border-primary)] rounded-lg text-sm resize-none bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                        rows={4}
                        placeholder="每行一条..."
                      />
                    </div>
                    <div>
                      <label className="text-sm text-[var(--text-tertiary)]">惩罚</label>
                      <textarea
                        value={editingBank.levels[level]?.punishment?.join('\n') || ''}
                        onChange={(e) => {
                          const lines = e.target.value.split('\n').filter(l => l.trim());
                          editingBank.levels[level] = {...editingBank.levels[level], punishment: lines};
                          setEditingBank({...editingBank});
                        }}
                        className="w-full p-2 border border-[var(--border-primary)] rounded-lg text-sm resize-none bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                        rows={4}
                        placeholder="每行一条..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-tertiary)] flex gap-2">
              <button onClick={handleImport} className="px-3 py-2 border border-[var(--border-primary)] rounded-lg text-sm flex items-center gap-1 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]">
                <Upload className="w-4 h-4" />导入
              </button>
              <button onClick={handleExport} className="px-3 py-2 border border-[var(--border-primary)] rounded-lg text-sm flex items-center gap-1 text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]">
                <Download className="w-4 h-4" />导出
              </button>
              <div className="flex-1"></div>
              <button onClick={() => setShowEditor(false)} className="px-4 py-2 border border-[var(--border-primary)] rounded-lg text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]">取消</button>
              <button onClick={handleSaveBank} className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:opacity-90">保存</button>
            </div>
          </div>
        </div>
      )}

      {/* 规则弹窗 */}
      {showRules && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-[var(--bg-elevated)] rounded-2xl max-w-lg w-full my-8 overflow-hidden">
            <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between sticky top-0 bg-[var(--bg-elevated)]">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">📖 游戏规则</h2>
              <button onClick={() => setShowRules(false)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg">
                <X className="w-5 h-5 text-[var(--text-tertiary)]" />
              </button>
            </div>
            <div className="p-4 max-h-[70vh] overflow-y-auto">
              <RulesPanel />
            </div>
          </div>
        </div>
      )}

      {/* 名字输入弹窗 */}
      {showNameModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-elevated)] rounded-2xl max-w-sm w-full overflow-hidden">
            <div className="p-6">
              <h2 className="text-xl font-bold text-center mb-4 text-[var(--text-primary)]">
                {selectedRole === 'him' ? '👦 他' : '👧 她'}的称呼
              </h2>
              <input
                type="text"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                placeholder={selectedRole === 'him' ? '例如：小明' : '例如：小红'}
                className="w-full p-3 border border-[var(--border-primary)] rounded-xl focus:outline-none focus:ring-2 focus:ring-pink-500 text-center text-lg bg-[var(--bg-tertiary)] text-[var(--text-primary)]"
                maxLength={10}
                autoFocus
              />
              <p className="text-xs text-[var(--text-tertiary)] text-center mt-2">可选，不填则默认显示"他/她"</p>
            </div>
            <div className="p-4 border-t border-[var(--border-primary)] bg-[var(--bg-tertiary)] flex gap-3">
              <button 
                onClick={() => {
                  setShowNameModal(false);
                  setPlayerName('');
                }} 
                className="flex-1 py-3 border border-[var(--border-primary)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              >
                取消
              </button>
              <button 
                onClick={handleConfirmJoin}
                className="flex-1 py-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-xl font-bold hover:opacity-90"
              >
                确认加入
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI 提示词弹窗 */}
      {showPromptModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[var(--bg-elevated)] rounded-2xl max-w-2xl w-full overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-4 border-b border-[var(--border-primary)] flex items-center justify-between">
              <h2 className="text-xl font-bold text-[var(--text-primary)]">AI 生成题目</h2>
              <button onClick={() => setShowPromptModal(false)} className="p-2 hover:bg-[var(--bg-secondary)] rounded-lg">
                <X className="w-5 h-5 text-[var(--text-secondary)]" />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto space-y-4">
              <div className="space-y-3">
                <p className="font-medium text-sm text-[var(--text-secondary)]">💡 推荐使用以下 AI 平台，效果更好：</p>
                <div className="flex gap-3">
                  <a
                    href="https://chat.deepseek.com"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-center font-medium py-2 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    DeepSeek
                  </a>
                  <a
                    href="https://kimi.moonshot.cn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-500 text-white text-center font-medium py-2 rounded-lg hover:opacity-90 transition-opacity"
                  >
                    Kimi
                  </a>
                </div>
              </div>
              
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="font-medium text-sm text-[var(--text-secondary)]">步骤 1：复制提示词发给 AI</label>
                  <button 
                    onClick={handleCopyPrompt}
                    className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700"
                  >
                    <Clipboard className="w-4 h-4" /> 复制提示词
                  </button>
                </div>
                <textarea
                  value={generatedPrompt}
                  readOnly
                  className="w-full p-3 border border-[var(--border-primary)] rounded-xl text-sm bg-[var(--bg-tertiary)] text-[var(--text-secondary)] resize-none"
                  rows={6}
                />
              </div>
              
              <div>
                <label className="font-medium text-sm text-[var(--text-secondary)] mb-2 block">步骤 2：粘贴 AI 返回的内容</label>
                <textarea
                  value={aiResponse}
                  onChange={(e) => setAiResponse(e.target.value)}
                  placeholder="把 AI 返回的内容粘贴到这里..."
                  className="w-full p-3 border border-[var(--border-primary)] rounded-xl text-sm bg-[var(--bg-elevated)] text-[var(--text-primary)] resize-none"
                  rows={10}
                />
              </div>
            </div>
            
            <div className="p-4 border-t border-[var(--border-primary)] flex gap-3">
              <button 
                onClick={() => setShowPromptModal(false)} 
                className="flex-1 py-3 border border-[var(--border-primary)] rounded-xl font-medium hover:bg-[var(--bg-secondary)] text-[var(--text-primary)]"
              >
                取消
              </button>
              <button 
                onClick={handleParseResponse}
                className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-bold hover:opacity-90"
              >
                ✨ 解析并填入题库
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
