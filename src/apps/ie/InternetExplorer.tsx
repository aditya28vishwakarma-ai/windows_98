// InternetExplorer.tsx — IE5-style browser with fake sites and dial-up easter egg
import { useState, useRef, useEffect } from "react";
import { useAchievementStore } from "../../os/store/achievementStore";
import { useWindowStore } from "../../os/store/windowStore";
import { playClickSound } from "../../os/sound";
import styles from "./InternetExplorer.module.css";

const FAKE_SITES: Record<string, { title: string; html: string }> = {
  "www.googol.com": {
    title: "Googol! Search the Web",
    html: `<!DOCTYPE html><html><head><title>Googol!</title>
<style>body{background:#fff;font-family:Arial,sans-serif;text-align:center;padding-top:60px}
.logo{font-size:64px;font-weight:bold;color:#333}
.logo span:nth-child(1){color:#4285F4}
.logo span:nth-child(2){color:#EA4335}
.logo span:nth-child(3){color:#FBBC05}
.logo span:nth-child(4){color:#4285F4}
.logo span:nth-child(5){color:#34A853}
.logo span:nth-child(6){color:#EA4335}
.sub{font-size:12px;color:#666;margin-bottom:24px}
input{border:1px solid #ccc;padding:4px 8px;width:400px;font-size:14px}
button{margin:8px 4px;padding:4px 12px;font-size:11px}
.results{text-align:left;width:500px;margin:0 auto}
.result-title{color:blue;text-decoration:underline;font-size:16px;cursor:pointer}
.result-url{color:green;font-size:12px}
.result-desc{font-size:13px;color:#333}</style></head>
<body>
<div class="logo"><span>G</span><span>o</span><span>o</span><span>g</span><span>o</span><span>l</span></div>
<p class="sub">Search the Web — Index contains ~25 million pages (soon much bigger)</p>
<input id="q" type="text" autofocus placeholder="Search the Internet..."/><br/>
<button onclick="search()">Googol Search</button>
<button onclick="lucky()">I'm Feeling Lucky</button>
<p style="font-size:11px;color:#999">© 1998 Googol Inc. — We are not Google. We are Googol.</p>
<div id="results"></div>
<script>
const results=[
  {t:"Bhilai Steel Plant — Official Website",u:"http://www.bhilaisteel.in",d:"The pride of Chattisgarh. Producing steel since 1959. Current production: a lot."},
  {t:"Y2K Survival Guide",u:"http://y2k.survival.org",d:"Are you ready for the Year 2000 bug? Spoiler: nothing happened."},
  {t:"Chintu's Homepage — UNDER CONSTRUCTION",u:"http://www.geocities.com/~chintu_cs_pro",d:"Best viewed in IE 4.0. Guestbook: 13 visits. Hit counter: loading..."},
  {t:"IIT Bhilai — Coming in 2016",u:"http://www.iit-bhilai.ac.in/1998",d:"Future premier institute. Please check back in 18 years."},
  {t:"Hotmailer — Free Email 2MB",u:"http://www.hotmailer.com",d:"Your mailbox is 94% full. Again."},
  {t:"AskJeeves Butler — Search by Question",u:"http://www.askjeeves-butler.com",d:"Why is your computer slow? Because it's 1998."},
  {t:"Yahu! — The Web Directory",u:"http://www.yahu.com",d:"Arts, Cricket, Computers & Internet, Chain Mails, and more!"},
  {t:"Free RAM Download — 64MB",u:"#",d:"Download more RAM today! Works 100% (it does not work)."},
  {t:"Chain Mail — Forward to 10 friends or bad luck",u:"#",d:"A girl in Sector 9 sent this to 10 people. 7 of them got promotions."},
  {t:"Encarta Encyclopedia — CD-ROM Edition",u:"#",d:"Label: ENCARTA_98. Located in D: drive. Please insert disc."},
];
function search(){
  const q=document.getElementById('q').value||'';
  let html='<br><p style="font-size:12px">Results for: <b>'+q+'</b> (about '+Math.floor(Math.random()*900000+100000)+' results)</p>';
  results.forEach(r=>{
    html+='<div style="margin-bottom:12px"><div class="result-title">'+r.t+'</div><div class="result-url">'+r.u+'</div><div class="result-desc">'+r.d+'</div></div>';
  });
  document.getElementById('results').innerHTML=html;
}
function lucky(){
  const sites=['http://www.geocities.com/~chintu_cs_pro','http://y2k.survival.org','http://www.iit-bhilai.ac.in/1998'];
  window.parent.postMessage({type:'navigate',url:sites[Math.floor(Math.random()*sites.length)]},'*');
}
</script></body></html>`,
  },
  "www.geocities.com/~chintu_cs_pro": {
    title: "Chintu_CS_Pro's Page - GeoCities",
    html: `<!DOCTYPE html><html><head><title>CHINTU'S EPIC PAGE</title>
<style>body{background:#000066;color:#ffff00;font-family:'Comic Sans MS',cursive;text-align:center;padding:20px}
marquee{color:#ff0000;font-size:20px;font-weight:bold}
.counter{border:3px inset;background:#000;color:#0f0;font-family:monospace;padding:4px 12px;font-size:20px;display:inline-block}
a{color:#ff00ff}.under{color:#ff0000;font-size:24px}
.gif-area{margin:16px auto}.star{color:#ffff00;font-size:24px}
table{margin:0 auto;border:2px solid #ff00ff}
td{padding:4px 12px;border:1px solid #ff00ff;color:#fff;font-size:12px}
button{background:#ff00ff;color:#ffff00;border:2px outset #ff00ff;padding:4px 12px;font-family:'Comic Sans MS',cursive;cursor:pointer;font-size:13px;font-weight:bold}
textarea{width:90%;background:#000033;color:#00ff00;border:2px inset;font-family:monospace;font-size:11px}
</style></head>
<body>
<h1>🌟 CHINTU_CS_PRO'S HOMEPAGE 🌟</h1>
<marquee>★ WELCOME TO MY AWESOME PAGE ★ BEST VIEWED IN IE 4.0 AT 800×600 ★ UNDER CONSTRUCTION ★</marquee>
<p class="under">⚠️ UNDER CONSTRUCTION ⚠️</p>
<img src="data:image/gif;base64,R0lGODlhEAAQAMQAAORHHOVSKudfOulrSOp3WOyDZu6QdvCchPGolfO0o/XBs/fNwfjZ1frl3/zy7////wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACH5BAkAABAALAAAAAAQABAAAAVVICSOZGlCQAosJ6mu7fiyZeKqNKToQGDsM8hBADgUXoGAiqhSvp5QAnQKGIgUhwFUYLCVDFCrKUE1lBavAViFIDlTImbKC5Gm2hB0SlBCBMQiB0UjIQA7" alt="construction" width="32" height="32"/>
<br><br>
<p>Visitors: <span class="counter" id="counter">000013</span></p>
<p style="font-size:11px;color:#aaa">Best viewed in IE 4.0 at 800×600 resolution with a 56k modem</p>
<hr style="border-color:#ff00ff"/>
<h2>ABOUT ME</h2>
<table><tr><td>Name</td><td>Chintu</td></tr><tr><td>Age</td><td>13</td></tr><tr><td>Location</td><td>Bhilai, MP</td></tr>
<tr><td>Favourite Game</td><td>Counter-Strike (I am PRO)</td></tr>
<tr><td>Favourite Food</td><td>Mummy's Dal Makhani</td></tr>
<tr><td>Future Plan</td><td>IIT (Mummy's idea) or Game Developer (my idea)</td></tr>
</table>
<hr style="border-color:#ff00ff"/>
<h2>GUESTBOOK</h2>
<p style="font-size:12px">Sign my guestbook! I know you are reading this. 👋</p>
<div id="guestbook" style="margin:8px;text-align:left;max-height:150px;overflow:auto;background:#000033;padding:8px;border:2px inset"></div>
<input id="gname" placeholder="Your Name" style="background:#000033;color:#0f0;border:2px inset;padding:4px;font-family:monospace"/><br/>
<textarea id="gmsg" rows="3" placeholder="Leave a message..."></textarea><br/>
<button onclick="signGB()">Sign Guestbook!</button>
<script>
var c=parseInt(localStorage.getItem('w98:v1:geocities-visits')||'13')+1;
localStorage.setItem('w98:v1:geocities-visits',c);
document.getElementById('counter').textContent=String(c).padStart(6,'0');
var gb=JSON.parse(localStorage.getItem('w98:v1:gb')||'[]');
function renderGB(){
  var d=document.getElementById('guestbook');
  d.innerHTML=gb.length?gb.map(function(e){return '<p style="border-bottom:1px solid #333;margin:4px 0"><b style="color:#ff0">'+e.name+'</b> <span style="color:#888;font-size:10px">'+e.date+'</span><br/>'+e.msg+'</p>';}).join(''):'<p style="color:#888">No entries yet. Be the first!</p>';
  d.scrollTop=d.scrollHeight;
}
renderGB();
function signGB(){
  var name=document.getElementById('gname').value||'Anonymous';
  var msg=document.getElementById('gmsg').value||'Nice page!';
  gb.push({name:name,msg:msg,date:new Date().toLocaleDateString('en-IN')});
  localStorage.setItem('w98:v1:gb',JSON.stringify(gb));
  document.getElementById('gname').value='';document.getElementById('gmsg').value='';
  renderGB();
  window.parent.postMessage({type:'achievement',id:'geocities-guestbook',name:'📖 Signed the Guestbook'},'*');
}
</script>
<hr style="border-color:#ff00ff"/>
<p>
<a href="#">[Back]</a> | <a href="#">[Email Chintu]</a> | <a href="#">[Webring]</a>
<br/><span style="font-size:10px">Member of: CS Pro Webring | Bhilai Internet Users Club | Random Link Exchange</span>
</p>
</body></html>`,
  },
  "www.iit-bhilai.ac.in/1998": {
    title: "IIT Bhilai — Coming Soon",
    html: `<!DOCTYPE html><html><head><title>IIT Bhilai — Future Campus</title>
<style>body{background:#f0f0f0;font-family:Times New Roman,serif;padding:40px;text-align:center}
h1{color:#003366;font-size:32px}p{font-size:16px;margin:12px}
.box{background:#fff;border:2px solid #003366;padding:24px;max-width:500px;margin:0 auto}
.counter{font-family:monospace;font-size:28px;color:#003366;border:3px inset;padding:4px 12px;background:#e0e8ff;display:inline-block}
</style></head>
<body>
<div class="box">
<h1>🏛️ Indian Institute of Technology Bhilai</h1>
<h2>(Future Campus)</h2>
<p>This website is under construction.</p>
<p><em>IIT Bhilai is planned for establishment.</em></p>
<p>Please check back in approximately <strong>18 years</strong>.</p>
<p style="font-size:13px;color:#888">(Exact date TBD. Ministry of Education to confirm.)</p>
<hr/>
<p><b>Visitors so far:</b> <span class="counter" id="ctr">000042</span></p>
<p style="font-size:12px">All 42 visitors were from the future.</p>
<hr/>
<p style="font-size:12px;color:#666">
For inquiries, please write to:<br/>
IIT Bhilai Admissions, c/o Ministry of Education, New Delhi<br/>
(We don't have an address yet. Or a campus. Or students.)<br/>
But we have <em>ambition</em>.
</p>
<p style="font-size:11px;color:#999;margin-top:20px">© 1998 — IIT Bhilai (Est. 2016)</p>
</div>
<script>
var v=parseInt(localStorage.getItem('w98:v1:iit-visits')||'42')+1;
localStorage.setItem('w98:v1:iit-visits',v);
document.getElementById('ctr').textContent=String(v).padStart(6,'0');
window.parent.postMessage({type:'achievement',id:'ie-iit',name:'🏛️ Found the Future IIT'},'*');
</script>
</body></html>`,
  },
  "www.bhilaisteel.in": {
    title: "Bhilai Steel Plant — Official",
    html: `<!DOCTYPE html><html><head><title>Bhilai Steel Plant</title>
<style>body{background:#cccccc;font-family:Arial,sans-serif;margin:0}
.header{background:#cc0000;color:white;padding:12px 24px;text-align:center}
.logo{font-size:28px;font-weight:bold;text-shadow:2px 2px #800000}
.marquee-area{background:#000080;color:yellow;padding:4px}
.content{padding:24px}
.counter{font-family:monospace;color:#000080;font-weight:bold}
table{border-collapse:collapse;width:100%}td{border:1px solid #999;padding:8px;font-size:12px}
th{background:#000080;color:white;padding:8px}
</style></head>
<body>
<div class="header">
<div class="logo">🏭 BHILAI STEEL PLANT</div>
<p>A Navratna Public Sector Undertaking — Steel Authority of India Ltd.</p>
</div>
<marquee class="marquee-area">★ BHILAI STEEL PLANT — Pride of Chhattisgarh ★ Production target: exceeded ★ Quality: first class ★</marquee>
<div class="content">
<p>Visitors: <span class="counter" id="ctr">000,042</span></p>
<p>Welcome to the official website of Bhilai Steel Plant, established 1959.</p>
<p><em>One of India's largest integrated steel plants.</em></p>
<h3>Latest News</h3>
<table>
<tr><th>Date</th><th>Headline</th></tr>
<tr><td>14 Mar 2002</td><td>Production record set again (7th time this year)</td></tr>
<tr><td>10 Mar 2002</td><td>Shift C wins inter-department cricket tournament</td></tr>
<tr><td>01 Mar 2002</td><td>New cafeteria opens — menu includes dal makhani</td></tr>
<tr><td>14 Feb 2002</td><td>Valentine's Day declared non-working holiday (unofficial)</td></tr>
<tr><td>01 Jan 2002</td><td>Y2K confirmed to not have happened</td></tr>
</table>
<p style="font-size:11px;color:#666;margin-top:24px">© 2002 Bhilai Steel Plant. All Rights Reserved. Site best viewed at 800×600.</p>
</div>
<script>
var v=parseInt(localStorage.getItem('w98:v1:bsp-visits')||'42')+1;
localStorage.setItem('w98:v1:bsp-visits',v);
document.getElementById('ctr').textContent=String(v).padStart(7,'0').replace(/(\d{3})(\d{3})(\d+)/,'$1,$2,$3');
</script>
</body></html>`,
  },
  "www.hotmailer.com": {
    title: "Hotmailer — Free Web Email",
    html: `<!DOCTYPE html><html><head><title>Hotmailer — Free Email!</title>
<style>body{background:#cccccc;font-family:Arial,sans-serif;text-align:center;padding:40px}
.box{background:#fff;border:2px solid #000080;padding:24px;max-width:340px;margin:0 auto}
h1{color:#cc0000;font-size:28px}
input{display:block;width:100%;margin:6px auto;padding:4px;font-size:13px;border:1px inset}
button{background:#000080;color:white;border:none;padding:6px 20px;font-size:13px;cursor:pointer;margin-top:8px}
.quota{background:#ffeeee;border:1px solid #cc0000;padding:8px;font-size:12px;margin-top:8px}
</style></head>
<body>
<div class="box">
<h1>📧 Hotmailer</h1>
<p>The world's largest free email service!<br/><em>(2 MB inbox — it's plenty)</em></p>
<hr/>
<b>Sign In</b>
<input type="text" placeholder="E-mail address" value="anil_verma_bhilai@hotmailer.com"/>
<input type="password" placeholder="Password"/>
<button onclick="login()">Sign In</button>
<div class="quota">⚠️ Your mailbox is 94% full.<br/>You have used 1.88 MB of your 2 MB quota.<br/>Please delete some emails, or upgrade (not available).</div>
<hr/>
<p style="font-size:11px">New to Hotmailer? <a href="#">Sign Up Free!</a> (Takes 3 minutes on 56k)</p>
</div>
<script>function login(){alert('Welcome back, Anil!\\n\\nYou have 10 new messages.\\nYour inbox is 94% full.\\n\\nPlease delete the Nigerian Prince emails.');}</script>
</body></html>`,
  },
  "www.yahu.com": {
    title: "Yahu! — The Web Directory",
    html: `<!DOCTYPE html><html><head><title>Yahu! — The Web Directory</title>
<style>body{background:#fff;font-family:Arial,sans-serif;margin:0}
.header{background:#6600cc;padding:8px 16px;color:white}
.logo{font-size:36px;font-weight:bold}
.tagline{font-size:12px}
.categories{display:grid;grid-template-columns:1fr 1fr;gap:8px;padding:16px}
.cat{border:1px solid #ddd;padding:8px}
.cat h3{color:#6600cc;margin:0 0 4px;font-size:14px}
.cat a{display:block;font-size:12px;color:#0000ff;text-decoration:none;margin:2px 0}
.cat a:hover{text-decoration:underline}
input{border:1px solid #ccc;padding:4px;width:300px}
button{background:#6600cc;color:white;border:none;padding:4px 12px;cursor:pointer}
</style></head>
<body>
<div class="header">
<div class="logo">Yahu!</div>
<div class="tagline">The Internet in Categories. (Not alphabetical. We tried.)</div>
</div>
<div style="padding:12px;text-align:center">
<input type="text" placeholder="Search Yahu!"/>
<button>Search</button>
</div>
<div class="categories">
<div class="cat"><h3>🏏 Cricket</h3>
<a href="#">Sachin Tendulkar Fan Club (OFFICIAL)</a>
<a href="#">Wisden India — Stats Database</a>
<a href="#">IPL (not invented yet — bookmark this)</a></div>
<div class="cat"><h3>💻 Computers & Internet</h3>
<a href="#">Windows 98 Tips (Chintu recommends)</a>
<a href="#">Free RAM Download (DO NOT CLICK)</a>
<a href="#">How to Make a GeoCities Page</a></div>
<div class="cat"><h3>🎨 Arts & Culture</h3>
<a href="#">Bollywood 1998 — Year in Review</a>
<a href="#">MS Paint Gallery — Submissions Open</a>
<a href="#">Doordarshan Archives</a></div>
<div class="cat"><h3>📧 Chain Mails</h3>
<a href="#">Girl in Sector 9 — 7 Lakh Forwards!</a>
<a href="#">Bill Gates Money Giveaway (real!!)</a>
<a href="#">ILOVEYOU Greeting Card (don't open)</a></div>
<div class="cat"><h3>🏭 Business & Economy</h3>
<a href="#">Bhilai Steel Plant — Official</a>
<a href="#">BSE Sensex (by tomorrow's standards: low)</a>
<a href="#">Y2K Consultant — Available for hire</a></div>
<div class="cat"><h3>🕹️ Games</h3>
<a href="#">Minesweeper World Records</a>
<a href="#">Counter-Strike Community (Chintu approved)</a>
<a href="#">Solitaire Tips & Tricks</a></div>
</div>
<p style="text-align:center;font-size:11px;color:#666;padding:8px">© 1998 Yahu! Inc. — "Do you Yahu?" — Yes. Always.</p>
</body></html>`,
  },
  "www.askjeeves-butler.com": {
    title: "AskJeeves Butler — Question Search",
    html: `<!DOCTYPE html><html><head><title>Ask Jeeves Butler — Ask Me Anything</title>
<style>body{background:#f5f0e8;font-family:Georgia,serif;padding:32px;text-align:center}
.butler{font-size:64px;margin:8px}
h1{color:#663300;font-size:28px}
input{width:400px;padding:6px;font-size:14px;border:2px inset;font-family:Georgia,serif}
button{background:#663300;color:white;border:none;padding:6px 16px;font-size:14px;cursor:pointer;margin-left:8px}
.answer{background:#fff8e8;border:2px solid #cc9900;padding:16px;max-width:500px;margin:16px auto;text-align:left;font-size:14px}
</style></head>
<body>
<div class="butler">🎩</div>
<h1>Ask Jeeves Butler</h1>
<p>Ask me anything. I know everything. (Within reason.)</p>
<input id="q" type="text" placeholder="Why is my computer slow?" onkeydown="if(event.key==='Enter')ask()"/>
<button onclick="ask()">Ask Jeeves!</button>
<div id="answer" class="answer" style="display:none"></div>
<script>
var answers={
  'slow':'Because it is 1998. All computers are slow in 1998. Consider buying more RAM. (You cannot download it.)',
  'ram':'You cannot download RAM. I have been told this several times. Please stop trying.',
  'virus':'Your computer has a virus? Did you open ILOVEYOU.vbs? Yes, you did.',
  'internet':'The Internet is a series of tubes. One of them is disconnected in your area. Please check if someone picked up the phone.',
  'money':'I am a butler, not a bank. Also the Nigerian Prince is not real.',
  'cricket':'Sachin scored 143 in Sharjah. This is not a question. This is just the truth.',
  'iit':'IIT Bhilai will exist in 2016. Please wait 18 years.',
  'windows':'Have you tried turning it off and on again? (This always works. Except when it doesn\'t.)',
  'minesweeper':'The goal of Minesweeper is to find all mines without stepping on them. Like life, but with a flag.',
  'life':'The answer is 42. Next question.',
  'y2k':'Nothing happened. Anil bought 40 candles for nothing.',
};
function ask(){
  var q=document.getElementById('q').value.toLowerCase();
  var ans='I am terribly sorry, but I do not know the answer to that question.<br/>Have you tried asking Chintu? He claims to know everything.';
  for(var k in answers){if(q.includes(k)){ans=answers[k];break;}}
  var d=document.getElementById('answer');
  d.innerHTML='<b>Jeeves says:</b><br/>'+ans;
  d.style.display='block';
}
</script>
</body></html>`,
  },
  "y2k.survival.org": {
    title: "Y2K SURVIVAL GUIDE — URGENT",
    html: `<!DOCTYPE html><html><head><title>⚠️ Y2K SURVIVAL GUIDE ⚠️</title>
<style>body{background:#000;color:#ff0000;font-family:'Courier New',monospace;text-align:center;padding:20px}
h1{font-size:36px;animation:flash 0.5s steps(1) infinite}
@keyframes flash{0%,100%{opacity:1}50%{opacity:0}}
.countdown{font-size:48px;color:#ffff00;font-weight:bold;border:4px solid #ff0000;padding:12px;display:inline-block;margin:16px}
.checklist{text-align:left;max-width:500px;margin:0 auto;background:#111;padding:16px;border:2px solid #ff0000}
.item{margin:8px 0;color:#ff8800}
p{font-size:14px;color:#ffaa00}
</style></head>
<body>
<h1>⚠️ Y2K COUNTDOWN ⚠️</h1>
<p>MILLENNIUM BUG WARNING — ALL COMPUTERS WILL EXPLODE AT MIDNIGHT</p>
<div class="countdown" id="cd">LOADING...</div>
<div class="checklist">
<h2 style="color:#ff0">🚨 SURVIVAL CHECKLIST</h2>
<div class="item">☑ Buy candles (recommended: 40)</div>
<div class="item">☑ Withdraw all money from bank</div>
<div class="item">☑ Tell Chintu computers won't explode</div>
<div class="item">☑ Stock 3 months of chai</div>
<div class="item">☐ Backup files to floppy (1 file per disk)</div>
<div class="item">☐ Unplug fridge on Dec 31</div>
<div class="item">☐ Prepare speech for airplane crashes (Bhilai has no airport — relax)</div>
<div class="item">☐ Pray to computer (recommended: 2 times)</div>
</div>
<p style="color:#888;margin-top:24px;font-size:12px">
Note: It is now 2002. Y2K did not happen.<br/>
Nothing happened. Your candles are still there.<br/>
<em>Anil: please use the candles. It's been 2 years.</em>
</p>
<script>
function update(){
  var target=new Date('2000-01-01T00:00:00');
  var now=new Date();
  var diff=target-now;
  if(diff<0){document.getElementById('cd').innerHTML='<span style="color:#00ff00">Y2K: PASSED<br/>Nothing happened 🎉<br/>Panic: unnecessary</span>';return;}
  var d=Math.floor(diff/86400000);
  var h=Math.floor((diff%86400000)/3600000);
  var m=Math.floor((diff%3600000)/60000);
  var s=Math.floor((diff%60000)/1000);
  document.getElementById('cd').textContent=d+'d '+h+'h '+m+'m '+s+'s';
}
update();setInterval(update,1000);
</script>
</body></html>`,
  },
  "www.latent.event": {
    title: "Latent — Gandhi Hackathon 2026",
    html: `<!DOCTYPE html><html><head><title>Latent — OpenLake × Meraz</title>
<style>body{background:#1a1a2e;color:#eee;font-family:Arial,sans-serif;text-align:center;padding:60px}
h1{font-size:48px;color:#4af}
.sub{font-size:20px;color:#aaa;margin-bottom:32px}
.box{background:#0f3460;border:2px solid #4af;padding:32px;max-width:500px;margin:0 auto;border-radius:0}
.meta{font-size:13px;color:#888;margin-top:24px}
</style></head>
<body>
<h1>👀 Latent</h1>
<p class="sub">Gandhi Hackathon — OpenLake × Meraz, IIT Bhilai</p>
<div class="box">
<h2>Judges, you are here.</h2>
<p>You found the computer.<br/>We saw you navigate here.</p>
<p style="font-size:20px;margin:16px">🏆 +100 points</p>
<p>The Abandoned Computer wishes you well.<br/>Please be generous.</p>
</div>
<p class="meta">1 Nov 2026 · IIT Bhilai · This page was built inside a Windows 98 replica · You opened IE to get here</p>
<script>window.parent.postMessage({type:'achievement',id:'ie-latent',name:'🏆 Found the Latent Page'},'*');</script>
</body></html>`,
  },
};

function getPageForUrl(url: string): { title: string; html: string } | null {
  const cleaned = url
    .replace(/^https?:\/\//, "")
    .replace(/\/$/, "")
    .toLowerCase();
  return FAKE_SITES[cleaned] ?? null;
}

const NOT_FOUND_HTML = `<!DOCTYPE html><html><head><title>Cannot find server</title>
<style>body{background:#fff;font-family:Arial,sans-serif;padding:24px}
h1{color:#000080;font-size:24px}p{font-size:13px}</style></head>
<body>
<h1>The page cannot be displayed</h1>
<p>The page you are looking for is currently unavailable. The Web site might be experiencing technical difficulties, or you may need to adjust your browser settings.</p>
<p><b>Suggestions:</b></p>
<ul>
<li>Try asking Chintu. He knows these things.</li>
<li>Check that you are connected to the Internet. (Is someone on the phone?)</li>
<li>Click Refresh, or try again later.</li>
</ul>
<hr/>
<p style="font-size:11px;color:#666">Internet Explorer 5.0 | Cannot find server or DNS Error</p>
</body></html>`;

export default function InternetExplorer({ windowId }: { windowId: string }) {
  const [address, setAddress] = useState("about:blank");
  const [inputVal, setInputVal] = useState("");
  const [title, setTitle] = useState("Internet Explorer");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dialupDone, setDialupDone] = useState(false);
  const [dialupVisible, setDialupVisible] = useState(false);
  const [dialupMsg, setDialupMsg] = useState("Dialing 1-800-INTERNET...");
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const unlock = useAchievementStore((s) => s.unlock);
  const setWinTitle = useWindowStore((s) => s.setTitle);

  // Dial-up on first launch
  useEffect(() => {
    setDialupVisible(true);
    const msgs = [
      "Dialing 1-800-INTERNET...",
      "Connected at 14.4 Kbps... (trying for 56k)",
      "Verifying username and password...",
      "Someone picked up the landline.",
      "Reconnecting...",
      "Connected! (53.3 Kbps — close enough)",
    ];
    let i = 0;
    const t = setInterval(() => {
      i++;
      if (i < msgs.length) setDialupMsg(msgs[i]);
      else {
        clearInterval(t);
        setDialupDone(true);
        setDialupVisible(false);
        unlock("ie-dialup", "📞 Dial-up Connected");
      }
    }, 1400);
    return () => clearInterval(t);
  }, [unlock]);

  const navigate = (url: string) => {
    playClickSound();
    const normalised = url.startsWith("http") ? url : `http://${url}`;
    setAddress(normalised);
    setInputVal(normalised);
    setLoading(true);
    setProgress(0);

    const page = getPageForUrl(normalised);
    const delay = url.includes("iit-bhilai") ? 1800 : 1200;

    let prog = 0;
    const t = setInterval(() => {
      prog += Math.random() * 20;
      if (prog >= 100) { prog = 100; clearInterval(t); }
      setProgress(prog);
    }, 150);

    setTimeout(() => {
      setLoading(false);
      clearInterval(t);
      setProgress(0);
      const html = page?.html ?? NOT_FOUND_HTML;
      const t2 = page?.title ?? "Cannot find server";
      setTitle(t2);
      setWinTitle(windowId, `${t2} - Internet Explorer`);
      if (iframeRef.current) {
        iframeRef.current.srcdoc = html;
      }
    }, delay);
  };

  // Listen for messages from iframe (navigation, achievements)
  useEffect(() => {
    const handler = (e: MessageEvent) => {
      if (e.data?.type === "navigate") navigate(e.data.url);
      if (e.data?.type === "achievement") {
        unlock(e.data.id, e.data.name);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [unlock]);

  const handleGo = () => {
    if (!dialupDone) return;
    navigate(inputVal || "http://www.googol.com");
  };

  const { setTitle: setWinTitleFn } = useWindowStore.getState();
  void setWinTitleFn;

  return (
    <div className={styles.ie}>
      {/* Dial-up overlay */}
      {dialupVisible && (
        <div className={styles.dialup}>
          <div className={styles.dialupBox}>
            <div className={styles.dialupTitle}>Connecting...</div>
            <div className={styles.dialupBody}>
              <div className={styles.modemIcon}>📞</div>
              <div>{dialupMsg}</div>
              <button className="button" onClick={() => { setDialupVisible(false); setDialupDone(true); }}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <button className={styles.toolBtn} onClick={() => { if (iframeRef.current) iframeRef.current.contentWindow?.history.back(); }} aria-label="Back">◀ Back</button>
        <button className={styles.toolBtn} onClick={() => { if (iframeRef.current) iframeRef.current.contentWindow?.history.forward(); }} aria-label="Forward">Forward ▶</button>
        <button className={styles.toolBtn} onClick={() => navigate(address)} aria-label="Refresh">🔄 Refresh</button>
        <button className={styles.toolBtn} onClick={() => navigate("http://www.googol.com")} aria-label="Home">🏠 Home</button>
      </div>

      {/* Address bar */}
      <div className={styles.addressBar}>
        <label className={styles.addressLabel}>Address</label>
        <input
          className={styles.addressInput}
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleGo()}
          placeholder="Type a web address..."
        />
        <button className={styles.goBtn} onClick={handleGo}>Go</button>
      </div>

      {/* Links bar */}
      <div className={styles.linksBar}>
        {[
          { label: "Best of the Web", url: "http://www.googol.com" },
          { label: "Chintu's Page", url: "http://www.geocities.com/~chintu_cs_pro" },
          { label: "IIT Bhilai 1998", url: "http://www.iit-bhilai.ac.in/1998" },
          { label: "Latent", url: "http://www.latent.event" },
        ].map((l) => (
          <button key={l.url} className={styles.linkBtn} onClick={() => { setInputVal(l.url); navigate(l.url); }}>
            {l.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <iframe
        ref={iframeRef}
        className={styles.frame}
        title={title}
        sandbox="allow-scripts allow-same-origin"
        srcDoc={`<!DOCTYPE html><html><body style="background:#fff;font-family:Arial;padding:40px;text-align:center;color:#808080"><p>Type an address and press Go, or click a link in the Links bar above.</p><p style="font-size:11px">Internet Explorer 5 — Windows 98 Edition</p></body></html>`}
      />

      {/* Status bar */}
      <div className={styles.statusBar}>
        <div className={styles.statusField}>
          {loading ? "Loading..." : title ? `Done` : "Ready"}
        </div>
        {loading && (
          <div className={styles.progressBar}>
            <div className={styles.progressFill} style={{ width: `${progress}%` }} />
          </div>
        )}
        <div className={styles.throbber} title="Internet Explorer">
          {loading ? "🌐" : "🌐"}
        </div>
      </div>
    </div>
  );
}

