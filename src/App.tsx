import { Component, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import World, { type GameState, type Journey } from './World';
import { chapters } from './story';
import { type PaddleKey } from './pingpong';
import { Timeline } from './Timeline';

const initialIndex=Math.max(0,chapters.findIndex(c=>c.id===new URLSearchParams(window.location.search).get('memory')));
// Development-only position preview for inspecting scenery between memories.
const previewX=import.meta.env.DEV?new URLSearchParams(window.location.search).get('position'):null;
const initialX=previewX!==null&&Number.isFinite(Number(previewX))?Math.max(-3,Math.min(chapters.at(-1)!.x,Number(previewX))):chapters[initialIndex].x-3;
const STORAGE_KEY = 'five-years-memories-v3';
function loadCompleted(): number[] {
  try { const saved = localStorage.getItem(STORAGE_KEY); const value = saved ? JSON.parse(saved) : JSON.parse(localStorage.getItem('five-years-scene-v2') || '[]').map((i:number)=>['university','burger','home','future'][i]); return Array.isArray(value) ? value.map(id=>chapters.findIndex(c=>c.id===id)).filter(i=>i>=0) : []; }
  catch { return []; }
}
function Portrait({ index }: { index: number }) {
  return <span className={`portrait portrait-${index}`} aria-hidden="true"><i className="portrait-hair"/><i className="portrait-face"/><i className="portrait-fringe"/><i className="portrait-glasses"/><i className="portrait-shirt"/></span>;
}
class SceneBoundary extends Component<{ children: ReactNode }, { error: boolean }> {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  render() { return this.state.error ? <div className="fallback">This scene needs WebGL. Try a browser with hardware acceleration enabled.</div> : this.props.children; }
}

export default function App() {
  const [cue,setCue]=useState('');
  const [travelVersion,setTravelVersion]=useState(0);
  const [leader, setLeader] = useState(0);
  const [nearby, setNearby] = useState<number | null>(initialIndex);
  const [game, setGame] = useState<GameState | null>(null);
  const [completed, setCompleted] = useState(loadCompleted);
  const [hintVisible, setHintVisible] = useState(true);
  const [saveError, setSaveError] = useState(false);
  const [rallyStatus, setRallyStatus] = useState({ ready: false, side: 'l' as PaddleKey, misses: 0 });
  const [reducedMotion] = useState(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  const journey = useRef<Journey>({ x: initialX, direction: 1, target: null, companionX: initialX-1.15, moving: false });
  const keys = useRef(new Set<string>());
  const action = useRef({ serial: 0, key: 'l' as PaddleKey });
  const gameRef = useRef(game);
  gameRef.current = game;

  useEffect(() => {
    const timer = window.setTimeout(() => setHintVisible(false), 10000);
    return () => window.clearTimeout(timer);
  }, []);
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(completed.map(i=>chapters[i].id))); setSaveError(false); }
    catch { setSaveError(true); }
  }, [completed]);

  const startGame = useCallback((index: number) => {
    keys.current.clear();setCue('');
    journey.current.target = null;
    journey.current.x = chapters[index].x;
    journey.current.companionX = chapters[index].x - 1.15;
    setHintVisible(false);
    setGame({ index, count: 0, done: chapters[index].goal===0, unpacked: [] });
  }, []);
  const finish = useCallback((index: number) => {
    setCompleted(prev => prev.includes(index) ? prev : [...prev, index]);
  }, []);
  const score = useCallback(() => {
    setGame(prev => {
      if (!prev || prev.done) return prev;
      const count = prev.count + 1;
      const max = chapters[prev.index].goal;
      return { ...prev, count, done: count >= max };
    });
  }, []);
  useEffect(() => { if (game?.done) finish(game.index); }, [game, finish]);
  const interact = useCallback((index: number, item?: number) => {
    const current = gameRef.current;
    if (!current || current.index !== index) { startGame(index); return; }
    if (current.done) return;
    const kind=chapters[index].kind;
    if (['pingpong','skate','ski','grad','concert','cruise'].includes(kind)) return;
    if (['golf','lake','flowers'].includes(kind)) { action.current={serial:action.current.serial+1,key:'l'}; return; }
    if (kind === 'home') {
      if(!journey.current.homeReady)return;
      const box = item ?? [0, 1, 2].find(i => !current.unpacked.includes(i));
      if (box === undefined || current.unpacked.includes(box)) return;
      setGame(prev => {
        if (!prev || prev.index !== index || prev.unpacked.includes(box)) return prev;
        const unpacked = [...prev.unpacked, box];
        return { ...prev, unpacked, count: unpacked.length, done: unpacked.length === 3 };
      });
    } else score();
  }, [startGame, score]);
  const hitPaddle = useCallback((key: PaddleKey) => { action.current = { serial: action.current.serial + 1, key }; }, []);
  const missRally = useCallback(() => setGame(prev => prev?.index === 0 ? { ...prev, count: 0 } : prev), []);
  const leaveGame = useCallback(() => { setGame(null); keys.current.clear(); if(journey.current.playX!==undefined){journey.current.x=journey.current.playX;journey.current.companionX=journey.current.playX-.9;} journey.current.playX=undefined; journey.current.playZ=undefined; journey.current.playY=undefined;journey.current.homeReady=false; }, []);
  const continueJourney = () => {
    if (!game) return;
    const next = game.index + 1;
    leaveGame();
    if (next < chapters.length) journey.current.target = chapters[next].x;
  };
  const fastTravel = useCallback((index:number) => {
    leaveGame();
    journey.current={x:chapters[index].x,companionX:chapters[index].x-1.15,direction:1,target:null,moving:false};
    setNearby(index);setCue('');setHintVisible(false);setTravelVersion(v=>v+1);
  },[leaveGame]);
  const walkTo = useCallback((x: number) => { leaveGame(); journey.current.target = x; setHintVisible(false); }, [leaveGame]);
  useEffect(() => {
    const down = (event: KeyboardEvent) => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (gameRef.current?.index === 0 && !gameRef.current.done && (key === 'a' || key === 'l')) {
        event.preventDefault(); if (!event.repeat) hitPaddle(key); return;
      }
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'w', 's', 'a', 'd'].includes(key)) {
        event.preventDefault(); if(!gameRef.current || !['skate','ski','grad','concert','cruise'].includes(chapters[gameRef.current.index].kind))setGame(null); keys.current.add(key); journey.current.target = null; setHintVisible(false);
      }
      if (event.repeat) return;
      if (key === 'Escape') leaveGame();
      if (key === 'c') setLeader(v => 1 - v);
      // Let Space activate a focused native button normally, avoiding double actions.
      if ((key === ' ' && !(event.target instanceof HTMLButtonElement)) || key === 'e') {
        event.preventDefault();
        const current = gameRef.current;
        if (current && !current.done) interact(current.index);
        else if (!current && nearby !== null) startGame(nearby);
      }
    };
    const up = (event: KeyboardEvent) => keys.current.delete(event.key.length === 1 ? event.key.toLowerCase() : event.key);
    const blur = () => { keys.current.clear(); journey.current.target = null; };
    window.addEventListener('keydown', down); window.addEventListener('keyup', up); window.addEventListener('blur', blur);
    document.addEventListener('visibilitychange', blur);
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); window.removeEventListener('blur', blur); document.removeEventListener('visibilitychange', blur); };
  }, [nearby, interact, startGame, leaveGame, hitPaddle]);
  const walkButton = (direction: string) => ({
    onPointerDown: (event: React.PointerEvent<HTMLButtonElement>) => { event.currentTarget.setPointerCapture(event.pointerId); if(!gameRef.current || !['skate','ski','grad','concert','cruise'].includes(chapters[gameRef.current.index].kind))setGame(null); keys.current.add(direction); setHintVisible(false); },
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => { if(event.detail!==0)return;const step=direction==='ArrowRight'||direction==='ArrowDown'?1:-1;if(direction==='ArrowUp'||direction==='ArrowDown'){journey.current.stepZ=(journey.current.stepZ??0)+step;return;}if(gameRef.current&&['skate','ski','grad','concert','cruise'].includes(chapters[gameRef.current.index].kind))journey.current.step=(journey.current.step??0)+step;else walkTo(journey.current.x+step*.8); },
    onPointerUp: () => keys.current.delete(direction), onPointerCancel: () => keys.current.delete(direction), onLostPointerCapture: () => keys.current.delete(direction), onBlur: () => keys.current.delete(direction),
  });
  const actions = chapters.map(c=>c.action);
  const instructions = chapters.map(c=>c.instruction);
  const maxScores = chapters.map(c=>c.goal);
  const currentChapter=chapters[game?.index??nearby??-1];
  return <main className="scene-app">
    <SceneBoundary><World travelVersion={travelVersion} journey={journey} keys={keys} leader={leader} game={game} action={action} completed={completed} onNearby={setNearby} onInteract={interact} onScore={score} onCue={setCue} onWalkTo={walkTo} onRallyStatus={setRallyStatus} onMiss={missRally} reducedMotion={reducedMotion}/></SceneBoundary>
    {currentChapter&&<div className="memory-caption" key={currentChapter.id}><span>{currentChapter.shortDate}</span><h1>{currentChapter.title}</h1><p>{currentChapter.context}</p></div>}
    <div className="scene-grain" aria-hidden="true"/>
    <div className="character-picker" aria-label="Choose who you walk as">
      {[0, 1].map(i => <button key={i} aria-label={`Walk as character ${i + 1}`} aria-pressed={leader === i} className={`character-button ${leader === i ? 'selected' : ''}`} onClick={() => setLeader(i)}><Portrait index={i}/></button>)}
    </div>
    {hintVisible && !game && <p className="walking-hint">← → to walk <span>·</span> click a place to stop</p>}
    <div className="walk-buttons"><button aria-label="Walk left" {...walkButton('ArrowLeft')}>←</button>{game&&chapters[game.index].kind==='skate'&&<><button aria-label="Skate forward" {...walkButton('ArrowUp')}>↑</button><button aria-label="Skate backward" {...walkButton('ArrowDown')}>↓</button></>}<button aria-label="Walk right" {...walkButton('ArrowRight')}>→</button></div>
    {game ? <div className="interaction-bar" aria-live="polite">
      {game.done ? <button className="action-button" onClick={continueJourney}>✓ <span>{game.index === chapters.length-1 ? 'Keep walking' : 'Continue'}</span> →</button> : game.index === 0 ? <>
        <span className="game-instruction">{rallyStatus.misses > 0 && game.count === 0 ? 'Missed — new rally. A left · L right' : instructions[0]}</span>
        {(['a','l'] as const).map(key => <button key={key} className={`action-button paddle-button ${rallyStatus.ready && rallyStatus.side===key?'return-ready':''}`} aria-label={`${key.toUpperCase()} ${rallyStatus.ready && rallyStatus.side===key?'return now':'paddle'}`} onClick={() => hitPaddle(key)}>{key.toUpperCase()}</button>)}
        <span className="rally-count">{game.count} returns</span>
      </> : <><span className="game-instruction">{instructions[game.index]}{cue&&chapters[game.index].kind!=='golf'?` · ${cue}`:''}</span>{['skate','ski','grad','concert','cruise'].includes(chapters[game.index].kind)?<span className="rally-count">{chapters[game.index].kind==='skate'?'Free skate':`${game.count}/${maxScores[game.index]}`}</span>:<button className={`action-button ${cue==='Putt now'?'return-ready':''}`} onClick={() => interact(game.index)}><span>{chapters[game.index].kind==='golf'?(cue||'Putt'):chapters[game.index].kind==='home'?'Unpack':actions[game.index]}</span><span className="score">{game.count}/{maxScores[game.index]}</span></button>}</>}

      {!game.done&&['pingpong','skate'].includes(chapters[game.index].kind)&&<button className="action-button" onClick={()=>{finish(game.index);continueJourney();}}>Continue →</button>}
      <button className="leave-button" onClick={leaveGame} aria-label="Leave activity">×</button>
    </div> : nearby !== null && <button className="nearby-action" onClick={() => startGame(nearby)}>{actions[nearby]} <kbd>E</kbd></button>}
    {saveError && <span className="save-error">Progress couldn’t be saved.</span>}
    <Timeline journey={journey} onTravel={fastTravel}/>
  </main>;
}
