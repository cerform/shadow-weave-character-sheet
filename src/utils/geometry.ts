// src/utils/geometry.ts
export const angleBetween = (ax:number,az:number,bx:number,bz:number)=>Math.atan2(bz-az,bx-ax);