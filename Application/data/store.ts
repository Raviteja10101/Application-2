import AsyncStorage from '@react-native-async-storage/async-storage';
export type Session={id:string;title:string;subject:string;minutes:number;cycles:number;status:'active'|'paused'|'completed';createdAt:string};
const KEY='study_focus_sessions';
const seed:Session[]=[
{id:'1',title:'Modern Macroeconomic Theory',subject:'Core Reading',minutes:50,cycles:3,status:'active',createdAt:'2026-09-21'},
{id:'2',title:'Linear Algebra & Vector Spaces',subject:'Derivations',minutes:45,cycles:1,status:'active',createdAt:'2026-09-21'},
{id:'3',title:'Microfoundations of Money',subject:'Seminar Prep',minutes:60,cycles:2,status:'active',createdAt:'2026-09-21'},
{id:'4',title:'Epistemology of Economics',subject:'Term I Seminar',minutes:40,cycles:2,status:'paused',createdAt:'2026-09-18'},
{id:'5',title:'Econometrics Problem Set III',subject:'Completed',minutes:55,cycles:4,status:'completed',createdAt:'2026-09-14'},
{id:'6',title:'Monetary History: Bretton Woods',subject:'Draft',minutes:45,cycles:0,status:'paused',createdAt:'2026-09-10'}];
export async function getSessions(){const raw=await AsyncStorage.getItem(KEY);if(raw)return JSON.parse(raw) as Session[];await AsyncStorage.setItem(KEY,JSON.stringify(seed));return seed;}
export async function saveSession(s:Session){const xs=await getSessions();await AsyncStorage.setItem(KEY,JSON.stringify([s,...xs]));}