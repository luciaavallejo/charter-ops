"use client";
import { useState, useEffect, useRef } from "react";

const FLEET = [
  { reg:"EC-MUS",  model:"Gulfstream 650",    yom:2014, yor:null, base:"LEMD", seats:13, pilots:7, wifi:"KA Band",    range:5800, etops:180 },
  { reg:"EC-MRL",  model:"Gulfstream 550",    yom:2017, yor:null, base:"LEMD", seats:18, pilots:3, wifi:"NO",         range:5500, etops:180 },
  { reg:"EC-OFG",  model:"Gulfstream 550",    yom:2013, yor:null, base:"LEMD", seats:14, pilots:3, wifi:"KA Band*",   range:5500, etops:180 },
  { reg:"EC-NOC",  model:"Global 6500",       yom:2020, yor:null, base:"LEMD", seats:15, pilots:4, wifi:"KA Band",    range:5400, etops:180 },
  { reg:"EC-LEB",  model:"Global XRS",        yom:2009, yor:null, base:"LEMD", seats:14, pilots:4, wifi:"NO (Star)",  range:5100, etops:180 },
  { reg:"EC-MNH",  model:"Global XRS",        yom:2010, yor:null, base:"LEMD", seats:15, pilots:2, wifi:"SBB",        range:5100, etops:180 },
  { reg:"EC-MMD",  model:"Global XRS",        yom:2012, yor:2024, base:"LEMD", seats:13, pilots:3, wifi:"SBB (Star)", range:5100, etops:180 },
  { reg:"9H-BELL", model:"Falcon 7X",         yom:2013, yor:2022, base:"Floating Base", seats:12, pilots:4, wifi:"Starlink", range:5000, etops:180 },
  { reg:"9H-ALU",  model:"Falcon 7X",         yom:2010, yor:2018, base:"LEMD", seats:12, pilots:1, wifi:"KA Band",   range:5000, etops:180 },
  { reg:"9H-AMO",  model:"Gulfstream 450",    yom:2005, yor:2021, base:"EGGW", seats:13, pilots:3, wifi:"KA Band",   range:3900, etops:180 },
  { reg:"EC-LGV",  model:"Falcon 2000LX",     yom:2010, yor:2017, base:"LEBL", seats:8,  pilots:3, wifi:"NO",        range:3300, etops:120 },
  { reg:"EC-MRR",  model:"Falcon 2000LX",     yom:2011, yor:2017, base:"LEMD", seats:10, pilots:3, wifi:"NO",        range:3300, etops:120 },
  { reg:"EC-OEV",  model:"Falcon 2000LX",     yom:2012, yor:2018, base:"LEMD", seats:9,  pilots:3, wifi:"SBB",       range:3300, etops:120 },
  { reg:"9H-OWL",  model:"Challenger 605",    yom:2013, yor:null, base:"LEMD", seats:10, pilots:3, wifi:"SBB",       range:3100, etops:180 },
  { reg:"EC-HYI",  model:"Falcon 2000",       yom:2001, yor:2013, base:"LEMD", seats:10, pilots:3, wifi:"NO",        range:2000, etops:120 },
  { reg:"EC-NBS",  model:"Citation Latitude", yom:2019, yor:null, base:"LEBL", seats:7,  pilots:3, wifi:"SBB",       range:2400, etops:120 },
  { reg:"EC-LYL",  model:"Citation XLS+",     yom:2013, yor:null, base:"LEMD", seats:8,  pilots:3, wifi:"SBB",       range:1300, etops:120 },
  { reg:"EC-MSS",  model:"Citation XLS+",     yom:2017, yor:null, base:"LEMD", seats:8,  pilots:2, wifi:"NO",        range:1300, etops:120 },
  { reg:"EC-NCJ",  model:"Citation XLS+",     yom:2009, yor:2024, base:"LEPP", seats:8,  pilots:3, wifi:"NO",        range:1300, etops:120 },
  { reg:"EC-KOL",  model:"Citation Excel",    yom:2000, yor:2017, base:"LEMD", seats:9,  pilots:2, wifi:"NO",        range:1300, etops:120 },
  { reg:"EC-NRA",  model:"Pilatus PC-24",     yom:2022, yor:null, base:"LEMD", seats:7,  pilots:3, wifi:"NO",        range:1250, etops:120 },
];

const COLORS = [
  { id:"c1",  hex:"#EF4444", name:"Red"        },
  { id:"c2",  hex:"#EAB308", name:"Yellow"     },
  { id:"c3",  hex:"#22C55E", name:"Green"      },
  { id:"c4",  hex:"#3B82F6", name:"Blue"       },
  { id:"c5",  hex:"#06B6D4", name:"Cyan"       },
  { id:"c6",  hex:"#14B8A6", name:"Turquoise"  },
  { id:"c7",  hex:"#8B5CF6", name:"Violet"     },
  { id:"c8",  hex:"#A855F7", name:"Lilac"      },
  { id:"c9",  hex:"#EC4899", name:"Pink"       },
  { id:"c10", hex:"#FBCFE8", name:"Light Pink" },
  { id:"c11", hex:"#9CA3AF", name:"Gray"       },
  { id:"c12", hex:"#F97316", name:"Orange"     },
];

const BRIEFING_FIELDS = [
  "DISPO","OA","CONTRATO","PAX","CATERING","TRIPU",
  "BRIF","POP","COBRO","P1 / PNR",
  "SLOTS","CREDIT HOLD","MOVIMIENTO","PERMISOS","FACTURA F."
];

const STATUS_CYCLE = ["gray","red","yellow","green","black"];
const STATUS_META: Record<string,{bg:string,label:string}> = {
  red:    { bg:"#EF4444", label:"Critical"    },
  yellow: { bg:"#EAB308", label:"In Progress" },
  green:  { bg:"#22C55E", label:"Done"        },
  gray:   { bg:"#9CA3AF", label:"Default"     },
  black:  { bg:"#374151", label:"No Need"     },
};

const ICAO_CITIES: Record<string,string[]> = {
  LEMD:["madrid","barajas"],LEBL:["barcelona","el prat"],LEPP:["pamplona"],
  EGGW:["london","luton"],EGLL:["heathrow"],LFPG:["paris","cdg"],
  LIRF:["roma","rome","fiumicino"],LSZH:["zurich"],EDDM:["munich"],LFMN:["nice","niza"],
};

const CHART_COLORS = ["#3B82F6","#22C55E","#F97316","#A855F7","#EC4899","#06B6D4","#EAB308","#14B8A6","#8B5CF6","#EF4444"];

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function initBriefing(): Record<string,string> {
  return Object.fromEntries(BRIEFING_FIELDS.map(f => [f,"gray"]));
}

function getStatus(b: Record<string,string>): string {
  const v = Object.values(b);
  if (v.includes("red"))    return "red";
  if (v.includes("yellow")) return "yellow";
  const a = v.filter(x => x!=="gray"&&x!=="black");
  if (a.length>0&&a.every(x=>x==="green")) return "green";
  return "gray";
}

function getPct(b: Record<string,string>): number {
  const v = Object.values(b);
  const a = v.filter(x=>x!=="black");
  const d = a.filter(x=>x==="green");
  return a.length===0?100:Math.round((d.length/a.length)*100);
}

function matchSearch(f: any, q: string): boolean {
  if (!q) return true;
  const l = q.toLowerCase();
  if ([f.localizador,f.client,f.plane,f.tripId||"",f.origin,f.destination].some((x:string)=>x.toLowerCase().includes(l))) return true;
  for (const [icao,cities] of Object.entries(ICAO_CITIES)) {
    if (icao.toLowerCase().includes(l)||(cities as string[]).some((c:string)=>c.includes(l))) {
      if (f.origin===icao||f.destination===icao) return true;
    }
  }
  return false;
}

function todayStr(): string { return new Date().toISOString().slice(0,10); }
function tomorrowStr(): string { const d=new Date();d.setDate(d.getDate()+1);return d.toISOString().slice(0,10); }
function weekEndStr(): string { const d=new Date();d.setDate(d.getDate()+7);return d.toISOString().slice(0,10); }

// Format time in Spain local time
function formatLocalTime(depDate: string, depTime: string): string {
  try {
    const dt = new Date(`${depDate}T${depTime}:00`);
    return dt.toLocaleTimeString("es-ES", { timeZone:"Europe/Madrid", hour:"2-digit", minute:"2-digit" });
  } catch { return depTime; }
}

// Smart time parsing: 1000 -> 10:00, 1300 -> 13:00, 4 -> 04:00, 0005 -> 00:05
function parseSmartTime(raw: string): string {
  const digits = raw.replace(/\D/g,"");
  if (!digits) return "";
  if (digits.length <= 2) {
    const h = parseInt(digits);
    if (h >= 0 && h <= 23) return `${String(h).padStart(2,"0")}:00`;
    return "";
  }
  if (digits.length === 3) {
    const h = parseInt(digits[0]);
    const m = parseInt(digits.slice(1));
    if (h>=0&&h<=9&&m>=0&&m<=59) return `0${h}:${String(m).padStart(2,"0")}`;
  }
  if (digits.length >= 4) {
    const h = parseInt(digits.slice(0,2));
    const m = parseInt(digits.slice(2,4));
    if (h>=0&&h<=23&&m>=0&&m<=59) return `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}`;
  }
  return "";
}


// Smart date parsing: 10102026 -> 2026-10-10, 261226 -> 2026-12-26
function parseSmartDate(raw: string): string {
  const digits = raw.replace(/\D/g,"");
  if (!digits) return "";
  const currentYear = new Date().getFullYear();
  const yearPrefix = Math.floor(currentYear/100); // 20
  if (digits.length === 6) {
    // DDMMYY -> assume 20YY
    const d=digits.slice(0,2), m=digits.slice(2,4), y=digits.slice(4,6);
    return `${yearPrefix}${y}-${m}-${d}`;
  }
  if (digits.length === 8) {
    // DDMMYYYY
    const d=digits.slice(0,2), m=digits.slice(2,4), y=digits.slice(4,8);
    return `${y}-${m}-${d}`;
  }
  return "";
}

// Check if email is valid
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Filter flights by time period
function inPeriod(f: any, period: string): boolean {
  const d = new Date(f.depDate);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "day") {
    return f.depDate === todayStr();
  } else if (period === "week") {
    const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate()-7);
    return d >= weekAgo && d <= now;
  } else if (period === "month") {
    return d.getMonth()===now.getMonth()&&d.getFullYear()===now.getFullYear();
  }
  return true;
}

// Donut chart SVG
function DonutChart({ value, total, color, label, sublabel }: { value:number, total:number, color:string, label:string, sublabel:string }) {
  const pct = total===0?0:Math.round((value/total)*100);
  const r = 36, cx = 44, cy = 44;
  const circ = 2*Math.PI*r;
  const dash = (pct/100)*circ;
  return (
    <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,minWidth:100}}>
      <svg width={88} height={88} viewBox="0 0 88 88">
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E2E8F0" strokeWidth={10}/>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={`${dash} ${circ}`} strokeDashoffset={circ/4}
          strokeLinecap="round" style={{transition:"stroke-dasharray 0.5s"}}/>
        <text x={cx} y={cy-4} textAnchor="middle" fontSize={14} fontWeight={700} fill={color}>{value}</text>
        <text x={cx} y={cy+12} textAnchor="middle" fontSize={9} fill="#94A3B8">{pct}%</text>
      </svg>
      <div style={{fontSize:11,fontWeight:700,color:"#0F172A",textAlign:"center",maxWidth:90}}>{label}</div>
      <div style={{fontSize:10,color:"#94A3B8",textAlign:"center"}}>{sublabel}</div>
    </div>
  );
}

function useT(theme: string) {
  const dark = theme==="dark";
  return {
    dark,
    bg:      dark?"#0A0E1A":"#F8FAFC",
    surface: dark?"#0F1629":"#FFFFFF",
    border:  dark?"#1E293B":"#E2E8F0",
    text:    dark?"#F1F5F9":"#0F172A",
    muted:   dark?"#64748B":"#94A3B8",
    sub:     dark?"#475569":"#94A3B8",
    inp:     dark?"#1E293B":"#F1F5F9",
  };
}

// ─── AUTH ─────────────────────────────────────────────────────────────────────

function AuthScreen({ onLogin }: { onLogin: (u:any, users:any)=>void }) {
  const [stored, setStored] = useState<Record<string,any>>(()=>{
    try { return JSON.parse(localStorage.getItem("ch_users")||"{}"); } catch { return {}; }
  });
  const [mode, setMode]   = useState("login");
  const [lmode, setLmode] = useState("password");
  const [email, setEmail] = useState("");
  const [pass,  setPass]  = useState("");
  const [pass2, setPass2] = useState("");
  const [color, setColor] = useState<string|null>(null);
  const [err,   setErr]   = useState("");
  const [magic, setMagic] = useState(false);

  const taken = Object.values(stored).map((u:any)=>u.color);
  const avail = COLORS.filter(c=>!taken.includes(c.id));
  const T = useT("light");
  const inp = {width:"100%",padding:"10px 14px",background:T.inp,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:14,outline:"none"};

  function doRegister() {
    setErr("");
    if (!email.trim())       return setErr("Email is required");
    if (!isValidEmail(email))return setErr("Please enter a valid email address");
    if (!pass)               return setErr("Password is required");
    if (pass!==pass2)        return setErr("Passwords don't match");
    if (!color)              return setErr("Please choose a color");
    if (stored[email])       return setErr("Already registered — sign in");
    const name = email.split("@")[0].toUpperCase();
    const isFirst = Object.keys(stored).length === 0;
    const next = {...stored,[email]:{password:pass,color,name,isAdmin:isFirst}};
    localStorage.setItem("ch_users",JSON.stringify(next));
    setStored(next);
    onLogin({email,color,name,isAdmin:isFirst},next);
  }

  function doLogin() {
    setErr("");
    if (!email.trim())        return setErr("Email is required");
    if (!isValidEmail(email)) return setErr("Please enter a valid email address");
    if (lmode==="magic")      { setMagic(true); return; }
    if (!pass)                return setErr("Password is required");
    const u = stored[email];
    if (!u) return setErr("Not found — sign up first");
    if (u.password!==pass) return setErr("Wrong password");
    onLogin({email,color:u.color,name:u.name,isAdmin:u.isAdmin},stored);
  }

  if (magic) return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif"}}>
      <div style={{width:400,background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,padding:40,textAlign:"center",boxShadow:"0 8px 30px rgba(0,0,0,0.08)"}}>
        <div style={{fontSize:40,marginBottom:16}}>📬</div>
        <div style={{fontSize:18,fontWeight:700,color:T.text}}>Check your email</div>
        <div style={{fontSize:13,color:T.muted,marginTop:8}}>Magic link sent to {email}</div>
        <button onClick={()=>setMagic(false)} style={{marginTop:20,padding:"8px 20px",background:T.inp,border:`1px solid ${T.border}`,borderRadius:8,color:T.muted,cursor:"pointer",fontSize:13}}>← Back</button>
      </div>
    </div>
  );

  return (
    <div style={{minHeight:"100vh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",fontFamily:"system-ui,sans-serif"}}>
      <div style={{width:430,background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,padding:"40px 36px",boxShadow:"0 8px 30px rgba(0,0,0,0.08)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:28,marginBottom:6}}>✈️</div>
          <div style={{fontSize:24,fontWeight:700,color:T.text}}>Charter</div>
          <div style={{fontSize:13,color:T.muted,marginTop:3}}>Private Aviation Operations</div>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:22,background:T.inp,borderRadius:8,padding:4}}>
          {[["login","Sign In"],["register","Sign Up"]].map(([m,l])=>(
            <button key={m} onClick={()=>{setMode(m);setErr("");}} style={{flex:1,padding:"8px",borderRadius:6,border:"none",background:mode===m?"#0F172A":"transparent",color:mode===m?"#fff":T.muted,fontSize:13,fontWeight:600,cursor:"pointer"}}>{l}</button>
          ))}
        </div>
        <div style={{marginBottom:14}}>
          <label style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em"}}>Email</label>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="you@company.com" style={{...inp,marginTop:6}}/>
        </div>
        {mode==="login"&&(
          <div style={{display:"flex",gap:6,marginBottom:14}}>
            {[["password","🔑 Password"],["magic","✨ Magic Link"]].map(([m,l])=>(
              <button key={m} onClick={()=>setLmode(m)} style={{flex:1,padding:"7px",borderRadius:7,border:`1px solid ${lmode===m?"#3B82F6":T.border}`,background:lmode===m?"rgba(59,130,246,0.08)":"transparent",color:lmode===m?"#3B82F6":T.muted,fontSize:12,fontWeight:600,cursor:"pointer"}}>{l}</button>
            ))}
          </div>
        )}
        {(mode==="register"||lmode==="password")&&(
          <div style={{marginBottom:14}}>
            <label style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em"}}>Password</label>
            <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="••••••••" style={{...inp,marginTop:6}}/>
          </div>
        )}
        {mode==="register"&&(
          <>
            <div style={{marginBottom:14}}>
              <label style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em"}}>Confirm Password</label>
              <input type="password" value={pass2} onChange={e=>setPass2(e.target.value)} placeholder="••••••••" style={{...inp,marginTop:6}}/>
            </div>
            <div style={{marginBottom:20}}>
              <label style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.08em"}}>Your Color (unique)</label>
              <div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:10}}>
                {avail.map(c=>(
                  <button key={c.id} onClick={()=>setColor(c.id)} title={c.name} style={{width:30,height:30,borderRadius:"50%",background:c.hex,cursor:"pointer",border:color===c.id?"3px solid #0F172A":"3px solid transparent",boxShadow:color===c.id?`0 0 0 2px ${c.hex}`:"none",transition:"all 0.15s"}}/>
                ))}
              </div>
              {color&&<div style={{fontSize:12,color:T.muted,marginTop:6}}>Selected: <span style={{color:COLORS.find(c=>c.id===color)?.hex,fontWeight:700}}>{COLORS.find(c=>c.id===color)?.name}</span></div>}
            </div>
          </>
        )}
        {err&&<div style={{color:"#EF4444",fontSize:12,marginBottom:12,padding:"9px 12px",background:"rgba(239,68,68,0.08)",borderRadius:8}}>{err}</div>}
        <button onClick={mode==="login"?doLogin:doRegister} style={{width:"100%",padding:"12px",background:"#0F172A",border:"none",borderRadius:8,color:"#fff",fontSize:14,fontWeight:700,cursor:"pointer"}}>
          {mode==="login"?(lmode==="magic"?"Send Magic Link ✨":"Sign In →"):"Create Account →"}
        </button>
      </div>
    </div>
  );
}

// ─── CHAT ─────────────────────────────────────────────────────────────────────

function ChatPanel({ field, messages, userColor, onSend, onClose, T }: any) {
  const [msg, setMsg] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(()=>{ ref.current?.scrollIntoView({behavior:"smooth"}); },[messages]);
  function send() { if(!msg.trim())return; onSend(field,msg.trim()); setMsg(""); }
  return (
    <div style={{position:"fixed",right:20,bottom:20,width:320,height:400,background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,display:"flex",flexDirection:"column",zIndex:5000,boxShadow:"0 20px 40px rgba(0,0,0,0.15)"}}>
      <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontWeight:700,color:T.text,fontSize:13}}>💬 {field}</span>
        <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:16}}>✕</button>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:12,display:"flex",flexDirection:"column",gap:8}}>
        {(!messages||messages.length===0)&&<div style={{color:T.muted,fontSize:12,textAlign:"center",marginTop:20}}>No messages yet</div>}
        {(messages||[]).map((m: any,i: number)=>{
          const col=COLORS.find(c=>c.id===m.user)?.hex||"#64748B";
          const isMe=m.user===userColor;
          return(
            <div key={i} style={{display:"flex",flexDirection:"column",alignItems:isMe?"flex-end":"flex-start"}}>
              <div style={{fontSize:10,color:T.muted,marginBottom:2}}>{m.date} {m.time}</div>
              <div style={{maxWidth:"80%",padding:"8px 12px",lineHeight:1.4,fontSize:13,color:isMe?"#fff":T.text,borderRadius:isMe?"12px 12px 2px 12px":"12px 12px 12px 2px",background:isMe?col:T.inp}}>{m.text}</div>
            </div>
          );
        })}
        <div ref={ref}/>
      </div>
      <div style={{padding:12,borderTop:`1px solid ${T.border}`,display:"flex",gap:8}}>
        <input value={msg} onChange={e=>setMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Write a message..." style={{flex:1,padding:"8px 12px",background:T.inp,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:13,outline:"none"}}/>
        <button onClick={send} style={{padding:"8px 12px",background:"#3B82F6",border:"none",borderRadius:8,color:"#fff",cursor:"pointer",fontSize:13}}>→</button>
      </div>
    </div>
  );
}

// ─── BRIEFING ─────────────────────────────────────────────────────────────────

function BriefingPanel({ flight, userColor, onStatusChange, onSendMessage, onAddReminder, T }: any) {
  const [openChat, setOpenChat] = useState<string|null>(null);
  const [showRem,  setShowRem]  = useState(false);
  const [rDate, setRDate] = useState(""); const [rTime, setRTime] = useState(""); const [rNote, setRNote] = useState("");
  const [rEmails, setREmails] = useState<string[]>(()=>{ try{return JSON.parse(localStorage.getItem("ch_rem_emails")||"[]")}catch{return[]} });
  const [rInput, setRInput] = useState("");
  const pct = getPct(flight.briefing);
  const inp = {padding:"7px 10px",background:T.inp,border:`1px solid ${T.border}`,borderRadius:7,color:T.text,fontSize:12,outline:"none",width:"100%"};

  function cycle(field: string) {
    const cur=flight.briefing[field],idx=STATUS_CYCLE.indexOf(cur);
    onStatusChange(flight.id,field,STATUS_CYCLE[(idx+1)%STATUS_CYCLE.length]);
  }
  function addEmail() {
    if(!rInput.trim()||rEmails.includes(rInput.trim()))return;
    const n=[...rEmails,rInput.trim()]; setREmails(n); localStorage.setItem("ch_rem_emails",JSON.stringify(n)); setRInput("");
  }
  function removeEmail(e: string) { const n=rEmails.filter(x=>x!==e); setREmails(n); localStorage.setItem("ch_rem_emails",JSON.stringify(n)); }
  function saveRem() { if(!rDate||!rTime)return; onAddReminder(flight.id,{date:rDate,time:rTime,note:rNote,emails:rEmails}); setShowRem(false); setRDate("");setRTime("");setRNote(""); }

  return (
    <div style={{padding:"16px 20px 20px",background:T.dark?"#060A14":"#F8FAFC",borderTop:`1px solid ${T.border}`}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}>
            <span style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>Briefing</span>
            <span style={{fontSize:11,fontWeight:700,color:pct===100?"#22C55E":T.text}}>{pct}%</span>
          </div>
          <div style={{height:4,background:T.border,borderRadius:2}}>
            <div style={{height:"100%",width:`${pct}%`,background:pct===100?"#22C55E":"#3B82F6",borderRadius:2,transition:"width 0.3s"}}/>
          </div>
        </div>
        <button onClick={()=>setShowRem(v=>!v)} style={{marginLeft:16,background:showRem?"rgba(59,130,246,0.08)":"none",border:`1px solid ${showRem?"#3B82F6":T.border}`,borderRadius:8,padding:"6px 12px",color:showRem?"#3B82F6":T.muted,cursor:"pointer",fontSize:12,fontWeight:600}}>
          📅 Reminder{flight.reminders?.length>0?` (${flight.reminders.length})`:""}</button>
      </div>
      {showRem&&(
        <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:10,padding:14,marginBottom:14}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
            <div><label style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>Date</label><input type="date" value={rDate} onChange={e=>setRDate(e.target.value)} style={{...inp,marginTop:4}}/></div>
            <div><label style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>Time</label><input type="time" value={rTime} onChange={e=>setRTime(e.target.value)} style={{...inp,marginTop:4}}/></div>
            <div><label style={{fontSize:10,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.06em"}}>Note</label><input value={rNote} onChange={e=>setRNote(e.target.value)} placeholder="Note..." style={{...inp,marginTop:4}}/></div>
          </div>
          <div style={{display:"flex",gap:8,marginBottom:8}}>
            <input value={rInput} onChange={e=>setRInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&addEmail()} placeholder="Add email..." style={{...inp,flex:1}}/>
            <button onClick={addEmail} style={{padding:"7px 12px",background:"#3B82F6",border:"none",borderRadius:7,color:"#fff",fontSize:12,fontWeight:600,cursor:"pointer"}}>+ Add</button>
          </div>
          {rEmails.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>{rEmails.map((e:string)=><span key={e} style={{background:T.inp,border:`1px solid ${T.border}`,borderRadius:20,padding:"2px 8px",fontSize:11,color:T.text,display:"flex",alignItems:"center",gap:4}}>{e}<button onClick={()=>removeEmail(e)} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:11}}>✕</button></span>)}</div>}
          {flight.reminders?.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>{flight.reminders.map((r:any,i:number)=><span key={i} style={{background:T.dark?"#1E293B":"#EFF6FF",border:`1px solid ${T.border}`,borderRadius:6,padding:"2px 8px",fontSize:10,color:T.muted}}>📅 {r.date} {r.time}{r.note?` · ${r.note}`:""}</span>)}</div>}
          <button onClick={saveRem} style={{padding:"7px 16px",background:"#0F172A",border:"none",borderRadius:7,color:"#fff",fontSize:12,fontWeight:700,cursor:"pointer"}}>Save Reminder</button>
        </div>
      )}
      <div style={{display:"grid",gridTemplateColumns:"repeat(5,1fr)",gap:7}}>
        {BRIEFING_FIELDS.map(field=>{
          const status=flight.briefing[field]||"gray", meta=STATUS_META[status];
          const msgs=flight.messages?.[field]||[], unread=msgs.filter((m:any)=>!m.read).length, total=msgs.length;
          return(
            <div key={field} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,padding:"8px 10px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
              <div style={{display:"flex",alignItems:"center",gap:7}}>
                <button onClick={()=>cycle(field)} style={{width:10,height:10,borderRadius:"50%",background:meta?.bg||"#9CA3AF",border:"none",cursor:"pointer",flexShrink:0,boxShadow:status!=="gray"&&status!=="black"?`0 0 5px ${meta?.bg}80`:"none"}}/>
                <span style={{fontSize:10,fontWeight:600,color:T.muted,letterSpacing:"0.03em"}}>{field}</span>
              </div>
              <button onClick={()=>{ setOpenChat(openChat===field?null:field); onSendMessage(flight.id,field,null,true); }} style={{background:"none",border:"none",cursor:"pointer",padding:"2px 4px"}}>
                {total>0?<span style={{fontSize:10,fontWeight:700,color:unread>0?"#3B82F6":"#9CA3AF",background:T.inp,borderRadius:10,padding:"1px 5px",minWidth:16,display:"inline-block",textAlign:"center"}}>{total}</span>:<span style={{fontSize:11,color:T.dark?"#334155":"#CBD5E1"}}>💬</span>}
              </button>
            </div>
          );
        })}
      </div>
      {openChat&&<ChatPanel field={openChat} messages={flight.messages?.[openChat]||[]} userColor={userColor} onSend={(f:string,t:string)=>onSendMessage(flight.id,f,t,false)} onClose={()=>setOpenChat(null)} T={T}/>}
    </div>
  );
}

// ─── TIME INPUT ───────────────────────────────────────────────────────────────

function TimeInput({ value, onChange, placeholder }: { value:string, onChange:(v:string)=>void, placeholder?:string }) {
  const [raw, setRaw] = useState(value);
  function handleBlur() {
    const parsed = parseSmartTime(raw);
    if (parsed) { setRaw(parsed); onChange(parsed); }
    else if (!raw) onChange("");
  }
  return (
    <input
      value={raw}
      onChange={e=>setRaw(e.target.value)}
      onBlur={handleBlur}
      placeholder={placeholder||"HH:MM"}
      style={{width:"100%",padding:"9px 12px",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:8,color:"#0F172A",fontSize:13,outline:"none"}}
    />
  );
}


function DateInput({ value, onChange, placeholder }: { value:string, onChange:(v:string)=>void, placeholder?:string }) {
  const [raw, setRaw] = useState(value);
  useEffect(()=>{ setRaw(value); },[value]);
  function handleBlur() {
    const parsed = parseSmartDate(raw);
    if (parsed) { setRaw(parsed); onChange(parsed); }
    else if (raw && raw.includes("-")) { onChange(raw); }
    else if (!raw) onChange("");
  }
  return (
    <div style={{position:"relative"}}>
      <input
        type="text"
        value={raw}
        onChange={e=>setRaw(e.target.value)}
        onBlur={handleBlur}
        placeholder={placeholder||"DD/MM/YYYY o 10102026"}
        style={{width:"100%",padding:"9px 12px",background:"#F8FAFC",border:"1px solid #E2E8F0",borderRadius:8,color:"#0F172A",fontSize:13,outline:"none"}}
      />
    </div>
  );
}

// ─── NEW FLIGHT MODAL ─────────────────────────────────────────────────────────

function NewFlightModal({ onClose, onSave, clients, setClients, T }: any) {
  const [form, setForm] = useState({localizador:"",tripId:"",origin:"",destination:"",depDate:"",depTime:"",arrDate:"",arrTime:"",type:"charter"});
  const [clientVal, setClientVal] = useState(""); const [planeVal, setPlaneVal] = useState("");
  const [cSugs, setCSugs] = useState<string[]>([]); const [pSugs, setPSugs] = useState<any[]>([]);
  const [err, setErr] = useState("");
  function set(k: string,v: string){setForm(p=>({...p,[k]:v}));}
  const inp = {width:"100%",padding:"9px 12px",background:T.inp,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:13,outline:"none"};
  const lbl: any = {fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:5};
  function save(){
    if(!form.localizador.trim())return setErr("Localizador is required");
    if(!form.origin.trim())return setErr("Origin ICAO is required");
    if(!form.destination.trim())return setErr("Destination ICAO is required");
    if(!form.depDate)return setErr("Departure date is required");
    if(!form.depTime)return setErr("Departure time is required");
    const flight={...form,client:clientVal,plane:planeVal,id:"FL"+Date.now().toString(36).toUpperCase(),responsibles:[],archived:false,briefing:initBriefing(),messages:{},reminders:[],updatedAt:Date.now()};
    if(clientVal&&!clients.includes(clientVal)){const nc=[...clients,clientVal];setClients(nc);localStorage.setItem("ch_clients",JSON.stringify(nc));}
    onSave(flight);
    onClose();
  }
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
      <div style={{width:560,background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,padding:"28px 28px 24px",maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <span style={{fontSize:18,fontWeight:700,color:T.text}}>+ New Flight</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:20}}>✕</button>
        </div>
        {err&&<div style={{color:"#EF4444",fontSize:12,marginBottom:14,padding:"9px 12px",background:"rgba(239,68,68,0.08)",borderRadius:8}}>{err}</div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div style={{gridColumn:"span 2"}}><label style={lbl}>Localizador *</label><input style={inp} value={form.localizador} onChange={e=>set("localizador",e.target.value)} placeholder="ABC123"/></div>
          <div><label style={lbl}>Trip ID</label><input style={inp} value={form.tripId} onChange={e=>set("tripId",e.target.value)} placeholder="Optional"/></div>
          <div><label style={lbl}>Type</label><select style={inp} value={form.type} onChange={e=>set("type",e.target.value)}><option value="charter">Charter</option><option value="empty leg">Empty Leg</option></select></div>
          <div><label style={lbl}>Origin ICAO *</label><input style={inp} value={form.origin} onChange={e=>set("origin",e.target.value.toUpperCase())} placeholder="LEMD"/></div>
          <div><label style={lbl}>Destination ICAO *</label><input style={inp} value={form.destination} onChange={e=>set("destination",e.target.value.toUpperCase())} placeholder="EGLL"/></div>
          <div><label style={lbl}>Departure Date * (ej: 10102026)</label>
            <div style={{display:"flex",gap:6}}>
              <DateInput value={form.depDate} onChange={v=>set("depDate",v)} placeholder="10102026"/>
              <input type="date" value={form.depDate} onChange={e=>set("depDate",e.target.value)} style={{padding:"9px 10px",border:`1px solid ${T.border}`,borderRadius:8,background:T.inp,color:T.text,fontSize:13,outline:"none",width:44,flexShrink:0}}/>
            </div>
          </div>
          <div><label style={lbl}>Departure Time * (ej: 1000)</label>
            <TimeInput value={form.depTime} onChange={v=>set("depTime",v)} placeholder="1300 → 13:00"/>
          </div>
          <div><label style={lbl}>Arrival Date (ej: 261226)</label>
            <div style={{display:"flex",gap:6}}>
              <DateInput value={form.arrDate} onChange={v=>set("arrDate",v)} placeholder="261226"/>
              <input type="date" value={form.arrDate} onChange={e=>set("arrDate",e.target.value)} style={{padding:"9px 10px",border:`1px solid ${T.border}`,borderRadius:8,background:T.inp,color:T.text,fontSize:13,outline:"none",width:44,flexShrink:0}}/>
            </div>
          </div>
          <div><label style={lbl}>Arrival Time (ej: 1430)</label>
            <TimeInput value={form.arrTime} onChange={v=>set("arrTime",v)} placeholder="1430 → 14:30"/>
          </div>
          <div style={{gridColumn:"span 2",position:"relative"}}>
            <label style={lbl}>Client</label>
            <input style={inp} value={clientVal} onChange={e=>{setClientVal(e.target.value);setCSugs(clients.filter((c:string)=>c.toLowerCase().includes(e.target.value.toLowerCase())));}} placeholder="Type or create new client..."/>
            {cSugs.length>0&&clientVal&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,zIndex:10,marginTop:3}}>
              {cSugs.map((c:string)=><div key={c} style={{padding:"9px 12px",display:"flex",alignItems:"center",justifyContent:"space-between",borderBottom:`1px solid ${T.border}`}} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.background=T.inp} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>
                <span onClick={()=>{setClientVal(c);setCSugs([]);}} style={{cursor:"pointer",color:T.text,fontSize:13,flex:1}}>{c}</span>
                <button onClick={e=>{e.stopPropagation();const nc=clients.filter((x:string)=>x!==c);setClients(nc);localStorage.setItem("ch_clients",JSON.stringify(nc));setCSugs(nc.filter((x:string)=>x.toLowerCase().includes(clientVal.toLowerCase())));}} style={{background:"none",border:"none",color:"#EF4444",cursor:"pointer",fontSize:12,padding:"0 4px",flexShrink:0}}>✕</button>
              </div>)}
            </div>}
          </div>
          <div style={{gridColumn:"span 2",position:"relative"}}>
            <label style={lbl}>Aircraft (Registration)</label>
            <input style={inp} value={planeVal} onChange={e=>{setPlaneVal(e.target.value.toUpperCase());setPSugs(FLEET.filter(p=>p.reg.toLowerCase().includes(e.target.value.toLowerCase())||p.model.toLowerCase().includes(e.target.value.toLowerCase())));}} placeholder="EC-MUS or Gulfstream..."/>
            {pSugs.length>0&&planeVal&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,zIndex:10,marginTop:3}}>
              {pSugs.map((p:any)=><div key={p.reg} onClick={()=>{setPlaneVal(p.reg);setPSugs([]);}} style={{padding:"9px 12px",cursor:"pointer",color:T.text,fontSize:13,borderBottom:`1px solid ${T.border}`}} onMouseOver={e=>(e.currentTarget as HTMLDivElement).style.background=T.inp} onMouseOut={e=>(e.currentTarget as HTMLDivElement).style.background="transparent"}>{p.reg} — {p.model}</div>)}
            </div>}
          </div>
        </div>
        <div style={{marginTop:22,display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{padding:"10px 20px",background:T.inp,border:`1px solid ${T.border}`,borderRadius:8,color:T.muted,cursor:"pointer",fontSize:13}}>Cancel</button>
          <button onClick={save} style={{padding:"10px 20px",background:"#0F172A",border:"none",borderRadius:8,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>Create Flight ✈️</button>
        </div>
      </div>
    </div>
  );
}


// ─── EDIT FLIGHT MODAL ────────────────────────────────────────────────────────

function EditFlightModal({ flight, onClose, onSave, clients, setClients, T }: any) {
  const [form, setForm] = useState({
    localizador: flight.localizador,
    tripId: flight.tripId||"",
    origin: flight.origin,
    destination: flight.destination,
    depDate: flight.depDate,
    depTime: flight.depTime,
    arrDate: flight.arrDate||"",
    arrTime: flight.arrTime||"",
    type: flight.type,
  });
  const [clientVal, setClientVal] = useState(flight.client||"");
  const [planeVal, setPlaneVal] = useState(flight.plane||"");
  const [cSugs, setCSugs] = useState<string[]>([]);
  const [pSugs, setPSugs] = useState<any[]>([]);
  const [err, setErr] = useState("");

  function set(k: string, v: string){ setForm(p=>({...p,[k]:v})); }
  const inp = {width:"100%",padding:"9px 12px",background:T.inp,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:13,outline:"none"};
  const lbl: any = {fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:5};

  function save(){
    if(!form.localizador.trim())return setErr("Localizador is required");
    if(!form.origin.trim())return setErr("Origin ICAO is required");
    if(!form.destination.trim())return setErr("Destination ICAO is required");
    if(!form.depDate)return setErr("Departure date is required");
    if(!form.depTime)return setErr("Departure time is required");
    if(clientVal&&!clients.includes(clientVal)){const nc=[...clients,clientVal];setClients(nc);localStorage.setItem("ch_clients",JSON.stringify(nc));}
    onSave({...flight,...form,client:clientVal,plane:planeVal,updatedAt:Date.now()});
    onClose();
  }

  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
      <div style={{width:560,background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,padding:"28px 28px 24px",maxHeight:"92vh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <span style={{fontSize:18,fontWeight:700,color:T.text}}>✏️ Edit Flight — {flight.localizador}</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:20}}>✕</button>
        </div>
        {err&&<div style={{color:"#EF4444",fontSize:12,marginBottom:14,padding:"9px 12px",background:"rgba(239,68,68,0.08)",borderRadius:8}}>{err}</div>}
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14}}>
          <div style={{gridColumn:"span 2"}}><label style={lbl}>Localizador *</label><input style={inp} value={form.localizador} onChange={e=>set("localizador",e.target.value)}/></div>
          <div><label style={lbl}>Trip ID</label><input style={inp} value={form.tripId} onChange={e=>set("tripId",e.target.value)} placeholder="Optional"/></div>
          <div><label style={lbl}>Type</label><select style={inp} value={form.type} onChange={e=>set("type",e.target.value)}><option value="charter">Charter</option><option value="empty leg">Empty Leg</option></select></div>
          <div><label style={lbl}>Origin ICAO *</label><input style={inp} value={form.origin} onChange={e=>set("origin",e.target.value.toUpperCase())}/></div>
          <div><label style={lbl}>Destination ICAO *</label><input style={inp} value={form.destination} onChange={e=>set("destination",e.target.value.toUpperCase())}/></div>
          <div><label style={lbl}>Departure Date *</label>
            <div style={{display:"flex",gap:6}}>
              <DateInput value={form.depDate} onChange={v=>set("depDate",v)} placeholder="10102026"/>
              <input type="date" value={form.depDate} onChange={e=>set("depDate",e.target.value)} style={{padding:"9px 10px",border:"1px solid #E2E8F0",borderRadius:8,background:"#F8FAFC",color:"#0F172A",fontSize:13,outline:"none",width:44,flexShrink:0}}/>
            </div>
          </div>
          <div><label style={lbl}>Departure Time *</label><TimeInput value={form.depTime} onChange={v=>set("depTime",v)} placeholder="1300 → 13:00"/></div>
          <div><label style={lbl}>Arrival Date</label>
            <div style={{display:"flex",gap:6}}>
              <DateInput value={form.arrDate} onChange={v=>set("arrDate",v)} placeholder="261226"/>
              <input type="date" value={form.arrDate} onChange={e=>set("arrDate",e.target.value)} style={{padding:"9px 10px",border:"1px solid #E2E8F0",borderRadius:8,background:"#F8FAFC",color:"#0F172A",fontSize:13,outline:"none",width:44,flexShrink:0}}/>
            </div>
          </div>
          <div><label style={lbl}>Arrival Time</label><TimeInput value={form.arrTime} onChange={v=>set("arrTime",v)} placeholder="1430 → 14:30"/></div>
          <div style={{gridColumn:"span 2",position:"relative"}}>
            <label style={lbl}>Client</label>
            <input style={inp} value={clientVal} onChange={e=>{setClientVal(e.target.value);setCSugs(clients.filter((c:string)=>c.toLowerCase().includes(e.target.value.toLowerCase())));}}/>
            {cSugs.length>0&&clientVal&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,zIndex:10,marginTop:3}}>
              {cSugs.map((c:string)=><div key={c} onClick={()=>{setClientVal(c);setCSugs([]);}} style={{padding:"9px 12px",cursor:"pointer",color:T.text,fontSize:13,borderBottom:`1px solid ${T.border}`}}>{c}</div>)}
            </div>}
          </div>
          <div style={{gridColumn:"span 2",position:"relative"}}>
            <label style={lbl}>Aircraft</label>
            <input style={inp} value={planeVal} onChange={e=>{setPlaneVal(e.target.value.toUpperCase());setPSugs(FLEET.filter(p=>p.reg.toLowerCase().includes(e.target.value.toLowerCase())||p.model.toLowerCase().includes(e.target.value.toLowerCase())));}}/>
            {pSugs.length>0&&planeVal&&<div style={{position:"absolute",top:"100%",left:0,right:0,background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,zIndex:10,marginTop:3}}>
              {pSugs.map((p:any)=><div key={p.reg} onClick={()=>{setPlaneVal(p.reg);setPSugs([]);}} style={{padding:"9px 12px",cursor:"pointer",color:T.text,fontSize:13,borderBottom:`1px solid ${T.border}`}}>{p.reg} — {p.model}</div>)}
            </div>}
          </div>
        </div>
        <div style={{marginTop:22,display:"flex",gap:10,justifyContent:"flex-end"}}>
          <button onClick={onClose} style={{padding:"10px 20px",background:T.inp,border:`1px solid ${T.border}`,borderRadius:8,color:T.muted,cursor:"pointer",fontSize:13}}>Cancel</button>
          <button onClick={save} style={{padding:"10px 20px",background:"#0F172A",border:"none",borderRadius:8,color:"#fff",fontWeight:700,cursor:"pointer",fontSize:13}}>Save Changes ✓</button>
        </div>
      </div>
    </div>
  );
}

// ─── AIRCRAFT CARD ────────────────────────────────────────────────────────────

function AircraftCard({ plane, onClose, T }: any) {
  const rows=[["Model",plane.model],["Year",plane.yom+(plane.yor?` (Refurb ${plane.yor})`:"")] ,["Base",plane.base],["Seats",`${plane.seats} pax`],["Pilots",plane.pilots],["Wi-Fi",plane.wifi],["Range",`${plane.range} nm`],["ETOPS",`${plane.etops} min`]];
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.45)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:2000}}>
      <div style={{width:380,background:T.surface,border:`1px solid ${T.border}`,borderRadius:16,padding:28}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
          <div><div style={{fontSize:20,fontWeight:700,color:T.text}}>{plane.reg}</div><div style={{fontSize:13,color:T.muted,marginTop:2}}>{plane.model}</div></div>
          <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:20}}>✕</button>
        </div>
        {rows.map(([k,v])=><div key={k as string} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:`1px solid ${T.border}`}}><span style={{fontSize:11,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.06em"}}>{k}</span><span style={{fontSize:13,color:T.text,fontWeight:500}}>{v}</span></div>)}
      </div>
    </div>
  );
}

// ─── SETTINGS PANEL ───────────────────────────────────────────────────────────

function SettingsPanel({ theme, setTheme, onClose, T, users, setUsers, currentUser }: any) {
  const userList = Object.entries(users).map(([email,u]:any)=>({email,...u}));

  function deleteUser(email: string) {
    if (email===currentUser.email) return;
    if (!confirm(`Delete user ${email}?`)) return;
    const next = {...users}; delete next[email];
    localStorage.setItem("ch_users",JSON.stringify(next));
    setUsers(next);
  }

  function changeColor(email: string, colorId: string) {
    const takenColors = Object.entries(users).filter(([e])=>e!==email).map(([,u]:any)=>u.color);
    if (takenColors.includes(colorId)) return alert("Color already taken");
    const next = {...users,[email]:{...users[email],color:colorId}};
    localStorage.setItem("ch_users",JSON.stringify(next));
    setUsers(next);
  }

  return(
    <div style={{position:"fixed",inset:0,zIndex:3000,display:"flex",justifyContent:"flex-end"}}>
      <div onClick={onClose} style={{flex:1,background:"rgba(0,0,0,0.3)"}}/>
      <div style={{width:320,background:T.surface,borderLeft:`1px solid ${T.border}`,padding:24,display:"flex",flexDirection:"column",gap:20,overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span style={{fontSize:16,fontWeight:700,color:T.text}}>Settings</span>
          <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:20}}>✕</button>
        </div>
        <div>
          <div style={{fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>Appearance</div>
          <div style={{display:"flex",gap:8}}>
            {[["light","☀️ Light"],["dark","🌙 Dark"]].map(([m,l])=><button key={m} onClick={()=>setTheme(m)} style={{flex:1,padding:"10px",borderRadius:8,border:`1px solid ${theme===m?"#0F172A":T.border}`,background:theme===m?"#0F172A":"transparent",color:theme===m?"#fff":T.muted,fontSize:13,fontWeight:600,cursor:"pointer"}}>{l}</button>)}
          </div>
        </div>
        {(currentUser.isAdmin||currentUser.email==='luciaavallejo@gmail.com')&&(
          <div>
            <div style={{fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:10}}>👑 Admin — Users</div>
            {userList.map((u:any)=>{
              const col = COLORS.find(c=>c.id===u.color);
              const takenColors = Object.entries(users).filter(([e])=>e!==u.email).map(([,uu]:any)=>uu.color);
              const avail = COLORS.filter(c=>!takenColors.includes(c.id));
              return(
                <div key={u.email} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div style={{width:20,height:20,borderRadius:"50%",background:col?.hex,flexShrink:0}}/>
                  <div style={{flex:1,fontSize:12,color:T.text,fontWeight:600}}>{u.name}<div style={{fontSize:10,color:T.muted}}>{u.email}</div></div>
                  <select onChange={e=>changeColor(u.email,e.target.value)} value={u.color} style={{fontSize:10,padding:"3px 5px",border:`1px solid ${T.border}`,borderRadius:5,background:T.inp,color:T.text}}>
                    <option value={u.color}>{col?.name}</option>
                    {avail.map(c=><option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  {u.email!==currentUser.email&&<button onClick={()=>deleteUser(u.email)} style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:5,color:"#EF4444",fontSize:10,padding:"3px 7px",cursor:"pointer"}}>✕</button>}
                </div>
              );
            })}
          </div>
        )}
        <div style={{padding:14,background:T.inp,borderRadius:10}}>
          <div style={{fontSize:11,fontWeight:700,color:T.muted,textTransform:"uppercase",letterSpacing:"0.06em",marginBottom:4}}>Version</div>
          <div style={{fontSize:13,color:T.text,fontWeight:600}}>Charter Ops v5.0</div>
          <div style={{fontSize:11,color:T.muted,marginTop:3}}>API-ready · PWA-compatible</div>
        </div>
      </div>
    </div>
  );
}

// ─── NOTIFICATIONS ────────────────────────────────────────────────────────────

function NotifPanel({ notifs, onClear, onClose, T }: any) {
  return(
    <div style={{position:"fixed",top:60,right:16,width:320,background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,boxShadow:"0 10px 30px rgba(0,0,0,0.15)",zIndex:4000,overflow:"hidden"}}>
      <div style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <span style={{fontWeight:700,color:T.text,fontSize:13}}>🔔 Notifications</span>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>{onClear();}} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:11,fontWeight:600}}>Clear all</button>
          <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:16}}>✕</button>
        </div>
      </div>
      <div style={{maxHeight:360,overflowY:"auto"}}>
        {notifs.length===0&&<div style={{padding:24,textAlign:"center",color:T.muted,fontSize:13}}>All caught up ✅</div>}
        {notifs.map((n:any,i:number)=><div key={i} style={{padding:"12px 16px",borderBottom:`1px solid ${T.border}`,display:"flex",gap:10,alignItems:"flex-start"}}><span style={{fontSize:16,flexShrink:0}}>{n.icon}</span><div><div style={{fontSize:13,color:T.text,fontWeight:500}}>{n.title}</div><div style={{fontSize:11,color:T.muted,marginTop:2}}>{n.body}</div><div style={{fontSize:10,color:T.muted,marginTop:3}}>{n.time}</div></div></div>)}
      </div>
    </div>
  );
}

// ─── STATS ────────────────────────────────────────────────────────────────────

function StatsModule({ flights, users, T, onGoTo }: any) {
  const [period, setPeriod] = useState("month");
  const active = flights.filter((f:any)=>!f.archived&&inPeriod(f,period));
  const allActive = flights.filter((f:any)=>!f.archived);
  const done = active.filter((f:any)=>getStatus(f.briefing)==="green").length;
  const critical = active.filter((f:any)=>getStatus(f.briefing)==="red").length;

  const userList = Object.entries(users).map(([email,u]:any)=>({email,...u,name:u.name||email.split("@")[0].toUpperCase()}));

  // Per person
  const perPerson = userList.map((u:any)=>{
    const myF = active.filter((f:any)=>f.responsibles.includes(u.color));
    const col = COLORS.find(c=>c.id===u.color);
    return {name:u.name, color:col?.hex||"#94A3B8", count:myF.length};
  }).filter((x:any)=>x.count>0);

  // Per client
  const clientMap: Record<string,number> = {};
  active.forEach((f:any)=>{ if(f.client){clientMap[f.client]=(clientMap[f.client]||0)+1; } });
  const perClient = Object.entries(clientMap).map(([name,count],i)=>({name,count:count as number,color:CHART_COLORS[i%CHART_COLORS.length]}));

  // Per aircraft
  const planeMap: Record<string,number> = {};
  active.forEach((f:any)=>{ if(f.plane){planeMap[f.plane]=(planeMap[f.plane]||0)+1; } });
  const perPlane = Object.entries(planeMap).map(([name,count],i)=>({name,count:count as number,color:CHART_COLORS[(i+3)%CHART_COLORS.length]}));

  const total = active.length;
  const periodLabel = period==="day"?"Today":period==="week"?"This Week":"This Month";
  const card = (ch:any,ex:any={})=><div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:20,...ex}}>{ch}</div>;
  const sec = (t:string)=><div style={{fontSize:11,fontWeight:700,color:T.muted,letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:16}}>{t}</div>;

  return(
    <div style={{display:"flex",flexDirection:"column",gap:16}}>
      {/* Period filter */}
      <div style={{display:"flex",gap:4,background:T.inp,borderRadius:8,padding:3,width:"fit-content"}}>
        {[["day","Today"],["week","Week"],["month","Month"]].map(([v,l])=>(
          <button key={v} onClick={()=>setPeriod(v)} style={{padding:"6px 16px",borderRadius:6,border:"none",background:period===v?T.surface:"transparent",color:period===v?T.text:T.muted,fontSize:12,fontWeight:600,cursor:"pointer",boxShadow:period===v?"0 1px 3px rgba(0,0,0,0.08)":"none"}}>{l}</button>
        ))}
      </div>

      {/* KPIs */}
      <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:12}}>
        {[
          {label:"Total Flights",value:total,color:"#3B82F6"},
          {label:"Completed",value:done,color:"#22C55E",click:()=>onGoTo("green")},
          {label:"Critical",value:critical,color:"#EF4444",click:()=>onGoTo("red")},
          {label:"In Progress",value:active.filter((f:any)=>getStatus(f.briefing)==="yellow").length,color:"#EAB308",click:()=>onGoTo("yellow")},
        ].map(({label,value,color,click}:any)=>(
          <div key={label} onClick={click} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:"16px",cursor:click?"pointer":"default",borderTop:`3px solid ${color}`,transition:"border-color 0.15s"}}>
            <div style={{fontSize:28,fontWeight:700,color}}>{value}</div>
            <div style={{fontSize:11,color:T.muted,marginTop:3}}>{label} · {periodLabel}</div>
          </div>
        ))}
      </div>

      {/* Per person donuts */}
      {card(<>
        {sec(`👤 Flights per Person — ${periodLabel}`)}
        {perPerson.length===0?<div style={{color:T.muted,fontSize:13,textAlign:"center",padding:16}}>No data for this period</div>:
        <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
          {perPerson.map((u:any)=>(
            <DonutChart key={u.name} value={u.count} total={total||1} color={u.color} label={u.name} sublabel={`${u.count} flight${u.count!==1?"s":""}`}/>
          ))}
        </div>}
      </>)}

      {/* Per client donuts */}
      {card(<>
        {sec(`🏢 Flights per Client — ${periodLabel}`)}
        {perClient.length===0?<div style={{color:T.muted,fontSize:13,textAlign:"center",padding:16}}>No data for this period</div>:
        <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
          {perClient.map((c:any)=>(
            <DonutChart key={c.name} value={c.count} total={total||1} color={c.color} label={c.name} sublabel={`${c.count} flight${c.count!==1?"s":""}`}/>
          ))}
        </div>}
      </>)}

      {/* Per aircraft donuts */}
      {card(<>
        {sec(`✈️ Flights per Aircraft — ${periodLabel}`)}
        {perPlane.length===0?<div style={{color:T.muted,fontSize:13,textAlign:"center",padding:16}}>No data for this period</div>:
        <div style={{display:"flex",gap:16,flexWrap:"wrap"}}>
          {perPlane.map((p:any)=>(
            <DonutChart key={p.name} value={p.count} total={total||1} color={p.color} label={p.name} sublabel={`${p.count} flight${p.count!==1?"s":""}`}/>
          ))}
        </div>}
      </>)}

      {/* Briefing completeness */}
      {card(<>
        {sec("📊 Briefing Completeness")}
        {allActive.map((f:any)=>{
          const pct=getPct(f.briefing),s=getStatus(f.briefing),sm=STATUS_META[s];
          return(
            <div key={f.id} style={{marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}>
                <span style={{fontSize:12,color:T.text}}>{f.origin} → {f.destination} <span style={{color:T.muted}}>({f.localizador})</span></span>
                <span style={{fontSize:12,fontWeight:700,color:sm?.bg}}>{pct}%</span>
              </div>
              <div style={{height:4,background:T.border,borderRadius:3}}><div style={{height:"100%",width:`${pct}%`,background:sm?.bg,borderRadius:3,transition:"width 0.4s"}}/></div>
            </div>
          );
        })}
      </>)}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  const [theme, setTheme] = useState<string>(()=>{
    if (typeof window!=="undefined") return localStorage.getItem("ch_theme")||"light";
    return "light";
  });
  const [user, setUser] = useState<any>(()=>{
    if (typeof window==="undefined") return null;
    try { return JSON.parse(sessionStorage.getItem("ch_session")||"null"); } catch { return null; }
  });
  const [users, setUsers] = useState<Record<string,any>>(()=>{
    if (typeof window==="undefined") return {};
    try { return JSON.parse(localStorage.getItem("ch_users")||"{}"); } catch { return {}; }
  });
  const [clients, setClients] = useState<string[]>(()=>{
    if (typeof window==="undefined") return ["ACS España","LunaJets"];
    try { return JSON.parse(localStorage.getItem("ch_clients")||'["ACS España","LunaJets"]'); } catch { return ["ACS España","LunaJets"]; }
  });

  const t0=todayStr(), t1=tomorrowStr(), t2=weekEndStr();
  const [flights, setFlights] = useState<any[]>([
    {id:"FL001",localizador:"ABC123",tripId:"AV-001",origin:"LEMD",destination:"EGLL",depDate:t0,depTime:"09:00",arrDate:t0,arrTime:"11:30",type:"charter",client:"ACS España",plane:"EC-MUS",responsibles:["c4","c2"],archived:false,briefing:{...initBriefing(),DISPO:"green",OA:"green",CONTRATO:"yellow",PAX:"red",CATERING:"red"},messages:{PAX:[{user:"c4",text:"Waiting for PAX list",date:t0,time:"10:23",read:false}]},reminders:[],updatedAt:Date.now()-1800000},
    {id:"FL002",localizador:"XYZ789",tripId:"",origin:"LEBL",destination:"LFPG",depDate:t1,depTime:"14:30",arrDate:t1,arrTime:"16:45",type:"empty leg",client:"LunaJets",plane:"EC-LYL",responsibles:["c3"],archived:false,briefing:{...initBriefing(),DISPO:"green",OA:"green",CONTRATO:"green",PAX:"green",CAT:"black",BRIF:"yellow"},messages:{},reminders:[],updatedAt:Date.now()-3600000},
    {id:"FL003",localizador:"DEF456",tripId:"AV-002",origin:"LEMD",destination:"LIRF",depDate:t2,depTime:"07:15",arrDate:t2,arrTime:"09:30",type:"charter",client:"ACS España",plane:"EC-MRL",responsibles:["c4","c3","c8"],archived:false,briefing:Object.fromEntries(BRIEFING_FIELDS.map(f=>[f,"green"])),messages:{},reminders:[],updatedAt:Date.now()-7200000},
  ]);

  const [expanded,   setExpanded]   = useState<string|null>(null);
  const [editFlight, setEditFlight] = useState<any>(null);
  const [showNew,    setShowNew]    = useState(false);
  const [selPlane,   setSelPlane]   = useState<any>(null);
  const [search,     setSearch]     = useState("");
  const [fStatus,    setFStatus]    = useState("all");
  const [fClient,    setFClient]    = useState("all");
  const [fColor,     setFColor]     = useState("all");
  const [fDate,      setFDate]      = useState("all");
  const [myOnly,     setMyOnly]     = useState(false);
  const [showArch,   setShowArch]   = useState(false);
  const [showSett,   setShowSett]   = useState(false);
  const [showNotif,  setShowNotif]  = useState(false);
  const [notifs,     setNotifs]     = useState<any[]>([]);
  const [activeTab,  setActiveTab]  = useState("dashboard");

  useEffect(()=>{ localStorage.setItem("ch_theme",theme); },[theme]);

  const T = useT(theme);

  function push(icon: string, title: string, body: string) {
    setNotifs(p=>[{icon,title,body,time:new Date().toLocaleTimeString("es-ES"),read:false},...p].slice(0,50));
  }

  function handleLogin(u: any, freshUsers: any) {
    setUser(u);
    if (freshUsers) setUsers(freshUsers);
    sessionStorage.setItem("ch_session",JSON.stringify(u));
    push("✈️","Welcome back",`Signed in as ${u.name}`);
  }

  function handleSignOut() {
    sessionStorage.removeItem("ch_session");
    setUser(null);
  }

  if (!user) return <AuthScreen onLogin={handleLogin}/>;

  const userColor = COLORS.find(c=>c.id===user.color);
  const userList  = Object.entries(users).map(([email,u]:any)=>({email,color:u.color,name:u.name||email.split("@")[0].toUpperCase()}));

  function handleStatus(fid: string, field: string, status: string) {
    setFlights(fs=>fs.map(f=>{
      if(f.id!==fid)return f;
      const b={...f.briefing,[field]:status};
      if(field==="CREDIT HOLD"&&status==="green")b["COBRO"]="green";
      push("🔔",`${field} updated`,`${f.localizador}: ${field} → ${status}`);
      return{...f,briefing:b,updatedAt:Date.now()};
    }));
  }

  function handleMsg(fid: string, field: string, msgText: string|null, markRead: boolean) {
    setFlights(fs=>fs.map(f=>{
      if(f.id!==fid)return f;
      const msgs={...f.messages};
      if(markRead){ msgs[field]=(msgs[field]||[]).map((m:any)=>({...m,read:true})); }
      else{
        const now=new Date();
        msgs[field]=[...(msgs[field]||[]),{user:user.color,text:msgText,date:now.toISOString().slice(0,10),time:now.toLocaleTimeString("es-ES",{hour:"2-digit",minute:"2-digit"}),read:true}];
        push("💬",`New message in ${field}`,`${f.localizador}: "${(msgText||"").slice(0,40)}"`);
      }
      return{...f,messages:msgs,updatedAt:Date.now()};
    }));
  }

  function handleNewFlight(flight: any) {
    setFlights(f=>[flight,...f]);
    push("✈️","New flight created",`${flight.origin} → ${flight.destination} (${flight.localizador})`);
  }

  function handleArchive(id: string, e: any) {
    e.stopPropagation();
    setFlights(fs=>fs.map(f=>f.id===id?{...f,archived:!f.archived}:f));
  }

  function handleReminder(fid: string, rem: any) {
    setFlights(fs=>fs.map(f=>f.id===fid?{...f,reminders:[...(f.reminders||[]),rem]}:f));
    push("📅","Reminder set",`${rem.date} ${rem.time}${rem.note?` · ${rem.note}`:""}`);
  }

  function handleEditSave(updatedFlight: any) {
    setFlights(fs=>fs.map(f=>f.id===updatedFlight.id?updatedFlight:f));
    push("✏️","Flight updated",`${updatedFlight.localizador} edited`);
  }

  function handleGoTo(type: string, id?: string) {
    setActiveTab("dashboard");
    // Reset all filters first so all flights are visible, then apply specific filter
    setFClient("all"); setFColor("all"); setFDate("all"); setMyOnly(false); setShowArch(false); setSearch("");
    setFStatus("all");
    if (type==="red")    setFStatus("red");
    if (type==="green")  setFStatus("green");
    if (type==="yellow") setFStatus("yellow");
    if (type==="id"&&id) setSearch(id);
  }

  function handleDashboardClick() {
    setActiveTab("dashboard");
    // Reset all filters when clicking Dashboard tab
    setFStatus("all"); setFClient("all"); setFColor("all"); setFDate("all");
    setMyOnly(false); setShowArch(false); setSearch(""); setExpanded(null);
  }

  const active   = flights.filter(f=>!f.archived);
  const archived = flights.filter(f=>f.archived);
  const pool     = showArch?archived:active;

  const visible = pool.filter(f=>{
    if (myOnly&&!f.responsibles.includes(user.color)) return false;
    if (fStatus!=="all"&&getStatus(f.briefing)!==fStatus) return false;
    if (fClient!=="all"&&f.client!==fClient) return false;
    if (fColor!=="all"&&!f.responsibles.includes(fColor)) return false;
    if (fDate==="today"&&f.depDate!==todayStr()) return false;
    if (fDate==="tomorrow"&&f.depDate!==tomorrowStr()) return false;
    if (fDate==="week"&&(f.depDate<todayStr()||f.depDate>weekEndStr())) return false;
    if (!matchSearch(f,search)) return false;
    return true;
  }).sort((a,b)=>a.depDate.localeCompare(b.depDate));

  const unreadMsgs = active.reduce((s,f)=>s+Object.values(f.messages||{}).reduce((a:number,ms:any)=>a+ms.filter((m:any)=>!m.read).length,0),0);
  const bell = unreadMsgs;

  return (
    <div style={{minHeight:"100vh",background:T.bg,fontFamily:"system-ui,sans-serif",color:T.text}}>
      <style>{`*{box-sizing:border-box;margin:0;padding:0}button,input,select{font-family:inherit;outline:none}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:${T.bg}}::-webkit-scrollbar-thumb{background:${T.border};border-radius:3px}`}</style>

      {/* HEADER */}
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"0 24px",display:"flex",alignItems:"center",justifyContent:"space-between",height:56,position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",alignItems:"center",gap:24}}>
          <div style={{display:"flex",alignItems:"center",gap:8}}>
            <span style={{fontSize:18}}>✈️</span>
            <span style={{fontSize:17,fontWeight:700,color:T.text}}>Charter</span>
          </div>
          <div style={{display:"flex",gap:2}}>
            <button onClick={handleDashboardClick} style={{padding:"6px 14px",borderRadius:6,border:"none",background:activeTab==="dashboard"?"rgba(59,130,246,0.1)":"transparent",color:activeTab==="dashboard"?"#3B82F6":T.muted,fontWeight:600,fontSize:13,cursor:"pointer"}}>Dashboard</button>
            <button onClick={()=>setActiveTab("fleet")} style={{padding:"6px 14px",borderRadius:6,border:"none",background:activeTab==="fleet"?"rgba(59,130,246,0.1)":"transparent",color:activeTab==="fleet"?"#3B82F6":T.muted,fontWeight:600,fontSize:13,cursor:"pointer"}}>Fleet</button>
            <button onClick={()=>setActiveTab("stats")} style={{padding:"6px 14px",borderRadius:6,border:"none",background:activeTab==="stats"?"rgba(59,130,246,0.1)":"transparent",color:activeTab==="stats"?"#3B82F6":T.muted,fontWeight:600,fontSize:13,cursor:"pointer"}}>Stats</button>
          </div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <button onClick={()=>setMyOnly(v=>!v)} style={{padding:"5px 12px",borderRadius:6,border:`1px solid ${myOnly?"#3B82F6":T.border}`,background:myOnly?"rgba(59,130,246,0.08)":"transparent",color:myOnly?"#3B82F6":T.muted,fontSize:12,fontWeight:600,cursor:"pointer"}}>My Flights</button>
          <button onClick={()=>setShowArch(v=>!v)} style={{padding:"5px 12px",borderRadius:6,border:`1px solid ${showArch?"#F97316":T.border}`,background:showArch?"rgba(249,115,22,0.08)":"transparent",color:showArch?"#F97316":T.muted,fontSize:12,fontWeight:600,cursor:"pointer"}}>📦 Archived</button>
          <button onClick={()=>setShowNotif(v=>!v)} style={{position:"relative",background:"none",border:`1px solid ${T.border}`,borderRadius:8,padding:"5px 10px",color:T.muted,cursor:"pointer",fontSize:16}}>
            🔔{bell>0&&<span style={{position:"absolute",top:-4,right:-4,background:"#EF4444",color:"#fff",fontSize:9,fontWeight:700,borderRadius:10,padding:"1px 5px",minWidth:16,textAlign:"center"}}>{bell}</span>}
          </button>
          <div style={{width:28,height:28,borderRadius:"50%",background:userColor?.hex||"#3B82F6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:10,fontWeight:700,color:"#fff",flexShrink:0}}>{user.name?.slice(0,2)}</div>
          <span style={{fontSize:12,color:T.muted,fontWeight:600,maxWidth:120,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</span>
          <button onClick={()=>setShowSett(true)} style={{background:"none",border:"none",color:T.muted,cursor:"pointer",fontSize:17}}>⚙️</button>
          <button onClick={handleSignOut} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:6,padding:"5px 10px",color:T.muted,cursor:"pointer",fontSize:12}}>Sign out</button>
        </div>
      </div>

      <div style={{padding:"20px 24px"}}>

        {/* DASHBOARD */}
        {activeTab==="dashboard"&&(<>
          <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:16,flexWrap:"wrap"}}>
            <button onClick={()=>setShowNew(true)} style={{padding:"9px 16px",background:"#0F172A",border:"none",borderRadius:8,color:"#fff",fontWeight:700,fontSize:13,cursor:"pointer"}}>+ New Flight</button>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search LOC / OACI / Trip ID..." style={{padding:"9px 14px",background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontSize:13,width:260}}/>
            <div style={{display:"flex",gap:3,background:T.inp,borderRadius:8,padding:3}}>
              {[["all","All"],["today","Today"],["tomorrow","Tomorrow"],["week","Week"]].map(([v,l])=>(
                <button key={v} onClick={()=>setFDate(v)} style={{padding:"5px 10px",borderRadius:6,border:"none",background:fDate===v?T.surface:"transparent",color:fDate===v?T.text:T.muted,fontSize:12,fontWeight:600,cursor:"pointer",boxShadow:fDate===v?"0 1px 3px rgba(0,0,0,0.08)":"none"}}>{l}</button>
              ))}
            </div>
            <select value={fStatus} onChange={e=>setFStatus(e.target.value)} style={{padding:"9px 12px",background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,color:T.muted,fontSize:13,cursor:"pointer"}}>
              <option value="all">All Statuses</option>
              {["red","yellow","green"].map(k=><option key={k} value={k}>{STATUS_META[k].label}</option>)}
            </select>
            <select value={fClient} onChange={e=>setFClient(e.target.value)} style={{padding:"9px 12px",background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,color:T.muted,fontSize:13,cursor:"pointer"}}>
              <option value="all">All Clients</option>
              {clients.map(c=><option key={c} value={c}>{c}</option>)}
            </select>
            <select value={fColor} onChange={e=>setFColor(e.target.value)} style={{padding:"9px 12px",background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,color:T.muted,fontSize:13,cursor:"pointer"}}>
              <option value="all">All Team</option>
              {userList.map(u=><option key={u.color} value={u.color}>{u.name}</option>)}
            </select>
            <span style={{fontSize:12,color:T.sub,marginLeft:"auto"}}>{showArch?"📦 Archived":"Active"} · {visible.length} flight{visible.length!==1?"s":""}</span>
          </div>

          <div style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,overflow:"hidden"}}>
            <table style={{width:"100%",borderCollapse:"collapse"}}>
              <thead>
                <tr style={{background:T.dark?"#080C18":"#F8FAFC"}}>
                  {["Team","Route","Hora (Spain)","Client","Status","Aircraft","Actions"].map(h=>(
                    <th key={h} style={{padding:"11px 14px",textAlign:"left",fontSize:10,fontWeight:700,color:T.sub,letterSpacing:"0.1em",textTransform:"uppercase",borderBottom:`1px solid ${T.border}`}}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {visible.map(flight=>{
                  const s=getStatus(flight.briefing),sm=STATUS_META[s],isExp=expanded===flight.id,pct=getPct(flight.briefing);
                  const planeObj=FLEET.find(p=>p.reg===flight.plane);
                  const unread=Object.values(flight.messages||{}).reduce((a:number,ms:any)=>a+ms.filter((m:any)=>!m.read).length,0);
                  const respUsers=flight.responsibles.map((r:string)=>userList.find(u=>u.color===r)).filter(Boolean);
                  const isMine=flight.responsibles.includes(user.color);
                  const localTime = formatLocalTime(flight.depDate, flight.depTime);
                  return[
                    <tr key={flight.id} onClick={()=>setExpanded(isExp?null:flight.id)} style={{borderBottom:`1px solid ${T.border}`,cursor:"pointer"}} onMouseOver={e=>(e.currentTarget as HTMLTableRowElement).style.background=T.dark?"#0F1629":"#F8FAFC"} onMouseOut={e=>(e.currentTarget as HTMLTableRowElement).style.background="transparent"}>
                      <td style={{padding:"13px 14px"}}>
                        <div style={{display:"flex",gap:3,flexWrap:"wrap",maxWidth:90}}>
                          {(respUsers as any[]).map((u:any)=>{const col=COLORS.find(c=>c.id===u.color);return<div key={u.color} title={u.name} style={{width:22,height:22,borderRadius:"50%",background:col?.hex,display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:"#fff"}}>{u.name.slice(0,2)}</div>;})}
                          {flight.responsibles.length===0&&<div style={{width:22,height:22,borderRadius:"50%",background:T.inp,border:`1px dashed ${T.border}`}}/>}
                        </div>
                      </td>
                      <td style={{padding:"13px 14px"}}>
                        <div style={{fontWeight:600,fontSize:14,color:T.text}}>{flight.origin} <span style={{color:T.sub}}>→</span> {flight.destination}</div>
                        <div style={{fontSize:11,color:T.sub,marginTop:2,display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
                          <span>{flight.localizador}</span>
                          {flight.tripId&&<span style={{color:T.muted}}>· {flight.tripId}</span>}
                          {flight.type==="empty leg"&&<span style={{color:"#F97316",fontWeight:700}}>· EMPTY LEG</span>}
                          {unread>0&&<span style={{color:"#3B82F6",fontWeight:700}}>· {unread} unread</span>}
                        </div>
                      </td>
                      <td style={{padding:"13px 14px"}}>
                        <div style={{fontSize:13,color:T.text,fontWeight:500}}>{flight.depDate}</div>
                        <div style={{fontSize:12,color:T.sub}}>{localTime}</div>
                      </td>
                      <td style={{padding:"13px 14px"}}><span style={{fontSize:13,color:T.muted}}>{flight.client||"—"}</span></td>
                      <td style={{padding:"13px 14px"}}>
                        <div style={{display:"flex",alignItems:"center",gap:7}}>
                          <div style={{width:8,height:8,borderRadius:"50%",background:sm?.bg,flexShrink:0,boxShadow:`0 0 5px ${sm?.bg}60`}}/>
                          <div style={{width:48,height:3,background:T.border,borderRadius:2}}><div style={{height:"100%",width:`${pct}%`,background:sm?.bg,borderRadius:2}}/></div>
                          <span style={{fontSize:10,color:T.sub}}>{pct}%</span>
                        </div>
                      </td>
                      <td style={{padding:"13px 14px"}}>
                        <button onClick={e=>{e.stopPropagation();setSelPlane(planeObj||null);}} style={{background:"none",border:`1px solid ${T.border}`,borderRadius:6,padding:"4px 10px",color:T.muted,fontSize:12,fontWeight:600,cursor:"pointer"}}>{flight.plane||"—"}</button>
                      </td>
                      <td style={{padding:"13px 14px"}}>
                        <div style={{display:"flex",gap:5}}>
                          <button onClick={e=>{
                            e.stopPropagation();
                            const fid=flight.id;
                            const uc=user.color;
                            setFlights(prev=>prev.map(f=>{
                              if(f.id!==fid)return f;
                              const has=f.responsibles.includes(uc);
                              const newResp=has?f.responsibles.filter((r:string)=>r!==uc):[...f.responsibles,uc];
                              return{...f,responsibles:newResp,updatedAt:Date.now()};
                            }));
                          }} style={{background:isMine?"rgba(59,130,246,0.1)":T.inp,border:`1px solid ${isMine?"#3B82F6":T.border}`,borderRadius:6,padding:"4px 9px",color:isMine?"#3B82F6":T.muted,fontSize:11,fontWeight:600,cursor:"pointer"}}>{isMine?"✓ Mine":"+ Join"}</button>
                          <button onClick={e=>handleArchive(flight.id,e)} style={{background:T.inp,border:`1px solid ${T.border}`,borderRadius:6,padding:"4px 8px",color:T.muted,fontSize:11,cursor:"pointer"}}>{flight.archived?"↩":"📦"}</button>
                          <button onClick={e=>{e.stopPropagation();setEditFlight(flight);}} style={{background:T.inp,border:`1px solid ${T.border}`,borderRadius:6,padding:"4px 8px",color:T.muted,fontSize:11,cursor:"pointer"}} title="Edit flight">✏️</button>
                        </div>
                      </td>
                    </tr>,
                    isExp&&<tr key={flight.id+"-b"}><td colSpan={7} style={{padding:0}}><BriefingPanel flight={flight} userColor={user.color} onStatusChange={handleStatus} onSendMessage={handleMsg} onAddReminder={handleReminder} T={T}/></td></tr>
                  ];
                })}
              </tbody>
            </table>
            {visible.length===0&&<div style={{textAlign:"center",padding:48,color:T.muted}}><div style={{fontSize:36,marginBottom:10}}>✈️</div><div style={{fontSize:14}}>{showArch?"No archived flights":"No flights match your filters"}</div></div>}
          </div>
        </>)}

        {/* FLEET */}
        {activeTab==="fleet"&&(
          <div>
            <div style={{fontSize:18,fontWeight:700,marginBottom:20,color:T.text}}>Fleet — {FLEET.length} Aircraft</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))",gap:14}}>
              {FLEET.map(p=>(
                <div key={p.reg} onClick={()=>setSelPlane(p)} style={{background:T.surface,border:`1px solid ${T.border}`,borderRadius:12,padding:18,cursor:"pointer",transition:"border-color 0.15s,transform 0.1s"}} onMouseOver={e=>{(e.currentTarget as HTMLDivElement).style.borderColor="#3B82F6";(e.currentTarget as HTMLDivElement).style.transform="translateY(-1px)";}} onMouseOut={e=>{(e.currentTarget as HTMLDivElement).style.borderColor=T.border;(e.currentTarget as HTMLDivElement).style.transform="none";}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:12}}>
                    <div><div style={{fontSize:15,fontWeight:700,color:T.text}}>{p.reg}</div><div style={{fontSize:12,color:T.muted,marginTop:2}}>{p.model}</div></div>
                    <span style={{fontSize:18}}>✈️</span>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>
                    {[["Base",p.base],["Seats",`${p.seats}p`],["Range",`${p.range}nm`]].map(([k,v])=><div key={k} style={{background:T.inp,borderRadius:6,padding:"7px 8px"}}><div style={{fontSize:9,color:T.sub,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.08em"}}>{k}</div><div style={{fontSize:12,color:T.text,fontWeight:600,marginTop:2}}>{v}</div></div>)}
                  </div>
                  <div style={{fontSize:11,color:T.muted}}>Pilots: <span style={{color:T.text,fontWeight:600}}>{p.pilots}</span><span style={{marginLeft:10}}>WiFi: <span style={{color:T.text,fontWeight:600}}>{p.wifi}</span></span>{p.yor&&<span style={{marginLeft:10,color:"#22C55E",fontWeight:600}}>Refurb {p.yor}</span>}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* STATS */}
        {activeTab==="stats"&&<StatsModule flights={flights} users={users} T={T} onGoTo={handleGoTo}/>}
      </div>

      {showNew&&<NewFlightModal onClose={()=>setShowNew(false)} onSave={handleNewFlight} clients={clients} setClients={setClients} T={T}/>}
      {editFlight&&<EditFlightModal flight={editFlight} onClose={()=>setEditFlight(null)} onSave={handleEditSave} clients={clients} setClients={setClients} T={T}/>}
      {selPlane&&<AircraftCard plane={selPlane} onClose={()=>setSelPlane(null)} T={T}/>}
      {showSett&&<SettingsPanel theme={theme} setTheme={setTheme} onClose={()=>setShowSett(false)} T={T} users={users} setUsers={setUsers} currentUser={user}/>}
      {showNotif&&<NotifPanel notifs={notifs} onClear={()=>setNotifs([])} onClose={()=>setShowNotif(false)} T={T}/>}
    </div>
  );
}