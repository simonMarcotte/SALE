export type Season = 'summer' | 'autumn' | 'winter' | 'spring' | 'coast' | 'desert' | 'night';
export type Outfit = 'summer' | 'skate' | 'ski' | 'grad' | 'work';
export type Kind = 'pingpong' | 'golf' | 'burger' | 'skate' | 'view' | 'concert' | 'lake' | 'home' | 'bbq' | 'ski' | 'flowers' | 'grad' | 'future' | 'cruise' | 'pizza';
export type Chapter = { id: string; shortDate: string; title: string; context: string; x: number; season: Season; outfit: Outfit; kind: Kind; action: string; instruction: string; goal: number };
const memories: Omit<Chapter, 'x'>[] = [
  {id:'university',shortDate:'Aug 2021',title:'Where we met',context:'First year of university. One ping-pong table.',season:'summer',outfit:'summer',kind:'pingpong',action:'Play ping-pong',instruction:'A left · L right · return in the gold zone',goal:Infinity},
  {id:'golf',shortDate:'Oct 9th, 2021',title:'First date',context:'Mini golf on our first date.',season:'autumn',outfit:'summer',kind:'golf',action:'Play one hole',instruction:'Press E or click to putt when the marker is in gold',goal:1},
  {id:'burger',shortDate:'Nov 14th, 2021',title:'MrBeast Burger',context:'The first I love you.',season:'autumn',outfit:'summer',kind:'burger',action:'Share a burger',instruction:'Click the burger or press E',goal:5},
  {id:'skating',shortDate:'Mar 27th, 2022',title:'First skate together',context:'Out on the frozen lake.',season:'winter',outfit:'skate',kind:'skate',action:'Go skating',instruction:'Arrow keys / WASD to glide · release to coast',goal:Infinity},
  {id:'italy',shortDate:'Aug 2022',title:'First travels',context:'Our first trip to Italy.',season:'coast',outfit:'summer',kind:'view',action:'Explore Italy',instruction:'',goal:0},
  {id:'woods',shortDate:'Oct 9th, 2022',title:'One year',context:'A walk in the woods.',season:'autumn',outfit:'summer',kind:'view',action:'Walk the boardwalk',instruction:'',goal:0},
  {id:'concert',shortDate:'Aug 30th, 2023',title:'First concert',context:'Our first concert.',season:'night',outfit:'summer',kind:'concert',action:'Step on stage',instruction:'← → to move across the stage',goal:1},
  {id:'two-years',shortDate:'Oct 9th, 2023',title:'Two years',context:'Two balloons. Mostly crickets.',season:'autumn',outfit:'summer',kind:'view',action:'Stop here',instruction:'',goal:0},
  {id:'sylvan',shortDate:'May 18th, 2024',title:'Road trip!',context:'A road trip, internships, and long distance: part one.',season:'spring',outfit:'summer',kind:'lake',action:'Skip a stone',instruction:'Press E or click to skip three stones',goal:3},
  {id:'home',shortDate:'Aug 2024',title:'Our place',context:'Moving into our apartment.',season:'summer',outfit:'summer',kind:'home',action:'Take the elevator',instruction:'Ride up, then unpack the couch, TV, and lamp',goal:3},
  {id:'bbq',shortDate:'Oct 9th, 2024',title:'Three years',context:'Simon’s first Korean BBQ.',season:'autumn',outfit:'summer',kind:'bbq',action:'Get grilling',instruction:'Click the grill or press E to turn each piece',goal:4},
  {id:'skiing',shortDate:'Feb 2nd, 2025',title:'A day on the slopes',context:'Skis for him. Snowboard for her.',season:'winter',outfit:'ski',kind:'ski',action:'Take a run',instruction:'← → steer downhill through five blue gates',goal:5},
  {id:'internships',shortDate:'May 2025',title:'New internships',context:'Long distance, part two.',season:'spring',outfit:'work',kind:'view',action:'Pause here',instruction:'',goal:0},
  {id:'flowers',shortDate:'Oct 9th, 2025',title:'Four years',context:'Our fourth anniversary.',season:'autumn',outfit:'summer',kind:'flowers',action:'Give the flowers',instruction:'Click the bouquet or press E',goal:1},
  {id:'dubai',shortDate:'Dec 2025',title:'Dubai',context:'December in Dubai.',season:'desert',outfit:'summer',kind:'view',action:'Explore the courtyard',instruction:'',goal:0},
  {id:'graduation',shortDate:'May 2026',title:'Graduation',context:'University of Alberta · Class of 2026',season:'spring',outfit:'grad',kind:'grad',action:'Cross the stage',instruction:'Hold → to walk across and collect your diplomas',goal:1},
  {id:'cruise',shortDate:'Jun 2026',title:'Regal Princess',context:'Our first trip fully alone. Central America by sea.',season:'coast',outfit:'summer',kind:'cruise',action:'Board Regal Princess',instruction:'Hold → to walk up, across the deck, and down',goal:1},
  {id:'five-years',shortDate:'Oct 9th, 2026',title:'Five years',context:'New York City. Pizza for two.',season:'night',outfit:'summer',kind:'pizza',action:'Grab a slice',instruction:'Click or press E to eat a slice',goal:4},
  {id:'future',shortDate:'2026 & BEYOND',title:'New jobs & beyond',context:'August 2026 onwards · Camrose and New York.',season:'summer',outfit:'work',kind:'future',action:'Plant a tree',instruction:'Click the sapling or press E',goal:1},
];
export const chapters: Chapter[] = memories.map((chapter,i) => ({...chapter,x:i*24}));
export const chapterIndex = (id: string) => chapters.findIndex(c => c.id === id);
export const WORLD_END = chapters[chapters.length-1].x + 9;
export function nearestChapter(x:number) { return chapters[Math.max(0,Math.min(chapters.length-1,Math.round(x/24)))]; }
export const characters = [
  { name: 'Character one', skin: '#e0b59c', hair: '#665246', top: '#9ba5aa', trousers: '#ab7e88', height: 1.15, style: 'tee' as const },
  { name: 'Character two', skin: '#d7a080', hair: '#332c29', top: '#871f3c', trousers: '#f0eee3', height: 0.96, style: 'halter' as const },
];
