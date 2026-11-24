/* Lógica do campeonato: usada pela página pública (/campeonato) e pela organização (/organizacao). */
(function(){
"use strict";
const TEAMS=[["Bournemouth","BOU","#DA291C","#111111","ING"],["Brighton","BHA","#0057B8","#FFFFFF","ING"],["Crystal Palace","CRY","#1B458F","#C4122E","ING"],["West Ham","WHU","#7A263A","#1BB1E7","ING"],["Brentford","BRE","#E30613","#FFFFFF","ING"],["Fulham","FUL","#FFFFFF","#111111","ING"],["Everton","EVE","#003399","#FFFFFF","ING"],["Leeds United","LEE","#FFFFFF","#1D428A","ING"],["Wolverhampton","WOL","#FDB913","#231F20","ING"],
["Real Betis","BET","#00954C","#FFFFFF","ESP"],["Real Sociedad","RSO","#0067B1","#FFFFFF","ESP"],["Villarreal","VIL","#FFE667","#005187","ESP"],["Girona","GIR","#CD2534","#FFFFFF","ESP"],["Mallorca","MLL","#E20613","#111111","ESP"],["Rayo Vallecano","RAY","#FFFFFF","#E53027","ESP"],["Celta de Vigo","CEL","#8AC3EE","#FFFFFF","ESP"],["Getafe","GET","#005999","#FFFFFF","ESP"],["Osasuna","OSA","#D91A21","#0A346F","ESP"],["Sevilla","SEV","#FFFFFF","#D4001F","ESP"],["Valencia","VAL","#FFFFFF","#EE7F00","ESP"],
["Bologna","BOL","#1A2F48","#A21C26","ITA"],["Fiorentina","FIO","#482E92","#FFFFFF","ITA"],["Torino","TOR","#881F19","#FFFFFF","ITA"],["Como","COM","#1B3F8B","#FFFFFF","ITA"],
["Eintracht Frankfurt","SGE","#E1000F","#111111","ALE"],["VfB Stuttgart","VFB","#FFFFFF","#E32219","ALE"],["Wolfsburg","WOB","#65B32E","#FFFFFF","ALE"],["Borussia Mönchengladbach","BMG","#111111","#00A650","ALE"],["Freiburg","SCF","#111111","#E2001A","ALE"],["Hoffenheim","TSG","#1961B5","#FFFFFF","ALE"],["Augsburg","FCA","#BA3733","#46714D","ALE"],["Mainz 05","M05","#ED1C24","#FFFFFF","ALE"],["Werder Bremen","SVW","#1D9053","#FFFFFF","ALE"],
["Monaco","ASM","#E7192B","#FFFFFF","FRA"],["Olympique de Marseille","OM","#2FAEE0","#FFFFFF","FRA"],["Lille","LIL","#E01E13","#24216A","FRA"],["Nice","NIC","#C8102E","#111111","FRA"],["Olympique Lyonnais","OL","#FFFFFF","#1D3A8F","FRA"],["Rennes","REN","#E13327","#111111","FRA"],
["Benfica","SLB","#E20E0E","#FFFFFF","POR"],["Porto","FCP","#00428C","#FFFFFF","POR"],["Braga","SCB","#E20613","#FFFFFF","POR"],
["PSV","PSV","#ED1C24","#FFFFFF","HOL"],["Ajax","AJA","#FFFFFF","#D2122E","HOL"],["Feyenoord","FEY","#E30613","#111111","HOL"],
["Fenerbahçe","FEN","#FFED00","#163962","TUR"],["Beşiktaş","BJK","#111111","#FFFFFF","TUR"],["Celtic","CLT","#018749","#FFFFFF","ESC"],["Paris FC","PFC","#0A2240","#FFFFFF","FRA"]];
const COUNTRY={ING:"Inglaterra",ESP:"Espanha",ITA:"Itália",ALE:"Alemanha",FRA:"França",POR:"Portugal",HOL:"Holanda",TUR:"Turquia",ESC:"Escócia"};
const TEAM=Object.fromEntries(TEAMS.map(t=>[t[1],{nome:t[0],abbr:t[1],pais:t[4]}]));
const esc=s=>String(s??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const num=v=>v===null||v===undefined||v===""?null:Number(v);
const shuffle=a=>{a=[...a];for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;};
const LETRAS="ABCDEFGHIJKLMNOP";

/* ---------- sorteio e fase de grupos ---------- */
function gruposPadrao(n){ return Math.max(1,Math.floor(n/4)); } /* grupos com no mínimo 4: ida e volta dá 6+ jogos */
function opcoesGrupos(n){ const o=[]; for(let g=1;g<=Math.max(1,Math.floor(n/4));g++) o.push(g); return o.length?o:[1]; }
function tamanhos(n,g){ return Array.from({length:g},(_,i)=>Math.floor(n/g)+(i<n%g?1:0)); }

/* jogadores: [{id,nome}] -> estado novo com grupos, times e jogos */
function sortear(jogadores,g){
  const js=shuffle(jogadores), times=shuffle(TEAMS.map(t=>t[1]));
  const jogs={}; js.forEach((p,i)=>{ jogs[p.id]={nome:p.nome,time:times[i%times.length]}; });
  const grupos=Array.from({length:g},(_,i)=>({nome:"Grupo "+LETRAS[i],ids:[]}));
  js.forEach((p,i)=>{ const r=Math.floor(i/g), c=r%2?g-1-(i%g):i%g; grupos[c].ids.push(p.id); });
  const e={v:1,criado:new Date().toISOString(),jogadores:jogs,grupos,jogos:[],mata:null};
  e.jogos=gerarJogos(grupos);
  return e;
}
/* todos contra todos, ida e volta (método do círculo) */
function gerarJogos(grupos){
  const jogos=[];
  grupos.forEach((gr,gi)=>{
    const ids=[...gr.ids]; if(ids.length%2) ids.push(null);
    const n=ids.length, rodadas=n-1, turno=[];
    let arr=[...ids];
    for(let r=0;r<rodadas;r++){
      const pares=[];
      for(let i=0;i<n/2;i++){ const a=arr[i],b=arr[n-1-i]; if(a!==null&&b!==null) pares.push(r%2?[b,a]:[a,b]); }
      turno.push(pares);
      arr=[arr[0],arr[n-1],...arr.slice(1,n-1)];
    }
    turno.forEach((pares,r)=>pares.forEach(([c,f],k)=>jogos.push({id:`g${gi}-${r+1}-${k}`,g:gi,r:r+1,casa:c,fora:f,gc:null,gf:null})));
    turno.forEach((pares,r)=>pares.forEach(([c,f],k)=>jogos.push({id:`g${gi}-${r+1+rodadas}-${k}`,g:gi,r:r+1+rodadas,casa:f,fora:c,gc:null,gf:null})));
  });
  return jogos;
}
const jogado=j=>num(j.gc)!==null&&num(j.gf)!==null;

function classificacao(e,gi){
  const gr=e.grupos[gi], jogos=e.jogos.filter(j=>j.g===gi&&jogado(j));
  const row=id=>({id,nome:e.jogadores[id].nome,time:e.jogadores[id].time,J:0,V:0,E:0,D:0,GP:0,GC:0,SG:0,P:0});
  const t=Object.fromEntries(gr.ids.map(id=>[id,row(id)]));
  const soma=(tab,j)=>{const c=tab[j.casa],f=tab[j.fora];if(!c||!f)return;const a=num(j.gc),b=num(j.gf);
    c.J++;f.J++;c.GP+=a;c.GC+=b;f.GP+=b;f.GC+=a;
    if(a>b){c.V++;f.D++;c.P+=3;}else if(a<b){f.V++;c.D++;f.P+=3;}else{c.E++;f.E++;c.P++;f.P++;}};
  jogos.forEach(j=>soma(t,j));
  const rows=Object.values(t); rows.forEach(r=>r.SG=r.GP-r.GC);
  rows.sort((x,y)=>y.P-x.P||y.SG-x.SG||y.V-x.V);
  /* confronto direto entre quem segue empatado em pontos, saldo e vitórias */
  const out=[]; let i=0;
  while(i<rows.length){
    let k=i+1; while(k<rows.length&&rows[k].P===rows[i].P&&rows[k].SG===rows[i].SG&&rows[k].V===rows[i].V) k++;
    const bloco=rows.slice(i,k);
    if(bloco.length>1){
      const ids=new Set(bloco.map(r=>r.id)), mini=Object.fromEntries(bloco.map(r=>[r.id,row(r.id)]));
      jogos.filter(j=>ids.has(j.casa)&&ids.has(j.fora)).forEach(j=>soma(mini,j));
      bloco.sort((x,y)=>{const a=mini[x.id],b=mini[y.id];return b.P-a.P||(b.GP-b.GC)-(a.GP-a.GC)||y.GP-x.GP||x.nome.localeCompare(y.nome,"pt");});
    }
    out.push(...bloco); i=k;
  }
  out.forEach((r,p)=>r.pos=p+1);
  return out;
}
function jogosFaltando(e){ return e.jogos.filter(j=>!jogado(j)).length; }

/* ---------- mata-mata ---------- */
function opcoesMata(n){ const o=[]; for(let k=2;k<=n;k*=2) o.push(k); return o; }
function mataPadrao(e){
  const n=Object.keys(e.jogadores).length, g=e.grupos.length, base=2*g;
  let k=2; while(k<base) k*=2;
  if(k>n||k-base>g) { k=2; while(k*2<=base&&k*2<=n) k*=2; }
  return k;
}
/* ranking geral: 1º e 2º de cada grupo na frente, depois 3º, 4º...; dentro de cada faixa por pontos, saldo, vitórias e gols. */
function ranking(e){
  const all=[]; e.grupos.forEach((_,gi)=>classificacao(e,gi).forEach(r=>all.push({...r,g:gi})));
  const faixa=p=>p<=2?0:p;
  all.sort((x,y)=>faixa(x.pos)-faixa(y.pos)||y.P-x.P||y.SG-x.SG||y.V-x.V||y.GP-x.GP||x.nome.localeCompare(y.nome,"pt"));
  return all;
}
function ordemChave(k){ let o=[1]; while(o.length<k){ const m=o.length*2+1; o=o.flatMap(s=>[s,m-s]); } return o; }
const NOMES_FASE={2:"Final",4:"Semifinal",8:"Quartas de final",16:"Oitavas de final",32:"16 avos de final"};
const gols=(o,id)=>o&&id in o?num(o[id]):null;
/* devolve as fases com os confrontos já resolvidos até onde der */
function fases(e){
  const m=e.mata; if(!m) return [];
  const k=m.seeds.length, seed=Object.fromEntries(m.seeds.map((id,i)=>[id,i+1])), o=ordemChave(k), out=[];
  let vivos=[]; for(let i=0;i<k/2;i++) vivos.push([m.seeds[o[2*i]-1],m.seeds[o[2*i+1]-1]]);
  let r=0;
  while(vivos.length){
    const nTimes=vivos.length*2, final=nTimes===2, ties=[];
    vivos.forEach(([x,y],i)=>{
      let a=x,b=y; if(a&&b&&seed[b]<seed[a]) [a,b]=[b,a];
      const key=`${r}-${i}`, res=m.res[key]||{}, t={key,a,b,seedA:seed[a],seedB:seed[b],final,res,venc:null,agg:null,precisaPen:false};
      if(a&&b){
        let ga,gb;
        if(final){ ga=gols(res.jogo,a); gb=gols(res.jogo,b); }
        else{ const i1=gols(res.ida,a),i2=gols(res.ida,b),v1=gols(res.volta,a),v2=gols(res.volta,b);
          ga=[i1,v1].includes(null)?null:i1+v1; gb=[i2,v2].includes(null)?null:i2+v2;
          t.parcial=[i1,i2].includes(null)?null:[i1,i2]; }
        if(ga!==null&&gb!==null){
          t.agg=[ga,gb];
          if(ga>gb) t.venc=a; else if(gb>ga) t.venc=b;
          else{ t.precisaPen=true; const pa=gols(res.pen,a),pb=gols(res.pen,b); if(pa!==null&&pb!==null&&pa!==pb) t.venc=pa>pb?a:b; }
        }
      }
      ties.push(t);
    });
    out.push({r,nome:NOMES_FASE[nTimes]||`Fase de ${nTimes}`,final,ties});
    if(final) break;
    const prox=[]; for(let i=0;i<ties.length;i+=2) prox.push([ties[i].venc,ties[i+1].venc]);
    vivos=prox; r++;
  }
  return out;
}
function campeao(e){ const f=fases(e); return f.length?f[f.length-1].ties[0].venc:null; }

function escudo(abbr,size){ size=size||22; const t=TEAM[abbr]; return t?`<img class="esc" src="/escudos/${abbr}.webp" width="${size}" height="${size}" alt="" loading="lazy">`:""; }

window.Torneio={TEAMS,TEAM,COUNTRY,esc,num,shuffle,gruposPadrao,opcoesGrupos,tamanhos,sortear,gerarJogos,jogado,classificacao,jogosFaltando,opcoesMata,mataPadrao,ranking,ordemChave,fases,campeao,escudo,NOMES_FASE};
})();
