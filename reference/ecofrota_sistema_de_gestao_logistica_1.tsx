// @ts-nocheck
import React, { useState, useEffect, useMemo } from 'react';
import {
  LayoutDashboard, Truck, Disc, Wrench, Database, Plus, Search, AlertTriangle, ArrowRightLeft,
  Package, CheckCircle2, Download, Upload, FileWarning, DollarSign, History, Settings, X,
  ChevronRight, ShieldAlert, Sun, Moon, Fuel, Pencil, Trash2, Bell, Calendar
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend
} from 'recharts';

/* ============================================================
   DESIGN SYSTEM (tokens, componentes base e animações)
   ============================================================ */
const STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Outfit:wght@500;600;700&family=Instrument+Sans:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap');
.ef{--ink:#0E2240;--ink2:#475A78;--mute:#7385A0;--line:#DCE3EE;--bg:#F3F6FA;--pet:#0B2342;--pet2:#143560;--teal:#08805F;--teal2:#066B4F;--brand:#18B389;--amber:#F2B01E;--red:#C8372D;--blue:#1F5AA6;
  --card:#fff;--card2:#F7F9FC;--soft:#E8EEF6;--line2:#E5EAF2;--line3:#C9D3E1;--line4:#B3C0D3;--row-hover:#F5F8FC;--hdr:rgba(255,255,255,.88);--rail:#B5C2D6;--axle:#0E2C50;
  --teal-soft:#DDF5EC;--teal-soft2:#CBEEDF;--teal-wash:#EBF9F3;--teal-ink:#0B6B50;--amber-soft:#FBEBC4;--amber-ink:#7A5200;--red-soft:#F9DAD6;--red-ink:#9B2A21;--blue-soft:#DDE8F7;--blue-ink:#173F82;--gray-ink:#3C4D68;
  font-family:'Instrument Sans',system-ui,sans-serif;color:var(--ink);background:var(--bg);font-size:14px}
.ef[data-theme=dark]{color-scheme:dark;--ink:#E8EFF9;--ink2:#A9B9D0;--mute:#7F92AD;--line:#22344F;--bg:#08121F;--card:#0E1B2E;--card2:#12223A;--soft:#172A45;--line2:#1B2D49;--line3:#2A4163;--line4:#38537A;--row-hover:#12223A;--hdr:rgba(8,18,31,.85);--rail:#38537A;--axle:#8FB0DA;--teal:#18B389;--teal2:#12A07A;--red:#D9473D;
  --teal-soft:#0F3B35;--teal-soft2:#145045;--teal-wash:#0D2F2B;--teal-ink:#6FE3BE;--amber-soft:#3A2F10;--amber-ink:#F5C65A;--red-soft:#3D1D1A;--red-ink:#FF9C93;--blue-soft:#14284A;--blue-ink:#8FB2F5;--gray-ink:#BCCBE0}
.ef h1,.ef h2,.ef h3,.ef .disp{font-family:'Outfit',system-ui,sans-serif;letter-spacing:-.01em}
.ef .mono{font-family:'JetBrains Mono',ui-monospace,monospace;font-variant-numeric:tabular-nums}
.ef .card{background:var(--card);border:1px solid var(--line);border-radius:14px}
.ef .lbl{display:block;font-size:12px;font-weight:600;color:var(--ink2);margin-bottom:6px}
.ef .inp{width:100%;color:var(--ink);padding:9px 12px;border:1px solid var(--line3);border-radius:9px;background:var(--card);font-size:14px;transition:border-color .15s,box-shadow .15s}
.ef .inp:focus{outline:none;border-color:var(--teal);box-shadow:0 0 0 3px rgba(14,124,123,.18)}
.ef .btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;padding:8px 14px;border-radius:9px;font-size:13px;font-weight:600;border:1px solid transparent;cursor:pointer;transition:background .15s,transform .1s,box-shadow .15s;white-space:nowrap}
.ef .btn:active{transform:translateY(1px)}
.ef .btn:focus-visible,.ef .nav:focus-visible,.ef .icon-btn:focus-visible,.ef .tire:focus-visible{outline:2px solid var(--brand);outline-offset:2px}
.ef .btn-primary{background:var(--teal);color:#fff}.ef .btn-primary:hover{background:var(--teal2)}
.ef .btn-dark{background:var(--pet);color:#fff}.ef .btn-dark:hover{background:var(--pet2)}
.ef .btn-danger{background:var(--red);color:#fff}.ef .btn-danger:hover{background:#a92b22}
.ef .btn-ghost{background:var(--card);color:var(--ink);border-color:var(--line3)}.ef .btn-ghost:hover{background:var(--bg)}
.ef .btn-soft{background:var(--teal-soft);color:var(--teal-ink)}.ef .btn-soft:hover{background:var(--teal-soft2)}
.ef .btn-sm{padding:5px 10px;font-size:12px;border-radius:8px}
.ef .icon-btn{padding:6px;border-radius:8px;color:var(--ink2);cursor:pointer;transition:background .15s}.ef .icon-btn:hover{background:var(--bg)}
.ef .chip{display:inline-flex;align-items:center;gap:6px;padding:2px 10px;border-radius:999px;font-size:12px;font-weight:600}
.ef .c-teal{background:var(--teal-soft);color:var(--teal-ink)}.ef .c-amber{background:var(--amber-soft);color:var(--amber-ink)}.ef .c-red{background:var(--red-soft);color:var(--red-ink)}
.ef .c-blue{background:var(--blue-soft);color:var(--blue-ink)}.ef .c-gray{background:var(--soft);color:var(--gray-ink)}
.ef .tbl{width:100%;border-collapse:collapse;text-align:left}
.ef .tbl th{padding:11px 16px;font-size:12px;font-weight:600;color:var(--mute);background:var(--card2);border-bottom:1px solid var(--line);white-space:nowrap}
.ef .tbl td{padding:13px 16px;border-bottom:1px solid var(--line2);vertical-align:middle}
.ef .tbl tbody tr{transition:background .12s}.ef .tbl tbody tr:hover{background:var(--row-hover)}.ef .tbl tbody tr:last-child td{border-bottom:0}
.ef .plate{display:inline-flex;align-items:center;gap:6px;font-family:'JetBrains Mono',monospace;font-weight:700;border:1.5px solid var(--ink);border-radius:6px;padding:2px 8px;background:var(--card)}
.ef .plate i{font-style:normal;font-size:10px;background:var(--blue);color:#fff;border-radius:3px;padding:0 4px}
.ef .nav{display:flex;align-items:center;justify-content:space-between;gap:12px;width:100%;padding:10px 12px;border-radius:10px;color:#AFC0D8;font-weight:500;font-size:13.5px;position:relative;transition:background .15s,color .15s;white-space:nowrap;cursor:pointer}
.ef .nav:hover{background:rgba(255,255,255,.06);color:#fff}
.ef .nav-on{background:rgba(255,255,255,.1);color:#fff}
.ef .nav-on::before{content:'';position:absolute;left:-12px;top:9px;bottom:9px;width:4px;border-radius:0 4px 4px 0;background:var(--brand);animation:efbar .25s ease-out}
.ef .tire{width:78px;height:40px;border-radius:9px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:#fff;cursor:grab;user-select:none;
  background-image:repeating-linear-gradient(90deg,rgba(255,255,255,.07) 0 3px,transparent 3px 8px);transition:transform .15s,box-shadow .15s}
.ef .tire:hover{transform:translateY(-2px);box-shadow:0 6px 14px rgba(15,42,43,.25)}
.ef .tire:active{cursor:grabbing}
.ef .tire-sel{box-shadow:0 0 0 3px var(--card),0 0 0 5px var(--teal);transform:scale(1.06)}
.ef .slot{width:78px;height:40px;border-radius:9px;border:1.5px dashed var(--line4);display:flex;align-items:center;justify-content:center;color:var(--mute);font-size:10px;cursor:pointer;transition:all .15s;background:var(--card)}
.ef .slot-armed{border-color:var(--teal);color:var(--teal);background:var(--teal-wash);animation:efpulse 1.4s ease-in-out infinite}
.ef .slot:hover{border-color:var(--teal);background:var(--teal-wash)}
.ef .drop{border:1.5px dashed var(--line4);border-radius:12px;transition:all .15s}.ef .drop:hover{border-color:var(--teal);background:var(--teal-wash)}
.ef .seg{display:inline-flex;gap:4px;padding:4px;background:var(--soft);border-radius:11px;flex-wrap:wrap}
.ef .seg button{display:inline-flex;align-items:center;gap:8px;padding:7px 14px;border-radius:8px;font-size:13px;font-weight:600;color:var(--ink2);cursor:pointer;transition:all .15s}
.ef .seg button.on{background:var(--card);color:var(--ink);box-shadow:0 1px 3px rgba(15,42,43,.15)}
.ef .ef-rise{animation:efrise .35s cubic-bezier(.2,.7,.2,1) both}
.ef .ef-fade{animation:effade .18s ease-out both}
.ef .ef-pop{animation:efpop .22s cubic-bezier(.2,.8,.2,1) both}
.ef .ef-toast{animation:eftoast .3s cubic-bezier(.2,.8,.2,1) both}
.ef .dot{width:8px;height:8px;border-radius:50%;background:#2FB67C;animation:efpulse 2s infinite}
@keyframes efrise{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}
@keyframes effade{from{opacity:0}to{opacity:1}}
@keyframes efpop{from{opacity:0;transform:translateY(12px) scale(.97)}to{opacity:1;transform:none}}
@keyframes eftoast{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:none}}
@keyframes efbar{from{transform:scaleY(0)}to{transform:scaleY(1)}}
@keyframes efpulse{0%,100%{opacity:1}50%{opacity:.55}}
@media (prefers-reduced-motion:reduce){.ef *{animation:none!important;transition:none!important}}
.ef-shell{display:flex;flex-direction:row;min-height:100vh;width:100%}
.ef-side{width:264px;flex:0 0 264px;position:sticky;top:0;height:100vh;display:flex;flex-direction:column;background:linear-gradient(180deg,#0B2342 0%,#08192F 100%)}
.ef-nav{display:flex;flex-direction:column;align-items:stretch;gap:4px;padding:12px;flex:1 1 auto;overflow-y:auto}
.ef-side-foot{padding:16px;border-top:1px solid rgba(255,255,255,.08)}
.ef-main{flex:1 1 0;min-width:0;display:flex;flex-direction:column}
@media (max-width:900px){
  .ef-shell{flex-direction:column}
  .ef-side{width:100%;flex:0 0 auto;position:static;height:auto}
  .ef-nav{flex-direction:row;flex:0 0 auto;overflow-x:auto;overflow-y:hidden}
  .ef .nav{width:auto;flex:0 0 auto}
  .ef .nav-on::before{left:12px;right:12px;top:auto;bottom:0;width:auto;height:3px;border-radius:3px 3px 0 0}
  .ef-side-foot{display:none}
}
.ef[data-theme=dark] .btn-dark{background:#1B3358;border-color:#2A4670}.ef[data-theme=dark] .btn-dark:hover{background:#234273}
.ef[data-theme=dark] .btn-primary{background:#0B8663}.ef[data-theme=dark] .btn-primary:hover{background:#09735A}
.ef[data-theme=dark] .tire:not(.tire-sel){box-shadow:0 0 0 1px rgba(255,255,255,.16)}
.ef .card,.ef .inp,.ef .tbl th,.ef .chip{transition:background-color .25s,border-color .25s,color .25s}
.ef-drawer{position:absolute;right:0;top:0;bottom:0;width:min(460px,100%);background:var(--bg);border-left:1px solid var(--line);overflow-y:auto;animation:efslide .28s cubic-bezier(.2,.8,.2,1) both;box-shadow:-20px 0 50px rgba(6,16,32,.25)}
.ef .ef-grow{transform-origin:left;animation:efgrow .8s cubic-bezier(.2,.7,.2,1) both}
@keyframes efslide{from{transform:translateX(40px);opacity:0}to{transform:none;opacity:1}}
@keyframes efgrow{from{transform:scaleX(0)}to{transform:scaleX(1)}}
.ef-g-kpi{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}
.ef-g-dash{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:20px}
.ef-g-2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:20px}
.ef-g-chassis{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:24px;align-items:center}
.ef-chassis-side{border-left:1px solid var(--line);padding-left:24px}
.ef-donut-center{position:absolute;left:0;right:0;top:90px;text-align:center;pointer-events:none;z-index:1}
@media (max-width:1280px){.ef-g-kpi{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:1024px){.ef-g-dash,.ef-g-2,.ef-g-chassis{grid-template-columns:minmax(0,1fr)}.ef-chassis-side{border-left:0;padding-left:0;border-top:1px solid var(--line);padding-top:16px}}
@media (max-width:640px){.ef-g-kpi{grid-template-columns:minmax(0,1fr)}}
.ef-g-3{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;align-items:end}
@media (max-width:1280px){.ef-g-3{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:640px){.ef-g-3{grid-template-columns:minmax(0,1fr)}}
.ef .btn.ef-del{color:var(--red-ink);border-color:var(--red-soft)}.ef .btn.ef-del:hover{background:var(--red-soft)}
.ef .ef-blink{display:inline-flex;color:#E8890C;animation:efblink 1s ease-in-out infinite}
@keyframes efblink{0%,100%{opacity:1}50%{opacity:.12}}
.ef-g-fin{display:grid;grid-template-columns:minmax(0,9fr) minmax(0,11fr);gap:20px;align-items:start}
@media (max-width:1100px){.ef-g-fin{grid-template-columns:minmax(0,1fr)}}
.ef .ef-ell{display:block;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ef .ef-fin-wrap{max-height:248px;overflow:auto}
.ef .ef-fin{table-layout:fixed}
.ef .ef-fin th{position:sticky;top:0;z-index:1;padding:9px 14px}
.ef .ef-fin td{padding:11px 14px}
.ef .ef-compact th{padding:9px 10px}
.ef .ef-compact td{padding:11px 10px}
.ef .ef-compact td.mono{font-size:12.5px}
.ef .ef-sans{font-family:'Instrument Sans',system-ui,sans-serif;white-space:nowrap}
.ef .ef-finbar{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:11px 20px;border-top:1px solid var(--line);border-bottom:1px solid var(--line)}
.ef .ef-dot{display:inline-block;width:9px;height:9px;border-radius:50%}
.ef-fin-top{display:flex;align-items:center;justify-content:space-between;gap:14px;flex-wrap:wrap}
.ef .ef-tile{width:44px;height:44px;border-radius:14px;display:inline-flex;align-items:center;justify-content:center;color:#fff;flex:0 0 auto;box-shadow:0 6px 14px rgba(11,35,66,.22)}
.ef .ef-tile-glass{background:rgba(255,255,255,.16);box-shadow:none;border:1px solid rgba(255,255,255,.24)}
.ef .ef-ticon{display:inline-flex;align-items:center;justify-content:center;border-radius:12px;flex:0 0 auto}
.ef .ef-cardhead{display:flex;align-items:center;gap:14px;padding:16px 20px;border-bottom:1px solid var(--line)}
.ef .ef-cardhead h3,.ef .ef-band h3{margin:0;font-size:18px;line-height:1.2}
.ef .ef-cardhead p{margin:3px 0 0;font-size:13px;color:var(--mute)}
.ef .ef-band{position:relative;display:flex;align-items:center;gap:14px;padding:20px 22px 34px;background:linear-gradient(120deg,#0B2342 0%,#143A6B 55%,#1F5AA6 100%);color:#fff;overflow:hidden}
.ef .ef-band h3{color:#fff}
.ef .ef-band p{margin:3px 0 0;font-size:13px;color:rgba(255,255,255,.75)}
.ef .ef-band>*{position:relative;z-index:1}
.ef .ef-band>.ef-wave{position:absolute;z-index:0;right:0;bottom:0;width:58%;height:100%;pointer-events:none}
.ef .ef-band-body{position:relative;margin-top:-18px;border-radius:20px 20px 0 0;background:var(--card);padding:12px 12px 14px}
.ef .ef-pillhead thead th{background:var(--card2);border-bottom:0}
.ef .ef-pillhead thead th:first-child{border-radius:12px 0 0 12px}
.ef .ef-pillhead thead th:last-child{border-radius:0 12px 12px 0}
.ef .ef-total td{background:var(--blue-soft);border-bottom:0}
.ef .ef-total td:first-child{border-radius:14px 0 0 14px}
.ef .ef-total td:last-child{border-radius:0 14px 14px 0}
.ef .ef-circle{width:34px;height:34px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px;flex:0 0 auto}
.ef .ef-seltiles{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;padding:6px 20px 4px}
.ef .ef-seltile{display:flex;align-items:center;gap:12px;padding:12px 14px;border-radius:16px;border:1.5px solid transparent;cursor:pointer;text-align:left;color:var(--ink);font-family:inherit;transition:box-shadow .15s,border-color .15s}
.ef .ef-seltile-red{background:linear-gradient(135deg,rgba(200,55,45,.16),rgba(200,55,45,.05))}
.ef .ef-seltile-green{background:linear-gradient(135deg,rgba(24,179,137,.18),rgba(24,179,137,.05))}
.ef .ef-seltile.on{box-shadow:0 8px 20px rgba(11,35,66,.14)}
.ef .ef-seltile-red.on{border-color:var(--red)}
.ef .ef-seltile-green.on{border-color:var(--brand)}
.ef .ef-seltile:focus-visible{outline:2px solid var(--brand);outline-offset:2px}
.ef .ef-seltile-txt{display:flex;flex-direction:column;min-width:0;flex:1}
.ef .ef-seltile-txt b{font-weight:600}
.ef .ef-seltile-txt span{font-size:12.5px;color:var(--ink2);white-space:nowrap}
.ef .ef-seltile-val{padding-left:12px;border-left:1px solid var(--line3);font-weight:700;font-size:15px;white-space:nowrap}
.ef .btn-pill{border-radius:999px}
.ef .btn-oblue{background:var(--card);color:var(--blue-ink);border:1.5px solid var(--blue)}
.ef .btn-oblue:hover{background:var(--blue-soft)}
.ef .ef-period{position:relative;display:inline-flex;align-items:center}
.ef .ef-period svg{position:absolute;left:14px;color:var(--blue-ink);pointer-events:none}
.ef .ef-period select{appearance:none;-webkit-appearance:none;padding:9px 38px 9px 40px;border-radius:999px;border:1px solid var(--line3);background-color:var(--card);color:var(--ink);font-family:inherit;font-weight:500;font-size:14px;cursor:pointer;box-shadow:0 2px 8px rgba(11,35,66,.06);background-image:url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23607089' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'><path d='m6 9 6 6 6-6'/></svg>");background-repeat:no-repeat;background-position:right 14px center}
.ef .ef-period select:focus-visible{outline:2px solid var(--brand);outline-offset:2px}
.ef .ef-kpi2{position:relative;overflow:hidden;display:flex;align-items:center;gap:14px;padding:18px 20px;border-radius:18px;border:1px solid var(--line);min-height:92px}
.ef .ef-kpi2[data-tone=blue]{--spark:#3B82F6;background:linear-gradient(135deg,rgba(59,130,246,.14),rgba(59,130,246,.03)),var(--card)}
.ef .ef-kpi2[data-tone=green]{--spark:#18B389;background:linear-gradient(135deg,rgba(24,179,137,.16),rgba(24,179,137,.03)),var(--card)}
.ef .ef-kpi2[data-tone=red]{--spark:#E5564B;background:linear-gradient(135deg,rgba(229,86,75,.14),rgba(229,86,75,.03)),var(--card)}
.ef .ef-kpi2[data-tone=purple]{--spark:#8B5CF6;background:linear-gradient(135deg,rgba(139,92,246,.14),rgba(139,92,246,.03)),var(--card)}
.ef .ef-kpi2 .ef-spark{position:absolute;right:0;bottom:0;width:46%;height:78%;pointer-events:none}
.ef .ef-kpi2>*:not(.ef-spark){position:relative;z-index:1}
.ef .ef-check{display:flex;align-items:flex-start;gap:12px;padding:12px 14px;border:1px solid var(--line);border-radius:12px;background:var(--card2);cursor:pointer}
.ef .ef-check input{width:18px;height:18px;margin-top:2px;accent-color:var(--teal);flex:0 0 auto;cursor:pointer}
.ef .ef-finopts{padding:14px;border:1px dashed var(--line3);border-radius:12px;background:var(--card)}
.ef-g-rule{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(0,1.1fr) repeat(4,minmax(0,1fr));gap:12px;align-items:end}
@media (max-width:1280px){.ef-g-rule{grid-template-columns:repeat(3,minmax(0,1fr))}}
@media (max-width:640px){.ef-g-rule{grid-template-columns:repeat(2,minmax(0,1fr))}}
/* utilitários próprios (independem do Tailwind) */
.ef .ef-t13{font-size:13px}
.ef .ef-t17{font-size:17px}
.ef .ef-t28{font-size:28px}
.ef .ef-t15{font-size:15px}
.ef .ef-t12_5{font-size:12.5px}
.ef .ef-t16{font-size:16px}
.ef .ef-t26{font-size:26px}
.ef .ef-t12{font-size:12px}
.ef .ef-t9_5{font-size:9.5px}
.ef .ef-t11{font-size:11px}
.ef .ef-t11_5{font-size:11.5px}
.ef .ef-t20{font-size:20px}
.ef .ef-t13_5{font-size:13.5px}
.ef .ef-t32{font-size:32px}
.ef .ef-t22{font-size:22px}
.ef .ef-t14{font-size:14px}
.ef .ef-tr{text-align:right!important}
.ef .ef-tc{text-align:center!important}
.ef .ef-py3{padding-top:.75rem!important;padding-bottom:.75rem!important}
.ef .ef-pr8{padding-right:2rem!important}
.ef .ef-z60{z-index:60}
.ef .ef-hu:hover{text-decoration:underline}
.ef .ef-sx15>*+*{margin-left:.375rem}
.ef .ef-ml1_5{margin-left:0.375rem}
.ef .ef-mt2_5{margin-top:0.625rem}
.ef .ef-mt0_5{margin-top:0.125rem}
.ef .ef-h2_5{height:0.625rem}
.ef .ef-gap1_5{gap:0.375rem}
.ef .ef-w1_5{width:0.375rem}
.ef .ef-gap2_5{gap:0.625rem}
.ef .ef-w3_5{width:0.875rem}
.ef .ef-h3_5{height:0.875rem}
.ef .ef-px2_5{padding-left:0.625rem;padding-right:0.625rem}
.ef .ef-h1_5{height:0.375rem}
.ef .ef-mt1_5{margin-top:0.375rem}
.ef .ef-py0_5{padding-top:0.125rem;padding-bottom:0.125rem}
.ef .ef-py1_5{padding-top:0.375rem;padding-bottom:0.375rem}
.ef .ef-py2_5{padding-top:0.625rem;padding-bottom:0.625rem}
.ef .ef-t40{font-size:40px}
`;

const cx = (...a) => a.filter(Boolean).join(' ');

/* ============================================================
   DADOS INICIAIS (SEED)
   ============================================================ */
const INITIAL_COMPANY = {
  nomeEmpresa: 'EcoFrota Logística & Transportes Ltda',
  cnpj: '12.345.678/0001-90',
  logoUrl: '',
  regrasModelos: [],
  regrasManutencao: [],
  regrasPneus: {
    kmEstocar: 40000, kmRecapar: 75000, kmSucatear: 130000,
    msgEstocar: 'Retirar do veículo e enviar ao almoxarifado para reserva/rodízio.',
    msgRecapar: 'Enviar carcaça para recapadora credenciada e atualizar ciclo.',
    msgSucatear: 'Descarte técnico obrigatório. Carcaça no limite de segurança.'
  }
};

const INITIAL_VEHICLES = [
  { id: 'v1', placa: 'OPG-2469', uf: 'MG', modelo: 'Scania R450 Plus', categoria: 'Cavalo Trucado 3 Eixos', eixos: 3, kmAtual: 184500, status: 'Operando' },
  { id: 'v2', placa: 'BRA-8E19', uf: 'SP', modelo: 'Volvo FH 540', categoria: 'Cavalo Mecânico 3 Eixos', eixos: 3, kmAtual: 242100, status: 'Operando' },
  { id: 'v3', placa: 'GTR-9A11', uf: 'PR', modelo: 'Mercedes-Benz Atego 2430', categoria: 'Caminhão Toco 2 Eixos', eixos: 2, kmAtual: 98300, status: 'Manutenção' }
];

const T = (id, fogo, marca, sulcoMm, recapagens, kmTotal, classificacao, veiculoAtualId, posicaoAtual, localEstoque, historicoVeiculos) =>
  ({ id, fogo, marca, medida: '295/80 R22.5', sulcoMm, recapagens, kmTotal, classificacao, veiculoAtualId, posicaoAtual, localEstoque, historicoVeiculos });
const H = (id, placa, modelo, kmRodados, data, obs) => ({ id, placa, modelo, kmRodados, data, obs });

const INITIAL_TIRES = [
  T('t1', '233', 'Michelin X Multi Z', 8.5, 1, 78500, 'Rodando', 'v1', 'E2-EE', '', [H('h1', 'BRA-8E19', 'Volvo FH 540', 48500, '2025-11-10', '1ª vida completa'), H('h2', 'OPG-2469', 'Scania R450 Plus', 30000, '2026-04-15', 'Após 1ª recapagem')]),
  T('t2', '232', 'Michelin X Multi Z', 8.2, 1, 76200, 'Recapar', 'v1', 'E2-EI', '', [H('h3', 'OPG-2469', 'Scania R450 Plus', 76200, '2026-05-01', 'Rodagem contínua')]),
  T('t3', '230', 'Bridgestone R268', 9.0, 1, 64000, 'Rodando', 'v1', 'E2-DI', '', [H('h4', 'OPG-2469', 'Scania R450 Plus', 64000, '2026-02-12', 'Eixo tração')]),
  T('t4', '231', 'Bridgestone R268', 8.8, 1, 64000, 'Rodando', 'v1', 'E2-DE', '', [H('h5', 'OPG-2469', 'Scania R450 Plus', 64000, '2026-02-12', 'Eixo tração')]),
  T('t5', '217', 'Goodyear KMax S', 7.4, 1, 81200, 'Rodando', 'v1', 'E3-EE', '', [H('h6', 'GTR-9A11', 'MB Atego 2430', 41200, '2025-09-20', 'Rodou no toco'), H('h7', 'OPG-2469', 'Scania R450 Plus', 40000, '2026-03-18', 'Transferido para truck')]),
  T('t6', '216', 'Goodyear KMax S', 7.5, 1, 80900, 'Rodando', 'v1', 'E3-EI', '', [H('h8', 'OPG-2469', 'Scania R450 Plus', 80900, '2026-03-18', '3º Eixo')]),
  T('t7', '214', 'Goodyear KMax S', 7.1, 1, 82400, 'Rodando', 'v1', 'E3-DI', '', [H('h9', 'OPG-2469', 'Scania R450 Plus', 82400, '2026-03-18', '3º Eixo')]),
  T('t8', '215', 'Goodyear KMax S', 3.1, 3, 136500, 'Sucatear', 'v1', 'E3-DE', '', [H('h10', 'BRA-8E19', 'Volvo FH 540', 86500, '2025-10-10', 'Duas vidas no Volvo'), H('h11', 'OPG-2469', 'Scania R450 Plus', 50000, '2026-04-02', 'Final de vida')]),
  T('t9', '369', 'Pirelli FR01', 14.5, 0, 12400, 'Rodando', 'v1', 'E1-DIR', '', [H('h12', 'OPG-2469', 'Scania R450 Plus', 12400, '2026-06-01', 'Direcional Novo')]),
  T('t10', '370', 'Pirelli FR01', 15.0, 0, 0, 'Estocar', '', '', 'Prateleira A-01', []),
  T('t11', '405', 'Continental HSR2', 11.2, 2, 94000, 'Estocar', '', '', 'Prateleira B-04', [H('h13', 'BRA-8E19', 'Volvo FH 540', 54000, '2025-08-19', '1ª vida'), H('h14', 'GTR-9A11', 'MB Atego 2430', 40000, '2026-01-25', 'Retornado de recapagem')])
];

const INITIAL_MAINTENANCES = [
  { id: 'm1', osNumero: 'OS-2026-014', veiculoId: 'v1', tipo: 'Preventiva', descricao: 'Troca de kit filtros, óleo motor sintético e revisão freios', fornecedor: 'Oficina Rede Diesel Sul', data: '2026-05-12', valor: 3480.0 },
  { id: 'm2', osNumero: 'OS-2026-019', veiculoId: 'v2', tipo: 'Corretiva', descricao: 'Substituição de válvula APU e alinhamento de 3 eixos', fornecedor: 'TruckCenter BR-116', data: '2026-05-28', valor: 2150.0 },
  { id: 'm3', osNumero: 'OS-2026-022', veiculoId: 'v3', tipo: 'Pneus / Recapagem', descricao: 'Reforma de 2 carcaças 295/80 banda Vipal', fornecedor: 'Recapadora Nacional', data: '2026-06-02', valor: 1680.0 }
];

const INITIAL_FINES = [
  { id: 'f1', ait: 'AIT-998123-MG', veiculoId: 'v1', motivo: 'Excesso de velocidade até 20% na BR-381', motorista: 'Carlos Eduardo Silva', status: 'Pendente', data: '2026-05-19', pontos: 4, valor: 130.16 },
  { id: 'f2', ait: 'AIT-445102-SP', veiculoId: 'v2', motivo: 'Transitar em horário/local não permitido (Rodízio Pesados)', motorista: 'Roberto Almeida', status: 'Paga', data: '2026-05-04', pontos: 4, valor: 130.16 },
  { id: 'f3', ait: 'AIT-771920-PR', veiculoId: 'v1', motivo: 'Evasão de balança obrigatória ANTT', motorista: 'Carlos Eduardo Silva', status: 'Em Recurso', data: '2026-06-01', pontos: 5, valor: 195.23 }
];

/* ============================================================
   UTILITÁRIOS
   ============================================================ */
const formatCurrency = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(Number(v) || 0);
const formatNumber = (v) => new Intl.NumberFormat('pt-BR').format(Number(v) || 0);
const formatDec = (v, d = 2) => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }).format(Number(v) || 0);
const formatUnit = (v) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 3 }).format(Number(v) || 0);
const today = () => new Date().toISOString().split('T')[0];

const getTireRecapStyle = (recapagens) => {
  const c = Number(recapagens) || 0;
  if (c === 0) return { c: '#1C2524', label: 'Novo' };
  if (c === 1) return { c: '#715116', label: '1ª Recapagem' };
  if (c === 2) return { c: '#B77A04', label: '2ª Recapagem' };
  if (c === 3) return { c: '#E0560C', label: '3ª Recapagem' };
  return { c: '#C8372D', label: 'Mais Recapagens' };
};

const getVehicleChassisSlots = (eixosCount) => {
  const n = Math.max(2, Math.min(6, Number(eixosCount) || 3));
  const axles = [{ axleNumber: 1, leftSlots: [{ code: 'E1-ESQ', label: '1º Eixo Esq.' }], rightSlots: [{ code: 'E1-DIR', label: '1º Eixo Dir.' }] }];
  for (let i = 2; i <= n; i++) {
    axles.push({
      axleNumber: i,
      leftSlots: [{ code: `E${i}-EE`, label: `${i}º Eixo Ext. Esq.` }, { code: `E${i}-EI`, label: `${i}º Eixo Int. Esq.` }],
      rightSlots: [{ code: `E${i}-DI`, label: `${i}º Eixo Int. Dir.` }, { code: `E${i}-DE`, label: `${i}º Eixo Ext. Dir.` }]
    });
  }
  return { spareSlot: { code: 'ESTEPE-1', label: 'Estepe Chassi' }, axles };
};

const APP_VERSION = '3.9.0';
const BANDAS_PNEU = ['Liso', 'Borrachudo', 'Misto'];
const CATEGORIAS_MANUTENCAO = ['Elétrica/Eletrônica', 'Motor', 'Suspensão', 'Freio', 'Acessórios', 'Lanternagem'];
// Multa NIC (art. 257, §8º do CTB, Lei 14.229/2021): sem identificar o condutor, a empresa mantém a multa original
// e recebe uma nova multa de valor igual a 2x a original (sem pontos na CNH). Ajuste aqui se a regra mudar.
const NIC_MULTIPLICADOR = 2;
const TIPOS_COMBUSTIVEL = ['Gasolina', 'Arla', 'Diesel'];
const KM_AVISO_PREVENTIVA = 500; // o alerta da preventiva aparece quando faltarem 500 km (ou menos) para o limite
const SCHEMA_VERSION = 1;
const SNAPSHOT_KEY = 'ecofrota_v3_snapshot';
const SYSTEM_THEME = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';

/* ============================================================
   BASE PARA ATUALIZAÇÕES FUTURAS (sem perder dados já cadastrados)
   1. Nova tela: adicione um item em `navItems` (dentro do App) com o campo `render`.
   2. Nova coleção (ex.: motoristas): crie o useStored, registre em `stores` (dentro do App)
      e, se precisar de valores padrão, em NORMALIZERS.
   3. Novo campo em registros existentes: acrescente o valor padrão no normalizador da coleção.
   4. Mudança de estrutura: aumente SCHEMA_VERSION e escreva a migração em MIGRATIONS[nova versão].
   ============================================================ */
const MIGRATIONS = {
  // 2: (d) => ({ ...d, motoristas: d.motoristas || [] }),
};
const migrate = (data) => {
  let v = Number(data?.schema) || 1;
  let d = { ...data };
  while (v < SCHEMA_VERSION) { v += 1; if (MIGRATIONS[v]) d = MIGRATIONS[v](d); }
  return { ...d, schema: SCHEMA_VERSION };
};
const asList = (fn) => (a) => (Array.isArray(a) ? a.map(fn) : a);
const NORMALIZERS = {
  company: (c) => ({ ...INITIAL_COMPANY, ...c, regrasPneus: { ...INITIAL_COMPANY.regrasPneus, ...(c?.regrasPneus || {}) }, regrasModelos: Array.isArray(c?.regrasModelos) ? c.regrasModelos : [], regrasManutencao: Array.isArray(c?.regrasManutencao) ? c.regrasManutencao : [] }),
  vehicles: asList((v) => ({ uf: '', status: 'Operando', eixos: 3, kmAtual: 0, ...v })),
  tires: asList((t) => ({ recapagens: 0, kmTotal: 0, veiculoAtualId: '', posicaoAtual: '', localEstoque: '', historicoVeiculos: [], tipoBanda: '', reformas: [], ...t })),
  maintenances: asList((m) => ({ categoria: '', peca: '', km: null, ...m })),
  fines: asList((f) => ({ identificado: true, valorOriginal: f.valor, valorNIC: 0, ...f })),
  fuelings: asList((f) => ({ tipo: 'Diesel', fornecedor: '', ...f })),
  pagamentos: asList((p) => ({ forma: 'avista', parcelas: 1, vencimento: '', pagas: {}, ...p })),
  contas: asList((c) => ({ tipo: 'Outros', fornecedor: '', veiculoId: '', ...c }))
};
/* Regras de pneus por modelo/marca e tamanho (configuradas em Configurações).
   Cada regra define o KM acumulado do pneu em que o aviso aparece: 1ª, 2ª e 3ª recapagem e sucata.
   Pneus sem regra continuam usando os limites gerais. */
const normTxt = (v) => String(v || '').toLowerCase().replace(/\s+/g, ' ').trim();
const normMedida = (v) => String(v || '').toLowerCase().replace(/\s+/g, '');
const findTireRule = (tire, regras) =>
  (regras || [])
    .filter((r) => r.marca && normTxt(tire.marca).includes(normTxt(r.marca)) && (!r.medida || normMedida(r.medida) === normMedida(tire.medida)))
    .sort((a, b) => ((b.medida ? 1000 : 0) + b.marca.length) - ((a.medida ? 1000 : 0) + a.marca.length))[0] || null;
const getTireLimits = (tire, company) => {
  const g = company.regrasPneus;
  const rule = findTireRule(tire, company.regrasModelos);
  if (!rule) return { kmRecapar: g.kmRecapar, kmSucatear: g.kmSucatear, etapa: null, rule: null };
  const rc = Number(tire.recapagens) || 0;
  const alvo = Number([rule.km1, rule.km2, rule.km3][rc]);
  return {
    kmRecapar: rc >= 3 ? Infinity : (alvo > 0 ? alvo : g.kmRecapar),
    kmSucatear: Number(rule.kmSucata) > 0 ? Number(rule.kmSucata) : g.kmSucatear,
    etapa: rc < 3 ? rc + 1 : null,
    rule
  };
};
const readSnapshot = () => { try { return JSON.parse(localStorage.getItem(SNAPSHOT_KEY)); } catch { return null; } };

/* Abastecimento: média de consumo = (KM deste abastecimento − KM do abastecimento anterior do mesmo veículo) ÷ litros abastecidos agora.
   Arla é aditivo e não entra no cálculo de média. */
const cmpFuel = (a, b) => (a.data < b.data ? -1 : a.data > b.data ? 1 : Number(a.km) - Number(b.km));
const computeFuelMedias = (fuelings) => {
  const map = {};
  const byVeh = {};
  fuelings.forEach((f) => { (byVeh[f.veiculoId] = byVeh[f.veiculoId] || []).push(f); });
  Object.values(byVeh).forEach((list) => {
    const comb = list.filter((f) => f.tipo !== 'Arla').sort(cmpFuel);
    comb.forEach((f, i) => {
      if (i === 0) return;
      const dist = Number(f.km) - Number(comb[i - 1].km);
      const litros = Number(f.litros) || 0;
      if (dist > 0 && litros > 0) map[f.id] = { media: dist / litros, dist, litros, kmAnterior: Number(comb[i - 1].km) };
    });
  });
  return map;
};
/* Manutenção preventiva: uma manutenção "cumpre" o limite quando tem a mesma categoria e a peça informada (ou citada na descrição) */
const matchesPreventiveRule = (m, rule) => {
  if (m.categoria !== rule.categoria) return false;
  const alvo = normTxt(rule.peca);
  if (!alvo) return true;
  return normTxt(m.peca) === alvo || normTxt(m.peca).includes(alvo) || normTxt(m.descricao).includes(alvo);
};

/* Hodômetro: após editar/excluir um lançamento, o KM do veículo volta a ser o maior KM dos lançamentos restantes
   (nunca abaixo do KM do cadastro do veículo) e os pneus montados acompanham a diferença. */
const vehicleLaunchKms = (vehId, fuelings, maintenances) => [
  ...fuelings.filter((f) => f.veiculoId === vehId).map((f) => Number(f.km)),
  ...maintenances.filter((m) => m.veiculoId === vehId && m.km !== null && m.km !== undefined && m.km !== '').map((m) => Number(m.km))
].filter((n) => Number.isFinite(n));
const baseKmOf = (v) => (v.kmBase !== undefined && v.kmBase !== null ? Number(v.kmBase) : (INITIAL_VEHICLES.find((x) => x.id === v.id)?.kmAtual ?? null));
const odometerFrom = (v, kms) => {
  const b = baseKmOf(v);
  const all = b === null ? kms : [...kms, b];
  return all.length ? Math.max(...all) : Number(v.kmAtual) || 0;
};
const applyOdometer = (vehs, tirs, vehId, novo, obs, data) => {
  const veh = vehs.find((v) => v.id === vehId);
  if (!veh) return { vehs, tirs };
  const delta = novo - (Number(veh.kmAtual) || 0);
  if (!delta) return { vehs, tirs };
  return {
    vehs: vehs.map((v) => (v.id === vehId ? { ...v, kmAtual: novo } : v)),
    tirs: tirs.map((t) => (t.veiculoAtualId === vehId && t.posicaoAtual !== 'ESTEPE-1' ? {
      ...t,
      kmTotal: Math.max(0, (Number(t.kmTotal) || 0) + delta),
      historicoVeiculos: [...(t.historicoVeiculos || []), { id: `h-${Date.now()}-${t.id}`, placa: veh.placa, modelo: veh.modelo, kmRodados: delta, data, obs }]
    } : t))
  };
};

/* Financeiro: cada lançamento (abastecimento, manutenção, multa, reforma de pneu) vira um pagamento.
   Sem plano definido: à vista, vencimento na data do lançamento. O plano (forma, parcelas, vencimento, baixas) fica em "pagamentos". */
const TIPO_TONE = { Abastecimento: 'teal', 'Manutenção': 'blue', Multa: 'red', Pneus: 'amber', Outros: 'gray' };
const TIPOS_FINANCEIRO = ['Abastecimento', 'Manutenção', 'Multa', 'Pneus', 'Outros'];
const MESES = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const labelPeriodo = (ym) => `${MESES[Number(String(ym).slice(5, 7)) - 1]} / ${String(ym).slice(0, 4)}`;
const TIPO_ICON = { Abastecimento: Fuel, 'Manutenção': Wrench, Multa: AlertTriangle, Pneus: Disc, Outros: DollarSign };
const TONE_VARS = { teal: ['var(--teal-soft)', 'var(--teal-ink)'], blue: ['var(--blue-soft)', 'var(--blue-ink)'], red: ['var(--red-soft)', 'var(--red-ink)'], amber: ['var(--amber-soft)', 'var(--amber-ink)'], gray: ['var(--soft)', 'var(--gray-ink)'] };
const TipoTile = ({ tipo, size = 36 }) => {
  const Icon = TIPO_ICON[tipo] || DollarSign;
  const [bg, fg] = TONE_VARS[TIPO_TONE[tipo]] || TONE_VARS.gray;
  return <span className="ef-ticon" style={{ width: size, height: size, background: bg, color: fg }}><Icon size={Math.round(size * 0.5)} /></span>;
};
const BarsGlyph = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><rect x="3" y="13" width="4.5" height="8" rx="1.2" /><rect x="9.8" y="8" width="4.5" height="13" rx="1.2" /><rect x="16.5" y="3" width="4.5" height="18" rx="1.2" /></svg>);
const PieGlyph = () => (<svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M11 3.1a9 9 0 1 0 9.9 9.9H11z" /><path d="M13 2.1V11h8.9A9 9 0 0 0 13 2.1z" opacity=".75" /></svg>);
const Spark = () => (<svg className="ef-spark" viewBox="0 0 160 60" preserveAspectRatio="none" aria-hidden="true"><path d="M0 52C22 30 42 56 66 38S112 22 160 8V60H0Z" fill="var(--spark)" opacity=".13" /><path d="M0 52C22 30 42 56 66 38S112 22 160 8" fill="none" stroke="var(--spark)" strokeWidth="2.5" strokeLinecap="round" /></svg>);
const SparkBars = () => (<svg className="ef-spark" viewBox="0 0 160 60" preserveAspectRatio="none" aria-hidden="true">{[10, 18, 28, 40, 54].map((h, i) => <rect key={i} x={18 + i * 28} y={60 - h} width="16" height={h} rx="4" fill="var(--spark)" opacity={0.28 + i * 0.14} />)}</svg>);
const pad2 = (n) => String(n).padStart(2, '0');
const localToday = () => { const d = new Date(); return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`; };
const addMonthsISO = (iso, n) => {
  const [y, m, d] = String(iso).split('-').map(Number);
  const dt = new Date(y, m - 1 + n, 1);
  const last = new Date(dt.getFullYear(), dt.getMonth() + 1, 0).getDate();
  return `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(Math.min(d, last))}`;
};
const daysBetween = (aIso, bIso) => Math.round((new Date(`${bIso}T00:00:00`) - new Date(`${aIso}T00:00:00`)) / 86400000);
const formatDateBR = (iso) => (iso ? String(iso).split('-').reverse().join('/') : '—');
const formatDateShort = (iso) => (iso ? String(iso).split('-').reverse().map((x, i) => (i === 2 ? x.slice(2) : x)).join('/') : '—');
const splitInstallments = (total, n) => {
  const cents = Math.round((Number(total) || 0) * 100);
  const base = Math.floor(cents / n);
  return Array.from({ length: n }, (_, i) => (i === n - 1 ? cents - base * (n - 1) : base) / 100);
};
/* Flag "Integrar com o financeiro" nos lançamentos de manutenção (OS) e multa */
const planoErro = (form) => {
  if (!form.integrar) return '';
  if (form.pgForma === 'parcelado') {
    const n = Math.round(Number(form.pgParcelas));
    if (!(n >= 2 && n <= 48)) return 'Informe de 2 a 48 parcelas para integrar com o financeiro.';
  }
  return (form.pgVenc || form.data) ? '' : 'Informe o vencimento para integrar com o financeiro.';
};
const IntegrarFinanceiro = ({ form, setForm, total, texto }) => {
  const parcelado = form.pgForma === 'parcelado';
  const venc = form.pgVenc || form.data;
  const n = parcelado ? Math.max(2, Math.min(48, Math.round(Number(form.pgParcelas)) || 2)) : 1;
  const vals = total > 0 ? splitInstallments(total, n) : [];
  return (
    <div className="space-y-3">
      <label className="ef-check">
        <input type="checkbox" checked={!!form.integrar} onChange={(e) => setForm({ ...form, integrar: e.target.checked })} />
        <span>
          <b>Integrar com o financeiro</b>
          <span className="ef-sans" style={{ display: 'block', fontSize: 12.5, color: 'var(--mute)', whiteSpace: 'normal' }}>{texto}</span>
        </span>
      </label>
      {form.integrar && (
        <div className="ef-finopts space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Forma de pagamento">
              <select className="inp" value={form.pgForma} onChange={(e) => setForm({ ...form, pgForma: e.target.value })}>
                <option value="avista">À vista</option>
                <option value="parcelado">Parcelado</option>
              </select>
            </Field>
            <Field label="Quantidade de parcelas"><input type="number" min="2" max="48" disabled={!parcelado} className="inp mono" value={parcelado ? form.pgParcelas : 1} onChange={(e) => setForm({ ...form, pgParcelas: e.target.value })} /></Field>
          </div>
          <Field label={parcelado ? 'Vencimento da 1ª parcela' : 'Vencimento'}><input type="date" required className="inp" value={venc} onChange={(e) => setForm({ ...form, pgVenc: e.target.value })} /></Field>
          {venc && vals.length > 0 && (
            <div style={{ fontSize: 12.5, color: 'var(--mute)' }}>
              {vals.slice(0, 6).map((v, i) => (
                <div key={i} className="flex justify-between"><span>{n > 1 ? `Parcela ${i + 1}/${n}` : 'À vista'} · {formatDateBR(addMonthsISO(venc, i))}</span><span className="mono">{formatCurrency(v)}</span></div>
              ))}
              {vals.length > 6 && <div>... e mais {vals.length - 6} parcela(s)</div>}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const buildPayables = ({ fuelings, maintenances, fines, tires, vehicles, pagamentos, contas = [] }) => {
  const placa = (id) => vehicles.find((v) => v.id === id)?.placa || '';
  const base = [];
  fuelings.forEach((f) => base.push({ origem: 'abastecimento', origemId: f.id, tipo: 'Abastecimento', descricao: `${f.tipo} · ${formatDec(f.litros)} L`, sub: [placa(f.veiculoId), f.fornecedor].filter(Boolean).join(' · '), total: Number(f.valorTotal) || 0, data: f.data }));
  maintenances.filter((m) => m.integrarFinanceiro !== false).forEach((m) => base.push({ origem: 'manutencao', origemId: m.id, tipo: 'Manutenção', descricao: m.descricao, sub: [placa(m.veiculoId), m.osNumero, m.fornecedor].filter(Boolean).join(' · '), total: Number(m.valor) || 0, data: m.data }));
  fines.filter((f) => f.integrarFinanceiro !== false).forEach((f) => base.push({ origem: 'multa', origemId: f.id, tipo: 'Multa', descricao: f.motivo, sub: [placa(f.veiculoId), f.ait].filter(Boolean).join(' · '), total: Number(f.valor) || 0, data: f.data, paga: f.status === 'Paga' }));
  tires.forEach((t) => (t.reformas || []).forEach((r) => {
    if (Number(r.valor) > 0) base.push({ origem: 'pneu', origemId: `${t.id}:${r.id}`, tipo: 'Pneus', descricao: `Recapagem · Fogo #${t.fogo} (${r.ciclo}ª, banda ${r.tipoBanda || '—'})`, sub: r.fornecedor || '', total: Number(r.valor), data: r.data });
  }));
  contas.forEach((c) => base.push({ origem: 'conta', origemId: c.id, tipo: c.tipo || 'Outros', descricao: c.descricao, sub: [placa(c.veiculoId), c.fornecedor].filter(Boolean).join(' · '), total: Number(c.valor) || 0, data: c.data }));
  const out = [];
  base.filter((b) => b.total > 0).forEach((b) => {
    const plan = pagamentos.find((p) => p.origem === b.origem && p.origemId === b.origemId);
    const parcelado = plan?.forma === 'parcelado';
    const n = parcelado ? Math.max(2, Number(plan.parcelas) || 2) : 1;
    const primeiroVenc = plan?.vencimento || b.data;
    const valores = splitInstallments(b.total, n);
    valores.forEach((valor, i) => out.push({
      key: `${b.origem}:${b.origemId}:${i}`, origem: b.origem, origemId: b.origemId, idx: i, tipo: b.tipo, descricao: b.descricao, sub: b.sub,
      total: b.total, forma: parcelado ? 'parcelado' : 'avista', parcelas: n, numParcela: i + 1, valor, primeiroVenc,
      vencimento: addMonthsISO(primeiroVenc, i), pagoEm: plan?.pagas?.[i] || (b.paga ? b.data : null)
    }));
  });
  return out;
};

const useStored = (key, init, norm) => {
  const [s, set] = useState(() => {
    try { const v = localStorage.getItem(key); if (!v) return init; const p = JSON.parse(v); return norm ? norm(p) : p; } catch { return init; }
  });
  useEffect(() => { localStorage.setItem(key, JSON.stringify(s)); }, [key, s]);
  return [s, set];
};

const useCount = (to, ms = 900) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) { setV(to); return; }
    let raf, start;
    const f = (t) => {
      start = start ?? t;
      const p = Math.min(1, (t - start) / ms);
      setV(to * (1 - Math.pow(1 - p, 3)));
      if (p < 1) raf = requestAnimationFrame(f);
    };
    raf = requestAnimationFrame(f);
    return () => cancelAnimationFrame(raf);
  }, [to, ms]);
  return v;
};

/* ============================================================
   COMPONENTES BASE
   ============================================================ */
const Btn = ({ v = 'ghost', sm, icon: Icon, children, className, ...p }) => (
  <button className={cx('btn', `btn-${v}`, sm && 'btn-sm', className)} {...p}>
    {Icon && <Icon size={sm ? 14 : 16} />}{children}
  </button>
);

const Chip = ({ tone = 'gray', children }) => <span className={cx('chip', `c-${tone}`)}>{children}</span>;
const Plate = ({ v }) => <span className="plate">{v.placa}<i>{v.uf || 'BR'}</i></span>;
const Field = ({ label, children }) => <label className="block"><span className="lbl">{label}</span>{children}</label>;
const Empty = ({ icon: Icon, title, text }) => (
  <div className="py-14 px-6 text-center">
    <div className="mx-auto mb-3 w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'var(--teal-soft)', color: 'var(--teal)' }}><Icon size={20} /></div>
    <div className="font-semibold">{title}</div>
    <div className="ef-t13 mt-1" style={{ color: 'var(--mute)' }}>{text}</div>
  </div>
);

const Modal = ({ title, onClose, children, wide }) => {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 ef-fade" style={{ background: 'rgba(6,16,32,.55)', backdropFilter: 'blur(3px)' }}
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" className={cx('card ef-pop w-full overflow-y-auto', wide ? 'max-w-lg' : 'max-w-md')} style={{ maxHeight: '92vh', boxShadow: '0 24px 60px rgba(6,16,32,.35)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid var(--line)' }}>
          <h3 className="ef-t17 font-semibold">{title}</h3>
          <button aria-label="Fechar" onClick={onClose} className="icon-btn"><X size={18} /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
};

const Drawer = ({ onClose, children }) => {
  useEffect(() => {
    const h = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [onClose]);
  return (
    <div className="fixed inset-0 z-40 ef-fade" style={{ background: 'rgba(6,16,32,.45)' }} onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <aside role="dialog" aria-modal="true" className="ef-drawer">{children}</aside>
    </div>
  );
};

const FormActions = ({ onCancel, label = 'Salvar', v = 'dark' }) => (
  <div className="flex justify-end gap-2 pt-3">
    <Btn type="button" onClick={onCancel}>Cancelar</Btn>
    <Btn type="submit" v={v}>{label}</Btn>
  </div>
);

const Kpi = ({ label, value, fmt = (n) => formatNumber(Math.round(n)), suffix, sub, icon: Icon, tone, delay = 0, action }) => {
  const n = useCount(value);
  return (
    <div className="card p-5 ef-rise" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-center justify-between">
        <span className="ef-t13 font-medium" style={{ color: 'var(--ink2)' }}>{label}</span>
        <div className="w-9 h-9 flex items-center justify-center" style={{ borderRadius: 10, background: tone.bg, color: tone.fg }}><Icon size={18} /></div>
      </div>
      <div className="disp mt-3 ef-t28 font-semibold leading-none">{fmt(n)}{suffix && <span className="ef-t15 font-medium ef-ml1_5" style={{ color: 'var(--mute)' }}>{suffix}</span>}</div>
      <div className="ef-mt2_5 flex items-center justify-between ef-t12_5" style={{ color: 'var(--mute)' }}>
        <span>{sub}</span>{action}
      </div>
    </div>
  );
};

const SectionHead = ({ title, sub, children }) => (
  <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4" style={{ borderBottom: '1px solid var(--line)' }}>
    <div><h3 className="ef-t16 font-semibold">{title}</h3>{sub && <p className="ef-t12_5 ef-mt0_5" style={{ color: 'var(--mute)' }}>{sub}</p>}</div>
    {children}
  </div>
);

const FINE_TONE = { Pendente: 'amber', Paga: 'teal', 'Em Recurso': 'blue' };

/* ============================================================
   APLICAÇÃO
   ============================================================ */
export default function App() {
  const [company, setCompany] = useStored('ecofrota_v3_company', INITIAL_COMPANY, NORMALIZERS.company);
  const [theme, setTheme] = useStored('ecofrota_v3_theme', SYSTEM_THEME);
  const [vehicles, setVehicles] = useStored('ecofrota_v3_vehicles', INITIAL_VEHICLES, NORMALIZERS.vehicles);
  const [tires, setTires] = useStored('ecofrota_v3_tires', INITIAL_TIRES, NORMALIZERS.tires);
  const [maintenances, setMaintenances] = useStored('ecofrota_v3_maintenances', INITIAL_MAINTENANCES, NORMALIZERS.maintenances);
  const [fines, setFines] = useStored('ecofrota_v3_fines', INITIAL_FINES, NORMALIZERS.fines);
  const [fuelings, setFuelings] = useStored('ecofrota_v3_fuelings', [], NORMALIZERS.fuelings);
  const [pagamentos, setPagamentos] = useStored('ecofrota_v3_pagamentos', [], NORMALIZERS.pagamentos);
  const [contas, setContas] = useStored('ecofrota_v3_contas', [], NORMALIZERS.contas);

  const [activeTab, setActiveTab] = useState('dashboard');
  const [tireHubSubTab, setTireHubSubTab] = useState('chassis');
  const [expenseSubTab, setExpenseSubTab] = useState('maintenances');
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, k: Date.now() });
    setTimeout(() => setToast(null), 3500);
  };

  const [selectedChassisVehicleId, setSelectedChassisVehicleId] = useState(() => (vehicles[0] ? vehicles[0].id : ''));
  const [chassisEquipSearch, setChassisEquipSearch] = useState('');
  const [chassisTireSearch, setChassisTireSearch] = useState('');
  const [chassisFilterBy, setChassisFilterBy] = useState('fogo');
  const [selectedTireForActionId, setSelectedTireForActionId] = useState(null);
  const [draggedTireId, setDraggedTireId] = useState(null);

  const [tireActionModal, setTireActionModal] = useState(null);
  const [actionKmInput, setActionKmInput] = useState('');
  const [actionObsInput, setActionObsInput] = useState('');
  const [actionStockLocInput, setActionStockLocInput] = useState('Prateleira A-01');
  const [actionBandaInput, setActionBandaInput] = useState('');
  const [actionFornecedorInput, setActionFornecedorInput] = useState('');
  const [actionValorInput, setActionValorInput] = useState('');
  const [historyModalTire, setHistoryModalTire] = useState(null);
  const [detailVehicleId, setDetailVehicleId] = useState(null);
  const emptyRule = { marca: '', medida: '', km1: '', km2: '', km3: '', kmSucata: '' };
  const [ruleForm, setRuleForm] = useState(emptyRule);
  const [editingRuleId, setEditingRuleId] = useState(null);

  const emptyVehicle = { placa: '', uf: 'SP', modelo: '', categoria: '', eixos: 3, kmAtual: '' };
  const emptyTire = { fogo: '', marca: '', medida: '295/80 R22.5', sulcoMm: 15, recapagens: 0, kmInicial: 0, localEstoque: 'Prateleira A-01' };
  const emptyMaint = () => ({ integrar: false, pgForma: 'avista', pgParcelas: 2, pgVenc: '', osNumero: '', veiculoId: '', tipo: 'Preventiva', categoria: '', peca: '', km: '', descricao: '', fornecedor: '', data: today(), valor: '' });
  const emptyFine = () => ({ integrar: false, pgForma: 'avista', pgParcelas: 2, pgVenc: '', ait: '', veiculoId: '', motivo: '', identificado: true, motorista: '', status: 'Pendente', data: today(), pontos: 4, valor: '' });

  const [showVehicleModal, setShowVehicleModal] = useState(false);
  const [vehicleForm, setVehicleForm] = useState(emptyVehicle);
  const [showTireModal, setShowTireModal] = useState(false);
  const [tireForm, setTireForm] = useState(emptyTire);
  const [showMaintenanceModal, setShowMaintenanceModal] = useState(false);
  const [maintenanceForm, setMaintenanceForm] = useState(emptyMaint());
  const [showFineModal, setShowFineModal] = useState(false);
  const [fineForm, setFineForm] = useState(emptyFine());
  const emptyFuel = () => ({ veiculoId: '', tipo: 'Diesel', data: today(), litros: '', valorUnit: '', km: '', fornecedor: '' });
  const [showFuelModal, setShowFuelModal] = useState(false);
  const [fuelForm, setFuelForm] = useState(emptyFuel());
  const emptyMRule = { modelo: '', categoria: '', peca: '', km: '' };
  const [maintRuleForm, setMaintRuleForm] = useState(emptyMRule);
  const [editingMaintRuleId, setEditingMaintRuleId] = useState(null);
  const [editingFuelId, setEditingFuelId] = useState(null);
  const [editingMaintId, setEditingMaintId] = useState(null);
  const [editingFineId, setEditingFineId] = useState(null);
  const [editingTireId, setEditingTireId] = useState(null);
  const [payEdit, setPayEdit] = useState(null);
  const [payForm, setPayForm] = useState({ forma: 'avista', parcelas: 2, vencimento: '' });
  const [finPeriodo, setFinPeriodo] = useState('todos');
  const [finTab, setFinTab] = useState(null);
  const [finExpand, setFinExpand] = useState(false);
  const emptyConta = () => ({ tipo: 'Outros', veiculoId: '', descricao: '', fornecedor: '', valor: '', forma: 'avista', parcelas: 2, vencimento: localToday() });
  const [showContaModal, setShowContaModal] = useState(false);
  const [contaForm, setContaForm] = useState(emptyConta());
  const [editingContaId, setEditingContaId] = useState(null);

  /* ---------- Indicadores ---------- */
  const tireAlerts = useMemo(() => {
    const alerts = [];
    const r = company.regrasPneus;
    tires.forEach((t) => {
      const lim = getTireLimits(t, company);
      const veh = vehicles.find((v) => v.id === t.veiculoAtualId);
      const localLabel = veh ? `${veh.placa} (${t.posicaoAtual || 'Montado'})` : (t.localEstoque || 'Almoxarifado');
      if (t.classificacao === 'Sucatear' || t.kmTotal >= lim.kmSucatear) {
        alerts.push({ tire: t, tipo: 'Sucatear', localLabel, instrucao: r.msgSucatear,
          motivo: t.classificacao === 'Sucatear' ? 'Classificado para Sucateamento' : `Atingiu ${formatNumber(t.kmTotal)} km (Limite${lim.rule ? ' do modelo' : ''}: ${formatNumber(lim.kmSucatear)} km)` });
      } else if (t.classificacao === 'Recapar' || t.kmTotal >= lim.kmRecapar) {
        alerts.push({ tire: t, tipo: 'Recapar', localLabel, instrucao: r.msgRecapar,
          motivo: t.classificacao === 'Recapar' ? 'Marcado para envio à Recapagem' : `Atingiu ${formatNumber(t.kmTotal)} km (Meta${lim.etapa && lim.rule ? ` da ${lim.etapa}ª recapagem` : ''}: ${formatNumber(lim.kmRecapar)} km)` });
      } else if (t.classificacao === 'Estocar' && t.veiculoAtualId) {
        alerts.push({ tire: t, tipo: 'Estocar', localLabel, instrucao: r.msgEstocar, motivo: 'Classificado para retirada e estocagem no almoxarifado' });
      }
    });
    return alerts;
  }, [tires, vehicles, company.regrasPneus, company.regrasModelos]);

  const totalMaintenanceCost = useMemo(() => maintenances.reduce((a, m) => a + (Number(m.valor) || 0), 0), [maintenances]);
  const totalFinesCost = useMemo(() => fines.reduce((a, f) => a + (Number(f.valor) || 0), 0), [fines]);
  const totalStockTires = useMemo(() => tires.filter((t) => !t.veiculoAtualId && t.classificacao !== 'Sucatear'), [tires]);

  const expensesByVehicleData = useMemo(() => vehicles.map((v) => ({
    placa: v.placa,
    Manutencao: maintenances.filter((m) => m.veiculoId === v.id).reduce((s, m) => s + Number(m.valor || 0), 0),
    Multas: fines.filter((f) => f.veiculoId === v.id).reduce((s, f) => s + Number(f.valor || 0), 0)
  })), [vehicles, maintenances, fines]);

  /* ---------- Operações de pneus ---------- */
  const openTireOperationModal = (tire, targetAction, targetVehicleId = '', targetSlotCode = '') => {
    setTireActionModal({ tire, targetAction, targetVehicleId, targetSlotCode });
    setActionKmInput('');
    setActionObsInput('');
    setActionStockLocInput(tire.localEstoque || 'Prateleira A-01');
    setActionBandaInput(tire.tipoBanda || '');
    setActionFornecedorInput('');
    setActionValorInput('');
  };

  const handleConfirmTireOperation = (e) => {
    e.preventDefault();
    if (!tireActionModal) return;
    const { tire, targetAction, targetVehicleId, targetSlotCode } = tireActionModal;
    const kmToAdd = Math.max(0, Number(actionKmInput) || 0);
    const currentVehicle = vehicles.find((v) => v.id === tire.veiculoAtualId);
    const targetVehicle = vehicles.find((v) => v.id === targetVehicleId);

    setTires((prev) => prev.map((t) => {
      if (t.id !== tire.id) return t;
      const hist = [...(t.historicoVeiculos || [])];
      if (kmToAdd > 0) {
        hist.push({
          id: 'h-' + Date.now(),
          placa: currentVehicle ? currentVehicle.placa : targetVehicle ? targetVehicle.placa : 'AVULSO',
          modelo: currentVehicle ? currentVehicle.modelo : targetVehicle ? targetVehicle.modelo : 'Lançamento Manual',
          kmRodados: kmToAdd,
          data: today(),
          obs: actionObsInput.trim() || (targetAction === 'AddKm' ? 'Lançamento de KM no veículo' : `Operação (${targetAction}) na posição ${t.posicaoAtual || 'Estoque'}`)
        });
      }
      const km = (Number(t.kmTotal) || 0) + kmToAdd;
      const base = { ...t, kmTotal: km, historicoVeiculos: hist };
      if (targetAction === 'Mount') return { ...base, classificacao: 'Rodando', veiculoAtualId: targetVehicleId, posicaoAtual: targetSlotCode, localEstoque: '' };
      if (targetAction === 'Estocar') return { ...base, classificacao: 'Estocar', veiculoAtualId: '', posicaoAtual: '', localEstoque: actionStockLocInput || 'Almoxarifado Geral' };
      if (targetAction === 'Recapar') return { ...base, classificacao: 'Recapar', veiculoAtualId: '', posicaoAtual: '', localEstoque: 'Em Recapadora Externa', tipoBanda: actionBandaInput, reformas: [...(t.reformas || []), { id: 'r-' + Date.now(), data: today(), ciclo: (Number(t.recapagens) || 0) + 1, tipoBanda: actionBandaInput, fornecedor: actionFornecedorInput.trim(), valor: Number(actionValorInput) || 0 }] };
      if (targetAction === 'Sucatear') return { ...base, classificacao: 'Sucatear', veiculoAtualId: '', posicaoAtual: '', localEstoque: 'Baixa / Sucata' };
      return base;
    }));

    setSelectedTireForActionId(null);
    setTireActionModal(null);
    showToast(`Pneu Fogo #${tire.fogo} atualizado com sucesso!`);
  };

  const handleCompleteRecap = (tire) => {
    setTires((prev) => prev.map((t) => t.id === tire.id
      ? { ...t, recapagens: (Number(t.recapagens) || 0) + 1, sulcoMm: 14.0, classificacao: 'Estocar', veiculoAtualId: '', posicaoAtual: '', localEstoque: 'Prateleira Recapados' }
      : t));
    showToast(`Pneu #${tire.fogo} retornou da recapagem (+1 ciclo) para o estoque!`);
  };

  /* ---------- Cadastros ---------- */
  const handleCreateVehicle = (e) => {
    e.preventDefault();
    if (!vehicleForm.placa.trim() || !vehicleForm.categoria.trim()) return;
    const nv = {
      id: 'v-' + Date.now(),
      placa: vehicleForm.placa.toUpperCase().trim(),
      uf: vehicleForm.uf.toUpperCase().trim() || 'SP',
      modelo: vehicleForm.modelo.trim() || vehicleForm.categoria.trim(),
      categoria: vehicleForm.categoria.trim(),
      eixos: Math.max(2, Math.min(6, Number(vehicleForm.eixos) || 3)),
      kmAtual: Number(vehicleForm.kmAtual) || 0,
      kmBase: Number(vehicleForm.kmAtual) || 0,
      status: 'Operando'
    };
    setVehicles((p) => [...p, nv]);
    if (!selectedChassisVehicleId) setSelectedChassisVehicleId(nv.id);
    setShowVehicleModal(false);
    setVehicleForm(emptyVehicle);
    showToast(`Veículo ${nv.placa} cadastrado!`);
  };

  const handleCreateTire = (e) => {
    e.preventDefault();
    if (!tireForm.fogo.trim() || !tireForm.marca.trim()) return;
    const kmIni = Math.max(0, Number(tireForm.kmInicial) || 0);
    const nt = {
      id: 't-' + Date.now(),
      fogo: tireForm.fogo.toUpperCase().trim(),
      marca: tireForm.marca.trim(),
      medida: tireForm.medida.trim() || '295/80 R22.5',
      sulcoMm: Number(tireForm.sulcoMm) || 15,
      recapagens: Number(tireForm.recapagens) || 0,
      kmTotal: kmIni,
      classificacao: 'Estocar', veiculoAtualId: '', posicaoAtual: '',
      localEstoque: tireForm.localEstoque || 'Prateleira A-01',
      historicoVeiculos: kmIni > 0 ? [{ id: 'h-' + Date.now(), placa: 'CADASTRO-INICIAL', modelo: 'Histórico Anterior', kmRodados: kmIni, data: today(), obs: 'Quilometragem inicial no cadastro' }] : []
    };
    setTires((p) => [...p, nt]);
    setShowTireModal(false);
    setTireForm(emptyTire);
    showToast(`Pneu Fogo #${nt.fogo} cadastrado no estoque!`);
  };

/* Alinhamento de KM: a quilometragem informada precisa respeitar a ordem das manutenções e o hodômetro do veículo */
  const checkMaintenanceKm = (form, excludeId) => {
    const veh = vehicles.find((v) => v.id === form.veiculoId);
    const km = Math.round(Number(form.km));
    if (!veh) return { erro: '', veh, km };
    if (form.km === '' || !Number.isFinite(km) || km < 0) return { erro: 'Informe a quilometragem do veículo nesta manutenção.', veh, km };
    const date = form.data;
    const daVeiculo = maintenances.filter((m) => m.veiculoId === veh.id && m.id !== excludeId);
    const baseOdo = excludeId ? odometerFrom(veh, vehicleLaunchKms(veh.id, fuelings, maintenances.filter((m) => m.id !== excludeId))) : (Number(veh.kmAtual) || 0);
    const comKm = daVeiculo.filter((m) => m.km !== null && m.km !== undefined && m.km !== '' && Number.isFinite(Number(m.km)));
    const prev = comKm.filter((m) => m.data <= date).reduce((a, m) => (!a || m.data > a.data || (m.data === a.data && Number(m.km) > Number(a.km)) ? m : a), null);
    const next = comKm.filter((m) => m.data > date).reduce((a, m) => (!a || m.data < a.data ? m : a), null);
    const isLatest = daVeiculo.every((m) => m.data <= date);
    let erro = '';
    if (prev && km < Number(prev.km)) erro = `KM menor que a manutenção anterior (${prev.osNumero}: ${formatNumber(prev.km)} km em ${prev.data}).`;
    else if (next && km > Number(next.km)) erro = `KM maior que a manutenção seguinte (${next.osNumero}: ${formatNumber(next.km)} km em ${next.data}).`;
    else if (isLatest && km < baseOdo) erro = `KM menor que o hodômetro atual de ${veh.placa} (${formatNumber(baseOdo)} km).`;
    return { erro, veh, km };
  };

  const handleCreateMaintenance = (e) => {
    e.preventDefault();
    if (!maintenanceForm.veiculoId || !maintenanceForm.descricao.trim() || !maintenanceForm.valor || !maintenanceForm.categoria) return;
    const { erro, veh, km } = checkMaintenanceKm(maintenanceForm);
    if (erro) { showToast(erro, 'error'); return; }
    const erroPlano = planoErro(maintenanceForm);
    if (erroPlano) { showToast(erroPlano, 'error'); return; }
    const date = maintenanceForm.data;
    const nm = {
      id: 'm-' + Date.now(),
      osNumero: maintenanceForm.osNumero.trim() || `OS-${Math.floor(1000 + Math.random() * 9000)}`,
      veiculoId: maintenanceForm.veiculoId,
      tipo: maintenanceForm.tipo,
      categoria: maintenanceForm.categoria,
      peca: (maintenanceForm.peca || '').trim(),
      km,
      descricao: maintenanceForm.descricao.trim(),
      fornecedor: maintenanceForm.fornecedor.trim() || 'Oficina Credenciada',
      data: date,
      valor: Number(maintenanceForm.valor) || 0,
      integrarFinanceiro: !!maintenanceForm.integrar
    };
    setMaintenances((p) => [nm, ...p]);
    if (maintenanceForm.integrar) salvarPlano('manutencao', nm.id, maintenanceForm);

    /* Sincronização: o KM da manutenção atualiza o hodômetro e os pneus montados acompanham o veículo */
    let msg = 'Despesa de manutenção registrada!';
    const delta = km - (Number(veh.kmAtual) || 0);
    if (delta > 0) {
      setVehicles((p) => p.map((v) => (v.id === veh.id ? { ...v, kmAtual: km } : v)));
      const rolando = (t) => t.veiculoAtualId === veh.id && t.posicaoAtual !== 'ESTEPE-1';
      const qtd = tires.filter(rolando).length;
      if (qtd) {
        setTires((p) => p.map((t) => (rolando(t) ? {
          ...t,
          kmTotal: (Number(t.kmTotal) || 0) + delta,
          historicoVeiculos: [...(t.historicoVeiculos || []), { id: `h-${Date.now()}-${t.id}`, placa: veh.placa, modelo: veh.modelo, kmRodados: delta, data: date, obs: `Sincronizado com o hodômetro (${nm.osNumero})` }]
        } : t)));
      }
      msg = `Manutenção registrada. Hodômetro de ${veh.placa}: ${formatNumber(km)} km (+${formatNumber(delta)}); ${qtd} pneus montados somaram o mesmo KM.`;
    }
    if (maintenanceForm.integrar) msg += ` OS ${nm.osNumero} integrada ao financeiro${maintenanceForm.pgForma === 'parcelado' ? ` em ${Math.round(Number(maintenanceForm.pgParcelas))} parcelas` : ''}.`;
    setShowMaintenanceModal(false);
    setMaintenanceForm(emptyMaint());
    showToast(msg);
  };

  const handleCreateFine = (e) => {
    e.preventDefault();
    if (!fineForm.veiculoId || !fineForm.motivo.trim() || !fineForm.valor) return;
    const erroPlano = planoErro(fineForm);
    if (erroPlano) { showToast(erroPlano, 'error'); return; }
    const ident = fineForm.identificado !== false;
    const base = Number(fineForm.valor) || 0;
    const nic = ident ? 0 : base * NIC_MULTIPLICADOR;
    const nf = {
      id: 'f-' + Date.now(),
      ait: fineForm.ait.toUpperCase().trim() || `AIT-${Math.floor(10000 + Math.random() * 90000)}`,
      veiculoId: fineForm.veiculoId,
      motivo: fineForm.motivo.trim(),
      identificado: ident,
      motorista: ident ? (fineForm.motorista.trim() || 'Não informado') : 'Não identificado',
      status: fineForm.status,
      data: fineForm.data,
      pontos: ident ? (Number(fineForm.pontos) || 4) : 0,
      valorOriginal: base,
      valorNIC: nic,
      valor: base + nic,
      integrarFinanceiro: !!fineForm.integrar
    };
    setFines((p) => [nf, ...p]);
    if (fineForm.integrar) salvarPlano('multa', nf.id, fineForm);
    setShowFineModal(false);
    setFineForm(emptyFine());
    showToast((ident ? 'Multa lançada nas despesas do veículo!' : `Multa lançada com NIC: total ${formatCurrency(nf.valor)}.`) + (fineForm.integrar ? ' Integrada ao financeiro.' : ''));
  };

    /* ---------- Backup, restauração e coleções ---------- */
  const stores = { company: [company, setCompany], vehicles: [vehicles, setVehicles], tires: [tires, setTires], maintenances: [maintenances, setMaintenances], fines: [fines, setFines], fuelings: [fuelings, setFuelings], pagamentos: [pagamentos, setPagamentos], contas: [contas, setContas] };
  const [snapshotAt, setSnapshotAt] = useState(() => readSnapshot()?.savedAt || null);
  const collectData = () => Object.fromEntries(Object.entries(stores).map(([k, [v]]) => [k, v]));

  const applyData = (raw) => {
    const d = migrate(raw);
    Object.entries(stores).forEach(([k, [, set]]) => {
      if (!(k in d)) return;
      const val = NORMALIZERS[k] ? NORMALIZERS[k](d[k]) : d[k];
      if (k === 'company' ? val && typeof val === 'object' && !Array.isArray(val) : Array.isArray(val)) set(val);
    });
  };

  const handleExportBackup = () => {
    const payload = { sistema: 'FrotaWise Enterprise Offline', versao: APP_VERSION, schema: SCHEMA_VERSION, dataExportacao: new Date().toISOString(), ...collectData() };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `FrotaWise_Backup_${today()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Arquivo de Backup gerado! Salve no seu Pen Drive.');
  };

  const handleImportBackup = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const p = JSON.parse(ev.target.result);
        if (!p || typeof p !== 'object' || !Object.keys(stores).some((k) => k in p)) throw new Error('invalid');
        const snap = { savedAt: new Date().toISOString(), schema: SCHEMA_VERSION, ...collectData() };
        localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(snap));
        setSnapshotAt(snap.savedAt);
        applyData(p);
        showToast('Backup restaurado! Os dados anteriores ficaram guardados para desfazer.');
      } catch {
        showToast('Arquivo inválido. Selecione um backup .json do FrotaWise.', 'error');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleUndoImport = () => {
    const snap = readSnapshot();
    if (!snap) return;
    applyData(snap);
    localStorage.removeItem(SNAPSHOT_KEY);
    setSnapshotAt(null);
    showToast('Restauração desfeita. Os dados anteriores voltaram.');
  };

  const handleSaveRule = (e) => {
    e.preventDefault();
    const marca = ruleForm.marca.trim();
    const kms = { km1: Number(ruleForm.km1) || 0, km2: Number(ruleForm.km2) || 0, km3: Number(ruleForm.km3) || 0, kmSucata: Number(ruleForm.kmSucata) || 0 };
    if (!marca) return;
    const preenchidos = [kms.km1, kms.km2, kms.km3, kms.kmSucata].filter((n) => n > 0);
    if (preenchidos.length === 0) { showToast('Informe ao menos uma quilometragem para a regra.', 'error'); return; }
    if (preenchidos.some((n, i) => i > 0 && n <= preenchidos[i - 1])) { showToast('As quilometragens devem crescer: 1ª < 2ª < 3ª recapagem < sucata.', 'error'); return; }
    const item = { id: editingRuleId || 'rg-' + Date.now(), marca, medida: ruleForm.medida.trim(), ...kms };
    const lista = company.regrasModelos || [];
    if (lista.some((r) => r.id !== item.id && normTxt(r.marca) === normTxt(item.marca) && normMedida(r.medida) === normMedida(item.medida))) {
      showToast('Já existe uma regra para este modelo e tamanho. Edite a existente.', 'error'); return;
    }
    setCompany((prev) => ({ ...prev, regrasModelos: editingRuleId ? (prev.regrasModelos || []).map((r) => (r.id === editingRuleId ? item : r)) : [...(prev.regrasModelos || []), item] }));
    showToast(editingRuleId ? 'Regra atualizada!' : 'Regra cadastrada! Os avisos do painel já usam essa quilometragem.');
    setRuleForm(emptyRule);
    setEditingRuleId(null);
  };

  const handleEditRule = (r) => {
    setEditingRuleId(r.id);
    setRuleForm({ marca: r.marca, medida: r.medida || '', km1: r.km1 || '', km2: r.km2 || '', km3: r.km3 || '', kmSucata: r.kmSucata || '' });
  };

  const handleRemoveRule = (r) => {
    if (!window.confirm(`Remover a regra de "${r.marca}"? Os pneus desse modelo passam a usar os limites gerais.`)) return;
    setCompany((prev) => ({ ...prev, regrasModelos: (prev.regrasModelos || []).filter((x) => x.id !== r.id) }));
    if (editingRuleId === r.id) { setEditingRuleId(null); setRuleForm(emptyRule); }
    showToast('Regra removida.');
  };

  const handleLogoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setCompany((p) => ({ ...p, logoUrl: ev.target.result })); showToast('Logo atualizada com sucesso!'); };
    reader.readAsDataURL(file);
  };

  /* ---------- Abastecimento, manutenção preventiva e médias ---------- */
  const fuelMedias = useMemo(() => computeFuelMedias(fuelings), [fuelings]);
  const fuelRows = useMemo(() => [...fuelings].sort((a, b) => (a.data < b.data ? 1 : a.data > b.data ? -1 : Number(b.km) - Number(a.km))), [fuelings]);
  const fuelStats = useMemo(() => {
    const porVeiculo = vehicles.map((v) => {
      const comMedia = fuelings.filter((f) => f.veiculoId === v.id && f.tipo !== 'Arla' && fuelMedias[f.id]).sort(cmpFuel);
      const dist = comMedia.reduce((a, f) => a + fuelMedias[f.id].dist, 0);
      const litros = comMedia.reduce((a, f) => a + fuelMedias[f.id].litros, 0);
      return { v, media: litros > 0 ? dist / litros : null, ultima: comMedia.length ? fuelMedias[comMedia[comMedia.length - 1].id].media : null, dist, litros, qtd: comMedia.length };
    }).filter((x) => x.media !== null);
    const dist = porVeiculo.reduce((a, x) => a + x.dist, 0);
    const litros = porVeiculo.reduce((a, x) => a + x.litros, 0);
    return {
      porVeiculo,
      frota: litros > 0 ? dist / litros : null,
      litrosTotal: fuelings.reduce((a, f) => a + (Number(f.litros) || 0), 0),
      gastoTotal: fuelings.reduce((a, f) => a + (Number(f.valorTotal) || 0), 0)
    };
  }, [fuelings, fuelMedias, vehicles]);

  const maintByCategory = useMemo(() => {
    const base = CATEGORIAS_MANUTENCAO.map((k) => ({ categoria: k, valor: 0, qtd: 0 }));
    let sem = null;
    maintenances.forEach((m) => {
      let alvo = base.find((b) => b.categoria === m.categoria);
      if (!alvo) { sem = sem || { categoria: 'Sem categoria', valor: 0, qtd: 0 }; alvo = sem; }
      alvo.valor += Number(m.valor) || 0;
      alvo.qtd += 1;
    });
    return sem ? [...base, sem] : base;
  }, [maintenances]);

  const preventiveList = useMemo(() => {
    const out = [];
    /* KM atual do veículo = KM do último lançamento de quilometragem (abastecimento ou manutenção) */
    const kmAtualLancado = (v) => {
      const regs = [
        ...fuelings.filter((f) => f.veiculoId === v.id && Number.isFinite(Number(f.km))).map((f) => ({ km: Number(f.km), data: f.data, origem: 'Abastecimento' })),
        ...maintenances.filter((m) => m.veiculoId === v.id && m.km !== null && m.km !== undefined && m.km !== '' && Number.isFinite(Number(m.km))).map((m) => ({ km: Number(m.km), data: m.data, origem: 'Manutenção' }))
      ];
      const ult = regs.reduce((a, x) => (!a || x.data > a.data || (x.data === a.data && x.km > a.km) ? x : a), null);
      return ult || { km: Number(v.kmAtual) || 0, data: null, origem: 'Cadastro do veículo' };
    };
    vehicles.forEach((v) => (company.regrasManutencao || []).forEach((r) => {
      if (r.modelo && normTxt(r.modelo) !== normTxt(v.modelo)) return;
      const feitos = maintenances.filter((m) => m.veiculoId === v.id && m.km !== null && m.km !== undefined && m.km !== '' && Number.isFinite(Number(m.km)) && matchesPreventiveRule(m, r));
      const ultimo = feitos.reduce((a, m) => (!a || Number(m.km) > Number(a.km) ? m : a), null);
      const atual = kmAtualLancado(v);
      if (!ultimo) { out.push({ v, r, ultimo: null, proximo: null, restante: null, atual, status: 'sem' }); return; }
      const proximo = Number(ultimo.km) + Number(r.km);
      const restante = proximo - atual.km;
      out.push({ v, r, ultimo, proximo, restante, atual, status: restante <= 0 ? 'vencida' : restante <= KM_AVISO_PREVENTIVA ? 'proxima' : 'ok' });
    }));
    return out;
  }, [vehicles, maintenances, fuelings, company.regrasManutencao]);
  const preventiveAlerts = useMemo(() => preventiveList.filter((x) => x.status === 'vencida' || x.status === 'proxima').sort((a, b) => a.restante - b.restante), [preventiveList]);

  /* O KM de cada abastecimento precisa acompanhar os registros anteriores/seguintes do veículo e o hodômetro */
  const checkFuelKm = (form, excludeId) => {
    const veh = vehicles.find((v) => v.id === form.veiculoId);
    const km = Math.round(Number(form.km));
    if (!veh) return { erro: '', veh, km };
    if (form.km === '' || !Number.isFinite(km) || km < 0) return { erro: 'Informe a quilometragem do veículo neste abastecimento.', veh, km };
    const date = form.data;
    const baseOdo = excludeId ? odometerFrom(veh, vehicleLaunchKms(veh.id, fuelings.filter((f) => f.id !== excludeId), maintenances)) : (Number(veh.kmAtual) || 0);
    const serie = [
      ...fuelings.filter((f) => f.veiculoId === veh.id && f.id !== excludeId).map((f) => ({ data: f.data, km: Number(f.km), rotulo: `abastecimento de ${f.data}` })),
      ...maintenances.filter((m) => m.veiculoId === veh.id && m.km !== null && m.km !== undefined && m.km !== '' && Number.isFinite(Number(m.km))).map((m) => ({ data: m.data, km: Number(m.km), rotulo: `manutenção ${m.osNumero} de ${m.data}` }))
    ];
    const prev = serie.filter((x) => x.data <= date).reduce((a, x) => (!a || x.data > a.data || (x.data === a.data && x.km > a.km) ? x : a), null);
    const next = serie.filter((x) => x.data > date).reduce((a, x) => (!a || x.data < a.data ? x : a), null);
    const isLatest = serie.every((x) => x.data <= date);
    let erro = '';
    if (prev && km < prev.km) erro = `KM menor que o registro anterior (${prev.rotulo}: ${formatNumber(prev.km)} km).`;
    else if (next && km > next.km) erro = `KM maior que o registro seguinte (${next.rotulo}: ${formatNumber(next.km)} km).`;
    else if (isLatest && km < baseOdo) erro = `KM menor que o hodômetro atual de ${veh.placa} (${formatNumber(baseOdo)} km).`;
    return { erro, veh, km };
  };

  const handleCreateFuel = (e) => {
    e.preventDefault();
    const litros = Number(fuelForm.litros);
    const unit = Number(fuelForm.valorUnit);
    if (!fuelForm.veiculoId || !(litros > 0) || !(unit > 0)) return;
    const { erro, veh, km } = checkFuelKm(fuelForm);
    if (erro) { showToast(erro, 'error'); return; }
    const total = Math.round(litros * unit * 100) / 100;
    const nf = { id: 'ab-' + Date.now(), veiculoId: veh.id, tipo: fuelForm.tipo, data: fuelForm.data, litros, valorUnit: unit, valorTotal: total, km, fornecedor: fuelForm.fornecedor.trim() || 'Posto não informado' };
    setFuelings((p) => [nf, ...p]);

    /* Sincronização: o KM do abastecimento atualiza o hodômetro e os pneus montados acompanham o veículo */
    let msg = `Abastecimento registrado: ${formatDec(litros)} L · ${formatCurrency(total)}.`;
    const delta = km - (Number(veh.kmAtual) || 0);
    if (delta > 0) {
      setVehicles((p) => p.map((v) => (v.id === veh.id ? { ...v, kmAtual: km } : v)));
      const rolando = (t) => t.veiculoAtualId === veh.id && t.posicaoAtual !== 'ESTEPE-1';
      const qtd = tires.filter(rolando).length;
      if (qtd) {
        setTires((p) => p.map((t) => (rolando(t) ? {
          ...t,
          kmTotal: (Number(t.kmTotal) || 0) + delta,
          historicoVeiculos: [...(t.historicoVeiculos || []), { id: `h-${Date.now()}-${t.id}`, placa: veh.placa, modelo: veh.modelo, kmRodados: delta, data: fuelForm.data, obs: 'Sincronizado com o hodômetro (abastecimento)' }]
        } : t)));
      }
      msg += ` Hodômetro de ${veh.placa}: ${formatNumber(km)} km (+${formatNumber(delta)}); ${qtd} pneus montados somaram o mesmo KM.`;
    }
    const med = computeFuelMedias([nf, ...fuelings])[nf.id];
    if (med) msg += ` Média: ${formatDec(med.media)} km/l.`;
    setShowFuelModal(false);
    setFuelForm(emptyFuel());
    showToast(msg);
  };

  const handleSaveMaintRule = (e) => {
    e.preventDefault();
    const peca = maintRuleForm.peca.trim();
    const km = Math.round(Number(maintRuleForm.km));
    if (!maintRuleForm.categoria || !peca || !(km > 0)) return;
    const item = { id: editingMaintRuleId || 'rm-' + Date.now(), modelo: maintRuleForm.modelo || '', categoria: maintRuleForm.categoria, peca, km };
    const lista = company.regrasManutencao || [];
    if (lista.some((r) => r.id !== item.id && r.categoria === item.categoria && normTxt(r.peca) === normTxt(item.peca) && normTxt(r.modelo) === normTxt(item.modelo))) {
      showToast('Já existe um limite para este modelo, categoria e serviço. Edite o existente.', 'error'); return;
    }
    setCompany((prev) => ({ ...prev, regrasManutencao: editingMaintRuleId ? (prev.regrasManutencao || []).map((r) => (r.id === editingMaintRuleId ? item : r)) : [...(prev.regrasManutencao || []), item] }));
    showToast(editingMaintRuleId ? 'Limite atualizado!' : 'Limite cadastrado! Os avisos de preventiva já usam esse KM.');
    setMaintRuleForm(emptyMRule);
    setEditingMaintRuleId(null);
  };
  const handleEditMaintRule = (r) => { setEditingMaintRuleId(r.id); setMaintRuleForm({ modelo: r.modelo || '', categoria: r.categoria, peca: r.peca, km: r.km }); };
  const handleRemoveMaintRule = (r) => {
    if (!window.confirm(`Remover o limite de "${r.peca}" (${r.categoria}${r.modelo ? ` · ${r.modelo}` : ''})?`)) return;
    setCompany((prev) => ({ ...prev, regrasManutencao: (prev.regrasManutencao || []).filter((x) => x.id !== r.id) }));
    if (editingMaintRuleId === r.id) { setEditingMaintRuleId(null); setMaintRuleForm(emptyMRule); }
    showToast('Limite removido.');
  };

  /* ---------- Editar e excluir lançamentos ---------- */
  const closeFuelModal = () => { setShowFuelModal(false); setEditingFuelId(null); setFuelForm(emptyFuel()); };
  const closeMaintenanceModal = () => { setShowMaintenanceModal(false); setEditingMaintId(null); setMaintenanceForm(emptyMaint()); };
  const closeFineModal = () => { setShowFineModal(false); setEditingFineId(null); setFineForm(emptyFine()); };
  const closeTireModal = () => { setShowTireModal(false); setEditingTireId(null); setTireForm(emptyTire); };

  /* Recalcula o hodômetro dos veículos afetados e ajusta os pneus montados pela diferença */
  const syncOdometers = (vehIds, nextFuelings, nextMaints, label) => {
    let vs = vehicles;
    let ts = tires;
    const mudancas = [];
    [...new Set(vehIds)].forEach((id) => {
      const v = vs.find((x) => x.id === id);
      if (!v) return;
      const antes = Number(v.kmAtual) || 0;
      const novo = odometerFrom(v, vehicleLaunchKms(id, nextFuelings, nextMaints));
      if (novo === antes) return;
      const r = applyOdometer(vs, ts, id, novo, `Sincronizado com o hodômetro (${label})`, today());
      vs = r.vehs; ts = r.tirs;
      mudancas.push(`${v.placa}: ${formatNumber(antes)} → ${formatNumber(novo)} km`);
    });
    if (mudancas.length) { setVehicles(vs); setTires(ts); }
    return mudancas;
  };
  const sufixoKm = (mud) => (mud.length ? ` Hodômetro ajustado (${mud.join('; ')}); pneus montados acompanharam.` : '');

  // abastecimento
  const startEditFuel = (f) => {
    setEditingFuelId(f.id);
    setFuelForm({ veiculoId: f.veiculoId, tipo: f.tipo, data: f.data, litros: f.litros, valorUnit: f.valorUnit, km: f.km, fornecedor: f.fornecedor || '' });
    setShowFuelModal(true);
  };
  const handleUpdateFuel = (e) => {
    e.preventDefault();
    const old = fuelings.find((f) => f.id === editingFuelId);
    const litros = Number(fuelForm.litros);
    const unit = Number(fuelForm.valorUnit);
    if (!old || !fuelForm.veiculoId || !(litros > 0) || !(unit > 0)) return;
    const { erro, veh, km } = checkFuelKm(fuelForm, editingFuelId);
    if (erro) { showToast(erro, 'error'); return; }
    const upd = { ...old, veiculoId: veh.id, tipo: fuelForm.tipo, data: fuelForm.data, litros, valorUnit: unit, valorTotal: Math.round(litros * unit * 100) / 100, km, fornecedor: fuelForm.fornecedor.trim() || 'Posto não informado' };
    const next = fuelings.map((f) => (f.id === old.id ? upd : f));
    setFuelings(next);
    const mud = syncOdometers([old.veiculoId, veh.id], next, maintenances, 'edição de abastecimento');
    closeFuelModal();
    showToast('Abastecimento atualizado!' + sufixoKm(mud));
  };
  const handleDeleteFuel = (f) => {
    if (!window.confirm(`Excluir o abastecimento de ${f.data} (${formatDec(f.litros)} L · ${formatCurrency(f.valorTotal)})?\nO hodômetro e os pneus montados serão recalculados.`)) return;
    const next = fuelings.filter((x) => x.id !== f.id);
    setFuelings(next);
    const mud = syncOdometers([f.veiculoId], next, maintenances, 'exclusão de abastecimento');
    showToast('Abastecimento excluído.' + sufixoKm(mud));
  };

  // manutenção
  const startEditMaint = (m) => {
    setEditingMaintId(m.id);
    setMaintenanceForm({ osNumero: m.osNumero || '', veiculoId: m.veiculoId, tipo: m.tipo, categoria: m.categoria || '', peca: m.peca || '', km: m.km ?? '', descricao: m.descricao || '', fornecedor: m.fornecedor || '', data: m.data, valor: m.valor, integrar: m.integrarFinanceiro !== false, ...planoDe('manutencao', m.id) });
    setShowMaintenanceModal(true);
  };
  const handleUpdateMaintenance = (e) => {
    e.preventDefault();
    const old = maintenances.find((m) => m.id === editingMaintId);
    if (!old || !maintenanceForm.veiculoId || !maintenanceForm.descricao.trim() || !maintenanceForm.valor || !maintenanceForm.categoria) return;
    const { erro, veh, km } = checkMaintenanceKm(maintenanceForm, editingMaintId);
    if (erro) { showToast(erro, 'error'); return; }
    const erroPlano = planoErro(maintenanceForm);
    if (erroPlano) { showToast(erroPlano, 'error'); return; }
    const upd = { ...old, osNumero: maintenanceForm.osNumero.trim() || old.osNumero, veiculoId: veh.id, tipo: maintenanceForm.tipo, categoria: maintenanceForm.categoria, peca: (maintenanceForm.peca || '').trim(), km, descricao: maintenanceForm.descricao.trim(), fornecedor: maintenanceForm.fornecedor.trim() || 'Oficina Credenciada', data: maintenanceForm.data, valor: Number(maintenanceForm.valor) || 0, integrarFinanceiro: !!maintenanceForm.integrar };
    const next = maintenances.map((m) => (m.id === old.id ? upd : m));
    setMaintenances(next);
    if (maintenanceForm.integrar) salvarPlano('manutencao', old.id, maintenanceForm); else removerPlano('manutencao', old.id);
    const mud = syncOdometers([old.veiculoId, veh.id], fuelings, next, 'edição de manutenção');
    closeMaintenanceModal();
    showToast('Manutenção atualizada!' + (maintenanceForm.integrar ? ' Financeiro atualizado.' : '') + sufixoKm(mud));
  };
  const handleDeleteMaintenance = (m) => {
    if (!window.confirm(`Excluir a manutenção ${m.osNumero} (${m.descricao})?\nO hodômetro e os pneus montados serão recalculados.`)) return;
    const next = maintenances.filter((x) => x.id !== m.id);
    setMaintenances(next);
    const mud = syncOdometers([m.veiculoId], fuelings, next, 'exclusão de manutenção');
    showToast('Manutenção excluída.' + sufixoKm(mud));
  };

  // multa
  const startEditFine = (f) => {
    setEditingFineId(f.id);
    setFineForm({ ait: f.ait || '', veiculoId: f.veiculoId, motivo: f.motivo || '', identificado: f.identificado !== false, motorista: f.identificado === false ? '' : (f.motorista || ''), status: f.status, data: f.data, pontos: f.pontos ?? 4, valor: f.valorOriginal ?? f.valor, integrar: f.integrarFinanceiro !== false, ...planoDe('multa', f.id) });
    setShowFineModal(true);
  };
  const handleUpdateFine = (e) => {
    e.preventDefault();
    const old = fines.find((f) => f.id === editingFineId);
    if (!old || !fineForm.veiculoId || !fineForm.motivo.trim() || !fineForm.valor) return;
    const erroPlano = planoErro(fineForm);
    if (erroPlano) { showToast(erroPlano, 'error'); return; }
    const ident = fineForm.identificado !== false;
    const base = Number(fineForm.valor) || 0;
    const nic = ident ? 0 : base * NIC_MULTIPLICADOR;
    const upd = { ...old, ait: fineForm.ait.toUpperCase().trim() || old.ait, veiculoId: fineForm.veiculoId, motivo: fineForm.motivo.trim(), identificado: ident, motorista: ident ? (fineForm.motorista.trim() || 'Não informado') : 'Não identificado', status: fineForm.status, data: fineForm.data, pontos: ident ? (Number(fineForm.pontos) || 4) : 0, valorOriginal: base, valorNIC: nic, valor: base + nic, integrarFinanceiro: !!fineForm.integrar };
    setFines((p) => p.map((f) => (f.id === old.id ? upd : f)));
    if (fineForm.integrar) salvarPlano('multa', old.id, fineForm); else removerPlano('multa', old.id);
    closeFineModal();
    showToast('Multa atualizada!' + (fineForm.integrar ? ' Financeiro atualizado.' : ''));
  };
  const handleDeleteFine = (f) => {
    if (!window.confirm(`Excluir a multa ${f.ait} (${formatCurrency(f.valor)})?`)) return;
    setFines((p) => p.filter((x) => x.id !== f.id));
    showToast('Multa excluída.');
  };

  // pneu (aba Estoque)
  const startEditTire = (t) => {
    setEditingTireId(t.id);
    setTireForm({ fogo: t.fogo, marca: t.marca, medida: t.medida, sulcoMm: t.sulcoMm, recapagens: t.recapagens, kmInicial: t.kmTotal, localEstoque: t.localEstoque || '' });
    setShowTireModal(true);
  };
  const handleUpdateTire = (e) => {
    e.preventDefault();
    if (!tireForm.fogo.trim() || !tireForm.marca.trim()) return;
    setTires((p) => p.map((t) => (t.id === editingTireId ? {
      ...t,
      fogo: tireForm.fogo.toUpperCase().trim(),
      marca: tireForm.marca.trim(),
      medida: tireForm.medida.trim() || t.medida,
      sulcoMm: tireForm.sulcoMm === '' ? t.sulcoMm : Number(tireForm.sulcoMm),
      recapagens: Math.max(0, Number(tireForm.recapagens) || 0),
      kmTotal: Math.max(0, Number(tireForm.kmInicial) || 0),
      localEstoque: tireForm.localEstoque.trim() || t.localEstoque
    } : t)));
    closeTireModal();
    showToast('Pneu atualizado!');
  };
  const handleDeleteTire = (t) => {
    if (!window.confirm(`Excluir o pneu Fogo #${t.fogo} (${t.marca})?\nO histórico dele também será apagado.`)) return;
    setTires((p) => p.filter((x) => x.id !== t.id));
    if (selectedTireForActionId === t.id) setSelectedTireForActionId(null);
    showToast(`Pneu Fogo #${t.fogo} excluído.`);
  };

  /* ---------- Financeiro ---------- */
  const finItems = useMemo(() => buildPayables({ fuelings, maintenances, fines, tires, vehicles, pagamentos, contas }), [fuelings, maintenances, fines, tires, vehicles, pagamentos, contas]);
  const salvarPlano = (origem, id, form) => {
    const parcelado = form.pgForma === 'parcelado';
    const n = parcelado ? Math.round(Number(form.pgParcelas)) : 1;
    const atual = pagamentos.find((x) => x.origem === origem && x.origemId === id);
    upsertPlan(origem, id, { forma: parcelado ? 'parcelado' : 'avista', parcelas: n, vencimento: form.pgVenc || form.data, pagas: Object.fromEntries(Object.entries(atual?.pagas || {}).filter(([i]) => Number(i) < n)) });
  };
  const removerPlano = (origem, id) => setPagamentos((p) => p.filter((x) => !(x.origem === origem && x.origemId === id)));
  const planoDe = (origem, id) => {
    const x = pagamentos.find((y) => y.origem === origem && y.origemId === id);
    return { pgForma: x?.forma === 'parcelado' ? 'parcelado' : 'avista', pgParcelas: x?.forma === 'parcelado' ? x.parcelas : 2, pgVenc: x?.vencimento || '' };
  };
  const upsertPlan = (origem, origemId, patch) => setPagamentos((prev) => {
    const i = prev.findIndex((x) => x.origem === origem && x.origemId === origemId);
    if (i < 0) return [...prev, { id: 'pg-' + Date.now(), origem, origemId, forma: 'avista', parcelas: 1, vencimento: '', pagas: {}, ...patch }];
    return prev.map((x, k) => (k === i ? { ...x, ...patch } : x));
  });
  const planOf = (it) => pagamentos.find((x) => x.origem === it.origem && x.origemId === it.origemId);
  const payItem = (it) => {
    upsertPlan(it.origem, it.origemId, { pagas: { ...(planOf(it)?.pagas || {}), [it.idx]: localToday() } });
    if (it.origem === 'multa' && finItems.filter((x) => x.origem === 'multa' && x.origemId === it.origemId).every((x) => x.idx === it.idx || x.pagoEm)) {
      setFines((p) => p.map((f) => (f.id === it.origemId ? { ...f, status: 'Paga' } : f)));
    }
    showToast(`Baixa registrada: ${it.tipo} · ${formatCurrency(it.valor)}.`);
  };
  const undoPayItem = (it) => {
    const pagas = { ...(planOf(it)?.pagas || {}) };
    delete pagas[it.idx];
    upsertPlan(it.origem, it.origemId, { pagas });
    if (it.origem === 'multa') setFines((p) => p.map((f) => (f.id === it.origemId && f.status === 'Paga' ? { ...f, status: 'Pendente' } : f)));
    showToast('Baixa desfeita: o pagamento voltou a ficar pendente.');
  };
  const openPayEdit = (it) => {
    setPayEdit({ origem: it.origem, origemId: it.origemId, tipo: it.tipo, descricao: it.descricao, total: it.total });
    setPayForm({ forma: it.forma, parcelas: it.forma === 'parcelado' ? it.parcelas : 2, vencimento: it.primeiroVenc });
  };
  const closeContaModal = () => { setShowContaModal(false); setEditingContaId(null); setContaForm(emptyConta()); };
  const startEditConta = (id) => {
    const c = contas.find((x) => x.id === id);
    if (!c) return;
    const plan = pagamentos.find((x) => x.origem === 'conta' && x.origemId === id);
    setEditingContaId(id);
    setContaForm({ tipo: c.tipo || 'Outros', veiculoId: c.veiculoId || '', descricao: c.descricao, fornecedor: c.fornecedor || '', valor: c.valor, forma: plan?.forma === 'parcelado' ? 'parcelado' : 'avista', parcelas: plan?.forma === 'parcelado' ? plan.parcelas : 2, vencimento: plan?.vencimento || c.data });
    setShowContaModal(true);
  };
  const editItem = (it) => (it.origem === 'conta' ? startEditConta(it.origemId) : openPayEdit(it));
  const handleSaveConta = (e) => {
    e.preventDefault();
    const valor = Number(contaForm.valor);
    if (!contaForm.descricao.trim() || !(valor > 0) || !contaForm.vencimento) return;
    const parcelado = contaForm.forma === 'parcelado';
    const n = parcelado ? Math.round(Number(contaForm.parcelas)) : 1;
    if (parcelado && !(n >= 2 && n <= 48)) { showToast('Informe de 2 a 48 parcelas.', 'error'); return; }
    const dados = { tipo: contaForm.tipo, veiculoId: contaForm.veiculoId, descricao: contaForm.descricao.trim(), fornecedor: contaForm.fornecedor.trim(), valor };
    const plano = { forma: parcelado ? 'parcelado' : 'avista', parcelas: n, vencimento: contaForm.vencimento };
    if (editingContaId) {
      setContas((p) => p.map((c) => (c.id === editingContaId ? { ...c, ...dados } : c)));
      const atual = pagamentos.find((x) => x.origem === 'conta' && x.origemId === editingContaId);
      upsertPlan('conta', editingContaId, { ...plano, pagas: Object.fromEntries(Object.entries(atual?.pagas || {}).filter(([i]) => Number(i) < n)) });
      showToast('Conta a pagar atualizada!');
    } else {
      const id = 'ct-' + Date.now();
      setContas((p) => [...p, { id, ...dados, data: localToday() }]);
      upsertPlan('conta', id, { ...plano, pagas: {} });
      showToast(parcelado ? `Conta lançada em ${n} parcelas.` : 'Conta a pagar lançada!');
    }
    closeContaModal();
  };
  const handleDeleteConta = (id) => {
    const c = contas.find((x) => x.id === id);
    if (!c || !window.confirm(`Excluir a conta "${c.descricao}" (${formatCurrency(c.valor)})?\nTodas as parcelas serão removidas.`)) return;
    setContas((p) => p.filter((x) => x.id !== id));
    setPagamentos((p) => p.filter((x) => !(x.origem === 'conta' && x.origemId === id)));
    showToast('Conta excluída.');
  };
  const handleSavePay = (e) => {
    e.preventDefault();
    if (!payEdit || !payForm.vencimento) return;
    const parcelado = payForm.forma === 'parcelado';
    const n = parcelado ? Math.round(Number(payForm.parcelas)) : 1;
    if (parcelado && !(n >= 2 && n <= 48)) { showToast('Informe de 2 a 48 parcelas.', 'error'); return; }
    const plan = pagamentos.find((x) => x.origem === payEdit.origem && x.origemId === payEdit.origemId);
    const pagas = Object.fromEntries(Object.entries(plan?.pagas || {}).filter(([i]) => Number(i) < n));
    upsertPlan(payEdit.origem, payEdit.origemId, { forma: parcelado ? 'parcelado' : 'avista', parcelas: n, vencimento: payForm.vencimento, pagas });
    setPayEdit(null);
    showToast('Pagamento atualizado!');
  };

  const goChassis = (vehId) => { if (vehId) setSelectedChassisVehicleId(vehId); setActiveTab('pneus_hub'); setTireHubSubTab('chassis'); };

  /* ============================================================
     TELAS
     ============================================================ */
  const renderDashboard = () => {
    const C = theme === 'dark'
      ? { tick: '#9FB1CC', grid: '#1B2D49', bar: '#7FA8DE', tipBg: '#0E1B2E', tipC: '#E8EFF9' }
      : { tick: '#475A78', grid: '#E5EAF2', bar: '#0E2C50', tipBg: '#FFFFFF', tipC: '#0E2240' };
    const pieData = [
      { name: 'Rodando', value: tires.filter((t) => !!t.veiculoAtualId).length, color: C.bar },
      { name: 'Em estoque', value: totalStockTires.length, color: '#18B389' },
      { name: 'Para recapar', value: tires.filter((t) => t.classificacao === 'Recapar').length, color: '#F2B01E' },
      { name: 'Sucateados', value: tires.filter((t) => t.classificacao === 'Sucatear').length, color: '#C8372D' }
    ].filter((d) => d.value > 0);
    const tip = { borderRadius: 10, border: `1px solid ${C.grid}`, fontSize: 13, background: C.tipBg, color: C.tipC };

    return (
      <div className="space-y-5">
        <div className="ef-g-kpi">
          <Kpi label="Frota cadastrada" value={vehicles.length} suffix="veículos" icon={Truck} tone={{ bg: 'var(--soft)', fg: 'var(--ink)' }}
            sub={`${vehicles.filter((v) => v.status === 'Operando').length} operando agora`} delay={0} />
          <Kpi label="Pneus e almoxarifado" value={tires.length} suffix="pneus" icon={Disc} tone={{ bg: 'var(--teal-soft)', fg: 'var(--teal)' }}
            sub={`${totalStockTires.length} disponíveis em estoque`} delay={70} />
          <Kpi label="Despesa acumulada" value={totalMaintenanceCost + totalFinesCost} fmt={formatCurrency} icon={DollarSign} tone={{ bg: 'var(--blue-soft)', fg: 'var(--blue-ink)' }}
            sub="Manutenções + multas" delay={140} />
          <Kpi label="Avisos de pneus" value={tireAlerts.length} suffix="pendentes" icon={AlertTriangle} tone={{ bg: 'var(--amber-soft)', fg: 'var(--amber-ink)' }}
            sub="Exigem uma ação" delay={210}
            action={<button onClick={() => goChassis()} className="font-semibold ef-hu" style={{ color: 'var(--teal)' }}>Abrir pneus</button>} />
        </div>

        <div className="ef-g-dash">
          <div className="card ef-rise" style={{ animationDelay: '120ms' }}>
            <SectionHead title="Despesas por veículo" sub="Manutenções e multas, por placa">
              <Btn sm onClick={() => setActiveTab('despesas_hub')}>Abrir despesas</Btn>
            </SectionHead>
            <div className="h-64 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={expensesByVehicleData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                  <XAxis dataKey="placa" tick={{ fontSize: 12, fill: C.tick }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: C.tick }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={tip} itemStyle={{ color: C.tipC }} labelStyle={{ color: C.tipC }} cursor={{ fill: 'rgba(14,124,123,.06)' }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Manutencao" name="Manutenções" fill={C.bar} radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Multas" name="Multas" fill="#C8372D" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card ef-rise" style={{ animationDelay: '180ms' }}>
            <SectionHead title="Distribuição dos pneus" sub="Situação de toda a carteira" />
            <div className="h-64 p-4 relative">
              <div className="ef-donut-center">
                <div className="disp ef-t26 font-semibold leading-none">{tires.length}</div>
                <div className="ef-t12" style={{ color: 'var(--mute)' }}>pneus</div>
              </div>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy={96} innerRadius={54} outerRadius={80} paddingAngle={3} stroke="none">
                    {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip contentStyle={tip} itemStyle={{ color: C.tipC }} labelStyle={{ color: C.tipC }} />
                  <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="card overflow-hidden ef-rise" style={{ animationDelay: '240ms' }}>
          <SectionHead title="Ordens de ação programadas" sub="Pneus que precisam ser sucateados, recapados ou estocados, segundo as regras de quilometragem">
            <Btn sm icon={Settings} onClick={() => setActiveTab('settings')}>Configurar regras</Btn>
          </SectionHead>
          {tireAlerts.length === 0 ? (
            <Empty icon={ShieldAlert} title="Nenhum alerta pendente" text="Todos os pneus estão dentro dos parâmetros operacionais." />
          ) : (
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead><tr><th>Ação</th><th>Pneu</th><th>Localização</th><th className="ef-tr">KM acumulado</th><th>Diagnóstico e procedimento</th><th className="ef-tr">Executar</th></tr></thead>
                <tbody>
                  {tireAlerts.map((al, i) => (
                    <tr key={i}>
                      <td><Chip tone={al.tipo === 'Sucatear' ? 'red' : al.tipo === 'Recapar' ? 'amber' : 'blue'}>{al.tipo}</Chip></td>
                      <td><div className="mono font-bold">Fogo #{al.tire.fogo}</div><div className="ef-t12" style={{ color: 'var(--mute)' }}>{al.tire.marca}</div></td>
                      <td className="mono ef-t12_5">{al.localLabel}</td>
                      <td className="mono font-semibold text-right">{formatNumber(al.tire.kmTotal)} km</td>
                      <td style={{ maxWidth: 340 }}><div className="ef-t13 font-medium">{al.motivo}</div><div className="ef-t12" style={{ color: 'var(--mute)' }}>{al.instrucao}</div></td>
                      <td className="text-right">
                        {al.tipo === 'Recapar' && !al.tire.veiculoAtualId
                          ? <Btn sm v="primary" icon={CheckCircle2} onClick={() => handleCompleteRecap(al.tire)}>Concluir recapagem</Btn>
                          : <Btn sm v="dark" onClick={() => openTireOperationModal(al.tire, al.tipo)}>Confirmar {al.tipo.toLowerCase()}</Btn>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="ef-g-dash">
          <div className="card ef-rise">
            <SectionHead title="Dashboard de manutenção" sub="Sincronizado com os lançamentos da aba Manutenções e multas">
              <Btn sm onClick={() => { setActiveTab('despesas_hub'); setExpenseSubTab('maintenances'); }}>Abrir manutenções</Btn>
            </SectionHead>
            <div className="ef-g-kpi p-5">
              {[
                ['Lançamentos', formatNumber(maintenances.length)],
                ['Gasto total', formatCurrency(totalMaintenanceCost)],
                ['Preventivas', formatNumber(maintenances.filter((m) => m.tipo === 'Preventiva').length)],
                ['Corretivas', formatNumber(maintenances.filter((m) => m.tipo === 'Corretiva').length)]
              ].map(([l, val]) => (
                <div key={l} className="p-3 rounded-xl" style={{ background: 'var(--card2)', border: '1px solid var(--line2)' }}>
                  <div className="ef-t12" style={{ color: 'var(--mute)' }}>{l}</div>
                  <div className="disp ef-t20 font-semibold mt-1">{val}</div>
                </div>
              ))}
            </div>
            <div className="px-5 ef-t13 font-semibold">Gasto por categoria de manutenção</div>
            <div className="h-64 p-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={maintByCategory} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 12, fill: C.tick }} axisLine={false} tickLine={false} />
                  <YAxis type="category" dataKey="categoria" width={130} tick={{ fontSize: 12, fill: C.tick }} axisLine={false} tickLine={false} />
                  <Tooltip formatter={(v) => formatCurrency(v)} contentStyle={tip} itemStyle={{ color: C.tipC }} labelStyle={{ color: C.tipC }} cursor={{ fill: 'rgba(24,179,137,.08)' }} />
                  <Bar dataKey="valor" name="Gasto" fill="#18B389" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="card ef-rise" style={{ animationDelay: '60ms' }}>
            <SectionHead title="Média de consumo" sub="(KM atual − KM do abastecimento anterior) ÷ litros">
              <Btn sm icon={Fuel} onClick={() => setActiveTab('abastecimento')}>Abastecimento</Btn>
            </SectionHead>
            {fuelStats.frota === null ? (
              <Empty icon={Fuel} title="Sem média ainda" text="São necessários ao menos dois abastecimentos de combustível do mesmo veículo." />
            ) : (
              <div className="p-5">
                <div className="flex items-end gap-2">
                  <span className="disp ef-t40 font-semibold leading-none">{formatDec(fuelStats.frota)}</span>
                  <span className="ef-t13 pb-1" style={{ color: 'var(--mute)' }}>km/l · média da frota</span>
                </div>
                <div className="mt-4 space-y-3">
                  {fuelStats.porVeiculo.map((x) => {
                    const max = Math.max(...fuelStats.porVeiculo.map((y) => y.media));
                    return (
                      <div key={x.v.id}>
                        <div className="flex items-center justify-between"><Plate v={x.v} /><span className="mono font-bold ef-t13">{formatDec(x.media)} km/l</span></div>
                        <div className="ef-h1_5 rounded-full ef-mt1_5 overflow-hidden" style={{ background: 'var(--line2)' }}><div className="h-full rounded-full" style={{ width: `${(x.media / max) * 100}%`, background: 'var(--brand)' }} /></div>
                        <div className="ef-t12 mt-1" style={{ color: 'var(--mute)' }}>Último: {x.ultima !== null ? `${formatDec(x.ultima)} km/l` : '—'} · {x.qtd} abastecimento(s) com média</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="card overflow-hidden ef-rise" style={{ animationDelay: '120ms' }}>
          <SectionHead title="Manutenção preventiva" sub="Avisos pelos limites de KM configurados por categoria e peça">
            <Btn sm icon={Settings} onClick={() => setActiveTab('settings')}>Configurar limites</Btn>
          </SectionHead>
          {(company.regrasManutencao || []).length === 0 ? (
            <Empty icon={Wrench} title="Nenhum limite configurado" text="Em Configurações e backup, defina o KM da preventiva por categoria e peça." />
          ) : preventiveAlerts.length === 0 ? (
            <Empty icon={CheckCircle2} title="Nenhum aviso de preventiva" text={`Todas as peças com histórico estão em dia${preventiveList.filter((x) => x.status === 'sem').length ? ` (${preventiveList.filter((x) => x.status === 'sem').length} combinações veículo/peça ainda sem registro de manutenção)` : ''}.`} />
          ) : (
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead><tr><th>Situação</th><th>Veículo</th><th>Categoria / peça</th><th className="ef-tr">Última (km)</th><th className="ef-tr">Próxima (km)</th><th className="ef-tr">KM atual</th><th className="ef-tr">Restante</th><th className="ef-tr">Ação</th></tr></thead>
                <tbody>
                  {preventiveAlerts.map((al) => (
                    <tr key={al.v.id + al.r.id}>
                      <td><Chip tone={al.status === 'vencida' ? 'red' : 'amber'}>{al.status === 'vencida' ? 'Vencida' : 'Próxima'}</Chip></td>
                      <td><Plate v={al.v} /></td>
                      <td><div className="font-semibold">{al.r.peca}</div><div className="ef-t12" style={{ color: 'var(--mute)' }}>{al.r.categoria} · a cada {formatNumber(al.r.km)} km</div></td>
                      <td className="mono text-right">{formatNumber(al.ultimo.km)} km</td>
                      <td className="mono text-right">{formatNumber(al.proximo)} km</td>
                      <td className="mono text-right">{formatNumber(al.atual.km)} km<div style={{ fontSize: 11.5, fontWeight: 400, color: 'var(--mute)' }}>{al.atual.origem}{al.atual.data ? ` · ${al.atual.data}` : ''}</div></td>
                      <td className="mono text-right font-bold" style={{ color: al.status === 'vencida' ? 'var(--red)' : 'var(--ink)' }}>{al.restante <= 0 ? `Vencida há ${formatNumber(-al.restante)} km` : `${formatNumber(al.restante)} km`}</td>
                      <td className="text-right"><Btn sm v="dark" onClick={() => { setMaintenanceForm({ ...emptyMaint(), veiculoId: al.v.id, categoria: al.r.categoria, peca: al.r.peca, tipo: 'Preventiva' }); setShowMaintenanceModal(true); }}>Registrar</Btn></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderAbastecimento = () => {
    const tone = { Diesel: 'teal', Gasolina: 'amber', Arla: 'blue' };
    return (
      <div className="space-y-5">
        <div className="ef-g-kpi">
          <Kpi label="Média da frota" value={fuelStats.frota || 0} fmt={(n) => formatDec(n)} suffix="km/l" icon={Fuel} tone={{ bg: 'var(--teal-soft)', fg: 'var(--teal)' }}
            sub={fuelStats.frota ? `${fuelStats.porVeiculo.length} veículo(s) com média` : 'Faltam abastecimentos para calcular'} delay={0} />
          <Kpi label="Litros abastecidos" value={fuelStats.litrosTotal} fmt={(n) => formatNumber(Math.round(n))} suffix="L" icon={Fuel} tone={{ bg: 'var(--soft)', fg: 'var(--ink)' }} sub="Todos os combustíveis e Arla" delay={70} />
          <Kpi label="Gasto com combustível" value={fuelStats.gastoTotal} fmt={formatCurrency} icon={DollarSign} tone={{ bg: 'var(--blue-soft)', fg: 'var(--blue-ink)' }} sub="Soma dos valores totais" delay={140} />
          <Kpi label="Lançamentos" value={fuelings.length} suffix="registros" icon={FileWarning} tone={{ bg: 'var(--amber-soft)', fg: 'var(--amber-ink)' }} sub="Média não considera Arla" delay={210} />
        </div>

        <div className="card overflow-hidden ef-rise">
          <SectionHead title="Abastecimentos" sub="Média = (KM deste abastecimento − KM do anterior do mesmo veículo) ÷ litros abastecidos">
            <Btn v="primary" icon={Plus} onClick={() => setShowFuelModal(true)}>Lançar abastecimento</Btn>
          </SectionHead>
          {fuelRows.length === 0 ? (
            <Empty icon={Fuel} title="Nenhum abastecimento lançado" text="Lance o primeiro abastecimento. A média aparece a partir do segundo lançamento do mesmo veículo." />
          ) : (
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead><tr><th>Data</th><th>Veículo</th><th>Combustível</th><th className="ef-tr">Litros</th><th className="ef-tr">Valor unitário</th><th className="ef-tr">Valor total</th><th className="ef-tr">KM</th><th className="ef-tr">Média</th><th>Fornecedor</th><th className="ef-tr">Ações</th></tr></thead>
                <tbody>
                  {fuelRows.map((f) => {
                    const veh = vehicles.find((v) => v.id === f.veiculoId);
                    const med = fuelMedias[f.id];
                    return (
                      <tr key={f.id}>
                        <td className="mono">{f.data}</td>
                        <td>{veh ? <Plate v={veh} /> : 'N/A'}</td>
                        <td><Chip tone={tone[f.tipo] || 'gray'}>{f.tipo}</Chip></td>
                        <td className="mono text-right">{formatDec(f.litros)} L</td>
                        <td className="mono text-right">{formatUnit(f.valorUnit)}</td>
                        <td className="mono text-right font-bold">{formatCurrency(f.valorTotal)}</td>
                        <td className="mono text-right">{formatNumber(f.km)} km</td>
                        <td className="mono text-right font-bold" title={f.tipo === 'Arla' ? 'Arla não entra no cálculo de média' : undefined}>{med ? `${formatDec(med.media)} km/l` : '—'}</td>
                        <td style={{ color: 'var(--ink2)' }}>{f.fornecedor}</td>
                        <td className="text-right whitespace-nowrap ef-sx15"><Btn sm onClick={() => startEditFuel(f)}>Editar</Btn><Btn sm className="ef-del" onClick={() => handleDeleteFuel(f)}>Excluir</Btn></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderFinanceiro = () => {
    const hoje = localToday();
    const periodos = [...new Set([hoje.slice(0, 7), ...finItems.map((x) => x.vencimento.slice(0, 7)), ...finItems.filter((x) => x.pagoEm).map((x) => x.pagoEm.slice(0, 7))])].sort().reverse();
    const noPeriodo = (iso) => finPeriodo === 'todos' || String(iso).slice(0, 7) === finPeriodo;
    const itens = finItems.filter((x) => (x.pagoEm ? noPeriodo(x.pagoEm) : noPeriodo(x.vencimento)));
    const ordenar = (a, b) => (a.vencimento < b.vencimento ? -1 : a.vencimento > b.vencimento ? 1 : a.tipo.localeCompare(b.tipo));
    const aVencer = itens.filter((x) => !x.pagoEm && x.vencimento >= hoje).sort(ordenar);
    const vencidos = itens.filter((x) => !x.pagoEm && x.vencimento < hoje).sort(ordenar);
    const pagos = itens.filter((x) => x.pagoEm).sort((a, b) => (a.pagoEm < b.pagoEm ? 1 : a.pagoEm > b.pagoEm ? -1 : b.valor - a.valor));
    const soma = (arr) => arr.reduce((acc, x) => acc + x.valor, 0);
    const cel = (n) => (n > 0 ? formatDec(n) : '—');
    const resumo = TIPOS_FINANCEIRO.map((c) => {
      const lista = itens.filter((x) => x.tipo === c);
      const av = lista.filter((x) => !x.pagoEm && x.vencimento >= hoje);
      const vc = lista.filter((x) => !x.pagoEm && x.vencimento < hoje);
      const pg = lista.filter((x) => x.pagoEm);
      return { c, av: soma(av), vc: soma(vc), pg: soma(pg), total: soma(lista), qtd: lista.length };
    }).filter((r) => r.c !== 'Outros' || r.qtd > 0);
    const tot = resumo.reduce((acc, r) => ({ av: acc.av + r.av, vc: acc.vc + r.vc, pg: acc.pg + r.pg, total: acc.total + r.total, qtd: acc.qtd + r.qtd }), { av: 0, vc: 0, pg: 0, total: 0, qtd: 0 });
    const detalhe = (it) => `${it.forma === 'parcelado' ? `Parcela ${it.numParcela}/${it.parcelas}` : 'À vista'}${it.sub ? ` · ${it.sub}` : ''}`;
    const aba = finTab || (vencidos.length > 0 ? 'vencidos' : 'pagos');
    const lista = aba === 'vencidos' ? vencidos : pagos;
    const kpis = [
      { label: 'Total a pagar', valor: formatCurrency(soma(aVencer) + soma(vencidos)), tone: 'blue', grad: 'linear-gradient(135deg,#1F5AA6,#3B82F6)', icon: <DollarSign size={22} /> },
      { label: 'Total pago', valor: formatCurrency(soma(pagos)), tone: 'green', grad: 'linear-gradient(135deg,#0A8563,#18B389)', icon: <CheckCircle2 size={22} /> },
      { label: 'Total vencido', valor: formatCurrency(soma(vencidos)), tone: 'red', grad: 'linear-gradient(135deg,#C8372D,#EF6A5E)', icon: <b style={{ fontSize: 20 }}>!</b> },
      { label: 'Total de lançamentos', valor: formatNumber(itens.length), tone: 'purple', grad: 'linear-gradient(135deg,#6D3FD1,#8B5CF6)', icon: <Calendar size={22} />, barras: true }
    ];

    return (
      <div className="space-y-5">
        <div className="ef-fin-top">
          <div className="flex items-center gap-3">
            <span className="ef-tile" style={{ background: 'linear-gradient(135deg,#0B2342,#1F5AA6)' }}><BarsGlyph /></span>
            <div>
              <div className="disp" style={{ fontSize: 20, fontWeight: 600, lineHeight: 1.2 }}>Acompanhe seus pagamentos</div>
              <div style={{ fontSize: 13, color: 'var(--mute)' }}>Contas a pagar, vencimentos e baixas em um só lugar</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <label className="ef-period">
              <Calendar size={16} />
              <select aria-label="Período" value={finPeriodo} onChange={(e) => setFinPeriodo(e.target.value)}>
                <option value="todos">Todos os períodos</option>
                {periodos.map((ym) => <option key={ym} value={ym}>{labelPeriodo(ym)}</option>)}
              </select>
            </label>
            <Btn v="primary" className="btn-pill" icon={Plus} onClick={() => setShowContaModal(true)}>Lançar conta a pagar</Btn>
          </div>
        </div>

        <div className="card overflow-hidden ef-rise">
          <div className="ef-cardhead">
            <span className="ef-tile" style={{ background: 'linear-gradient(135deg,#1F5AA6,#3B82F6)' }}><Calendar size={20} /></span>
            <div className="min-w-0 flex-1"><h3>Pagamentos a vencer</h3><p>A partir de hoje. Os que vencem hoje aparecem com o alerta piscando.</p></div>
            <Chip tone="teal">{aVencer.length} pagamento(s) · {formatCurrency(soma(aVencer))}</Chip>
          </div>
          {aVencer.length === 0 ? (
            <Empty icon={CheckCircle2} title="Nenhum pagamento a vencer" text="Os lançamentos novos entram aqui com vencimento na data do lançamento; use Editar para parcelar ou mudar o vencimento." />
          ) : (
            <div className="overflow-x-auto" style={{ padding: '10px 10px 12px' }}>
              <table className="tbl ef-pillhead">
                <thead><tr><th style={{ width: 36 }}></th><th>Tipo</th><th>Descrição</th><th className="ef-tr">Valor</th><th>Vencimento</th><th>Forma de pagamento</th><th className="ef-tc">Quantidade de parcelas</th><th className="ef-tr">Ações</th></tr></thead>
                <tbody>
                  {aVencer.map((it) => {
                    const dias = daysBetween(hoje, it.vencimento);
                    return (
                      <tr key={it.key} style={it.vencimento === hoje ? { background: 'rgba(242,176,30,.12)' } : undefined}>
                        <td style={{ width: 36, paddingRight: 0 }}>{it.vencimento === hoje && <span className="ef-blink" title="Vence hoje" aria-label="Vence hoje"><AlertTriangle size={20} /></span>}</td>
                        <td><span className="flex items-center gap-2"><TipoTile tipo={it.tipo} /><span className="font-semibold">{it.tipo}</span></span></td>
                        <td style={{ maxWidth: 340 }}><div className="font-semibold">{it.descricao}</div>{it.sub && <div style={{ fontSize: 12, color: 'var(--blue-ink)' }}>{it.sub}</div>}</td>
                        <td className="mono text-right font-bold">{formatCurrency(it.valor)}{it.forma === 'parcelado' && <div style={{ fontSize: 11.5, fontWeight: 400, color: 'var(--mute)' }}>Total {formatCurrency(it.total)}</div>}</td>
                        <td className="mono">{formatDateBR(it.vencimento)}<div className="ef-sans" style={{ fontSize: 11.5, color: 'var(--mute)' }}>{dias === 0 ? 'Hoje' : dias === 1 ? 'Amanhã' : `em ${dias} dias`}</div></td>
                        <td>{it.forma === 'parcelado' ? 'Parcelado' : 'À vista'}</td>
                        <td className="mono ef-tc">{it.forma === 'parcelado' ? `${it.numParcela} de ${it.parcelas}` : '—'}</td>
                        <td className="text-right whitespace-nowrap ef-sx15"><Btn sm v="primary" className="btn-pill" onClick={() => payItem(it)}>Dar baixa</Btn><Btn sm className="btn-pill btn-oblue" onClick={() => editItem(it)}>Editar</Btn>{it.origem === 'conta' && <Btn sm className="btn-pill ef-del" onClick={() => handleDeleteConta(it.origemId)}>Excluir</Btn>}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="ef-g-fin">
          <div className="card overflow-hidden ef-rise" style={{ animationDelay: '60ms' }}>
            <div className="ef-band">
              <span className="ef-tile ef-tile-glass"><PieGlyph /></span>
              <div className="min-w-0"><h3>Resumo por categoria</h3><p>Valores em R$ por situação do pagamento</p></div>
              <svg className="ef-wave" viewBox="0 0 300 100" preserveAspectRatio="none" aria-hidden="true"><path d="M0 100C70 30 130 96 196 46S280 8 300 0V100Z" fill="rgba(255,255,255,.10)" /></svg>
            </div>
            <div className="ef-band-body overflow-x-auto">
              <table className="tbl ef-compact ef-pillhead">
                <thead><tr><th>Categoria</th><th className="ef-tr">A vencer</th><th className="ef-tr">Vencido</th><th className="ef-tr">Pago</th><th className="ef-tr">Total</th></tr></thead>
                <tbody>
                  {resumo.map((r) => (
                    <tr key={r.c}>
                      <td><span className="flex items-center gap-2"><TipoTile tipo={r.c} /><span><span className="font-semibold">{r.c}</span><div className="ef-sans" style={{ fontSize: 11.5, color: 'var(--mute)' }}>{r.qtd} pagamento(s)</div></span></span></td>
                      <td className="mono text-right">{cel(r.av)}</td>
                      <td className="mono text-right" style={{ color: r.vc > 0 ? 'var(--red)' : undefined, fontWeight: r.vc > 0 ? 700 : undefined }}>{cel(r.vc)}</td>
                      <td className="mono text-right" style={{ color: r.pg > 0 ? 'var(--teal)' : undefined, fontWeight: r.pg > 0 ? 700 : undefined }}>{cel(r.pg)}</td>
                      <td className="mono text-right font-bold">{cel(r.total)}</td>
                    </tr>
                  ))}
                  <tr className="ef-total">
                    <td><span className="flex items-center gap-2"><span className="ef-circle" style={{ background: 'linear-gradient(135deg,#0B2342,#1F5AA6)', width: 36, height: 36 }}>Σ</span><span><span className="font-bold">Total geral</span><div className="ef-sans" style={{ fontSize: 11.5, color: 'var(--mute)' }}>{tot.qtd} pagamento(s)</div></span></span></td>
                    <td className="mono text-right font-bold">{cel(tot.av)}</td>
                    <td className="mono text-right font-bold" style={{ color: tot.vc > 0 ? 'var(--red)' : undefined }}>{cel(tot.vc)}</td>
                    <td className="mono text-right font-bold">{cel(tot.pg)}</td>
                    <td className="mono text-right font-bold">{cel(tot.total)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="card overflow-hidden ef-rise" style={{ animationDelay: '120ms' }}>
            <div className="ef-cardhead" style={{ borderBottom: 0 }}>
              <span className="ef-tile" style={{ background: 'linear-gradient(135deg,#1F5AA6,#3B82F6)' }}><Bell size={20} /></span>
              <div className="min-w-0 flex-1"><h3>Avisos de pagamento</h3><p>Vencidos e pagos, separados e ordenados por data</p></div>
              <Btn className="btn-pill btn-oblue" onClick={() => setFinExpand(!finExpand)}>{finExpand ? 'Ver menos' : 'Ver todos'}<ChevronRight size={14} /></Btn>
            </div>
            <div className="ef-seltiles">
              <button type="button" aria-pressed={aba === 'vencidos'} className={cx('ef-seltile ef-seltile-red', aba === 'vencidos' && 'on')} onClick={() => setFinTab('vencidos')}>
                <span className="ef-circle" style={{ background: 'var(--red)' }}>!</span>
                <span className="ef-seltile-txt"><b style={{ color: 'var(--red-ink)' }}>Vencidos</b><span>{vencidos.length} pagamento(s)</span></span>
                <span className="ef-seltile-val mono" style={{ color: 'var(--red)' }}>{formatCurrency(soma(vencidos))}</span>
              </button>
              <button type="button" aria-pressed={aba === 'pagos'} className={cx('ef-seltile ef-seltile-green', aba === 'pagos' && 'on')} onClick={() => setFinTab('pagos')}>
                <span className="ef-circle" style={{ background: 'var(--brand)' }}><CheckCircle2 size={20} /></span>
                <span className="ef-seltile-txt"><b style={{ color: 'var(--teal-ink)' }}>Pagos</b><span>{pagos.length} pagamento(s)</span></span>
                <span className="ef-seltile-val mono" style={{ color: 'var(--teal)' }}>{formatCurrency(soma(pagos))}</span>
              </button>
            </div>
            {lista.length === 0 ? (
              <div className="px-5 py-4" style={{ color: 'var(--mute)' }}>{aba === 'vencidos' ? 'Nenhum pagamento vencido.' : 'Nenhum pagamento baixado ainda.'}</div>
            ) : (
              <div className="ef-fin-wrap" style={{ margin: '8px 10px 12px', maxHeight: finExpand ? 'none' : 262 }}>
                <table className="tbl ef-fin ef-pillhead">
                  <colgroup><col /><col style={{ width: 108 }} /><col style={{ width: 104 }} /><col style={{ width: 172 }} /></colgroup>
                  <thead><tr><th>Descrição</th><th>{aba === 'vencidos' ? 'Vencimento' : 'Pago em'}</th><th className="ef-tr">Valor</th><th className="ef-tr">Ações</th></tr></thead>
                  <tbody>
                    {lista.map((it) => (
                      <tr key={it.key}>
                        <td>
                          <span className="flex items-center gap-2" style={{ minWidth: 0 }}>
                            <TipoTile tipo={it.tipo} size={38} />
                            <span style={{ minWidth: 0, flex: 1 }}>
                              <span className="ef-ell font-semibold" title={it.descricao}>{it.descricao}</span>
                              <span className="ef-ell" style={{ fontSize: 12, color: 'var(--blue-ink)' }} title={`${it.tipo} · ${detalhe(it)}`}>{it.tipo} · {detalhe(it)}</span>
                            </span>
                          </span>
                        </td>
                        {aba === 'vencidos' ? (
                          <td className="mono">{formatDateBR(it.vencimento)}<div className="ef-sans" style={{ fontSize: 11.5, color: 'var(--red)' }}>{(() => { const n = daysBetween(it.vencimento, hoje); return `há ${n} dia${n === 1 ? '' : 's'}`; })()}</div></td>
                        ) : (
                          <td className="mono">{formatDateBR(it.pagoEm)}<div className="ef-sans" style={{ fontSize: 11.5, color: 'var(--mute)' }}>venc. {formatDateShort(it.vencimento)}</div></td>
                        )}
                        <td className="mono text-right font-bold">{formatCurrency(it.valor)}</td>
                        <td className="text-right whitespace-nowrap ef-sx15">
                          {aba === 'vencidos' ? (
                            <>
                              <Btn sm v="primary" className="btn-pill" onClick={() => payItem(it)}>Dar baixa</Btn>
                              <Btn sm icon={Pencil} className="btn-pill" style={{ padding: '5px 8px' }} title="Editar" aria-label="Editar" onClick={() => editItem(it)} />
                              {it.origem === 'conta' && <Btn sm icon={Trash2} className="btn-pill ef-del" style={{ padding: '5px 8px' }} title="Excluir" aria-label="Excluir" onClick={() => handleDeleteConta(it.origemId)} />}
                            </>
                          ) : (
                            <Btn sm className="btn-pill btn-oblue" onClick={() => undoPayItem(it)}>Desfazer</Btn>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="ef-g-kpi">
          {kpis.map((k) => (
            <div key={k.label} className="ef-kpi2" data-tone={k.tone}>
              <span className="ef-tile" style={{ background: k.grad }}>{k.icon}</span>
              <div>
                <div style={{ fontSize: 14, color: 'var(--ink2)' }}>{k.label}</div>
                <div className="disp" style={{ fontSize: 26, fontWeight: 600, lineHeight: 1.15 }}>{k.valor}</div>
              </div>
              {k.barras ? <SparkBars /> : <Spark />}
            </div>
          ))}
        </div>
      </div>
    );
  };

  const renderVehicles = () => (
    <div className="card overflow-hidden">
      <SectionHead title="Frota de veículos" sub="Cavalos mecânicos, caminhões e utilitários cadastrados">
        <Btn v="primary" icon={Plus} onClick={() => setShowVehicleModal(true)}>Cadastrar veículo</Btn>
      </SectionHead>
      {vehicles.length === 0 ? <Empty icon={Truck} title="Nenhum veículo cadastrado" text="Cadastre o primeiro veículo para montar pneus no chassi." /> : (
        <div className="overflow-x-auto">
          <table className="tbl">
            <thead><tr><th>Placa</th><th>Categoria</th><th>Modelo</th><th className="ef-tc">Eixos</th><th className="ef-tc">Pneus montados</th><th className="ef-tr">Hodômetro</th><th className="ef-tr">Despesas</th><th className="ef-tr">Ações</th></tr></thead>
            <tbody>
              {vehicles.map((v) => {
                const mounted = tires.filter((t) => t.veiculoAtualId === v.id).length;
                const cost = maintenances.filter((m) => m.veiculoId === v.id).reduce((s, m) => s + Number(m.valor || 0), 0)
                  + fines.filter((f) => f.veiculoId === v.id).reduce((s, f) => s + Number(f.valor || 0), 0);
                return (
                  <tr key={v.id}>
                    <td><Plate v={v} /></td>
                    <td className="font-medium">{v.categoria}</td>
                    <td style={{ color: 'var(--ink2)' }}>{v.modelo}</td>
                    <td className="mono text-center font-semibold">{v.eixos}</td>
                    <td className="text-center"><Chip tone="teal"><Disc size={13} />{mounted} pneus</Chip></td>
                    <td className="mono text-right">{formatNumber(v.kmAtual)} km</td>
                    <td className="mono text-right font-bold">{formatCurrency(cost)}</td>
                    <td className="text-right whitespace-nowrap ef-sx15"><Btn sm onClick={() => setDetailVehicleId(v.id)}>Detalhes</Btn><Btn sm v="soft" onClick={() => goChassis(v.id)}>Ver no chassi <ChevronRight size={14} /></Btn></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );

  const TireChip = ({ t, selected }) => {
    const st = getTireRecapStyle(t.recapagens);
    return (
      <div tabIndex={0} draggable className={cx('tire', selected && 'tire-sel')} style={{ backgroundColor: st.c }}
        onDragStart={() => { setDraggedTireId(t.id); setSelectedTireForActionId(t.id); }}
        onDragEnd={() => setDraggedTireId(null)}
        onClick={() => setSelectedTireForActionId((p) => (p === t.id ? null : t.id))}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setSelectedTireForActionId((p) => (p === t.id ? null : t.id))}
        title={`Fogo #${t.fogo} | ${t.marca} | ${st.label} | KM: ${formatNumber(t.kmTotal)}`}>
        <b className="mono ef-t12_5 leading-none">{t.fogo}</b>
        <span className="ef-t9_5 opacity-80 leading-none mt-1">{formatNumber(t.kmTotal)} km</span>
      </div>
    );
  };

  const renderPneusHub = () => {
    const activeVehicle = vehicles.find((v) => v.id === selectedChassisVehicleId) || vehicles[0];
    const layout = activeVehicle ? getVehicleChassisSlots(activeVehicle.eixos) : null;
    const mounted = activeVehicle ? tires.filter((t) => t.veiculoAtualId === activeVehicle.id) : [];
    const unmounted = tires.filter((t) => {
      if (t.veiculoAtualId || t.classificacao === 'Sucatear') return false;
      const q = chassisTireSearch.trim().toLowerCase();
      if (!q) return true;
      if (chassisFilterBy === 'fogo') return t.fogo.toLowerCase().includes(q);
      if (chassisFilterBy === 'marca') return t.marca.toLowerCase().includes(q);
      return t.medida.toLowerCase().includes(q);
    });
    const sel = tires.find((t) => t.id === selectedTireForActionId) || null;
    const armed = !!sel || !!draggedTireId;
    const dropTire = () => (draggedTireId ? tires.find((t) => t.id === draggedTireId) : null);

    const renderSlot = (slot) => {
      const mt = mounted.find((t) => t.posicaoAtual === slot.code);
      if (mt) return <TireChip key={slot.code} t={mt} selected={selectedTireForActionId === mt.id} />;
      return (
        <div key={slot.code} className={cx('slot', armed && 'slot-armed')} title={`Posição vaga: ${slot.label}`}
          onDragOver={(e) => e.preventDefault()}
          onDrop={() => { const d = dropTire(); if (d && activeVehicle) openTireOperationModal(d, 'Mount', activeVehicle.id, slot.code); }}
          onClick={() => { if (sel && activeVehicle) openTireOperationModal(sel, 'Mount', activeVehicle.id, slot.code); }}>
          <span className="mono">{slot.code}</span>
        </div>
      );
    };

    const tabs = [
      ['chassis', ArrowRightLeft, 'Movimentação no chassi'],
      ['stock', Package, `Estoque (${totalStockTires.length})`],
      ['all', Disc, `Todos os pneus (${tires.length})`]
    ];

    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="seg" role="tablist">
            {tabs.map(([id, Icon, label]) => (
              <button key={id} role="tab" aria-selected={tireHubSubTab === id} className={tireHubSubTab === id ? 'on' : ''} onClick={() => setTireHubSubTab(id)}><Icon size={15} />{label}</button>
            ))}
          </div>
          <Btn v="primary" icon={Plus} onClick={() => setShowTireModal(true)}>Novo pneu</Btn>
        </div>

        {tireHubSubTab === 'chassis' && (!activeVehicle || !layout ? (
          <div className="card"><Empty icon={Truck} title="Cadastre um veículo" text="O chassi aparece quando houver ao menos um veículo na frota." /></div>
        ) : (
          <div className="card ef-rise">
            <div className="p-5 space-y-4" style={{ borderBottom: '1px solid var(--line)' }}>
              <div className="flex flex-wrap items-end gap-3">
                <div className="w-40"><Field label="Buscar equipamento">
                  <div className="relative"><input className="inp ef-pr8" placeholder="Placa..." value={chassisEquipSearch} onChange={(e) => setChassisEquipSearch(e.target.value)} /><Search size={15} className="absolute right-3 top-3" style={{ color: 'var(--mute)' }} /></div>
                </Field></div>
                <div className="flex-1" style={{ minWidth: 260, maxWidth: 448 }}><Field label="Equipamento">
                  <select className="inp font-semibold" value={activeVehicle.id} onChange={(e) => { setSelectedChassisVehicleId(e.target.value); setSelectedTireForActionId(null); }}>
                    {vehicles.filter((v) => !chassisEquipSearch.trim() || v.placa.toLowerCase().includes(chassisEquipSearch.toLowerCase()) || v.categoria.toLowerCase().includes(chassisEquipSearch.toLowerCase()))
                      .map((v) => <option key={v.id} value={v.id}>{v.categoria} - {v.placa}/{v.uf || 'MG'}</option>)}
                  </select>
                </Field></div>
              </div>
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div className="flex flex-wrap items-end gap-3">
                  <div className="w-56"><Field label="Pneu em estoque"><input className="inp" placeholder="Nº fogo ou marca..." value={chassisTireSearch} onChange={(e) => setChassisTireSearch(e.target.value)} /></Field></div>
                  <div className="w-40"><Field label="Filtrar por">
                    <select className="inp" value={chassisFilterBy} onChange={(e) => setChassisFilterBy(e.target.value)}>
                      <option value="fogo">Marca fogo</option><option value="marca">Marca / modelo</option><option value="medida">Medida</option>
                    </select>
                  </Field></div>
                </div>
                <div className="flex items-center gap-2">
                  {['Sucatear', 'Estocar', 'Recapar'].map((a) => (
                    <button key={a} className={cx('btn btn-sm', sel ? (a === 'Sucatear' ? 'btn-danger' : 'btn-dark') : 'btn-ghost')}
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => { const d = dropTire(); if (d) openTireOperationModal(d, a); }}
                      onClick={() => { if (!sel) { showToast('Selecione ou arraste um pneu primeiro!', 'error'); return; } openTireOperationModal(sel, a); }}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-5 py-3 flex flex-wrap items-center justify-between gap-2 ef-t13" style={{ background: 'var(--card2)', borderBottom: '1px solid var(--line)', color: 'var(--ink2)' }}>
              <span>Clique ou arraste um pneu para trocar de posição, <b>estocar</b>, <b>recapar</b> ou <b>sucatear</b>.</span>
              {sel && (
                <div className="flex items-center gap-2 ef-fade">
                  <Chip tone="teal">Fogo #{sel.fogo} · {formatNumber(sel.kmTotal)} km</Chip>
                  <Btn sm v="dark" icon={Plus} onClick={() => openTireOperationModal(sel, 'AddKm')}>Somar KM</Btn>
                </div>
              )}
            </div>

            <div className="p-5 ef-g-chassis">
              <div className="overflow-x-auto flex justify-center py-4">
                <div className="flex items-center" style={{ minWidth: 540 }}>
                  <div className="w-3 h-28 rounded-sm" style={{ background: 'var(--axle)' }} />
                  <div className="w-5 h-2" style={{ background: 'var(--rail)' }} />
                  <div className="z-10">{renderSlot(layout.spareSlot)}</div>
                  <div className="w-7 ef-h2_5" style={{ background: 'var(--rail)' }} />
                  <div className="relative flex items-center gap-8">
                    <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 ef-h2_5 rounded-full" style={{ background: 'var(--rail)' }} />
                    {[...layout.axles].reverse().map((ax) => (
                      <div key={ax.axleNumber} className="relative z-10 flex flex-col items-center">
                        <div className="flex flex-col ef-gap1_5 mb-3">{ax.leftSlots.map(renderSlot)}</div>
                        <div className="ef-w1_5 h-10 rounded-full" style={{ background: 'var(--axle)' }} />
                        <div className="flex flex-col ef-gap1_5 mt-3">{ax.rightSlots.map(renderSlot)}</div>
                        <span className="mt-2 ef-t11 font-semibold" style={{ color: 'var(--mute)' }}>{ax.axleNumber}º eixo</span>
                      </div>
                    ))}
                  </div>
                  <div className="w-7 ef-h2_5" style={{ background: 'var(--rail)' }} />
                  <div className="w-10 h-28 rounded-r-2xl" style={{ background: 'var(--axle)' }} title="Cabine" />
                </div>
              </div>

              <div className="ef-chassis-side">
                <div className="flex items-center justify-between mb-1"><span className="font-semibold">Pneus em estoque</span><Chip tone="gray">{unmounted.length}</Chip></div>
                <p className="ef-t12_5 mb-3" style={{ color: 'var(--mute)' }}>Arraste para uma posição vaga do chassi.</p>
                <div className="flex flex-wrap ef-gap2_5 max-h-56 overflow-y-auto p-1">
                  {unmounted.length === 0 && <span className="ef-t13" style={{ color: 'var(--mute)' }}>Nenhum pneu encontrado.</span>}
                  {unmounted.map((t) => <TireChip key={t.id} t={t} selected={selectedTireForActionId === t.id} />)}
                </div>
              </div>
            </div>

            <div className="px-5 pb-5 space-y-4">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-2 ef-t12_5" style={{ color: 'var(--ink2)' }}>
                {[0, 1, 2, 3, 4].map((n) => { const s = getTireRecapStyle(n); return <span key={n} className="flex items-center gap-2"><i className="ef-w3_5 ef-h3_5 rounded inline-block" style={{ background: s.c }} />{s.label}</span>; })}
              </div>
              <div className="drop p-4 flex flex-wrap items-center justify-between gap-2 cursor-pointer"
                onDragOver={(e) => e.preventDefault()}
                onDrop={() => { const d = dropTire(); if (d) openTireOperationModal(d, 'Estocar'); }}
                onClick={() => { if (sel && sel.veiculoAtualId) openTireOperationModal(sel, 'Estocar'); }}>
                <span className="ef-t13"><b>Solte aqui para reservar.</b> Arraste um pneu do chassi para enviá-lo ao almoxarifado.</span>
                <span className="ef-t13 font-semibold" style={{ color: 'var(--teal)' }}>Enviar ao almoxarifado</span>
              </div>
            </div>
          </div>
        ))}

        {tireHubSubTab === 'stock' && (
          <div className="card overflow-hidden ef-rise">
            <SectionHead title="Pneus em estoque" sub="Disponíveis no almoxarifado, fora dos veículos"><Chip tone="teal">{totalStockTires.length} pneus</Chip></SectionHead>
            {totalStockTires.length === 0 ? <Empty icon={Package} title="Estoque vazio" text="Cadastre um pneu ou envie um pneu do chassi ao almoxarifado." /> : (
              <div className="overflow-x-auto">
                <table className="tbl">
                  <thead><tr><th>Nº fogo</th><th>Marca / medida</th><th>Ciclo</th><th className="ef-tc">Sulco</th><th>Local</th><th className="ef-tr">KM</th><th className="ef-tc">Histórico</th><th className="ef-tr">Ações</th></tr></thead>
                  <tbody>
                    {totalStockTires.map((t) => {
                      const st = getTireRecapStyle(t.recapagens);
                      return (
                        <tr key={t.id}>
                          <td><span className="mono ef-t12 font-bold text-white ef-px2_5 py-1 rounded-md" style={{ background: st.c }}>#{t.fogo}</span></td>
                          <td><div className="font-semibold">{t.marca}</div><div className="mono ef-t12" style={{ color: 'var(--mute)' }}>{t.medida}</div></td>
                          <td className="ef-t13">{st.label}</td>
                          <td className="mono text-center">{t.sulcoMm} mm</td>
                          <td className="mono ef-t12_5">{t.localEstoque || 'Almoxarifado'}</td>
                          <td className="mono text-right font-bold">{formatNumber(t.kmTotal)} km</td>
                          <td className="text-center"><button onClick={() => setHistoryModalTire(t)} className="font-semibold ef-hu" style={{ color: 'var(--teal)' }}>{(t.historicoVeiculos || []).length} veículos</button></td>
                          <td className="text-right whitespace-nowrap ef-sx15">
                            <Btn sm v="primary" onClick={() => { setSelectedTireForActionId(t.id); setTireHubSubTab('chassis'); }}>Montar</Btn>
                            <Btn sm onClick={() => openTireOperationModal(t, 'Recapar')}>Recapar</Btn>
                            <Btn sm onClick={() => openTireOperationModal(t, 'Sucatear')}>Sucatear</Btn>
                            <Btn sm onClick={() => startEditTire(t)}>Editar</Btn>
                            <Btn sm className="ef-del" onClick={() => handleDeleteTire(t)}>Excluir</Btn>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {tireHubSubTab === 'all' && (
          <div className="card overflow-hidden ef-rise">
            <SectionHead title="Controle geral de pneus" sub="Todos os pneus, com a soma de KM em diferentes veículos" />
            <div className="overflow-x-auto">
              <table className="tbl">
                <thead><tr><th>Nº fogo</th><th>Marca / medida</th><th>Status</th><th>Veículo / posição</th><th style={{ minWidth: 190 }}>KM acumulado</th><th className="ef-tc">Histórico</th><th className="ef-tr">Ações</th></tr></thead>
                <tbody>
                  {tires.map((t) => {
                    const veh = vehicles.find((v) => v.id === t.veiculoAtualId);
                    const st = getTireRecapStyle(t.recapagens);
                    const r = company.regrasPneus;
                    const lim = getTireLimits(t, company);
                    const pct = Math.min(100, ((Number(t.kmTotal) || 0) / (lim.kmSucatear || 1)) * 100);
                    const barC = t.kmTotal >= lim.kmSucatear ? 'var(--red)' : t.kmTotal >= lim.kmRecapar ? 'var(--amber)' : 'var(--teal)';
                    return (
                      <tr key={t.id}>
                        <td><span className="mono ef-t12 font-bold text-white ef-px2_5 py-1 rounded-md" style={{ background: st.c }}>#{t.fogo}</span></td>
                        <td><div className="font-semibold">{t.marca}</div><div className="mono ef-t12" style={{ color: 'var(--mute)' }}>{t.medida}</div></td>
                        <td><Chip tone={t.classificacao === 'Sucatear' ? 'red' : t.classificacao === 'Recapar' ? 'amber' : t.classificacao === 'Rodando' ? 'teal' : 'gray'}>{t.classificacao}</Chip></td>
                        <td className="mono ef-t12_5">{veh ? `${veh.placa} (${t.posicaoAtual})` : t.localEstoque || 'Estoque'}</td>
                        <td>
                          <div className="mono font-bold ef-t13">{formatNumber(t.kmTotal)} km</div>
                          <div className="ef-h1_5 rounded-full ef-mt1_5 overflow-hidden" style={{ background: 'var(--line2)' }}><div className="h-full rounded-full" style={{ width: `${pct}%`, background: barC, transition: 'width .6s cubic-bezier(.2,.7,.2,1)' }} /></div>
                        </td>
                        <td className="text-center"><Btn sm icon={History} onClick={() => setHistoryModalTire(t)}>{(t.historicoVeiculos || []).length} veículos</Btn></td>
                        <td className="text-right whitespace-nowrap ef-sx15">
                          <Btn sm v="dark" onClick={() => openTireOperationModal(t, 'AddKm')}>+ KM</Btn>
                          <Btn sm onClick={() => openTireOperationModal(t, 'Estocar')}>Estocar</Btn>
                          <Btn sm onClick={() => openTireOperationModal(t, 'Recapar')}>Recapar</Btn>
                          <Btn sm onClick={() => openTireOperationModal(t, 'Sucatear')}>Sucatear</Btn>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderDespesasHub = () => (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="seg" role="tablist">
          <button role="tab" className={expenseSubTab === 'maintenances' ? 'on' : ''} onClick={() => setExpenseSubTab('maintenances')}><Wrench size={15} />Manutenções ({maintenances.length}) · {formatCurrency(totalMaintenanceCost)}</button>
          <button role="tab" className={expenseSubTab === 'fines' ? 'on' : ''} onClick={() => setExpenseSubTab('fines')}><FileWarning size={15} />Multas ({fines.length}) · {formatCurrency(totalFinesCost)}</button>
        </div>
        <div className="flex items-center gap-2">
          <Btn v="dark" icon={Plus} onClick={() => setShowMaintenanceModal(true)}>Lançar manutenção</Btn>
          <Btn v="danger" icon={Plus} onClick={() => setShowFineModal(true)}>Lançar multa</Btn>
        </div>
      </div>

      <div className="card overflow-hidden ef-rise" key={expenseSubTab}>
        {expenseSubTab === 'maintenances' ? (maintenances.length === 0
          ? <Empty icon={Wrench} title="Nenhuma manutenção lançada" text="Registre a primeira ordem de serviço da frota." />
          : <div className="overflow-x-auto"><table className="tbl">
            <thead><tr><th>O.S. / data</th><th>Veículo</th><th>Tipo</th><th className="ef-tr">KM</th><th>Descrição</th><th>Oficina</th><th className="ef-tr">Valor</th><th className="ef-tr">Ações</th></tr></thead>
            <tbody>{maintenances.map((m) => {
              const veh = vehicles.find((v) => v.id === m.veiculoId);
              return (<tr key={m.id}>
                <td><div className="mono font-bold">{m.osNumero}</div><div className="ef-t12" style={{ color: 'var(--mute)' }}>{m.data}</div></td>
                <td>{veh ? <Plate v={veh} /> : 'N/A'}</td>
                <td><Chip tone={m.tipo === 'Corretiva' ? 'red' : m.tipo === 'Preventiva' ? 'teal' : 'amber'}>{m.tipo}</Chip>{m.categoria && <div className="ef-t12 mt-1" style={{ color: 'var(--mute)' }}>{m.categoria}{m.peca ? ` · ${m.peca}` : ''}</div>}</td>
                <td className="mono text-right">{m.km !== null && m.km !== undefined && m.km !== '' ? `${formatNumber(m.km)} km` : '—'}</td>
                <td style={{ maxWidth: 320 }}>{m.descricao}</td>
                <td style={{ color: 'var(--ink2)' }}>{m.fornecedor}</td>
                <td className="mono text-right font-bold">{formatCurrency(m.valor)}</td>
                <td className="text-right whitespace-nowrap ef-sx15"><Btn sm onClick={() => startEditMaint(m)}>Editar</Btn><Btn sm className="ef-del" onClick={() => handleDeleteMaintenance(m)}>Excluir</Btn></td>
              </tr>);
            })}</tbody></table></div>
        ) : (fines.length === 0
          ? <Empty icon={FileWarning} title="Nenhuma multa lançada" text="As multas lançadas entram automaticamente nas despesas do veículo." />
          : <div className="overflow-x-auto"><table className="tbl">
            <thead><tr><th>AIT / data</th><th>Veículo</th><th>Infração</th><th>Motorista</th><th className="ef-tc">Status</th><th className="ef-tr">Valor</th><th className="ef-tr">Ações</th></tr></thead>
            <tbody>{fines.map((f) => {
              const veh = vehicles.find((v) => v.id === f.veiculoId);
              return (<tr key={f.id}>
                <td><div className="mono font-bold">{f.ait}</div><div className="ef-t12" style={{ color: 'var(--mute)' }}>{f.data} · {f.pontos} pts</div></td>
                <td>{veh ? <Plate v={veh} /> : 'N/A'}</td>
                <td style={{ maxWidth: 320 }}>{f.motivo}</td>
                <td>{f.identificado === false ? <Chip tone="red">Não identificado (NIC)</Chip> : f.motorista}</td>
                <td className="text-center"><Chip tone={FINE_TONE[f.status] || 'gray'}>{f.status}</Chip></td>
                <td className="mono text-right font-bold" style={{ color: 'var(--red)' }}>{formatCurrency(f.valor)}{f.identificado === false && <div className="ef-t11_5 font-normal" style={{ color: 'var(--mute)' }}>{formatCurrency(f.valorOriginal)} + NIC {formatCurrency(f.valorNIC)}</div>}</td>
              <td className="text-right whitespace-nowrap ef-sx15"><Btn sm onClick={() => startEditFine(f)}>Editar</Btn><Btn sm className="ef-del" onClick={() => handleDeleteFine(f)}>Excluir</Btn></td>
              </tr>);
            })}</tbody></table></div>
        )}
      </div>
    </div>
  );

  const renderSettings = () => {
    const r = company.regrasPneus;
    const setRule = (k, v) => setCompany({ ...company, regrasPneus: { ...r, [k]: Number(v) || 0 } });
    return (
      <div className="space-y-5">
      <div className="ef-g-2">
        <div className="card p-6 space-y-5 ef-rise">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--teal-soft)', color: 'var(--teal)' }}><Database size={20} /></div>
            <div><h3 className="ef-t16 font-semibold">Backup e restauração</h3><p className="ef-t12_5" style={{ color: 'var(--mute)' }}>Salve ou restaure todos os dados ao trocar de computador, via Pen Drive.</p></div>
          </div>
          <Btn v="dark" icon={Download} className="w-full ef-py3" onClick={handleExportBackup}>Baixar arquivo de backup</Btn>
          <label className="btn btn-primary w-full ef-py3 cursor-pointer"><Upload size={16} />Restaurar arquivo de backup (.json)
            <input type="file" accept=".json" onChange={handleImportBackup} className="hidden" /></label>
          {snapshotAt && <Btn icon={History} className="w-full" onClick={handleUndoImport}>Desfazer última restauração ({new Date(snapshotAt).toLocaleString('pt-BR')})</Btn>}
          <div className="ef-t12_5" style={{ color: 'var(--mute)' }}>Sistema v{APP_VERSION} · estrutura de dados {SCHEMA_VERSION}. Os backups de versões anteriores são atualizados automaticamente ao restaurar.</div>
        </div>

        <div className="card p-6 space-y-4 ef-rise" style={{ animationDelay: '70ms' }}>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: 'var(--soft)', color: 'var(--ink)' }}><Settings size={20} /></div>
            <div><h3 className="ef-t16 font-semibold">Empresa e alertas de pneus</h3><p className="ef-t12_5" style={{ color: 'var(--mute)' }}>Identidade do sistema e limites de KM para cada ação.</p></div>
          </div>
          <Field label="Nome da empresa"><input className="inp" value={company.nomeEmpresa} onChange={(e) => setCompany({ ...company, nomeEmpresa: e.target.value })} /></Field>
          <Field label="CNPJ"><input className="inp mono" value={company.cnpj || ''} onChange={(e) => setCompany({ ...company, cnpj: e.target.value })} /></Field>
          <Field label="Logo personalizada (opcional, substitui a FrotaWise no menu)"><input type="file" accept="image/*" onChange={handleLogoUpload} className="block w-full ef-t13" style={{ color: 'var(--ink2)' }} /></Field>
          {company.logoUrl && <Btn sm onClick={() => { setCompany((p) => ({ ...p, logoUrl: '' })); showToast('Logo FrotaWise restaurada.'); }}>Usar a logo FrotaWise</Btn>}
          <div className="grid grid-cols-3 gap-3">
            <Field label="KM para estocar"><input type="number" className="inp mono" value={r.kmEstocar} onChange={(e) => setRule('kmEstocar', e.target.value)} /></Field>
            <Field label="KM para recapar"><input type="number" className="inp mono" value={r.kmRecapar} onChange={(e) => setRule('kmRecapar', e.target.value)} /></Field>
            <Field label="KM para sucatear"><input type="number" className="inp mono" value={r.kmSucatear} onChange={(e) => setRule('kmSucatear', e.target.value)} /></Field>
          </div>
        </div>
      </div>

      <div className="card ef-rise" style={{ animationDelay: '140ms' }}>
        <SectionHead title="Regras de pneus por modelo" sub="Defina a quilometragem de cada aviso do painel por modelo/marca e tamanho. Pneus sem regra usam os limites gerais acima." />
        <datalist id="ef-marcas-tires">{[...new Set(tires.map((t) => t.marca))].map((m) => <option key={m} value={m} />)}</datalist>
        <datalist id="ef-medidas-tires">{[...new Set(tires.map((t) => t.medida))].map((m) => <option key={m} value={m} />)}</datalist>
        <form onSubmit={handleSaveRule} className="p-5 space-y-3">
          <div className="ef-g-rule">
            <Field label="Modelo/Marca"><input required list="ef-marcas-tires" className="inp" placeholder="Ex: Michelin X Multi Z" value={ruleForm.marca} onChange={(e) => setRuleForm({ ...ruleForm, marca: e.target.value })} /></Field>
            <Field label="Tamanho"><input list="ef-medidas-tires" className="inp mono" placeholder="Ex: 295/80 R22.5" value={ruleForm.medida} onChange={(e) => setRuleForm({ ...ruleForm, medida: e.target.value })} /></Field>
            <Field label="1ª Recapagem (km)"><input type="number" min="0" className="inp mono" value={ruleForm.km1} onChange={(e) => setRuleForm({ ...ruleForm, km1: e.target.value })} /></Field>
            <Field label="2ª Recapagem (km)"><input type="number" min="0" className="inp mono" value={ruleForm.km2} onChange={(e) => setRuleForm({ ...ruleForm, km2: e.target.value })} /></Field>
            <Field label="3ª Recapagem (km)"><input type="number" min="0" className="inp mono" value={ruleForm.km3} onChange={(e) => setRuleForm({ ...ruleForm, km3: e.target.value })} /></Field>
            <Field label="Sucata (km)"><input type="number" min="0" className="inp mono" value={ruleForm.kmSucata} onChange={(e) => setRuleForm({ ...ruleForm, kmSucata: e.target.value })} /></Field>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="ef-t12_5" style={{ color: 'var(--mute)' }}>Use o KM total acumulado do pneu (soma de todas as vidas). Deixe o tamanho em branco para valer para qualquer medida.</span>
            <div className="flex gap-2">
              {editingRuleId && <Btn type="button" onClick={() => { setEditingRuleId(null); setRuleForm(emptyRule); }}>Cancelar edição</Btn>}
              <Btn type="submit" v="primary" icon={editingRuleId ? CheckCircle2 : Plus}>{editingRuleId ? 'Salvar alterações' : 'Adicionar regra'}</Btn>
            </div>
          </div>
        </form>
        {(company.regrasModelos || []).length === 0 ? (
          <div style={{ borderTop: '1px solid var(--line)' }}><Empty icon={Settings} title="Nenhuma regra por modelo" text="Cadastre a primeira regra acima. Enquanto isso, o painel usa os limites gerais." /></div>
        ) : (
          <div className="overflow-x-auto" style={{ borderTop: '1px solid var(--line)' }}>
            <table className="tbl">
              <thead><tr><th>Modelo/Marca</th><th>Tamanho</th><th className="ef-tr">1ª Recapagem</th><th className="ef-tr">2ª Recapagem</th><th className="ef-tr">3ª Recapagem</th><th className="ef-tr">Sucata</th><th className="ef-tc">Pneus</th><th className="ef-tr">Ações</th></tr></thead>
              <tbody>
                {company.regrasModelos.map((rg) => {
                  const fmt = (n) => (Number(n) > 0 ? `${formatNumber(n)} km` : '—');
                  const qtd = tires.filter((t) => { const f = findTireRule(t, company.regrasModelos); return f && f.id === rg.id; }).length;
                  return (
                    <tr key={rg.id}>
                      <td className="font-semibold">{rg.marca}</td>
                      <td className="mono ef-t12_5">{rg.medida || 'Qualquer'}</td>
                      <td className="mono text-right">{fmt(rg.km1)}</td>
                      <td className="mono text-right">{fmt(rg.km2)}</td>
                      <td className="mono text-right">{fmt(rg.km3)}</td>
                      <td className="mono text-right font-bold">{fmt(rg.kmSucata)}</td>
                      <td className="text-center"><Chip tone="teal">{qtd}</Chip></td>
                      <td className="text-right whitespace-nowrap ef-sx15"><Btn sm onClick={() => handleEditRule(rg)}>Editar</Btn><Btn sm onClick={() => handleRemoveRule(rg)}>Remover</Btn></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="card ef-rise" style={{ animationDelay: '200ms' }}>
        <SectionHead title="Manutenção preventiva por categoria" sub="Defina de quantos em quantos KM cada serviço precisa de manutenção preventiva. Os avisos aparecem na Visão geral." />
        <datalist id="ef-pecas-cfg">{[...new Set([...(company.regrasManutencao || []).map((r) => r.peca), ...maintenances.map((m) => m.peca).filter(Boolean)])].map((x) => <option key={x} value={x} />)}</datalist>
        <form onSubmit={handleSaveMaintRule} className="p-5 space-y-3">
          <div className="ef-g-3">
            <Field label="Modelo do veículo">
              <select className="inp" value={maintRuleForm.modelo} onChange={(e) => setMaintRuleForm({ ...maintRuleForm, modelo: e.target.value })}>
                <option value="">Todos os modelos</option>
                {[...new Set([...vehicles.map((v) => v.modelo), maintRuleForm.modelo].filter(Boolean))].map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </Field>
            <Field label="Categoria da manutenção">
              <select required className="inp" value={maintRuleForm.categoria} onChange={(e) => setMaintRuleForm({ ...maintRuleForm, categoria: e.target.value })}>
                <option value="">Selecione...</option>
                {CATEGORIAS_MANUTENCAO.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Serviço"><input required list="ef-pecas-cfg" className="inp" placeholder="Ex: Troca de pastilhas de freio" value={maintRuleForm.peca} onChange={(e) => setMaintRuleForm({ ...maintRuleForm, peca: e.target.value })} /></Field>
            <Field label="Preventiva a cada (km)"><input type="number" min="1" required className="inp mono" value={maintRuleForm.km} onChange={(e) => setMaintRuleForm({ ...maintRuleForm, km: e.target.value })} /></Field>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span className="ef-t12_5" style={{ color: 'var(--mute)' }}>O limite vale para os veículos do modelo escolhido. O alerta aparece na Visão geral quando faltarem 500 km para o limite, contando a partir do KM da última manutenção com a mesma categoria e serviço. O KM atual do veículo é o do último lançamento de quilometragem (manutenção ou abastecimento).</span>
            <div className="flex gap-2">
              {editingMaintRuleId && <Btn type="button" onClick={() => { setEditingMaintRuleId(null); setMaintRuleForm(emptyMRule); }}>Cancelar edição</Btn>}
              <Btn type="submit" v="primary" icon={editingMaintRuleId ? CheckCircle2 : Plus}>{editingMaintRuleId ? 'Salvar alterações' : 'Adicionar limite'}</Btn>
            </div>
          </div>
        </form>
        {(company.regrasManutencao || []).length === 0 ? (
          <div style={{ borderTop: '1px solid var(--line)' }}><Empty icon={Wrench} title="Nenhum limite de preventiva" text="Cadastre o primeiro limite acima para ativar os avisos na Visão geral." /></div>
        ) : (
          <div className="overflow-x-auto" style={{ borderTop: '1px solid var(--line)' }}>
            <table className="tbl">
              <thead><tr><th>Modelo</th><th>Categoria</th><th>Serviço</th><th className="ef-tr">A cada</th><th>Situação da frota</th><th className="ef-tr">Ações</th></tr></thead>
              <tbody>
                {company.regrasManutencao.map((rg) => {
                  const lista = preventiveList.filter((x) => x.r.id === rg.id);
                  const venc = lista.filter((x) => x.status === 'vencida').length;
                  const prox = lista.filter((x) => x.status === 'proxima').length;
                  return (
                    <tr key={rg.id}>
                      <td>{rg.modelo || 'Todos os modelos'}</td>
                      <td>{rg.categoria}</td>
                      <td className="font-semibold">{rg.peca}</td>
                      <td className="mono text-right">{formatNumber(rg.km)} km</td>
                      <td className="ef-sx15">{venc > 0 && <Chip tone="red">{venc} vencida(s)</Chip>}{prox > 0 && <Chip tone="amber">{prox} próxima(s)</Chip>}{venc === 0 && prox === 0 && <Chip tone="teal">Em dia</Chip>}</td>
                      <td className="text-right whitespace-nowrap ef-sx15"><Btn sm onClick={() => handleEditMaintRule(rg)}>Editar</Btn><Btn sm onClick={() => handleRemoveMaintRule(rg)}>Remover</Btn></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>
    );
  };

  /* ============================================================
     CASCA DA APLICAÇÃO
     ============================================================ */
  const renderVehicleDrawer = () => {
    const v = vehicles.find((x) => x.id === detailVehicleId);
    if (!v) return null;
    const close = () => setDetailVehicleId(null);
    const r = company.regrasPneus;
    const totalSlots = 2 + (Math.max(2, Math.min(6, Number(v.eixos) || 3)) - 1) * 4;
    const mountedTires = tires.filter((t) => t.veiculoAtualId === v.id);
    const filled = mountedTires.filter((t) => t.posicaoAtual !== 'ESTEPE-1').length;
    const occ = Math.min(100, Math.round((filled / totalSlots) * 100));
    const events = [
      ...maintenances.filter((m) => m.veiculoId === v.id).map((m) => ({ k: 'm', id: m.id, data: m.data, titulo: `${m.tipo} · ${m.osNumero}`, texto: `${m.categoria ? m.categoria + ' · ' : ''}${m.km ? formatNumber(m.km) + ' km · ' : ''}${m.descricao}`, valor: m.valor })),
      ...fines.filter((f) => f.veiculoId === v.id).map((f) => ({ k: 'f', id: f.id, data: f.data, titulo: `Multa · ${f.status}`, texto: f.motivo, valor: f.valor }))
    ].sort((a, b) => String(b.data).localeCompare(String(a.data)));
    const total = events.reduce((a, e) => a + Number(e.valor || 0), 0);

    return (
      <Drawer onClose={close}>
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap"><Plate v={v} /><Chip tone={v.status === 'Operando' ? 'teal' : 'amber'}>{v.status}</Chip></div>
              <h2 className="ef-t20 font-semibold mt-2">{v.modelo}</h2>
              <div className="ef-t13" style={{ color: 'var(--mute)' }}>{v.categoria}</div>
            </div>
            <button aria-label="Fechar" onClick={close} className="icon-btn"><X size={18} /></button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[['Hodômetro', `${formatNumber(v.kmAtual)} km`], ['Eixos', v.eixos], ['Despesas', formatCurrency(total)]].map(([l, val]) => (
              <div key={l} className="card p-3"><div className="ef-t12" style={{ color: 'var(--mute)' }}>{l}</div><div className="mono font-bold ef-t13_5 mt-1">{val}</div></div>
            ))}
          </div>

          <div className="card p-4">
            <div className="flex items-end justify-between">
              <div><div className="ef-t13 font-semibold">Posições com pneu</div><div className="disp ef-t32 font-semibold leading-none mt-1">{occ}%</div></div>
              <span className="mono ef-t12_5" style={{ color: 'var(--mute)' }}>{filled} de {totalSlots} posições</span>
            </div>
            <div className="h-3 rounded-full mt-3 overflow-hidden" style={{ background: 'var(--soft)' }}>
              <div className="h-full rounded-full ef-grow" style={{ width: `${occ}%`, background: 'var(--teal)' }} />
            </div>
          </div>

          <div className="card overflow-hidden">
            <SectionHead title="Pneus montados" sub="Toque em um pneu para abri-lo no chassi" />
            {mountedTires.length === 0 ? <Empty icon={Disc} title="Nenhum pneu montado" text="Monte pneus no chassi deste veículo." /> : (
              <div className="px-5">
                {mountedTires.map((t, i) => {
                  const st = getTireRecapStyle(t.recapagens);
                  const lim = getTireLimits(t, company);
                    const pct = Math.min(100, ((Number(t.kmTotal) || 0) / (lim.kmSucatear || 1)) * 100);
                  const barC = t.kmTotal >= lim.kmSucatear ? 'var(--red)' : t.kmTotal >= lim.kmRecapar ? 'var(--amber)' : 'var(--teal)';
                  const alerted = tireAlerts.some((a) => a.tire.id === t.id);
                  return (
                    <button key={t.id} className="w-full text-left flex items-center gap-3 py-3" style={{ borderTop: i ? '1px solid var(--line2)' : 0 }}
                      onClick={() => { setSelectedTireForActionId(t.id); goChassis(v.id); close(); }}>
                      <span className="mono ef-t12 font-bold text-white ef-px2_5 py-1 rounded-md" style={{ background: st.c }}>#{t.fogo}</span>
                      <span className="flex-1 min-w-0">
                        <span className="flex items-center gap-2"><span className="block ef-t13 font-medium truncate">{t.marca}</span>{alerted && <Chip tone="amber">Ação pendente</Chip>}</span>
                        <span className="block ef-h1_5 rounded-full ef-mt1_5 overflow-hidden" style={{ background: 'var(--line2)' }}><span className="block h-full rounded-full" style={{ width: `${pct}%`, background: barC }} /></span>
                      </span>
                      <span className="mono ef-t12 text-right shrink-0"><b>{t.posicaoAtual}</b><br />{formatNumber(t.kmTotal)} km</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="ef-t16 font-semibold mb-3">Linha do tempo de despesas</h3>
            {events.length === 0 ? <div className="ef-t13" style={{ color: 'var(--mute)' }}>Nenhuma manutenção ou multa lançada para este veículo.</div> : (
              <ol className="relative ef-ml1_5" style={{ borderLeft: '2px solid var(--line)' }}>
                {events.map((e) => (
                  <li key={e.id} className="pl-4 pb-4 relative">
                    <i className="absolute top-1 w-3 h-3 rounded-full" style={{ left: -7, background: e.k === 'f' ? 'var(--red)' : 'var(--teal)', boxShadow: '0 0 0 3px var(--card)' }} />
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0"><div className="ef-t13 font-semibold">{e.titulo}</div><div className="ef-t12_5" style={{ color: 'var(--mute)' }}>{e.data} · {e.texto}</div></div>
                      <span className="mono ef-t12_5 font-bold shrink-0">{formatCurrency(e.valor)}</span>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>

          <div className="flex flex-wrap gap-2 pb-2">
            <Btn v="primary" onClick={() => { close(); goChassis(v.id); }}>Ver no chassi</Btn>
            <Btn onClick={() => { setMaintenanceForm({ ...emptyMaint(), veiculoId: v.id }); setShowMaintenanceModal(true); }}>Lançar manutenção</Btn>
            <Btn onClick={() => { setFineForm({ ...emptyFine(), veiculoId: v.id }); setShowFineModal(true); }}>Lançar multa</Btn>
          </div>
        </div>
      </Drawer>
    );
  };

  const navItems = [
    { id: 'dashboard', label: 'Visão geral', sub: 'Indicadores, despesas e ordens de ação da frota', icon: LayoutDashboard, render: renderDashboard, badge: tireAlerts.length || null },
    { id: 'vehicles', label: 'Frota de veículos', sub: 'Cadastro e acompanhamento de cada equipamento', icon: Truck, render: renderVehicles },
    { id: 'pneus_hub', label: 'Pneus e estoque', sub: 'Movimentação no chassi, almoxarifado e histórico', icon: Disc, render: renderPneusHub, badge: totalStockTires.length || null },
    { id: 'despesas_hub', label: 'Manutenções e multas', sub: 'Despesas lançadas por veículo', icon: Wrench, render: renderDespesasHub },
    { id: 'abastecimento', label: 'Abastecimento', sub: 'Lançamentos de combustível, KM e média de consumo', icon: Fuel, render: renderAbastecimento },
    { id: 'financeiro', label: 'Financeiro', sub: 'Pagamentos a vencer, vencidos e pagos por categoria', icon: DollarSign, render: renderFinanceiro },
    { id: 'settings', label: 'Configurações e backup', sub: 'Empresa, regras de alerta e cópia de segurança', icon: Database, render: renderSettings }
  ];
  const activeNav = navItems.find((n) => n.id === activeTab) || navItems[0];

  return (
    <div className="ef ef-shell" data-theme={theme}>
      <style>{STYLE}</style>

      {toast && (
        <div key={toast.k} role="status" className="ef-toast fixed bottom-5 right-5 ef-z60 px-4 py-3 rounded-xl flex items-center gap-3 ef-t13_5 font-medium text-white"
          style={{ background: toast.type === 'error' ? '#8F2A22' : 'var(--pet)', boxShadow: '0 12px 30px rgba(6,16,32,.35)' }}>
          {toast.type === 'error' ? <AlertTriangle size={18} color="#F2B01E" /> : <CheckCircle2 size={18} color="#5BE0A6" />}
          <span>{toast.message}</span>
        </div>
      )}

      <aside className="ef-side">
        <div className="px-5 pt-6 pb-5" style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          {company.logoUrl
            ? <div className="inline-flex rounded-xl bg-white p-2"><img src={company.logoUrl} alt="Logo da empresa" className="h-11 w-auto object-contain" /></div>
            : <img src={LOGO_FROTAWISE} alt="FrotaWise" draggable={false} className="block h-auto ef-fade" style={{ width: 184 }} />}
        </div>

        <nav className="ef-nav" aria-label="Navegação principal">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)} aria-current={activeTab === item.id ? 'page' : undefined} className={cx('nav', activeTab === item.id && 'nav-on')}>
                <span className="flex items-center gap-3"><Icon size={18} />{item.label}</span>
                {item.badge && <span className="mono ef-t11 font-bold px-2 ef-py0_5 rounded-full" style={{ background: 'var(--brand)', color: '#06213F' }}>{item.badge}</span>}
              </button>
            );
          })}
        </nav>

        <div className="ef-side-foot">
          <button onClick={handleExportBackup} className="btn w-full" style={{ background: 'rgba(255,255,255,.08)', color: '#fff' }}>
            <Download size={16} color="#18B389" />Salvar backup no Pen Drive</button>
          <div className="ef-t11_5 mt-3 text-center" style={{ color: '#7F93B3' }}>Versão {APP_VERSION} · dados salvos neste computador</div>
        </div>
      </aside>

      <div className="ef-main">
        <header className="px-6 py-4 flex flex-wrap items-center justify-between gap-4 sticky top-0 z-30" style={{ background: 'var(--hdr)', backdropFilter: 'blur(10px)', borderBottom: '1px solid var(--line)' }}>
          <span aria-hidden className="absolute left-0 right-0 pointer-events-none" style={{ bottom: -1, height: 2, background: 'linear-gradient(90deg, var(--axle), var(--brand) 38%, transparent 72%)', opacity: .75 }} />
          <div>
            <div className="flex items-center gap-2 ef-t12_5" style={{ color: 'var(--mute)' }}>
              <span className="dot" /><span>Banco local ativo · 100% offline</span>
            </div>
            <h1 className="ef-t22 font-semibold leading-tight">{activeNav.label}</h1>
          </div>
          <div className="flex items-center gap-2">
            <Btn icon={theme === 'dark' ? Sun : Moon} title="Alternar tema claro/escuro" aria-label="Alternar tema claro/escuro" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
            <Btn icon={Plus} onClick={() => setShowVehicleModal(true)}>Veículo</Btn>
            <Btn icon={Plus} onClick={() => setShowTireModal(true)}>Pneu</Btn>
            <Btn v="dark" icon={Plus} onClick={() => setShowMaintenanceModal(true)}>Despesa</Btn>
          </div>
        </header>

        <main className="p-6 flex-1">
          <p className="ef-t13_5 mb-5" style={{ color: 'var(--ink2)' }}>{activeNav.sub}</p>
          <div key={activeTab} className="ef-rise">
            {activeNav.render()}
          </div>
        </main>
      </div>

      {renderVehicleDrawer()}

      {/* ---------- Modais ---------- */}
      {tireActionModal && (
        <Modal title={`Pneu Fogo #${tireActionModal.tire.fogo} · ${tireActionModal.targetAction === 'AddKm' ? 'Somar KM' : tireActionModal.targetAction === 'Mount' ? `Montar em ${tireActionModal.targetSlotCode}` : tireActionModal.targetAction}`} onClose={() => setTireActionModal(null)}>
          <form onSubmit={handleConfirmTireOperation} className="space-y-4">
            <Field label="Quantos KM este pneu rodou neste trecho? (soma automática)">
              <input type="number" min="0" className="inp mono" placeholder="Ex: 12000" autoFocus value={actionKmInput} onChange={(e) => setActionKmInput(e.target.value)} />
            </Field>
            {tireActionModal.targetAction === 'Estocar' && (
              <Field label="Local no estoque"><input className="inp" value={actionStockLocInput} onChange={(e) => setActionStockLocInput(e.target.value)} /></Field>
            )}
            {tireActionModal.targetAction === 'Recapar' && (
              <>
                <Field label="Pneus (tipo de banda)">
                  <select required className="inp" value={actionBandaInput} onChange={(e) => setActionBandaInput(e.target.value)}>
                    <option value="">Selecione...</option>
                    {BANDAS_PNEU.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Fornecedor da reforma"><input required className="inp" value={actionFornecedorInput} onChange={(e) => setActionFornecedorInput(e.target.value)} /></Field>
                  <Field label="Valor da reforma (R$)"><input type="number" min="0" step="0.01" className="inp mono" value={actionValorInput} onChange={(e) => setActionValorInput(e.target.value)} /></Field>
                </div>
              </>
            )}
            <Field label="Observação"><input className="inp" value={actionObsInput} onChange={(e) => setActionObsInput(e.target.value)} /></Field>
            <FormActions onCancel={() => setTireActionModal(null)} label="Confirmar" v={tireActionModal.targetAction === 'Sucatear' ? 'danger' : 'dark'} />
          </form>
        </Modal>
      )}

      {historyModalTire && (
        <Modal wide title={`Histórico · Fogo #${historyModalTire.fogo} (${formatNumber(historyModalTire.kmTotal)} km)`} onClose={() => setHistoryModalTire(null)}>
          {(historyModalTire.historicoVeiculos || []).length === 0
            ? <Empty icon={History} title="Sem histórico" text="Este pneu ainda não rodou em nenhum veículo." />
            : (
              <ol className="relative ml-2 max-h-80 overflow-y-auto" style={{ borderLeft: '2px solid var(--line)' }}>
                {historyModalTire.historicoVeiculos.map((h) => (
                  <li key={h.id} className="pl-5 pb-5 relative">
                    <i className="absolute top-1 w-3 h-3 rounded-full" style={{ left: -7, background: 'var(--teal)', boxShadow: '0 0 0 3px var(--card)' }} />
                    <div className="flex items-start justify-between gap-3">
                      <div><span className="mono font-bold">{h.placa}</span> <span style={{ color: 'var(--ink2)' }}>· {h.modelo}</span>
                        <div className="ef-t12_5" style={{ color: 'var(--mute)' }}>{h.data} · {h.obs}</div></div>
                      <Chip tone={Number(h.kmRodados) < 0 ? 'red' : 'teal'}>{Number(h.kmRodados) < 0 ? '' : '+'}{formatNumber(h.kmRodados)} km</Chip>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          {(historyModalTire.reformas || []).length > 0 && (
            <div className="mt-4 pt-4" style={{ borderTop: '1px solid var(--line)' }}>
              <h4 className="ef-t14 font-semibold mb-2">Reformas (recapagens)</h4>
              {historyModalTire.reformas.map((r) => (
                <div key={r.id} className="flex items-start justify-between gap-3 ef-py1_5 ef-t13">
                  <div><b>{r.ciclo}ª recapagem</b> · banda {r.tipoBanda || '—'}<div className="ef-t12_5" style={{ color: 'var(--mute)' }}>{r.data} · {r.fornecedor || 'Fornecedor não informado'}</div></div>
                  <span className="mono font-bold shrink-0">{formatCurrency(r.valor)}</span>
                </div>
              ))}
            </div>
          )}
        </Modal>
      )}

      {showVehicleModal && (
        <Modal title="Cadastrar veículo" onClose={() => setShowVehicleModal(false)}>
          <form onSubmit={handleCreateVehicle} className="space-y-3">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2"><Field label="Placa"><input required className="inp mono" placeholder="OPG-2469" value={vehicleForm.placa} onChange={(e) => setVehicleForm({ ...vehicleForm, placa: e.target.value })} /></Field></div>
              <Field label="UF"><input maxLength={2} className="inp mono" value={vehicleForm.uf} onChange={(e) => setVehicleForm({ ...vehicleForm, uf: e.target.value })} /></Field>
            </div>
            <Field label="Categoria"><input required className="inp" placeholder="Cavalo Trucado 3 Eixos" value={vehicleForm.categoria} onChange={(e) => setVehicleForm({ ...vehicleForm, categoria: e.target.value })} /></Field>
            <Field label="Marca / modelo"><input className="inp" value={vehicleForm.modelo} onChange={(e) => setVehicleForm({ ...vehicleForm, modelo: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Eixos (2 a 6)"><input type="number" min="2" max="6" required className="inp mono" value={vehicleForm.eixos} onChange={(e) => setVehicleForm({ ...vehicleForm, eixos: e.target.value })} /></Field>
              <Field label="KM atual"><input type="number" min="0" className="inp mono" value={vehicleForm.kmAtual} onChange={(e) => setVehicleForm({ ...vehicleForm, kmAtual: e.target.value })} /></Field>
            </div>
            <FormActions onCancel={() => setShowVehicleModal(false)} label="Salvar veículo" />
          </form>
        </Modal>
      )}

      {showTireModal && (
        <Modal title={editingTireId ? 'Editar pneu' : 'Cadastrar pneu'} onClose={closeTireModal}>
          <form onSubmit={editingTireId ? handleUpdateTire : handleCreateTire} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nº fogo"><input required className="inp mono" placeholder="375" value={tireForm.fogo} onChange={(e) => setTireForm({ ...tireForm, fogo: e.target.value })} /></Field>
              <Field label="Medida"><input list="ef-medidas-regras" className="inp mono" value={tireForm.medida} onChange={(e) => setTireForm({ ...tireForm, medida: e.target.value })} /></Field>
            </div>
            <Field label="Marca / modelo"><input required list="ef-marcas-regras" className="inp" value={tireForm.marca} onChange={(e) => setTireForm({ ...tireForm, marca: e.target.value })} /></Field>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Sulco (mm)"><input type="number" step="0.1" className="inp mono" value={tireForm.sulcoMm} onChange={(e) => setTireForm({ ...tireForm, sulcoMm: e.target.value })} /></Field>
              <Field label="Recapagens"><input type="number" min="0" className="inp mono" value={tireForm.recapagens} onChange={(e) => setTireForm({ ...tireForm, recapagens: e.target.value })} /></Field>
              <Field label={editingTireId ? 'KM acumulado' : 'KM inicial'}><input type="number" min="0" className="inp mono" value={tireForm.kmInicial} onChange={(e) => setTireForm({ ...tireForm, kmInicial: e.target.value })} /></Field>
            </div>
            <datalist id="ef-marcas-regras">{[...new Set([...(company.regrasModelos || []).map((r) => r.marca), ...tires.map((t) => t.marca)])].map((m) => <option key={m} value={m} />)}</datalist>
            <datalist id="ef-medidas-regras">{[...new Set([...(company.regrasModelos || []).map((r) => r.medida).filter(Boolean), ...tires.map((t) => t.medida)])].map((m) => <option key={m} value={m} />)}</datalist>
            {tireForm.marca.trim() && (() => {
              const lim = getTireLimits({ marca: tireForm.marca, medida: tireForm.medida, recapagens: tireForm.recapagens }, company);
              return lim.rule
                ? <div className="ef-t12_5 px-3 py-2 rounded-lg" style={{ background: 'var(--teal-soft)', color: 'var(--teal-ink)' }}>Regra do modelo reconhecida: próximo aviso {lim.etapa ? `da ${lim.etapa}ª recapagem aos ${formatNumber(lim.kmRecapar)} km` : 'apenas de sucata'} · sucata aos {formatNumber(lim.kmSucatear)} km.</div>
                : <div className="ef-t12_5" style={{ color: 'var(--mute)' }}>Nenhuma regra cadastrada para este modelo/tamanho: serão usados os limites gerais.</div>;
            })()}
            <Field label="Local no estoque"><input className="inp" value={tireForm.localEstoque} onChange={(e) => setTireForm({ ...tireForm, localEstoque: e.target.value })} /></Field>
            <FormActions onCancel={closeTireModal} label={editingTireId ? 'Salvar alterações' : 'Salvar pneu'} v="primary" />
          </form>
        </Modal>
      )}

      {showMaintenanceModal && (
        <Modal wide title={editingMaintId ? 'Editar manutenção' : 'Lançar manutenção'} onClose={closeMaintenanceModal}>
          <form onSubmit={editingMaintId ? handleUpdateMaintenance : handleCreateMaintenance} className="space-y-3">
            <Field label="Veículo">
              <select required className="inp" value={maintenanceForm.veiculoId} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, veiculoId: e.target.value })}>
                <option value="">Selecione o veículo...</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.placa} — {v.modelo}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nº da O.S. (opcional)"><input className="inp mono" value={maintenanceForm.osNumero} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, osNumero: e.target.value })} /></Field>
              <Field label="Tipo">
                <select className="inp" value={maintenanceForm.tipo} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, tipo: e.target.value })}>
                  <option>Preventiva</option><option>Corretiva</option><option>Pneus / Recapagem</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Categoria da manutenção">
                <select required className="inp" value={maintenanceForm.categoria} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, categoria: e.target.value })}>
                  <option value="">Selecione...</option>
                  {CATEGORIAS_MANUTENCAO.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </Field>
              <Field label="KM do veículo nesta manutenção"><input type="number" min="0" required className="inp mono" value={maintenanceForm.km} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, km: e.target.value })} /></Field>
            </div>
            {(() => {
              const vv = vehicles.find((v) => v.id === maintenanceForm.veiculoId);
              if (!vv) return null;
              const chk = maintenanceForm.km !== '' ? checkMaintenanceKm(maintenanceForm, editingMaintId) : null;
              if (chk && chk.erro) return <div role="alert" className="ef-t12_5 px-3 py-2 rounded-lg" style={{ background: 'var(--red-soft)', color: 'var(--red-ink)' }}>{chk.erro}</div>;
              return <div className="ef-t12_5" style={{ color: 'var(--mute)' }}>Hodômetro atual de {vv.placa}: {formatNumber(vv.kmAtual)} km. O KM informado atualiza o hodômetro e os pneus montados.</div>;
            })()}
            <datalist id="ef-pecas">{[...new Set((company.regrasManutencao || []).filter((r) => !maintenanceForm.categoria || r.categoria === maintenanceForm.categoria).map((r) => r.peca))].map((x) => <option key={x} value={x} />)}</datalist>
            <Field label="Peça / item da preventiva (opcional)"><input list="ef-pecas" className="inp" placeholder="Ex: Pastilhas de freio" value={maintenanceForm.peca} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, peca: e.target.value })} /></Field>
            <Field label="Descrição do serviço"><input required className="inp" value={maintenanceForm.descricao} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, descricao: e.target.value })} /></Field>
            <Field label="Oficina / fornecedor"><input className="inp" value={maintenanceForm.fornecedor} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, fornecedor: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Data"><input type="date" className="inp" value={maintenanceForm.data} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, data: e.target.value })} /></Field>
              <Field label="Valor (R$)"><input type="number" step="0.01" required className="inp mono" value={maintenanceForm.valor} onChange={(e) => setMaintenanceForm({ ...maintenanceForm, valor: e.target.value })} /></Field>
            </div>
            <IntegrarFinanceiro form={maintenanceForm} setForm={setMaintenanceForm} total={Number(maintenanceForm.valor) || 0} texto="Lança também esta OS no Financeiro (pagamentos a vencer), com a forma de pagamento, as parcelas e o vencimento abaixo." />
            <FormActions onCancel={closeMaintenanceModal} label={editingMaintId ? 'Salvar alterações' : 'Salvar manutenção'} />
          </form>
        </Modal>
      )}

      {showContaModal && (
        <Modal wide title={editingContaId ? 'Editar conta a pagar' : 'Lançar conta a pagar'} onClose={closeContaModal}>
          <form onSubmit={handleSaveConta} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tipo">
                <select className="inp" value={contaForm.tipo} onChange={(e) => setContaForm({ ...contaForm, tipo: e.target.value })}>
                  {TIPOS_FINANCEIRO.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Veículo (opcional)">
                <select className="inp" value={contaForm.veiculoId} onChange={(e) => setContaForm({ ...contaForm, veiculoId: e.target.value })}>
                  <option value="">Nenhum</option>
                  {vehicles.map((v) => <option key={v.id} value={v.id}>{v.placa} — {v.modelo}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Descrição"><input required className="inp" placeholder="Ex: IPVA 2026, seguro da frota, compra de pneus" value={contaForm.descricao} onChange={(e) => setContaForm({ ...contaForm, descricao: e.target.value })} /></Field>
            <Field label="Fornecedor / favorecido (opcional)"><input className="inp" value={contaForm.fornecedor} onChange={(e) => setContaForm({ ...contaForm, fornecedor: e.target.value })} /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Valor total (R$)"><input type="number" min="0" step="0.01" required className="inp mono" value={contaForm.valor} onChange={(e) => setContaForm({ ...contaForm, valor: e.target.value })} /></Field>
              <Field label="Forma de pagamento">
                <select className="inp" value={contaForm.forma} onChange={(e) => setContaForm({ ...contaForm, forma: e.target.value })}>
                  <option value="avista">À vista</option>
                  <option value="parcelado">Parcelado</option>
                </select>
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Quantidade de parcelas"><input type="number" min="2" max="48" disabled={contaForm.forma !== 'parcelado'} className="inp mono" value={contaForm.forma === 'parcelado' ? contaForm.parcelas : 1} onChange={(e) => setContaForm({ ...contaForm, parcelas: e.target.value })} /></Field>
              <Field label={contaForm.forma === 'parcelado' ? 'Vencimento da 1ª parcela' : 'Vencimento'}><input type="date" required className="inp" value={contaForm.vencimento} onChange={(e) => setContaForm({ ...contaForm, vencimento: e.target.value })} /></Field>
            </div>
            {contaForm.vencimento && Number(contaForm.valor) > 0 && (() => {
              const n = contaForm.forma === 'parcelado' ? Math.max(2, Math.min(48, Math.round(Number(contaForm.parcelas)) || 2)) : 1;
              const vals = splitInstallments(Number(contaForm.valor), n);
              return (
                <div style={{ fontSize: 12.5, color: 'var(--mute)' }}>
                  {vals.slice(0, 6).map((v, i) => (
                    <div key={i} className="flex justify-between"><span>{n > 1 ? `Parcela ${i + 1}/${n}` : 'À vista'} · {formatDateBR(addMonthsISO(contaForm.vencimento, i))}</span><span className="mono">{formatCurrency(v)}</span></div>
                  ))}
                  {vals.length > 6 && <div>... e mais {vals.length - 6} parcela(s)</div>}
                </div>
              );
            })()}
            <FormActions onCancel={closeContaModal} label={editingContaId ? 'Salvar alterações' : 'Lançar conta'} v="primary" />
          </form>
        </Modal>
      )}

      {payEdit && (
        <Modal wide title="Editar pagamento" onClose={() => setPayEdit(null)}>
          <form onSubmit={handleSavePay} className="space-y-3">
            <div className="p-3 rounded-xl" style={{ background: 'var(--card2)', border: '1px solid var(--line2)' }}>
              <div className="flex items-center gap-2"><Chip tone={TIPO_TONE[payEdit.tipo]}>{payEdit.tipo}</Chip><b>{payEdit.descricao}</b></div>
              <div className="mt-1" style={{ fontSize: 12.5, color: 'var(--mute)' }}>Valor total: <b className="mono">{formatCurrency(payEdit.total)}</b></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Forma de pagamento">
                <select className="inp" value={payForm.forma} onChange={(e) => setPayForm({ ...payForm, forma: e.target.value })}>
                  <option value="avista">À vista</option>
                  <option value="parcelado">Parcelado</option>
                </select>
              </Field>
              <Field label="Quantidade de parcelas"><input type="number" min="2" max="48" disabled={payForm.forma !== 'parcelado'} className="inp mono" value={payForm.forma === 'parcelado' ? payForm.parcelas : 1} onChange={(e) => setPayForm({ ...payForm, parcelas: e.target.value })} /></Field>
            </div>
            <Field label={payForm.forma === 'parcelado' ? 'Vencimento da 1ª parcela' : 'Vencimento'}><input type="date" required className="inp" value={payForm.vencimento} onChange={(e) => setPayForm({ ...payForm, vencimento: e.target.value })} /></Field>
            {payForm.vencimento && (() => {
              const n = payForm.forma === 'parcelado' ? Math.max(2, Math.min(48, Math.round(Number(payForm.parcelas)) || 2)) : 1;
              const vals = splitInstallments(payEdit.total, n);
              return (
                <div style={{ fontSize: 12.5, color: 'var(--mute)' }}>
                  {vals.slice(0, 6).map((v, i) => (
                    <div key={i} className="flex justify-between"><span>{n > 1 ? `Parcela ${i + 1}/${n}` : 'À vista'} · {formatDateBR(addMonthsISO(payForm.vencimento, i))}</span><span className="mono">{formatCurrency(v)}</span></div>
                  ))}
                  {vals.length > 6 && <div>... e mais {vals.length - 6} parcela(s)</div>}
                </div>
              );
            })()}
            <FormActions onCancel={() => setPayEdit(null)} label="Salvar pagamento" v="primary" />
          </form>
        </Modal>
      )}

      {showFuelModal && (
        <Modal wide title={editingFuelId ? 'Editar abastecimento' : 'Lançar abastecimento'} onClose={closeFuelModal}>
          <form onSubmit={editingFuelId ? handleUpdateFuel : handleCreateFuel} className="space-y-3">
            <Field label="Veículo abastecido">
              <select required className="inp" value={fuelForm.veiculoId} onChange={(e) => setFuelForm({ ...fuelForm, veiculoId: e.target.value })}>
                <option value="">Selecione o veículo...</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.placa} — {v.modelo}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Combustível">
                <select className="inp" value={fuelForm.tipo} onChange={(e) => setFuelForm({ ...fuelForm, tipo: e.target.value })}>
                  {TIPOS_COMBUSTIVEL.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
              <Field label="Data do abastecimento"><input type="date" required className="inp" value={fuelForm.data} onChange={(e) => setFuelForm({ ...fuelForm, data: e.target.value })} /></Field>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Field label="Litros"><input type="number" min="0" step="0.01" required className="inp mono" value={fuelForm.litros} onChange={(e) => setFuelForm({ ...fuelForm, litros: e.target.value })} /></Field>
              <Field label="Valor unitário (R$/L)"><input type="number" min="0" step="0.001" required className="inp mono" value={fuelForm.valorUnit} onChange={(e) => setFuelForm({ ...fuelForm, valorUnit: e.target.value })} /></Field>
              <Field label="Valor total (R$)"><input readOnly tabIndex={-1} className="inp mono" value={Number(fuelForm.litros) > 0 && Number(fuelForm.valorUnit) > 0 ? formatCurrency(Math.round(Number(fuelForm.litros) * Number(fuelForm.valorUnit) * 100) / 100) : ''} /></Field>
            </div>
            <Field label="KM do veículo neste abastecimento"><input type="number" min="0" required className="inp mono" value={fuelForm.km} onChange={(e) => setFuelForm({ ...fuelForm, km: e.target.value })} /></Field>
            {(() => {
              const vv = vehicles.find((v) => v.id === fuelForm.veiculoId);
              if (!vv) return null;
              const chk = fuelForm.km !== '' ? checkFuelKm(fuelForm, editingFuelId) : null;
              if (chk && chk.erro) return <div role="alert" className="ef-t12_5 px-3 py-2 rounded-lg" style={{ background: 'var(--red-soft)', color: 'var(--red-ink)' }}>{chk.erro}</div>;
              const comb = fuelings.filter((f) => f.veiculoId === vv.id && f.tipo !== 'Arla' && f.data <= fuelForm.data).sort(cmpFuel);
              const ant = comb[comb.length - 1];
              const km = Number(fuelForm.km);
              const lt = Number(fuelForm.litros);
              const media = fuelForm.tipo !== 'Arla' && ant && km > Number(ant.km) && lt > 0 ? (km - Number(ant.km)) / lt : null;
              return (
                <div className="ef-t12_5" style={{ color: 'var(--mute)' }}>
                  Hodômetro atual de {vv.placa}: {formatNumber(vv.kmAtual)} km. {ant ? `Último abastecimento de combustível: ${formatNumber(ant.km)} km (${ant.data}).` : 'Primeiro abastecimento de combustível deste veículo: a média começa no próximo.'}
                  {fuelForm.tipo === 'Arla' ? ' Arla não entra no cálculo de média.' : media !== null ? ` Média deste abastecimento: ${formatDec(media)} km/l.` : ''}
                </div>
              );
            })()}
            <Field label="Fornecedor (posto)"><input className="inp" value={fuelForm.fornecedor} onChange={(e) => setFuelForm({ ...fuelForm, fornecedor: e.target.value })} /></Field>
            <FormActions onCancel={closeFuelModal} label={editingFuelId ? 'Salvar alterações' : 'Salvar abastecimento'} v="primary" />
          </form>
        </Modal>
      )}

      {showFineModal && (
        <Modal wide title={editingFineId ? 'Editar multa' : 'Lançar multa'} onClose={closeFineModal}>
          <form onSubmit={editingFineId ? handleUpdateFine : handleCreateFine} className="space-y-3">
            <Field label="Veículo">
              <select required className="inp" value={fineForm.veiculoId} onChange={(e) => setFineForm({ ...fineForm, veiculoId: e.target.value })}>
                <option value="">Selecione o veículo...</option>
                {vehicles.map((v) => <option key={v.id} value={v.id}>{v.placa} — {v.modelo}</option>)}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Nº do AIT (opcional)"><input className="inp mono" value={fineForm.ait} onChange={(e) => setFineForm({ ...fineForm, ait: e.target.value })} /></Field>
              <Field label="Status">
                <select className="inp" value={fineForm.status} onChange={(e) => setFineForm({ ...fineForm, status: e.target.value })}>
                  <option>Pendente</option><option>Paga</option><option>Em Recurso</option>
                </select>
              </Field>
            </div>
            <Field label="Motivo da infração"><input required className="inp" value={fineForm.motivo} onChange={(e) => setFineForm({ ...fineForm, motivo: e.target.value })} /></Field>
            <div>
              <span className="lbl">Condutor da infração</span>
              <div className="seg">
                <button type="button" className={fineForm.identificado ? 'on' : ''} onClick={() => setFineForm({ ...fineForm, identificado: true })}>Motorista identificado</button>
                <button type="button" className={!fineForm.identificado ? 'on' : ''} onClick={() => setFineForm({ ...fineForm, identificado: false })}>Não identificado</button>
              </div>
            </div>
            {fineForm.identificado && (
              <Field label="Motorista"><input required className="inp" value={fineForm.motorista} onChange={(e) => setFineForm({ ...fineForm, motorista: e.target.value })} /></Field>
            )}
            <div className="grid grid-cols-3 gap-3">
              <Field label="Data"><input type="date" className="inp" value={fineForm.data} onChange={(e) => setFineForm({ ...fineForm, data: e.target.value })} /></Field>
              <Field label="Pontos"><input type="number" min="0" disabled={!fineForm.identificado} className="inp mono" value={fineForm.identificado ? fineForm.pontos : 0} onChange={(e) => setFineForm({ ...fineForm, pontos: e.target.value })} /></Field>
              <Field label={fineForm.identificado ? 'Valor (R$)' : 'Valor da multa original (R$)'}><input type="number" step="0.01" required className="inp mono" value={fineForm.valor} onChange={(e) => setFineForm({ ...fineForm, valor: e.target.value })} /></Field>
            </div>
            {!fineForm.identificado && (
              <div className="ef-t13 px-3 ef-py2_5 rounded-lg" style={{ background: 'var(--amber-soft)', color: 'var(--amber-ink)' }}>
                Sem identificar o condutor, a empresa recebe a multa NIC. Original {formatCurrency(Number(fineForm.valor) || 0)} + NIC (×{NIC_MULTIPLICADOR}) {formatCurrency((Number(fineForm.valor) || 0) * NIC_MULTIPLICADOR)} = <b>{formatCurrency((Number(fineForm.valor) || 0) * (1 + NIC_MULTIPLICADOR))}</b>. Não gera pontos na CNH.
              </div>
            )}
            <IntegrarFinanceiro form={fineForm} setForm={setFineForm} total={(Number(fineForm.valor) || 0) * (fineForm.identificado ? 1 : 1 + NIC_MULTIPLICADOR)} texto="Lança também esta multa no Financeiro (pagamentos a vencer), com a forma de pagamento, as parcelas e o vencimento abaixo." />
            <FormActions onCancel={closeFineModal} label={editingFineId ? 'Salvar alterações' : 'Salvar multa'} v="danger" />
          </form>
        </Modal>
      )}
    </div>
  );
}

/* Logo FrotaWise (versão para fundo escuro: navy vira branco, verde mantido; PNG transparente embutido, funciona offline) */
const LOGO_FROTAWISE = 'data:image/png;base64,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';
