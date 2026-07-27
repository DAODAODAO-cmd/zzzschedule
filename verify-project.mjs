/*
 * 谷子调排簿统一样式
 * 顺序保持自原单文件：结算补丁 → 状态控件 → 登录/协作 → 主界面。
 * 修改界面优先编辑本文件，不要再把样式写回 HTML 或 JavaScript。
 */

.settlement-status-btn,.settlement-status-label{display:inline-flex;align-items:center;justify-content:center;min-width:104px;min-height:34px;border:1px solid transparent;border-radius:999px;padding:7px 12px;font-size:11px;font-weight:900;line-height:1;white-space:nowrap;box-sizing:border-box}
  .settlement-status-btn{cursor:pointer;transition:transform .15s ease,box-shadow .15s ease,filter .15s ease}
  .settlement-status-btn:hover{transform:translateY(-1px);box-shadow:0 5px 14px rgba(44,35,52,.10)}
  .settlement-status-btn:disabled{cursor:default;transform:none;box-shadow:none}
  .settlement-status-refund{background:#fff0f2;border-color:#f2b8c1;color:#b4364c}
  .settlement-status-refund-done{background:#f9dce2;border-color:#e99aaa;color:#98283d}
  .settlement-status-supplement{background:#edf5ff;border-color:#b6d3f3;color:#286da7}
  .settlement-status-supplement-done{background:#dcecff;border-color:#91bce8;color:#185b93}
  .settlement-status-complete{background:#e8f6ed;border-color:#b6ddc3;color:#287247}

  .settlement-dashboard{margin-top:12px;padding:14px;border:1px solid var(--line);border-radius:14px;background:var(--panel,#fff);box-shadow:0 8px 24px rgba(60,40,70,.06)}
  .settlement-dashboard[hidden]{display:none!important}
  .settlement-dashboard-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
  .settlement-dashboard-head strong{font-size:16px;color:var(--text)}
  .settlement-head-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:7px}
  .settlement-ledger{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:10px}
  .settlement-ledger>div{padding:10px 11px;border:1px solid var(--line);border-radius:10px;background:var(--soft,#fff)}
  .settlement-ledger>div:nth-child(1){background:#fff5f6;border-color:#f0c7ce}
  .settlement-ledger>div:nth-child(1) b{color:#b4364c}
  .settlement-ledger>div:nth-child(2){background:#f3f8ff;border-color:#c8ddf3}
  .settlement-ledger>div:nth-child(2) b{color:#286da7}
  .settlement-ledger>div:nth-child(3){background:#f2f8f4;border-color:#c9dfd0}
  .settlement-ledger>div:nth-child(3) b{color:#287247}
  .settlement-ledger span{display:block;color:var(--muted);font-size:11px}
  .settlement-ledger b{display:block;margin-top:3px;font-size:14px}
  .settlement-filter-bar{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 10px}
  .settlement-filter-btn,.settlement-mini-btn{border:1px solid var(--line);background:#fff;color:var(--text);cursor:pointer;font-weight:800;box-sizing:border-box}
  .settlement-filter-btn{border-radius:999px;padding:7px 12px;font-size:11px}
  .settlement-filter-btn.active{border-color:var(--accent,#d1466a);background:color-mix(in srgb,var(--accent,#d1466a) 10%,white);color:var(--accent,#d1466a)}
  .settlement-result-box{display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;min-width:150px}
  .settlement-result-box strong{display:inline-flex;align-items:center;justify-content:center;min-width:86px;min-height:30px;padding:5px 9px;border-radius:9px;white-space:nowrap}
  .settlement-result-refund{background:#fff0f2;color:#b4364c;font-weight:900}
  .settlement-result-due{background:#edf5ff;color:#286da7;font-weight:900}
  .settlement-result-even{background:#eef7f1;color:#287247;font-weight:900}
  .settlement-source.manual{display:inline-flex;align-items:center;min-height:24px;padding:3px 7px;border:1px solid #e3b65e;border-radius:999px;background:#fff7dc;color:#9a6800;font-size:9px;font-weight:900}
  .settlement-adjust-actions{display:flex;gap:5px}
  .settlement-mini-btn{min-width:34px;height:30px;padding:0 8px;border-radius:9px;font-size:10px}
  .settlement-mini-btn[data-settlement-adjust="refund"]{border-color:#efbdc5;background:#fff5f6;color:#b4364c}
  .settlement-mini-btn[data-settlement-adjust="supplement"]{border-color:#bfd8f0;background:#f3f8ff;color:#286da7}
  .settlement-mini-btn:hover{filter:brightness(.98);transform:translateY(-1px)}
  .payment-admin-note{display:inline-block;min-width:96px;min-height:28px;padding:5px 8px;border:1px solid var(--line);border-radius:8px;background:#fff;text-align:left;outline:none}
  .payment-admin-note:focus{border-color:var(--accent,#d1466a);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent,#d1466a) 12%,transparent)}
  .payment-admin-note:empty:before{content:attr(data-placeholder);color:var(--muted);font-weight:400}
  .settlement-empty{padding:18px;color:var(--muted);text-align:center;font-weight:600}
  @media(max-width:760px){.settlement-dashboard-head{align-items:flex-start;flex-direction:column}.settlement-head-actions{justify-content:flex-start}.settlement-ledger{grid-template-columns:1fr}.settlement-dashboard{padding:10px}.settlement-filter-bar{flex-wrap:nowrap;overflow:auto;padding-bottom:3px}.settlement-status-btn,.settlement-status-label{min-width:94px}.settlement-result-box{min-width:132px}}


/* V7: one switch controls both difference display and settlement center */
.settlement-mode-toggle{
  border-color:#d8cedd!important;
  background:#fff!important;
  color:var(--text)!important;
}
.settlement-mode-toggle.active{
  border-color:#d7a9b8!important;
  background:#fff1f5!important;
  color:#a83153!important;
  box-shadow:0 0 0 2px rgba(209,70,106,.08);
}
#toggleSettlementDashboardBtn[hidden]{display:none!important}

/* V5.1: unify every settlement status control */
.settlement-status-btn,
.settlement-status-label{
  display:inline-flex!important;
  align-items:center!important;
  justify-content:center!important;
  width:104px!important;
  min-width:104px!important;
  height:34px!important;
  min-height:34px!important;
  padding:0 12px!important;
  margin:0!important;
  border-width:1px!important;
  border-style:solid!important;
  border-radius:10px!important;
  box-sizing:border-box!important;
  font:900 11px/1 system-ui,-apple-system,"Segoe UI",sans-serif!important;
  letter-spacing:0!important;
  white-space:nowrap!important;
  vertical-align:middle!important;
}
.settlement-status-label{cursor:default!important;}

html.auth-pending body,html.auth-locked body{overflow:hidden;}
.auth-gate{position:fixed;inset:0;z-index:10000;display:flex;align-items:center;justify-content:center;overflow:auto;padding:24px;background:radial-gradient(circle at 18% 16%,rgba(190,176,244,.45),transparent 38%),radial-gradient(circle at 84% 18%,rgba(250,194,216,.46),transparent 42%),linear-gradient(135deg,#f2efff 0%,#fbf2f7 56%,#f8f7ff 100%);font-family:"Zen Maru Gothic","Hiragino Sans","Microsoft YaHei",sans-serif;color:#2a2731;}
.auth-gate *{box-sizing:border-box;}
.auth-gate[hidden]{display:none!important;}
.auth-card{position:relative;width:min(350px,100%);padding:25px 24px 21px;border:1px solid rgba(255,255,255,.78);border-radius:20px;background:rgba(255,255,255,.94);box-shadow:0 24px 68px rgba(57,42,75,.18),0 4px 18px rgba(57,42,75,.08);backdrop-filter:blur(18px);-webkit-backdrop-filter:blur(18px);}
.auth-brand-mark{display:grid;width:50px;height:50px;margin:0 auto 12px;place-items:center;border-radius:15px;background:#241d2b;color:#fff;box-shadow:0 10px 24px rgba(36,29,43,.22)}.auth-brand-mark svg{width:25px;height:25px;fill:none;stroke:currentColor;stroke-width:1.7;stroke-linecap:round;stroke-linejoin:round}
.auth-card h2{margin:0 0 4px;color:#30223d;font-size:20px;text-align:center;letter-spacing:.04em}.auth-card>.auth-subtitle{margin:0 0 18px;color:#91889b;font-size:11px;line-height:1.55;text-align:center}
.auth-form{display:grid;gap:10px}.auth-form[hidden]{display:none!important}.auth-form label{display:grid;gap:4px;color:#564e60;font-size:11px;font-weight:850}.auth-form input{display:block;width:100%;height:42px;min-height:42px;padding:7px 12px;border:1px solid #ddd5e5;border-radius:10px;background:#fff;color:#2a2731;font-size:16px;line-height:1.2;outline:none;transition:border-color .18s,box-shadow .18s}.auth-form input::placeholder{color:#aaa1b5}.auth-form input:focus{border-color:#8d78a4;box-shadow:0 0 0 3px rgba(126,101,150,.12)}
.auth-submit{min-height:42px;margin-top:3px;border:0;border-radius:10px;background:#241d2b;color:#fff;font-size:13px;font-weight:900;cursor:pointer;box-shadow:0 8px 18px rgba(36,29,43,.14);transition:transform .18s,box-shadow .18s,background .18s}.auth-submit:hover{background:#35283f;box-shadow:0 10px 22px rgba(36,29,43,.2);transform:translateY(-1px)}.auth-submit:disabled{opacity:.55;cursor:wait;transform:none}
.auth-tabs{display:flex;align-items:center;justify-content:center;gap:4px;margin-top:13px;color:#938a9c;font-size:11px}.auth-tabs button{min-height:24px;padding:2px 3px;border:0;background:transparent;color:#d1466a;font-size:11px;font-weight:900;cursor:pointer}.auth-tabs button:hover{text-decoration:underline}.auth-tabs button[hidden]{display:none!important}
.auth-message{min-height:17px;margin-top:7px;color:#92899c;font-size:10px;line-height:1.45;text-align:center}.auth-message.bad{color:#c94f6d}.auth-message.ok{color:#2f9e5c}
.auth-account-badge{display:inline-flex;align-items:center;min-height:34px;padding:6px 10px;border:1px solid #e1d9e4;border-radius:8px;background:#f8f5f9;color:#5f5764;font-size:12px;font-weight:850}.auth-account-badge::before{content:"";width:7px;height:7px;margin-right:7px;border-radius:50%;background:#2f9e5c}
.workspacebar{display:flex;align-items:end;gap:7px;flex-wrap:wrap;overflow:visible;padding:9px 10px;border:1px solid #e6e0ea;border-radius:10px;background:#fff}.workspace-select-label{display:grid;flex:1 1 220px;gap:3px;min-width:180px;color:#867f92;font-size:10px;font-weight:800}.workspace-select-label select{width:100%;min-height:34px;padding:5px 30px 5px 9px;border:1px solid #ded6e1;border-radius:8px;background:#faf8fb;color:#2a2731;font-size:12px;font-weight:800}.workspacebar button{flex:0 0 auto;min-height:34px;padding:6px 10px;font-size:11px}.workspacebar>span{flex:1 1 100%;align-self:center;color:#867f92;font-size:11px}.workspace-empty-notice{margin-top:7px;padding:10px 12px;border:1px dashed #d9cbdc;border-radius:9px;background:#fbf8fc;color:#746b7a;font-size:12px}.workspace-side-panel{margin-top:7px;padding:10px;border:1px solid #e1d7e5;border-radius:10px;background:#fff}.workspace-panel-head{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:7px}.workspace-panel-head button{min-height:27px;padding:3px 8px;font-size:10px}.workspace-list{display:grid;gap:5px}.workspace-list-row{display:flex;align-items:center;gap:7px;min-height:34px;padding:6px 8px;border-radius:8px;background:#f8f5f9;font-size:11px}.workspace-list-row strong{min-width:0;overflow:hidden;text-overflow:ellipsis}.workspace-list-row small{color:#867f92}.workspace-list-row .workspace-row-actions{display:flex;gap:5px;margin-left:auto}.workspace-list-row button{min-height:26px;padding:3px 8px;border:1px solid #ded6e1;border-radius:7px;background:#fff;color:#5f5764;font-size:10px;font-weight:800}.workspace-list-row button.primary{border-color:#d1466a;background:#d1466a;color:#fff}.workspace-list-empty{padding:8px;color:#867f92;font-size:11px;text-align:center}
@media(max-width:620px){.auth-gate{align-items:flex-start;padding:calc(5vh + env(safe-area-inset-top)) 16px calc(18px + env(safe-area-inset-bottom))}.auth-card{width:min(338px,100%);padding:20px 17px 17px;border-radius:18px}.auth-brand-mark{width:44px;height:44px;margin-bottom:10px;border-radius:13px}.auth-brand-mark svg{width:22px;height:22px}.auth-card h2{font-size:18px}.auth-card>.auth-subtitle{margin-bottom:14px;font-size:10px}.auth-form{gap:8px}.auth-form input{height:40px;min-height:40px;font-size:16px}.auth-submit{min-height:40px}.auth-tabs{margin-top:10px}}
@media(max-width:620px){.workspacebar{display:grid;grid-template-columns:minmax(0,1fr) repeat(3,auto);gap:5px;padding:7px}.workspace-select-label{grid-column:1/-1;min-width:0}.workspace-select-label select{width:100%;min-height:31px;font-size:11px}.workspacebar button{min-height:29px;padding:4px 7px;font-size:9.5px}.workspacebar #createWorkspaceBtn{grid-column:1/2}.workspacebar>span{grid-column:1/-1;font-size:9.5px}.workspace-side-panel{padding:7px}.workspace-list-row{font-size:10px}}

  .settlement-status-btn,.settlement-status-label{display:inline-flex;align-items:center;justify-content:center;min-width:104px;min-height:34px;border:1px solid transparent;border-radius:999px;padding:7px 12px;font-size:11px;font-weight:900;line-height:1;white-space:nowrap;box-sizing:border-box}
  .settlement-status-btn{cursor:pointer;transition:transform .15s ease,box-shadow .15s ease,filter .15s ease}
  .settlement-status-btn:hover{transform:translateY(-1px);box-shadow:0 5px 14px rgba(44,35,52,.10)}
  .settlement-status-btn:disabled{cursor:default;transform:none;box-shadow:none}
  .settlement-status-refund{background:#fff0f2;border-color:#f2b8c1;color:#b4364c}
  .settlement-status-refund-done{background:#f9dce2;border-color:#e99aaa;color:#98283d}
  .settlement-status-supplement{background:#edf5ff;border-color:#b6d3f3;color:#286da7}
  .settlement-status-supplement-done{background:#dcecff;border-color:#91bce8;color:#185b93}
  .settlement-status-complete{background:#e8f6ed;border-color:#b6ddc3;color:#287247}

  .settlement-dashboard{margin-top:12px;padding:14px;border:1px solid var(--line);border-radius:14px;background:var(--panel,#fff);box-shadow:0 8px 24px rgba(60,40,70,.06)}
  .settlement-dashboard[hidden]{display:none!important}
  .settlement-dashboard-head{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-bottom:12px}
  .settlement-dashboard-head strong{font-size:16px;color:var(--text)}
  .settlement-head-actions{display:flex;flex-wrap:wrap;justify-content:flex-end;gap:7px}
  .settlement-ledger{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin-bottom:10px}
  .settlement-ledger>div{padding:10px 11px;border:1px solid var(--line);border-radius:10px;background:var(--soft,#fff)}
  .settlement-ledger>div:nth-child(1){background:#fff5f6;border-color:#f0c7ce}
  .settlement-ledger>div:nth-child(1) b{color:#b4364c}
  .settlement-ledger>div:nth-child(2){background:#f3f8ff;border-color:#c8ddf3}
  .settlement-ledger>div:nth-child(2) b{color:#286da7}
  .settlement-ledger>div:nth-child(3){background:#f2f8f4;border-color:#c9dfd0}
  .settlement-ledger>div:nth-child(3) b{color:#287247}
  .settlement-ledger span{display:block;color:var(--muted);font-size:11px}
  .settlement-ledger b{display:block;margin-top:3px;font-size:14px}
  .settlement-filter-bar{display:flex;flex-wrap:wrap;gap:6px;margin:4px 0 10px}
  .settlement-filter-btn,.settlement-mini-btn{border:1px solid var(--line);background:#fff;color:var(--text);cursor:pointer;font-weight:800;box-sizing:border-box}
  .settlement-filter-btn{border-radius:999px;padding:7px 12px;font-size:11px}
  .settlement-filter-btn.active{border-color:var(--accent,#d1466a);background:color-mix(in srgb,var(--accent,#d1466a) 10%,white);color:var(--accent,#d1466a)}
  .settlement-result-box{display:flex;align-items:center;justify-content:center;gap:6px;flex-wrap:wrap;min-width:150px}
  .settlement-result-box strong{display:inline-flex;align-items:center;justify-content:center;min-width:86px;min-height:30px;padding:5px 9px;border-radius:9px;white-space:nowrap}
  .settlement-result-refund{background:#fff0f2;color:#b4364c;font-weight:900}
  .settlement-result-due{background:#edf5ff;color:#286da7;font-weight:900}
  .settlement-result-even{background:#eef7f1;color:#287247;font-weight:900}
  .settlement-source.manual{display:inline-flex;align-items:center;min-height:24px;padding:3px 7px;border:1px solid #e3b65e;border-radius:999px;background:#fff7dc;color:#9a6800;font-size:9px;font-weight:900}
  .settlement-adjust-actions{display:flex;gap:5px}
  .settlement-mini-btn{min-width:34px;height:30px;padding:0 8px;border-radius:9px;font-size:10px}
  .settlement-mini-btn[data-settlement-adjust="refund"]{border-color:#efbdc5;background:#fff5f6;color:#b4364c}
  .settlement-mini-btn[data-settlement-adjust="supplement"]{border-color:#bfd8f0;background:#f3f8ff;color:#286da7}
  .settlement-mini-btn:hover{filter:brightness(.98);transform:translateY(-1px)}
  .payment-admin-note{display:inline-block;min-width:96px;min-height:28px;padding:5px 8px;border:1px solid var(--line);border-radius:8px;background:#fff;text-align:left;outline:none}
  .payment-admin-note:focus{border-color:var(--accent,#d1466a);box-shadow:0 0 0 3px color-mix(in srgb,var(--accent,#d1466a) 12%,transparent)}
  .payment-admin-note:empty:before{content:attr(data-placeholder);color:var(--muted);font-weight:400}
  .settlement-empty{padding:18px;color:var(--muted);text-align:center;font-weight:600}
  @media(max-width:760px){.settlement-dashboard-head{align-items:flex-start;flex-direction:column}.settlement-head-actions{justify-content:flex-start}.settlement-ledger{grid-template-columns:1fr}.settlement-dashboard{padding:10px}.settlement-filter-bar{flex-wrap:nowrap;overflow:auto;padding-bottom:3px}.settlement-status-btn,.settlement-status-label{min-width:94px}.settlement-result-box{min-width:132px}}

:root{
  --bg:#f7f5f8; --panel:#ffffff; --panel-2:#f7f5f9; --line:#e6e0ea;
  --text:#2a2731; --muted:#867f92;
  --accent:#d1466a; --accent-2:#5c67c4; --gold:#b8862f;
  --ok:#2f9e5c; --warn:#c0791f; --bad:#c94f6d;
  --radius:10px;
}
html{ scrollbar-gutter:stable; }
@supports(-webkit-touch-callout:none){ html,body{ min-height:-webkit-fill-available; } }
.wrap *{box-sizing:border-box;}
.wrap [hidden]{display:none!important;}
.wrap{ max-width:1600px; margin:0 auto; padding:16px; display:grid; grid-template-columns:238px minmax(0,1fr); gap:16px; align-items:start; font-family:"Zen Maru Gothic","Hiragino Sans","Microsoft YaHei",sans-serif; color:var(--text); background:linear-gradient(180deg,#fff 0,#faf8fb 220px); }
.app-sidebar{ position:sticky; top:16px; display:flex; flex-direction:column; gap:10px; height:calc(100vh - 32px); min-height:520px; padding:15px; border:1px solid var(--line); border-radius:16px; background:rgba(255,255,255,.96); box-shadow:0 10px 30px rgba(52,35,62,.08); overflow:hidden; }
.app-main{ min-width:0; }
.app-sidebar header{ flex:0 0 auto; margin:0!important; padding:2px 4px 7px; }
.app-sidebar .sheetbar{ position:static; flex:1 1 auto; min-height:120px; flex-direction:column; align-items:stretch; margin:0; padding:8px; overflow:hidden; background:#faf8fb; box-shadow:none; backdrop-filter:none; }
.app-sidebar .sheet-tabs{ flex:1 1 auto; flex-direction:column; align-items:stretch; overflow-x:hidden; overflow-y:auto; }
.app-sidebar .sheet-tab{ width:100%; min-height:38px; }
.app-sidebar .sheet-tab-name{ max-width:128px; flex:1; text-align:left; }
.sheet-library-tools{ display:grid; gap:5px; }
.sheet-library-tools input{ width:100%; min-width:0; padding:6px 8px; font-size:11px; }
.sheet-status-tabs{ display:grid; grid-template-columns:repeat(3,1fr); gap:3px; padding:3px; border-radius:8px; background:#f1edf3; }
.sheet-status-tabs button{ min-width:0; padding:4px 1px; border:0; background:transparent; color:var(--muted); font-size:9.5px; white-space:nowrap; word-break:keep-all; }
.sheet-status-tabs button.active{ background:#fff; color:var(--accent); box-shadow:0 1px 4px rgba(55,35,65,.09); }
.sheet-group-label{ padding:7px 7px 3px; color:#9a91a1; font-size:9.5px; font-weight:900; letter-spacing:.05em; }
.sheet-tab.is-completed{ color:#7d7682; }
.sheetbar-actions{ display:grid; grid-template-columns:1fr 1fr; gap:5px; }
.app-sidebar .sheet-add,.app-sidebar .sheet-complete-toggle{ width:100%; min-width:0; padding:7px 5px; font-size:10.5px; }
.sheet-complete-toggle{ border:1px solid #c8dfce; border-radius:8px; background:#eff9f2; color:#258048; font-weight:850; cursor:pointer; }
.sheet-complete-toggle.is-completed{ border-color:#dfd7e3; background:#f6f3f7; color:#736b78; }
.desktop-app-nav{ display:grid; flex:0 0 auto; gap:5px; }
.desktop-app-nav button{ display:grid; grid-template-columns:28px 52px 1fr; align-items:center; min-height:43px; padding:6px 9px; border:0; border-radius:10px; background:transparent; color:var(--muted); text-align:left; cursor:pointer; }
.desktop-app-nav button>span{ display:grid; place-items:center; width:25px; height:25px; border-radius:7px; background:#f3eff5; color:var(--accent); font-weight:900; }
.desktop-app-nav button>span svg,.mobile-bottom-nav button>span svg{ width:18px; height:18px; fill:none; stroke:currentColor; stroke-width:1.8; stroke-linecap:round; stroke-linejoin:round; }
.desktop-app-nav button>b{ color:var(--text); font-size:13px; }
.desktop-app-nav button>small{ overflow:hidden; color:var(--muted); font-size:10px; white-space:nowrap; text-overflow:ellipsis; }
.desktop-app-nav button.active{ background:#fff0f4; box-shadow:inset 3px 0 0 var(--accent); }
.desktop-app-nav button.active>span{ background:var(--accent); color:#fff; }
.cloud-hub{ position:sticky; top:0; z-index:24; padding:1px 0 4px; background:rgba(250,248,251,.94); backdrop-filter:blur(12px); }
.wrap[data-active-section="settings"] .cloud-hub{ position:static; }
.mobile-sheet-switch,.mobile-bottom-nav,.collab-compact-status{ display:none; }
.mobile-sheet-sort-overlay{ position:fixed; inset:0; z-index:170; display:none; align-items:flex-end; justify-content:center; padding:18px 12px 0; background:rgba(37,29,43,.32); -webkit-backdrop-filter:blur(2px); backdrop-filter:blur(2px); }
.mobile-sheet-sort-overlay.is-open:not([hidden]){ display:flex; }
.mobile-sheet-sort-overlay[hidden]{ display:none!important; }
.mobile-sheet-sort-dialog{ width:min(520px,100%); max-height:min(74vh,620px); max-height:min(74dvh,620px); display:flex; flex-direction:column; padding:12px 12px calc(12px + env(safe-area-inset-bottom)); border:1px solid #e2d9e6; border-bottom:0; border-radius:18px 18px 0 0; background:#fff; box-shadow:0 -12px 40px rgba(48,31,57,.18); }
.mobile-sheet-sort-head{ display:flex; align-items:center; justify-content:space-between; gap:10px; }
.mobile-sheet-sort-head strong{ color:#3c3441; font-size:14px; }
.mobile-sheet-sort-head button{ min-height:30px; padding:5px 12px; font-size:10.5px; }
.mobile-sheet-sort-hint{ margin:6px 0 8px; color:#8b8290; font-size:9.5px; line-height:1.45; }
.mobile-sheet-sort-list{ min-height:0; overflow:auto; display:grid; gap:5px; overscroll-behavior:contain; }
.mobile-sort-group{ padding:6px 3px 1px; color:#9b91a0; font-size:9.5px; font-weight:900; }
.mobile-sort-row{ display:grid; grid-template-columns:minmax(0,1fr) 34px 34px; align-items:center; gap:5px; min-height:39px; padding:5px 6px 5px 10px; border:1px solid #e6dfe9; border-radius:9px; background:#faf8fb; }
.mobile-sort-row.active{ border-color:#efcad5; background:#fff3f6; }
.mobile-sort-row-name{ min-width:0; overflow:hidden; color:#5f5764; font-size:11px; font-weight:800; text-overflow:ellipsis; white-space:nowrap; }
.mobile-sort-row button{ width:34px; height:29px; min-width:34px; padding:0; border:1px solid #d9d0dd; border-radius:7px; background:#fff; color:#766b7a; font-size:13px; font-weight:900; touch-action:manipulation; }
.mobile-sort-row button:disabled{ opacity:.25; }
.wrap:not([data-active-section="settings"]) .workspacebar,.wrap:not([data-active-section="settings"]) .workspace-empty-notice,.wrap:not([data-active-section="settings"]) .workspace-side-panel,.wrap:not([data-active-section="settings"]) .cloudbar,.wrap:not([data-active-section="settings"]) .edit-lock-controls,.wrap:not([data-active-section="settings"]) .collab-activity{ display:none!important; }
.wrap:not([data-active-section="settings"]) .collab-compact-status{ display:block; margin:0 0 7px; padding:8px 11px; border:1px solid var(--line); border-radius:10px; background:#fff; color:var(--muted); font-size:12px; font-weight:900; text-align:center; }
.app-section-hidden{ display:none!important; }
.settings-cloud-tip{ display:flex; align-items:center; gap:8px; max-width:920px; margin-bottom:8px; padding:8px 10px; border:1px solid #ead9df; border-radius:9px; background:#fff7fa; color:var(--muted); font-size:11px; }
.settings-cloud-tip strong{ color:var(--accent); }
.settings-tool-grid{ display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); align-items:start; gap:8px; max-width:920px; }
.settings-data-actions{ width:100%; }
.settings-data-actions>summary{ min-height:34px; padding:7px 10px; cursor:pointer; font-size:11.5px; }
.settings-data-actions>.data-actions-pop{ position:static; width:100%; max-width:none; margin-top:6px; padding:7px; box-shadow:none; grid-template-columns:repeat(2,minmax(0,1fr)); }
.app-confirm-overlay{ position:fixed; z-index:200; inset:0; display:grid; place-items:center; padding:18px; background:rgba(35,27,40,.38); backdrop-filter:blur(3px); }
.app-confirm-overlay[hidden]{ display:none; }
.app-confirm-card{ width:min(400px,100%); padding:18px; border:1px solid #eadde5; border-radius:15px; background:#fff; box-shadow:0 18px 55px rgba(43,28,50,.22); }
.app-confirm-card strong{ display:block; color:var(--text); font-size:16px; }
.app-confirm-card p{ margin:9px 0 16px; color:var(--muted); font-size:13px; line-height:1.65; white-space:pre-wrap; }
.app-confirm-card>div{ display:flex; justify-content:flex-end; gap:8px; }
.custom-select-overlay{ position:fixed; z-index:260; inset:0; background:rgba(31,24,36,.18); }
.custom-select-overlay[hidden]{ display:none; }
.custom-select-menu{ position:fixed; display:grid; max-height:min(340px,70vh); padding:5px; overflow:auto; border:1px solid #ded5e2; border-radius:10px; background:#fff; box-shadow:0 14px 38px rgba(40,27,47,.22); overscroll-behavior:contain; -webkit-overflow-scrolling:touch; }
.custom-select-group{ padding:7px 9px 4px; color:#968d9c; font-size:10px; font-weight:900; }
.custom-select-option{ display:grid; grid-template-columns:minmax(0,1fr) 18px; align-items:center; gap:8px; width:100%; min-height:35px; padding:7px 9px; border:0; border-radius:7px; background:#fff; color:var(--text); font:inherit; font-size:12px; text-align:left; cursor:pointer; }
.custom-select-option:hover,.custom-select-option.selected{ background:#fff0f4; color:var(--accent); }
.custom-select-option.selected::after{ content:"✓"; color:var(--accent); font-weight:900; text-align:center; }
.custom-select-option:disabled{ background:#f7f5f8; color:#aaa2ae; cursor:not-allowed; }
.wrap header{ margin-bottom:14px; }
.wrap .eyebrow{ font-size:12px; letter-spacing:.2em; color:var(--accent); font-weight:700; }
.wrap h1{ margin:3px 0 0; font-size:24px; font-weight:800; letter-spacing:.02em; }
.wrap .lead{ margin:5px 0 0; color:var(--muted); font-size:12.5px; line-height:1.55; }
.mobile-view-switch{ display:none; }
.sheetbar{ position:sticky; top:0; z-index:20; display:flex; align-items:center; gap:7px; margin:0 0 12px; padding:7px; background:rgba(255,255,255,.94); border:1px solid var(--line); border-radius:11px; box-shadow:0 4px 16px rgba(53,36,62,.06); backdrop-filter:blur(10px); }
.cloudbar{ display:flex; flex-wrap:wrap; align-items:center; gap:7px; margin:-5px 0 12px; padding:8px; border:1px solid var(--line); border-radius:11px; background:#fff; }
.cloudbar input{ width:150px; }
#cloudStatus{ color:var(--muted); font-size:12px; text-align:right; white-space:nowrap; }
.edit-lock-controls{ display:flex; flex-wrap:wrap; align-items:center; gap:7px; margin:-5px 0 12px; padding:8px; border:1px solid var(--line); border-radius:11px; background:#fff; }
.edit-lock-controls label{ display:flex; align-items:center; gap:7px; color:var(--muted); font-size:12px; font-weight:800; }
.edit-lock-controls input{ width:150px; }
#editLockStatus,#collabStatus{ margin-left:auto; color:var(--muted); font-size:12px; font-weight:800; white-space:nowrap; }
.collab-activity{ margin:-5px 0 12px; padding:9px 12px; border:1px solid #ddd6e5; border-radius:11px; background:#fcfbfd; color:var(--muted); font-size:12px; }
.collab-activity>div{ display:flex; align-items:center; gap:10px; flex-wrap:wrap; }
.collab-activity strong{ color:var(--text); }
#collabOnlinePeople{ color:var(--ok); font-weight:800; }
.collab-activity details{ margin-top:7px; }
.collab-activity summary{ width:max-content; color:var(--accent-2); font-weight:800; cursor:pointer; }
.collab-recent-list{ display:grid; gap:5px; margin-top:7px; }
.collab-recent-item{ display:flex; justify-content:space-between; gap:10px; padding-top:5px; border-top:1px dashed var(--line); }
.collab-recent-item time{ flex:0 0 auto; color:#a098aa; }
.edit-lock-banner{ margin:-5px 0 12px; padding:9px 12px; border:1px solid #e3b35e; border-radius:10px; background:#fff6df; color:#835a12; font-size:13px; font-weight:800; text-align:center; }
.cloud-edit-readonly .sheetbar button,.cloud-edit-readonly .panel input,.cloud-edit-readonly .panel select,.cloud-edit-readonly .panel textarea,.cloud-edit-readonly .panel button,.cloud-edit-readonly .panel [contenteditable="true"]{ pointer-events:none!important; }
.cloud-edit-readonly .sheetbar{ pointer-events:none!important; }
.cloud-edit-readonly .sheetbar,.cloud-edit-readonly .panel{ opacity:.78; }
.cloud-edit-readonly .panel{ user-select:text; }
#localStatus{ color:var(--ok); font-size:12px; font-weight:800; white-space:nowrap; }
.sheet-tabs{ display:flex; align-items:center; gap:6px; overflow-x:auto; flex:1; padding-bottom:1px; }
.sheet-tab{ display:flex; align-items:center; flex:0 0 auto; border:1px solid transparent; border-radius:9px; background:transparent; color:var(--muted); min-height:36px; padding:0 5px 0 13px; cursor:pointer; }
.sheet-tab:hover{ background:#faf6fa; color:var(--text); }
.sheet-tab.active{ color:var(--accent); background:#fff0f4; border-color:#efcad5; font-weight:700; }
.sheet-tab-name{ min-width:0; max-width:130px; flex:1 1 auto; overflow:hidden; text-overflow:ellipsis; white-space:nowrap; font-size:13px; }
.sheet-drag-handle{ position:relative; display:none; width:13px; height:22px; min-width:13px; cursor:grab; opacity:.55; }
.sheet-drag-handle::before{ content:""; position:absolute; left:3px; top:5px; width:8px; height:12px; background:radial-gradient(circle,#9e91a2 1.15px,transparent 1.3px) 0 0/4px 4px; }
.sheet-tab:hover .sheet-drag-handle,.sheet-tab.active .sheet-drag-handle{ display:block; }
.sheet-drag-handle:active{ cursor:grabbing; opacity:.9; }
.sheet-tab.dragging{ opacity:.38; }
.sheet-tab.drag-over{ outline:2px dashed var(--accent); outline-offset:2px; }
.sheet-close{ width:24px; height:24px; display:grid; place-items:center; margin-left:5px; border-radius:7px; color:#aaa0ad; font-size:16px; }
.sheet-close:hover{ color:var(--bad); background:#fff; }
.wrap .sheet-add{ flex:0 0 auto; padding:8px 12px; color:var(--accent); background:#fff; border:1px dashed #dfa9b8; }
.wrap .panel{ background:rgba(255,255,255,.97); border:1px solid var(--line); border-radius:12px; padding:16px; margin-bottom:12px; box-shadow:0 5px 20px rgba(58,38,68,.045); }
.wrap .panel h2{ font-size:14px; margin:0 0 11px; color:var(--muted); font-weight:700; display:flex; align-items:center; gap:7px; }
.wrap .panel h2::before{ content:""; width:3px; height:14px; background:var(--accent); border-radius:2px; display:inline-block; }
.wrap .panel-toggle{ margin-left:auto; padding:5px 10px; border:1px solid var(--line); border-radius:7px; background:var(--panel-2); color:var(--muted); font-size:12px; }
.wrap .panel.collapsed{ padding-top:14px; padding-bottom:14px; }
.wrap .panel.collapsed h2{ margin-bottom:0; }
.wrap .panel.collapsed > :not(h2){ display:none!important; }
#columnList{ max-height:480px; overflow:auto; padding-right:5px; scrollbar-gutter:stable; }
.wrap .row{ display:flex; gap:10px; flex-wrap:wrap; align-items:center; }
.wrap .grid{ display:grid; grid-template-columns:repeat(3,1fr); gap:9px 10px; }
.price-grid{ grid-template-areas:"type count jpy" "rate average manual" "ticket transport empty"; align-items:start; }
.price-type-field{ grid-area:type; }
.count-field{ grid-area:count; }
.jpy-field{ grid-area:jpy; }
.rate-field{ grid-area:rate; }
.average-mode-field{ grid-area:average; }
.manual-average-field{ grid-area:manual; }
.ticket-field{ grid-area:ticket; }
.transport-field{ grid-area:transport; }
.manual-average-field.is-hidden{ visibility:hidden; pointer-events:none; }
.fee-card{ min-width:0; }
.wrap label{ display:block; font-size:13px; color:var(--muted); margin:0 0 6px; }
.wrap input[type=text], .wrap input[type=number], .wrap textarea, .wrap select{
  width:100%; background:var(--panel-2); border:1px solid var(--line); color:var(--text);
  border-radius:8px; padding:7px 10px; font-size:13px; outline:none; font-family:inherit;
}
.wrap input:focus, .wrap textarea:focus, .wrap select:focus{ border-color:var(--accent); box-shadow:0 0 0 3px rgba(209,70,106,.12); }
.wrap .checkline{ display:flex; align-items:center; gap:8px; margin-top:8px; font-size:13px; color:var(--muted); }
.wrap .checkline input{ width:auto; }
.wrap .checkline label{ margin:0; color:inherit; }
.wrap button{ border:none; border-radius:8px; padding:8px 13px; font-size:12.5px; cursor:pointer; font-weight:700; transition:transform .08s ease, opacity .15s ease; font-family:inherit; }
.wrap button:active{ transform:scale(0.97); }
.wrap .btn-primary{ background:var(--accent); color:#fff; }
.wrap .btn-primary:hover{ opacity:.9; }
.wrap .btn-ghost{ background:var(--panel-2); color:var(--text); border:1px solid var(--line); }
.wrap .btn-ghost:hover{ border-color:var(--accent); }
.wrap .btn-danger{ background:transparent; color:var(--bad); border:1px solid #ecc3ce; }
.wrap .btn-danger:hover{ background:#fbe6ea; }
.wrap .btn-mini{ padding:4px 9px; font-size:11.5px; border-radius:6px; }
.wrap .filelabel{ display:inline-flex; align-items:center; cursor:pointer; }
.wrap .import-backup{ font-weight:900; }
.wrap label.btn-ghost{ margin:0; padding:9px 16px; min-height:36px; line-height:16px; color:var(--text); border-radius:8px; }
.wrap textarea{ min-height:110px; resize:vertical; line-height:1.6; }
.wrap .hint{ font-size:12px; color:var(--muted); line-height:1.6; }
.wrap .hintrow{ display:flex; align-items:center; gap:8px; }
.wrap .summary{ display:grid; grid-template-columns:repeat(4,1fr); gap:8px; margin:11px 0 3px; }
.wrap .stat{ border:1px solid var(--line); border-radius:9px; padding:9px 10px; background:#fafaff; }
.wrap .stat span{ display:block; color:var(--muted); font-size:12px; margin-bottom:4px; }
.wrap .stat strong{ font-size:16px; }
.wrap .stat.highlight{ background:#fdeef2; border-color:#f0c4d1; }
.wrap .stat.highlight strong{ color:var(--accent); }
.wrap .warn{ background:#fff5e6; border:1px solid #f0d29e; color:#875610; border-radius:10px; padding:10px 12px; font-size:13px; line-height:1.6; margin-top:12px; }
.wrap .formula{ background:#fafaff; border:1px dashed #d4cfe6; border-radius:10px; padding:11px 13px; color:#5f6470; font-size:12.5px; line-height:1.9; margin-top:12px; }
.wrap table{ width:100%; border-collapse:collapse; font-size:13px; }
.wrap thead th{ text-align:left; font-size:11.5px; color:var(--muted); font-weight:700; padding:8px; border-bottom:1px solid var(--line); white-space:nowrap; }
.wrap tbody td{ padding:7px 8px; border-bottom:1px solid #ece7f0; vertical-align:middle; }
.wrap .table-scroll{ overflow-x:auto; }
.wrap .col-card{ display:grid; grid-template-columns:42px 76px minmax(130px,1fr) minmax(170px,1.35fr) 86px 132px 100px 108px; align-items:center; gap:8px; padding:8px; border:1px solid var(--line); border-radius:8px; margin-bottom:8px; }
.wrap .col-index{ width:42px; text-align:center; white-space:nowrap; color:var(--muted); font-size:12px; }
.wrap .col-card input[type=text]{ min-width:0; width:100%; }
.wrap .col-card .alias-input{ min-width:0; }
.wrap .col-card label{ font-size:12px; color:var(--muted); display:flex; align-items:center; gap:4px; white-space:nowrap; margin:0; }
.wrap .col-card select{ width:100%; }
.wrap .col-card .mode-slot{ width:132px; min-width:132px; }
.wrap .col-card .mode-slot label{ width:100%; }
.wrap .col-card .modeval{ width:78px; min-width:0; }
.wrap .col-card .promotion-point-slot{ width:100px; min-width:100px; }
.wrap .col-card .promotion-point-slot input{ width:48px; min-width:0; }
.wrap .col-media{ display:grid; grid-template-columns:38px 30px; gap:6px; align-items:center; width:76px; }
.wrap .col-actions{ display:flex; gap:4px; justify-content:flex-end; width:108px; }
.wrap .col-actions .btn-mini{ padding:4px 7px; }
.catalog-panel{ margin-top:10px; padding:10px; border:1px solid var(--line); border-radius:10px; background:#faf8fb; }
.catalog-head{ display:grid; grid-template-columns:auto minmax(150px,280px); justify-content:space-between; align-items:center; gap:10px; margin-bottom:8px; }
.catalog-tools{ display:flex; align-items:center; gap:7px; flex-wrap:wrap; margin-bottom:7px; padding:6px; border:1px solid var(--line); border-radius:9px; background:#fff; }
.catalog-filter-tabs{ display:flex; gap:3px; padding:3px; border-radius:7px; background:var(--panel-2); }
.catalog-filter-tabs button{ padding:5px 9px; background:transparent; color:var(--muted); }
.catalog-filter-tabs button.active{ background:#fff; color:var(--accent); box-shadow:0 1px 4px rgba(60,40,70,.1); }
.catalog-tools select{ width:auto; min-width:105px; padding:5px 25px 5px 7px; }
.catalog-sort-control{ display:flex!important; align-items:center; gap:4px; margin:0!important; }
.catalog-selection-count{ color:var(--muted); font-size:11px; font-weight:800; }
.catalog-list-empty{ padding:14px; color:var(--muted); text-align:center; font-size:12px; }
.catalog-item{ display:grid; grid-template-columns:22px 30px 42px minmax(100px,1fr) 118px minmax(120px,1fr) 76px auto auto; gap:7px; align-items:center; padding:7px; border-top:1px solid var(--line); }
.catalog-item:first-child{ border-top:0; }
.catalog-item img,.catalog-item .catalog-img-empty{ width:38px; height:38px; border-radius:6px; object-fit:cover; background:#eeeaf0; display:grid; place-items:center; color:var(--muted); font-size:10px; }
.catalog-select{ width:16px; height:16px; }
.catalog-pin{ display:grid; place-items:center; width:27px; height:27px; padding:0!important; border:1px solid var(--line)!important; background:#fff!important; color:#b1a7b5; }
.catalog-pin.active{ border-color:#e9bd5e!important; background:#fff8de!important; color:#ba7a00; }
.catalog-main{ display:grid; min-width:0; gap:2px; }
.catalog-main strong{ overflow:hidden; text-overflow:ellipsis; white-space:nowrap; }
.catalog-group-label{ color:var(--accent-2); font-size:10px; font-weight:800; }
.catalog-group-edit{ width:100%; min-width:0; padding:5px 6px!important; font-size:12px!important; }
.catalog-item .catalog-price{ color:var(--muted); font-size:12px; white-space:nowrap; }
.catalog-usage{ color:var(--muted); font-size:10px; line-height:1.3; text-align:center; }
#catalogList{ max-height:380px; overflow:auto; scrollbar-gutter:stable; }
.wrap .col-thumb{ width:38px; height:38px; border-radius:6px; object-fit:cover; border:1px solid var(--line); background:var(--panel-2); }
.wrap .col-thumb-empty{ width:38px; height:38px; border-radius:6px; border:1px dashed var(--line); background:var(--panel-2); display:flex; align-items:center; justify-content:center; font-size:10px; color:var(--muted); text-align:center; line-height:1.1; }
.wrap .img-label{ cursor:pointer; }
.wrap .pill{ font-size:12px; color:var(--accent-2); background:#eef0fb; border-radius:6px; padding:4px 8px; }
#matrixTable thead tr.header-row th img.head-img{ width:52px; height:52px; object-fit:cover; border-radius:6px; display:block; margin:0 auto 4px; border:1px solid #d8d3e0; }
#matrixWrap{ background:#fff; padding:6px; }
#matrixWrap .table-scroll{ max-height:620px; overflow:auto; border:1px solid #ded8e3; border-radius:8px; }
#matrixTable thead{ position:sticky; top:0; z-index:6; background:#fff; }
#matrixTable td, #matrixTable th{ text-align:center; border:1px solid #ded8e3; padding:8px 10px; min-width:92px; white-space:nowrap; }
#matrixTable td.seq-col, #matrixTable th:first-child{ min-width:38px; }
#matrixTable td.seq-col, #matrixTable thead td:first-child, #matrixTable thead th:first-child{ position:sticky; left:0; z-index:5; }
#matrixTable thead th:first-child{ z-index:8; }
#matrixTable thead tr.header-row th{ background:var(--panel-2); font-weight:700; color:var(--text); font-size:13px; }
#matrixTable tr.adj-row td{ font-size:12px; color:var(--muted); background:#faf9fb; }
#matrixTable tr.price-row td{ font-size:12px; font-weight:700; }
#matrixTable tr.promotion-point-row td{ font-size:12px; font-weight:800; color:var(--accent); background:#fff8fb; }
.matrix-price-input{ width:100%; min-width:72px; padding:2px 3px!important; border:0!important; border-radius:4px!important; background:transparent!important; box-shadow:none!important; color:inherit!important; font:inherit!important; font-weight:inherit!important; text-align:center; }
.matrix-price-input:focus{ background:#fff!important; box-shadow:inset 0 0 0 2px var(--accent)!important; }
.matrix-price-editor{ display:flex; align-items:center; justify-content:center; gap:2px; white-space:nowrap; }
.matrix-price-editor .matrix-price-input{ width:58px; min-width:0; flex:0 1 58px; }
.matrix-price-suffix{ color:inherit; font-weight:800; }
#matrixTable tr.adj-row td:first-child,#matrixTable tr.price-row td:first-child,#matrixTable tr.promotion-point-row td:first-child{ min-width:58px; width:58px; background:#f5f2f6; font-weight:900; z-index:9; }
#matrixTable td.adj-pos{ color:var(--bad); }
#matrixTable td.adj-neg{ color:var(--accent-2); }
#matrixTable td.adj-fix{ color:var(--gold); }
#matrixTable td.seq-col{ background:var(--panel-2); color:var(--muted); font-size:11.5px; width:32px; }
#matrixTable tbody td.cell.has-name{ cursor:grab; }
#matrixTable tbody td.cell{ cursor:text; min-height:34px; transition:background .15s,box-shadow .15s; }
#matrixTable tbody td.cell:hover{ background:#fff8fa; }
#matrixTable tbody td.cell:focus{ background:#fff; outline:none; box-shadow:inset 0 0 0 2px var(--accent); }
#matrixTable tbody td.cell.has-name{ position:relative; }
#matrixTable tbody td.cell.bought-cell{ padding-right:28px; background:#f3f8fc!important; color:#315d77!important; box-shadow:inset 0 0 0 1px #d8e8f2; font-weight:800; }
#matrixTable tbody td.cell.bought-cell::after{ content:"✓"; position:absolute; top:5px; right:5px; display:grid; width:15px; height:15px; place-items:center; border-radius:50%; background:#679fc3; color:#fff; font-size:9px; font-weight:900; line-height:1; }
#matrixTable.buy-mark-mode tbody td.cell.has-name{ cursor:pointer; -webkit-tap-highlight-color:transparent; touch-action:manipulation; }
#matrixTable.buy-mark-mode tbody td.cell.has-name:not(.bought-cell):hover{ background:#f6fafc; box-shadow:inset 0 0 0 1px #c7dce9; }
#matrixTable tbody td.seq-col.buy-row-target{ position:sticky; }
#matrixTable.buy-mark-mode tbody td.seq-col.buy-row-target{ cursor:pointer; -webkit-tap-highlight-color:transparent; touch-action:manipulation; }
#matrixTable.buy-mark-mode tbody td.seq-col.buy-row-target:hover{ background:#eef6fb; color:#47738f; }
#matrixTable tbody td.seq-col.buy-row-full::after,#matrixTable tbody td.seq-col.buy-row-partial::after{ position:absolute; top:3px; right:3px; display:grid; width:12px; height:12px; place-items:center; border-radius:50%; font-size:8px; font-weight:900; line-height:1; }
#matrixTable tbody td.seq-col.buy-row-full::after{ content:"✓"; background:#679fc3; color:#fff; }
#matrixTable tbody td.seq-col.buy-row-partial::after{ content:"−"; background:#e7f1f7; color:#4d7894; box-shadow:inset 0 0 0 1px #a9c4d5; }
.matrix-toggle.active{ border-color:#8fb9d2!important; background:#edf6fb!important; color:#315f7c!important; font-weight:900; }
.matrix-tip{ margin-bottom:10px; padding:8px 11px; background:#faf7fb; border-radius:8px; }
.matrix-heading-tools{ grid-template-columns:minmax(180px,1fr) auto; margin-bottom:10px; }
.matrix-project-title{ padding:11px 14px; margin-bottom:6px; border-radius:9px 9px 0 0; color:#fff; font-size:19px; font-weight:900; text-align:center; }
.matrix-options{ display:flex; gap:18px; align-items:center; margin:-4px 0 10px; }
.matrix-options .matrix-toggle{ padding:7px 12px; border:1px solid #dfcbd2; border-radius:8px; background:#fff; color:var(--accent); }
.matrix-options .matrix-toggle.off{ color:var(--muted); border-color:var(--line); background:var(--panel-2); }
#matrixTable tbody tr.complete-row td{ background:#e4f6e9; color:#176b38; font-weight:800; }
#matrixTable tbody tr.box-boundary-row td{ background:#91d34f; color:#173d18; font-weight:900; }
#matrixTable tbody tr.box-boundary-row td.seq-col{ color:#173d18; }
#matrixTable tbody tr.complete-row td.cell:focus{ background:#fff; color:var(--text); }
#matrixTable tbody td.cell.person-highlight{ background:#ffe36e!important; color:#452d00!important; box-shadow:inset 0 0 0 3px #e0a900!important; font-weight:900; }
.payment-summary{ margin-top:12px; }
.payment-tabs{ display:flex; gap:6px; margin-bottom:10px; padding:4px; border-radius:10px; background:var(--panel-2); }
.payment-tab{ flex:1; padding:8px 12px; border:0; border-radius:8px; background:transparent; color:var(--muted); font-weight:850; cursor:pointer; }
.payment-tab.active{ background:#fff; color:var(--accent); box-shadow:0 1px 5px rgba(75,45,61,.12); }
.cost-human-tip{ margin-top:10px; padding:9px 11px; border-radius:8px; background:#faf7fb; line-height:1.55; }
.payment-heading-tools{ display:grid; grid-template-columns:minmax(180px,1fr) auto auto; align-items:center; gap:10px; }
.payment-heading-tools label{ display:flex; align-items:center; gap:7px; margin:0; white-space:nowrap; }
.payment-heading-tools input[type=color]{ width:42px; height:34px; padding:3px; cursor:pointer; }
.payment-heading-tools select{ width:auto; min-width:82px; }
.payment-search-tools{ display:flex; align-items:center; gap:7px; flex-wrap:wrap; margin-top:9px; }
.payment-search-tools input{ max-width:300px; }
.payment-unpaid-count{ display:none!important; }
.payment-calc-toggle.active{ color:#176b38; border-color:#9fcfb0; background:#e4f6e9; }
.payment-range-tools{ display:flex; align-items:center; gap:9px; flex-wrap:wrap; margin-top:9px; padding:8px 10px; border:1px solid var(--line); border-radius:8px; background:var(--panel-2); }
.payment-range-tools label{ display:flex; align-items:center; gap:5px; margin:0; white-space:nowrap; }
.payment-range-tools input[type=number]{ width:72px; padding:6px 8px; }
.payment-qr-tools{ display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin-top:9px; }
.payment-qr-tools .qr-upload{ min-height:36px; }
.payment-project-title{ padding:11px 14px; border-radius:9px 9px 0 0; color:#fff; font-size:19px; font-weight:900; text-align:center; }
.payment-table-wrap{ overflow:auto; max-height:480px; border:1px solid var(--line); border-radius:9px; }
.payment-table{ width:100%; border-collapse:collapse; }
.payment-table{ font-size:14.5px; }
.payment-table th{ position:sticky; top:0; z-index:2; padding:7px 8px; border:1px solid #cfc7d2; background:#f5f2f6; color:var(--text); font-size:14px; font-weight:900; text-align:center; white-space:nowrap; }
.payment-table td{ padding:7px 8px; border:1px solid #d8d1db; background:#fff; text-align:center; line-height:1.35; vertical-align:middle; }
.payment-table td.payment-cn{ font-weight:900; background:#faf8fb; text-align:left; white-space:nowrap; }
.payment-table td.payment-item-name{ text-align:center; }
.payment-table td.payment-money{ color:#16703a; font-weight:900; white-space:nowrap; }
.payment-table tr.payment-paid-row td{ background:#e4f6e9; color:#176b38; }
.payment-table tr.payment-paid-row td.payment-cn,.payment-table tr.payment-paid-row td.payment-money{ background:#d9f1e0; color:#176b38; }
.payment-table tr.payment-partial-row td{ background:#fff8e3; }
.payment-table tr.payment-partial-row td.payment-cn,.payment-table tr.payment-partial-row td.payment-money{ background:#fff1c8; color:#835a12; }
.payment-received-note{ display:block; margin-top:3px; color:#a46d18; font-size:11px; font-weight:800; white-space:nowrap; }
.payment-bought-note{ display:block; margin-top:3px; color:#4e7390; font-size:10.5px; font-weight:800; line-height:1.35; white-space:normal; }
.payment-item-line{ display:block; line-height:1.55; }
.payment-item-line+.payment-item-line{ margin-top:2px; }
.payment-bought-inline{ display:inline-block; margin-left:5px; padding:1px 4px; border-radius:4px; background:#eef6fc; color:#4e7390; font-size:10px; font-weight:850; white-space:nowrap; }
.payment-bought-inline.is-missing{ background:#fff0dc; color:#a45f0b; }
.payment-bought-inline.is-complete{ background:#eaf5ed; color:#2b7547; }
.payment-bought-money{ display:block; margin-top:3px; padding:2px 5px; border-radius:5px; background:#eef6fc; color:#386f99; font-size:10.5px; font-weight:900; line-height:1.35; white-space:normal; }
.payment-bought-money.refund{ background:#fdebed; color:#b43e50; }
.payment-bought-money.due{ background:#fff2d8; color:#996312; }
.payment-bought-money.even{ background:#eaf5ed; color:#2b7547; }
.payment-table tr.payment-refund-row td{ background:#fdebed; color:#a93645; }
.payment-table tr.payment-refund-row td.payment-cn,.payment-table tr.payment-refund-row td.payment-money{ background:#f9dfe3; color:#a93645; }
.payment-table tr.payment-supplement-row td{ background:#eaf3fc; color:#2f6f9f; }
.payment-table tr.payment-supplement-row td.payment-cn,.payment-table tr.payment-supplement-row td.payment-money{ background:#dfeefa; color:#2f6f9f; }
.payment-table tr.payment-search-hit td{ background:#ffe993!important; color:#5b4100!important; box-shadow:inset 0 0 0 2px #dda914; }
.wrap .payment-paid-check,.wrap .payment-paid-all{ display:inline-grid; place-items:center; width:18px; height:18px; min-width:18px; margin:0 6px 0 0; padding:0; border:1.5px solid #9bbda5; border-radius:4px; background:#fff; color:#27834b; font-size:14px; font-weight:900; line-height:1; vertical-align:middle; cursor:pointer; }
.wrap .payment-paid-check[aria-pressed="true"],.wrap .payment-paid-all[aria-pressed="true"]{ border-color:#2f9e5c; background:#d9f1e0; }
.wrap .payment-paid-check[aria-pressed="mixed"],.wrap .payment-paid-all[aria-pressed="mixed"]{ border-color:#d19a35; background:#fff1c8; color:#9a6717; }
.payment-cn-controls{ display:inline-grid; grid-template-columns:18px 28px 28px; align-items:center; gap:4px; width:82px; margin-right:6px; vertical-align:middle; }
.payment-cn-controls .payment-paid-check,.payment-cn-controls .payment-refund-check,.payment-cn-controls .payment-supplement-check{ margin:0; }
.wrap .payment-refund-check,.wrap .payment-supplement-check{ display:inline-grid; place-items:center; width:28px; height:18px; min-width:28px; padding:0; border:1.5px solid #d89aa3; border-radius:4px; background:#fff; color:#b64251; font-size:11px; font-weight:900; line-height:1; vertical-align:middle; cursor:pointer; }
.wrap .payment-refund-check[aria-pressed="true"]{ border-color:#cf5968; background:#f9dfe3; color:#a93645; }
.wrap .payment-supplement-check{ border-color:#91b8d8; color:#347fbd; }
.wrap .payment-supplement-check[aria-pressed="true"]{ border-color:#4f91c5; background:#dfeefa; color:#2f6f9f; }
.payment-cn-name{ display:inline; }
.payment-adjustment-note{ display:inline-flex; gap:4px; margin-left:5px; font-size:12px; font-weight:900; white-space:nowrap; }
.payment-adjustment-refund{ color:#d04a59; }
.payment-adjustment-supplement{ color:#347fbd; }
.payment-table tfoot td.payment-total-label{ background:#fff4f7; color:var(--accent); font-weight:900; text-align:right; }
.payment-table tfoot td.payment-total-value{ background:#fff4f7; color:var(--accent); font-size:16px; font-weight:900; }
.payment-code-export{ width:100%; padding:0; border-top:1px solid var(--line); background:#fff; }
.payment-code-export img{ display:block; width:100%; height:auto; object-fit:contain; image-rendering:auto; background:#fff; }
.settlement-dashboard{ margin-top:10px; padding:12px; border:1px solid #ded6e3; border-radius:10px; background:#fcfbfd; }
.settlement-dashboard[hidden]{ display:none!important; }
.settlement-dashboard-head{ display:flex; align-items:center; justify-content:space-between; gap:8px; margin-bottom:9px; }
.settlement-dashboard-head strong{ font-size:14px; color:var(--text); }
.settlement-ledger{ display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:7px; margin-bottom:10px; }
.settlement-ledger>div{ padding:8px 9px; border:1px solid var(--line); border-radius:8px; background:#fff; }
.settlement-ledger span{ display:block; color:var(--muted); font-size:10.5px; }
.settlement-ledger b{ display:block; margin-top:3px; font-size:14px; }
.settlement-balance-ok{ color:var(--ok); } .settlement-balance-bad{ color:var(--bad); }
.settlement-dashboard table{ font-size:11.5px; }
.settlement-dashboard th,.settlement-dashboard td{ padding:6px 7px!important; text-align:center; }
.settlement-dashboard td:first-child{ text-align:left; font-weight:900; }
.settlement-result-refund{ color:#b43e50; font-weight:900; } .settlement-result-due{ color:#347fbd; font-weight:900; } .settlement-result-even{ color:var(--ok); font-weight:900; }
.settlement-warning{ margin-top:8px; padding:7px 9px; border-radius:8px; background:#fff1e8; color:#a65b15; font-size:11px; line-height:1.55; }
.payment-admin-note{ display:block; width:100%; min-width:110px; min-height:25px; padding:3px 6px; border:1px dashed #d9cfdc; border-radius:5px; background:#fff; color:#6f6674; font-size:10.5px; }
.payment-admin-note:empty::before{ content:"添加备注"; color:#aaa1ae; }
@media(max-width:620px){ .settlement-ledger{ grid-template-columns:1fr 1fr; } .settlement-dashboard{ padding:8px; } }
.payment-table [contenteditable=true]{ cursor:text; }
.payment-table [contenteditable=true]:focus{ outline:none; background:#fff7fa; box-shadow:inset 0 0 0 2px var(--accent); }
#matrixTable tbody td.cell.has-name:active{ cursor:grabbing; }
#matrixTable tbody td.cell.dragging{ opacity:.35; }
#matrixTable tbody td.cell.drop-hover{ background:#fdeef2; outline:2px dashed var(--accent); outline-offset:-2px; }
.wrap .empty{ text-align:center; padding:30px 10px; color:var(--muted); font-size:13px; }
.wrap .ocr-status{ font-size:12px; color:var(--gold); margin-top:8px; min-height:16px; }
.wrap .ocr-thumbs{ display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; }
.wrap .ocr-thumbs img{ height:70px; border:1px solid var(--line); border-radius:6px; }
.wrap .toolbar{ display:flex; gap:8px; flex-wrap:wrap; margin-top:10px; align-items:center; }
.transfer-row{ display:grid; grid-template-columns:minmax(180px,1fr) auto minmax(100px,auto); gap:8px; align-items:center; margin-top:10px; }
#transferPreviewTable .action-preview-input,#cancelPreviewTable .action-preview-input,#coldPromotionDraftTable .action-preview-input{ width:100%; min-width:92px; box-sizing:border-box; background:var(--panel-2); border:1px solid var(--line); border-radius:8px; padding:7px 10px; color:var(--text); font:inherit; outline:none; }
#transferPreviewTable .action-preview-input:focus,#cancelPreviewTable .action-preview-input:focus,#coldPromotionDraftTable .action-preview-input:focus{ border-color:var(--accent); box-shadow:0 0 0 3px rgba(209,70,106,.12); }
#transferPreviewTable .action-preview-qty,#cancelPreviewTable .action-preview-qty{ min-width:64px; width:72px; text-align:center; }
#transferPreviewTable .transfer-ok,#cancelPreviewTable .transfer-ok,#coldPromotionPreviewTable .transfer-ok{ color:var(--ok); font-weight:800; white-space:nowrap; }
#transferPreviewTable .transfer-bad,#cancelPreviewTable .transfer-bad,#coldPromotionPreviewTable .transfer-bad{ color:var(--bad); font-weight:800; white-space:nowrap; }
#coldPromotionPreviewTable td{ min-width:92px; }
#coldPromotionDraftTable td{ min-width:110px; }
#coldPromotionPreviewTable td:nth-child(3),#coldPromotionPreviewTable td:nth-child(4){ white-space:normal; line-height:1.5; }
.promotion-score{ font-weight:900; color:var(--accent); white-space:nowrap; }
.matrix-preview-notice{ margin:8px 0; padding:8px 10px; border:1px solid #e2b553; border-radius:8px; background:#fff8dc; color:#8a5b00; font-size:12.5px; font-weight:900; text-align:center; }
#matrixTable.is-preview tbody td.cell{ cursor:default; background-image:repeating-linear-gradient(135deg,rgba(209,70,106,.025) 0,rgba(209,70,106,.025) 5px,transparent 5px,transparent 10px); }
#matrixTable tbody tr.promotion-bundle-complete td{ background:#fff1bd!important; color:#765000!important; font-weight:850; }
#matrixTable tbody td.cell.promotion-bundle-pending{ background:#eee3ff!important; color:#6b3fa0!important; font-weight:900; box-shadow:inset 0 0 0 1px #d4bdf3; }
#matrixTable.is-preview tbody td.preview-order-added{ background:#fff1f5!important; color:#c94464!important; font-weight:900; box-shadow:inset 0 0 0 1px rgba(209,70,106,.28); }
#matrixTable.is-preview tbody td.preview-transfer-change{ background:#fff8ed!important; box-shadow:inset 0 0 0 2px #e8a24f; white-space:nowrap; }
#matrixTable.is-preview .preview-transfer-name{ display:inline-block; padding:2px 5px; border:1px solid #e8a24f; border-radius:6px; color:#a85f10; background:#fffaf1; font-weight:850; }
#matrixTable.is-preview .preview-transfer-arrow{ display:inline-block; margin:0 4px; color:#c47b28; font-weight:900; }
#matrixTable.is-preview tbody tr.preview-cancel-row>td{ background:#eaf6ff!important; color:#356f99!important; box-shadow:inset 0 1px 0 #c8e5f8,inset 0 -1px 0 #c8e5f8; }
.cold-bundle-bar{ display:flex; align-items:center; gap:8px; margin-top:9px; padding:8px 10px; border:1px solid var(--line); border-radius:9px; background:var(--panel-2); color:var(--muted); font-size:12.5px; }
.cold-bundle-chooser{ margin-top:8px; padding:10px; border:1px solid #efcad5; border-radius:10px; background:#fff8fb; }
.cold-bundle-list{ display:grid; grid-template-columns:repeat(auto-fit,minmax(130px,1fr)); gap:7px; margin-top:9px; }
.cold-bundle-list label{ display:flex; align-items:center; gap:6px; padding:6px 8px; border:1px solid var(--line); border-radius:7px; background:#fff; }
.cold-bundle-list label.is-fixed{ color:var(--muted); background:#f5f2f6; }
.data-actions{ position:relative; }
.data-actions summary{ list-style:none; cursor:pointer; padding:8px 13px; border:1px solid var(--line); border-radius:8px; background:var(--panel-2); font-size:12.5px; font-weight:800; }
.data-actions summary::-webkit-details-marker{ display:none; }
.data-actions-pop{ position:absolute; z-index:30; left:0; bottom:calc(100% + 6px); display:grid; grid-template-columns:1fr 1fr; gap:7px; width:390px; max-width:90vw; padding:9px; border:1px solid var(--line); border-radius:10px; background:#fff; box-shadow:0 10px 30px rgba(40,25,48,.16); }
.data-actions-pop .btn-ghost{ justify-content:center; margin:0; white-space:nowrap; font-weight:850; }
.quantity-heading-tools{ grid-template-columns:minmax(180px,1fr); margin-bottom:10px; }
.quantity-controls{ display:flex; gap:12px; flex-wrap:wrap; margin-bottom:10px; }
.quantity-controls label{ display:flex; align-items:center; gap:7px; margin:0; }
.count-value-editor{ display:inline-flex; align-items:center; justify-content:center; min-width:68px; min-height:36px; padding:7px 12px; border:1px solid #d9cdd6; border-radius:8px; background:#fff; color:var(--accent); font-size:16px; font-weight:900; cursor:text; }
.count-value-editor:empty::before{ content:"未设置"; color:var(--muted); font-size:12px; font-weight:700; pointer-events:none; }
.count-value-editor:focus{ outline:none; border-color:var(--accent); box-shadow:0 0 0 3px rgba(209,70,106,.12); }
.quantity-section-title{ margin:12px 0 6px; font-size:13px; font-weight:900; color:var(--text); }
.quantity-table-wrap{ overflow:auto; max-height:340px; border:1px solid var(--line); border-radius:8px; }
.quantity-table{ width:100%; border-collapse:collapse; font-size:13px; }
.quantity-table th,.quantity-table td{ padding:7px 9px; border:1px solid var(--line); text-align:center; white-space:nowrap; }
.quantity-table th{ background:var(--panel-2); font-weight:900; }
.quantity-people-table th:first-child,.quantity-people-table td:first-child{ position:sticky; left:0; z-index:2; min-width:92px; background:#fff; font-weight:900; }
.quantity-people-table th:first-child{ z-index:3; background:var(--panel-2); }
.quantity-people-table .quantity-stat-row td{ background:#f8f4f7; color:var(--text); font-weight:800; }
.quantity-people-table .quantity-stat-row td:first-child{ background:#f1e8ed; }
.quantity-people-table .quantity-box-row td{ background:#e8f7d7; color:#214d22; font-weight:800; }
.quantity-people-table .quantity-box-row td:first-child{ background:#91d34f; color:#173d18; }
.quantity-short{ color:var(--bad); font-weight:900; }
.quantity-breakdown{ display:grid; gap:2px; min-width:92px; }
.quantity-breakdown strong{ color:var(--text); font-size:13px; }
.quantity-breakdown small{ color:var(--muted); font-size:10.5px; white-space:nowrap; }
.quantity-segment-table th{ position:sticky; top:0; z-index:2; }
.quantity-segment-table td:nth-child(3),.quantity-segment-table td:nth-child(4),.quantity-segment-table td:nth-child(5),.quantity-segment-table td:nth-child(6){ white-space:nowrap; }
.quantity-cn-link,.box-node button{ padding:2px 6px; border:0; border-radius:6px; background:#fff0f4; color:var(--accent); font:inherit; font-weight:900; cursor:pointer; }
.quantity-cn-link.active{ background:#ffe36e; color:#5b3b00; box-shadow:inset 0 0 0 2px #e0a900; }
.quantity-item-summary td:first-child{ font-weight:900; }
.box-node-list{ display:flex; gap:5px; flex-wrap:wrap; min-width:180px; }
.box-node{ display:inline-flex; align-items:center; gap:2px; padding:4px 7px; border-radius:999px; white-space:nowrap; font-size:11px; font-weight:800; }
.box-node.done{ background:#e4f6e9; color:#176b38; }
.box-node.short{ background:#fff0f4; color:var(--bad); }
.quantity-ride-table th{ position:sticky; top:0; z-index:2; }
.quantity-ride-table td{ vertical-align:middle; }
.quantity-ride-table tr.ride-onboard td{ background:#edf9e5; }
.quantity-ride-table tr.ride-waiting td{ background:#fff6e8; }
.quantity-ride-table .ride-item{ min-width:105px; font-weight:900; background:#f6f2f5!important; }
.quantity-ride-table .ride-item small,.quantity-ride-table .ride-status small{ display:block; margin-top:3px; color:var(--muted); font-size:10.5px; font-weight:700; }
.quantity-ride-table .ride-item small.ride-missing{ color:#d93025!important; font-size:13px!important; font-weight:900!important; }
.quantity-ride-table .ride-item small.ride-full{ color:#188038!important; font-size:13px!important; font-weight:900!important; }
.quantity-ride-table .ride-status{ min-width:105px; }
.quantity-ride-table .ride-onboard .ride-status strong{ color:var(--ok); }
.quantity-ride-table .ride-waiting .ride-status strong{ color:var(--warn); }
.upload-button{ display:inline-flex!important; align-items:center; margin:0!important; padding:8px 13px; border-radius:8px; background:var(--accent); color:#fff!important; font-weight:700; cursor:pointer; }
.upload-button input{ display:none; }
.upload-count{ color:var(--muted); font-size:12px; }
#cartWrap{ background:linear-gradient(145deg,#fffafa 0%,#f8f8ff 100%); padding:24px; border:1px solid #eee7f0; border-radius:16px; }
#cartHeader{ display:flex; align-items:center; justify-content:space-between; gap:24px; font-size:27px; font-weight:900; color:var(--text); text-align:left; padding:18px 20px; margin:0 0 22px; border:0; background:#fff; border-radius:16px; white-space:pre-wrap; line-height:1.45; box-shadow:0 5px 18px rgba(63,42,72,.09); width:100%; }
#cartHeaderNote{ flex:1; min-width:0; }
#cartQrImage{ width:128px; height:128px; flex:0 0 128px; object-fit:contain; border-radius:10px; background:#fff; display:none; }
.cart-editor-row{ display:flex; align-items:stretch; gap:10px; margin-bottom:12px; }
.cart-editor-row textarea{ min-height:72px; flex:1; }
.qr-upload{ display:flex!important; align-items:center; justify-content:center; margin:0!important; padding:10px 14px; border:1px dashed #d4aab6; border-radius:9px; color:var(--accent)!important; cursor:pointer; white-space:nowrap; }
.qr-upload input{ display:none; }
.cart-controls{ display:flex; align-items:center; gap:12px; flex-wrap:nowrap; margin-bottom:12px; }
.cart-controls label{ margin:0; white-space:nowrap; }
.cart-controls select{ width:auto; min-width:150px; }
.cart-target-inputs{ display:flex; align-items:center; gap:5px; }
#cartGrid{ display:grid; grid-template-columns:repeat(var(--cart-cols,4),minmax(0,1fr)); gap:18px; align-items:start; }
.cart-card{ position:relative; border:1px solid rgba(225,216,230,.9); border-radius:16px; overflow:hidden; background:#fff; box-shadow:0 7px 20px rgba(57,38,66,.09); }
.cart-card .cart-img{ width:100%; aspect-ratio:1/1; object-fit:cover; display:block; background:#eceaf0; }
.cart-card .cart-img-empty{ width:100%; aspect-ratio:1/1; display:flex; align-items:center; justify-content:center; color:var(--muted); font-size:12px; background:#eceaf0; }
.cart-card .cart-name{ padding:13px 8px 14px; font-size:17px; font-weight:800; text-align:center; color:var(--text); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; }
.cart-badge{ position:absolute; padding:9px 14px; border-radius:999px; font-size:25px; font-weight:900; color:#fff; box-shadow:0 3px 9px rgba(35,25,40,.18); line-height:1; }
.cart-price{ top:9px; left:9px; }
.cart-price.up{ background:linear-gradient(135deg,#ef5c78,#cb3658); }
.cart-price.down{ background:linear-gradient(135deg,#6881e8,#4658b8); }
.cart-price.avg{ background:linear-gradient(135deg,#f2a543,#d77a19); }
.cart-price.fixed{ background:#b8862f; }
.cart-count{ bottom:58px; right:9px; padding:12px 17px; font-size:28px; background:rgba(38,31,44,.84); }
.cart-count.short{ background:#c0791f; }
.cart-count.done{ background:#2f9e5c; }
@media(max-width:900px){
  .wrap .grid{ grid-template-columns:1fr 1fr; }
  .price-grid{ grid-template-areas:"type count" "jpy rate" "average manual" "ticket transport"; }
  .wrap .summary{ grid-template-columns:1fr 1fr; }
}
@media(max-width:1050px){ .wrap .col-card{ grid-template-columns:42px 76px minmax(125px,1fr) minmax(150px,1fr) 82px 125px 100px 108px; overflow-x:auto; } }
@media(max-width:760px){
  body{ min-height:100vh; min-height:100dvh; padding-bottom:0; }
  .wrap{ display:block; max-width:none; min-height:100vh; min-height:100dvh; padding:10px 9px calc(84px + constant(safe-area-inset-bottom) + var(--browser-bottom-offset,0px)); padding-bottom:calc(84px + env(safe-area-inset-bottom) + var(--browser-bottom-offset,0px)); }
  .app-sidebar{ display:none; }
  .app-main{ width:100%; }
  .cloud-hub{ top:0; margin:-10px -9px 8px; padding:8px 9px 2px; border-bottom:1px solid rgba(220,211,224,.9); background:rgba(250,248,251,.96); }
  .wrap:not([data-active-section="settings"]) .cloudbar{ display:none; }
  .wrap:not([data-active-section="settings"]) .edit-lock-controls,.wrap:not([data-active-section="settings"]) .collab-activity{ display:none!important; }
  .wrap:not([data-active-section="settings"]) .collab-compact-status{ display:block; margin:0 0 6px; padding:6px 8px; border:1px solid var(--line); border-radius:9px; background:#fff; color:var(--muted); font-size:9.5px; font-weight:900; text-align:center; }
  .edit-lock-controls{ margin:0 0 6px; padding:7px; border-radius:10px; }
  .edit-lock-controls label{ flex:1 1 145px; width:auto; }
  .edit-lock-controls input{ min-width:90px; }
  #collabStatus{ order:5; width:100%; margin-left:0; white-space:normal; }
  .collab-activity{ margin:0 0 6px; }
  .cloudbar{ gap:4px; margin:0 0 6px; padding:6px; border-radius:9px; }
  .wrap .cloudbar input,.wrap .edit-lock-controls input{ height:29px; min-height:29px; padding:4px 6px; }
  .wrap .cloudbar button,.wrap .edit-lock-controls button{ min-height:28px; padding:4px 7px; border-radius:6px; font-size:10px; line-height:1.1; white-space:nowrap; }
  .edit-lock-controls label{ gap:4px; font-size:10px; }
  #localStatus,#cloudStatus,#collabStatus{ font-size:9.5px; }
  .mobile-sheet-switch{ position:relative; z-index:18; display:grid; grid-template-columns:minmax(0,1fr) repeat(5,34px); gap:4px; align-items:end; margin:0 0 9px; padding:7px; border:1px solid var(--line); border-radius:12px; background:#fff; box-shadow:0 4px 14px rgba(55,37,65,.06); }
  .mobile-sheet-switch label{ display:grid; gap:3px; margin:0; color:var(--muted); font-size:9.5px; font-weight:800; }
  .mobile-sheet-switch select{ width:100%; min-width:0; height:36px; padding:6px 27px 6px 9px; border-color:#dbcfd9; color:var(--text); font-weight:800; }
  .mobile-sheet-switch button{ min-width:0; width:34px; height:36px; padding:5px 1px; font-size:9.5px; }
  .mobile-bottom-nav{ position:fixed; z-index:80; left:0; right:0; bottom:var(--browser-bottom-offset,0px); display:grid; grid-template-columns:repeat(5,1fr); padding:6px 7px calc(6px + constant(safe-area-inset-bottom)); padding-bottom:calc(6px + env(safe-area-inset-bottom)); border-top:1px solid rgba(220,211,224,.96); background:rgba(255,255,255,.96); box-shadow:0 -8px 24px rgba(47,31,56,.1); -webkit-backdrop-filter:blur(15px); backdrop-filter:blur(15px); transform:translateZ(0); }
  .mobile-bottom-nav button{ display:grid; place-items:center; gap:1px; min-width:0; min-height:50px; padding:4px 2px; border:0; border-radius:10px; background:transparent; color:#8b8392; font-size:10px; cursor:pointer; }
  .mobile-bottom-nav button span{ font-size:18px; font-weight:900; line-height:1; }
  .mobile-bottom-nav button b{ font-size:9.5px; }
  .mobile-bottom-nav button.active{ background:#fff0f4; color:var(--accent); }
  .mobile-bottom-nav button.active b{ font-weight:900; }
  .custom-select-overlay{ background:rgba(31,24,36,.24); backdrop-filter:blur(1px); }
  .custom-select-menu{ max-height:min(330px,58vh); max-height:min(330px,58dvh); padding:4px; border-radius:10px; }
  .custom-select-group{ padding:6px 8px 3px; font-size:9px; }
  .custom-select-option{ min-height:31px; padding:5px 8px; font-size:11px; }
  body.mobile-keyboard-open .mobile-bottom-nav{ display:none; }
  .settings-tool-grid{ grid-template-columns:1fr; gap:6px; max-width:none; }
  .settings-cloud-tip{ align-items:flex-start; flex-direction:column; gap:2px; max-width:none; margin-bottom:6px; padding:7px 8px; font-size:10px; }
  .settings-data-actions>.data-actions-pop{ position:static; left:auto; right:auto; bottom:auto; width:100%; max-width:none; grid-template-columns:1fr; }
  footer{ padding:5px 8px 12px; color:var(--muted); font-size:9px; line-height:1.45; text-align:center; }
}
@media(max-width:620px){
  .wrap{ padding:12px 9px calc(84px + constant(safe-area-inset-bottom) + var(--browser-bottom-offset,0px)); padding-bottom:calc(84px + env(safe-area-inset-bottom) + var(--browser-bottom-offset,0px)); font-size:10.5px; }
  .wrap header{ margin-bottom:9px; }
  .wrap h1{ font-size:17px; }
  .wrap h2{ font-size:12px; }
  .desktop-setup.app-section-hidden{ display:none!important; }
  .cloudbar{ gap:6px; }
  .cloudbar input{ width:calc(50% - 3px); flex:1 1 140px; }
  .cloudbar #cloudStatus{ width:100%; margin-left:0; text-align:left; }
  .edit-lock-controls label{ flex:1 1 145px; width:auto; }
  .edit-lock-controls input{ flex:1; min-width:80px; width:auto; }
  #editLockStatus,#collabStatus{ width:100%; margin-left:0; white-space:normal; }
  .wrap .panel{ padding:12px; margin-bottom:9px; }
  #matrixPanel .toolbar > *{ display:inline-flex!important; }
  .matrix-tip,.matrix-options{ display:flex; }
  .wrap button,.wrap .btn-ghost,.wrap .btn-primary,.wrap .btn-danger,.wrap label{ font-size:10px; }
  .wrap .hint,.wrap .cost-human-tip{ font-size:9.5px; }
  .wrap input[type=text],.wrap input[type=number],.wrap textarea,.wrap select{ font-size:11px; }
  .wrap table{ font-size:10.5px; }
  #matrixTable [contenteditable=true],.payment-table [contenteditable=true]{ font-size:11px; }
  .matrix-price-input{ font-size:11px!important; }
  #matrixTable tr.adj-row td:first-child,#matrixTable tr.price-row td:first-child,#matrixTable tr.promotion-point-row td:first-child{ min-width:62px; width:62px; background:#f5f2f6; }
  #matrixTable thead td:first-child,#matrixTable thead th:first-child{ background:#f5f2f6; }
  .cart-controls{ overflow-x:auto; padding-bottom:3px; }
  .cart-editor-row{ flex-wrap:wrap; }
  .payment-heading-tools{ grid-template-columns:1fr 1fr; }
  .payment-heading-tools > #paymentTitleInput,.payment-heading-tools > #matrixTitleInput,.payment-heading-tools > #quantityTitleInput{ grid-column:1/-1; }
  .transfer-row{ grid-template-columns:1fr auto; }
  .transfer-row .hint{ grid-column:1/-1; }
  .data-actions-pop{ position:fixed; left:10px; right:10px; bottom:70px; width:auto; max-width:none; grid-template-columns:1fr; }
  .cart-editor-row textarea{ flex-basis:100%; }
  #cartWrap{ padding:14px; }
  #cartHeader{ font-size:22px; }
  #cartGrid{ gap:10px; }
  .cart-card .cart-name{ font-size:14px; }
  .cart-badge{ font-size:19px; }
  .cart-count{ font-size:22px; }
  body:not(.export-rendering) .desktop-field-note{ display:none; }
  body:not(.export-rendering) #matrixPanel{ padding:8px; }
  body:not(.export-rendering) #matrixPanel .matrix-heading-tools{ gap:5px; margin-bottom:6px; }
  body:not(.export-rendering) #matrixPanel .matrix-heading-tools input:not([type=color]){ min-height:32px; padding:5px 7px; }
  body:not(.export-rendering) #matrixPanel .matrix-options{ display:grid; grid-template-columns:repeat(5,minmax(0,1fr)); gap:3px; margin:0 0 6px; }
  body:not(.export-rendering) #matrixPanel .matrix-options .matrix-toggle{ min-width:0; min-height:29px; padding:3px 1px; border-radius:6px; font-size:9px; line-height:1.1; white-space:normal; }
  body:not(.export-rendering) #matrixPanel .matrix-tip{ margin-bottom:6px; padding:5px 7px; font-size:10px; }
  body:not(.export-rendering) #matrixPanel .matrix-project-title{ padding:7px 9px; font-size:13px; }
  body:not(.export-rendering) #matrixTable{ font-size:10.5px; }
  body:not(.export-rendering) #matrixTable thead tr.header-row th{ font-size:10.5px; }
  body:not(.export-rendering) #matrixTable td,body:not(.export-rendering) #matrixTable th{ min-width:70px; padding:4px 5px; }
  body:not(.export-rendering) #matrixTable td.seq-col,body:not(.export-rendering) #matrixTable th:first-child{ min-width:32px; width:32px; }
  body:not(.export-rendering) #matrixTable tr.adj-row td:first-child,body:not(.export-rendering) #matrixTable tr.price-row td:first-child,body:not(.export-rendering) #matrixTable tr.promotion-point-row td:first-child{ min-width:46px; width:46px; }
  body:not(.export-rendering) #matrixTable [contenteditable=true],body:not(.export-rendering) #matrixTable .matrix-price-input{ font-size:11px!important; }
  body:not(.export-rendering) #quantityPanel{ padding:8px; }
  body:not(.export-rendering) .quantity-controls{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:5px; margin-bottom:6px; }
  body:not(.export-rendering) .quantity-controls label{ min-width:0; flex-direction:column; align-items:stretch; gap:3px; font-size:10px; text-align:center; }
  body:not(.export-rendering) .quantity-controls>.hint{ grid-column:1/-1; font-size:9.5px; text-align:center; }
  body:not(.export-rendering) .count-value-editor{ width:100%; min-width:0; min-height:29px; padding:3px 4px; border-radius:6px; font-size:12px; }
  body:not(.export-rendering) .count-value-editor:empty::before{ font-size:9.5px; }
  body:not(.export-rendering) .quantity-section-title{ margin:7px 0 4px; font-size:11px; }
  body:not(.export-rendering) .quantity-table{ font-size:10.5px; }
  body:not(.export-rendering) .quantity-table th,body:not(.export-rendering) .quantity-table td{ padding:4px 5px; }
  body:not(.export-rendering) .quantity-cn-link,body:not(.export-rendering) .quantity-table button{ padding:2px 4px; font-size:9.5px!important; line-height:1.15; }
  body:not(.export-rendering) .quantity-breakdown{ min-width:72px; }
  body:not(.export-rendering) .quantity-breakdown strong{ font-size:10.5px; }
  body:not(.export-rendering) .quantity-breakdown small,body:not(.export-rendering) .quantity-ride-table .ride-item small,body:not(.export-rendering) .quantity-ride-table .ride-status small{ font-size:8.5px; }
  body:not(.export-rendering) .quantity-ride-table .ride-item,body:not(.export-rendering) .quantity-ride-table .ride-status{ min-width:78px; }
  body:not(.export-rendering) .cart-controls{ display:grid; grid-template-columns:repeat(3,minmax(0,1fr)); gap:5px; overflow:visible; padding:0; }
  body:not(.export-rendering) .cart-controls label{ min-width:0; display:flex; flex-direction:column; align-items:stretch; gap:3px; font-size:9.5px!important; }
  body:not(.export-rendering) .cart-controls select{ width:100%; min-width:0; height:31px; padding:4px 20px 4px 5px; font-size:10px; }
  body:not(.export-rendering) .cart-target-inputs{ display:grid; grid-template-columns:minmax(0,1fr) auto; gap:3px; }
  body:not(.export-rendering) #cartTargetNum{ width:45px!important; min-width:0; height:31px; padding:3px; font-size:10px; }
  body:not(.export-rendering) #cartTargetInfo{ grid-column:1/-1; min-width:0; font-size:9.5px; white-space:normal; }
  body:not(.export-rendering) #paymentPanel{ margin-left:-3px; margin-right:-3px; padding:8px; }
  body:not(.export-rendering) .payment-tabs{ margin-bottom:6px; padding:3px; }
  body:not(.export-rendering) .payment-tab{ padding:6px 7px; font-size:11px; }
  body:not(.export-rendering) .payment-range-tools{ gap:5px; margin-top:6px; padding:6px; font-size:10px; }
  body:not(.export-rendering) .payment-range-tools input[type=number]{ width:52px; padding:4px; font-size:11px; }
  body:not(.export-rendering) .payment-heading-tools{ gap:5px; }
  body:not(.export-rendering) .payment-heading-tools label{ gap:3px; font-size:10px; }
  body:not(.export-rendering) .payment-search-tools{ display:grid; grid-template-columns:minmax(0,1fr) auto; gap:5px; margin-top:6px; }
  body:not(.export-rendering) .payment-search-tools input{ width:100%; min-width:0; font-size:12px; }
  body:not(.export-rendering) .payment-search-tools input[type=text]{ font-size:11px!important; }
  body:not(.export-rendering) .payment-unpaid-count{ grid-column:1/-1; width:100%; min-width:0; margin-left:0; padding:5px 6px; font-size:9.5px; line-height:1.45; white-space:normal; overflow-wrap:anywhere; }
  body:not(.export-rendering) .payment-summary{ margin-top:7px; }
  body:not(.export-rendering) .payment-project-title{ padding:7px 9px; font-size:13px; }
  body:not(.export-rendering) .payment-table{ min-width:540px; font-size:10.5px; }
  body:not(.export-rendering) .payment-table th,body:not(.export-rendering) .payment-table td{ padding:4px 5px; font-size:10.5px; }
  body:not(.export-rendering) .payment-table [contenteditable=true],body:not(.export-rendering) .payment-cn-name,body:not(.export-rendering) .payment-table td.payment-cn,body:not(.export-rendering) .payment-table td.payment-money{ font-size:10.5px!important; }
  body:not(.export-rendering) .payment-cn-controls{ grid-template-columns:16px 23px 23px; gap:2px; width:66px; margin-right:3px; }
  body:not(.export-rendering) .wrap .payment-paid-check{ width:16px; height:16px; min-width:16px; font-size:11px; }
  body:not(.export-rendering) .wrap .payment-refund-check,body:not(.export-rendering) .wrap .payment-supplement-check{ width:23px; min-width:23px; height:16px; font-size:9px; }
  body:not(.export-rendering) .payment-adjustment-note,body:not(.export-rendering) .payment-received-note{ font-size:9px; }
  body:not(.export-rendering) .payment-bought-note,body:not(.export-rendering) .payment-bought-money{ font-size:9px; }
  body:not(.export-rendering) #cartWrap{ padding:8px; border-radius:10px; }
  body:not(.export-rendering) #cartHeader{ gap:8px; margin-bottom:8px; padding:8px 9px; border-radius:9px; font-size:12px; }
  body:not(.export-rendering) #cartQrImage{ width:58px; height:58px; flex-basis:58px; border-radius:6px; }
  body:not(.export-rendering) #cartGrid{ gap:6px; }
  body:not(.export-rendering) .cart-card{ border-radius:10px; box-shadow:0 3px 10px rgba(57,38,66,.07); }
  body:not(.export-rendering) .cart-card .cart-name{ padding:7px 4px 8px; font-size:11px; }
  body:not(.export-rendering) .cart-card .cart-badge{ padding:5px 7px; border-radius:7px; font-size:12px; box-shadow:0 2px 5px rgba(35,25,40,.13); }
  body:not(.export-rendering) .cart-card .cart-price{ top:5px; left:5px; }
  body:not(.export-rendering) .cart-card .cart-count{ right:5px; bottom:34px; padding:5px 7px; font-size:12px; }
  body:not(.export-rendering) .app-main .panel{ padding:9px; }
  body:not(.export-rendering) .app-main .panel>h2{ margin-bottom:7px; font-size:12px; }
  body:not(.export-rendering) .app-main .panel .panel-toggle{ padding:3px 6px; font-size:9px; }
  body:not(.export-rendering) .app-main .toolbar{ gap:4px; margin-top:6px; }
  body:not(.export-rendering) .app-main .toolbar button,body:not(.export-rendering) .app-main .toolbar .btn-ghost,body:not(.export-rendering) .app-main .toolbar .btn-primary,body:not(.export-rendering) .app-main .toolbar .btn-danger,body:not(.export-rendering) .app-main .toolbar label.btn-ghost{ min-height:27px; padding:4px 7px; border-radius:6px; font-size:10px; line-height:1.15; }
  body:not(.export-rendering) .upload-button,body:not(.export-rendering) .qr-upload{ min-height:27px!important; padding:4px 7px!important; border-radius:6px; font-size:10px!important; }
  body:not(.export-rendering) .payment-qr-tools{ gap:4px; margin-top:5px; }
  body:not(.export-rendering) .wrap input[type=text],body:not(.export-rendering) .wrap input[type=number],body:not(.export-rendering) .wrap textarea{ font-size:11px!important; }
  body:not(.export-rendering) .wrap select{ font-size:11px!important; }
  body:not(.export-rendering) .wrap [contenteditable=true]:focus{ font-size:11px!important; }
  body:not(.export-rendering) #costPanel{ padding:8px; }
  body:not(.export-rendering) #costPanel .grid{ gap:5px; }
  body:not(.export-rendering) #costPanel label{ margin-bottom:3px; font-size:9.5px; }
  body:not(.export-rendering) #costPanel input,body:not(.export-rendering) #costPanel select{ min-height:32px; padding:4px 6px; }
  body:not(.export-rendering) #costPanel .cost-human-tip{ margin-top:6px; padding:5px 7px; font-size:9.5px; line-height:1.4; }
  body:not(.export-rendering) #costPanel .warn{ margin-top:6px; padding:5px 7px; border-radius:6px; font-size:9.5px; line-height:1.45; }
  body:not(.export-rendering) #costPanel .summary{ gap:4px; margin:6px 0 2px; }
  body:not(.export-rendering) #costPanel .stat{ padding:5px 6px; border-radius:6px; }
  body:not(.export-rendering) #costPanel .stat span{ margin-bottom:2px; font-size:9px; }
  body:not(.export-rendering) #costPanel .stat strong{ font-size:12px; }
  body:not(.export-rendering) .payment-heading-tools{ grid-template-columns:minmax(0,1fr) auto auto; gap:4px; }
  body:not(.export-rendering) .matrix-heading-tools{ grid-template-columns:minmax(0,1fr) auto; }
  body:not(.export-rendering) .quantity-heading-tools{ grid-template-columns:minmax(0,1fr); }
  body:not(.export-rendering) .payment-heading-tools>#paymentTitleInput,body:not(.export-rendering) .payment-heading-tools>#sharePaymentTitleInput,body:not(.export-rendering) .payment-heading-tools>#matrixTitleInput,body:not(.export-rendering) .payment-heading-tools>#quantityTitleInput{ grid-column:auto; min-width:0; }
  body:not(.export-rendering) .payment-heading-tools label{ gap:2px; font-size:9px; }
  body:not(.export-rendering) .payment-heading-tools select{ width:68px; min-width:68px; padding-left:4px; padding-right:18px; }
  body:not(.export-rendering) .payment-heading-tools input[type=color]{ width:30px; height:30px; padding:2px; }
  body:not(.export-rendering) .payment-qr-tools button{ min-height:27px; padding:4px 7px; border-radius:6px; font-size:10px; }
  body:not(.export-rendering) .cart-controls select{ font-size:10px!important; }
  body:not(.export-rendering) .app-main button[data-mobile-label]{ font-size:0!important; white-space:nowrap; }
  body:not(.export-rendering) .app-main button[data-mobile-label]::after{ content:attr(data-mobile-label); font-size:10px; line-height:1.15; }
  body:not(.export-rendering) .catalog-panel{ margin-top:6px; padding:6px; }
  body:not(.export-rendering) .catalog-head{ grid-template-columns:auto minmax(0,1fr); gap:6px; margin-bottom:5px; font-size:10.5px; }
  body:not(.export-rendering) .catalog-head input{ min-width:0; height:31px; padding:4px 6px; }
  body:not(.export-rendering) .catalog-tools{ display:grid; grid-template-columns:auto minmax(68px,1fr) auto auto; gap:3px; padding:4px; align-items:center; }
  body:not(.export-rendering) .catalog-filter-tabs{ gap:1px; padding:2px; }
  body:not(.export-rendering) .catalog-filter-tabs button{ min-height:25px; padding:3px 4px; font-size:9px; }
  body:not(.export-rendering) .catalog-tools select{ width:100%; min-width:0; height:27px; padding:2px 17px 2px 4px; font-size:9px!important; }
  body:not(.export-rendering) .catalog-sort-control{ display:none!important; }
  body:not(.export-rendering) #catalogBatchAddBtn,body:not(.export-rendering) #catalogSelectAllBtn{ min-height:27px; padding:3px 4px; font-size:9px; white-space:nowrap; }
  body:not(.export-rendering) .catalog-selection-count{ display:none; }
  body:not(.export-rendering) .catalog-item{ grid-template-columns:18px 25px 30px minmax(30px,1fr) minmax(52px,70px) 27px 25px; grid-template-rows:auto; gap:4px; padding:4px 2px; }
  body:not(.export-rendering) .catalog-item img,body:not(.export-rendering) .catalog-item .catalog-img-empty{ width:28px; height:28px; border-radius:5px; font-size:8px; }
  body:not(.export-rendering) .catalog-select{ width:14px; height:14px; }
  body:not(.export-rendering) .catalog-pin{ width:23px; height:23px; font-size:11px!important; }
  body:not(.export-rendering) .catalog-main strong{ font-size:10.5px; }
  body:not(.export-rendering) .catalog-group-label{ display:none; }
  body:not(.export-rendering) .catalog-group-edit{ display:block; grid-column:5; grid-row:1; width:100%; height:20px; min-height:20px; padding:0 14px 0 3px!important; border-radius:4px; font-size:8px!important; line-height:1; }
  body:not(.export-rendering) .catalog-price,body:not(.export-rendering) .catalog-usage{ display:none; }
  body:not(.export-rendering) .catalog-add,body:not(.export-rendering) .catalog-delete{ min-width:23px; width:23px; height:23px; padding:0!important; font-size:0!important; }
  body:not(.export-rendering) .catalog-add::after{ content:"＋"; font-size:13px; }
  body:not(.export-rendering) .catalog-delete::after{ content:"×"; font-size:13px; }
  body:not(.export-rendering) .cold-bundle-bar{ gap:4px; margin-top:5px; padding:4px 6px; border-radius:6px; font-size:9.5px; }
  body:not(.export-rendering) .cold-bundle-bar #selectColdBundleBtn{ min-height:23px; padding:3px 6px; font-size:9px; }
  body:not(.export-rendering) .cold-bundle-chooser{ margin-top:5px; padding:6px; border-radius:7px; }
  body:not(.export-rendering) .cold-bundle-chooser>strong{ font-size:10px; }
  body:not(.export-rendering) .cold-bundle-list{ grid-template-columns:repeat(3,minmax(0,1fr)); gap:3px; margin-top:5px; }
  body:not(.export-rendering) .cold-bundle-list label{ min-width:0; min-height:25px; gap:3px; padding:3px 5px; border-radius:5px; font-size:9.5px; white-space:nowrap; }
  body:not(.export-rendering) .cold-bundle-list label input{ flex:0 0 auto; width:12px; height:12px; margin:0; }
  body:not(.export-rendering) .cold-bundle-list label span{ min-width:0; overflow:hidden; text-overflow:ellipsis; }
  body:not(.export-rendering) .cold-bundle-chooser>.toolbar{ gap:3px; margin-top:5px; }
  body:not(.export-rendering) .cold-bundle-chooser>.toolbar button{ min-height:23px; padding:3px 6px; font-size:9px; }
}
body.export-rendering #matrixTable{ font-size:13px; }
body.export-rendering #matrixTable td,body.export-rendering #matrixTable th{ min-width:92px; padding:8px 10px; }
body.export-rendering #matrixTable td.seq-col,body.export-rendering #matrixTable th:first-child{ min-width:38px; width:38px; }
body.export-rendering #matrixTable tr.adj-row td:first-child,body.export-rendering #matrixTable tr.price-row td:first-child,body.export-rendering #matrixTable tr.promotion-point-row td:first-child{ min-width:58px; width:58px; }
body.export-rendering #matrixTable [contenteditable=true],body.export-rendering #matrixTable .matrix-price-input{ font-size:14px!important; }
body.export-rendering .quantity-table{ font-size:13px; }
body.export-rendering .quantity-table th,body.export-rendering .quantity-table td{ padding:7px 9px; }
body.export-rendering .quantity-breakdown{ min-width:92px; }
body.export-rendering .quantity-breakdown strong{ font-size:13px; }
body.export-rendering .quantity-breakdown small,body.export-rendering .quantity-ride-table .ride-item small,body.export-rendering .quantity-ride-table .ride-status small{ font-size:10.5px; }
body.export-rendering .quantity-ride-table .ride-item,body.export-rendering .quantity-ride-table .ride-status{ min-width:105px; }
body.export-rendering .payment-project-title{ padding:11px 14px; font-size:19px; }
body.export-rendering .payment-table{ min-width:0; font-size:14.5px; }
body.export-rendering .payment-table th{ padding:7px 8px; font-size:14px; }
body.export-rendering .payment-table td{ padding:7px 8px; font-size:14.5px; }
body.export-rendering #cartWrap{ padding:24px; }
body.export-rendering #cartHeader{ font-size:27px; }
body.export-rendering #cartGrid{ gap:18px; }
body.export-rendering .cart-card .cart-name{ font-size:17px; }
body.export-rendering .cart-badge{ font-size:25px; }
body.export-rendering .cart-count{ font-size:28px; }
