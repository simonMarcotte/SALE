import { useEffect, useRef, useState, type RefObject } from 'react';
import { chapters, nearestChapter } from './story';
import type { Journey } from './World';

const lastX=chapters.at(-1)!.x;
const years=chapters.flatMap((chapter,index)=>{
  const year=chapter.shortDate.match(/20\d{2}/)?.[0];
  return year&&(!index||!chapters[index-1].shortDate.includes(year))?[{year,index}]:[];
});

export function Timeline({journey,onTravel}:{journey:RefObject<Journey>;onTravel:(index:number)=>void}) {
  const track=useRef<HTMLDivElement>(null);
  const buttons=useRef<(HTMLButtonElement|null)[]>([]);
  const [current,setCurrent]=useState(()=>chapters.indexOf(nearestChapter(journey.current.x)));
  const [preview,setPreview]=useState<number|null>(null);
  useEffect(()=>{
    let frame=0,lastIndex=-1;
    const update=()=>{
      const x=journey.current.x;
      track.current?.style.setProperty('--progress',`${Math.max(0,Math.min(1,x/lastX))*100}%`);
      const next=chapters.indexOf(nearestChapter(x));
      if(next!==lastIndex){lastIndex=next;setCurrent(next);}
      frame=requestAnimationFrame(update);
    };
    update();return()=>cancelAnimationFrame(frame);
  },[journey]);
  useEffect(()=>{
    const button=buttons.current[current],viewport=track.current?.parentElement;
    if(!button||!viewport)return;
    const reveal=()=>{
      const left=button.offsetLeft,right=left+button.clientWidth;
      if(left<viewport.scrollLeft||right>viewport.scrollLeft+viewport.clientWidth)
        viewport.scrollTo({left:left-viewport.clientWidth/2+button.clientWidth/2,behavior:'instant'});
    };
    reveal();
    const resize=new ResizeObserver(reveal);resize.observe(viewport);
    return()=>resize.disconnect();
  },[current]);
  const shown=chapters[preview??current];
  return <nav className="travel-timeline" aria-label="Memory timeline — fast travel">
    <div className="timeline-caption"><span>{shown.shortDate}</span><strong>{shown.title}</strong><span className="timeline-hint">{preview===null?'You are here':'Jump here ↗'}</span></div>
    <div className="timeline-scroll">
      <div className="timeline-track" ref={track}>
        <div className="timeline-rail" aria-hidden="true"><i/><b/></div>
        <div className="timeline-stops">{chapters.map((chapter,index)=><button key={chapter.id} ref={el=>{buttons.current[index]=el;}} className={index===current?'current':''} aria-current={index===current?'step':undefined} aria-label={`Travel to ${chapter.title}, ${chapter.shortDate}`} title={`${chapter.shortDate} · ${chapter.title}`} onPointerEnter={()=>setPreview(index)} onPointerLeave={()=>setPreview(null)} onFocus={()=>setPreview(index)} onBlur={()=>setPreview(null)} onKeyDown={event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();event.stopPropagation();const next=event.key==='Home'?0:event.key==='End'?chapters.length-1:Math.max(0,Math.min(chapters.length-1,index+(event.key==='ArrowRight'?1:-1)));buttons.current[next]?.focus();}}} onClick={()=>{onTravel(index);setPreview(null);}}><span/></button>)}</div>
        <div className="timeline-years" aria-hidden="true">{years.map(({year,index})=><span key={year} style={{left:`${index/(chapters.length-1)*100}%`}}>{year}</span>)}</div>
      </div>
    </div>
  </nav>;
}
