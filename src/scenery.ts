// Placement rules use the lowest camera elevation in the timeline. A small tree
// down-screen must project below a sign, even when its crown reaches toward it.
export const TRANSITION_TREE_Z = 7.3;
export const TRANSITION_TREE_X_OFFSET = .95;
export const transitionCrowns = [
 {p:[0,5.1,0],s:[2.05,2.12,1.25]},
 {p:[-1.15,4.1,.15],s:[1.42,1.3,1.1]},
 {p:[1.1,4.4,-.05],s:[1.48,1.48,1.2]},
 {p:[-.8,6.2,-.2],s:[1.48,1.12,1.1]},
 {p:[1,5.9,.12],s:[1.38,1.15,1.1]},
 {p:[0,3.55,.35],s:[1.5,1.23,1.1]},
] as const;
export function foregroundTreePlacement(seed:number) {
 const side=seed%2?-1:1;
 return {x:side*(5.4+(seed%4)*.38),z:6.7+(seed%3)*.35,scale:.64+(seed%3)*.055};
}
