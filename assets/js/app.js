/*
 * 谷子调排簿主业务逻辑
 * 仍使用原有 DCLogic 生命周期，只把代码从 HTML 中移出，功能与数据结构不变。
 */
(function (global) {
  "use strict";

  global.GGZApp = {
    createComponent(DCLogic) {
      class Component extends DCLogic {
        renderVals(){ return {}; }
        componentDidMount(){
          this.initApp();
        }
      
        initApp(){
          const STORAGE_KEY='ggzCombinedTool_v1';
          const UNDO_STORAGE_KEY='ggzOrderUndoHistory_v1';
          const $=id=>document.getElementById(id);
          const money=v=>'¥'+(Number(v)||0).toFixed(2);
          const num=v=>Number(v)||0;
          const fmtNum=v=>{ const n=Number(v)||0; return Number.isInteger(n)?String(n):n.toFixed(2); };
          const fmtPoint=v=>String(Number(Math.max(0,Number(v)||0).toFixed(4)));
          const escapeHtml=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
          const escapeAttr=s=>escapeHtml(s).replace(/"/g,'&quot;');
      
          // 模式映射不可互换：avg=均价（旧称入均），adjust=调价，fixed=入均（旧称固定），single=原价换算。
          let columns=[];       // {id,name,aliases[],mode:'avg'|'adjust'|'fixed'|'single',priceAdj,fixedPrice,img}
          let allocations={};   // colId -> [person,...]
          let previewRows=[], transferPreviewRows=[], cancelPreviewRows=[], orderPreviewSignature='', transferPreviewSignature='', cancelPreviewSignature='';
          let coldPromotionDraftRows=[], coldPromotionDraftApplied=false, coldPromotionDraftBaseAllocations=null, coldPromotionBatches=[], coldPromotionSeriesBaseAllocations=null, coldPromotionSeriesBaseHighlights=null, coldPromotionSeriesFormalSignature='', coldPromotionPreviewRows=[], coldPromotionPreviewAllocations=null, coldPromotionPlanRevision=-1, coldPromotionPlanSignature='', coldPromotionPendingBundlePreview=false;
          let coldCarryBundleColumnIds=[];
          let colIdSeed=1, rowIdSeed=1;
          let cartNote='', cartTargetMode='auto', cartTargetNum=null, cartCountMode='short', cartColumns=4, cartQrImg='', showPricingRow=true, showUnitPriceRow=true, showPromotionPointRow=true, showCompleteRowColor=true, showColdPromotionColor=true;
          let matrixTitle='', matrixColor='#d1466a', matrixBoughtCells={}, matrixBuyMarkMode=false;
          let quantityTitle='';
          let paymentTitle='', paymentColor='#d1466a', paymentViewMode='detail', paymentStartRow=1, paymentEndRow=null, paymentActiveTab='goods', showPaymentTotal=true, showBoughtSettlement=false;
          let paymentEdits={}, paymentPaid={}, paymentRefund={}, paymentSupplement={}, paymentRefundDone={}, paymentSupplementDone={}, paymentNotes={}, settlementDashboardOpen=false, settlementFilter='pending', sharePaymentTitle='', sharePaymentTitleCustom=false, sharePaymentColor='#d1466a', sharePaymentViewMode='detail', sharePaymentEdits={}, sharePaymentPaid={}, sharePaymentRefund={}, sharePaymentSupplement={}, shareDeductFixed=false;
          let paymentQrImg='', sharedCartQrImg='', sharedPaymentQrImg='';
          let boxSize=null, groupSize=null, completeMultiple=null, quantityConfigured=false;
          let highlightedPerson='';
          let coldPromotionHighlights={completeRows:[],pendingRows:[]};
          let matrixPreviewAllocations=null, matrixPreviewColumns=null, matrixPreviewLabel='', matrixPreviewHighlights={completeRows:[],pendingRows:[],addedCells:[],transferCells:[],cancelRows:[]};
          let totalCost=0, avgPrice=0, adjSum=0;
          let sheets=[], activeSheetId=null, sheetIdSeed=1, isLoadingSheet=false;
          let undoHistoryBySheet={};
          let itemCatalog=[], catalogIdSeed=1;
          let catalogFilter='all', catalogSort='smart', catalogGroup='all', catalogSelectedIds=new Set(), catalogVisibleIds=[];
          const CLOUD_IDLE_UPLOAD_MS=5*60*1000;
          const CLOUD_VERSION_KEY_PREFIX='ggzCloudVersion_';
          const CLOUD_DIRTY_KEY_PREFIX='ggzCloudDirty_';
          const COLLAB_ENABLED_KEY_PREFIX='ggzCollabEnabled_';
          const COLLAB_CONFLICT_KEY_PREFIX='ggzCollabConflict_';
          const APP_SECTION_KEY='ggzAppSection_v1';
          const SHEET_STATUS_FILTER_KEY='ggzSheetStatusFilter_v1';
          const COLLAB_POLL_MS=2000;
          const EDIT_LOCK_TTL_SECONDS=120, EDIT_LOCK_CHECK_MS=30000;
          let cloudClient=null, cloudBusy=false, applyingCloud=false, lastCloudUpdatedAt='', cloudDirty=true, localRevision=0, cloudIdleTimer=null, cloudIdleEnabled=false, cloudConflictPaused=false;
          const WORKSPACE_STORAGE_KEY='ggzActiveWorkspace_v1';
          const storedSyncCode=localStorage.getItem('ggzSyncCode')||'';
          const UUID_RE=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
          let legacySyncCode=UUID_RE.test(storedSyncCode)?'':storedSyncCode;
          let syncCode=UUID_RE.test(storedSyncCode)?storedSyncCode:'';
          let workspaces=[],workspaceInvites=[],archivedWorkspaces=[],activeWorkspaceId=localStorage.getItem(WORKSPACE_STORAGE_KEY)||syncCode,workspaceLoading=false,archiveAccess=false;
          let editorName=localStorage.getItem('ggzEditorName')||'', editLockSupported=false, editLockOwned=false, editLockRecord=null, editLockTimer=null;
          let collabEnabled=false, applyingCollab=false, collabBaseline=null, collabRevision=0, collabSendTimer=null, collabPollTimer=null, collabPresenceTimer=null, collabSending=false, collabPolling=false, collabNeedsSend=false;
          let activeAppSection='settings';
          let sheetStatusFilter=['ongoing','completed','all'].includes(localStorage.getItem(SHEET_STATUS_FILTER_KEY))?localStorage.getItem(SHEET_STATUS_FILTER_KEY):'ongoing';
          const editSessionId=sessionStorage.getItem('ggzEditSessionId')||((crypto.randomUUID&&crypto.randomUUID())||('tab-'+Date.now()+'-'+Math.random().toString(36).slice(2)));
          sessionStorage.setItem('ggzEditSessionId',editSessionId);
          lastCloudUpdatedAt=syncCode?(localStorage.getItem(CLOUD_VERSION_KEY_PREFIX+syncCode)||''):'';
          if(syncCode) cloudDirty=rememberedCloudDirty(syncCode,lastCloudUpdatedAt);
          const SUPABASE_URL='https://fzxabmdnrkvpgraztcwi.supabase.co';
          const SUPABASE_KEY='sb_publishable_yU4Q1T2RuQfgwOW9Idtf9w__YssVHYe';
          const AUTH_STORAGE_KEY='ggz-auth-session-v1';
          let authClient=null, authCurrentUser=null, authReady=false;
      
          function getAuthClient(){
            if(authClient) return authClient;
            if(!window.supabase||!window.supabase.createClient) throw new Error('登录组件尚未加载，请检查网络后刷新');
            authClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY,{auth:{storageKey:AUTH_STORAGE_KEY,persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
            return authClient;
          }
          function normalizedAccountName(value){ return String(value||'').normalize('NFKC').trim().replace(/\s+/g,' '); }
          async function accountLoginEmail(value){
            const normalized=normalizedAccountName(value).toLocaleLowerCase('zh-CN');
            const bytes=new TextEncoder().encode('ggz-account-v1:'+normalized);
            let hex='';
            if(window.crypto?.subtle){
              const digest=await crypto.subtle.digest('SHA-256',bytes);
              hex=[...new Uint8Array(digest)].map(n=>n.toString(16).padStart(2,'0')).join('');
            }else{
              let h1=2166136261,h2=2246822519;
              bytes.forEach(n=>{ h1=Math.imul(h1^n,16777619); h2=Math.imul(h2^n,3266489917); });
              hex=(h1>>>0).toString(16).padStart(8,'0')+(h2>>>0).toString(16).padStart(8,'0');
            }
            return `ggz-${hex.slice(0,48)}@users.ggz.app`;
          }
          function setAuthMessage(text,tone=''){
            const el=$('authMessage'); if(!el) return;
            el.textContent=text||''; el.className='auth-message'+(tone?' '+tone:'');
          }
          function setAuthBusy(form,busy){
            form?.querySelectorAll('button,input').forEach(el=>{ el.disabled=!!busy; });
          }
          function readableAuthError(error){
            const text=String(error?.message||error||'').toLowerCase();
            if(text.includes('invalid login credentials')) return '账户名或密码不正确';
            if(text.includes('user already registered')||text.includes('already been registered')||text.includes('username_taken')||text.includes('database error saving new user')) return '这个账户名已经被使用，请换一个，或直接登录';
            if(text.includes('email not confirmed')) return '账户已注册，但 Supabase 仍要求邮箱验证。请先在后台关闭“Confirm email”后再登录';
            if(text.includes('could not find the function')||text.includes('ggz_username_available')||text.includes('pgrst202')) return '注册功能尚未安装，请先在 Supabase 执行新版完整 SQL';
            if(text.includes('password')&&text.includes('least')) return '密码长度不足，请至少填写8位';
            if(text.includes('fetch')||text.includes('network')) return '暂时连接不到登录服务，请检查网络后重试';
            return error?.message||'操作失败，请稍后重试';
          }
          function showAuthMode(mode){
            const registering=mode==='register';
            $('authLoginTab').hidden=!registering; $('authRegisterTab').hidden=registering;
            $('authSwitchText').textContent=registering?'已经有账户？':'还没有账户？';
            $('authLoginForm').hidden=registering; $('authRegisterForm').hidden=!registering;
            setAuthMessage(registering?'注册后，这个账户名也会作为协作编辑者姓名。':'请输入账户名和密码。');
            setTimeout(()=>$(registering?'authRegisterName':'authLoginName').focus(),0);
          }
          function authAccountName(user){
            return normalizedAccountName(user?.user_metadata?.account_name||user?.user_metadata?.username||localStorage.getItem('ggzEditorName')||'');
          }
          function readableWorkspaceError(error){
            const raw=String(error?.message||error||''),text=raw.toUpperCase();
            if(text.includes('USERNAME_NOT_FOUND')) return '没有找到这个账户名，请确认文字完全一致';
            if(text.includes('ALREADY_GROUP_MEMBER')) return '这个人已经在协作组里了';
            if(text.includes('CANNOT_INVITE_SELF')) return '不用邀请自己，你已经在组里了';
            if(text.includes('NOT_GROUP_MANAGER')) return '当前账户没有成员管理权限';
            if(text.includes('INVALID_GROUP_NAME')) return '协作组名称请填写1—40个字';
            if(text.includes('NOT_GROUP_OWNER')) return '只有创建这个协作组的人可以删除它';
            if(text.includes('APP_ADMIN_REQUIRED')) return '当前账户没有恢复权限';
            if(text.includes('INVALID_GROUP_CODE')) return '组代码格式不正确';
            if(text.includes('ARCHIVED_GROUP_NOT_FOUND')) return '没有找到可以恢复的协作组';
            if(text.includes('USERNAME_TAKEN')) return '这个账户名已经被使用，请换一个';
            if(text.includes('GROUP_ACCESS_DENIED')) return '你已经不在这个协作组中，无法读取数据';
            if(text.includes('PGRST202')||text.includes('GGZ_WORKSPACE_OVERVIEW')||text.includes('COULD NOT FIND THE FUNCTION')) return '协作组功能尚未安装，请先在 Supabase 执行新版完整 SQL';
            return raw||'协作组操作失败，请稍后重试';
          }
          function setWorkspaceStatus(text,tone=''){
            const el=$('workspaceStatus'); if(!el) return;
            el.textContent=text||''; el.style.color=tone==='bad'?'var(--bad)':(tone==='ok'?'var(--ok)':'var(--muted)');
          }
          function currentWorkspace(){ return workspaces.find(group=>group.id===activeWorkspaceId)||null; }
          // ============================================================
          // 账户、协作组与管理员界面
          // ============================================================
          function renderWorkspaceUI(){
            const select=$('workspaceSelect'),group=currentWorkspace();
            select.innerHTML=workspaces.length?workspaces.map(item=>`<option value="${escapeAttr(item.id)}"${item.id===activeWorkspaceId?' selected':''}>${escapeHtml(item.name)}</option>`).join(''):'<option value="">还没有协作组</option>';
            select.disabled=workspaceLoading||!workspaces.length;
            $('workspaceEmptyNotice').hidden=!!workspaces.length;
            $('inviteWorkspaceMemberBtn').disabled=!group;
            $('renameWorkspaceBtn').hidden=!group||group.role!=='owner';
            $('renameWorkspaceBtn').disabled=!group||group.role!=='owner'||workspaceLoading;
            $('showWorkspaceMembersBtn').disabled=!group;
            $('showWorkspaceMembersBtn').textContent=group?`成员 ${Math.max(0,Number(group.member_count)||0)}`:'成员';
            $('deleteWorkspaceBtn').hidden=!group||group.role!=='owner';
            $('deleteWorkspaceBtn').disabled=!group||group.role!=='owner'||workspaceLoading;
            $('archiveMaintenance').hidden=!archiveAccess;
            $('workspaceArchiveList').innerHTML=archivedWorkspaces.length?archivedWorkspaces.map(item=>`<div class="workspace-list-row" data-archived-workspace="${escapeAttr(item.id)}"><div><strong>${escapeHtml(item.name)}</strong><br><small>创建者：${escapeHtml(item.owner_name||'未知账户')} · ${Number(item.member_count)||0} 人 · ${escapeHtml(new Date(item.deleted_at).toLocaleString('zh-CN'))}<br>代码 ${escapeHtml(item.id)}</small></div><span class="workspace-row-actions"><button type="button" class="primary" data-restore-archived>恢复</button></span></div>`).join(''):'<div class="workspace-list-empty">暂无已删除协作组</div>';
            $('workspaceInviteCount').textContent=String(workspaceInvites.length);
            $('showWorkspaceInvitesBtn').classList.toggle('btn-primary',workspaceInvites.length>0);
            $('workspaceInviteList').innerHTML=workspaceInvites.length?workspaceInvites.map(invite=>`<div class="workspace-list-row" data-workspace-invite="${escapeAttr(invite.id)}"><div><strong>${escapeHtml(invite.group_name)}</strong><br><small>${escapeHtml(invite.invited_by_name)} 邀请你加入</small></div><span class="workspace-row-actions"><button type="button" data-invite-action="decline">拒绝</button><button type="button" class="primary" data-invite-action="accept">接受</button></span></div>`).join(''):'<div class="workspace-list-empty">暂时没有新邀请</div>';
            $('syncCodeInput').value=syncCode;
            $('cloudUploadBtn').disabled=!group||cloudBusy;
            $('cloudDownloadBtn').disabled=!group||cloudBusy||collabEnabled;
            syncCollabUI();
          }
          async function disconnectCurrentWorkspace(){
            if(!collabEnabled) return true;
            await flushCollabChanges();
            if(collabNeedsSend){ alert('当前协作组还有修改没有同步成功，请稍后再切换。'); return false; }
            await leaveCollabPresence(); collabEnabled=false; stopCollabPolling(); stopCollabPresence();
            clearTimeout(collabSendTimer); collabSendTimer=null; collabBaseline=null; syncCollabUI();
            return true;
          }
          async function activateWorkspace(groupId,autoConnect=true){
            const next=String(groupId||''); if(!next||!workspaces.some(group=>group.id===next)) return false;
            if(next!==syncCode&&!(await disconnectCurrentWorkspace())) return false;
            activeWorkspaceId=next; syncCode=next; localStorage.setItem(WORKSPACE_STORAGE_KEY,next); localStorage.setItem('ggzSyncCode',next);
            lastCloudUpdatedAt=localStorage.getItem(CLOUD_VERSION_KEY_PREFIX+next)||''; cloudConflictPaused=false; cloudDirty=rememberedCloudDirty(next,lastCloudUpdatedAt);
            $('syncCodeInput').value=next; renderWorkspaceUI(); setWorkspaceStatus(`已进入「${currentWorkspace()?.name||'协作组'}」`,'ok');
            setCloudStatus(cloudDirty?'云端完整备份未更新':'云端完整备份已同步',cloudDirty?'warn':'');
            if(autoConnect&&!collabEnabled) await startCollab(true);
            return true;
          }
          async function loadWorkspaceOverview(autoConnect=true){
            if(!authCurrentUser||workspaceLoading) return;
            workspaceLoading=true; setWorkspaceStatus('正在读取协作组…'); renderWorkspaceUI();
            try{
              const {data,error}=await getAuthClient().rpc('ggz_workspace_overview'); if(error) throw error;
              const overview=data&&typeof data==='object'?data:{};
              archiveAccess=overview.archive_access===true;
              archivedWorkspaces=archiveAccess&&Array.isArray(overview.archived_groups)?overview.archived_groups:[];
              workspaces=Array.isArray(overview.groups)?overview.groups:[]; workspaceInvites=Array.isArray(overview.invites)?overview.invites:[];
              if(overview.username){ editorName=String(overview.username); localStorage.setItem('ggzEditorName',editorName); $('editorNameInput').value=editorName; $('authAccountBadge').textContent=editorName; }
              if(!workspaces.some(group=>group.id===activeWorkspaceId)) activeWorkspaceId=workspaces[0]?.id||'';
              workspaceLoading=false; renderWorkspaceUI();
              if(activeWorkspaceId) await activateWorkspace(activeWorkspaceId,autoConnect);
              else{ syncCode=''; $('syncCodeInput').value=''; setWorkspaceStatus(workspaceInvites.length?'请先处理协作组邀请':'请新建协作组，或等待别人邀请你'); setCloudStatus('尚未加入协作组'); }
            }catch(error){
              workspaceLoading=false; workspaces=[]; workspaceInvites=[]; archivedWorkspaces=[]; activeWorkspaceId=''; syncCode=''; archiveAccess=false; renderWorkspaceUI(); setWorkspaceStatus(readableWorkspaceError(error),'bad');
            }
          }
          async function createWorkspace(){
            const name=normalizedAccountName(prompt('给新的协作组取个名字，例如“夏剧排单组”','')||''); if(!name) return;
            let legacy=null;
            if(legacySyncCode){
              const useLegacy=await appConfirm('检测到这台设备以前使用过同步码。新建协作组时一起带入原来的云端排单吗？','带入原有排单','带入并新建');
              if(useLegacy) legacy=legacySyncCode;
            }
            const button=$('createWorkspaceBtn'); button.disabled=true; setWorkspaceStatus('正在新建协作组…');
            try{
              const {data,error}=await getAuthClient().rpc('ggz_create_group',{p_name:name,p_legacy_sync_code:legacy,p_initial_state:blankCollabProjectSnapshot()}); if(error) throw error;
              const row=Array.isArray(data)?data[0]:data; activeWorkspaceId=row?.group_id||''; legacySyncCode='';
              await loadWorkspaceOverview(true);
            }catch(error){ setWorkspaceStatus(readableWorkspaceError(error),'bad'); }
            finally{ button.disabled=false; }
          }
          async function inviteWorkspaceMember(){
            const group=currentWorkspace(); if(!group) return;
            const username=normalizedAccountName(prompt('输入对方完整的账户名','')||''); if(!username) return;
            const button=$('inviteWorkspaceMemberBtn'); button.disabled=true; setWorkspaceStatus('正在发送邀请…');
            try{
              const {data,error}=await getAuthClient().rpc('ggz_invite_group_member',{p_group_id:group.id,p_username:username}); if(error) throw error;
              const row=Array.isArray(data)?data[0]:data; setWorkspaceStatus(`已邀请 ${row?.invited_username||username}`,'ok');
            }catch(error){ setWorkspaceStatus(readableWorkspaceError(error),'bad'); }
            finally{ button.disabled=false; }
          }
          async function renameWorkspace(){
            const group=currentWorkspace(); if(!group||group.role!=='owner') return;
            const name=normalizedAccountName(prompt('输入新的协作组名称',group.name)||''); if(!name||name===group.name) return;
            const button=$('renameWorkspaceBtn'); button.disabled=true; setWorkspaceStatus('正在修改组名…');
            try{
              const {error}=await getAuthClient().rpc('ggz_rename_group',{p_group_id:group.id,p_name:name}); if(error) throw error;
              await loadWorkspaceOverview(false); setWorkspaceStatus('组名已修改','ok');
            }catch(error){ setWorkspaceStatus(readableWorkspaceError(error),'bad'); }
            finally{ button.disabled=false; }
          }
          async function respondWorkspaceInvite(inviteId,accept){
            setWorkspaceStatus(accept?'正在加入协作组…':'正在拒绝邀请…');
            try{
              const {error}=await getAuthClient().rpc('ggz_respond_group_invite',{p_invite_id:inviteId,p_accept:!!accept}); if(error) throw error;
              $('workspaceInvitesPanel').hidden=true; await loadWorkspaceOverview(true);
            }catch(error){ setWorkspaceStatus(readableWorkspaceError(error),'bad'); }
          }
          async function showWorkspaceMembers(){
            const group=currentWorkspace(); if(!group) return;
            $('workspaceMembersPanel').hidden=false; $('workspaceInvitesPanel').hidden=true; $('workspaceMemberList').innerHTML='<div class="workspace-list-empty">正在读取成员…</div>';
            try{
              const {data,error}=await getAuthClient().rpc('ggz_group_member_list',{p_group_id:group.id}); if(error) throw error;
              const rows=Array.isArray(data)?data:[],canManage=group.role==='owner';
              $('workspaceMemberList').innerHTML=rows.length?rows.map(row=>`<div class="workspace-list-row" data-member-id="${escapeAttr(row.user_id)}"><strong>${escapeHtml(row.username)}${row.user_id===authCurrentUser?.id?'（我）':''}</strong><small>${row.role==='owner'?'组主':'成员'}</small>${canManage&&row.role!=='owner'?'<span class="workspace-row-actions"><button type="button" data-remove-member>移除</button></span>':''}</div>`).join(''):'<div class="workspace-list-empty">暂时没有成员</div>';
            }catch(error){ $('workspaceMemberList').innerHTML=`<div class="workspace-list-empty">${escapeHtml(readableWorkspaceError(error))}</div>`; }
          }
          async function deleteCurrentWorkspace(){
            const group=currentWorkspace();
            if(!group||group.role!=='owner') return;
            const accepted=await appConfirm(`确定删除“${group.name}”吗？\n\n删除后，该协作组将从成员列表中移除。`,'删除协作组','确认删除');
            if(!accepted) return;
            const button=$('deleteWorkspaceBtn'); button.disabled=true; setWorkspaceStatus('正在删除协作组…');
            try{
              if(!(await disconnectCurrentWorkspace())) return;
              const {error}=await getAuthClient().rpc('ggz_delete_group',{p_group_id:group.id}); if(error) throw error;
              localStorage.setItem('ggzLastArchivedGroupCode',group.id);
              [WORKSPACE_STORAGE_KEY,'ggzSyncCode',COLLAB_ENABLED_KEY_PREFIX+group.id,CLOUD_VERSION_KEY_PREFIX+group.id,CLOUD_DIRTY_KEY_PREFIX+group.id,COLLAB_CONFLICT_KEY_PREFIX+group.id].forEach(key=>localStorage.removeItem(key));
              activeWorkspaceId=''; syncCode=''; lastCloudUpdatedAt=''; cloudDirty=false; cloudConflictPaused=false;
              installCollabState(blankCollabProjectSnapshot());
              await loadWorkspaceOverview(true);
            }catch(error){ setWorkspaceStatus(readableWorkspaceError(error),'bad'); button.disabled=false; }
          }
          async function restoreWorkspace(requestedCode=''){
            if(!archiveAccess) return;
            const code=String(requestedCode||prompt('输入要恢复的协作组代码',localStorage.getItem('ggzLastArchivedGroupCode')||archivedWorkspaces[0]?.id||'')||'').trim();
            if(!code) return;
            const button=$('restoreWorkspaceByCodeBtn'); button.disabled=true; setWorkspaceStatus('正在恢复云端协作组…');
            try{
              const {data,error}=await getAuthClient().rpc('ggz_restore_group',{p_group_code:code}); if(error) throw error;
              const row=Array.isArray(data)?data[0]:data;
              activeWorkspaceId=row?.group_id||''; localStorage.setItem(WORKSPACE_STORAGE_KEY,activeWorkspaceId);
              $('archiveMaintenance').open=false;
              await loadWorkspaceOverview(true);
            }catch(error){ setWorkspaceStatus(readableWorkspaceError(error),'bad'); button.disabled=false; }
          }
          function applyAuthSession(session){
            authCurrentUser=session?.user||null; authReady=true;
            if(!authCurrentUser){
              document.documentElement.classList.remove('auth-pending'); document.documentElement.classList.add('auth-locked');
              $('authGate').hidden=false; $('authAccountBadge').textContent='尚未登录';
              setAuthMessage('请输入账户名和密码。'); return;
            }
            const name=authAccountName(authCurrentUser)||'已登录用户';
            editorName=name; localStorage.setItem('ggzEditorName',name); $('editorNameInput').value=name; $('authAccountBadge').textContent=name;
            $('authGate').hidden=true; document.documentElement.classList.remove('auth-pending','auth-locked');
            setTimeout(()=>loadWorkspaceOverview(true),0);
          }
          async function initAuthGate(){
            try{
              const client=getAuthClient();
              const {data,error}=await client.auth.getSession(); if(error) throw error;
              applyAuthSession(data?.session||null);
              client.auth.onAuthStateChange((event,session)=>{
                if(event==='SIGNED_IN'||event==='INITIAL_SESSION'||event==='TOKEN_REFRESHED') applyAuthSession(session);
                else if(event==='SIGNED_OUT') applyAuthSession(null);
              });
            }catch(error){
              document.documentElement.classList.remove('auth-pending'); document.documentElement.classList.add('auth-locked');
              $('authGate').hidden=false; setAuthMessage(readableAuthError(error),'bad');
            }
          }
      
          const COST_DEFAULTS={priceType:'total',count:'',jpyPrice:'',exchangeRate:'',manualAveragePrice:'',sharedFee:''};
      
          // ---------- persistence ----------
          function snapshotCost(){
            return {priceType:$('priceType').value,count:$('count').value,jpyPrice:$('jpyPrice').value,
              exchangeRate:$('exchangeRate').value,manualAveragePrice:$('manualAveragePrice').value,sharedFee:$('sharedFee').value};
          }
          function snapshotSheet(){
            const sheet=sheets.find(s=>s.id===activeSheetId);
            return {id:activeSheetId,name:'',columns,allocations,cost:snapshotCost(),cartNote,cartTargetMode,cartTargetNum,cartCountMode,cartColumns,showPricingRow,showUnitPriceRow,showPromotionPointRow,showCompleteRowColor,showColdPromotionColor,coldPromotionHighlights,coldPromotionBatches,coldPromotionSeriesBaseAllocations,coldPromotionSeriesBaseHighlights,coldPromotionSeriesFormalSignature,matrixTitle,matrixTitleCustom:sheet?sheetUsesCustomTitle(sheet,'matrixTitle'):false,matrixColor,matrixBoughtCells,quantityTitle,quantityTitleCustom:sheet?sheetUsesCustomTitle(sheet,'quantityTitle'):false,paymentTitle,paymentTitleCustom:sheet?sheetUsesCustomTitle(sheet,'paymentTitle'):false,paymentColor,paymentViewMode,paymentStartRow,paymentEndRow,showPaymentTotal,showBoughtSettlement,paymentEdits,paymentPaid,paymentRefund,paymentSupplement,paymentRefundDone,paymentSupplementDone,paymentNotes,settlementDashboardOpen,sharePaymentTitle,sharePaymentTitleCustom,sharePaymentColor,sharePaymentViewMode,sharePaymentEdits,sharePaymentPaid,sharePaymentRefund,sharePaymentSupplement,shareDeductFixed,boxSize,groupSize,completeMultiple,quantityConfigured,coldCarryBundleColumnIds,coldPromotionDraftRows,coldPromotionDraftApplied,coldPromotionDraftBaseAllocations};
          }
          function blankSheet(name){
            return {id:sheetIdSeed++,name:name||`表${sheets.length+1}`,completed:false,completedAt:'',columns:[],allocations:{},cost:{...COST_DEFAULTS},cartNote:'',cartTargetMode:'auto',cartTargetNum:null,cartCountMode:'short',cartColumns:4,showPricingRow:true,showUnitPriceRow:true,showPromotionPointRow:true,showCompleteRowColor:true,showColdPromotionColor:true,coldPromotionHighlights:{completeRows:[],pendingRows:[]},coldPromotionBatches:[],coldPromotionSeriesBaseAllocations:null,coldPromotionSeriesBaseHighlights:null,coldPromotionSeriesFormalSignature:'',matrixTitle:'',matrixTitleCustom:false,matrixColor:'#d1466a',matrixBoughtCells:{},quantityTitle:'',quantityTitleCustom:false,paymentTitle:'',paymentTitleCustom:false,paymentColor:'#d1466a',paymentViewMode:'detail',paymentStartRow:1,paymentEndRow:null,showPaymentTotal:true,showBoughtSettlement:false,paymentEdits:{},paymentPaid:{},paymentRefund:{},paymentSupplement:{},paymentRefundDone:{},paymentSupplementDone:{},paymentNotes:{},settlementDashboardOpen:false,sharePaymentTitle:'',sharePaymentTitleCustom:false,sharePaymentColor:'#d1466a',sharePaymentViewMode:'detail',sharePaymentEdits:{},sharePaymentPaid:{},sharePaymentRefund:{},sharePaymentSupplement:{},shareDeductFixed:false,boxSize:null,groupSize:null,completeMultiple:null,quantityConfigured:false,coldCarryBundleColumnIds:[],coldPromotionDraftRows:[],coldPromotionDraftApplied:false,coldPromotionDraftBaseAllocations:null};
          }
          function blankCollabProjectSnapshot(){
            const savedSeed=sheetIdSeed;
            const sheet=blankSheet('表1');
            sheetIdSeed=savedSeed;
            sheet.id=1;
            return {sheets:[sheet],sheetIdSeed:2,itemCatalog:[],catalogIdSeed:1,sharedCartQrImg:'',sharedPaymentQrImg:''};
          }
          function sheetUsesCustomTitle(sheet,key){
            const flag=sheet?.[key+'Custom'];
            if(typeof flag==='boolean') return flag;
            const saved=String(sheet?.[key]||'').trim(), sheetName=String(sheet?.name||'').trim();
            return !!saved&&saved!==sheetName;
          }
          function resolvedSheetTitle(sheet,key){
            const custom=sheetUsesCustomTitle(sheet,key);
            sheet[key+'Custom']=custom;
            return custom?String(sheet[key]||''):String(sheet.name||'');
          }
          function sheetUsesCustomShareTitle(sheet){
            if(typeof sheet?.sharePaymentTitleCustom==='boolean') return sheet.sharePaymentTitleCustom;
            const saved=String(sheet?.sharePaymentTitle||'').trim(), automatic=`${String(sheet?.name||'未命名项目').trim()||'未命名项目'} 均摊`;
            return !!saved&&saved!==automatic;
          }
          function resolvedSharePaymentTitle(sheet){
            const custom=sheetUsesCustomShareTitle(sheet);
            sheet.sharePaymentTitleCustom=custom;
            return custom?String(sheet.sharePaymentTitle||''):`${String(sheet.name||'未命名项目').trim()||'未命名项目'} 均摊`;
          }
          function captureActiveSheet(){
            const sheet=sheets.find(s=>s.id===activeSheetId);
            if(!sheet) return;
            pruneMatrixBoughtCells();
            const current=snapshotSheet();
            Object.assign(sheet,current,{name:sheet.name});
            delete sheet.cartQrImg; delete sheet.paymentQrImg; delete sheet.alipayQrImg; delete sheet.wechatQrImg;
          }
          function applySheet(sheet){
            const keepBuyMarkMode=matrixBuyMarkMode&&activeSheetId===sheet.id;
            isLoadingSheet=true;
            activeSheetId=sheet.id;
            columns=Array.isArray(sheet.columns)?sheet.columns.map(migrateColumn):[];
            allocations=sheet.allocations||{};
            cartNote=sheet.cartNote||'';
            cartTargetMode=sheet.cartTargetMode||'auto';
            cartTargetNum=sheet.cartTargetNum!==undefined?sheet.cartTargetNum:null;
            if(!sharedCartQrImg) sharedCartQrImg=sheet.cartQrImg||'';
            cartCountMode=sheet.cartCountMode||'short'; cartColumns=sheet.cartColumns||4; cartQrImg=sharedCartQrImg;
            matrixTitle=resolvedSheetTitle(sheet,'matrixTitle'); matrixColor=sheet.matrixColor||'#d1466a';
            matrixBoughtCells=sheet.matrixBoughtCells&&typeof sheet.matrixBoughtCells==='object'?deepClone(sheet.matrixBoughtCells):{};
            matrixBuyMarkMode=keepBuyMarkMode;
            quantityTitle=resolvedSheetTitle(sheet,'quantityTitle');
            paymentTitle=resolvedSheetTitle(sheet,'paymentTitle'); paymentColor=sheet.paymentColor||'#d1466a'; paymentViewMode=sheet.paymentViewMode==='merged'?'merged':'detail';
            paymentStartRow=Math.max(1,parseInt(sheet.paymentStartRow,10)||1); paymentEndRow=Number.isFinite(parseInt(sheet.paymentEndRow,10))?Math.max(paymentStartRow,parseInt(sheet.paymentEndRow,10)):null;
            showPaymentTotal=sheet.showPaymentTotal!==false;
            showBoughtSettlement=sheet.showBoughtSettlement===true;
            paymentEdits=sheet.paymentEdits||{};
            paymentPaid=sheet.paymentPaid&&typeof sheet.paymentPaid==='object'?sheet.paymentPaid:{};
            paymentRefund=sheet.paymentRefund&&typeof sheet.paymentRefund==='object'?sheet.paymentRefund:{};
            paymentSupplement=sheet.paymentSupplement&&typeof sheet.paymentSupplement==='object'?sheet.paymentSupplement:{}; paymentRefundDone=sheet.paymentRefundDone&&typeof sheet.paymentRefundDone==='object'?sheet.paymentRefundDone:{}; paymentSupplementDone=sheet.paymentSupplementDone&&typeof sheet.paymentSupplementDone==='object'?sheet.paymentSupplementDone:{}; paymentNotes=sheet.paymentNotes&&typeof sheet.paymentNotes==='object'?sheet.paymentNotes:{}; settlementDashboardOpen=sheet.settlementDashboardOpen===true;
            sharePaymentTitle=resolvedSharePaymentTitle(sheet); sharePaymentTitleCustom=sheet.sharePaymentTitleCustom===true; sharePaymentColor=sheet.sharePaymentColor||paymentColor||'#d1466a'; sharePaymentViewMode=sheet.sharePaymentViewMode==='merged'?'merged':'detail'; sharePaymentEdits=sheet.sharePaymentEdits||{};
            sharePaymentPaid=sheet.sharePaymentPaid&&typeof sheet.sharePaymentPaid==='object'?sheet.sharePaymentPaid:{}; shareDeductFixed=sheet.shareDeductFixed===true;
            sharePaymentRefund=sheet.sharePaymentRefund&&typeof sheet.sharePaymentRefund==='object'?sheet.sharePaymentRefund:{};
            sharePaymentSupplement=sheet.sharePaymentSupplement&&typeof sheet.sharePaymentSupplement==='object'?sheet.sharePaymentSupplement:{};
            coldCarryBundleColumnIds=(Array.isArray(sheet.coldCarryBundleColumnIds)?sheet.coldCarryBundleColumnIds:[]).map(Number).filter(id=>columns.some(c=>c.id===id&&c.mode!=='fixed'));
            if(!sharedPaymentQrImg) sharedPaymentQrImg=sheet.paymentQrImg||sheet.alipayQrImg||sheet.wechatQrImg||'';
            paymentQrImg=sharedPaymentQrImg;
            highlightedPerson='';
            matrixPreviewAllocations=null; matrixPreviewColumns=null; matrixPreviewLabel=''; matrixPreviewHighlights={completeRows:[],pendingRows:[],addedCells:[],transferCells:[],cancelRows:[]};
            quantityConfigured=sheet.quantityConfigured===true;
            boxSize=quantityConfigured&&Number.isFinite(parseInt(sheet.boxSize,10))?Math.max(1,parseInt(sheet.boxSize,10)):null;
            groupSize=quantityConfigured&&Number.isFinite(parseInt(sheet.groupSize,10))?Math.max(1,parseInt(sheet.groupSize,10)):null;
            completeMultiple=quantityConfigured&&Number.isFinite(parseInt(sheet.completeMultiple,10))?Math.max(1,parseInt(sheet.completeMultiple,10)):null;
            $('quantityTitleInput').value=quantityTitle;
            $('boxSizeInput').value=boxSize||''; $('groupSizeInput').value=groupSize||''; $('completeMultipleInput').value=completeMultiple||''; syncQuantityControlLabels();
            showPricingRow=sheet.showPricingRow!==false; showUnitPriceRow=sheet.showUnitPriceRow!==false; showPromotionPointRow=sheet.showPromotionPointRow!==false; showCompleteRowColor=sheet.showCompleteRowColor!==false; showColdPromotionColor=sheet.showColdPromotionColor!==false;
            coldPromotionHighlights=sheet.coldPromotionHighlights&&typeof sheet.coldPromotionHighlights==='object'?deepClone(sheet.coldPromotionHighlights):{completeRows:[],pendingRows:[]};
            coldPromotionBatches=Array.isArray(sheet.coldPromotionBatches)?deepClone(sheet.coldPromotionBatches):[];
            coldPromotionSeriesBaseAllocations=sheet.coldPromotionSeriesBaseAllocations&&typeof sheet.coldPromotionSeriesBaseAllocations==='object'?deepClone(sheet.coldPromotionSeriesBaseAllocations):null;
            coldPromotionSeriesBaseHighlights=sheet.coldPromotionSeriesBaseHighlights&&typeof sheet.coldPromotionSeriesBaseHighlights==='object'?deepClone(sheet.coldPromotionSeriesBaseHighlights):null;
            coldPromotionSeriesFormalSignature=String(sheet.coldPromotionSeriesFormalSignature||'');
            coldPromotionDraftRows=Array.isArray(sheet.coldPromotionDraftRows)?deepClone(sheet.coldPromotionDraftRows):[]; coldPromotionDraftApplied=sheet.coldPromotionDraftApplied===true;
            coldPromotionDraftBaseAllocations=sheet.coldPromotionDraftBaseAllocations&&typeof sheet.coldPromotionDraftBaseAllocations==='object'?deepClone(sheet.coldPromotionDraftBaseAllocations):null;
            migrateLegacyColdPromotionDraft();
            rowIdSeed=Math.max(rowIdSeed,...coldPromotionDraftRows.map(row=>(Number(row.id)||0)+1));
            previewRows=[];
            colIdSeed=columns.reduce((m,c)=>Math.max(m,c.id||0),0)+1;
            applyCost(sheet.cost);
            $('commentInput').value='';
            $('previewPanel').style.display='none';
            $('transferPreviewPanel').style.display='none'; transferPreviewRows=[]; transferPreviewSignature='';
            $('cancelPreviewPanel').style.display='none'; cancelPreviewRows=[]; cancelPreviewSignature='';
            $('coldPromotionPreviewPanel').style.display='none'; coldPromotionPreviewRows=[]; coldPromotionPreviewAllocations=null; coldPromotionPlanRevision=-1; coldPromotionPlanSignature='';
            syncCartControls();
            syncPaymentControls();
            syncMatrixOptions();
            renderColdBundleConfiguration(); syncUndoButton();
            renderColumnList(); if($('catalogPanel').style.display!=='none') renderCatalog(); recalc(); renderSheetTabs();
            isLoadingSheet=false;
          }
          function applyCost(c){
            c=c||{};
            if(c.sharedFee===undefined){
              const legacy=num(c.ticketFee)+num(c.transportFee);
              c.sharedFee=legacy>0?String(legacy):'';
            }
            ['priceType','count','jpyPrice','exchangeRate','manualAveragePrice','sharedFee'].forEach(k=>{
              $(k).value = (c[k]!==undefined && c[k]!=='') ? c[k] : COST_DEFAULTS[k];
            });
          }
          // ============================================================
          // 排单快照与本地保存
          // ============================================================
          function saveState(){
            if(isLoadingSheet) return true;
            captureActiveSheet();
            let localSaved=true;
            try{ localStorage.setItem(STORAGE_KEY, JSON.stringify({sheets,activeSheetId,sheetIdSeed,itemCatalog,catalogIdSeed,sharedCartQrImg,sharedPaymentQrImg})); }
            catch(e){ localSaved=false; console.warn('保存失败',e); }
            if($('localStatus')){ $('localStatus').textContent=localSaved?'本机已保存':'本机保存失败'; $('localStatus').style.color=localSaved?'var(--ok)':'var(--bad)'; }
            if(!applyingCloud&&!applyingCollab){
              localRevision++; cloudDirty=true; rememberCloudDirty(syncCode,true);
              if(collabEnabled){ scheduleCollabSync(); setCloudStatus('实时协作中 · 完整备份未更新','warn'); }
              else if(syncCode&&cloudIdleEnabled) scheduleIdleCloudUpload();
              else setCloudStatus(syncCode?'云端完整备份未更新':'尚未加入协作组',syncCode?'warn':false);
            }
            return localSaved;
          }
          const deepClone=value=>JSON.parse(JSON.stringify(value));
          function actionPreviewDataSignature(){
            return JSON.stringify({columns:columns.map(c=>({id:c.id,name:c.name,aliases:c.aliases||[]})),allocations});
          }
          function coldPreviewDataSignature(){
            return JSON.stringify({action:actionPreviewDataSignature(),bundle:coldCarryBundleColumnIds.map(Number),pricing:columns.map(c=>({id:c.id,mode:c.mode,promotionPoints:c.promotionPoints}))});
          }
          function loadUndoHistory(){
            try{
              const parsed=JSON.parse(localStorage.getItem(UNDO_STORAGE_KEY)||'{}');
              undoHistoryBySheet=parsed&&typeof parsed==='object'?parsed:{};
            }catch(e){ undoHistoryBySheet={}; }
          }
          function saveUndoHistory(){
            try{ localStorage.setItem(UNDO_STORAGE_KEY,JSON.stringify(undoHistoryBySheet)); return true; }
            catch(e){ console.warn('撤回记录保存失败',e); return false; }
          }
          function currentUndoHistory(){
            const key=String(activeSheetId);
            if(!Array.isArray(undoHistoryBySheet[key])) undoHistoryBySheet[key]=[];
            return undoHistoryBySheet[key];
          }
          function syncUndoButton(){
            const button=$('undoLastApplyBtn'); if(!button) return;
            const count=activeSheetId==null?0:currentUndoHistory().length;
            button.disabled=count===0;
            button.textContent=count?`撤回上次应用（${count}）`:'撤回上次应用';
          }
          function pushUndoSnapshot(actionType,label){
            captureActiveSheet();
            const sheet=sheets.find(s=>s.id===activeSheetId); if(!sheet) return false;
            const history=currentUndoHistory();
            const snapshotSheet=deepClone(sheet);
            (snapshotSheet.columns||[]).forEach(c=>{ delete c.img; });
            history.push({id:`undo_${Date.now()}_${Math.random().toString(36).slice(2,7)}`,projectId:activeSheetId,createdAt:Date.now(),actionType,label,sheet:snapshotSheet});
            while(history.length>10) history.shift();
            if(!saveUndoHistory()){
              history.pop(); syncUndoButton();
              alert('无法创建撤回快照，本次修改尚未应用。请先清理浏览器存储空间。');
              return false;
            }
            syncUndoButton(); return true;
          }
          function undoLastApplication(){
            const history=currentUndoHistory();
            if(!history.length){ alert('暂无可撤回操作'); return; }
            if(!confirm('是否撤回上一次排单修改？\n当前排单表将恢复到应用前状态。')) return;
            const snapshot=history[history.length-1], index=sheets.findIndex(s=>s.id===activeSheetId);
            if(index<0||!snapshot.sheet){ alert('撤回记录已损坏，无法恢复'); return; }
            captureActiveSheet(); const before=deepClone(sheets[index]);
            const restored=deepClone(snapshot.sheet); restored.id=activeSheetId;
            const currentImages=new Map((before.columns||[]).map(c=>[c.id,c.img||null]));
            (restored.columns||[]).forEach(c=>{ c.img=currentImages.get(c.id)||null; });
            sheets[index]=restored; applySheet(restored);
            if(!saveState()){
              sheets[index]=before; applySheet(before); saveState();
              alert('撤回后的数据保存失败，已恢复撤回前状态。'); return;
            }
            history.pop(); saveUndoHistory(); syncUndoButton();
            alert('已撤回上一次排单修改');
          }
          function migrateColumn(c){
            // migrate legacy {isAvg,priceAdj} into mode model
            if(!c.mode){
              if(c.isAvg) c.mode='avg';
              else c.mode='adjust';
            }
            if(c.priceAdj===undefined) c.priceAdj=0;
            if(c.fixedPrice===undefined) c.fixedPrice=0;
            if(c.avgOverride===undefined) c.avgOverride=null;
            if(c.sourceJpyPrice===undefined) c.sourceJpyPrice=0;
            c.promotionPoints=Number.isFinite(Number(c.promotionPoints))?Math.max(0,Number(c.promotionPoints)):1;
            if(!Array.isArray(c.aliases)) c.aliases=[];
            return c;
          }
          function migrateCatalogItem(item){
            const c=migrateColumn(item||{});
            c.name=String(c.name||'').trim()||'未命名谷子';
            c.aliases=(c.aliases||[]).map(alias=>String(alias||'').trim()).filter(Boolean);
            c.catalogPinned=c.catalogPinned===true;
            c.catalogGroup=String(c.catalogGroup||'').trim();
            c.catalogUsage=Math.max(0,parseInt(c.catalogUsage,10)||0);
            c.catalogLastUsedAt=String(c.catalogLastUsedAt||'');
            return c;
          }
          function migrateCatalogItems(items){
            const list=(Array.isArray(items)?items:[]).map(migrateCatalogItem), used=new Set();
            let nextId=Math.max(1,...list.map(item=>(Number.isInteger(Number(item.catalogId))&&Number(item.catalogId)>0)?Number(item.catalogId)+1:1));
            list.forEach(item=>{
              const id=Number(item.catalogId);
              if(Number.isInteger(id)&&id>0&&!used.has(id)){ item.catalogId=id; used.add(id); return; }
              while(used.has(nextId)) nextId++;
              item.catalogId=nextId++; used.add(item.catalogId);
            });
            return list;
          }
          function loadState(){
            try{
              const raw=localStorage.getItem(STORAGE_KEY);
              if(raw){
                const d=JSON.parse(raw);
                if(Array.isArray(d.sheets)&&d.sheets.length){
                  sheets=d.sheets;
                  sharedCartQrImg=d.sharedCartQrImg||sheets.find(s=>s.cartQrImg)?.cartQrImg||'';
                  sharedPaymentQrImg=d.sharedPaymentQrImg||sheets.find(s=>s.paymentQrImg||s.alipayQrImg||s.wechatQrImg)?.paymentQrImg||sheets.find(s=>s.alipayQrImg)?.alipayQrImg||sheets.find(s=>s.wechatQrImg)?.wechatQrImg||'';
                  sheets.forEach(s=>{ delete s.cartQrImg; delete s.paymentQrImg; delete s.alipayQrImg; delete s.wechatQrImg; });
                  itemCatalog=migrateCatalogItems(d.itemCatalog);
                  catalogIdSeed=Math.max(d.catalogIdSeed||1,...itemCatalog.map(x=>(x.catalogId||0)+1));
                  sheetIdSeed=Math.max(d.sheetIdSeed||1,...sheets.map(s=>(s.id||0)+1));
                  activeSheetId=sheets.some(s=>s.id===d.activeSheetId)?d.activeSheetId:sheets[0].id;
                  const sheet=sheets.find(s=>s.id===activeSheetId);
                  columns=Array.isArray(sheet.columns)?sheet.columns.map(migrateColumn):[];
                  allocations=sheet.allocations||{}; cartNote=sheet.cartNote||'';
                  cartTargetMode=sheet.cartTargetMode||'auto'; cartTargetNum=sheet.cartTargetNum!==undefined?sheet.cartTargetNum:null;
                  cartCountMode=sheet.cartCountMode||'short'; cartColumns=sheet.cartColumns||4; cartQrImg=sharedCartQrImg;
                  matrixTitle=resolvedSheetTitle(sheet,'matrixTitle'); matrixColor=sheet.matrixColor||'#d1466a';
                  quantityTitle=resolvedSheetTitle(sheet,'quantityTitle');
                  paymentTitle=resolvedSheetTitle(sheet,'paymentTitle'); paymentColor=sheet.paymentColor||'#d1466a'; paymentViewMode=sheet.paymentViewMode==='merged'?'merged':'detail';
                  paymentStartRow=Math.max(1,parseInt(sheet.paymentStartRow,10)||1); paymentEndRow=Number.isFinite(parseInt(sheet.paymentEndRow,10))?Math.max(paymentStartRow,parseInt(sheet.paymentEndRow,10)):null;
                  showPaymentTotal=sheet.showPaymentTotal!==false;
                  paymentEdits=sheet.paymentEdits||{};
                  paymentPaid=sheet.paymentPaid&&typeof sheet.paymentPaid==='object'?sheet.paymentPaid:{};
                  paymentRefund=sheet.paymentRefund&&typeof sheet.paymentRefund==='object'?sheet.paymentRefund:{};
                  paymentSupplement=sheet.paymentSupplement&&typeof sheet.paymentSupplement==='object'?sheet.paymentSupplement:{};
                  sharePaymentTitle=resolvedSharePaymentTitle(sheet); sharePaymentTitleCustom=sheet.sharePaymentTitleCustom===true; sharePaymentColor=sheet.sharePaymentColor||paymentColor||'#d1466a'; sharePaymentViewMode=sheet.sharePaymentViewMode==='merged'?'merged':'detail'; sharePaymentEdits=sheet.sharePaymentEdits||{};
                  sharePaymentPaid=sheet.sharePaymentPaid&&typeof sheet.sharePaymentPaid==='object'?sheet.sharePaymentPaid:{}; shareDeductFixed=sheet.shareDeductFixed===true;
                  sharePaymentRefund=sheet.sharePaymentRefund&&typeof sheet.sharePaymentRefund==='object'?sheet.sharePaymentRefund:{};
                  sharePaymentSupplement=sheet.sharePaymentSupplement&&typeof sheet.sharePaymentSupplement==='object'?sheet.sharePaymentSupplement:{};
                  coldCarryBundleColumnIds=(Array.isArray(sheet.coldCarryBundleColumnIds)?sheet.coldCarryBundleColumnIds:[]).map(Number).filter(id=>columns.some(c=>c.id===id&&c.mode!=='fixed'));
                  paymentQrImg=sharedPaymentQrImg;
                  quantityConfigured=sheet.quantityConfigured===true;
                  boxSize=quantityConfigured&&Number.isFinite(parseInt(sheet.boxSize,10))?Math.max(1,parseInt(sheet.boxSize,10)):null;
                  groupSize=quantityConfigured&&Number.isFinite(parseInt(sheet.groupSize,10))?Math.max(1,parseInt(sheet.groupSize,10)):null;
                  completeMultiple=quantityConfigured&&Number.isFinite(parseInt(sheet.completeMultiple,10))?Math.max(1,parseInt(sheet.completeMultiple,10)):null;
                  $('quantityTitleInput').value=quantityTitle;
                  $('boxSizeInput').value=boxSize||''; $('groupSizeInput').value=groupSize||''; $('completeMultipleInput').value=completeMultiple||''; syncQuantityControlLabels();
                  showPricingRow=sheet.showPricingRow!==false; showUnitPriceRow=sheet.showUnitPriceRow!==false; showPromotionPointRow=sheet.showPromotionPointRow!==false; showCompleteRowColor=sheet.showCompleteRowColor!==false; showColdPromotionColor=sheet.showColdPromotionColor!==false;
                  coldPromotionHighlights=sheet.coldPromotionHighlights&&typeof sheet.coldPromotionHighlights==='object'?deepClone(sheet.coldPromotionHighlights):{completeRows:[],pendingRows:[]};
                  coldPromotionBatches=Array.isArray(sheet.coldPromotionBatches)?deepClone(sheet.coldPromotionBatches):[]; coldPromotionSeriesBaseAllocations=sheet.coldPromotionSeriesBaseAllocations&&typeof sheet.coldPromotionSeriesBaseAllocations==='object'?deepClone(sheet.coldPromotionSeriesBaseAllocations):null; coldPromotionSeriesBaseHighlights=sheet.coldPromotionSeriesBaseHighlights&&typeof sheet.coldPromotionSeriesBaseHighlights==='object'?deepClone(sheet.coldPromotionSeriesBaseHighlights):null; coldPromotionSeriesFormalSignature=String(sheet.coldPromotionSeriesFormalSignature||'');
                  coldPromotionDraftRows=Array.isArray(sheet.coldPromotionDraftRows)?deepClone(sheet.coldPromotionDraftRows):[]; coldPromotionDraftApplied=sheet.coldPromotionDraftApplied===true;
                  coldPromotionDraftBaseAllocations=sheet.coldPromotionDraftBaseAllocations&&typeof sheet.coldPromotionDraftBaseAllocations==='object'?deepClone(sheet.coldPromotionDraftBaseAllocations):null;
                  colIdSeed=columns.reduce((m,c)=>Math.max(m,c.id||0),0)+1; applyCost(sheet.cost);
                }else{
                  const first=blankSheet('表1'); activeSheetId=first.id;
                  first.columns=Array.isArray(d.columns)?d.columns.map(migrateColumn):[]; first.allocations=d.allocations||{};
                  first.cost=d.cost||{...COST_DEFAULTS}; first.cartNote=d.cartNote||'';
                  first.cartTargetMode=d.cartTargetMode||'auto'; first.cartTargetNum=d.cartTargetNum!==undefined?d.cartTargetNum:null;
                  first.showPricingRow=d.showPricingRow!==false; first.showUnitPriceRow=d.showUnitPriceRow!==false; first.showPromotionPointRow=d.showPromotionPointRow!==false; first.showCompleteRowColor=d.showCompleteRowColor!==false; first.showColdPromotionColor=d.showColdPromotionColor!==false;
                  first.coldPromotionHighlights=d.coldPromotionHighlights&&typeof d.coldPromotionHighlights==='object'?deepClone(d.coldPromotionHighlights):{completeRows:[],pendingRows:[]};
                  first.coldPromotionBatches=Array.isArray(d.coldPromotionBatches)?deepClone(d.coldPromotionBatches):[]; first.coldPromotionSeriesBaseAllocations=d.coldPromotionSeriesBaseAllocations&&typeof d.coldPromotionSeriesBaseAllocations==='object'?deepClone(d.coldPromotionSeriesBaseAllocations):null; first.coldPromotionSeriesBaseHighlights=d.coldPromotionSeriesBaseHighlights&&typeof d.coldPromotionSeriesBaseHighlights==='object'?deepClone(d.coldPromotionSeriesBaseHighlights):null; first.coldPromotionSeriesFormalSignature=String(d.coldPromotionSeriesFormalSignature||'');
                  first.coldPromotionDraftRows=Array.isArray(d.coldPromotionDraftRows)?deepClone(d.coldPromotionDraftRows):[]; first.coldPromotionDraftApplied=d.coldPromotionDraftApplied===true;
                  first.coldPromotionDraftBaseAllocations=d.coldPromotionDraftBaseAllocations&&typeof d.coldPromotionDraftBaseAllocations==='object'?deepClone(d.coldPromotionDraftBaseAllocations):null;
                  first.coldCarryBundleColumnIds=Array.isArray(d.coldCarryBundleColumnIds)?d.coldCarryBundleColumnIds.map(Number):[];
                  first.matrixTitle=d.matrixTitle||''; first.matrixTitleCustom=!!String(first.matrixTitle).trim()&&String(first.matrixTitle).trim()!==first.name; first.matrixColor=d.matrixColor||'#d1466a';
                  first.quantityTitle=d.quantityTitle||''; first.quantityTitleCustom=!!String(first.quantityTitle).trim()&&String(first.quantityTitle).trim()!==first.name;
                  first.paymentTitle=d.paymentTitle||''; first.paymentTitleCustom=!!String(first.paymentTitle).trim()&&String(first.paymentTitle).trim()!==first.name; first.paymentColor=d.paymentColor||'#d1466a';
                  sharedCartQrImg=d.sharedCartQrImg||d.cartQrImg||''; sharedPaymentQrImg=d.sharedPaymentQrImg||d.paymentQrImg||d.alipayQrImg||d.wechatQrImg||'';
                  sheets=[first]; columns=first.columns; allocations=first.allocations; cartNote=first.cartNote;
                  cartTargetMode=first.cartTargetMode; cartTargetNum=first.cartTargetNum; cartQrImg=sharedCartQrImg; paymentQrImg=sharedPaymentQrImg; matrixTitle=resolvedSheetTitle(first,'matrixTitle'); matrixColor=first.matrixColor; quantityTitle=resolvedSheetTitle(first,'quantityTitle'); paymentTitle=resolvedSheetTitle(first,'paymentTitle'); paymentColor=first.paymentColor; showPricingRow=first.showPricingRow; showUnitPriceRow=first.showUnitPriceRow; showPromotionPointRow=first.showPromotionPointRow; showCompleteRowColor=first.showCompleteRowColor; showColdPromotionColor=first.showColdPromotionColor; coldPromotionHighlights=deepClone(first.coldPromotionHighlights); coldPromotionDraftRows=deepClone(first.coldPromotionDraftRows); coldPromotionDraftApplied=first.coldPromotionDraftApplied; coldPromotionDraftBaseAllocations=deepClone(first.coldPromotionDraftBaseAllocations); coldCarryBundleColumnIds=first.coldCarryBundleColumnIds.filter(id=>columns.some(c=>c.id===id&&c.mode!=='fixed')); applyCost(first.cost);
                }
                return;
              }
            }catch(e){ console.warn('读取失败',e); }
            const first=blankSheet('表1'); sheets=[first]; activeSheetId=first.id; applySheet(first);
          }
      
          function isSheetCompleted(sheet){ return sheet?.completed===true; }
          function completedSheetsByRecent(){ return sheets.filter(isSheetCompleted); }
          function renderSheetTabs(){
            const query=String($('sheetSearchInput')?.value||'').trim().toLowerCase();
            const ongoing=sheets.filter(sheet=>!isSheetCompleted(sheet)), completed=completedSheetsByRecent();
            const matches=sheet=>!query||String(sheet.name||'').toLowerCase().includes(query);
            const groups=[];
            if(sheetStatusFilter!=='completed') groups.push({label:`进行中 · ${ongoing.length}`,items:ongoing.filter(matches),movable:true});
            if(sheetStatusFilter!=='ongoing') groups.push({label:`已完成 · ${completed.length}`,items:completed.filter(matches),movable:true});
            const tabHtml=(sheet,movable)=>{
              return `<div class="sheet-tab ${sheet.id===activeSheetId?'active':''}${isSheetCompleted(sheet)?' is-completed':''}" data-sheet="${sheet.id}" title="双击改名"><span class="sheet-tab-name">${escapeHtml(sheet.name)}</span>${movable?'<span class="sheet-drag-handle" draggable="true" title="拖动排序" aria-label="拖动排序"></span>':''}${sheets.length>1?'<span class="sheet-close" title="删除这张表">×</span>':''}</div>`;
            };
            $('sheetTabs').innerHTML=groups.map(group=>`<div class="sheet-group-label">${group.label}</div>${group.items.map(sheet=>tabHtml(sheet,group.movable)).join('')}`).join('')||'<div class="sheet-list-empty">没有符合条件的排单</div>';
            document.querySelectorAll('[data-sheet-status-filter]').forEach(button=>button.classList.toggle('active',button.dataset.sheetStatusFilter===sheetStatusFilter));
            syncMobileSheetSelect();
            if(!$('mobileSheetSortOverlay').hidden) renderMobileSheetSort();
            syncSheetCompletionButtons();
          }
          function syncMobileSheetSelect(){
            const select=$('mobileSheetSelect'); if(!select) return;
            const ongoing=sheets.filter(sheet=>!isSheetCompleted(sheet)),completed=completedSheetsByRecent();
            select.innerHTML=(ongoing.length?`<optgroup label="进行中">${ongoing.map(sheet=>`<option value="${sheet.id}">${escapeHtml(sheet.name||`表${sheet.id}`)}</option>`).join('')}</optgroup>`:'')+(completed.length?`<optgroup label="已完成">${completed.map(sheet=>`<option value="${sheet.id}">${escapeHtml(sheet.name||`表${sheet.id}`)}</option>`).join('')}</optgroup>`:'');
            select.value=String(activeSheetId);
            $('mobileDeleteSheetBtn').disabled=sheets.length<=1;
          }
          function renderMobileSheetSort(){
            const list=$('mobileSheetSortList'); if(!list) return;
            const groups=[
              {label:'进行中',items:sheets.filter(sheet=>!isSheetCompleted(sheet))},
              {label:'已完成',items:sheets.filter(isSheetCompleted)}
            ].filter(group=>group.items.length);
            list.innerHTML=groups.map(group=>`<div class="mobile-sort-group">${group.label} · ${group.items.length}</div>${group.items.map((sheet,index)=>`<div class="mobile-sort-row${sheet.id===activeSheetId?' active':''}" data-sort-sheet="${sheet.id}"><span class="mobile-sort-row-name">${escapeHtml(sheet.name||`表${sheet.id}`)}</span><button type="button" data-mobile-sort-offset="-1" aria-label="上移" title="上移"${index===0?' disabled':''}>↑</button><button type="button" data-mobile-sort-offset="1" aria-label="下移" title="下移"${index===group.items.length-1?' disabled':''}>↓</button></div>`).join('')}`).join('');
          }
          function setMobileSheetSortOpen(open){
            const overlay=$('mobileSheetSortOverlay'); if(!overlay) return;
            overlay.classList.toggle('is-open',!!open);
            overlay.hidden=!open;
            if(open) renderMobileSheetSort();
          }
          function syncSheetCompletionButtons(){
            const completed=isSheetCompleted(sheets.find(sheet=>sheet.id===activeSheetId));
            if($('toggleSheetCompletedBtn')){ $('toggleSheetCompletedBtn').textContent=completed?'恢复进行中':'标记完成'; $('toggleSheetCompletedBtn').classList.toggle('is-completed',completed); }
            if($('mobileToggleSheetCompletedBtn')) $('mobileToggleSheetCompletedBtn').textContent=completed?'恢复':'完成';
          }
          function setAppSection(section,scrollToTop=true){
            const groups={
              goods:['costPanel','columnPanel'],
              order:['ocrPanel','commentPanel','transferPreviewPanel','cancelPreviewPanel','coldPromotionPreviewPanel','previewPanel','matrixPanel'],
              stats:['quantityPanel','cartPanel'],
              payment:['paymentPanel'],
              settings:['settingsPanel']
            };
            if(!groups[section]) section='order'; activeAppSection=section; localStorage.setItem(APP_SECTION_KEY,section);
            document.querySelector('.wrap').dataset.activeSection=section;
            Object.entries(groups).forEach(([group,ids])=>ids.forEach(id=>$(id)?.classList.toggle('app-section-hidden',group!==section)));
            document.querySelectorAll('[data-app-section]').forEach(button=>button.classList.toggle('active',button.dataset.appSection===section));
            if(scrollToTop) window.scrollTo(0,0);
          }
          function appConfirm(message,title='请确认',okText='确定'){
            return new Promise(resolve=>{
              const overlay=$('appConfirmOverlay'), ok=$('appConfirmOk'), cancel=$('appConfirmCancel');
              $('appConfirmTitle').textContent=title; $('appConfirmMessage').textContent=message; ok.textContent=okText; overlay.hidden=false; overlay.style.display='grid';
              const finish=value=>{ overlay.hidden=true; overlay.style.display='none'; ok.removeEventListener('click',accept); cancel.removeEventListener('click',reject); overlay.removeEventListener('click',backdrop); document.removeEventListener('keydown',keyboard); resolve(value); };
              const accept=()=>finish(true), reject=()=>finish(false), backdrop=e=>{ if(e.target===overlay) finish(false); }, keyboard=e=>{ if(e.key==='Escape') finish(false); };
              ok.addEventListener('click',accept); cancel.addEventListener('click',reject); overlay.addEventListener('click',backdrop); document.addEventListener('keydown',keyboard); setTimeout(()=>ok.focus(),0);
            });
          }
          let customSelectTarget=null;
          function mobileCustomSelectEnabled(){ return window.innerWidth<=760; }
          function closeCustomSelect(){
            customSelectTarget=null;
            const overlay=$('customSelectOverlay');
            overlay.hidden=true; overlay.style.display='none'; $('customSelectMenu').innerHTML='';
          }
          function appendCustomSelectOption(menu,option,index){
            const button=document.createElement('button');
            button.type='button'; button.className='custom-select-option'+(option.selected?' selected':''); button.textContent=option.textContent||option.label||'';
            button.dataset.optionIndex=String(index); button.disabled=option.disabled; button.setAttribute('role','option'); button.setAttribute('aria-selected',option.selected?'true':'false');
            menu.appendChild(button);
          }
          function openCustomSelect(select){
            if(!select||select.disabled||!mobileCustomSelectEnabled()) return;
            const overlay=$('customSelectOverlay'),menu=$('customSelectMenu');
            customSelectTarget=select; menu.innerHTML='';
            [...select.children].forEach(child=>{
              if(child.tagName==='OPTGROUP'){
                const label=document.createElement('div'); label.className='custom-select-group'; label.textContent=child.label||''; menu.appendChild(label);
                [...child.children].forEach(option=>appendCustomSelectOption(menu,option,[...select.options].indexOf(option)));
              }else if(child.tagName==='OPTION') appendCustomSelectOption(menu,child,[...select.options].indexOf(child));
            });
            overlay.hidden=false; overlay.style.display='block';
            const rect=select.getBoundingClientRect(),visual=window.visualViewport,viewportLeft=visual?.offsetLeft||0,viewportWidth=visual?.width||window.innerWidth,viewportTop=visual?.offsetTop||0,viewportHeight=visual?.height||window.innerHeight,viewportBottom=viewportTop+viewportHeight;
            const width=Math.min(Math.max(rect.width,170),viewportWidth-16),left=Math.max(viewportLeft+8,Math.min(rect.left,viewportLeft+viewportWidth-width-8));
            menu.style.width=width+'px'; menu.style.left=left+'px'; menu.style.top='auto'; menu.style.bottom='auto';
            const estimatedHeight=Math.min(menu.scrollHeight,Math.min(330,viewportHeight*.58)),spaceBelow=viewportBottom-rect.bottom-6;
            if(spaceBelow>=Math.min(estimatedHeight,150)) menu.style.top=Math.max(viewportTop+6,rect.bottom+4)+'px';
            else menu.style.bottom=Math.max(6,window.innerHeight-rect.top+4)+'px';
            requestAnimationFrame(()=>menu.querySelector('.custom-select-option.selected')?.scrollIntoView({block:'nearest'}));
          }
          function interceptNativeSelect(e){
            if(!mobileCustomSelectEnabled()) return;
            const select=e.target?.closest?.('select'); if(!select||select.disabled) return;
            e.preventDefault(); e.stopPropagation();
            if(customSelectTarget!==select||$('customSelectOverlay').hidden) openCustomSelect(select);
          }
          document.addEventListener('pointerdown',interceptNativeSelect,true);
          if(!window.PointerEvent) document.addEventListener('touchstart',interceptNativeSelect,{capture:true,passive:false});
          document.addEventListener('click',e=>{
            if(mobileCustomSelectEnabled()&&e.target?.closest?.('select')){ e.preventDefault(); e.stopPropagation(); }
          },true);
          document.addEventListener('keydown',e=>{
            if(mobileCustomSelectEnabled()&&e.target?.matches?.('select')&&(e.key==='Enter'||e.key===' '||e.key==='ArrowDown')){ e.preventDefault(); openCustomSelect(e.target); }
            else if(e.key==='Escape'&&!$('customSelectOverlay').hidden) closeCustomSelect();
          });
          $('customSelectOverlay').addEventListener('pointerdown',e=>{ if(e.target===$('customSelectOverlay')){ e.preventDefault(); closeCustomSelect(); } });
          $('customSelectMenu').addEventListener('click',e=>{
            const button=e.target.closest('[data-option-index]'); if(!button||button.disabled||!customSelectTarget) return;
            const select=customSelectTarget,index=parseInt(button.dataset.optionIndex,10),option=select.options[index]; if(!option||option.disabled) return;
            closeCustomSelect(); select.selectedIndex=index; select.dispatchEvent(new Event('input',{bubbles:true})); select.dispatchEvent(new Event('change',{bubbles:true}));
          });
          window.addEventListener('resize',closeCustomSelect);
          window.addEventListener('scroll',()=>{ if(!$('customSelectOverlay').hidden) closeCustomSelect(); },{passive:true});
          function syncMatrixOptions(){
            const pricing=$('showPricingRow'), unit=$('showUnitPriceRow'), promotion=$('showPromotionPointRow'), complete=$('showCompleteRowColor'), cold=$('showColdPromotionColor');
            pricing.textContent=showPricingRow?'隐藏调价':'显示调价';
            unit.textContent=showUnitPriceRow?'隐藏单价':'显示单价';
            promotion.textContent=showPromotionPointRow?'隐藏提配点数':'显示提配点数';
            complete.textContent=showCompleteRowColor?'关闭满配变色':'开启满配变色';
            cold.textContent=showColdPromotionColor?'关闭带冷提变色':'开启带冷提变色';
            pricing.classList.toggle('off',!showPricingRow);
            unit.classList.toggle('off',!showUnitPriceRow);
            promotion.classList.toggle('off',!showPromotionPointRow);
            complete.classList.toggle('off',!showCompleteRowColor);
            cold.classList.toggle('off',!showColdPromotionColor);
            $('markBoughtModeBtn').classList.toggle('active',matrixBuyMarkMode);
            $('markBoughtModeBtn').textContent=matrixBuyMarkMode?'退出买齐标记':'买齐标记';
            $('matrixTip').textContent=matrixBuyMarkMode?'买齐标记中：点人名切换买齐，点左侧行号标记整行。':'点格子改字，拖动换位置。';
            $('matrixTitleInput').value=matrixTitle;
            $('matrixColorInput').value=/^#[0-9a-f]{6}$/i.test(matrixColor)?matrixColor:'#d1466a';
            renderMatrixHeading();
          }
          function activeBundleColumns(){
            const selected=new Set(coldCarryBundleColumnIds.map(Number));
            return columns.filter(c=>selected.has(c.id)&&c.mode!=='fixed');
          }
          function renderColdBundleConfiguration(){
            coldCarryBundleColumnIds=activeBundleColumns().map(c=>c.id);
            const selected=activeBundleColumns();
            if($('coldBundleSummary')) $('coldBundleSummary').textContent=selected.length?`捆位：${selected.map(c=>c.name).join('、')}`:'捆位：尚未选择';
            if($('selectColdBundleBtn')) $('selectColdBundleBtn').textContent=selected.length?'修改':'选择捆位';
            if($('coldBundleChooser')&&$('coldBundleChooser').style.display!=='none') renderColdBundleList();
          }
          function renderColdBundleList(){
            const selected=new Set(coldCarryBundleColumnIds.map(Number));
            $('coldBundleList').innerHTML=columns.length?columns.map(c=>{
              const fixed=c.mode==='fixed';
              return `<label class="${fixed?'is-fixed':''}"><input type="checkbox" value="${c.id}" ${selected.has(c.id)&&!fixed?'checked':''} ${fixed?'disabled':''}> <span>${escapeHtml(c.name)}${fixed?'（入均）':''}</span></label>`;
            }).join(''):'<span class="hint">请先添加谷子列。</span>';
          }
          function openColdBundleChooser(pendingPreview){
            coldPromotionPendingBundlePreview=!!pendingPreview;
            renderColdBundleList(); $('coldBundleChooser').style.display='block';
            if(pendingPreview) $('coldBundleSummary').textContent='请先选择捆位，保存后会继续生成预览。';
          }
          // ============================================================
          // 页面控件与云端状态
          // ============================================================
          function renderMatrixHeading(){
            const el=$('matrixProjectTitle'), color=/^#[0-9a-f]{6}$/i.test(matrixColor)?matrixColor:'#d1466a';
            el.textContent=matrixTitle||'未命名项目'; el.style.background=color;
          }
          function switchSheet(id){
            if(id===activeSheetId) return;
            captureActiveSheet();
            const sheet=sheets.find(s=>s.id===id); if(!sheet) return;
            applySheet(sheet); saveState();
          }
          function setCloudStatus(text,tone){ const el=$('cloudStatus'); el.textContent=text; el.style.color=tone==='warn'?'var(--warn)':(tone?'var(--bad)':'var(--muted)'); }
          function normalizedSyncCode(){ return UUID_RE.test(String(activeWorkspaceId||syncCode))?String(activeWorkspaceId||syncCode):''; }
          function rememberCloudVersion(code,updatedAt){ lastCloudUpdatedAt=updatedAt||''; if(code&&updatedAt) localStorage.setItem(CLOUD_VERSION_KEY_PREFIX+code,updatedAt); }
          function rememberedCloudDirty(code,knownVersion){ const stored=code?localStorage.getItem(CLOUD_DIRTY_KEY_PREFIX+code):null; return stored===null?!knownVersion:stored==='1'; }
          function rememberCloudDirty(code,dirty){ if(code) localStorage.setItem(CLOUD_DIRTY_KEY_PREFIX+code,dirty?'1':'0'); }
          function cloudVersionIsNewer(remote,known){ return !!remote&&(!known||new Date(remote)>new Date(known)); }
          function pauseForCloudConflict(){
            cloudConflictPaused=true; clearIdleCloudUpload();
            setCloudStatus('云端有较新版本，已暂停自动上传以免覆盖，请手动确认','warn');
          }
          function getCloudClient(code){
            if(!window.supabase||!window.supabase.createClient) throw new Error('云同步组件尚未加载');
            cloudClient=getAuthClient();
            return cloudClient;
          }
          function editLockExpired(lock){ return !lock?.expires_at||new Date(lock.expires_at).getTime()<=Date.now(); }
          function editLockRow(data){ return Array.isArray(data)?(data[0]||null):(data||null); }
          function stopEditLockTimer(){ if(editLockTimer){ clearInterval(editLockTimer); editLockTimer=null; } }
          function startEditLockTimer(){
            stopEditLockTimer();
            if(!syncCode||editLockSupported===false) return;
            editLockTimer=setInterval(()=>{ if(editLockOwned) heartbeatEditLock(); else refreshEditLockStatus(); },EDIT_LOCK_CHECK_MS);
          }
          function syncEditLockUI(){
            document.documentElement.classList.remove('cloud-edit-readonly');
            $('editLockBanner').style.display='none';
            $('cloudUploadBtn').disabled=cloudBusy;
          }
          function lockFeatureMissing(error){ return ['42P01','42883','PGRST202','PGRST205'].includes(error?.code); }
          function lockRequest(request,timeoutMs=12000){
            let timer;
            return Promise.race([
              Promise.resolve(request),
              new Promise((_,reject)=>{ timer=setTimeout(()=>reject(new Error('编辑权确认超时')),timeoutMs); })
            ]).finally(()=>clearTimeout(timer));
          }
          async function refreshEditLockStatus(){
            const code=normalizedSyncCode();
            if(!code){ editLockSupported=false; editLockOwned=false; editLockRecord=null; syncEditLockUI(); return; }
            try{
              const client=getCloudClient(code), {data,error}=await lockRequest(client.from('ggz_edit_locks').select('holder_id,holder_name,expires_at').eq('sync_code',code).maybeSingle());
              if(error) throw error;
              editLockSupported=true; editLockRecord=data&&!editLockExpired(data)?data:null;
              editLockOwned=!!editLockRecord&&editLockRecord.holder_id===editSessionId;
              if(editLockOwned) editorName=editLockRecord.holder_name||editorName;
              syncEditLockUI(); startEditLockTimer();
            }catch(error){
              if(lockFeatureMissing(error)){ editLockSupported=false; editLockOwned=false; editLockRecord=null; stopEditLockTimer(); syncEditLockUI(); }
              else{ $('editLockStatus').textContent='编辑权检查失败 · 点击“开始编辑”重试'; $('editLockBanner').textContent='暂时无法连接编辑锁，请检查网络后点击“开始编辑”重试。'; $('editLockBanner').style.display='block'; startEditLockTimer(); }
            }
          }
          async function heartbeatEditLock(){
            if(!editLockOwned||!syncCode||editLockSupported!==true) return;
            try{
              const client=getCloudClient(syncCode), {data,error}=await lockRequest(client.rpc('ggz_try_edit_lock',{p_sync_code:syncCode,p_holder_id:editSessionId,p_holder_name:editorName||'未命名',p_ttl_seconds:EDIT_LOCK_TTL_SECONDS}));
              if(error) throw error;
              const row=editLockRow(data);
              if(!row?.acquired){ editLockOwned=false; editLockRecord=row; cloudConflictPaused=true; clearIdleCloudUpload(); setCloudStatus('编辑权已转移，本机修改未上传','warn'); }
              else editLockRecord=row;
              syncEditLockUI();
            }catch(error){
              if(editLockRecord&&editLockExpired(editLockRecord)){ editLockOwned=false; clearIdleCloudUpload(); setCloudStatus('编辑锁已过期，本机修改未上传','warn'); syncEditLockUI(); }
              else $('editLockStatus').textContent='编辑权续期失败，正在重试';
            }
          }
          async function confirmEditLockForUpload(code){
            if(editLockSupported!==true) return true;
            if(!editLockOwned){ setCloudStatus('本机没有编辑权，已阻止上传','warn'); syncEditLockUI(); return false; }
            try{
              const client=getCloudClient(code), {data,error}=await lockRequest(client.rpc('ggz_try_edit_lock',{p_sync_code:code,p_holder_id:editSessionId,p_holder_name:editorName||'未命名',p_ttl_seconds:EDIT_LOCK_TTL_SECONDS}));
              if(error) throw error;
              const row=editLockRow(data); editLockRecord=row;
              if(!row?.acquired){ editLockOwned=false; cloudConflictPaused=true; clearIdleCloudUpload(); setCloudStatus('编辑权已转移，已阻止旧页面上传','warn'); syncEditLockUI(); return false; }
              return true;
            }catch(error){ setCloudStatus('无法确认编辑权，已暂停上传','warn'); return false; }
          }
          async function releaseEditLock(uploadFirst=true,quiet=false){
            const code=syncCode;
            if(!editLockOwned||!code) return true;
            if(uploadFirst&&cloudDirty){ await uploadCloud(false); if(cloudDirty){ if(!quiet) alert('本机修改还没有成功上传，暂不释放编辑权。'); return false; } }
            try{
              const client=getCloudClient(code), {error}=await lockRequest(client.rpc('ggz_release_edit_lock',{p_sync_code:code,p_holder_id:editSessionId}));
              if(error) throw error;
              editLockOwned=false; editLockRecord=null; clearIdleCloudUpload(); syncEditLockUI(); startEditLockTimer();
              if(!quiet) setCloudStatus('已保存并结束编辑');
              return true;
            }catch(error){ if(!quiet) alert('结束编辑失败：'+(error.message||error)); return false; }
          }
          async function acquireEditLock(){
            const code=normalizedSyncCode(); if(!code){ alert('请先加入或新建协作组'); return; }
            const name=String($('editorNameInput').value||'').trim(); if(!name){ alert('请先填写编辑者名字'); $('editorNameInput').focus(); return; }
            editorName=name; localStorage.setItem('ggzEditorName',editorName); syncCode=code;
            $('acquireEditLockBtn').disabled=true; $('editLockStatus').textContent='正在取得编辑权…';
            try{
              const client=getCloudClient(code), {data,error}=await lockRequest(client.rpc('ggz_try_edit_lock',{p_sync_code:code,p_holder_id:editSessionId,p_holder_name:editorName,p_ttl_seconds:EDIT_LOCK_TTL_SECONDS}));
              if(error) throw error;
              const row=editLockRow(data); editLockSupported=true; editLockRecord=row;
              if(!row?.acquired){ editLockOwned=false; syncEditLockUI(); alert(`${row?.holder_name||'其他人'} 正在编辑，请等对方保存并结束后再试。`); return; }
              editLockOwned=true; cloudConflictPaused=false; syncEditLockUI(); startEditLockTimer();
              const loaded=await downloadCloud(false);
              if(loaded===false){ await releaseEditLock(false,true); alert('尚未读取最新云端数据，本次没有进入编辑状态。'); return; }
              setCloudStatus('已取得编辑权 · 可以开始修改');
            }catch(error){
              if(lockFeatureMissing(error)){ editLockSupported=false; editLockOwned=false; syncEditLockUI(); alert('编辑锁尚未安装，请先在 Supabase 执行更新后的 supabase_setup.sql。'); }
              else{ editLockOwned=false; syncEditLockUI(); alert('取得编辑权失败：'+(error.message||error)); }
            }
          }
          function collabProjectSnapshot(){
            captureActiveSheet();
            return deepClone({sheets,sheetIdSeed,itemCatalog,catalogIdSeed,sharedCartQrImg,sharedPaymentQrImg});
          }
          const cloudImageCompressionCache=new Map();
          async function compressCloudImageBlob(source,label){
            if(!window.createImageBitmap) return source;
            let bitmap=null;
            try{
              bitmap=await createImageBitmap(source);
              const isQr=String(label).includes('qr')||String(label).includes('payment'), maxEdge=isQr?1400:1600;
              const scale=Math.min(1,maxEdge/Math.max(bitmap.width,bitmap.height));
              const width=Math.max(1,Math.round(bitmap.width*scale)),height=Math.max(1,Math.round(bitmap.height*scale));
              const canvas=document.createElement('canvas'); canvas.width=width; canvas.height=height;
              const context=canvas.getContext('2d',{alpha:true}); if(!context) return source;
              context.imageSmoothingEnabled=true; context.imageSmoothingQuality='high'; context.drawImage(bitmap,0,0,width,height);
              const type=isQr?'image/png':'image/webp', quality=isQr?undefined:.82;
              const compressed=await new Promise(resolve=>canvas.toBlob(resolve,type,quality));
              if(!compressed||(scale===1&&compressed.size>=source.size)) return source;
              return compressed;
            }catch(_){ return source; }
            finally{ if(bitmap?.close) bitmap.close(); }
          }
          async function compressedCloudDataUrl(data,label){
            if(!data||!String(data).startsWith('data:image/')) return data||'';
            const key=`${label}|${data.length}|${String(data).slice(-72)}`;
            if(cloudImageCompressionCache.has(key)) return cloudImageCompressionCache.get(key);
            const source=await fetch(data).then(response=>response.blob()),compressed=await compressCloudImageBlob(source,label);
            const result=compressed===source?data:await new Promise((resolve,reject)=>{ const reader=new FileReader(); reader.onload=()=>resolve(String(reader.result||'')); reader.onerror=reject; reader.readAsDataURL(compressed); });
            cloudImageCompressionCache.set(key,result); return result;
          }
          async function collabCloudProjectSnapshot(localState){
            const cloud=deepClone(localState||collabProjectSnapshot());
            for(const sheet of cloud.sheets||[]) for(const column of sheet.columns||[]) column.img=await compressedCloudDataUrl(column.img,`c${column.id}`);
            for(const item of cloud.itemCatalog||[]) item.img=await compressedCloudDataUrl(item.img,`library${item.catalogId||item.id||0}`);
            cloud.sharedCartQrImg=await compressedCloudDataUrl(cloud.sharedCartQrImg,'shared-qr');
            cloud.sharedPaymentQrImg=await compressedCloudDataUrl(cloud.sharedPaymentQrImg,'shared-payment');
            return cloud;
          }
          function preserveMatchingLocalImages(cloudState,localState,compressedLocalState){
            const result=deepClone(cloudState),localSheets=new Map((localState?.sheets||[]).map(sheet=>[String(sheet.id),sheet])),compressedSheets=new Map((compressedLocalState?.sheets||[]).map(sheet=>[String(sheet.id),sheet]));
            for(const sheet of result.sheets||[]){
              const local=localSheets.get(String(sheet.id)),compressed=compressedSheets.get(String(sheet.id));
              const localColumns=new Map((local?.columns||[]).map(column=>[String(column.id),column])),compressedColumns=new Map((compressed?.columns||[]).map(column=>[String(column.id),column]));
              for(const column of sheet.columns||[]){
                const localColumn=localColumns.get(String(column.id)),compressedColumn=compressedColumns.get(String(column.id));
                if(String(localColumn?.img||'').startsWith('data:image/')&&column.img===compressedColumn?.img) column.img=localColumn.img;
              }
            }
            const localCatalog=new Map((localState?.itemCatalog||[]).map(item=>[String(item.catalogId||item.id),item])),compressedCatalog=new Map((compressedLocalState?.itemCatalog||[]).map(item=>[String(item.catalogId||item.id),item]));
            for(const item of result.itemCatalog||[]){ const key=String(item.catalogId||item.id),local=localCatalog.get(key),compressed=compressedCatalog.get(key); if(String(local?.img||'').startsWith('data:image/')&&item.img===compressed?.img) item.img=local.img; }
            if(String(localState?.sharedCartQrImg||'').startsWith('data:image/')&&result.sharedCartQrImg===compressedLocalState?.sharedCartQrImg) result.sharedCartQrImg=localState.sharedCartQrImg;
            if(String(localState?.sharedPaymentQrImg||'').startsWith('data:image/')&&result.sharedPaymentQrImg===compressedLocalState?.sharedPaymentQrImg) result.sharedPaymentQrImg=localState.sharedPaymentQrImg;
            return result;
          }
          function stableCollabValue(value){
            if(Array.isArray(value)) return value.map(stableCollabValue);
            if(value&&typeof value==='object') return Object.keys(value).sort().reduce((result,key)=>{ result[key]=stableCollabValue(value[key]); return result; },{});
            return value;
          }
          function collabStatesEqual(a,b){ return JSON.stringify(stableCollabValue(a))===JSON.stringify(stableCollabValue(b)); }
          function collabDiff(oldRoot,newRoot){
            const ops=[];
            const walk=(oldValue,newValue,path,oldExists,newExists)=>{
              if(!newExists){ ops.push({op:'delete',path:path.map(String),old:deepClone(oldValue)}); return; }
              if(!oldExists){ ops.push({op:'set',path:path.map(String),value:deepClone(newValue),old_missing:true}); return; }
              if(oldValue===newValue) return;
              const oldArray=Array.isArray(oldValue), newArray=Array.isArray(newValue);
              if(oldArray&&newArray){
                const common=Math.min(oldValue.length,newValue.length);
                for(let i=0;i<common;i++) walk(oldValue[i],newValue[i],[...path,String(i)],true,true);
                for(let i=oldValue.length-1;i>=newValue.length;i--) walk(oldValue[i],undefined,[...path,String(i)],true,false);
                for(let i=common;i<newValue.length;i++) walk(undefined,newValue[i],[...path,String(i)],false,true);
                return;
              }
              const oldObject=oldValue&&typeof oldValue==='object'&&!oldArray, newObject=newValue&&typeof newValue==='object'&&!newArray;
              if(oldObject&&newObject){
                const keys=new Set([...Object.keys(oldValue),...Object.keys(newValue)]);
                keys.forEach(key=>walk(oldValue[key],newValue[key],[...path,key],Object.prototype.hasOwnProperty.call(oldValue,key),Object.prototype.hasOwnProperty.call(newValue,key)));
                return;
              }
              ops.push({op:'set',path:path.map(String),value:deepClone(newValue),old:deepClone(oldValue)});
            };
            walk(oldRoot,newRoot,[],true,true);
            return ops;
          }
          function applyCollabOps(root,ops){
            (ops||[]).forEach(op=>{
              const path=Array.isArray(op.path)?op.path.map(String):[]; if(!path.length) return;
              let parent=root;
              for(let i=0;i<path.length-1;i++){
                const key=path[i], nextKey=path[i+1];
                if(parent[key]===undefined||parent[key]===null) parent[key]=/^\d+$/.test(nextKey)?[]:{};
                parent=parent[key];
              }
              const key=path[path.length-1];
              if(op.op==='delete'){
                if(Array.isArray(parent)) parent.splice(parseInt(key,10),1); else delete parent[key];
              }else if(op.op==='set') parent[key]=deepClone(op.value);
            });
            return root;
          }
          function installCollabState(state){
            if(!state||!Array.isArray(state.sheets)||!state.sheets.length) return false;
            const preferredSheet=activeSheetId, commentText=$('commentInput')?.value||'';
            const paymentScroll=$('paymentSummary')?.querySelector('.payment-table-wrap'), shareScroll=$('sharePaymentSummary')?.querySelector('.payment-table-wrap');
            const viewPosition={pageX:window.scrollX,pageY:window.scrollY,paymentLeft:paymentScroll?.scrollLeft||0,paymentTop:paymentScroll?.scrollTop||0,shareLeft:shareScroll?.scrollLeft||0,shareTop:shareScroll?.scrollTop||0};
            applyingCollab=true;
            try{
              sheets=deepClone(state.sheets); sheetIdSeed=Number(state.sheetIdSeed)||Math.max(...sheets.map(s=>(Number(s.id)||0)+1));
              itemCatalog=migrateCatalogItems(deepClone(Array.isArray(state.itemCatalog)?state.itemCatalog:[]));
              catalogIdSeed=Math.max(Number(state.catalogIdSeed)||1,...itemCatalog.map(x=>(Number(x.catalogId)||0)+1));
              sharedCartQrImg=state.sharedCartQrImg||''; sharedPaymentQrImg=state.sharedPaymentQrImg||'';
              activeSheetId=sheets.some(s=>s.id===preferredSheet)?preferredSheet:sheets[0].id;
              applySheet(sheets.find(s=>s.id===activeSheetId));
              if($('commentInput')) $('commentInput').value=commentText;
              localStorage.setItem(STORAGE_KEY,JSON.stringify({sheets,activeSheetId,sheetIdSeed,itemCatalog,catalogIdSeed,sharedCartQrImg,sharedPaymentQrImg}));
              const restoreView=()=>{
                const nextPayment=$('paymentSummary')?.querySelector('.payment-table-wrap'), nextShare=$('sharePaymentSummary')?.querySelector('.payment-table-wrap');
                if(nextPayment){ nextPayment.scrollLeft=viewPosition.paymentLeft; nextPayment.scrollTop=viewPosition.paymentTop; }
                if(nextShare){ nextShare.scrollLeft=viewPosition.shareLeft; nextShare.scrollTop=viewPosition.shareTop; }
                window.scrollTo(viewPosition.pageX,viewPosition.pageY);
              };
              restoreView(); requestAnimationFrame(()=>{ restoreView(); requestAnimationFrame(restoreView); });
              return true;
            }finally{ applyingCollab=false; }
          }
          function collabResultRow(data){ return Array.isArray(data)?(data[0]||null):(data||null); }
          function syncCompactCollabStatus(){
            const compact=$('collabCompactStatus'); if(!compact) return;
            const hasGroup=!!currentWorkspace();
            compact.textContent=collabEnabled?`● ${currentWorkspace()?.name||'协作组'} · 实时同步中`:(hasGroup?'○ 协作暂时未连接':'○ 尚未加入协作组');
            compact.style.color=collabEnabled?'var(--ok)':'var(--warn)';
            compact.style.borderColor=collabEnabled?'#b9dfc5':'#ecd3aa';
            compact.style.background=collabEnabled?'#f0faf3':'#fff9ef';
          }
          function setCollabStatus(text,tone){ const el=$('collabStatus'); el.textContent=text; el.style.color=tone==='bad'?'var(--bad)':(tone==='warn'?'var(--warn)':(tone==='ok'?'var(--ok)':'var(--muted)')); syncCompactCollabStatus(); }
          function syncCollabUI(){
            $('startCollabBtn').disabled=collabEnabled||!syncCode;
            $('stopCollabBtn').disabled=!collabEnabled;
            $('collabActivityPanel').style.display=collabEnabled?'block':'none';
            document.documentElement.classList.remove('cloud-edit-readonly');
            $('editLockBanner').style.display='none';
            syncCompactCollabStatus();
          }
          function stopCollabPolling(){ if(collabPollTimer){ clearInterval(collabPollTimer); collabPollTimer=null; } }
          function startCollabPolling(){ stopCollabPolling(); if(collabEnabled) collabPollTimer=setInterval(pollCollabState,COLLAB_POLL_MS); }
          function stopCollabPresence(){ if(collabPresenceTimer){ clearInterval(collabPresenceTimer); collabPresenceTimer=null; } }
          function collabRelativeTime(value){
            const seconds=Math.max(0,Math.round((Date.now()-new Date(value).getTime())/1000));
            if(seconds<15) return '刚刚';
            if(seconds<60) return `${seconds}秒前`;
            if(seconds<3600) return `${Math.floor(seconds/60)}分钟前`;
            return new Date(value).toLocaleString('zh-CN',{month:'numeric',day:'numeric',hour:'2-digit',minute:'2-digit'});
          }
          function describeCollabPatch(patch){
            const labels=new Set();
            (Array.isArray(patch)?patch:[]).forEach(op=>{
              const path=Array.isArray(op?.path)?op.path.map(String):[], root=path[0]||'', field=path[2]||'';
              if(root==='sheets'){
                const index=Number(path[1]), patchSheet=(op?.value&&typeof op.value==='object'?op.value:null)||(op?.old&&typeof op.old==='object'?op.old:null), stateSheet=Number.isInteger(index)?collabBaseline?.sheets?.[index]:null;
                const sheetName=String(op?.sheet_name||patchSheet?.name||stateSheet?.name||(Number.isInteger(index)?`第${index+1}张表`:'排单表'));
                let action='排单表';
                if(['paymentPaid','sharePaymentPaid'].includes(field)) action='收款状态';
                else if(['paymentRefund','sharePaymentRefund'].includes(field)) action='退款记录';
                else if(['paymentSupplement','sharePaymentSupplement'].includes(field)) action='补款记录';
                else if(['paymentEdits','sharePaymentEdits'].includes(field)) action='收款金额';
                else if(field==='allocations') action='排单人员';
                else if(field==='columns') action='谷子种类';
                else if(field==='cost') action='价格与均摊';
                else if(field.startsWith('coldPromotion')||field==='coldCarryBundleColumnIds') action='带冷提';
                else if(field==='completed'||field==='completedAt') action='完成状态';
                else if(field==='name') action='表名';
                else if(['matrixTitle','quantityTitle','paymentTitle','sharePaymentTitle','matrixColor','paymentColor','sharePaymentColor'].includes(field)) action='标题与颜色';
                labels.add(`「${sheetName}」${action}`);
              }
              else if(root==='itemCatalog') labels.add('常用谷子库');
              else if(root==='sharedCartQrImg') labels.add('群二维码');
              else if(root==='sharedPaymentQrImg') labels.add('收款码');
              else labels.add('协作数据');
            });
            return [...labels].slice(0,4).join('、')||'排单内容';
          }
          async function refreshCollabActivity(){
            if(!collabEnabled||!syncCode) return;
            try{
              const client=getCloudClient(syncCode), now=new Date().toISOString(), cutoff=new Date(Date.now()-90000).toISOString();
              const {error:touchError}=await lockRequest(client.from('ggz_collab_presence').upsert({sync_code:syncCode,session_id:editSessionId,editor_name:editorName||'未命名',last_seen:now},{onConflict:'sync_code,session_id'}),12000);
              if(touchError) throw touchError;
              const [{data:people,error:peopleError},{data:changes,error:changesError}]=await Promise.all([
                lockRequest(client.from('ggz_collab_presence').select('editor_name,last_seen').eq('sync_code',syncCode).gte('last_seen',cutoff).order('last_seen',{ascending:false}),12000),
                lockRequest(client.rpc('ggz_collab_activity',{p_group_id:syncCode,p_limit:30}),12000)
              ]);
              if(peopleError) throw peopleError;
              const unique=new Map(); (people||[]).forEach(row=>{ const name=row.editor_name||'未命名'; if(!unique.has(name)) unique.set(name,row); });
              $('collabOnlinePeople').textContent=unique.size?[...unique.keys()].map(name=>name===editorName?`${name}（我）`:name).join('、'):'暂无活跃人员';
              if(!changesError){
                $('collabRecentChanges').innerHTML=(changes||[]).length?(changes||[]).map(row=>`<div class="collab-recent-item"><span><b>${escapeHtml(row.author_name||'未命名')}</b> 修改了${escapeHtml(row.is_detailed?describeCollabPatch(row.patch):'排单内容')} · 版本 ${Number(row.revision)||0}</span><time>${escapeHtml(collabRelativeTime(row.created_at))}</time></div>`).join(''):'暂无修改记录';
              }
            }catch(error){
              $('collabOnlinePeople').textContent='名单尚未启用，请执行更新后的 SQL';
            }
          }
          function startCollabPresence(){ stopCollabPresence(); if(!collabEnabled) return; refreshCollabActivity(); collabPresenceTimer=setInterval(refreshCollabActivity,15000); }
          async function leaveCollabPresence(){
            stopCollabPresence();
            if(!syncCode) return;
            try{ const client=getCloudClient(syncCode); await lockRequest(client.from('ggz_collab_presence').delete().eq('sync_code',syncCode).eq('session_id',editSessionId),5000); }catch(_){}
          }
          function scheduleCollabSync(){
            if(!collabEnabled||applyingCollab) return;
            collabNeedsSend=true; clearTimeout(collabSendTimer);
            collabSendTimer=setTimeout(flushCollabChanges,350);
            setCollabStatus('本机有新修改 · 正在同步…','warn');
          }
          async function flushCollabChanges(){
            clearTimeout(collabSendTimer); collabSendTimer=null;
            if(!collabEnabled||applyingCollab) return true;
            if(collabSending){ collabNeedsSend=true; return false; }
            const localSentState=collabProjectSnapshot(),sentState=await collabCloudProjectSnapshot(localSentState),ops=collabDiff(collabBaseline||sentState,sentState);
            ops.forEach(op=>{
              const path=Array.isArray(op?.path)?op.path:[];
              if(String(path[0]||'')==='sheets'){
                const index=Number(path[1]);
                op.sheet_name=String(sentState?.sheets?.[index]?.name||collabBaseline?.sheets?.[index]?.name||'');
              }
            });
            if(!ops.length){ collabNeedsSend=false; setCollabStatus(`实时协作已同步 · 版本 ${collabRevision}`,'ok'); return true; }
            collabSending=true; collabNeedsSend=false;
            try{
              const client=getCloudClient(syncCode), {data,error}=await lockRequest(client.rpc('ggz_apply_collab_patch',{p_sync_code:syncCode,p_patch:ops,p_author_name:editorName||'未命名'}),20000);
              if(error) throw error;
              const row=collabResultRow(data); if(!row?.out_state) throw new Error('协作云端没有返回状态');
              const localAfterState=collabProjectSnapshot(),afterState=await collabCloudProjectSnapshot(localAfterState),laterOps=collabDiff(sentState,afterState),serverState=deepClone(row.out_state),displayCloudState=applyCollabOps(deepClone(serverState),laterOps),displayState=preserveMatchingLocalImages(displayCloudState,localAfterState,afterState);
              collabBaseline=serverState; collabRevision=Number(row.out_revision)||collabRevision; installCollabState(displayState);
              const conflicts=Array.isArray(row.out_conflicts)?row.out_conflicts:[];
              if(conflicts.length){
                const conflictPaths=new Set(conflicts.map(item=>JSON.stringify(item.path||[]))), rejectedOps=ops.filter(op=>conflictPaths.has(JSON.stringify(op.path||[])));
                try{ localStorage.setItem(COLLAB_CONFLICT_KEY_PREFIX+syncCode,JSON.stringify({time:new Date().toISOString(),author:editorName,ops:rejectedOps,conflicts})); }catch(_){}
                setCollabStatus(`有 ${conflicts.length} 处刚被别人修改，已阻止互相覆盖`,'warn');
                alert(`有 ${conflicts.length} 处内容和别人同时修改。系统没有覆盖对方的数据，请核对最新表格后重新操作。`);
              }
              else setCollabStatus(`实时协作已同步 · 版本 ${collabRevision}`,'ok');
              refreshCollabActivity();
              if(laterOps.length){ collabNeedsSend=true; scheduleCollabSync(); }
              return conflicts.length===0;
            }catch(error){ collabNeedsSend=true; setCollabStatus('同步失败，正在保留本机修改并重试','bad'); return false; }
            finally{ collabSending=false; if(collabNeedsSend&&!collabSendTimer) collabSendTimer=setTimeout(flushCollabChanges,1800); }
          }
          async function pollCollabState(){
            if(!collabEnabled||collabPolling||collabSending) return;
            if(collabNeedsSend||collabSendTimer){ await flushCollabChanges(); return; }
            collabPolling=true;
            try{
              const client=getCloudClient(syncCode), {data,error}=await lockRequest(client.from('ggz_collab_projects').select('revision,updated_by').eq('sync_code',syncCode).maybeSingle());
              if(error) throw error;
              if(data&&Number(data.revision)>collabRevision){
                const {data:latest,error:latestError}=await lockRequest(client.from('ggz_collab_projects').select('state,revision,updated_by').eq('sync_code',syncCode).maybeSingle());
                if(latestError) throw latestError;
                if(latest?.state){ const localState=collabProjectSnapshot(),compressedLocalState=await collabCloudProjectSnapshot(localState),displayState=preserveMatchingLocalImages(latest.state,localState,compressedLocalState); collabBaseline=deepClone(latest.state); collabRevision=Number(latest.revision)||collabRevision; installCollabState(displayState); setCollabStatus(`${latest.updated_by||'其他人'}刚刚更新 · 版本 ${collabRevision}`,'ok'); }
              }
            }catch(error){ setCollabStatus('实时协作连接暂时中断，正在重试','bad'); }
            finally{ collabPolling=false; }
          }
          async function startCollab(autoStart=false){
            const code=normalizedSyncCode(); if(!code){ if(!autoStart) alert('请先加入或新建协作组'); return false; }
            const name=String($('editorNameInput').value||'').trim(); if(!name){ if(!autoStart){ alert('请先填写编辑者名字'); $('editorNameInput').focus(); } return false; }
            syncCode=code; editorName=name; localStorage.setItem('ggzEditorName',editorName); $('startCollabBtn').disabled=true; setCollabStatus('正在连接实时协作…','warn');
            try{
              const localInitialState=collabProjectSnapshot(),initialState=await collabCloudProjectSnapshot(localInitialState),client=getCloudClient(code),{data,error}=await lockRequest(client.rpc('ggz_open_collab',{p_sync_code:code,p_initial_state:initialState,p_author_name:editorName}),20000);
              if(error) throw error;
              const row=collabResultRow(data); if(!row?.out_state) throw new Error('协作状态为空');
              if(!autoStart&&!collabStatesEqual(row.out_state,initialState)){
                const accepted=await appConfirm('协作云端已经有其他人的版本。开启后会先以协作云端为准，确定继续吗？','发现协作版本','继续开启');
                if(!accepted){ syncCollabUI(); return false; }
              }
              const displayState=preserveMatchingLocalImages(row.out_state,localInitialState,initialState);
              collabEnabled=true; collabRevision=Number(row.out_revision)||0; collabBaseline=deepClone(row.out_state); installCollabState(displayState);
              localStorage.setItem(COLLAB_ENABLED_KEY_PREFIX+code,'1'); clearIdleCloudUpload(); startCollabPolling(); syncCollabUI(); startCollabPresence(); setCollabStatus(`实时协作已连接 · 版本 ${collabRevision}`,'ok'); setCloudStatus('完整云端备份可手动上传'); return true;
            }catch(error){
              collabEnabled=false; syncCollabUI();
              if(lockFeatureMissing(error)) alert('实时协作 SQL 尚未安装，请在 Supabase 执行最新的完整 supabase_setup.sql。');
              else if(!autoStart) alert('开启实时协作失败：'+(error.message||error));
              setCollabStatus('实时协作尚未连接','bad'); return false;
            }
          }
          async function stopCollab(){
            if(!collabEnabled) return;
            await flushCollabChanges(); if(collabNeedsSend){ alert('还有本机修改没有同步成功，暂时不能关闭实时协作。'); return; }
            await leaveCollabPresence(); collabEnabled=false; stopCollabPolling(); clearTimeout(collabSendTimer); collabSendTimer=null; localStorage.setItem(COLLAB_ENABLED_KEY_PREFIX+syncCode,'0'); syncCollabUI(); setCollabStatus('实时协作已关闭');
          }
          function clearIdleCloudUpload(){ if(cloudIdleTimer){ clearTimeout(cloudIdleTimer); cloudIdleTimer=null; } }
          function attemptIdleCloudUpload(){
            cloudIdleTimer=null;
            if(!cloudDirty||!syncCode||!cloudIdleEnabled||cloudConflictPaused) return;
            if(cloudBusy){ cloudIdleTimer=setTimeout(attemptIdleCloudUpload,30000); return; }
            uploadCloud(true);
          }
          function scheduleIdleCloudUpload(){
            clearIdleCloudUpload();
            if(!syncCode||!cloudIdleEnabled||applyingCloud) return;
            if(cloudConflictPaused){ pauseForCloudConflict(); return; }
            setCloudStatus('云端未同步 · 5分钟无操作后自动上传','warn');
            cloudIdleTimer=setTimeout(attemptIdleCloudUpload,CLOUD_IDLE_UPLOAD_MS);
          }
          // ============================================================
          // 云端上传、读取与实时协作
          // ============================================================
          async function uploadCloud(silent){
            const code=normalizedSyncCode(); if(!code){ setCloudStatus('请先加入或新建协作组',true); return; } if(cloudBusy) return;
            if(code!==syncCode){ setCloudStatus('协作组已切换，请稍后重试','warn'); return; }
            if(!(await confirmEditLockForUpload(code))) return;
            const automatic=silent===true;
            clearIdleCloudUpload();
            cloudBusy=true; setCloudStatus('正在同步云端…');
            try{
              const client=getCloudClient(code);
              const knownVersion=lastCloudUpdatedAt||localStorage.getItem(CLOUD_VERSION_KEY_PREFIX+code)||'';
              async function fetchRemoteVersion(){
                const {data,error}=await client.from('ggz_sync_data').select('updated_at').eq('sync_code',code).maybeSingle();
                if(error) throw error;
                return data?.updated_at||'';
              }
              const remoteBefore=await fetchRemoteVersion();
              if(cloudVersionIsNewer(remoteBefore,knownVersion)){
                if(automatic){ pauseForCloudConflict(); return; }
                if(!confirm('云端有较新版本。继续上传会用本机数据覆盖云端，确定仍要上传吗？')){ pauseForCloudConflict(); return; }
                cloudConflictPaused=false;
              }
              captureActiveSheet();
              const uploadRevision=localRevision;
              const cloudSheets=JSON.parse(JSON.stringify(sheets));
              const cloudCatalog=JSON.parse(JSON.stringify(itemCatalog));
              async function uploadImage(data,label){
                if(!data||!String(data).startsWith('data:image/')) return data||'';
                const sourceBlob=await fetch(data).then(r=>r.blob()),blob=await compressCloudImageBlob(sourceBlob,label);
                const hashBuf=await crypto.subtle.digest('SHA-256',await blob.arrayBuffer());
                const hash=[...new Uint8Array(hashBuf)].map(b=>b.toString(16).padStart(2,'0')).join('').slice(0,24);
                const ext=blob.type==='image/png'?'png':(blob.type==='image/webp'?'webp':'jpg');
                const path=`${code}/${hash}-${label}.${ext}`;
                const {error}=await client.storage.from('zzzschedule').upload(path,blob,{contentType:blob.type||'image/jpeg',upsert:true,cacheControl:'31536000'});
                if(error) throw error;
                return client.storage.from('zzzschedule').getPublicUrl(path).data.publicUrl;
              }
              for(const sheet of cloudSheets){
                for(const c of sheet.columns||[]) c.img=await uploadImage(c.img,`c${c.id}`);
                delete sheet.cartQrImg; delete sheet.paymentQrImg; delete sheet.alipayQrImg; delete sheet.wechatQrImg;
              }
              const cloudCartQrImg=await uploadImage(sharedCartQrImg,'shared-qr');
              const cloudPaymentQrImg=await uploadImage(sharedPaymentQrImg,'shared-payment');
              for(const item of cloudCatalog) item.img=await uploadImage(item.img,`library${item.catalogId||item.id||0}`);
              const remoteNow=await fetchRemoteVersion();
              const changedDuringUpload=remoteNow&&remoteNow!==remoteBefore&&cloudVersionIsNewer(remoteNow,knownVersion);
              if(changedDuringUpload){
                if(automatic){ pauseForCloudConflict(); return; }
                if(!confirm('上传准备期间云端又有新更新。继续会覆盖它，确定仍要上传吗？')){ pauseForCloudConflict(); return; }
                cloudConflictPaused=false;
              }
              const now=new Date().toISOString();
              const payload={sheets:cloudSheets,activeSheetId,sheetIdSeed,itemCatalog:cloudCatalog,catalogIdSeed,sharedCartQrImg:cloudCartQrImg,sharedPaymentQrImg:cloudPaymentQrImg,version:Date.now()};
              let writeSucceeded=false;
              if(remoteNow){
                const {data,error}=await client.from('ggz_sync_data').update({payload,updated_at:now}).eq('sync_code',code).eq('updated_at',remoteNow).select('updated_at').maybeSingle();
                if(error) throw error;
                writeSucceeded=!!data;
              }else{
                const {error}=await client.from('ggz_sync_data').insert({sync_code:code,payload,updated_at:now});
                if(!error) writeSucceeded=true;
                else if(error.code!=='23505') throw error;
              }
              if(!writeSucceeded){
                if(automatic){ pauseForCloudConflict(); return; }
                if(!confirm('云端在最后一刻又有新更新。继续会覆盖它，确定仍要上传吗？')){ pauseForCloudConflict(); return; }
                const {error}=await client.from('ggz_sync_data').upsert({sync_code:code,payload,updated_at:now},{onConflict:'sync_code'});
                if(error) throw error;
              }
              syncCode=code; rememberCloudVersion(code,now); cloudConflictPaused=false; localStorage.setItem('ggzSyncCode',code);
              if(localRevision===uploadRevision){ cloudDirty=false; rememberCloudDirty(code,false); setCloudStatus('云端已同步 '+new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})); if(automatic&&editLockOwned) setTimeout(()=>releaseEditLock(false,true),0); }
              else{ cloudDirty=true; rememberCloudDirty(code,true); setCloudStatus('本机有新修改 · 云端未同步','warn'); }
            }catch(err){
              cloudDirty=true; rememberCloudDirty(code,true);
              if(automatic) setCloudStatus('自动上传失败，稍后会再尝试','warn');
              else setCloudStatus('同步失败：'+(err.message||err),true);
            }
            finally{ cloudBusy=false; }
          }
          async function downloadCloud(silent){
            const code=normalizedSyncCode(); if(!code){ setCloudStatus('请先加入或新建协作组',true); return false; } if(cloudBusy) return false;
            if(cloudDirty&&!confirm('本机有尚未上传的内容。读取云端会覆盖本机当前数据，确定继续吗？')) return false;
            clearIdleCloudUpload();
            cloudBusy=true; if(!silent) setCloudStatus('正在读取…');
            try{
              const client=getCloudClient(code);
              const {data,error}=await client.from('ggz_sync_data').select('payload,updated_at').eq('sync_code',code).maybeSingle();
              if(error) throw error;
              if(!data){ if(!silent) setCloudStatus('云端还没有数据'); return true; }
              if(silent&&lastCloudUpdatedAt&&new Date(data.updated_at)<=new Date(lastCloudUpdatedAt)) return true;
              const d=data.payload||{}; if(!Array.isArray(d.sheets)||!d.sheets.length) throw new Error('云端数据为空');
              applyingCloud=true; sheets=d.sheets;
              sharedCartQrImg=d.sharedCartQrImg||sheets.find(s=>s.cartQrImg)?.cartQrImg||'';
              sharedPaymentQrImg=d.sharedPaymentQrImg||sheets.find(s=>s.paymentQrImg||s.alipayQrImg||s.wechatQrImg)?.paymentQrImg||sheets.find(s=>s.alipayQrImg)?.alipayQrImg||sheets.find(s=>s.wechatQrImg)?.wechatQrImg||'';
              sheets.forEach(s=>{ delete s.cartQrImg; delete s.paymentQrImg; delete s.alipayQrImg; delete s.wechatQrImg; });
              itemCatalog=migrateCatalogItems(d.itemCatalog); catalogIdSeed=Math.max(d.catalogIdSeed||1,...itemCatalog.map(x=>(x.catalogId||0)+1)); activeSheetId=d.activeSheetId; sheetIdSeed=d.sheetIdSeed||Math.max(...sheets.map(s=>(s.id||0)+1));
              if(!sheets.some(s=>s.id===activeSheetId)) activeSheetId=sheets[0].id;
              applySheet(sheets.find(s=>s.id===activeSheetId));
              rememberCloudVersion(code,data.updated_at); syncCode=code; cloudDirty=false; rememberCloudDirty(code,false); cloudConflictPaused=false; localStorage.setItem('ggzSyncCode',code);
              saveState(); setCloudStatus('云端已读取 '+new Date().toLocaleTimeString('zh-CN',{hour:'2-digit',minute:'2-digit'})); return true;
            }catch(err){ setCloudStatus('读取失败：'+(err.message||err),true); return false; }
            finally{ applyingCloud=false; cloudBusy=false; }
          }
          function setupCollapsiblePanels(){
            const key='ggzCollapsedPanels_v2', defaults=['costPanel','columnPanel','ocrPanel','quantityPanel','cartPanel'];
            let collapsed=defaults;
            try{ const saved=localStorage.getItem(key); collapsed=saved===null?defaults:JSON.parse(saved); if(!Array.isArray(collapsed)) collapsed=defaults; }catch(_){ collapsed=defaults; }
            document.querySelectorAll('.wrap .panel').forEach((panel,index)=>{
              const h2=panel.querySelector(':scope > h2'); if(!h2) return;
              const id=panel.id||('panel-'+index);
              const btn=document.createElement('button');
              btn.type='button'; btn.className='panel-toggle';
              const sync=()=>{ const closed=panel.classList.contains('collapsed'); btn.textContent=closed?'展开':'收起'; btn.setAttribute('aria-expanded',String(!closed)); };
              if(collapsed.includes(id)) panel.classList.add('collapsed');
              sync();
              btn.addEventListener('click',e=>{
                e.stopPropagation(); panel.classList.toggle('collapsed'); sync();
                const ids=[...document.querySelectorAll('.wrap .panel')].map((p,i)=>p.classList.contains('collapsed')?(p.id||('panel-'+i)):null).filter(Boolean);
                try{ localStorage.setItem(key,JSON.stringify(ids)); }catch(_){}
              });
              h2.appendChild(btn);
            });
          }
      
          // ---------- cost & average ----------
          function readCost(){
            const type=$('priceType').value;
            const enteredCount=parseInt($('count').value,10), count=Number.isFinite(enteredCount)&&enteredCount>0?enteredCount:Math.max(1,columns.length||1);
            const raw=Math.max(0,num($('jpyPrice').value));
            const rate=Math.max(0,num($('exchangeRate').value));
            const jpyTotal=type==='single'?raw*count:raw;
            const rmbGoods=jpyTotal*rate;
            totalCost=rmbGoods;
            $('jpyTotal').textContent='¥'+jpyTotal.toFixed(0)+' 日元';
            $('rmbGoods').textContent=money(rmbGoods);
            $('targetTotal').textContent=money(totalCost);
            const sharedText=String($('sharedFee').value||'').trim();
            $('sharedFeeText').textContent=sharedText?money(Math.max(0,num(sharedText))):'未填写';
          }
          function computeAverage(){
            const manual=Math.max(1,parseInt($('count').value,10)||1);
            const N=columns.length>0?columns.length:manual;
            let fixedCount=0, inAverageCount=0, sourcePriceCount=0;
            adjSum=0;
            columns.forEach(c=>{
              if(c.mode==='fixed'){ fixedCount++; inAverageCount++; }
              else if(c.mode==='single'){ fixedCount++; sourcePriceCount++; }
              else if(c.mode==='adjust'){ adjSum+=num(c.priceAdj); }
            });
            const denom=N-fixedCount;
            // 入均仍按自己的价格收款；这里只从均分数量中排除，不从总成本扣除入均价格。
            const hasAutoCost=Math.max(0,num($('jpyPrice').value))>0&&Math.max(0,num($('exchangeRate').value))>0;
            const type=$('priceType').value, raw=Math.max(0,num($('jpyPrice').value)), rate=Math.max(0,num($('exchangeRate').value));
            const calculatedAverage=type==='single'?raw*rate:(denom>0?totalCost/denom:0);
            avgPrice=hasAutoCost?calculatedAverage:Math.max(0,num($('manualAveragePrice').value));
            $('avgPriceText').textContent=money(avgPrice);
            const separateLabels=[];
            if(inAverageCount) separateLabels.push(`入均${inAverageCount}项`);
            if(sourcePriceCount) separateLabels.push(`原价${sourcePriceCount}项`);
            $('effCount').textContent=denom+' 项'+(separateLabels.length?`（${separateLabels.join('、')}另算）`:'');
            $('adjSumText').textContent=(adjSum>0?'+':'')+money(adjSum);
            const w=$('avgWarn');
            let msg='';
            const separateName=inAverageCount&&sourcePriceCount?'入均及原价':(sourcePriceCount?'原价':'入均');
            if(denom<=0) msg=`${separateName}项占满了所有列，没有可摊均的谷子，无法计算均价。`;
            else if(Math.abs(adjSum)>0.005) msg=`调价合计为 ${(adjSum>0?'+':'')+money(adjSum)}，不为0 —— 收回的钱与成本相差 ${(adjSum>0?'+':'')+money(adjSum)}（正=多收，负=少收）。`;
            if(msg){ w.style.display='block'; w.textContent=msg; } else { w.style.display='none'; }
          }
          function unitPrice(c){
            if(c.mode==='fixed') return num(c.fixedPrice);
            if(c.mode==='adjust') return avgPrice+num(c.priceAdj);
            if(c.mode==='single') return Math.max(0,num(c.sourceJpyPrice))*Math.max(0,num($('exchangeRate').value));
            if(c.mode==='avg'&&c.avgOverride!==null&&c.avgOverride!==''&&Number.isFinite(Number(c.avgOverride))) return Math.max(0,Number(c.avgOverride));
            return avgPrice;
          }
          // ---------- column list ----------
          function addColumn(name,aliases,mode,priceAdj,fixedPrice){
            columns.push({id:colIdSeed++,name:(name||'新角色').trim(),aliases:aliases||[],mode:mode||'avg',priceAdj:priceAdj||0,fixedPrice:fixedPrice||0,avgOverride:null,sourceJpyPrice:0,promotionPoints:1,img:null});
          }
          function findColumnByText(text){
            const t=text.trim().toLowerCase();
            return columns.find(c=>c.name.trim().toLowerCase()===t || c.aliases.some(a=>a.trim().toLowerCase()===t));
          }
          function modeValueHtml(c){
            if(c.mode==='adjust') return `<label>调价 <input class="modeval" data-col="${c.id}" data-price-field="priceAdj" type="text" inputmode="decimal" value="${c.priceAdj}"></label>`;
            if(c.mode==='fixed') return `<label>入均 <input class="modeval" data-col="${c.id}" data-price-field="fixedPrice" type="text" inputmode="decimal" value="${c.fixedPrice}"></label>`;
            if(c.mode==='single') return `<label>日元 <input class="modeval" data-col="${c.id}" data-price-field="sourceJpyPrice" type="text" inputmode="decimal" value="${c.sourceJpyPrice||''}"></label>`;
            return `<label>均价 <input class="modeval" data-col="${c.id}" data-price-field="avgOverride" type="text" inputmode="decimal" value="${c.avgOverride==null?'':c.avgOverride}" placeholder="自动"></label>`;
          }
          function renderColumnList(){
            const el=$('columnList');
            if(columns.length===0){ el.innerHTML='<div class="hint">还没有列，粘贴评论解析后会自动生成，也可以先手动添加。</div>'; return; }
            el.innerHTML=columns.map((c,i)=>`
              <div class="col-card">
                <span class="col-index">#${i+1}</span>
                <div class="col-media"><label class="img-label" title="点击上传/更换图片">
                  ${c.img?`<img class="col-thumb" src="${c.img}">`:`<span class="col-thumb-empty">加图片</span>`}
                  <input type="file" accept="image/*" style="display:none;" onchange="ggz.onColumnImage(${c.id},this)">
                </label><button class="btn-ghost btn-mini" style="${c.img?'':'visibility:hidden'}" onclick="ggz.clearColumnImage(${c.id})">删</button></div>
                <input type="text" value="${escapeAttr(c.name)}" onchange="ggz.updateColumn(${c.id},'name',this.value)" placeholder="列名">
                <input type="text" class="alias-input" value="${escapeAttr(c.aliases.join('，'))}" onchange="ggz.updateColumn(${c.id},'aliases',this.value)" placeholder="别名（逗号分隔）">
                <select onchange="ggz.updateColumn(${c.id},'mode',this.value)">
                  <option value="avg" ${c.mode==='avg'?'selected':''}>均价</option>
                  <option value="adjust" ${c.mode==='adjust'?'selected':''}>调价</option>
                  <option value="fixed" ${c.mode==='fixed'?'selected':''}>入均</option>
                  <option value="single" ${c.mode==='single'?'selected':''}>原价换算</option>
                </select>
                <div class="mode-slot">${modeValueHtml(c)}</div>
                <label class="promotion-point-slot">提配点 <input type="text" inputmode="decimal" data-promotion-point data-col="${c.id}" value="${fmtPoint(c.promotionPoints)}"></label>
                <div class="col-actions"><button class="btn-ghost btn-mini" onclick="ggz.moveColumn(${c.id},-1)">↑</button>
                <button class="btn-ghost btn-mini" onclick="ggz.moveColumn(${c.id},1)">↓</button>
                <button class="btn-danger btn-mini" onclick="ggz.removeColumn(${c.id})">删除</button></div>
              </div>`).join('');
          }
          function catalogPriceText(c){
            let price='跟随均价';
            if(c.mode==='single') price=`${fmtNum(c.sourceJpyPrice)} 日元 → ${money(Math.max(0,num(c.sourceJpyPrice))*Math.max(0,num($('exchangeRate').value)))}`;
            else if(c.mode==='fixed') price=`入均 ${money(c.fixedPrice)}`;
            else if(c.mode==='adjust') price=`调价 ${(num(c.priceAdj)>=0?'+':'')+fmtNum(c.priceAdj)}`;
            else if(c.avgOverride!==null&&c.avgOverride!=='') price=`独立均价 ${money(c.avgOverride)}`;
            return `${price} · 提配${fmtPoint(c.promotionPoints)}点`;
          }
          function catalogLastUsedText(value){
            if(!value) return '尚未使用';
            const time=new Date(value), diff=Date.now()-time.getTime();
            if(!Number.isFinite(time.getTime())) return '尚未使用';
            if(diff<60000) return '刚刚使用';
            if(diff<3600000) return `${Math.max(1,Math.floor(diff/60000))}分钟前`;
            if(diff<86400000) return `${Math.max(1,Math.floor(diff/3600000))}小时前`;
            if(diff<604800000) return `${Math.max(1,Math.floor(diff/86400000))}天前`;
            return `${time.getFullYear()}-${String(time.getMonth()+1).padStart(2,'0')}-${String(time.getDate()).padStart(2,'0')}`;
          }
          function markCatalogUsed(item){
            item.catalogUsage=Math.max(0,parseInt(item.catalogUsage,10)||0)+1;
            item.catalogLastUsedAt=new Date().toISOString();
          }
          function renderCatalog(){
            const catalogListEl=$('catalogList');
            const previousCatalogScroll=catalogListEl?catalogListEl.scrollTop:0;
            const q=($('catalogSearch').value||'').trim().toLowerCase();
            const groups=[...new Set(itemCatalog.map(item=>String(item.catalogGroup||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'zh-CN'));
            if(catalogGroup!=='all'&&catalogGroup!=='__ungrouped__'&&!groups.includes(catalogGroup)) catalogGroup='all';
            $('catalogGroupFilter').innerHTML='<option value="all">全部分组</option><option value="__ungrouped__">未分组</option>'+groups.map(group=>`<option value="${escapeHtml(group)}">${escapeHtml(group)}</option>`).join('');
            $('catalogGroupFilter').value=catalogGroup;
            document.querySelectorAll('[data-catalog-filter]').forEach(button=>button.classList.toggle('active',button.dataset.catalogFilter===catalogFilter));
            $('catalogSort').value=catalogSort;
            const existingIds=new Set(itemCatalog.map(item=>item.catalogId));
            catalogSelectedIds.forEach(id=>{ if(!existingIds.has(id)) catalogSelectedIds.delete(id); });
            let list=itemCatalog.filter(item=>{
              const matchesSearch=!q||String(item.name||'').toLowerCase().includes(q)||(item.aliases||[]).some(a=>String(a).toLowerCase().includes(q))||String(item.catalogGroup||'').toLowerCase().includes(q);
              const matchesFilter=catalogFilter==='all'||(catalogFilter==='pinned'&&item.catalogPinned)||(catalogFilter==='recent'&&item.catalogLastUsedAt);
              const matchesGroup=catalogGroup==='all'||(catalogGroup==='__ungrouped__'&&!String(item.catalogGroup||'').trim())||item.catalogGroup===catalogGroup;
              return matchesSearch&&matchesFilter&&matchesGroup;
            });
            const byName=(a,b)=>String(a.name||'').localeCompare(String(b.name||''),'zh-CN');
            const recentDifference=(a,b)=>(Date.parse(b.catalogLastUsedAt)||0)-(Date.parse(a.catalogLastUsedAt)||0);
            const byRecent=(a,b)=>recentDifference(a,b)||byName(a,b);
            if(catalogSort==='recent') list.sort(byRecent);
            else if(catalogSort==='usage') list.sort((a,b)=>(b.catalogUsage||0)-(a.catalogUsage||0)||byRecent(a,b));
            else if(catalogSort==='group') list.sort((a,b)=>{
              const groupA=String(a.catalogGroup||''),groupB=String(b.catalogGroup||'');
              if(!groupA&&groupB) return 1;
              if(groupA&&!groupB) return -1;
              return groupA.localeCompare(groupB,'zh-CN')||byName(a,b);
            });
            else if(catalogSort==='name') list.sort(byName);
            else list.sort((a,b)=>Number(b.catalogPinned)-Number(a.catalogPinned)||recentDifference(a,b)||(b.catalogUsage||0)-(a.catalogUsage||0)||byName(a,b));
            if(catalogFilter==='recent') list=list.slice(0,20);
            catalogVisibleIds=list.map(item=>item.catalogId);
            const allVisibleSelected=catalogVisibleIds.length>0&&catalogVisibleIds.every(id=>catalogSelectedIds.has(id));
            $('catalogSelectAllBtn').textContent=allVisibleSelected?'取消全选':'全选当前';
            $('catalogSelectAllBtn').disabled=catalogVisibleIds.length===0;
            $('catalogSelectionCount').textContent=`已选 ${catalogSelectedIds.size} 项`;
            $('catalogBatchAddBtn').disabled=catalogSelectedIds.size===0;
            catalogListEl.innerHTML=list.length?list.map(item=>`<div class="catalog-item" data-catalog-id="${item.catalogId}">
              <input class="catalog-select" type="checkbox" data-catalog-select aria-label="选择 ${escapeHtml(item.name)}" ${catalogSelectedIds.has(item.catalogId)?'checked':''}>
              <button type="button" class="catalog-pin${item.catalogPinned?' active':''}" title="${item.catalogPinned?'取消置顶':'置顶'}" aria-label="${item.catalogPinned?'取消置顶':'置顶'}">★</button>
              ${item.img?`<img src="${item.img}" alt="">`:'<span class="catalog-img-empty">无图</span>'}
              <span class="catalog-main"><strong>${escapeHtml(item.name)}</strong><small class="catalog-group-label">${escapeHtml(item.catalogGroup||'未分组')}</small></span>
              <select class="catalog-group-edit" aria-label="${escapeHtml(item.name)}的分组">
                <option value="" ${item.catalogGroup?'':'selected'}>未分组</option>
                ${groups.map(group=>`<option value="${escapeHtml(group)}" ${item.catalogGroup===group?'selected':''}>${escapeHtml(group)}</option>`).join('')}
                <option value="__new__">＋ 新建分组…</option>
              </select>
              <span class="catalog-price">${escapeHtml(catalogPriceText(item))}</span>
              <span class="catalog-usage">使用 ${item.catalogUsage||0} 次<br>${escapeHtml(catalogLastUsedText(item.catalogLastUsedAt))}</span>
              <button class="btn-primary btn-mini catalog-add" data-mobile-label="+">加入本表</button>
              <button class="btn-danger btn-mini catalog-delete" data-mobile-label="×">删除</button>
            </div>`).join(''):'<div class="catalog-list-empty">没有符合条件的常用谷子</div>';
            if(previousCatalogScroll>0) requestAnimationFrame(()=>{
              catalogListEl.scrollTop=Math.min(previousCatalogScroll,Math.max(0,catalogListEl.scrollHeight-catalogListEl.clientHeight));
            });
          }
          function saveColumnsToCatalog(){
            columns.forEach(c=>{
              const found=itemCatalog.find(x=>x.name.trim().toLowerCase()===c.name.trim().toLowerCase());
              const data={name:c.name,aliases:[...(c.aliases||[])],mode:c.mode,priceAdj:c.priceAdj||0,fixedPrice:c.fixedPrice||0,avgOverride:c.avgOverride??null,sourceJpyPrice:c.sourceJpyPrice||0,promotionPoints:Number.isFinite(Number(c.promotionPoints))?Math.max(0,Number(c.promotionPoints)):1,img:c.img||null};
              if(found) Object.assign(found,data); else itemCatalog.push({catalogId:catalogIdSeed++,catalogPinned:false,catalogGroup:'',catalogUsage:0,catalogLastUsedAt:'',...data});
            });
            saveState(); renderCatalog();
          }
          function addCatalogItemToSheet(item){
            if(findColumnByText(item.name)) return false;
            const c={id:colIdSeed++,name:item.name,aliases:[...(item.aliases||[])],mode:item.mode||'avg',priceAdj:item.priceAdj||0,fixedPrice:item.fixedPrice||0,avgOverride:item.avgOverride??null,sourceJpyPrice:item.sourceJpyPrice||0,promotionPoints:Number.isFinite(Number(item.promotionPoints))?Math.max(0,Number(item.promotionPoints)):1,img:item.img||null};
            columns.push(c); allocations[c.id]=[]; return true;
          }
      
          function compressImage(file,maxSide,quality){
            return new Promise((resolve,reject)=>{
              const reader=new FileReader();
              reader.onload=()=>{
                const img=new Image();
                img.onload=()=>{
                  let{width,height}=img;
                  const scale=Math.min(1,maxSide/Math.max(width,height));
                  width=Math.round(width*scale); height=Math.round(height*scale);
                  const canvas=document.createElement('canvas');
                  canvas.width=width; canvas.height=height;
                  const ctx=canvas.getContext('2d');
                  ctx.fillStyle='#ffffff'; ctx.fillRect(0,0,width,height);
                  ctx.drawImage(img,0,0,width,height);
                  resolve(canvas.toDataURL('image/jpeg',quality));
                };
                img.onerror=reject; img.src=reader.result;
              };
              reader.onerror=reject; reader.readAsDataURL(file);
            });
          }
          function compressQrPng(file,maxSide){
            return new Promise((resolve,reject)=>{
              const reader=new FileReader();
              reader.onload=()=>{
                const img=new Image();
                img.onload=()=>{
                  const scale=Math.min(1,maxSide/Math.max(img.width,img.height));
                  const canvas=document.createElement('canvas'); canvas.width=Math.round(img.width*scale); canvas.height=Math.round(img.height*scale);
                  const ctx=canvas.getContext('2d'); ctx.imageSmoothingEnabled=scale===1; ctx.fillStyle='#fff'; ctx.fillRect(0,0,canvas.width,canvas.height); ctx.drawImage(img,0,0,canvas.width,canvas.height);
                  resolve(canvas.toDataURL('image/png'));
                };
                img.onerror=reject; img.src=reader.result;
              };
              reader.onerror=reject; reader.readAsDataURL(file);
            });
          }
      
          function recalc(){ readCost(); computeAverage(); renderMatrix(); saveState(); }
      
          // ---------- window-exposed handlers ----------
          const ggz={};
          ggz.onColumnImage=(id,input)=>{
            const file=input.files[0]; if(!file) return;
            compressImage(file,120,0.75).then(dataUrl=>{
              const c=columns.find(x=>x.id===id); if(!c) return;
              c.img=dataUrl; saveState(); renderColumnList(); renderMatrix();
            }).catch(()=>alert('图片处理失败，请换一张试试'));
          };
          ggz.clearColumnImage=id=>{ const c=columns.find(x=>x.id===id); if(!c) return; c.img=null; saveState(); renderColumnList(); renderMatrix(); };
          ggz.updateColumn=(id,field,value)=>{
            const c=columns.find(x=>x.id===id); if(!c) return;
            if(field==='aliases') c.aliases=value.split(/[，,]/).map(s=>s.trim()).filter(Boolean);
            else if(field==='priceAdj') c.priceAdj=parseFloat(value)||0;
            else if(field==='fixedPrice'){ const n=parseFloat(value); if(Number.isFinite(n)) c.fixedPrice=Math.max(0,n); }
            else if(field==='avgOverride') c.avgOverride=value===''?null:Math.max(0,parseFloat(value)||0);
            else if(field==='sourceJpyPrice') c.sourceJpyPrice=Math.max(0,parseFloat(value)||0);
            else if(field==='promotionPoints'){ const n=parseFloat(value); if(Number.isFinite(n)) c.promotionPoints=Math.max(0,n); }
            else if(field==='mode'){
              if(value==='fixed'&&c.mode!=='fixed'&&!(Number(c.fixedPrice)>0)) c.fixedPrice=Math.max(0,unitPrice(c));
              c.mode=value;
              if(value==='fixed') coldCarryBundleColumnIds=coldCarryBundleColumnIds.filter(colId=>colId!==c.id);
            }
            else c[field]=value;
            saveState();
            if(field==='mode'){ renderColumnList(); renderColdBundleConfiguration(); }
            recalc();
          };
          ggz.moveColumn=(id,dir)=>{
            const i=columns.findIndex(c=>c.id===id), j=i+dir;
            if(i<0||j<0||j>=columns.length) return;
            [columns[i],columns[j]]=[columns[j],columns[i]];
            saveState(); renderColumnList(); renderMatrix();
          };
          ggz.removeColumn=id=>{
            if(!confirm('确定删除这一列吗？该列已生成的配比数据也会一并清除。')) return;
            columns=columns.filter(c=>c.id!==id); delete allocations[id];
            coldCarryBundleColumnIds=coldCarryBundleColumnIds.filter(colId=>colId!==id);
            saveState(); renderColdBundleConfiguration(); renderColumnList(); recalc();
          };
          ggz.updatePreview=(id,field,value)=>{ const r=previewRows.find(x=>x.id===id); if(r){ r[field]=value; refreshOrderMatrixPreview(); } };
          ggz.removePreviewRow=id=>{ previewRows=previewRows.filter(r=>r.id!==id); renderPreview(); refreshOrderMatrixPreview(); };
          window.ggz=ggz;
      
          // ---------- comment parsing ----------
          const CN_NUM={'一':1,'二':2,'两':2,'三':3,'四':4,'五':5,'六':6,'七':7,'八':8,'九':9,'十':10};
          function cnToNum(s){
            if(/^\d+$/.test(s)) return parseInt(s,10);
            if(s==='十') return 10;
            if(/^十[一二三四五六七八九]$/.test(s)) return 10+CN_NUM[s[1]];
            if(/^[一二三四五六七八九]十$/.test(s)) return CN_NUM[s[0]]*10;
            if(/^[一二三四五六七八九]十[一二三四五六七八九]$/.test(s)) return CN_NUM[s[0]]*10+CN_NUM[s[2]];
            if(CN_NUM[s]!==undefined) return CN_NUM[s];
            return null;
          }
          function collapseCjkSpaces(line){
            if(/\d{1,2}[-\/]\d{1,2}\s+\d{1,2}:\d{2}/.test(line)) return line;
            let prev;
            do{ prev=line; line=line.replace(/([\u4e00-\u9fa5。])\s+([\u4e00-\u9fa5。])/g,'$1$2'); }while(line!==prev);
            line=line.replace(/([\u4e00-\u9fa5A-Za-z。])\s+([xX×*]?\d)/g,'$1$2');
            line=line.replace(/(\d)\s+([\u4e00-\u9fa5A-Za-z。])/g,'$1，$2');
            line=line.replace(/(\d)\s+(\d)/g,'$1，$2');
            return line.trim();
          }
          function extractPairs(seg){
            seg=(seg||'').replace(/^[和出要收求\s，,、]+/,'').trim();
            if(!seg) return [];
            const pairs=[];
            const isDigit=ch=>ch>='0'&&ch<='9';
            const isLatin=ch=>/[A-Za-z]/.test(ch||'');
            const isSep=ch=>'，,、；; '.includes(ch);
            const pushPair=(nm,q)=>pairs.push({name:nm.replace(/[，,、\s]+$/,'').trim(),qty:q});
            let i=0,name='';
            while(i<seg.length){
              const ch=seg[i];
              if(isSep(ch)){ i++; continue; }
              const isMultChar=(ch==='×'||ch==='*'||ch==='x'||ch==='X');
              if(isMultChar){
                const next=seg[i+1];
                if((ch==='x'||ch==='X')&&isLatin(name.slice(-1))){ name+=ch; i++; continue; }
                if(next&&isDigit(next)&&name!==''){
                  let j=i+1; const ds=j; while(j<seg.length&&isDigit(seg[j])) j++;
                  pushPair(name,parseInt(seg.slice(ds,j),10)); name=''; i=j; continue;
                }
                name+=ch; i++; continue;
              }
              if(isDigit(ch)){
                if(name===''){ let j=i; while(j<seg.length&&isDigit(seg[j])) j++; name+=seg.slice(i,j); i=j; continue; }
                let j=i; while(j<seg.length&&isDigit(seg[j])) j++;
                pushPair(name,parseInt(seg.slice(i,j),10)); name=''; i=j; continue;
              }
              name+=ch; i++;
            }
            if(name.trim()){
              const cm=name.match(/^(.*?)(各)?([一二三四五六七八九十]+)$/);
              if(cm&&cm[1].trim()&&cnToNum(cm[3])) pairs.push({name:cm[1].replace(/[各\s]+$/,'').trim(),qty:cnToNum(cm[3])});
              else pairs.push({name:name.trim(),qty:1});
            }
            return pairs;
          }
          function parseDemandText(text){
            // “代小莫 诺克斯1”里的“代小莫”是备注，不应并入谷子名称。
            text=String(text||'').replace(/(^|[，,、；;\s])代[^\s，,、；;]+(?=\s+)/g,'$1');
            text=collapseCjkSpaces((text||'').trim());
            const segments=text.split(/[，,、；;]+|\s+/).map(s=>s.trim()).filter(Boolean);
            const results=[];
            segments.forEach(seg=>{ extractPairs(seg).forEach(p=>results.push(p)); });
            return results;
          }
          function cleanPersonName(name){ return (name||'').split(/[（(【\[]/)[0].trim(); }
          // 所有模式共用：日期、时间、“回复”、IP 等只分段，不参与人物/谷子识别。
          const COMMENT_META_RE=/(?:今天|昨天|前天)(?:\s*\d{1,2}\s*[:：]\s*\d{0,2})?|(?:\d{4}\s*[年.\-\/]\s*)?\d{1,2}\s*(?:月|[.\-\/])\s*\d{1,2}\s*(?:日)?(?:[\s,，]+\d{1,2}\s*[:：]\s*\d{0,2})?|(?:\d+|[一二两三四五六七八九十]+)\s*(?:秒|分钟|小时|天|周|个月|月|年)前|刚刚|\d{1,2}\s*[:：]\s*\d{1,2}(?=\s*(?:回复|$))|回复(?:\s*\d+)?|IP(?:属地)?\s*[:：]?\s*[\u4e00-\u9fa5A-Za-z]+/i;
          function isCommentUiNoise(line){
            const text=String(line||'').trim();
            return /^(?:评论|评论\s*回复(?:\s*[（(]\s*\d+\s*[）)])?|展开\s*\d*\s*条?回复|收起回复|赞|点赞)$/.test(text)
              || /相册\s*(?:[（(]\s*\d+\s*\/\s*\d+\s*[）)])?\s*$/.test(text);
          }
          function splitCommentMeta(rawLine){
            const line=String(rawLine||'').trim();
            if(!line||isCommentUiNoise(line)) return {content:'',boundary:false,ignored:true};
            const meta=line.match(COMMENT_META_RE);
            if(!meta) return {content:line,boundary:false,ignored:false};
            return {content:line.slice(0,meta.index).replace(/[·・•‧∙．。|,，、；;\s]+$/,'').trim(),boundary:true,ignored:false};
          }
          function actionContentLines(raw){
            const result=[];
            String(raw||'').replace(/\r/g,'').split('\n').forEach(rawLine=>{
              const part=splitCommentMeta(rawLine); if(part.content) result.push(part.content);
            });
            return result;
          }
          function splitComments(raw){
            const blocks=[];
            const pending=[];
            function pushPending(){
              const lines=pending.splice(0).map(l=>l.trim()).filter(Boolean);
              if(lines.length===0) return;
              if(lines.length===1){
                const one=lines[0];
                const m=one.match(/^(.{1,12}?)([\u4e00-\u9fa5A-Za-z。]+\d.*)$/);
                if(m&&/\d/.test(m[2])) blocks.push({person:cleanPersonName(m[1]),demandText:m[2].trim()});
                else blocks.push({person:'',demandText:one});
              } else {
                blocks.push({person:cleanPersonName(lines[0]),demandText:lines.slice(1).join(' ').trim()});
              }
            }
            function looksLikeNextPerson(line){
              const text=String(line||'').trim();
              if(pending.length<2||!pending.slice(1).some(value=>/\d/.test(value))) return false;
              if(!text||/\d/.test(text)||/[，,、；;]/.test(text)) return false;
              if(/(?:带|撤单?|取消|不要|转给|出给|->|→|➡)/.test(text)) return false;
              return text.length<=60;
            }
            raw.replace(/\r/g,'').split('\n').forEach(rawLine=>{
              if(!String(rawLine||'').trim()){
                pushPending();
                return;
              }
              const part=splitCommentMeta(rawLine);
              if(part.ignored) return;
              if(part.boundary){
                if(part.content) pending.push(part.content);
                pushPending();
                return;
              }
              if(part.content){
                if(looksLikeNextPerson(part.content)) pushPending();
                pending.push(part.content);
              }
            });
            pushPending();
            return blocks.filter(b=>b.demandText);
          }
          function renderPreview(){
            const tbody=$('previewTableBody');
            tbody.innerHTML=previewRows.map((r,i)=>`
              <tr>
                <td>${i+1}</td>
                <td><input type="text" value="${escapeAttr(r.person)}" onchange="ggz.updatePreview(${r.id},'person',this.value)" style="width:110px;"></td>
                <td><input type="text" value="${escapeAttr(r.itemsText)}" onchange="ggz.updatePreview(${r.id},'itemsText',this.value)" style="width:100%;"></td>
                <td><button class="btn-danger btn-mini" onclick="ggz.removePreviewRow(${r.id})">删除</button></td>
              </tr>`).join('');
          }
          function buildOrderMatrixPreview(){
            const previewColumns=deepClone(columns), previewAllocations=deepClone(allocations);
            const addedCells=[];
            let previewColId=colIdSeed;
            const findPreviewColumn=text=>{
              const target=String(text||'').trim().toLowerCase();
              return previewColumns.find(c=>String(c.name||'').trim().toLowerCase()===target||(c.aliases||[]).some(alias=>String(alias||'').trim().toLowerCase()===target));
            };
            previewRows.forEach(row=>{
              parseDemandText(row.itemsText).forEach(item=>{
                let col=findPreviewColumn(item.name);
                if(!col){
                  col={id:previewColId++,name:String(item.name||'新角色').trim(),aliases:[],mode:'avg',priceAdj:0,fixedPrice:0,avgOverride:null,sourceJpyPrice:0,promotionPoints:1,img:null};
                  previewColumns.push(col); previewAllocations[col.id]=[];
                }
                const arr=previewAllocations[col.id]||(previewAllocations[col.id]=[]);
                for(let index=0;index<Math.max(1,parseInt(item.qty,10)||1);index++){
                  addedCells.push({col:col.id,row:arr.length}); arr.push(String(row.person||'').trim());
                }
              });
            });
            return {columns:previewColumns,allocations:previewAllocations,highlights:{addedCells}};
          }
          function refreshOrderMatrixPreview(label='排单追加模拟结果'){
            if(!previewRows.length){ clearMatrixPreview(); return; }
            const preview=buildOrderMatrixPreview();
            showMatrixPreview(preview.allocations,label,preview.highlights,preview.columns);
          }
      
          // ---------- matrix ----------
          function quantitySettingsReady(){ return Number.isFinite(boxSize)&&boxSize>0&&Number.isFinite(groupSize)&&groupSize>0; }
          function showMatrixPreview(previewAllocations,label,highlights,previewColumns){
            matrixPreviewAllocations=previewAllocations?deepClone(previewAllocations):null;
            matrixPreviewColumns=matrixPreviewAllocations&&Array.isArray(previewColumns)?deepClone(previewColumns):null;
            matrixPreviewLabel=matrixPreviewAllocations?(label||'排单模拟预览'):'';
            matrixPreviewHighlights=matrixPreviewAllocations?deepClone(highlights||{}):{};
            renderMatrix();
          }
          function clearMatrixPreview(shouldRender=true){
            const hadPreview=!!matrixPreviewAllocations; matrixPreviewAllocations=null; matrixPreviewColumns=null; matrixPreviewLabel=''; matrixPreviewHighlights={completeRows:[],pendingRows:[],addedCells:[],transferCells:[],cancelRows:[]};
            if(hadPreview&&shouldRender) renderMatrix();
          }
          function matrixBoughtKey(col,row){ return `${Number(col)}:${Number(row)}`; }
          function isMatrixCellBought(col,row,name){
            const current=String(name||'').trim();
            return !!current&&String(matrixBoughtCells[matrixBoughtKey(col,row)]||'')===current;
          }
          function pruneMatrixBoughtCells(){
            Object.keys(matrixBoughtCells).forEach(key=>{
              const match=/^(\d+):(\d+)$/.exec(key);
              if(!match){ delete matrixBoughtCells[key]; return; }
              const col=Number(match[1]),row=Number(match[2]),current=String((allocations[col]||[])[row]||'').trim();
              if(!current||String(matrixBoughtCells[key]||'')!==current) delete matrixBoughtCells[key];
            });
          }
          function matrixRowBoughtState(row,displayColumns=columns,displayAllocations=allocations){
            const named=displayColumns.map(c=>({col:c.id,name:String((displayAllocations[c.id]||[])[row]||'').trim()})).filter(item=>item.name);
            const bought=named.filter(item=>isMatrixCellBought(item.col,row,item.name)).length;
            return {named:named.length,bought,state:named.length&&bought===named.length?'true':(bought?'mixed':'false')};
          }
          // ============================================================
          // 排单表、买齐标记与带冷提颜色
          // ============================================================
          function renderMatrix(){
            const thead=document.querySelector('#matrixTable thead');
            const tbody=$('matrixTableBody');
            const emptyEl=$('matrixEmpty');
            const isPreview=!!matrixPreviewAllocations, displayAllocations=matrixPreviewAllocations||allocations, displayColumns=isPreview&&matrixPreviewColumns?matrixPreviewColumns:columns, notice=$('matrixPreviewNotice'), table=$('matrixTable');
            const activeColdHighlights=isPreview?matrixPreviewHighlights:(showColdPromotionColor?coldPromotionHighlights:{});
            const completePreviewRows=new Set((activeColdHighlights.completeRows||[]).map(Number)), pendingPreviewRows=new Map((activeColdHighlights.pendingRows||[]).map(item=>[Number(item.row),String(item.person||'')]));
            const addedPreviewCells=new Set((matrixPreviewHighlights.addedCells||[]).map(item=>`${item.col}:${Number(item.row)}`));
            const transferPreviewCells=new Map((matrixPreviewHighlights.transferCells||[]).map(item=>[`${item.col}:${Number(item.row)}`,item]));
            const cancelPreviewRows=new Set((matrixPreviewHighlights.cancelRows||[]).map(Number));
            if(!isPreview) pruneMatrixBoughtCells();
            notice.style.display=isPreview?'block':'none'; notice.textContent=isPreview?`正在预览：${matrixPreviewLabel}（尚未写入正式排单）`:''; table.classList.toggle('is-preview',isPreview); table.classList.toggle('buy-mark-mode',matrixBuyMarkMode&&!isPreview);
            if(displayColumns.length===0){
              thead.innerHTML=''; tbody.innerHTML=''; emptyEl.style.display='block';
              $('matrixProjectTitle').style.display='none';
              $('paymentSummary').innerHTML=''; renderSharePaymentSummary(); renderQuantitySummary(); renderCart(); return;
            }
            $('matrixProjectTitle').style.display='block';
            emptyEl.style.display='none';
            const maxRows=Math.max(0,...displayColumns.map(c=>(displayAllocations[c.id]||[]).length));
            const displayRows=maxRows+1;
            const previewReadonly=isPreview?' readonly tabindex="-1"':'';
            let headHtml='<tr class="header-row"><th></th>'+displayColumns.map(c=>`<th>${c.img?`<img class="head-img" crossorigin="anonymous" src="${escapeAttr(c.img)}">`:''}${escapeHtml(c.name)}</th>`).join('')+'</tr>';
            if(showPricingRow) headHtml+='<tr class="adj-row"><td>调价</td>'+displayColumns.map(c=>{
              if(c.mode==='avg') return `<td><input class="matrix-price-input" data-price-kind="pricing" data-price-mode="avg" data-col="${c.id}" value="均价"${previewReadonly}></td>`;
              if(c.mode==='fixed') return `<td class="adj-fix"><div class="matrix-price-editor"><input class="matrix-price-input" inputmode="decimal" data-price-kind="pricing" data-price-mode="fixed" data-col="${c.id}" value="${fmtNum(c.fixedPrice)}"${previewReadonly}><span class="matrix-price-suffix">/1</span></div></td>`;
              if(c.mode==='single') return `<td class="adj-fix"><div class="matrix-price-editor"><span class="matrix-price-suffix">原价</span><input class="matrix-price-input" inputmode="decimal" data-price-kind="pricing" data-price-mode="single" data-col="${c.id}" value="${fmtNum(c.sourceJpyPrice)}"${previewReadonly}><span class="matrix-price-suffix">日元</span></div></td>`;
              const adj=num(c.priceAdj);
              const cls=adj>0?'adj-pos':(adj<0?'adj-neg':'');
              const sign=adj>0?'+':'';
              return `<td class="${cls}"><input class="matrix-price-input" inputmode="decimal" data-price-kind="pricing" data-price-mode="adjust" data-col="${c.id}" value="${sign}${fmtNum(adj)}"${previewReadonly}></td>`;
            }).join('')+'</tr>';
            if(showUnitPriceRow) headHtml+='<tr class="price-row"><td>单价</td>'+displayColumns.map(c=>`<td><input class="matrix-price-input" data-price-kind="unit" data-col="${c.id}" value="${unitPrice(c).toFixed(2)}"${previewReadonly}></td>`).join('')+'</tr>';
            if(showPromotionPointRow) headHtml+='<tr class="promotion-point-row"><td>提配点数</td>'+displayColumns.map(c=>`<td><input class="matrix-price-input" inputmode="decimal" data-price-kind="promotion-point" data-col="${c.id}" value="${fmtPoint(c.promotionPoints)}"${previewReadonly}></td>`).join('')+'</tr>';
            thead.innerHTML=headHtml;
            let bodyHtml='';
            for(let r=0;r<displayRows;r++){
              const rowFilled=r<maxRows&&displayColumns.length>0&&displayColumns.every(c=>String((displayAllocations[c.id]||[])[r]||'').trim());
              const step=quantitySettingsReady()?groupSize:1, countValue=(r+1)*step, previousValue=r*step;
              const boxNumber=quantitySettingsReady()?Math.floor(countValue/boxSize):0, crossedBox=quantitySettingsReady()&&boxNumber>Math.floor(previousValue/boxSize);
              const markBox=crossedBox&&Number.isFinite(completeMultiple)&&completeMultiple>0&&boxNumber%completeMultiple===0;
              const rowClasses=[rowFilled&&showCompleteRowColor?'complete-row':'',markBox?'box-boundary-row':'',completePreviewRows.has(r)?'promotion-bundle-complete':'',isPreview&&cancelPreviewRows.has(r)?'preview-cancel-row':''].filter(Boolean).join(' ');
              const boughtRowState=!isPreview?matrixRowBoughtState(r,displayColumns,displayAllocations):{named:0,bought:0,state:'false'};
              const rowBuyClass=boughtRowState.state==='true'?' buy-row-full':(boughtRowState.state==='mixed'?' buy-row-partial':'');
              const rowBuyAttrs=!isPreview&&boughtRowState.named?` data-buy-row="${r}" title="${boughtRowState.state==='true'?'取消这一行的买齐标记':'标记这一行全部买齐'}"${matrixBuyMarkMode?' tabindex="0"':''}`:'';
              bodyHtml+=`<tr class="${rowClasses}"${markBox?` title="第 ${boxNumber} 盒节点"`:''}><td class="seq-col${boughtRowState.named?' buy-row-target':''}${rowBuyClass}"${rowBuyAttrs}>${countValue}</td>`+displayColumns.map(c=>{
                const arr=displayAllocations[c.id]||[];
                const nm=arr[r];
                const bought=!isPreview&&isMatrixCellBought(c.id,r,nm);
                const pendingName=nm&&pendingPreviewRows.get(r)===String(nm)&&!completePreviewRows.has(r);
                const key=`${c.id}:${r}`, isAdded=isPreview&&addedPreviewCells.has(key), transferChange=isPreview?transferPreviewCells.get(key):null;
                const personContent=transferChange?`<span class="preview-transfer-name">${escapeHtml(transferChange.from)}</span><span class="preview-transfer-arrow">→</span><span class="preview-transfer-name">${escapeHtml(transferChange.to)}</span>`:(nm?escapeHtml(nm):'');
                return `<td class="cell${nm?' has-name':''}${bought?' bought-cell':''}${pendingName?' promotion-bundle-pending':''}${isAdded?' preview-order-added':''}${transferChange?' preview-transfer-change':''}" data-col="${c.id}" data-row="${r}" data-person="${nm?escapeAttr(nm):''}" data-bought="${bought?'true':'false'}" contenteditable="${isPreview||matrixBuyMarkMode?'false':'true'}"${matrixBuyMarkMode&&nm?' tabindex="0"':''} spellcheck="false" draggable="${!isPreview&&!matrixBuyMarkMode&&nm?'true':'false'}">${personContent}</td>`;
              }).join('')+'</tr>';
            }
            tbody.innerHTML=bodyHtml||'<tr><td colspan="'+(displayColumns.length+1)+'" style="color:var(--muted);">暂无数据</td></tr>';
            applyPersonHighlight(false);
            renderPaymentSummary();
            renderSharePaymentSummary();
            renderQuantitySummary();
            renderCart();
          }
      
          function applyPersonHighlight(shouldScroll){
            let first=null;
            document.querySelectorAll('#matrixTableBody td.cell').forEach(cell=>{
              const active=!!highlightedPerson&&cell.dataset.person===highlightedPerson;
              cell.classList.toggle('person-highlight',active); if(active&&!first) first=cell;
            });
            if(shouldScroll&&first) first.scrollIntoView({behavior:'smooth',block:'center',inline:'center'});
          }
      
          // ============================================================
          // 数量统计
          // ============================================================
          function renderQuantitySummary(){
            const el=$('quantitySummary');
            if(!columns.length){ el.innerHTML='<div class="hint">有排单数据后会自动统计。</div>'; return; }
            if(!quantitySettingsReady()){ el.innerHTML='<div class="hint quantity-not-set">填写“每盒数量”和“每行计数”后，才会启用上车统计。</div>'; return; }
            const aggregateRange=(arr,start,end)=>{
              const people=new Map();
              for(let row=start;row<Math.min(end,arr.length);row++){
                const name=String(arr[row]||'').trim(); if(!name) continue;
                if(!people.has(name)) people.set(name,[]); people.get(name).push((row+1)*groupSize);
              }
              return [...people.entries()].map(([name,positions])=>({name,positions}));
            };
            let rideRows='';
            columns.forEach(c=>{
              const arr=allocations[c.id]||[], filled=arr.filter(value=>String(value||'').trim()).length, total=filled*groupSize, fullCars=Math.floor(total/boxSize), groups=[];
              for(let car=1;car<=fullCars;car++){
                const start=Math.ceil((car-1)*boxSize/groupSize), end=Math.ceil(car*boxSize/groupSize), people=aggregateRange(arr,start,end);
                if(people.length) groups.push({kind:'onboard',label:`第 ${car} 车`,sub:'已上车',people});
              }
              const waitStart=Math.ceil(fullCars*boxSize/groupSize), waiting=aggregateRange(arr,waitStart,arr.length);
              if(waiting.length){
                const nextTarget=(fullCars+1)*boxSize, short=Math.max(0,nextTarget-total);
                groups.push({kind:'waiting',label:'继续等',sub:`距第 ${fullCars+1} 车差 ${short}`,people:waiting});
              }
              const rowSpan=groups.reduce((sum,group)=>sum+group.people.length,0);
              if(!rowSpan){ rideRows+=`<tr class="ride-waiting"><td class="ride-item">${escapeHtml(c.name)}<small>总量 0</small><small>已成 0 车</small><small class="ride-missing">差 ${boxSize} 配满盒</small></td><td>继续等</td><td class="hint">还没人</td><td>0 配</td><td>0</td><td>—</td></tr>`; return; }
              let itemWritten=false;
              groups.forEach(group=>group.people.forEach((person,index)=>{
                rideRows+=`<tr class="ride-${group.kind}">${!itemWritten?`<td rowspan="${rowSpan}" class="ride-item">${escapeHtml(c.name)}<small>总量 ${total}</small><small>已成 ${fullCars} 车</small>${total%boxSize===0 ? `<small class="ride-full">已满盒</small>`:`<small class="ride-missing">差 ${boxSize-(total%boxSize)} 配满盒</small>`}</td>`:''}${index===0?`<td rowspan="${group.people.length}" class="ride-status"><strong>${group.label}</strong><small>${group.sub}</small></td>`:''}<td><button type="button" class="quantity-cn-link${highlightedPerson===person.name?' active':''}" data-highlight-person="${escapeAttr(person.name)}">${escapeHtml(person.name)}</button></td><td><strong>${person.positions.length} 配</strong></td><td>${person.positions.length*groupSize}</td><td>${person.positions.join('、')}</td></tr>`;
                itemWritten=true;
              }));
            });
            const color=/^#[0-9a-f]{6}$/i.test(matrixColor)?matrixColor:'#d1466a';
            el.innerHTML=`<div class="matrix-project-title" style="background:${color}">${escapeHtml(quantityTitle||'未命名项目')}</div><div class="quantity-table-wrap"><table class="quantity-table quantity-ride-table"><thead><tr><th>谷子</th><th>状态</th><th>CN</th><th>吃几配</th><th>数量</th><th>位置</th></tr></thead><tbody>${rideRows}</tbody></table></div>`;
          }
      
          function refundAmountValue(refundMap,key,fullAmount){ const stored=refundMap[key]; return stored===true?Math.max(0,num(fullAmount)):Math.max(0,num(stored)); }
          function paidAmountValue(paidMap,key,fullAmount){
            const stored=paidMap[key], total=Math.max(0,num(fullAmount));
            if(stored===true) return total;
            return Math.max(0,num(stored));
          }
          function paidState(paidMap,key,fullAmount){
            const total=Math.max(0,num(fullAmount)), received=paidAmountValue(paidMap,key,total);
            if(total>0&&received>=total-0.005) return 'full';
            if(received>0) return 'partial';
            return 'unpaid';
          }
          function paymentReceivedNote(received,total){
            const safeTotal=Math.max(0,num(total)), safeReceived=Math.max(0,num(received));
            if(!(safeReceived>0&&safeReceived<safeTotal-0.005)) return '';
            return `<span class="payment-received-note" data-html2canvas-ignore="true">已收 ${money(safeReceived)}，待收 ${money(safeTotal-safeReceived)}</span>`;
          }
          function paymentAdjustmentNote(refund,supplement){
            if(!(refund>0||supplement>0)) return '';
            const parts=[];
            if(refund>0) parts.push(`<span class="payment-adjustment-refund">-${money(refund)}</span>`);
            if(supplement>0) parts.push(`<span class="payment-adjustment-supplement">+${money(supplement)}</span>`);
            return `<span class="payment-adjustment-note" data-html2canvas-ignore="true">（${parts.join(' ')}）</span>`;
          }
          function paymentBoughtItemNote(data,itemName=''){
            if(!showBoughtSettlement||!itemName) return '';
            const planned=Math.max(0,num(data.items.get(itemName))), bought=Math.max(0,num(data.boughtItems.get(itemName)));
            const missing=Math.max(0,planned-bought);
            return `<span class="payment-bought-inline ${missing>0?'is-missing':'is-complete'}" data-html2canvas-ignore="true">买到 ${bought}/${planned} · ${missing>0?`差${missing}`:'已齐'}</span>`;
          }
          function paymentMergedItemsDisplay(data,items,fallback){
            if(!showBoughtSettlement) return escapeHtml(fallback);
            return items.map(([item,count])=>`<span class="payment-item-line">${escapeHtml(item)}×${count}${paymentBoughtItemNote(data,item)}</span>`).join('');
          }
          function paymentBoughtMoneyNote(data,receivedAmount){
            if(!showBoughtSettlement) return '';
            const actual=Math.max(0,num(data.boughtTotal)), received=Math.max(0,num(receivedAmount)), refund=Math.max(0,received-actual), due=Math.max(0,actual-received);
            if(refund>0.005) return `<span class="payment-bought-money refund" data-html2canvas-ignore="true">实际 ${money(actual)} · 预计应退 ${money(refund)}</span>`;
            if(due>0.005) return `<span class="payment-bought-money due" data-html2canvas-ignore="true">实际 ${money(actual)} · 还需收 ${money(due)}</span>`;
            return `<span class="payment-bought-money even" data-html2canvas-ignore="true">实际 ${money(actual)} · 金额刚好</span>`;
          }
          function paymentProgressText(records,paidMap,refundMap,supplementMap,amountGetter){
            let paidPeople=0,partialPeople=0,unpaidPeople=0,paidAmount=0,partialAmount=0,partialDue=0,unpaidAmount=0;
            records.forEach(record=>{
              const amount=Math.max(0,num(amountGetter(record))), received=paidAmountValue(paidMap,record.key,amount), state=paidState(paidMap,record.key,amount);
              if(state==='full'){ paidPeople++; paidAmount+=Math.min(received,amount); }
              else if(state==='partial'){ partialPeople++; partialAmount+=received; partialDue+=Math.max(0,amount-received); }
              else{ unpaidPeople++; unpaidAmount+=amount; }
            });
            const partialText=partialPeople?`；部分已收：${partialPeople}人 / ${money(partialAmount)}（待收 ${money(partialDue)}）`:'';
            return `已收齐：${paidPeople}人 / ${money(paidAmount)}${partialText}；未收：${unpaidPeople}人 / ${money(unpaidAmount)}`;
          }
          function buildGoodsSettlementRecords(){
            const people=new Map(), startIndex=Math.max(0,paymentStartRow-1), endIndex=paymentEndRow===null?Infinity:Math.max(startIndex+1,paymentEndRow);
            columns.forEach(c=>(allocations[c.id]||[]).forEach((person,index)=>{
              if(index<startIndex||index>=endIndex) return;
              const name=String(person||'').trim(); if(!name) return;
              const key=name.replace(/\s+/g,'').toLowerCase();
              if(!people.has(key)) people.set(key,{key,name,planned:0,bought:0,items:new Map(),boughtItems:new Map()});
              const data=people.get(key),price=unitPrice(c); data.planned+=price; data.items.set(c.name,(data.items.get(c.name)||0)+1);
              if(isMatrixCellBought(c.id,index,name)){ data.bought+=price; data.boughtItems.set(c.name,(data.boughtItems.get(c.name)||0)+1); }
            }));
            return [...people.values()].map(data=>{
              const expected=Math.max(0,num(Object.prototype.hasOwnProperty.call(paymentEdits,'alipay:'+data.name)?paymentEdits['alipay:'+data.name]:data.planned));
              const received=paidAmountValue(paymentPaid,data.key,expected),actual=showBoughtSettlement?Math.max(0,num(data.bought)):expected;
              return {...data,expected,received,actual,refund:Math.max(0,received-actual),due:Math.max(0,actual-received)};
            });
          }
          function buildShareSettlementRecords(){
            const sharedTotal=Math.max(0,num($('sharedFee').value)), people=new Map(), startIndex=Math.max(0,paymentStartRow-1), endIndex=paymentEndRow===null?Infinity:Math.max(startIndex+1,paymentEndRow);
            let totalQty=0,fixedDeduction=0;
            columns.forEach(c=>(allocations[c.id]||[]).forEach((person,index)=>{
              if(index<startIndex||index>=endIndex) return; const name=String(person||'').trim(); if(!name) return;
              const key=name.replace(/\s+/g,'').toLowerCase(); if(!people.has(key)) people.set(key,{key,name,qty:0}); people.get(key).qty++; totalQty++;
              if(shareDeductFixed&&c.mode==='fixed') fixedDeduction+=Math.max(0,num(c.fixedPrice));
            }));
            const perItem=totalQty?Math.max(0,sharedTotal-fixedDeduction)/totalQty:0;
            return [...people.values()].map(data=>{ const expected=Math.max(0,num(Object.prototype.hasOwnProperty.call(sharePaymentEdits,'alipay:'+data.name)?sharePaymentEdits['alipay:'+data.name]:data.qty*perItem)),received=paidAmountValue(sharePaymentPaid,data.key,expected); return {...data,expected,received,refund:refundAmountValue(sharePaymentRefund,data.key,expected),supplement:refundAmountValue(sharePaymentSupplement,data.key,expected)}; });
          }
          function combinedSettlementRecords(){
            const goods=buildGoodsSettlementRecords(), shares=buildShareSettlementRecords(), shareMap=new Map(shares.map(x=>[x.key,x])), goodsMap=new Map(goods.map(x=>[x.key,x])), keys=new Set([...goodsMap.keys(),...shareMap.keys()]);
            return [...keys].map(key=>{
              const g=goodsMap.get(key)||{key,name:shareMap.get(key)?.name||key,expected:0,received:0,actual:0};
              const sh=shareMap.get(key)||{key,name:g.name,expected:0,received:0};
              const net=(g.actual-g.received)+(sh.expected-sh.received), autoRefund=Math.max(0,-net), autoDue=Math.max(0,net);
              const manualRefund=Math.max(0,num(paymentRefund[key]||sharePaymentRefund[key]||0));
              const manualDue=Math.max(0,num(paymentSupplement[key]||sharePaymentSupplement[key]||0));
              const manual=manualRefund>0.005||manualDue>0.005;
              const refund=manual?manualRefund:autoRefund, due=manual?manualDue:autoDue;
              return {key,name:g.name||sh.name||key,g,sh,net,refund,due,autoRefund,autoDue,manual};
            });
          }
          function settlementListText(type){
            const isRefund=type==='refund', label=isRefund?'待退款':'待补款', rows=[]; let total=0;
            combinedSettlementRecords().forEach(r=>{
              const amount=isRefund?r.refund:r.due, done=isRefund?paymentRefundDone[r.key]:paymentSupplementDone[r.key];
              if(amount<=0.005||done) return;
              total+=amount; rows.push(`${r.name} ${money(amount)}`);
            });
            return rows.length?`【${label}】\n${rows.join('\n')}\n\n共${rows.length}人，合计 ${money(total)}`:`【${label}】\n暂无`;
          }
          function copySettlementList(type,button){ navigator.clipboard.writeText(settlementListText(type)).then(()=>{ const old=button.textContent; button.textContent='已复制'; setTimeout(()=>button.textContent=old,1200); }); }
          function renderSettlementDashboard(){
            const root=$('settlementDashboard'); if(!root) return;
            settlementDashboardOpen=showBoughtSettlement;
            root.hidden=!showBoughtSettlement;
            if(!showBoughtSettlement) return;
            const records=combinedSettlementRecords();
            let pendingRefund=0,pendingDue=0,pendingRefundPeople=0,pendingDuePeople=0,completedPeople=0;
            const prepared=records.map(r=>{
              let type='complete',done=true,action='';
              if(r.refund>0.005){
                type='refund'; done=paymentRefundDone[r.key]===true;
                if(done){ completedPeople++; action=`<button type="button" class="settlement-status-btn settlement-status-refund-done" data-settlement-status="refund" data-settlement-key="${encodeURIComponent(r.key)}">✓ 已退款</button>`; }
                else{ pendingRefund+=r.refund; pendingRefundPeople++; action=`<button type="button" class="settlement-status-btn settlement-status-refund" data-settlement-status="refund" data-settlement-key="${encodeURIComponent(r.key)}">待退款</button>`; }
                delete paymentSupplementDone[r.key];
              }else if(r.due>0.005){
                type='supplement'; done=paymentSupplementDone[r.key]===true;
                if(done){ completedPeople++; action=`<button type="button" class="settlement-status-btn settlement-status-supplement-done" data-settlement-status="supplement" data-settlement-key="${encodeURIComponent(r.key)}">✓ 已补款</button>`; }
                else{ pendingDue+=r.due; pendingDuePeople++; action=`<button type="button" class="settlement-status-btn settlement-status-supplement" data-settlement-status="supplement" data-settlement-key="${encodeURIComponent(r.key)}">待补款</button>`; }
                delete paymentRefundDone[r.key];
              }else{
                completedPeople++; delete paymentRefundDone[r.key]; delete paymentSupplementDone[r.key];
                action='<span class="settlement-status-label settlement-status-complete">✓ 已完成</span>';
              }
              return {...r,type,done,action};
            });
            const visible=prepared.filter(r=>{
              if(settlementFilter==='all') return true;
              if(settlementFilter==='pending') return r.type!=='complete'&&!r.done;
              if(settlementFilter==='refund') return r.type==='refund'&&!r.done;
              if(settlementFilter==='supplement') return r.type==='supplement'&&!r.done;
              if(settlementFilter==='complete') return r.type==='complete'||r.done;
              return true;
            });
            const rows=visible.map(r=>{
              const result=r.refund>0.005?`退款 ${money(r.refund)}`:(r.due>0.005?`补款 ${money(r.due)}`:'已平');
              const cls=r.refund>0.005?'settlement-result-refund':(r.due>0.005?'settlement-result-due':'settlement-result-even');
              const manualHint=r.manual?'<small class="settlement-source manual">手动调整</small>':'';
              const adjust=`<div class="settlement-result-box"><strong class="${cls}">${result}</strong>${manualHint}<div class="settlement-adjust-actions"><button type="button" class="settlement-mini-btn" data-settlement-adjust="refund" data-settlement-key="${encodeURIComponent(r.key)}" data-settlement-amount="${r.refund}" title="手动调整退款金额">退</button><button type="button" class="settlement-mini-btn" data-settlement-adjust="supplement" data-settlement-key="${encodeURIComponent(r.key)}" data-settlement-amount="${r.due}" title="手动调整补款金额">补</button></div></div>`;
              return `<tr><td>${escapeHtml(r.name)}</td><td>${money(r.g.received)}</td><td>${money(r.g.actual)}</td><td>${money(r.sh.expected)}</td><td>${money(r.sh.received)}</td><td>${adjust}</td><td>${r.action}</td><td><span class="payment-admin-note" contenteditable="true" spellcheck="false" data-payment-note="${encodeURIComponent(r.key)}" data-placeholder="填写备注">${escapeHtml(paymentNotes[r.key]||'')}</span></td></tr>`;
            }).join('');
            const filters=[['pending','待处理'],['refund','待退款'],['supplement','待补款'],['complete','已完成'],['all','全部']].map(([key,label])=>`<button type="button" class="settlement-filter-btn ${settlementFilter===key?'active':''}" data-settlement-filter="${key}">${label}</button>`).join('');
            const empty=`<tr><td colspan="8"><div class="settlement-empty">当前筛选下没有记录</div></td></tr>`;
            root.innerHTML=`<div class="settlement-dashboard-head"><strong>结算中心</strong><div class="settlement-head-actions"><button type="button" class="btn-ghost" id="copyRefundListBtn">复制退款名单</button><button type="button" class="btn-ghost" id="copySupplementListBtn">复制补款名单</button></div></div><div class="settlement-ledger"><div><span>待退款</span><b>${pendingRefundPeople} 人 / ${money(pendingRefund)}</b></div><div><span>待补款</span><b>${pendingDuePeople} 人 / ${money(pendingDue)}</b></div><div><span>已完成</span><b>${completedPeople} 人</b></div></div><div class="settlement-filter-bar">${filters}</div><div class="table-scroll"><table><thead><tr><th>CN</th><th>谷子已收</th><th>谷子实际</th><th>均摊应收</th><th>均摊已收</th><th>结算结果</th><th>状态</th><th>备注</th></tr></thead><tbody>${rows||empty}</tbody></table></div>`;
          }
      
          // ============================================================
          // 谷子收款统计
          // ============================================================
          function renderPaymentSummary(){
            const people=new Map();
            const startIndex=Math.max(0,paymentStartRow-1), endIndex=paymentEndRow===null?Infinity:Math.max(startIndex+1,paymentEndRow);
            columns.forEach(c=>(allocations[c.id]||[]).forEach((person,index)=>{
              if(index<startIndex||index>=endIndex) return;
              const name=String(person||'').trim(); if(!name) return;
              const key=name.replace(/\s+/g,'').toLowerCase();
              if(!people.has(key)) people.set(key,{key,name,total:0,items:new Map(),requestedQty:0,boughtQty:0,boughtTotal:0,boughtItems:new Map()});
              const row=people.get(key), price=unitPrice(c); row.total+=price; row.requestedQty++; row.items.set(c.name,(row.items.get(c.name)||0)+1);
              if(isMatrixCellBought(c.id,index,name)){ row.boughtQty++; row.boughtTotal+=price; row.boughtItems.set(c.name,(row.boughtItems.get(c.name)||0)+1); }
            }));
            const el=$('paymentSummary');
            if(!people.size){ el.innerHTML='<div class="empty">所选排单行范围内没有可统计的数据</div>'; $('paymentUnpaidCount').textContent='已收齐：0人 / ¥0.00；未收：0人 / ¥0.00'; return; }
            const feeAmount=total=>Math.ceil(((total<=100?total+0.1:total*1.001)-1e-9)*100)/100;
            const edited=(key,value)=>escapeHtml(Object.prototype.hasOwnProperty.call(paymentEdits,key)?paymentEdits[key]:value);
            const editAttr=key=>`contenteditable="true" spellcheck="false" data-payment-key="${encodeURIComponent(key)}"`;
            let rows='';
            [...people.values()].forEach(data=>{
              const name=data.name, alipayAmount=Math.max(0,num(Object.prototype.hasOwnProperty.call(paymentEdits,'alipay:'+name)?paymentEdits['alipay:'+name]:data.total)), receivedAmount=paidAmountValue(paymentPaid,data.key,alipayAmount), paidStatus=paidState(paymentPaid,data.key,alipayAmount), receivedNote=paymentReceivedNote(receivedAmount,alipayAmount), adjustmentNote='', paidClass=paidStatus==='full'?' class="payment-paid-row"':(paidStatus==='partial'?' class="payment-partial-row"':''), personAttr=` data-payment-person="${escapeAttr(data.key)}"`, paidControl=`<span class="payment-cn-controls"><button type="button" class="payment-paid-check" data-html2canvas-ignore="true" data-payment-paid="${encodeURIComponent(data.key)}" data-payment-amount="${alipayAmount}" data-payment-received="${receivedAmount}" aria-pressed="${paidStatus==='full'?'true':(paidStatus==='partial'?'mixed':'false')}" title="${paidStatus==='full'?'已收齐，点击取消':(paidStatus==='partial'?'部分已收，点击填写累计金额':'标记当前范围为已收')}">${paidStatus==='full'?'✓':(paidStatus==='partial'?'−':'')}</button></span><span class="payment-cn-name" ${editAttr('cn:'+name)}>${edited('cn:'+name,name)}</span>`;
              const items=[...data.items.entries()], span=items.length, payable=feeAmount(data.total);
              if(paymentViewMode==='merged'){
                const itemText=items.map(([item,count])=>`${item}×${count}`).join('、'), totalQty=items.reduce((sum,[,count])=>sum+count,0);
                const itemKey='merged-items:'+name, itemDisplay=Object.prototype.hasOwnProperty.call(paymentEdits,itemKey)?escapeHtml(paymentEdits[itemKey]):paymentMergedItemsDisplay(data,items,itemText);
                rows+=`<tr${paidClass}${personAttr}><td class="payment-cn">${paidControl}</td><td class="payment-item-name" ${editAttr(itemKey)}>${itemDisplay}</td><td ${editAttr('merged-qty:'+name)}>${edited('merged-qty:'+name,totalQty)}</td><td class="payment-money"><span ${editAttr('alipay:'+name)}>${edited('alipay:'+name,data.total.toFixed(2))}</span>${adjustmentNote}${receivedNote}</td><td class="payment-money" ${editAttr('wechat:'+name)}>${edited('wechat:'+name,payable.toFixed(2))}</td></tr>`;
                return;
              }
              items.forEach(([item,count],index)=>{
                rows+=`<tr${paidClass}${personAttr}>`;
                if(index===0) rows+=`<td class="payment-cn" rowspan="${span}">${paidControl}</td>`;
                rows+=`<td class="payment-item-name"><span ${editAttr('item:'+name+':'+item)}>${edited('item:'+name+':'+item,item)}</span>${paymentBoughtItemNote(data,item)}</td><td ${editAttr('qty:'+name+':'+item)}>${edited('qty:'+name+':'+item,count)}</td>`;
                if(index===0) rows+=`<td class="payment-money" rowspan="${span}"><span ${editAttr('alipay:'+name)}>${edited('alipay:'+name,data.total.toFixed(2))}</span>${adjustmentNote}${receivedNote}</td><td class="payment-money" rowspan="${span}" ${editAttr('wechat:'+name)}>${edited('wechat:'+name,payable.toFixed(2))}</td>`;
                rows+='</tr>';
              });
            });
            const color=/^#[0-9a-f]{6}$/i.test(paymentColor)?paymentColor:'#d1466a';
            const qrHtml=paymentQrImg?`<div class="payment-code-export"><img crossorigin="anonymous" src="${escapeAttr(paymentQrImg)}" alt="收款码"></div>`:'';
            const paymentTotal=[...people.values()].reduce((sum,data)=>{
              const amount=Math.max(0,num(Object.prototype.hasOwnProperty.call(paymentEdits,'alipay:'+data.name)?paymentEdits['alipay:'+data.name]:data.total));
              return sum+amount;
            },0);
            const totalHtml=showPaymentTotal?`<tfoot><tr><td colspan="4" class="payment-total-label">排单总价</td><td class="payment-total-value">${money(paymentTotal)}</td></tr></tfoot>`:'';
            const visibleData=[...people.values()], paidStates=visibleData.map(data=>paidState(paymentPaid,data.key,Object.prototype.hasOwnProperty.call(paymentEdits,'alipay:'+data.name)?paymentEdits['alipay:'+data.name]:data.total)), allPaid=paidStates.length>0&&paidStates.every(state=>state==='full'), partialPaid=!allPaid&&paidStates.some(state=>state!=='unpaid');
            let progressText=paymentProgressText(visibleData,paymentPaid,paymentRefund,paymentSupplement,data=>Object.prototype.hasOwnProperty.call(paymentEdits,'alipay:'+data.name)?paymentEdits['alipay:'+data.name]:data.total);
            $('paymentUnpaidCount').textContent=progressText; renderSettlementDashboard();
            const paidAllControl=`<button type="button" class="payment-paid-all" data-html2canvas-ignore="true" data-payment-paid-all="1" aria-pressed="${allPaid?'true':(partialPaid?'mixed':'false')}" title="全选或取消当前范围的已收款">${allPaid?'✓':(partialPaid?'−':'')}</button>`;
            el.innerHTML=`<div class="payment-table-wrap"><div class="payment-project-title" style="background:${color}">${escapeHtml(paymentTitle||'未命名项目')}</div><table class="payment-table"><thead><tr><th>${paidAllControl}<span ${editAttr('header:cn')}>${edited('header:cn','CN')}</span></th><th ${editAttr('header:item')}>${edited('header:item','谷类')}</th><th ${editAttr('header:qty')}>${edited('header:qty','数量')}</th><th ${editAttr('header:alipay')}>${edited('header:alipay','支付宝肾额')}</th><th ${editAttr('header:wechat')}>${edited('header:wechat','微信肾额')}</th></tr></thead><tbody>${rows}</tbody>${totalHtml}</table>${qrHtml}</div>`;
          }
          // ============================================================
          // 均摊统计
          // ============================================================
          function renderSharePaymentSummary(){
            const el=$('sharePaymentSummary'), sharedText=String($('sharedFee').value||'').trim(), sharedTotal=Math.max(0,num(sharedText));
            if(!sharedText||sharedTotal<=0){ el.innerHTML='<div class="empty">没有填写均摊金额，这里暂时不用计算</div>'; $('sharePaymentUnpaidCount').textContent='已收齐：0人 / ¥0.00；未收：0人 / ¥0.00'; return; }
            const people=new Map(), startIndex=Math.max(0,paymentStartRow-1), endIndex=paymentEndRow===null?Infinity:Math.max(startIndex+1,paymentEndRow);
            let totalQty=0, fixedDeduction=0;
            columns.forEach(c=>(allocations[c.id]||[]).forEach((person,index)=>{
              if(index<startIndex||index>=endIndex) return;
              const name=String(person||'').trim(); if(!name) return;
              const key=name.replace(/\s+/g,'').toLowerCase();
              if(!people.has(key)) people.set(key,{key,name,qty:0,items:new Map()});
              const data=people.get(key); data.qty++; totalQty++; data.items.set(c.name,(data.items.get(c.name)||0)+1);
              if(shareDeductFixed&&c.mode==='fixed') fixedDeduction+=Math.max(0,num(c.fixedPrice));
            }));
            if(!people.size||!totalQty){ el.innerHTML='<div class="empty">所选排单行范围内没有可统计的数据</div>'; $('sharePaymentUnpaidCount').textContent='已收齐：0人 / ¥0.00；未收：0人 / ¥0.00'; return; }
            const distributable=Math.max(0,sharedTotal-fixedDeduction), perItem=distributable/totalQty;
            const feeAmount=total=>Math.ceil(((total<=100?total+0.1:total*1.001)-1e-9)*100)/100;
            const edited=(key,value)=>escapeHtml(Object.prototype.hasOwnProperty.call(sharePaymentEdits,key)?sharePaymentEdits[key]:value);
            const editAttr=key=>`contenteditable="true" spellcheck="false" data-share-payment-key="${encodeURIComponent(key)}"`;
            let rows='';
            [...people.values()].forEach(data=>{
              const name=data.name, items=[...data.items.entries()], span=items.length, raw=data.qty*perItem, payable=feeAmount(raw), alipayAmount=Math.max(0,num(Object.prototype.hasOwnProperty.call(sharePaymentEdits,'alipay:'+name)?sharePaymentEdits['alipay:'+name]:raw)), receivedAmount=paidAmountValue(sharePaymentPaid,data.key,alipayAmount), paidStatus=paidState(sharePaymentPaid,data.key,alipayAmount), receivedNote=paymentReceivedNote(receivedAmount,alipayAmount), adjustmentNote='', paidClass=paidStatus==='full'?' class="payment-paid-row"':(paidStatus==='partial'?' class="payment-partial-row"':''), personAttr=` data-share-payment-person="${escapeAttr(data.key)}"`, paidControl=`<span class="payment-cn-controls"><button type="button" class="payment-paid-check" data-html2canvas-ignore="true" data-share-payment-paid="${encodeURIComponent(data.key)}" data-payment-amount="${alipayAmount}" data-payment-received="${receivedAmount}" aria-pressed="${paidStatus==='full'?'true':(paidStatus==='partial'?'mixed':'false')}" title="${paidStatus==='full'?'已收齐，点击取消':(paidStatus==='partial'?'部分已收，点击填写累计金额':'标记当前范围为已收')}">${paidStatus==='full'?'✓':(paidStatus==='partial'?'−':'')}</button></span><span class="payment-cn-name" ${editAttr('cn:'+name)}>${edited('cn:'+name,name)}</span>`;
              if(sharePaymentViewMode==='merged'){
                const itemText=items.map(([item,count])=>`${item}×${count}`).join('、');
                rows+=`<tr${paidClass}${personAttr}><td class="payment-cn">${paidControl}</td><td class="payment-item-name" ${editAttr('merged-items:'+name)}>${edited('merged-items:'+name,itemText)}</td><td ${editAttr('merged-qty:'+name)}>${edited('merged-qty:'+name,data.qty)}</td><td class="payment-money"><span ${editAttr('alipay:'+name)}>${edited('alipay:'+name,raw.toFixed(2))}</span>${adjustmentNote}${receivedNote}</td><td class="payment-money" ${editAttr('wechat:'+name)}>${edited('wechat:'+name,payable.toFixed(2))}</td></tr>`;
                return;
              }
              items.forEach(([item,count],index)=>{
                rows+=`<tr${paidClass}${personAttr}>`;
                if(index===0) rows+=`<td class="payment-cn" rowspan="${span}">${paidControl}</td>`;
                rows+=`<td class="payment-item-name" ${editAttr('item:'+name+':'+item)}>${edited('item:'+name+':'+item,item)}</td><td ${editAttr('qty:'+name+':'+item)}>${edited('qty:'+name+':'+item,count)}</td>`;
                if(index===0) rows+=`<td class="payment-money" rowspan="${span}"><span ${editAttr('alipay:'+name)}>${edited('alipay:'+name,raw.toFixed(2))}</span>${adjustmentNote}${receivedNote}</td><td class="payment-money" rowspan="${span}" ${editAttr('wechat:'+name)}>${edited('wechat:'+name,payable.toFixed(2))}</td>`;
                rows+='</tr>';
              });
            });
            const color=/^#[0-9a-f]{6}$/i.test(sharePaymentColor)?sharePaymentColor:'#d1466a';
            const qrHtml=paymentQrImg?`<div class="payment-code-export"><img crossorigin="anonymous" src="${escapeAttr(paymentQrImg)}" alt="收款码"></div>`:'';
            const note=shareDeductFixed?`均摊 ${money(sharedTotal)}－入均 ${money(fixedDeduction)}＝实际均摊 ${money(distributable)}；共 ${totalQty} 件，每件 ${money(perItem)}`:`直接均摊 ${money(sharedTotal)}；共 ${totalQty} 件，每件 ${money(perItem)}`;
            const visibleData=[...people.values()], paidStates=visibleData.map(data=>paidState(sharePaymentPaid,data.key,Object.prototype.hasOwnProperty.call(sharePaymentEdits,'alipay:'+data.name)?sharePaymentEdits['alipay:'+data.name]:data.qty*perItem)), allPaid=paidStates.length>0&&paidStates.every(state=>state==='full'), partialPaid=!allPaid&&paidStates.some(state=>state!=='unpaid');
            $('sharePaymentUnpaidCount').textContent=paymentProgressText([...people.values()],sharePaymentPaid,sharePaymentRefund,sharePaymentSupplement,data=>Object.prototype.hasOwnProperty.call(sharePaymentEdits,'alipay:'+data.name)?sharePaymentEdits['alipay:'+data.name]:data.qty*perItem);
            const paidAllControl=`<button type="button" class="payment-paid-all" data-html2canvas-ignore="true" data-share-payment-paid-all="1" aria-pressed="${allPaid?'true':(partialPaid?'mixed':'false')}" title="全选或取消当前范围的已收款">${allPaid?'✓':(partialPaid?'−':'')}</button>`;
            el.innerHTML=`<div class="payment-table-wrap"><div class="payment-project-title" style="background:${color}">${escapeHtml(sharePaymentTitle||'均摊统计')}</div><div class="hint share-calculation-note" data-html2canvas-ignore="true" style="padding:8px 10px;background:#fff8fb;text-align:center;">${escapeHtml(note)}</div><table class="payment-table"><thead><tr><th>${paidAllControl}<span ${editAttr('header:cn')}>${edited('header:cn','CN')}</span></th><th ${editAttr('header:item')}>${edited('header:item','谷类')}</th><th ${editAttr('header:qty')}>${edited('header:qty','数量')}</th><th ${editAttr('header:alipay')}>${edited('header:alipay','支付宝肾额')}</th><th ${editAttr('header:wechat')}>${edited('header:wechat','微信肾额')}</th></tr></thead><tbody>${rows}</tbody></table>${qrHtml}</div>`;
          }
          function syncPaymentControls(){
            $('paymentTitleInput').value=paymentTitle;
            $('paymentColorInput').value=/^#[0-9a-f]{6}$/i.test(paymentColor)?paymentColor:'#d1466a';
            $('paymentViewMode').value=paymentViewMode;
            $('showPaymentTotalBtn').textContent=showPaymentTotal?'隐藏总价':'显示总价';
            const settlementModeBtn=$('toggleBoughtSettlementBtn');
            if(settlementModeBtn){
              settlementModeBtn.textContent=showBoughtSettlement?'关闭结算中心':'开启结算中心';
              settlementModeBtn.classList.toggle('active',showBoughtSettlement);
              settlementModeBtn.setAttribute('aria-pressed',showBoughtSettlement?'true':'false');
            }
            const boughtMarkBtn=$('markBoughtModeBtn');
            if(boughtMarkBtn) boughtMarkBtn.hidden=false;
            $('paymentStartRow').value=paymentStartRow;
            $('paymentEndRow').value=paymentEndRow===null?'':paymentEndRow;
            $('clearPaymentQrBtn').style.display=paymentQrImg?'':'none';
            $('sharePaymentTitleInput').value=sharePaymentTitle;
            $('sharePaymentColorInput').value=/^#[0-9a-f]{6}$/i.test(sharePaymentColor)?sharePaymentColor:'#d1466a';
            $('sharePaymentViewMode').value=sharePaymentViewMode;
            $('shareDeductFixedBtn').textContent=shareDeductFixed?'入均计算：已开启':'入均计算：未开启'; $('shareDeductFixedBtn').classList.toggle('active',shareDeductFixed);
            $('goodsPaymentView').style.display=paymentActiveTab==='goods'?'':'none';
            $('sharePaymentView').style.display=paymentActiveTab==='share'?'':'none';
            document.querySelectorAll('[data-payment-tab]').forEach(btn=>btn.classList.toggle('active',btn.dataset.paymentTab===paymentActiveTab));
          }
      
          // ---------- cart ----------
          function colOrderedCount(c){ return (allocations[c.id]||[]).length; }
          function currentMatchCount(){ const counts=columns.map(colOrderedCount); return counts.length?Math.min(...counts):0; }
          function currentMaxCount(){ const counts=columns.map(colOrderedCount); return counts.length?Math.max(...counts):0; }
          function cartTarget(){
            if(cartTargetMode==='manual'&&Number.isFinite(cartTargetNum)&&cartTargetNum>0) return cartTargetNum;
            return currentMaxCount();
          }
          // ============================================================
          // 推车图
          // ============================================================
          function renderCart(){
            const empty=$('cartEmpty'), header=$('cartHeader'), grid=$('cartGrid');
            grid.style.gridTemplateColumns=`repeat(${cartColumns},minmax(0,1fr))`;
            if(columns.length===0){ empty.style.display='block'; header.style.display='none'; grid.innerHTML=''; $('cartTargetInfo').textContent=''; return; }
            empty.style.display='none';
            const showHeader=cartNote.trim()||cartQrImg;
            header.style.display=showHeader?'flex':'none';
            $('cartHeaderNote').textContent=cartNote;
            $('cartQrImage').style.display=cartQrImg?'block':'none';
            if(cartQrImg) $('cartQrImage').src=cartQrImg;
            const target=cartTarget(), maxCount=currentMaxCount();
            $('cartTargetInfo').textContent=`当前最多 ${maxCount} 配`+(cartTargetMode==='manual'&&target?` · 目标 ${target} 配`:'');
            grid.innerHTML=columns.map(c=>{
              const cnt=colOrderedCount(c);
              // 左上角价格徽标：均价不写；调价写 +价/−价；入均写 价/1
              let priceHtml='';
              if(c.mode==='fixed'){
                priceHtml=`<span class="cart-badge cart-price fixed">${fmtNum(c.fixedPrice)}/1</span>`;
              } else if(c.mode==='single'){
                priceHtml=`<span class="cart-badge cart-price fixed">${fmtNum(unitPrice(c))}/1</span>`;
              } else if(c.mode==='avg'){
                priceHtml='<span class="cart-badge cart-price avg">均</span>';
              } else if(c.mode==='adjust'){
                const adj=num(c.priceAdj);
                if(Math.abs(adj)>0.0001){
                  const cls=adj>0?'up':'down';
                  const sign=adj>0?'+':'-';
                  priceHtml=`<span class="cart-badge cart-price ${cls}">${sign}${fmtNum(Math.abs(adj))}</span>`;
                }
              }
              let countHtml;
              if(cartCountMode==='ordered'){
                const manualDone=cartTargetMode==='manual'&&target>0&&cnt>=target;
                countHtml=manualDone?'':`<span class="cart-badge cart-count done">排 ${cnt}</span>`;
              } else if(target&&target>0){
                const done=cnt>=target;
                countHtml=done?'':`<span class="cart-badge cart-count short">差 ${target-cnt}</span>`;
              } else {
                countHtml='';
              }
              const imgHtml=c.img?`<img class="cart-img" crossorigin="anonymous" src="${escapeAttr(c.img)}">`:`<div class="cart-img-empty">未加图片</div>`;
              return `<div class="cart-card">${imgHtml}${priceHtml}${countHtml}<div class="cart-name">${escapeHtml(c.name)}</div></div>`;
            }).join('');
          }
          function syncCartControls(){
            $('cartNote').value=cartNote;
            $('cartTargetMode').value=cartTargetMode;
            $('cartTargetNum').style.display=(cartTargetMode==='manual')?'':'none';
            $('cartTargetNum').value=(cartTargetNum!==null)?cartTargetNum:'';
            $('cartCountMode').value=cartCountMode;
            $('cartColumns').value=String(cartColumns);
            $('cartGrid').style.gridTemplateColumns=`repeat(${cartColumns},minmax(0,1fr))`;
            $('clearCartQrBtn').style.display=cartQrImg?'':'none';
          }
      
          function cleanOcrText(text){
            return text.split('\n').map(l=>l.trim()).filter(line=>{
              if(!line) return false;
              if(/^配\s*比\s*相册/.test(line)) return false;
              if(/^评论\s*回复/.test(line)) return false;
              if(/^\d{4}[\/\-]\d{2}[\/\-]\d{2}$/.test(line)) return false;
              if(/走\s*(通|郧|场)\s*贩|均\s*[\d.]+|红\s*加.*减/.test(line)) return false;
              if(/^评论$/.test(line)) return false;
              if(/^[×xX]$/.test(line)) return false;
              if(/^[-—\s]*加\s*$/.test(line)) return false;
              return true;
            }).map(collapseCjkSpaces).join('\n');
          }
          function loadOcrImage(file){
            return new Promise((resolve,reject)=>{
              const reader=new FileReader();
              reader.onload=()=>{ const img=new Image(); img.onload=()=>resolve(img); img.onerror=reject; img.src=reader.result; };
              reader.onerror=reject; reader.readAsDataURL(file);
            });
          }
          async function preprocessOcrImage(file){
            const img=await loadOcrImage(file), source=document.createElement('canvas'), sourceCtx=source.getContext('2d',{willReadFrequently:true});
            source.width=img.naturalWidth||img.width; source.height=img.naturalHeight||img.height; sourceCtx.drawImage(img,0,0);
            // 缩小扫描，自动寻找黑色封面下方的大面积白色评论面板。
            const scan=document.createElement('canvas'), scanWidth=Math.min(260,source.width), scanScale=scanWidth/source.width;
            scan.width=scanWidth; scan.height=Math.max(1,Math.round(source.height*scanScale));
            const scanCtx=scan.getContext('2d',{willReadFrequently:true}); scanCtx.drawImage(source,0,0,scan.width,scan.height);
            const pixels=scanCtx.getImageData(0,0,scan.width,scan.height).data;
            let panelY=Math.round(source.height*0.18), streak=0, found=-1;
            for(let y=Math.round(scan.height*0.15);y<Math.round(scan.height*0.82);y++){
              let white=0;
              for(let x=0;x<scan.width;x+=2){
                const i=(y*scan.width+x)*4, r=pixels[i],g=pixels[i+1],b=pixels[i+2];
                if(r>232&&g>232&&b>232&&Math.max(r,g,b)-Math.min(r,g,b)<18) white++;
              }
              const ratio=white/Math.ceil(scan.width/2);
              if(ratio>0.78){ streak++; if(streak>=5){ found=y-4; break; } } else streak=0;
            }
            if(found>=0) panelY=Math.max(0,Math.round(found/scanScale));
            // 左侧头像和右侧滚动条不参与识别，保留人物名与需求正文。
            const cropX=Math.round(source.width*0.095), cropRight=Math.round(source.width*0.975);
            const cropY=panelY, cropWidth=Math.max(1,cropRight-cropX), cropHeight=Math.max(1,source.height-cropY-Math.round(source.height*0.025));
            const scale=Math.min(3,Math.max(1.8,1900/cropWidth)), output=document.createElement('canvas');
            output.width=Math.round(cropWidth*scale); output.height=Math.round(cropHeight*scale);
            const ctx=output.getContext('2d',{willReadFrequently:true}); ctx.fillStyle='#fff'; ctx.fillRect(0,0,output.width,output.height);
            ctx.imageSmoothingEnabled=true; ctx.imageSmoothingQuality='high'; ctx.drawImage(source,cropX,cropY,cropWidth,cropHeight,0,0,output.width,output.height);
            // 浅灰人物名加深，同时把接近白色的背景清干净。
            const image=ctx.getImageData(0,0,output.width,output.height), data=image.data;
            for(let i=0;i<data.length;i+=4){
              const lum=data[i]*0.299+data[i+1]*0.587+data[i+2]*0.114;
              let value=Math.round(255-(255-lum)*2.05); value=Math.max(0,Math.min(255,value));
              if(value>238) value=255;
              data[i]=data[i+1]=data[i+2]=value;
            }
            ctx.putImageData(image,0,0); return output;
          }
      
          // ---------- wire static controls ----------
          ['priceType','count','jpyPrice','exchangeRate','manualAveragePrice','sharedFee'].forEach(id=>{
            $(id).addEventListener('input',recalc);
            $(id).addEventListener('change',recalc);
          });
          $('showPricingRow').addEventListener('click',()=>{ showPricingRow=!showPricingRow; syncMatrixOptions(); saveState(); renderMatrix(); });
          $('showUnitPriceRow').addEventListener('click',()=>{ showUnitPriceRow=!showUnitPriceRow; syncMatrixOptions(); saveState(); renderMatrix(); });
          $('showPromotionPointRow').addEventListener('click',()=>{ showPromotionPointRow=!showPromotionPointRow; syncMatrixOptions(); saveState(); renderMatrix(); });
          $('showCompleteRowColor').addEventListener('click',()=>{ showCompleteRowColor=!showCompleteRowColor; syncMatrixOptions(); saveState(); renderMatrix(); });
          $('showColdPromotionColor').addEventListener('click',()=>{ showColdPromotionColor=!showColdPromotionColor; syncMatrixOptions(); saveState(); renderMatrix(); });
          $('markBoughtModeBtn').addEventListener('click',()=>{
            if(matrixPreviewAllocations){ alert('请先确认或取消当前预览，再标记买齐'); return; }
            matrixBuyMarkMode=!matrixBuyMarkMode; syncMatrixOptions(); renderMatrix();
          });
          $('selectColdBundleBtn').addEventListener('click',()=>openColdBundleChooser(false));
          $('cancelColdBundleBtn').addEventListener('click',()=>{ coldPromotionPendingBundlePreview=false; $('coldBundleChooser').style.display='none'; renderColdBundleConfiguration(); });
          $('saveColdBundleBtn').addEventListener('click',()=>{
            const selected=[...$('coldBundleList').querySelectorAll('input[type="checkbox"]:checked')].map(input=>parseInt(input.value,10)).filter(id=>columns.some(c=>c.id===id&&c.mode!=='fixed'));
            if(!selected.length){ alert('请至少选择一个捆位'); return; }
            coldCarryBundleColumnIds=selected; saveState(); $('coldBundleChooser').style.display='none'; renderColdBundleConfiguration();
            const continuePreview=coldPromotionPendingBundlePreview; coldPromotionPendingBundlePreview=false;
            if(continuePreview) startColdPromotionPreview();
          });
          $('undoLastApplyBtn').addEventListener('click',undoLastApplication);
          $('matrixTitleInput').addEventListener('input',e=>{
            matrixTitle=e.target.value;
            const sheet=sheets.find(s=>s.id===activeSheetId);
            if(sheet) sheet.matrixTitleCustom=String(matrixTitle).trim()!==String(sheet.name||'').trim()&&String(matrixTitle).trim()!=='';
            renderMatrixHeading(); saveState();
          });
          $('quantityTitleInput').addEventListener('input',e=>{
            quantityTitle=e.target.value;
            const sheet=sheets.find(s=>s.id===activeSheetId);
            if(sheet) sheet.quantityTitleCustom=String(quantityTitle).trim()!==String(sheet.name||'').trim()&&String(quantityTitle).trim()!=='';
            renderQuantitySummary(); saveState();
          });
          $('matrixColorInput').addEventListener('input',e=>{ matrixColor=e.target.value; renderMatrixHeading(); saveState(); });
          $('workspaceSelect').addEventListener('change',async event=>{
            const previous=activeWorkspaceId,next=String(event.target.value||'');
            if(!next||next===previous) return;
            if(!(await activateWorkspace(next,true))){ activeWorkspaceId=previous; renderWorkspaceUI(); }
          });
          $('createWorkspaceBtn').addEventListener('click',createWorkspace);
          $('renameWorkspaceBtn').addEventListener('click',renameWorkspace);
          $('inviteWorkspaceMemberBtn').addEventListener('click',inviteWorkspaceMember);
          $('showWorkspaceInvitesBtn').addEventListener('click',async()=>{
            await loadWorkspaceOverview(false);
            $('workspaceInvitesPanel').hidden=!$('workspaceInvitesPanel').hidden; $('workspaceMembersPanel').hidden=true;
          });
          $('showWorkspaceMembersBtn').addEventListener('click',showWorkspaceMembers);
          $('deleteWorkspaceBtn').addEventListener('click',deleteCurrentWorkspace);
          $('restoreWorkspaceByCodeBtn').addEventListener('click',()=>restoreWorkspace(''));
          $('workspaceArchiveList').addEventListener('click',event=>{ const button=event.target.closest('[data-restore-archived]'),row=button?.closest('[data-archived-workspace]'); if(button&&row) restoreWorkspace(row.dataset.archivedWorkspace); });
          document.querySelectorAll('[data-close-workspace-panel]').forEach(button=>button.addEventListener('click',()=>{ button.closest('.workspace-side-panel').hidden=true; }));
          $('workspaceInviteList').addEventListener('click',event=>{
            const button=event.target.closest('[data-invite-action]'),row=button?.closest('[data-workspace-invite]'); if(!button||!row) return;
            respondWorkspaceInvite(row.dataset.workspaceInvite,button.dataset.inviteAction==='accept');
          });
          $('workspaceMemberList').addEventListener('click',async event=>{
            const button=event.target.closest('[data-remove-member]'),row=button?.closest('[data-member-id]'),group=currentWorkspace(); if(!button||!row||!group) return;
            if(!await appConfirm('确定把这位成员移出当前协作组吗？','移除协作成员','确认移除')) return;
            button.disabled=true;
            try{
              const {error}=await getAuthClient().rpc('ggz_remove_group_member',{p_group_id:group.id,p_user_id:row.dataset.memberId}); if(error) throw error;
              await showWorkspaceMembers(); setWorkspaceStatus('成员已移除','ok');
            }catch(error){ button.disabled=false; setWorkspaceStatus(readableWorkspaceError(error),'bad'); }
          });
          $('editorNameInput').addEventListener('change',()=>{ editorName=String($('editorNameInput').value||'').trim(); localStorage.setItem('ggzEditorName',editorName); if(collabEnabled) refreshCollabActivity(); });
          $('authLoginTab').addEventListener('click',()=>showAuthMode('login'));
          $('authRegisterTab').addEventListener('click',()=>showAuthMode('register'));
          $('authLoginForm').addEventListener('submit',async event=>{
            event.preventDefault();
            const form=event.currentTarget, name=normalizedAccountName($('authLoginName').value), password=$('authLoginPassword').value;
            if(name.length<1){ setAuthMessage('请填写账户名','bad'); $('authLoginName').focus(); return; }
            if(password.length<8){ setAuthMessage('密码至少填写8位','bad'); $('authLoginPassword').focus(); return; }
            setAuthBusy(form,true); setAuthMessage('正在登录…');
            try{
              const email=await accountLoginEmail(name), {data,error}=await getAuthClient().auth.signInWithPassword({email,password});
              if(error) throw error; if(!data?.session) throw new Error('登录状态为空，请重试');
              applyAuthSession(data.session);
            }catch(error){ setAuthMessage(readableAuthError(error),'bad'); }
            finally{ setAuthBusy(form,false); }
          });
          $('authRegisterForm').addEventListener('submit',async event=>{
            event.preventDefault();
            const form=event.currentTarget, name=normalizedAccountName($('authRegisterName').value), password=$('authRegisterPassword').value, again=$('authRegisterPasswordAgain').value;
            if(name.length<1||name.length>20){ setAuthMessage('账户名请填写1—20个字','bad'); $('authRegisterName').focus(); return; }
            if(password.length<8){ setAuthMessage('密码至少填写8位','bad'); $('authRegisterPassword').focus(); return; }
            if(password!==again){ setAuthMessage('两次输入的密码不一样','bad'); $('authRegisterPasswordAgain').focus(); return; }
            setAuthBusy(form,true); setAuthMessage('正在注册…');
            try{
              const client=getAuthClient(),availability=await client.rpc('ggz_username_available',{p_username:name});
              if(availability.error) throw availability.error;
              if(availability.data!==true) throw new Error('USERNAME_TAKEN');
              const email=await accountLoginEmail(name);
              const {data,error}=await client.auth.signUp({email,password,options:{data:{username:name,account_name:name}}});
              if(error) throw error;
              if(data?.session){ applyAuthSession(data.session); }
              else{
                const login=await client.auth.signInWithPassword({email,password});
                if(login.error) throw login.error;
                if(!login.data?.session) throw new Error('注册完成，但尚未建立登录状态');
                applyAuthSession(login.data.session);
              }
            }catch(error){ setAuthMessage(readableAuthError(error),'bad'); }
            finally{ setAuthBusy(form,false); }
          });
          $('authLogoutBtn').addEventListener('click',async()=>{
            if(collabEnabled){
              await flushCollabChanges();
              if(collabNeedsSend){ alert('还有协作修改没有同步成功，暂时不能退出登录。'); return; }
              await leaveCollabPresence();
            }
            const button=$('authLogoutBtn'); button.disabled=true;
            try{
              await getAuthClient().auth.signOut(); localStorage.removeItem('ggzEditorName'); location.reload();
            }catch(error){ button.disabled=false; alert('退出失败：'+readableAuthError(error)); }
          });
          $('startCollabBtn').addEventListener('click',()=>startCollab(false));
          $('stopCollabBtn').addEventListener('click',stopCollab);
          $('acquireEditLockBtn').addEventListener('click',acquireEditLock);
          $('releaseEditLockBtn').addEventListener('click',()=>releaseEditLock(true,false));
          $('cloudUploadBtn').addEventListener('click',()=>uploadCloud(false));
          $('cloudDownloadBtn').addEventListener('click',()=>{ if(collabEnabled){ alert('实时协作开启时会自动读取最新状态，不需要再手动读取完整备份。'); return; } downloadCloud(false); });
      
          $('addColumnBtn').addEventListener('click',()=>{ addColumn('新角色'+(columns.length+1),[], 'avg',0,0); saveState(); renderColumnList(); recalc(); });
          $('saveColumnsToCatalogBtn').addEventListener('click',()=>{ saveColumnsToCatalog(); const b=$('saveColumnsToCatalogBtn'),old=b.textContent;b.textContent='已保存';setTimeout(()=>b.textContent=old,1200); });
          $('toggleCatalogBtn').addEventListener('click',()=>{
            const panel=$('catalogPanel'),open=panel.style.display!=='none'; panel.style.display=open?'none':'block';
            $('toggleCatalogBtn').textContent=open?'打开常用谷子库':'收起常用谷子库'; if(!open) renderCatalog();
          });
          $('catalogSearch').addEventListener('input',()=>{ catalogSelectedIds.clear(); renderCatalog(); });
          document.querySelector('.catalog-filter-tabs').addEventListener('click',e=>{
            const button=e.target.closest('[data-catalog-filter]'); if(!button) return;
            catalogFilter=button.dataset.catalogFilter||'all'; catalogSelectedIds.clear(); renderCatalog();
          });
          $('catalogGroupFilter').addEventListener('change',e=>{ catalogGroup=e.target.value||'all'; catalogSelectedIds.clear(); renderCatalog(); });
          $('catalogSort').addEventListener('change',e=>{ catalogSort=e.target.value||'smart'; renderCatalog(); });
          $('catalogSelectAllBtn').addEventListener('click',()=>{
            const allSelected=catalogVisibleIds.length>0&&catalogVisibleIds.every(id=>catalogSelectedIds.has(id));
            catalogVisibleIds.forEach(id=>allSelected?catalogSelectedIds.delete(id):catalogSelectedIds.add(id));
            renderCatalog();
          });
          $('catalogBatchAddBtn').addEventListener('click',()=>{
            let added=0,skipped=0;
            itemCatalog.filter(item=>catalogSelectedIds.has(item.catalogId)).forEach(item=>{
              if(addCatalogItemToSheet(item)){ markCatalogUsed(item); added++; } else skipped++;
            });
            catalogSelectedIds.clear();
            if(added){ saveState(); renderColumnList(); recalc(); }
            renderCatalog();
            const button=$('catalogBatchAddBtn'), old='加入所选';
            button.textContent=added?`已加入 ${added} 项${skipped?`，跳过 ${skipped} 项`:''}`:`已跳过 ${skipped} 项`;
            setTimeout(()=>button.textContent=old,1500);
          });
          $('catalogList').addEventListener('change',e=>{
            const row=e.target.closest('[data-catalog-id]'); if(!row) return;
            const id=parseInt(row.dataset.catalogId,10),item=itemCatalog.find(x=>x.catalogId===id); if(!item) return;
            if(e.target.matches('[data-catalog-select]')){
              if(e.target.checked) catalogSelectedIds.add(id); else catalogSelectedIds.delete(id);
              $('catalogSelectionCount').textContent=`已选 ${catalogSelectedIds.size} 项`;
              $('catalogBatchAddBtn').disabled=catalogSelectedIds.size===0;
            }else if(e.target.matches('.catalog-group-edit')){
              let nextGroup=String(e.target.value||'').trim();
              if(nextGroup==='__new__'){
                const entered=prompt('请输入新的分组名称',item.catalogGroup||'');
                if(entered===null){ renderCatalog(); return; }
                nextGroup=String(entered).trim();
              }
              item.catalogGroup=nextGroup; saveState(); renderCatalog();
            }
          });
          $('catalogList').addEventListener('click',e=>{
            const row=e.target.closest('[data-catalog-id]'); if(!row) return;
            const id=parseInt(row.dataset.catalogId,10), item=itemCatalog.find(x=>x.catalogId===id); if(!item) return;
            if(e.target.closest('.catalog-pin')){
              item.catalogPinned=!item.catalogPinned; saveState(); renderCatalog();
            }else if(e.target.closest('.catalog-add')){
              if(!addCatalogItemToSheet(item)){ alert('本表已经有这个谷子'); return; }
              markCatalogUsed(item); saveState(); renderColumnList(); recalc(); renderCatalog();
            }else if(e.target.closest('.catalog-delete')){
              if(!confirm('从常用谷子库删除这一项吗？')) return;
              itemCatalog=itemCatalog.filter(x=>x.catalogId!==id); catalogSelectedIds.delete(id); saveState(); renderCatalog();
            }
          });
      
          $('addSheetBtn').addEventListener('click',()=>{
            captureActiveSheet();
            const sheet=blankSheet(`表${sheets.length+1}`);
            sheets.push(sheet); sheetStatusFilter='ongoing'; localStorage.setItem(SHEET_STATUS_FILTER_KEY,sheetStatusFilter); applySheet(sheet); saveState();
          });
          function moveSheetByOffset(id,offset){
            const sheet=sheets.find(item=>item.id===id); if(!sheet) return;
            const completed=isSheetCompleted(sheet), peers=sheets.filter(item=>isSheetCompleted(item)===completed), peerIndex=peers.findIndex(item=>item.id===id), targetPeer=peers[peerIndex+offset];
            if(peerIndex<0||!targetPeer) return;
            const index=sheets.findIndex(item=>item.id===id),target=sheets.findIndex(item=>item.id===targetPeer.id);
            captureActiveSheet(); [sheets[index],sheets[target]]=[sheets[target],sheets[index]]; saveState(); renderSheetTabs();
            requestAnimationFrame(()=>document.querySelector(`.sheet-tab[data-sheet="${id}"]`)?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'center'}));
          }
          function outstandingPaymentCounts(){
            const count=selector=>[...document.querySelectorAll(selector)].filter(button=>Math.max(0,num(button.dataset.paymentAmount))>0.005&&button.getAttribute('aria-pressed')!=='true').length;
            return {goods:count('#paymentSummary [data-payment-paid]'),share:count('#sharePaymentSummary [data-share-payment-paid]')};
          }
          async function toggleActiveSheetCompleted(){
            captureActiveSheet();
            const sheet=sheets.find(item=>item.id===activeSheetId); if(!sheet) return;
            if(isSheetCompleted(sheet)){
              sheet.completed=false; sheet.completedAt=''; sheetStatusFilter='ongoing';
            }else{
              const outstanding=outstandingPaymentCounts(),parts=[];
              if(outstanding.goods) parts.push(`谷子收款还有 ${outstanding.goods} 人未收齐`);
              if(outstanding.share) parts.push(`均摊收款还有 ${outstanding.share} 人未收齐`);
              const message=parts.length?`${parts.join('，')}。\n仍要把「${sheet.name}」标记为已完成吗？`:`确认把「${sheet.name}」归入已完成吗？`;
              if(!await appConfirm(message,'标记排单完成','确认完成')) return;
              sheet.completed=true; sheet.completedAt=new Date().toISOString(); sheetStatusFilter='completed';
            }
            localStorage.setItem(SHEET_STATUS_FILTER_KEY,sheetStatusFilter); saveState(); renderSheetTabs();
          }
          $('toggleSheetCompletedBtn').addEventListener('click',toggleActiveSheetCompleted);
          $('mobileToggleSheetCompletedBtn').addEventListener('click',toggleActiveSheetCompleted);
          $('sheetSearchInput').addEventListener('input',renderSheetTabs);
          document.querySelector('.sheet-status-tabs').addEventListener('click',e=>{
            const button=e.target.closest('[data-sheet-status-filter]'); if(!button) return;
            sheetStatusFilter=button.dataset.sheetStatusFilter||'ongoing'; localStorage.setItem(SHEET_STATUS_FILTER_KEY,sheetStatusFilter); renderSheetTabs();
          });
          $('sheetTabs').addEventListener('click',e=>{
            const tab=e.target.closest('[data-sheet]'); if(!tab) return;
            const id=parseInt(tab.dataset.sheet,10);
            if(e.target.closest('.sheet-close')){
              if(sheets.length<=1||!confirm('确定删除这张表吗？')) return;
              const wasActive=id===activeSheetId;
              sheets=sheets.filter(s=>s.id!==id);
              delete undoHistoryBySheet[String(id)]; saveUndoHistory();
              if(wasActive) applySheet(sheets[0]); else renderSheetTabs();
              saveState(); return;
            }
            switchSheet(id);
          });
          $('sheetTabs').addEventListener('dblclick',e=>{
            const tab=e.target.closest('[data-sheet]'); if(!tab||e.target.closest('.sheet-close,.sheet-drag-handle')) return;
            const sheet=sheets.find(s=>s.id===parseInt(tab.dataset.sheet,10)); if(!sheet) return;
            const name=prompt('给这张表改个名字',sheet.name);
            if(name&&name.trim()){
              const nextName=name.trim(), matrixFollows=!sheetUsesCustomTitle(sheet,'matrixTitle'), quantityFollows=!sheetUsesCustomTitle(sheet,'quantityTitle'), paymentFollows=!sheetUsesCustomTitle(sheet,'paymentTitle');
              sheet.name=nextName;
              if(matrixFollows){ sheet.matrixTitle=nextName; sheet.matrixTitleCustom=false; }
              if(quantityFollows){ sheet.quantityTitle=nextName; sheet.quantityTitleCustom=false; }
              if(paymentFollows){ sheet.paymentTitle=nextName; sheet.paymentTitleCustom=false; }
              if(sheet.id===activeSheetId){
                if(matrixFollows){ matrixTitle=nextName; $('matrixTitleInput').value=nextName; renderMatrixHeading(); }
                if(quantityFollows){ quantityTitle=nextName; $('quantityTitleInput').value=nextName; renderQuantitySummary(); }
                if(paymentFollows){ paymentTitle=nextName; $('paymentTitleInput').value=nextName; renderPaymentSummary(); }
              }
              saveState(); renderSheetTabs();
            }
          });
          let draggedSheetId=null;
          $('sheetTabs').addEventListener('dragstart',e=>{
            const handle=e.target.closest('.sheet-drag-handle'),tab=handle?.closest('.sheet-tab'); if(!tab){ e.preventDefault(); return; }
            const sourceSheet=sheets.find(sheet=>sheet.id===parseInt(tab.dataset.sheet,10)); if(!sourceSheet){ e.preventDefault(); return; }
            draggedSheetId=parseInt(tab.dataset.sheet,10); tab.classList.add('dragging'); e.dataTransfer.effectAllowed='move';
            try{ e.dataTransfer.setData('text/plain',String(draggedSheetId)); }catch(_){}
          });
          $('sheetTabs').addEventListener('dragover',e=>{
            const tab=e.target.closest('.sheet-tab'); if(!tab||draggedSheetId==null||parseInt(tab.dataset.sheet,10)===draggedSheetId) return;
            const sourceSheet=sheets.find(sheet=>sheet.id===draggedSheetId), targetSheet=sheets.find(sheet=>sheet.id===parseInt(tab.dataset.sheet,10)); if(!sourceSheet||!targetSheet||isSheetCompleted(sourceSheet)!==isSheetCompleted(targetSheet)) return;
            e.preventDefault(); e.dataTransfer.dropEffect='move'; document.querySelectorAll('.sheet-tab.drag-over').forEach(item=>item.classList.remove('drag-over')); tab.classList.add('drag-over');
          });
          $('sheetTabs').addEventListener('drop',e=>{
            const targetTab=e.target.closest('.sheet-tab'); if(!targetTab||draggedSheetId==null) return;
            e.preventDefault(); const targetId=parseInt(targetTab.dataset.sheet,10), sourceIndex=sheets.findIndex(sheet=>sheet.id===draggedSheetId), targetIndex=sheets.findIndex(sheet=>sheet.id===targetId);
            if(sourceIndex<0||targetIndex<0||sourceIndex===targetIndex||isSheetCompleted(sheets[sourceIndex])!==isSheetCompleted(sheets[targetIndex])) return;
            const targetRect=targetTab.getBoundingClientRect(), vertical=getComputedStyle($('sheetTabs')).flexDirection.startsWith('column');
            const after=vertical?e.clientY>targetRect.top+targetRect.height/2:e.clientX>targetRect.left+targetRect.width/2;
            captureActiveSheet(); const [moving]=sheets.splice(sourceIndex,1); let insertAt=targetIndex+(after?1:0); if(sourceIndex<insertAt) insertAt--; sheets.splice(Math.max(0,Math.min(insertAt,sheets.length)),0,moving); saveState(); renderSheetTabs();
          });
          $('sheetTabs').addEventListener('dragend',()=>{ draggedSheetId=null; document.querySelectorAll('.sheet-tab.dragging,.sheet-tab.drag-over').forEach(item=>item.classList.remove('dragging','drag-over')); });
          document.querySelectorAll('[data-app-section]').forEach(button=>button.addEventListener('click',()=>setAppSection(button.dataset.appSection,true)));
          $('mobileSheetSelect').addEventListener('change',e=>switchSheet(parseInt(e.target.value,10)));
          $('mobileAddSheetBtn').addEventListener('click',()=>$('addSheetBtn').click());
          $('mobileRenameSheetBtn').addEventListener('click',()=>{
            const sheet=sheets.find(item=>item.id===activeSheetId); if(!sheet) return;
            const name=prompt('给当前排单改个名字',sheet.name);
            if(name&&name.trim()){
              const nextName=name.trim(), matrixFollows=!sheetUsesCustomTitle(sheet,'matrixTitle'), quantityFollows=!sheetUsesCustomTitle(sheet,'quantityTitle'), paymentFollows=!sheetUsesCustomTitle(sheet,'paymentTitle');
              sheet.name=nextName;
              if(matrixFollows){ sheet.matrixTitle=nextName; sheet.matrixTitleCustom=false; matrixTitle=nextName; $('matrixTitleInput').value=nextName; renderMatrixHeading(); }
              if(quantityFollows){ sheet.quantityTitle=nextName; sheet.quantityTitleCustom=false; quantityTitle=nextName; $('quantityTitleInput').value=nextName; renderQuantitySummary(); }
              if(paymentFollows){ sheet.paymentTitle=nextName; sheet.paymentTitleCustom=false; paymentTitle=nextName; $('paymentTitleInput').value=nextName; renderPaymentSummary(); }
              saveState(); renderSheetTabs();
            }
          });
          $('mobileDeleteSheetBtn').addEventListener('click',()=>{
            if(sheets.length<=1){ alert('至少要保留一张排单'); return; }
            document.querySelector(`.sheet-tab[data-sheet="${activeSheetId}"] .sheet-close`)?.click();
          });
          setMobileSheetSortOpen(false);
          window.addEventListener('pageshow',()=>setMobileSheetSortOpen(false));
          $('mobileSortSheetBtn').addEventListener('click',()=>setMobileSheetSortOpen(true));
          $('mobileSheetSortDoneBtn').addEventListener('click',()=>setMobileSheetSortOpen(false));
          $('mobileSheetSortOverlay').addEventListener('click',e=>{
            if(e.target===$('mobileSheetSortOverlay')) setMobileSheetSortOpen(false);
          });
          $('mobileSheetSortList').addEventListener('click',e=>{
            const button=e.target.closest('[data-mobile-sort-offset]'); if(!button||button.disabled) return;
            const row=button.closest('[data-sort-sheet]'); if(!row) return;
            moveSheetByOffset(parseInt(row.dataset.sortSheet,10),parseInt(button.dataset.mobileSortOffset,10)||0);
            renderMobileSheetSort();
          });
          function syncMobileVisualViewport(){
            const visual=window.visualViewport,layoutHeight=Math.max(window.innerHeight,document.documentElement.clientHeight),visibleHeight=visual?.height||window.innerHeight,visibleBottom=(visual?.offsetTop||0)+visibleHeight;
            const keyboardOpen=window.innerWidth<=760&&visibleHeight<layoutHeight*.72;
            const browserBottomOffset=keyboardOpen?0:Math.min(90,Math.max(0,layoutHeight-visibleBottom));
            document.documentElement.style.setProperty('--browser-bottom-offset',browserBottomOffset+'px');
            document.documentElement.style.setProperty('--app-visible-height',visibleHeight+'px');
            document.body.classList.toggle('mobile-keyboard-open',keyboardOpen);
            if(!$('customSelectOverlay').hidden) closeCustomSelect();
          }
          if(window.visualViewport){ window.visualViewport.addEventListener('resize',syncMobileVisualViewport); window.visualViewport.addEventListener('scroll',syncMobileVisualViewport); }
          window.addEventListener('resize',syncMobileVisualViewport); syncMobileVisualViewport();
          document.addEventListener('visibilitychange',()=>{ if(document.visibilityState==='hidden'&&collabEnabled&&(collabNeedsSend||collabSendTimer)) flushCollabChanges(); });
          window.addEventListener('beforeunload',e=>{
            if(!collabEnabled||(!collabNeedsSend&&!collabSending&&!collabSendTimer)) return;
            e.preventDefault(); e.returnValue='';
          });
      
          $('parseBtn').addEventListener('click',()=>{
            clearMatrixPreview();
            const raw=$('commentInput').value;
            if(!raw.trim()){ alert('请先粘贴评论文字'); return; }
            const comments=splitComments(raw);
            previewRows=comments.map(c=>{
              const items=parseDemandText(c.demandText);
              const itemsText=items.map(i=>`${i.name}${i.qty}`).join('，');
              return {id:rowIdSeed++,person:c.person,itemsText:itemsText||c.demandText};
            });
            orderPreviewSignature=actionPreviewDataSignature();
            $('orderPreviewStatus').textContent='当前只显示模拟结果；确认追加后才会写入正式排单。'; $('orderPreviewStatus').style.color='';
            renderPreview();
            $('previewPanel').style.display=previewRows.length?'block':'none';
            $('transferPreviewPanel').style.display='none'; transferPreviewRows=[];
            $('cancelPreviewPanel').style.display='none'; cancelPreviewRows=[];
            $('coldPromotionPreviewPanel').style.display='none';
            if(previewRows.length) refreshOrderMatrixPreview();
            if(previewRows.length===0) alert('没有识别到任何评论，请检查粘贴的文字格式');
          });
          $('clearCommentBtn').addEventListener('click',()=>{
            $('commentInput').value=''; previewRows=[]; orderPreviewSignature=''; transferPreviewRows=[]; cancelPreviewRows=[]; clearMatrixPreview(); $('previewPanel').style.display='none'; $('transferPreviewPanel').style.display='none'; $('cancelPreviewPanel').style.display='none'; $('commentInput').focus();
          });
      
          $('generateBtn').addEventListener('click',()=>{
            if(!previewRows.length) return;
            const currentSignature=actionPreviewDataSignature();
            if(orderPreviewSignature&&orderPreviewSignature!==currentSignature){
              orderPreviewSignature=currentSignature; refreshOrderMatrixPreview('排单追加模拟结果（已刷新）');
              $('orderPreviewStatus').textContent='正式排单在预览后发生过变化，已刷新下方模拟结果，请核对后再次确认。';
              $('orderPreviewStatus').style.color='var(--warn)'; return;
            }
            if(!pushUndoSnapshot('order-append','追加排单前')) return;
            columns.forEach(c=>{ if(!Array.isArray(allocations[c.id])) allocations[c.id]=[]; });
            previewRows.forEach(row=>{
              const items=parseDemandText(row.itemsText);
              items.forEach(item=>{
                let col=findColumnByText(item.name);
                if(!col){ addColumn(item.name,[], 'avg',0,0); col=columns[columns.length-1]; allocations[col.id]=[]; }
                for(let i=0;i<item.qty;i++) allocations[col.id].push(row.person);
              });
            });
            saveState(); clearMatrixPreview(false); renderColumnList(); recalc();
            previewRows=[]; orderPreviewSignature=''; renderPreview(); $('previewPanel').style.display='none';
          });
          $('cancelOrderPreviewBtn').addEventListener('click',()=>{
            previewRows=[]; orderPreviewSignature=''; renderPreview(); $('previewPanel').style.display='none'; clearMatrixPreview();
          });
      
          $('regenBtn').addEventListener('click',renderMatrix);
          function knownPeople(){
            const seen=new Set(), result=[];
            columns.forEach(c=>(allocations[c.id]||[]).forEach(value=>{ const name=String(value||'').trim(); if(name&&!seen.has(name)){ seen.add(name); result.push(name); } }));
            return result.sort((a,b)=>b.length-a.length);
          }
          function mentionedColumn(text){
            const lower=text.toLowerCase(), candidates=[];
            columns.forEach(c=>[c.name,...(c.aliases||[])].forEach(label=>{ const name=String(label||'').trim(); if(name) candidates.push({col:c,label:name}); }));
            candidates.sort((a,b)=>b.label.length-a.label.length);
            for(const candidate of candidates){ const index=lower.indexOf(candidate.label.toLowerCase()); if(index>=0) return {...candidate,index}; }
            return null;
          }
          function cleanTransferName(text){ return String(text||'').replace(/^[\s给由从]+|[把\s，,。；;：:]+$/g,'').trim(); }
          function parseTransferLine(raw){
            let text=String(raw||'').trim(); if(!text) return null;
            const mention=mentionedColumn(text), people=knownPeople();
            let itemText=mention?mention.col.name:'', qty=1, rest=text;
            if(mention){
              let before=text.slice(0,mention.index), after=text.slice(mention.index+mention.label.length);
              const afterQty=after.match(/^\s*(?:[xX×*]\s*)?(\d+)/), beforeQty=before.match(/(\d+)\s*(?:[xX×*])?\s*$/);
              if(afterQty){ qty=Math.max(1,parseInt(afterQty[1],10)||1); after=after.slice(afterQty[0].length); }
              else if(beforeQty){ qty=Math.max(1,parseInt(beforeQty[1],10)||1); before=before.slice(0,before.length-beforeQty[0].length); }
              rest=(before+' '+after).replace(/[，,。；;：:]/g,' ').replace(/\s+/g,' ').trim();
            }
            let source='',target='', match=rest.match(/^(.+?)(?:转给|出给|给|到|->|→|➡)\s*(.+)$/);
            if(match){ source=match[1]; target=match[2]; }
            else{
              match=rest.match(/^(.+?)(?:转|出)\s*(?:给\s*)?(.+)$/);
              if(match){ source=match[1]; target=match[2]; }
            }
            source=cleanTransferName(source); target=cleanTransferName(target);
            const sourceKnown=people.find(name=>source.includes(name)), targetKnown=people.find(name=>target.includes(name));
            if(sourceKnown) source=sourceKnown; if(targetKnown) target=targetKnown;
            return {id:rowIdSeed++,source,itemText,qty,target,raw:text};
          }
          function transferRowCheck(row){
            const col=findColumnByText(row.itemText||''), source=String(row.source||'').trim(), target=String(row.target||'').trim(), qty=Math.max(1,parseInt(row.qty,10)||1);
            if(!source||!target) return {ok:false,text:'名字没识别全'};
            if(!col) return {ok:false,text:'没找到谷子'};
            const positions=(allocations[col.id]||[]).map((value,index)=>String(value||'').trim()===source?index:-1).filter(index=>index>=0), available=positions.length;
            if(!available) return {ok:false,text:`没有找到 ${source}`};
            if(available<qty) return {ok:false,text:`只找到 ${available} 个`};
            const affected=positions.slice(-qty).map(index=>index+1);
            return {ok:true,text:`第${affected.join('、')}行 → ${target}`,col,qty,positions:affected};
          }
          function renderTransferPreview(){
            $('transferPreviewTableBody').innerHTML=transferPreviewRows.map((row,index)=>{
              const check=transferRowCheck(row);
              return `<tr><td>${index+1}</td><td><input type="text" class="action-preview-input" data-transfer-id="${row.id}" data-transfer-field="source" value="${escapeAttr(row.source)}"></td><td><input type="text" class="action-preview-input" data-transfer-id="${row.id}" data-transfer-field="itemText" value="${escapeAttr(row.itemText)}"></td><td><input type="text" inputmode="numeric" pattern="[0-9]*" class="action-preview-input action-preview-qty" data-transfer-id="${row.id}" data-transfer-field="qty" value="${row.qty}"></td><td><input type="text" class="action-preview-input" data-transfer-id="${row.id}" data-transfer-field="target" value="${escapeAttr(row.target)}"></td><td class="${check.ok?'transfer-ok':'transfer-bad'}">${escapeHtml(check.text)}</td><td><button class="btn-danger btn-mini" data-remove-transfer="${row.id}">删除</button></td></tr>`;
            }).join('');
            $('confirmTransferBtn').disabled=!transferPreviewRows.length||transferPreviewRows.some(row=>!transferRowCheck(row).ok);
          }
          function buildTransferMatrixPreview(){
            const preview=deepClone(allocations);
            const transferCells=[];
            transferPreviewRows.forEach(row=>{
              const col=findColumnByText(row.itemText||''), source=String(row.source||'').trim(), target=String(row.target||'').trim(), qty=Math.max(1,parseInt(row.qty,10)||1);
              if(!col||!source||!target) return;
              const arr=preview[col.id]||(preview[col.id]=[]), positions=arr.map((value,index)=>String(value||'').trim()===source?index:-1).filter(index=>index>=0).slice(-qty);
              if(positions.length<qty) return;
              positions.forEach(index=>{ transferCells.push({col:col.id,row:index,from:source,to:target}); arr[index]=target; });
            });
            return {allocations:preview,highlights:{transferCells}};
          }
          function showTransferMatrixPreview(label='转单模拟结果'){
            const preview=buildTransferMatrixPreview(); showMatrixPreview(preview.allocations,label,preview.highlights);
          }
          $('transferPreviewBtn').addEventListener('click',()=>{
            const raw=$('commentInput').value.trim(); if(!raw){ alert('请先粘贴转单文字'); return; }
            transferPreviewRows=actionContentLines(raw).filter(line=>/(?:转给|出给|转|出|给|到|->|→|➡)/.test(line)).map(parseTransferLine).filter(Boolean);
            transferPreviewSignature=actionPreviewDataSignature();
            $('transferPreviewStatus').textContent='会从原 CN 最后一单开始向上修改。'; $('transferPreviewStatus').style.color='';
            renderTransferPreview(); $('previewPanel').style.display='none'; previewRows=[];
            $('transferPreviewPanel').style.display=transferPreviewRows.length?'block':'none';
            if(transferPreviewRows.length) showTransferMatrixPreview(); else clearMatrixPreview();
            $('cancelPreviewPanel').style.display='none'; cancelPreviewRows=[];
            $('coldPromotionPreviewPanel').style.display='none';
            if(!transferPreviewRows.length) alert('没有识别到转单内容');
          });
          $('transferPreviewTableBody').addEventListener('change',e=>{
            const input=e.target.closest('[data-transfer-id]'); if(!input) return;
            const row=transferPreviewRows.find(item=>item.id===parseInt(input.dataset.transferId,10)); if(!row) return;
            row[input.dataset.transferField]=input.dataset.transferField==='qty'?Math.max(1,parseInt(input.value,10)||1):input.value.trim(); renderTransferPreview(); showTransferMatrixPreview();
          });
          $('transferPreviewTableBody').addEventListener('click',e=>{
            const button=e.target.closest('[data-remove-transfer]'); if(!button) return;
            transferPreviewRows=transferPreviewRows.filter(row=>row.id!==parseInt(button.dataset.removeTransfer,10)); renderTransferPreview();
            if(transferPreviewRows.length) showTransferMatrixPreview(); else clearMatrixPreview();
          });
          $('confirmTransferBtn').addEventListener('click',()=>{
            const currentSignature=actionPreviewDataSignature();
            if(transferPreviewSignature&&transferPreviewSignature!==currentSignature){
              transferPreviewSignature=currentSignature; renderTransferPreview();
              showTransferMatrixPreview('转单模拟结果（已刷新）');
              $('transferPreviewStatus').textContent='正式排单在预览后发生过变化，已重新检查并刷新下方预览，请核对后再次确认。';
              $('transferPreviewStatus').style.color='var(--warn)'; $('transferPreviewPanel').scrollIntoView({behavior:'smooth',block:'start'}); return;
            }
            const checks=transferPreviewRows.map(row=>({row,check:transferRowCheck(row)}));
            if(!checks.length||checks.some(item=>!item.check.ok)){ alert('还有没识别清楚的转单，请先在预览里修改'); return; }
            if(!pushUndoSnapshot('transfer-apply','确认转单前')) return;
            let changedTotal=0;
            checks.forEach(({row,check})=>{
              const arr=allocations[check.col.id]||(allocations[check.col.id]=[]); let changed=0;
              for(let i=arr.length-1;i>=0&&changed<check.qty;i--){
                if(String(arr[i]||'').trim()===String(row.source||'').trim()){ arr[i]=String(row.target||'').trim(); changed++; }
              }
              changedTotal+=changed;
            });
            saveState(); clearMatrixPreview(false); renderMatrix(); $('commentInput').value=''; transferPreviewRows=[]; transferPreviewSignature=''; renderTransferPreview();
            $('transferPreviewStatus').textContent=`已完成 ${changedTotal} 个转单，均从原 CN 最后一单开始修改。`;
            $('transferPreviewStatus').style.color='var(--ok)';
          });
          $('cancelTransferPreviewBtn').addEventListener('click',()=>{
            transferPreviewRows=[]; transferPreviewSignature=''; renderTransferPreview();
            $('transferPreviewPanel').style.display='none'; clearMatrixPreview();
          });
          function parseCancelRows(raw){
            const rows=[];
            splitComments(raw).forEach(comment=>{
              const combined=(String(comment.person||'')+String(comment.demandText||'')).trim();
              const marker=combined.match(/撤单?|取消|不要/);
              if(!marker) return;
              const person=cleanPersonName(combined.slice(0,marker.index));
              const demand=combined.slice(marker.index+marker[0].length).replace(/^[掉了的\s，,、；;]+/,'').trim();
              if(!person||!demand) return;
              parseDemandText(demand).forEach(item=>rows.push({id:rowIdSeed++,person,itemText:item.name,qty:Math.max(1,item.qty||1)}));
            });
            return rows;
          }
          function cancelRowCheck(row,index){
            const col=findColumnByText(row.itemText||''), person=String(row.person||'').trim(), qty=Math.max(1,parseInt(row.qty,10)||1);
            if(!person) return {ok:false,text:'名字没识别到'};
            if(!col) return {ok:false,text:'没找到谷子'};
            const positions=(allocations[col.id]||[]).map((value,row)=>String(value||'').trim()===person?row:-1).filter(row=>row>=0), available=positions.length;
            const reserved=cancelPreviewRows.slice(0,index).reduce((sum,previous)=>{
              const previousCol=findColumnByText(previous.itemText||'');
              return previousCol&&previousCol.id===col.id&&String(previous.person||'').trim()===person?sum+Math.max(1,parseInt(previous.qty,10)||1):sum;
            },0);
            const remaining=Math.max(0,available-reserved);
            if(!available) return {ok:false,text:`没有找到 ${person}`};
            if(remaining<qty) return {ok:false,text:`只剩 ${remaining} 个可撤`};
            const availablePositions=positions.slice(0,Math.max(0,positions.length-reserved)), affected=availablePositions.slice(-qty).map(row=>row+1);
            return {ok:true,text:`将删除第${affected.join('、')}行`,col,qty,person,positions:affected};
          }
          function renderCancelPreview(){
            $('cancelPreviewTableBody').innerHTML=cancelPreviewRows.map((row,index)=>{
              const check=cancelRowCheck(row,index);
              return `<tr><td>${index+1}</td><td><input type="text" class="action-preview-input" data-cancel-id="${row.id}" data-cancel-field="person" value="${escapeAttr(row.person)}"></td><td><input type="text" class="action-preview-input" data-cancel-id="${row.id}" data-cancel-field="itemText" value="${escapeAttr(row.itemText)}"></td><td><input type="text" inputmode="numeric" pattern="[0-9]*" class="action-preview-input action-preview-qty" data-cancel-id="${row.id}" data-cancel-field="qty" value="${row.qty}"></td><td class="${check.ok?'transfer-ok':'transfer-bad'}">${escapeHtml(check.text)}</td><td><button class="btn-danger btn-mini" data-remove-cancel="${row.id}">删除</button></td></tr>`;
            }).join('');
            $('confirmCancelBtn').disabled=!cancelPreviewRows.length||cancelPreviewRows.some((row,index)=>!cancelRowCheck(row,index).ok);
          }
          function buildCancelMatrixPreview(){
            const preview=deepClone(allocations);
            const cancelRows=[];
            cancelPreviewRows.forEach(row=>{
              const col=findColumnByText(row.itemText||''), person=String(row.person||'').trim(), qty=Math.max(1,parseInt(row.qty,10)||1);
              if(!col||!person) return;
              const arr=preview[col.id]||(preview[col.id]=[]); let removed=0;
              for(let index=arr.length-1;index>=0&&removed<qty;index--){
                if(String(arr[index]||'').trim()===person){ cancelRows.push(index); arr.splice(index,1); removed++; }
              }
            });
            return {allocations:preview,highlights:{cancelRows:[...new Set(cancelRows)]}};
          }
          function showCancelMatrixPreview(label='撤单模拟结果'){
            const preview=buildCancelMatrixPreview(); showMatrixPreview(preview.allocations,label,preview.highlights);
          }
          $('cancelPreviewBtn').addEventListener('click',()=>{
            const raw=$('commentInput').value.trim(); if(!raw){ alert('请先粘贴撤单文字'); return; }
            cancelPreviewRows=parseCancelRows(raw);
            cancelPreviewSignature=actionPreviewDataSignature();
            $('cancelPreviewStatus').textContent='会从这个人在对应谷子的最后一单开始向前删除。'; $('cancelPreviewStatus').style.color='';
            renderCancelPreview(); $('previewPanel').style.display='none'; previewRows=[];
            $('transferPreviewPanel').style.display='none'; transferPreviewRows=[];
            $('cancelPreviewPanel').style.display=cancelPreviewRows.length?'block':'none';
            if(cancelPreviewRows.length) showCancelMatrixPreview(); else clearMatrixPreview();
            $('coldPromotionPreviewPanel').style.display='none';
            if(!cancelPreviewRows.length) alert('没有识别到撤单内容，请使用“谁 撤 谷子数量”的写法');
          });
          $('cancelPreviewTableBody').addEventListener('change',e=>{
            const input=e.target.closest('[data-cancel-id]'); if(!input) return;
            const row=cancelPreviewRows.find(item=>item.id===parseInt(input.dataset.cancelId,10)); if(!row) return;
            row[input.dataset.cancelField]=input.dataset.cancelField==='qty'?Math.max(1,parseInt(input.value,10)||1):input.value.trim(); renderCancelPreview(); showCancelMatrixPreview();
          });
          $('cancelPreviewTableBody').addEventListener('click',e=>{
            const button=e.target.closest('[data-remove-cancel]'); if(!button) return;
            cancelPreviewRows=cancelPreviewRows.filter(row=>row.id!==parseInt(button.dataset.removeCancel,10)); renderCancelPreview();
            if(cancelPreviewRows.length) showCancelMatrixPreview(); else clearMatrixPreview();
          });
          $('confirmCancelBtn').addEventListener('click',()=>{
            const currentSignature=actionPreviewDataSignature();
            if(cancelPreviewSignature&&cancelPreviewSignature!==currentSignature){
              cancelPreviewSignature=currentSignature; renderCancelPreview();
              showCancelMatrixPreview('撤单模拟结果（已刷新）');
              $('cancelPreviewStatus').textContent='正式排单在预览后发生过变化，已重新检查并刷新下方预览，请核对后再次确认。';
              $('cancelPreviewStatus').style.color='var(--warn)'; $('cancelPreviewPanel').scrollIntoView({behavior:'smooth',block:'start'}); return;
            }
            const checks=cancelPreviewRows.map((row,index)=>({row,check:cancelRowCheck(row,index)}));
            if(!checks.length||checks.some(item=>!item.check.ok)){ alert('还有没识别清楚的撤单，请先在预览里修改'); return; }
            if(!pushUndoSnapshot('cancel-apply','确认撤单前')) return;
            let removedTotal=0;
            checks.forEach(({check})=>{
              const arr=allocations[check.col.id]||(allocations[check.col.id]=[]); let removed=0;
              for(let i=arr.length-1;i>=0&&removed<check.qty;i--){
                if(String(arr[i]||'').trim()===check.person){ arr.splice(i,1); removed++; }
              }
              removedTotal+=removed;
            });
            saveState(); clearMatrixPreview(false); renderMatrix(); $('commentInput').value=''; cancelPreviewRows=[]; cancelPreviewSignature=''; renderCancelPreview();
            $('cancelPreviewStatus').textContent=`已撤掉 ${removedTotal} 个，均从对应谷子的最后一单开始删除。`;
            $('cancelPreviewStatus').style.color='var(--ok)';
          });
          $('cancelCancelPreviewBtn').addEventListener('click',()=>{
            cancelPreviewRows=[]; cancelPreviewSignature=''; renderCancelPreview();
            $('cancelPreviewPanel').style.display='none'; clearMatrixPreview();
          });
          function parsePromotionCandidates(raw){
            const people=knownPeople();
            return splitComments(raw).map((comment,order)=>{
              let person=String(comment.person||'').trim(), demand=String(comment.demandText||'').trim();
              if(!/[带提]/.test(demand)) return null;
              if(!person){
                const known=people.find(name=>demand.startsWith(name));
                if(known){ person=known; demand=demand.slice(known.length).trim(); }
              }
              const marker=demand.match(/可以带|可以提|可带|可提|带|提/); if(!marker) return null;
              const leftText=demand.slice(0,marker.index).replace(/[：:\s，,、；;]+$/,'').trim();
              const rightText=demand.slice(marker.index+marker[0].length).replace(/^[：:\s，,、；;]+/,'').trim();
              return buildPromotionCandidate(person,leftText,rightText,order);
            }).filter(Boolean);
          }
          function buildPromotionCandidate(person,leftText,rightText,order){
              const left=parseDemandText(leftText), right=parseDemandText(rightText), errors=[];
              if(!person) errors.push('没有识别到 CN');
              if(!left.length) errors.push('“带”左边没有识别到原谷子');
              if(!right.length) errors.push('“带”右边没有识别到新增谷子');
              const leftItems=left.map(item=>({col:findColumnByText(item.name),name:item.name,qty:Math.max(1,item.qty||1)}));
              const rightItems=right.map(item=>({col:findColumnByText(item.name),name:item.name,qty:Math.max(1,item.qty||1)}));
              leftItems.filter(item=>!item.col).forEach(item=>errors.push(`没找到原谷子“${item.name}”`));
              rightItems.filter(item=>!item.col).forEach(item=>errors.push(`没找到带物“${item.name}”`));
              return {order,person,leftText,rightText,leftItems,rightItems,errors};
          }
          function mergeColdDemandText(first,second,useMaximum=false){
            const merged=new Map();
            [...parseDemandText(first),...parseDemandText(second)].forEach(item=>{
              const key=String(item.name||'').replace(/\s+/g,'').toLowerCase(); if(!key) return;
              const qty=Math.max(1,Number(item.qty)||1);
              if(!merged.has(key)) merged.set(key,{name:item.name,qty:useMaximum?qty:0});
              if(useMaximum) merged.get(key).qty=Math.max(merged.get(key).qty,qty); else merged.get(key).qty+=qty;
            });
            return [...merged.values()].map(item=>`${item.name}${item.qty}`).join('，');
          }
          function coldDemandShape(text){ return parseDemandText(text).map(item=>String(item.name||'').replace(/\s+/g,'').toLowerCase()).filter(Boolean).sort().join('|'); }
          function appendColdPromotionCandidate(candidate){
            const person=String(candidate.person||'').trim(), leftShape=coldDemandShape(candidate.leftText);
            const existing=coldPromotionDraftRows.find(row=>String(row.person||'').trim()===person&&coldDemandShape(row.leftText)===leftShape);
            if(existing){ existing.leftText=mergeColdDemandText(existing.leftText,candidate.leftText,true); existing.rightText=mergeColdDemandText(existing.rightText,candidate.rightText); return existing; }
            const suppliedId=Number(candidate.id), row={id:Number.isFinite(suppliedId)&&suppliedId>0?suppliedId:rowIdSeed++,person,leftText:candidate.leftText,rightText:candidate.rightText}; coldPromotionDraftRows.push(row); return row;
          }
          function consolidateColdPromotionDraftRows(){
            if(coldPromotionDraftRows.length<2) return;
            const source=coldPromotionDraftRows.map(row=>({id:row.id,person:row.person,leftText:row.leftText,rightText:row.rightText}));
            coldPromotionDraftRows=[];
            source.forEach(row=>appendColdPromotionCandidate(row));
          }
          function migrateLegacyColdPromotionDraft(){
            if(!coldPromotionDraftBaseAllocations&&coldPromotionSeriesBaseAllocations) coldPromotionDraftBaseAllocations=deepClone(coldPromotionSeriesBaseAllocations);
            if(!coldPromotionDraftRows.length&&coldPromotionBatches.length){
              coldPromotionBatches.forEach(oldRaw=>parsePromotionCandidates(oldRaw).forEach(appendColdPromotionCandidate));
            }
            if(coldPromotionDraftRows.length&&!coldPromotionDraftBaseAllocations&&activeSheetId!=null){
              const history=Array.isArray(undoHistoryBySheet[String(activeSheetId)])?undoHistoryBySheet[String(activeSheetId)]:[];
              const previous=[...history].reverse().find(entry=>entry&&entry.actionType==='cold-carry-apply'&&entry.sheet&&entry.sheet.allocations);
              if(previous) coldPromotionDraftBaseAllocations=deepClone(previous.sheet.allocations);
            }
            if(coldPromotionDraftRows.length&&!coldPromotionDraftBaseAllocations&&!coldPromotionDraftApplied) coldPromotionDraftBaseAllocations=deepClone(allocations);
            consolidateColdPromotionDraftRows();
            coldPromotionBatches=[]; coldPromotionSeriesBaseAllocations=null; coldPromotionSeriesBaseHighlights=null; coldPromotionSeriesFormalSignature='';
          }
          function parseColdPromotionCandidates(){
            const parsed=coldPromotionDraftRows.map((row,order)=>buildPromotionCandidate(String(row.person||'').trim(),String(row.leftText||'').trim(),String(row.rightText||'').trim(),order));
            const merged=[], byPerson=new Map();
            parsed.forEach(candidate=>{
              const key=candidate.person?candidate.person:`__missing_${candidate.order}`;
              let target=byPerson.get(key);
              if(!target){
                target={order:candidate.order,person:candidate.person,leftItems:[],rightItems:[],errors:[]};
                byPerson.set(key,target); merged.push(target);
              }
              target.errors.push(...candidate.errors);
              const addItems=(dest,items)=>items.forEach(item=>{
                const key=item.col?`c${item.col.id}`:`n${item.name}`;
                const old=dest.find(entry=>entry.key===key);
                if(old) old.qty+=item.qty;
                else dest.push({...item,key});
              });
              addItems(target.leftItems,candidate.leftItems);
              addItems(target.rightItems,candidate.rightItems);
            });
            merged.forEach(candidate=>{ candidate.errors=[...new Set(candidate.errors)]; });
            return merged;
          }
          function normalizeColdCarryScore(value){
            const number=Number(value); return Number.isFinite(number)?Number(number.toFixed(4)):0;
          }
          function buildColdPromotionPlan(baseAllocations=allocations){
            const candidates=parseColdPromotionCandidates(), bundleColumns=activeBundleColumns();
            const bundleColumnIds=new Set(bundleColumns.map(col=>col.id));
            const maxRows=Math.max(0,...columns.map(c=>(baseAllocations[c.id]||[]).length));
            const sim={}, displacementPool=new Map(), claimed=new Set(), lockedRows=new Set(), rows=[];
            let uidSeed=1, resourceSeed=1, originalOrder=1;
            columns.forEach(c=>{
              displacementPool.set(c.id,[]);
              const source=baseAllocations[c.id]||[];
              sim[c.id]=Array.from({length:maxRows},(_,row)=>{
                const name=String(source[row]||'').trim();
                return name?{uid:`o${uidSeed++}`,name,columnId:c.id,originalRow:row,originalOrder:originalOrder++,source:'original'}:null;
              });
            });
            const tokenRow=resource=>(sim[resource.col.id]||[]).findIndex(token=>token&&token.uid===resource.uid);
            const rowHasBundle=row=>bundleColumns.length>0&&bundleColumns.every(col=>sim[col.id]&&sim[col.id][row]);
            for(let row=0;row<maxRows;row++) if(rowHasBundle(row)) lockedRows.add(row);
            candidates.forEach(candidate=>{
              candidate.resources=[]; candidate.rightRemaining=new Map();
              candidate.leftTotal=candidate.leftItems.reduce((sum,item)=>sum+Math.max(0,Number(item.qty)||0),0);
              candidate.rightPointTotal=candidate.rightItems.reduce((sum,item)=>{
                const point=item.col&&Number.isFinite(Number(item.col.promotionPoints))?Math.max(0,Number(item.col.promotionPoints)):1;
                return sum+Math.max(0,Number(item.qty)||0)*point;
              },0);
              candidate.kValue=normalizeColdCarryScore(candidate.leftTotal>0?candidate.rightPointTotal/candidate.leftTotal:0);
              candidate.scoreLabel=fmtPoint(candidate.kValue);
              candidate.hasFixed=candidate.rightItems.some(item=>item.col&&item.col.mode==='fixed');
              candidate.leftColumnIds=new Set(candidate.leftItems.filter(item=>item.col).map(item=>item.col.id));
              candidate.leftItems.forEach(item=>{
                if(!item.col) return;
                const matches=(sim[item.col.id]||[]).map((token,row)=>({token,row})).filter(entry=>entry.token&&entry.token.name===candidate.person&&!lockedRows.has(entry.row)&&!claimed.has(entry.token.uid));
                const chosen=matches.slice(-item.qty);
                chosen.forEach(entry=>{ claimed.add(entry.token.uid); candidate.resources.push({id:resourceSeed++,col:item.col,uid:entry.token.uid,used:false}); });
                if(chosen.length<item.qty) candidate.errors.push(`${item.col.name} 未找到足够的可前移位置`);
              });
              candidate.rightItems.forEach(item=>{ if(item.col) candidate.rightRemaining.set(item.col.id,(candidate.rightRemaining.get(item.col.id)||0)+item.qty); });
            });
            const poolAvailable=colId=>(displacementPool.get(colId)||[]).filter(item=>!item.used);
            const requiredFor=candidate=>bundleColumns.filter(col=>!candidate.leftColumnIds.has(col.id));
            const candidateHasFatalError=candidate=>candidate.errors.some(error=>/^没找到|没有识别|未找到/.test(error));
            const laterCarryDonors=(candidate,col)=>candidates.filter(other=>other!==candidate&&other.order>candidate.order&&!candidateHasFatalError(other)&&other.resources.some(resource=>!resource.used)&&(other.rightRemaining.get(col.id)||0)>0).sort((a,b)=>a.order-b.order);
            const hasLaterCarry=(candidate,col)=>laterCarryDonors(candidate,col).length>0;
            function qualification(candidate){
              const required=requiredFor(candidate), own=new Set(required.filter(col=>(candidate.rightRemaining.get(col.id)||0)>0).map(col=>col.id));
              const missing=required.filter(col=>!own.has(col.id));
              if(!missing.length) return {grade:'A',rank:3,missing};
              if(missing.every(col=>hasLaterCarry(candidate,col)||poolAvailable(col.id).length>0)) return {grade:'B',rank:2,missing};
              return {grade:'C',rank:1,missing};
            }
            function findTarget(resource){
              const source=tokenRow(resource); if(source<=0) return null;
              for(let row=0;row<source;row++) if(!lockedRows.has(row)) return row;
              return null;
            }
            function better(proposal,best){
              if(!best) return true;
              if(proposal.candidate.kValue!==best.candidate.kValue) return proposal.candidate.kValue>best.candidate.kValue;
              if(proposal.qualification.rank!==best.qualification.rank) return proposal.qualification.rank>best.qualification.rank;
              if(proposal.candidate.order!==best.candidate.order) return proposal.candidate.order<best.candidate.order;
              return proposal.resource.id<best.resource.id;
            }
            function moveOriginal(resource,target){
              const arr=sim[resource.col.id], source=tokenRow(resource), positions=[];
              for(let row=target;row<=source;row++) if(!lockedRows.has(row)) positions.push(row);
              if(source<0||positions[0]!==target||positions[positions.length-1]!==source) return null;
              const moving=arr[source], blankIndex=positions.slice(0,-1).findIndex(row=>!arr[row]);
              if(blankIndex>=0){
                for(let i=blankIndex;i>0;i--) arr[positions[i]]=arr[positions[i-1]];
                arr[target]=moving; arr[source]=null;
              }else{
                const old=positions.map(row=>arr[row]);
                for(let i=positions.length-1;i>0;i--) arr[positions[i]]=old[i-1];
                arr[target]=moving;
              }
              return {source,target};
            }
            function addToPool(col,token,displacedAt){
              if(!token) return;
              const minRow=Number.isFinite(displacedAt)?Math.max(Number(token.minRow)||0,displacedAt+1):Math.max(Number(token.minRow)||0,Number(token.originalRow)||0);
              displacementPool.get(col.id).push({...token,columnId:col.id,source:'displaced',minRow,used:false});
              displacementPool.get(col.id).sort((a,b)=>a.originalOrder-b.originalOrder);
            }
            function takePool(col){
              const token=poolAvailable(col.id)[0]; if(token) token.used=true; return token||null;
            }
            function takeLaterCarry(candidate,col){
              const donor=laterCarryDonors(candidate,col)[0];
              if(!donor) return null;
              donor.rightRemaining.set(col.id,(donor.rightRemaining.get(col.id)||0)-1);
              return applicantToken(donor,col);
            }
            function fillNextEmpty(col,target,token){
              const arr=sim[col.id]; let row=Math.max(0,target);
              while(row<arr.length&&arr[row]) row++;
              while(arr.length<row) arr.push(null);
              if(row===arr.length) arr.push(token); else arr[row]=token;
              return row;
            }
            function applicantToken(candidate,col){
              return {uid:`n${uidSeed++}`,name:candidate.person,columnId:col.id,originalRow:Number.MAX_SAFE_INTEGER,originalOrder:originalOrder++,source:'added'};
            }
            while(true){
              let best=null;
              candidates.forEach(candidate=>{
                if(candidateHasFatalError(candidate)) return;
                candidate.resources.forEach(resource=>{
                  if(resource.used) return;
                  const target=findTarget(resource); if(target==null) return;
                  const proposal={candidate,resource,target,qualification:qualification(candidate)};
                  if(better(proposal,best)) best=proposal;
                });
              });
              if(!best) break;
              const {candidate,resource,target,qualification:q}=best, move=moveOriginal(resource,target);
              resource.used=true; if(!move) continue;
              const required=requiredFor(candidate), ownCols=required.filter(col=>(candidate.rightRemaining.get(col.id)||0)>0);
              const missingCols=required.filter(col=>!ownCols.some(own=>own.id===col.id));
              const borrowed=new Map();
              missingCols.forEach(col=>{
                const laterToken=takeLaterCarry(candidate,col);
                if(laterToken){ borrowed.set(col.id,{token:laterToken,source:'later'}); return; }
                const poolToken=takePool(col); if(poolToken) borrowed.set(col.id,{token:poolToken,source:'original'});
              });
              required.forEach(col=>{
                const existing=sim[col.id][target]; if(existing) addToPool(col,existing,target);
                if(ownCols.some(own=>own.id===col.id)){
                  sim[col.id][target]=applicantToken(candidate,col);
                  candidate.rightRemaining.set(col.id,(candidate.rightRemaining.get(col.id)||0)-1);
                }else{
                  let fill=borrowed.get(col.id)?.token||null;
                  if(!fill&&q.grade==='C'){
                    fill=takePool(col);
                    if(fill) borrowed.set(col.id,{token:fill,source:'original'});
                  }
                  sim[col.id][target]=fill;
                }
              });
              const candidateOrdinaryColumnIds=new Set(candidate.rightItems.filter(item=>item.col&&item.col.mode!=='fixed'&&!bundleColumnIds.has(item.col.id)&&!candidate.leftColumnIds.has(item.col.id)).map(item=>item.col.id));
              columns.filter(col=>candidateOrdinaryColumnIds.has(col.id)).forEach(col=>{
                const existing=sim[col.id][target]; if(existing) addToPool(col,existing,target);
                sim[col.id][target]=null;
                if((candidate.rightRemaining.get(col.id)||0)>0){
                  sim[col.id][target]=applicantToken(candidate,col);
                  candidate.rightRemaining.set(col.id,(candidate.rightRemaining.get(col.id)||0)-1);
                }
              });
              lockedRows.add(target);
              const stillMissing=required.filter(col=>!sim[col.id][target]);
              const usedBorrowed=[...borrowed.values()].length>0, usedLater=[...borrowed.values()].some(item=>item.source==='later'), usedOriginalBorrowed=[...borrowed.values()].some(item=>item.source==='original');
              const baseResult=stillMissing.length?'待补':(q.grade==='A'?'自带满配':'顺延成配'), resultParts=[baseResult];
              if(usedLater) resultParts.push('后续带冷');
              if(stillMissing.length&&usedBorrowed&&!usedLater) resultParts.push('顺延');
              if(candidate.hasFixed) resultParts.push('入均');
              rows.push({ok:true,candidateOrder:candidate.order,person:candidate.person,scoreLabel:candidate.scoreLabel,move:`第${move.source+1}配 → 第${move.target+1}配`,added:candidate.rightItems.filter(item=>item.col).map(item=>item.col.name).filter((name,index,list)=>list.indexOf(name)===index).join('、')||'—',result:resultParts.join(' + '),grade:q.grade,targetRow:target,requiredColumnIds:required.map(col=>col.id),bundleComplete:stillMissing.length===0,usedLater,usedOriginalBorrowed,hasFixed:candidate.hasFixed});
            }
            candidates.forEach(candidate=>{
              const failedResult=candidate.hasFixed?'无法前移 + 入均':'无法前移';
              candidate.resources.filter(resource=>!resource.used).forEach(()=>rows.push({ok:false,candidateOrder:candidate.order,person:candidate.person||'未识别',scoreLabel:candidate.scoreLabel||'0',move:'—',added:candidate.rightItems.filter(item=>item.col).map(item=>item.col.name).join('、')||'—',result:failedResult,grade:'C'}));
              if(!candidate.resources.length) rows.push({ok:false,candidateOrder:candidate.order,person:candidate.person||'未识别',scoreLabel:candidate.scoreLabel||'0',move:'—',added:candidate.rightItems.filter(item=>item.col).map(item=>item.col.name).join('、')||'—',result:failedResult,grade:'C'});
            });
            columns.forEach(col=>{
              poolAvailable(col.id).sort((a,b)=>a.originalOrder-b.originalOrder).forEach(token=>{
                const arr=sim[col.id]; let row=Math.max(0,Math.min(Number.isFinite(token.minRow)?token.minRow:token.originalRow,arr.length));
                while(row<arr.length&&arr[row]) row++;
                if(row===arr.length) arr.push(token); else arr[row]=token;
                token.used=true;
              });
            });
            let fixedApplied=0;
            [...candidates].sort((a,b)=>a.order-b.order).forEach(candidate=>{
              candidate.rightItems.filter(item=>item.col&&item.col.mode==='fixed').forEach(item=>{
                for(let count=0;count<item.qty;count++){
                  fillNextEmpty(item.col,0,applicantToken(candidate,item.col)); fixedApplied++;
                }
              });
            });
            rows.filter(row=>row.ok).forEach(row=>{
              row.bundleComplete=(row.requiredColumnIds||[]).every(colId=>!!sim[colId]?.[row.targetRow]);
              const resultParts=[row.bundleComplete?(row.grade==='A'&&!row.usedLater&&!row.usedOriginalBorrowed?'自带满配':'顺延成配'):'待补'];
              if(row.usedLater) resultParts.push('后续带冷');
              if(!row.bundleComplete&&row.usedOriginalBorrowed) resultParts.push('顺延');
              if(row.hasFixed) resultParts.push('入均');
              row.result=resultParts.join(' + ');
            });
            const finalAllocations={};
            columns.forEach(c=>{ const arr=(sim[c.id]||[]).map(token=>token?token.name:''); trimTail(arr); finalAllocations[c.id]=arr; });
            return {rows,allocations:rows.some(row=>row.ok)||fixedApplied>0?finalAllocations:null,candidateCount:candidates.length,fixedApplied};
          }
          function renderColdPromotionDraft(){
            const locked=coldPromotionDraftApplied?' readonly tabindex="-1"':'';
            $('coldPromotionDraftTableBody').innerHTML=coldPromotionDraftRows.map((row,index)=>`<tr><td>${index+1}</td><td><input type="text" class="action-preview-input" data-cold-draft-id="${row.id}" data-cold-draft-field="person" value="${escapeAttr(row.person)}"${locked}></td><td><input type="text" class="action-preview-input" data-cold-draft-id="${row.id}" data-cold-draft-field="leftText" value="${escapeAttr(row.leftText)}"${locked}></td><td><input type="text" class="action-preview-input" data-cold-draft-id="${row.id}" data-cold-draft-field="rightText" value="${escapeAttr(row.rightText)}"${locked}></td><td><button class="btn-danger btn-mini" data-remove-cold-draft="${row.id}"${coldPromotionDraftApplied?' disabled':''}>删除</button></td></tr>`).join('');
          }
          function renderColdPromotionPreview(){
            renderColdPromotionDraft();
            $('coldPromotionPreviewTableBody').innerHTML=coldPromotionPreviewRows.map(row=>`<tr><td>${escapeHtml(row.person)}</td><td class="promotion-score">${escapeHtml(row.scoreLabel)}</td><td>${escapeHtml(row.move)}</td><td>${escapeHtml(row.added)}</td><td class="${row.ok?'transfer-ok':'transfer-bad'}">${escapeHtml(row.result)}</td></tr>`).join('');
            $('confirmColdPromotionBtn').disabled=!coldPromotionPreviewAllocations||coldPromotionDraftApplied;
          }
          // ============================================================
          // 带冷提配计算与预览
          // ============================================================
          function recalculateColdPromotionPreview(statusText){
            const plan=buildColdPromotionPlan(coldPromotionDraftBaseAllocations||allocations);
            coldPromotionPreviewRows=plan.rows; coldPromotionPreviewAllocations=plan.allocations; coldPromotionPlanRevision=localRevision; coldPromotionPlanSignature=coldPreviewDataSignature();
            renderColdPromotionPreview(); $('coldPromotionPreviewPanel').style.display=coldPromotionDraftRows.length?'block':'none';
            const highlights={completeRows:coldPromotionPreviewRows.filter(row=>row.ok&&row.bundleComplete).map(row=>row.targetRow),pendingRows:coldPromotionPreviewRows.filter(row=>row.ok&&!row.bundleComplete).map(row=>({row:row.targetRow,person:row.person}))};
            if(coldPromotionPreviewAllocations) showMatrixPreview(coldPromotionPreviewAllocations,'带冷提重排模拟结果',highlights); else clearMatrixPreview();
            const peopleCount=parseColdPromotionCandidates().length;
            $('coldPromotionPreviewStatus').textContent=statusText||`已保存 ${coldPromotionDraftRows.length} 条、合计 ${peopleCount} 人；内容会保留到手动清除。`;
            $('coldPromotionPreviewStatus').style.color=coldPromotionPreviewAllocations?'':'var(--bad)'; return plan;
          }
          function startColdPromotionPreview(){
            if(!activeBundleColumns().length){ openColdBundleChooser(true); return; }
            const raw=$('commentInput').value.trim();
            migrateLegacyColdPromotionDraft();
            if(raw){
              if(coldPromotionDraftApplied){ alert('这份带冷提已经正式应用。请先清除旧内容，再开始下一份带冷提。'); return; }
              if(!parsePromotionCandidates(raw).length){ alert('这一批没有识别到“原谷子 带/提 新增谷子”的内容，尚未加入带冷提草稿'); return; }
              if(!coldPromotionDraftRows.length&&!coldPromotionDraftBaseAllocations) coldPromotionDraftBaseAllocations=deepClone(allocations);
              parsePromotionCandidates(raw).forEach(appendColdPromotionCandidate);
              $('commentInput').value=''; saveState();
            }else if(!coldPromotionDraftRows.length){ alert('请先粘贴带冷提文字'); return; }
            if(coldPromotionDraftApplied){
              coldPromotionPreviewRows=[]; coldPromotionPreviewAllocations=null; renderColdPromotionPreview(); $('coldPromotionPreviewPanel').style.display='block'; clearMatrixPreview();
              $('coldPromotionPreviewStatus').textContent='这份带冷提已经应用，内容仍会保留；可以导出正式排单，清除后再开始下一份。'; $('coldPromotionPreviewStatus').style.color='var(--ok)'; return;
            }
            recalculateColdPromotionPreview();
            $('previewPanel').style.display='none'; previewRows=[];
            $('transferPreviewPanel').style.display='none'; transferPreviewRows=[];
            $('cancelPreviewPanel').style.display='none'; cancelPreviewRows=[];
          }
          $('coldPromotionPreviewBtn').addEventListener('click',startColdPromotionPreview);
          $('exportColdPromotionPreviewBtn').addEventListener('click',()=>{
            if(!coldPromotionDraftRows.length){ alert('还没有带冷提内容'); return; }
            if(!coldPromotionDraftApplied){
              recalculateColdPromotionPreview('预览图已准备好；导出的只是模拟结果，不会修改正式排单。');
              if(!coldPromotionPreviewAllocations){ alert('当前内容没有可以导出的重排结果'); return; }
            }else{ clearMatrixPreview(false); renderMatrix(); }
            $('exportPngBtn').click();
          });
          $('coldPromotionDraftTableBody').addEventListener('change',e=>{
            const input=e.target.closest('[data-cold-draft-id]'); if(!input||coldPromotionDraftApplied) return;
            const row=coldPromotionDraftRows.find(item=>item.id===parseInt(input.dataset.coldDraftId,10)); if(!row) return;
            row[input.dataset.coldDraftField]=input.value.trim(); consolidateColdPromotionDraftRows(); saveState(); recalculateColdPromotionPreview();
          });
          $('coldPromotionDraftTableBody').addEventListener('click',e=>{
            const button=e.target.closest('[data-remove-cold-draft]'); if(!button||coldPromotionDraftApplied) return;
            coldPromotionDraftRows=coldPromotionDraftRows.filter(row=>row.id!==parseInt(button.dataset.removeColdDraft,10));
            if(!coldPromotionDraftRows.length) coldPromotionDraftBaseAllocations=null; saveState();
            if(coldPromotionDraftRows.length) recalculateColdPromotionPreview(); else{ coldPromotionPreviewRows=[]; coldPromotionPreviewAllocations=null; renderColdPromotionPreview(); clearMatrixPreview(); }
          });
          $('confirmColdPromotionBtn').addEventListener('click',()=>{
            if(coldPromotionDraftApplied){ alert('这份带冷提已经应用过了；如需开始新一轮，请先清除带冷提内容。'); return; }
            if(!coldPromotionPreviewAllocations){ alert('当前带冷提草稿没有可以前移的项目'); return; }
            if(coldPromotionPlanSignature!==coldPreviewDataSignature()){
              recalculateColdPromotionPreview('正式排单在预览后发生过变化，已按最新排单刷新预览，请重新核对后再确认。');
              $('coldPromotionPreviewStatus').style.color='var(--warn)'; $('coldPromotionPreviewPanel').scrollIntoView({behavior:'smooth',block:'start'}); return;
            }
            if(!pushUndoSnapshot('cold-carry-apply','带冷提确认应用前')) return;
            const before=deepClone(allocations), beforeHighlights=deepClone(coldPromotionHighlights), applied=coldPromotionPreviewRows.filter(row=>row.ok).length;
            allocations=deepClone(coldPromotionPreviewAllocations);
            const nextComplete=new Set([...(coldPromotionHighlights.completeRows||[]),...coldPromotionPreviewRows.filter(row=>row.ok&&row.bundleComplete).map(row=>Number(row.targetRow))]);
            const pendingMap=new Map((coldPromotionHighlights.pendingRows||[]).map(item=>[`${Number(item.row)}:${String(item.person||'')}`,{row:Number(item.row),person:String(item.person||'')}]))
            coldPromotionPreviewRows.filter(row=>row.ok&&!row.bundleComplete).forEach(row=>pendingMap.set(`${Number(row.targetRow)}:${String(row.person||'')}`,{row:Number(row.targetRow),person:String(row.person||'')}));
            coldPromotionHighlights={completeRows:[...nextComplete].sort((a,b)=>a-b),pendingRows:[...pendingMap.values()].filter(item=>!nextComplete.has(item.row))};
            coldPromotionDraftApplied=true;
            if(!saveState()){
              allocations=before; coldPromotionHighlights=beforeHighlights; coldPromotionDraftApplied=false; saveState(); renderMatrix();
              alert('正式排单保存失败，已自动恢复应用前状态，撤回快照仍然保留。'); return;
            }
            coldPromotionPreviewAllocations=null; coldPromotionPlanRevision=-1; coldPromotionPlanSignature='';
            clearMatrixPreview(false); renderMatrix(); renderColdPromotionPreview();
            $('coldPromotionPreviewStatus').textContent=`已正式应用 ${applied} 项；带冷提内容仍会保留，清除前不会消失。`;
            $('coldPromotionPreviewStatus').style.color='var(--ok)'; $('confirmColdPromotionBtn').disabled=true;
          });
          $('clearColdPromotionBtn').addEventListener('click',()=>{
            if(coldPromotionDraftRows.length&&!confirm('确定清除这份带冷提内容吗？清除后不能恢复。')) return;
            coldPromotionDraftRows=[]; coldPromotionDraftApplied=false; coldPromotionDraftBaseAllocations=null; coldPromotionBatches=[]; coldPromotionSeriesBaseAllocations=null; coldPromotionSeriesBaseHighlights=null; coldPromotionSeriesFormalSignature=''; coldPromotionPreviewRows=[]; coldPromotionPreviewAllocations=null; coldPromotionPlanRevision=-1; coldPromotionPlanSignature=''; saveState();
            renderColdPromotionPreview(); $('coldPromotionPreviewPanel').style.display='none'; clearMatrixPreview();
            $('coldPromotionPreviewStatus').textContent='带冷提内容已清除。'; $('coldPromotionPreviewStatus').style.color='';
          });
          function applyQuantitySettings(){
            const boxText=String($('boxSizeInput').value||'').trim(), stepText=String($('groupSizeInput').value||'').trim();
            const nextBox=boxText?parseInt(boxText,10):null, nextStep=stepText?parseInt(stepText,10):null;
            if((boxText&&(!Number.isFinite(nextBox)||nextBox<1))||(stepText&&(!Number.isFinite(nextStep)||nextStep<1))){ syncQuantityControlLabels(); return; }
            boxSize=nextBox; groupSize=nextStep;
            const markValue=parseInt($('completeMultipleInput').value,10);
            completeMultiple=Number.isFinite(markValue)?Math.max(1,markValue):null;
            quantityConfigured=!!(boxSize||groupSize||completeMultiple);
            $('boxSizeInput').value=boxSize||''; $('groupSizeInput').value=groupSize||''; $('completeMultipleInput').value=completeMultiple||'';
            syncQuantityControlLabels(); saveState(); renderMatrix();
          }
          function syncQuantityControlLabels(){
            $('editBoxSizeBtn').textContent=boxSize?String(boxSize):'';
            $('editGroupSizeBtn').textContent=groupSize?String(groupSize):'';
            $('editCompleteMultipleBtn').textContent=completeMultiple?String(completeMultiple):'';
          }
          function commitQuantityEditor(editorId,inputId,allowBlank){
            const editor=$(editorId), text=String(editor.textContent||'').replace(/[^0-9]/g,'').trim();
            if(allowBlank&&!text) $(inputId).value='';
            else{
              const parsed=parseInt(text,10); if(!Number.isFinite(parsed)||parsed<1){ syncQuantityControlLabels(); return; }
              $(inputId).value=String(parsed);
            }
            applyQuantitySettings();
          }
          [['editBoxSizeBtn','boxSizeInput',true],['editGroupSizeBtn','groupSizeInput',true],['editCompleteMultipleBtn','completeMultipleInput',true]].forEach(([editorId,inputId,allowBlank])=>{
            const editor=$(editorId);
            editor.addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); editor.blur(); } });
            editor.addEventListener('blur',()=>commitQuantityEditor(editorId,inputId,allowBlank));
          });
          $('quantitySummary').addEventListener('click',e=>{
            const button=e.target.closest('[data-highlight-person]'); if(!button) return;
            const name=button.dataset.highlightPerson||'';
            highlightedPerson=highlightedPerson===name?'':name;
            renderQuantitySummary(); applyPersonHighlight(!!highlightedPerson);
          });
      
          // ---------- drag-drop names (fix misrecognition) ----------
          function trimTail(arr){ while(arr.length&&(arr[arr.length-1]===''||arr[arr.length-1]==null)) arr.pop(); }
          function swapAlloc(a,b){
            if(a.col===b.col&&a.row===b.row) return;
            if(!pushUndoSnapshot('cell-move','移动排单人员前')) return;
            const A=allocations[a.col]||(allocations[a.col]=[]);
            const B=allocations[b.col]||(allocations[b.col]=[]);
            while(A.length<=a.row) A.push('');
            while(B.length<=b.row) B.push('');
            const t=A[a.row]; A[a.row]=B[b.row]; B[b.row]=t;
            const keyA=matrixBoughtKey(a.col,a.row), keyB=matrixBoughtKey(b.col,b.row), boughtA=matrixBoughtCells[keyA], boughtB=matrixBoughtCells[keyB];
            if(boughtB) matrixBoughtCells[keyA]=boughtB; else delete matrixBoughtCells[keyA];
            if(boughtA) matrixBoughtCells[keyB]=boughtA; else delete matrixBoughtCells[keyB];
            trimTail(A); trimTail(B);
            saveState(); renderMatrix();
          }
          let dragSrc=null;
          const dragBlurSuppressedCells=new WeakSet();
          const mbody=$('matrixTableBody');
          const mhead=document.querySelector('#matrixTable thead');
          function toggleMatrixBoughtControl(control){
            const rowButton=control.closest('[data-buy-row]');
            if(rowButton){
              const row=parseInt(rowButton.dataset.buyRow,10), state=matrixRowBoughtState(row), shouldBuy=state.state!=='true';
              columns.forEach(c=>{
                const name=String((allocations[c.id]||[])[row]||'').trim(), key=matrixBoughtKey(c.id,row);
                if(shouldBuy&&name) matrixBoughtCells[key]=name; else delete matrixBoughtCells[key];
              });
              saveState(); renderMatrix(); return;
            }
            const td=control.closest('td.cell[data-col][data-row]');
            if(!td||!td.classList.contains('has-name')) return;
            const col=parseInt(td.dataset.col,10),row=parseInt(td.dataset.row,10),name=String((allocations[col]||[])[row]||'').trim(),key=matrixBoughtKey(col,row);
            if(isMatrixCellBought(col,row,name)) delete matrixBoughtCells[key]; else matrixBoughtCells[key]=name;
            saveState(); renderMatrix();
          }
          mbody.addEventListener('pointerdown',e=>{
            if(!matrixBuyMarkMode) return;
            const control=e.target.closest('[data-buy-row],td.cell.has-name[data-col][data-row]');
            if(!control) return;
            e.preventDefault(); e.stopPropagation(); toggleMatrixBoughtControl(control);
          });
          mbody.addEventListener('click',e=>{
            if(!matrixBuyMarkMode) return;
            const control=e.target.closest('[data-buy-row],td.cell.has-name[data-col][data-row]');
            if(control){ e.preventDefault(); e.stopPropagation(); }
          });
          mbody.addEventListener('keydown',e=>{
            if(!matrixBuyMarkMode) return;
            const control=e.target.closest('[data-buy-row],td.cell.has-name[data-col][data-row]');
            if(control&&(e.key==='Enter'||e.key===' ')){ e.preventDefault(); toggleMatrixBoughtControl(control); }
          });
          $('columnList').addEventListener('input',e=>{
            const pointInput=e.target.closest('input[data-promotion-point]');
            if(pointInput){
              const c=columns.find(col=>col.id===parseInt(pointInput.dataset.col,10)), value=parseFloat(pointInput.value);
              if(c&&Number.isFinite(value)){ c.promotionPoints=Math.max(0,value); saveState(); }
              return;
            }
            const input=e.target.closest('input.modeval[data-price-field]'); if(!input) return;
            const c=columns.find(col=>col.id===parseInt(input.dataset.col,10)); if(!c) return;
            const field=input.dataset.priceField, text=String(input.value||'').trim(), value=parseFloat(text);
            if(field==='avgOverride'&&text==='') c.avgOverride=null;
            else if(!Number.isFinite(value)) return;
            else if(field==='priceAdj') c.priceAdj=value;
            else if(field==='fixedPrice') c.fixedPrice=Math.max(0,value);
            else if(field==='sourceJpyPrice') c.sourceJpyPrice=Math.max(0,value);
            else if(field==='avgOverride') c.avgOverride=Math.max(0,value);
            saveState(); readCost(); computeAverage();
          });
          $('columnList').addEventListener('change',e=>{
            if(e.target.matches('input.modeval[data-price-field],input[data-promotion-point]')) recalc();
          });
          function matrixPriceColumn(input){ return columns.find(c=>c.id===parseInt(input.dataset.col,10)); }
          function saveMatrixNumericDraft(input){
            const c=matrixPriceColumn(input); if(!c) return;
            const value=parseFloat(String(input.value||'').replace(/[^\d.+-]/g,'')); if(!Number.isFinite(value)) return;
            if(input.dataset.priceKind==='promotion-point') c.promotionPoints=Math.max(0,value);
            else if(input.dataset.priceKind==='unit'){ c.mode='fixed'; c.fixedPrice=Math.max(0,value); }
            else if(input.dataset.priceMode==='fixed') c.fixedPrice=Math.max(0,value);
            else if(input.dataset.priceMode==='single') c.sourceJpyPrice=Math.max(0,value);
            else if(input.dataset.priceMode==='adjust') c.priceAdj=value;
            else return;
            saveState();
          }
          function refreshMatrixPriceInputs(){
            mhead.querySelectorAll('input[data-price-kind="unit"]').forEach(input=>{
              const c=matrixPriceColumn(input); if(c) input.value=unitPrice(c).toFixed(2);
            });
            renderPaymentSummary(); renderSharePaymentSummary(); renderCart();
          }
          mhead.addEventListener('click',e=>{ const input=e.target.closest('input[data-price-kind]'); if(input) input.select(); });
          mhead.addEventListener('focusin',e=>{
            const input=e.target.closest('input[data-price-kind]'); if(!input) return;
            const c=matrixPriceColumn(input); input.dataset.modeBeforeEdit=c?c.mode:'';
            input.dataset.replaceNext='1';
            setTimeout(()=>input.select(),0);
          });
          mhead.addEventListener('beforeinput',e=>{
            const input=e.target.closest('input[data-price-kind]');
            if(!input||input.dataset.replaceNext!=='1'||!String(e.inputType).startsWith('insert')||e.data==null) return;
            e.preventDefault(); input.value=e.data; input.dataset.replaceNext='0';
          });
          mhead.addEventListener('input',e=>{ const input=e.target.closest('input[data-price-kind]'); if(input) saveMatrixNumericDraft(input); });
          mhead.addEventListener('keydown',e=>{ if(e.target.matches('[data-price-kind]')&&e.key==='Enter'){ e.preventDefault(); e.target.blur(); } });
          mhead.addEventListener('blur',e=>{
            const td=e.target.closest('[data-price-kind]'); if(!td) return;
            const c=columns.find(x=>x.id===parseInt(td.dataset.col,10)); if(!c) return;
            const text=String(td.value||'').trim(), previousMode=td.dataset.modeBeforeEdit||c.mode, previousUnit=unitPrice(c);
            if(td.dataset.priceKind==='promotion-point'){
              const value=parseFloat(text.replace(/[^\d.-]/g,'')); if(Number.isFinite(value)) c.promotionPoints=Math.max(0,value);
            }else if(td.dataset.priceKind==='unit'){
              const value=parseFloat(text.replace(/[^\d.-]/g,''));
              if(Number.isFinite(value)&&value>=0){ c.mode='fixed'; c.fixedPrice=value; }
            }else if(td.dataset.priceMode==='fixed'){
              const value=parseFloat(text.replace(/[^\d.-]/g,'')); c.mode='fixed'; if(Number.isFinite(value)) c.fixedPrice=Math.max(0,value);
            }else if(td.dataset.priceMode==='single'){
              const value=parseFloat(text.replace(/[^\d.-]/g,'')); c.mode='single'; if(Number.isFinite(value)) c.sourceJpyPrice=Math.max(0,value);
            }else if(td.dataset.priceMode==='adjust'){
              const value=parseFloat(text.replace(/[^\d.+-]/g,'')); if(Number.isFinite(value)){ c.mode='adjust'; c.priceAdj=value; }
            }else if(/均价|^均$/.test(text)){
              c.mode='avg'; c.priceAdj=0;
            }else if(/入均|固定|\/1/.test(text)){
              const value=parseFloat(text.replace(/[^\d.-]/g,'')); c.mode='fixed';
              if(Number.isFinite(value)) c.fixedPrice=Math.max(0,value);
              else if(!(Number(c.fixedPrice)>0)) c.fixedPrice=Math.max(0,previousUnit);
            }else if(/原价|单领|日元/.test(text)){
              const value=parseFloat(text.replace(/[^\d.-]/g,'')); c.mode='single'; if(Number.isFinite(value)) c.sourceJpyPrice=Math.max(0,value);
            }else{
              const value=parseFloat(text.replace(/[^\d.+-]/g,''));
              if(Number.isFinite(value)){ c.mode='adjust'; c.priceAdj=value; }
            }
            saveState(); renderColumnList(); readCost(); computeAverage();
            if(previousMode!==c.mode) renderMatrix(); else refreshMatrixPriceInputs();
          },true);
          mbody.addEventListener('blur',e=>{
            const td=e.target.closest('td[data-col]');
            if(!td) return;
            if(dragBlurSuppressedCells.has(td)){ dragBlurSuppressedCells.delete(td); return; }
            const col=parseInt(td.dataset.col,10), row=parseInt(td.dataset.row,10);
            const arr=allocations[col]||(allocations[col]=[]);
            while(arr.length<=row) arr.push('');
            const nextName=(td.textContent||'').replace(/[\r\n]+/g,' ').trim();
            arr[row]=nextName;
            if(String(matrixBoughtCells[matrixBoughtKey(col,row)]||'')!==nextName) delete matrixBoughtCells[matrixBoughtKey(col,row)];
            trimTail(arr); saveState(); renderMatrix();
          },true);
          mbody.addEventListener('keydown',e=>{
            const td=e.target.closest('td[data-col]');
            if(td&&e.key==='Enter'){ e.preventDefault(); td.blur(); }
          });
          mbody.addEventListener('dragstart',e=>{
            const td=e.target.closest('td[data-col]');
            if(!td||td.getAttribute('draggable')!=='true'){ return; }
            const col=parseInt(td.dataset.col,10), row=parseInt(td.dataset.row,10), arr=allocations[col]||(allocations[col]=[]);
            while(arr.length<=row) arr.push('');
            arr[row]=(td.textContent||'').replace(/[\r\n]+/g,' ').trim();
            dragSrc={col,row};
            dragBlurSuppressedCells.add(td);
            e.dataTransfer.effectAllowed='move';
            try{ e.dataTransfer.setData('text/plain',td.textContent||''); }catch(_){}
            td.classList.add('dragging');
          });
          mbody.addEventListener('dragend',e=>{ const td=e.target.closest('td[data-col]'); if(td) td.classList.remove('dragging'); dragSrc=null; });
          mbody.addEventListener('dragover',e=>{ const td=e.target.closest('td[data-col]'); if(td&&dragSrc){ e.preventDefault(); e.dataTransfer.dropEffect='move'; } });
          mbody.addEventListener('dragenter',e=>{ const td=e.target.closest('td[data-col]'); if(td&&dragSrc) td.classList.add('drop-hover'); });
          mbody.addEventListener('dragleave',e=>{ const td=e.target.closest('td[data-col]'); if(td) td.classList.remove('drop-hover'); });
          mbody.addEventListener('drop',e=>{
            const td=e.target.closest('td[data-col]');
            if(!td||!dragSrc){ return; }
            e.preventDefault();
            dragBlurSuppressedCells.add(td);
            td.classList.remove('drop-hover');
            swapAlloc(dragSrc,{col:parseInt(td.dataset.col,10),row:parseInt(td.dataset.row,10)});
            dragSrc=null;
          });
      
          // OCR
          const ocrFileInput=$('ocrFileInput'), ocrStatus=$('ocrStatus'), ocrThumbs=$('ocrThumbs');
          ocrFileInput.addEventListener('change',()=>{
            ocrThumbs.innerHTML='';
            [...ocrFileInput.files].forEach(f=>{ const img=document.createElement('img'); img.src=URL.createObjectURL(f); ocrThumbs.appendChild(img); });
            $('ocrFileCount').textContent=ocrFileInput.files.length?`已选择 ${ocrFileInput.files.length} 张截图`:'尚未选择截图';
            ocrStatus.textContent=ocrFileInput.files.length?`已选择 ${ocrFileInput.files.length} 张，点「开始识别」`:'';
          });
          $('ocrRunBtn').addEventListener('click',async()=>{
            const files=[...ocrFileInput.files];
            if(files.length===0){ ocrStatus.textContent='请先选择截图'; return; }
            if(typeof Tesseract==='undefined'){ ocrStatus.textContent='识别库尚未加载完成，请确认联网后稍等几秒再试'; return; }
            let combined=[];
            for(let i=0;i<files.length;i++){
              ocrStatus.textContent=`增强第 ${i+1}/${files.length} 张评论区...`;
              try{
                let target=files[i];
                try{ target=await preprocessOcrImage(files[i]); }catch(_){ target=files[i]; }
                const {data:{text}}=await Tesseract.recognize(target,'chi_sim+eng',{logger:m=>{ if(m.status==='recognizing text') ocrStatus.textContent=`识别第 ${i+1}/${files.length} 张... ${Math.round((m.progress||0)*100)}%`; }});
                combined.push(cleanOcrText(text));
              }catch(err){ ocrStatus.textContent=`第 ${i+1} 张识别失败：${err.message}`; }
            }
            const box=$('commentInput');
            const newText=combined.join('\n');
            box.value=box.value.trim()?(box.value.trim()+'\n'+newText):newText;
            ocrStatus.textContent='识别完成，已填入下方评论框，请核对后点「解析预览」';
          });
      
          // cart controls
          $('cartNote').addEventListener('input',e=>{ cartNote=e.target.value; saveState(); renderCart(); });
          $('cartTargetMode').addEventListener('change',e=>{ cartTargetMode=e.target.value; $('cartTargetNum').style.display=(cartTargetMode==='manual')?'':'none'; saveState(); renderCart(); });
          $('cartTargetNum').addEventListener('input',e=>{ const v=parseInt(e.target.value,10); cartTargetNum=Number.isFinite(v)?v:null; saveState(); renderCart(); });
          $('cartCountMode').addEventListener('change',e=>{ cartCountMode=e.target.value; saveState(); renderCart(); });
          $('cartColumns').addEventListener('change',e=>{ cartColumns=Math.max(2,parseInt(e.target.value,10)||4); saveState(); renderCart(); });
          $('paymentTitleInput').addEventListener('input',e=>{
            paymentTitle=e.target.value;
            const sheet=sheets.find(s=>s.id===activeSheetId);
            if(sheet) sheet.paymentTitleCustom=String(paymentTitle).trim()!==String(sheet.name||'').trim()&&String(paymentTitle).trim()!=='';
            saveState(); renderPaymentSummary();
          });
          $('paymentColorInput').addEventListener('input',e=>{ paymentColor=e.target.value; saveState(); renderPaymentSummary(); });
          $('paymentViewMode').addEventListener('change',e=>{ paymentViewMode=e.target.value==='merged'?'merged':'detail'; saveState(); renderPaymentSummary(); });
          $('showPaymentTotalBtn').addEventListener('click',()=>{ showPaymentTotal=!showPaymentTotal; saveState(); syncPaymentControls(); renderPaymentSummary(); });
          let paymentSearchTimer=null;
          function clearPaymentSearchHighlight(){ clearTimeout(paymentSearchTimer); $('paymentSummary').querySelectorAll('.payment-search-hit').forEach(row=>row.classList.remove('payment-search-hit')); }
          function findPaymentPerson(){
            const query=String($('paymentSearchInput').value||'').replace(/\s+/g,'').toLowerCase();
            if(!query){ $('paymentSearchInput').focus(); return; }
            const names=[...$('paymentSummary').querySelectorAll('.payment-cn-name')], match=names.find(el=>String(el.textContent||'').replace(/\s+/g,'').toLowerCase().includes(query));
            clearPaymentSearchHighlight();
            if(!match){ alert('当前收款统计范围里没有找到这个人'); return; }
            const key=match.closest('[data-payment-person]')?.dataset.paymentPerson||'';
            const rows=[...$('paymentSummary').querySelectorAll('[data-payment-person]')].filter(row=>row.dataset.paymentPerson===key);
            rows.forEach(row=>row.classList.add('payment-search-hit')); match.scrollIntoView({behavior:'smooth',block:'center',inline:'nearest'});
            paymentSearchTimer=setTimeout(()=>rows.forEach(row=>row.classList.remove('payment-search-hit')),3000);
          }
          $('paymentSearchBtn').addEventListener('click',findPaymentPerson);
          $('paymentSearchInput').addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); findPaymentPerson(); } });
          document.querySelector('.payment-tabs').addEventListener('click',e=>{
            const button=e.target.closest('[data-payment-tab]'); if(!button) return;
            paymentActiveTab=button.dataset.paymentTab==='share'?'share':'goods'; syncPaymentControls();
          });
          $('sharePaymentTitleInput').addEventListener('input',e=>{
            sharePaymentTitle=e.target.value;
            const sheet=sheets.find(s=>s.id===activeSheetId), automatic=`${String(sheet?.name||'未命名项目').trim()||'未命名项目'} 均摊`;
            sharePaymentTitleCustom=String(sharePaymentTitle).trim()!==automatic&&String(sharePaymentTitle).trim()!=='';
            if(sheet) sheet.sharePaymentTitleCustom=sharePaymentTitleCustom;
            saveState(); renderSharePaymentSummary();
          });
          $('sharePaymentColorInput').addEventListener('input',e=>{ sharePaymentColor=e.target.value; saveState(); renderSharePaymentSummary(); });
          $('sharePaymentViewMode').addEventListener('change',e=>{ sharePaymentViewMode=e.target.value==='merged'?'merged':'detail'; saveState(); renderSharePaymentSummary(); });
          $('shareDeductFixedBtn').addEventListener('click',()=>{ shareDeductFixed=!shareDeductFixed; saveState(); syncPaymentControls(); renderSharePaymentSummary(); });
          let sharePaymentSearchTimer=null;
          function clearSharePaymentSearchHighlight(){ clearTimeout(sharePaymentSearchTimer); $('sharePaymentSummary').querySelectorAll('.payment-search-hit').forEach(row=>row.classList.remove('payment-search-hit')); }
          function findSharePaymentPerson(){
            const query=String($('sharePaymentSearchInput').value||'').replace(/\s+/g,'').toLowerCase(); if(!query){ $('sharePaymentSearchInput').focus(); return; }
            const names=[...$('sharePaymentSummary').querySelectorAll('.payment-cn-name')], match=names.find(el=>String(el.textContent||'').replace(/\s+/g,'').toLowerCase().includes(query)); clearSharePaymentSearchHighlight();
            if(!match){ alert('当前均摊统计范围里没有找到这个人'); return; }
            const key=match.closest('[data-share-payment-person]')?.dataset.sharePaymentPerson||'', rows=[...$('sharePaymentSummary').querySelectorAll('[data-share-payment-person]')].filter(row=>row.dataset.sharePaymentPerson===key);
            rows.forEach(row=>row.classList.add('payment-search-hit')); match.scrollIntoView({behavior:'smooth',block:'center',inline:'nearest'}); sharePaymentSearchTimer=setTimeout(()=>rows.forEach(row=>row.classList.remove('payment-search-hit')),3000);
          }
          $('sharePaymentSearchBtn').addEventListener('click',findSharePaymentPerson);
          $('sharePaymentSearchInput').addEventListener('keydown',e=>{ if(e.key==='Enter'){ e.preventDefault(); findSharePaymentPerson(); } });
          $('paymentStartRow').addEventListener('input',e=>{
            paymentStartRow=Math.max(1,parseInt(e.target.value,10)||1);
            if(paymentEndRow!==null&&paymentEndRow<paymentStartRow) paymentEndRow=paymentStartRow;
            syncPaymentControls(); saveState(); renderPaymentSummary(); renderSharePaymentSummary();
          });
          $('paymentEndRow').addEventListener('input',e=>{
            const value=String(e.target.value||'').trim(); paymentEndRow=value?Math.max(paymentStartRow,parseInt(value,10)||paymentStartRow):null;
            syncPaymentControls(); saveState(); renderPaymentSummary(); renderSharePaymentSummary();
          });
          $('paymentSummary').addEventListener('keydown',e=>{ if(e.target.matches('[data-payment-key]')&&e.key==='Enter'){ e.preventDefault(); e.target.blur(); } });
          function syncRenderedUnpaidCount(rootId,countId,selector,refundSelector,supplementSelector){
            const buttons=[...$(rootId).querySelectorAll(selector)], refundButtons=[...$(rootId).querySelectorAll(refundSelector||'')], supplementButtons=[...$(rootId).querySelectorAll(supplementSelector||'')], paid=buttons.filter(button=>button.getAttribute('aria-pressed')==='true'), unpaid=buttons.filter(button=>button.getAttribute('aria-pressed')!=='true'), refunds=refundButtons.filter(button=>Math.max(0,num(button.dataset.refundAmount))>0), supplements=supplementButtons.filter(button=>Math.max(0,num(button.dataset.supplementAmount))>0);
            const total=list=>list.reduce((sum,button)=>sum+Math.max(0,num(button.dataset.paymentAmount)),0);
            const refundTotal=refunds.reduce((sum,button)=>sum+Math.max(0,num(button.dataset.refundAmount)),0);
            const supplementTotal=supplements.reduce((sum,button)=>sum+Math.max(0,num(button.dataset.supplementAmount)),0);
            $(countId).textContent=`已收：${paid.length}人 / ${money(total(paid))}；待退款：${refunds.length}人 / ${money(refundTotal)}；待补款：${supplements.length}人 / ${money(supplementTotal)}；未收：${unpaid.length}人 / ${money(total(unpaid))}`;
          }
          function refreshPaymentRowState(rootId,rowSelector,key,paidMap,refundMap,supplementMap){
            $(rootId).querySelectorAll(rowSelector).forEach(row=>{
              const rowKey=row.dataset.paymentPerson||row.dataset.sharePaymentPerson;
              if(rowKey!==key) return;
              row.classList.remove('payment-paid-row','payment-refund-row','payment-supplement-row');
              if(supplementMap[key]===true||Math.max(0,num(supplementMap[key]))>0) row.classList.add('payment-supplement-row');
              else if(refundMap[key]===true||Math.max(0,num(refundMap[key]))>0) row.classList.add('payment-refund-row');
              else if(paidMap[key]===true) row.classList.add('payment-paid-row');
            });
          }
          function updateReceivedAmount(paidMap,key,button){
            const fullAmount=Math.max(0,num(button.dataset.paymentAmount)), received=paidAmountValue(paidMap,key,fullAmount), state=paidState(paidMap,key,fullAmount);
            if(state==='full'){ delete paidMap[key]; return true; }
            if(state==='unpaid'){ if(fullAmount>0) paidMap[key]=fullAmount; return fullAmount>0; }
            const answer=prompt(`当前已收 ${money(received)}，本次统计应收 ${money(fullAmount)}。\n请填写累计已收金额（填 0 清除）：`,fmtNum(fullAmount));
            if(answer===null) return false;
            const amount=Math.max(0,parseFloat(String(answer).replace(/[^\d.-]/g,''))||0);
            if(amount>0) paidMap[key]=amount; else delete paidMap[key];
            return true;
          }
          function rerenderPaymentInPlace(rootId,renderer){
            const root=$(rootId), scroller=root.querySelector('.payment-table-wrap');
            const position={pageX:window.scrollX,pageY:window.scrollY,left:scroller?.scrollLeft||0,top:scroller?.scrollTop||0};
            renderer();
            const restore=()=>{
              const next=$(rootId).querySelector('.payment-table-wrap');
              if(next){ next.scrollLeft=position.left; next.scrollTop=position.top; }
              window.scrollTo(position.pageX,position.pageY);
            };
            restore(); requestAnimationFrame(()=>{ restore(); requestAnimationFrame(restore); });
          }
          $('paymentSummary').addEventListener('click',e=>{
            const allButton=e.target.closest('[data-payment-paid-all]');
            if(allButton){
              e.preventDefault(); e.stopPropagation();
              const buttons=[...$('paymentSummary').querySelectorAll('[data-payment-paid]')], allFull=buttons.length>0&&buttons.every(button=>button.getAttribute('aria-pressed')==='true');
              buttons.forEach(button=>{ const key=decodeURIComponent(button.dataset.paymentPaid||''); if(!key) return; if(allFull) delete paymentPaid[key]; else paymentPaid[key]=Math.max(0,num(button.dataset.paymentAmount)); });
              saveState(); rerenderPaymentInPlace('paymentSummary',renderPaymentSummary); return;
            }
            const refundButton=e.target.closest('[data-payment-refund]');
            if(refundButton){
              e.preventDefault(); e.stopPropagation(); const key=decodeURIComponent(refundButton.dataset.paymentRefund||''); if(!key) return;
              const fullAmount=Math.max(0,num(refundButton.dataset.paymentAmount)), current=Math.max(0,num(refundButton.dataset.refundAmount)), answer=prompt('填写退款金额（填 0 取消退款）',fmtNum(current>0?current:fullAmount)); if(answer===null) return;
              const amount=Math.max(0,parseFloat(String(answer).replace(/[^\d.-]/g,''))||0); if(amount>0){ paymentRefund[key]=amount; delete paymentSupplement[key]; delete paymentSupplementDone[key]; }else delete paymentRefund[key];
              refundButton.dataset.refundAmount=String(amount); refundButton.setAttribute('aria-pressed',amount>0?'true':'false'); refundButton.textContent='退'; refundButton.title=amount>0?'待退款 '+money(amount):'填写退款金额';
              refreshPaymentRowState('paymentSummary','[data-payment-person]',key,paymentPaid,paymentRefund,paymentSupplement); saveState(); rerenderPaymentInPlace('paymentSummary',renderPaymentSummary); return;
            }
            const supplementButton=e.target.closest('[data-payment-supplement]');
            if(supplementButton){
              e.preventDefault(); e.stopPropagation(); const key=decodeURIComponent(supplementButton.dataset.paymentSupplement||''); if(!key) return;
              const fullAmount=Math.max(0,num(supplementButton.dataset.paymentAmount)), current=Math.max(0,num(supplementButton.dataset.supplementAmount)), answer=prompt('填写补款金额（填 0 取消补款）',fmtNum(current>0?current:fullAmount)); if(answer===null) return;
              const amount=Math.max(0,parseFloat(String(answer).replace(/[^\d.-]/g,''))||0); if(amount>0){ paymentSupplement[key]=amount; delete paymentRefund[key]; delete paymentRefundDone[key]; }else delete paymentSupplement[key];
              supplementButton.dataset.supplementAmount=String(amount); supplementButton.setAttribute('aria-pressed',amount>0?'true':'false'); supplementButton.textContent='补'; supplementButton.title=amount>0?'待补款 '+money(amount):'填写补款金额';
              refreshPaymentRowState('paymentSummary','[data-payment-person]',key,paymentPaid,paymentRefund,paymentSupplement); saveState(); rerenderPaymentInPlace('paymentSummary',renderPaymentSummary); return;
            }
            const checkbox=e.target.closest('[data-payment-paid]'); if(!checkbox) return;
            e.preventDefault(); e.stopPropagation();
            const key=decodeURIComponent(checkbox.dataset.paymentPaid||''); if(!key) return;
            if(updateReceivedAmount(paymentPaid,key,checkbox)){ saveState(); rerenderPaymentInPlace('paymentSummary',renderPaymentSummary); }
          });
          $('paymentSummary').addEventListener('blur',e=>{
            const cell=e.target.closest('[data-payment-key]'); if(!cell) return;
            const key=decodeURIComponent(cell.dataset.paymentKey);
            let value='';
            if(key.startsWith('merged-items:')&&cell.querySelector('.payment-item-line')){
              value=[...cell.querySelectorAll('.payment-item-line')].map(line=>{
                const copy=line.cloneNode(true); copy.querySelectorAll('.payment-bought-inline').forEach(note=>note.remove());
                return (copy.textContent||'').trim();
              }).filter(Boolean).join('、');
            }else value=(cell.textContent||'').replace(/[\r\n]+/g,' ').trim();
            paymentEdits[key]=value; saveState(); setTimeout(()=>rerenderPaymentInPlace('paymentSummary',renderPaymentSummary),0);
          },true);
          $('sharePaymentSummary').addEventListener('keydown',e=>{ if(e.target.matches('[data-share-payment-key]')&&e.key==='Enter'){ e.preventDefault(); e.target.blur(); } });
          $('sharePaymentSummary').addEventListener('click',e=>{
            const allButton=e.target.closest('[data-share-payment-paid-all]');
            if(allButton){
              e.preventDefault(); e.stopPropagation();
              const buttons=[...$('sharePaymentSummary').querySelectorAll('[data-share-payment-paid]')], allFull=buttons.length>0&&buttons.every(button=>button.getAttribute('aria-pressed')==='true');
              buttons.forEach(button=>{ const key=decodeURIComponent(button.dataset.sharePaymentPaid||''); if(!key) return; if(allFull) delete sharePaymentPaid[key]; else sharePaymentPaid[key]=Math.max(0,num(button.dataset.paymentAmount)); });
              saveState(); rerenderPaymentInPlace('sharePaymentSummary',renderSharePaymentSummary); return;
            }
            const refundButton=e.target.closest('[data-share-payment-refund]');
            if(refundButton){
              e.preventDefault(); e.stopPropagation(); const key=decodeURIComponent(refundButton.dataset.sharePaymentRefund||''); if(!key) return;
              const fullAmount=Math.max(0,num(refundButton.dataset.paymentAmount)), current=Math.max(0,num(refundButton.dataset.refundAmount)), answer=prompt('填写退款金额（填 0 取消退款）',fmtNum(current>0?current:fullAmount)); if(answer===null) return;
              const amount=Math.max(0,parseFloat(String(answer).replace(/[^\d.-]/g,''))||0); if(amount>0){ sharePaymentRefund[key]=amount; delete sharePaymentSupplement[key]; }else delete sharePaymentRefund[key];
              refundButton.dataset.refundAmount=String(amount); refundButton.setAttribute('aria-pressed',amount>0?'true':'false'); refundButton.textContent='退'; refundButton.title=amount>0?'待退款 '+money(amount):'填写退款金额';
              refreshPaymentRowState('sharePaymentSummary','[data-share-payment-person]',key,sharePaymentPaid,sharePaymentRefund,sharePaymentSupplement); saveState(); rerenderPaymentInPlace('sharePaymentSummary',renderSharePaymentSummary); return;
            }
            const supplementButton=e.target.closest('[data-share-payment-supplement]');
            if(supplementButton){
              e.preventDefault(); e.stopPropagation(); const key=decodeURIComponent(supplementButton.dataset.sharePaymentSupplement||''); if(!key) return;
              const fullAmount=Math.max(0,num(supplementButton.dataset.paymentAmount)), current=Math.max(0,num(supplementButton.dataset.supplementAmount)), answer=prompt('填写补款金额（填 0 取消补款）',fmtNum(current>0?current:fullAmount)); if(answer===null) return;
              const amount=Math.max(0,parseFloat(String(answer).replace(/[^\d.-]/g,''))||0); if(amount>0){ sharePaymentSupplement[key]=amount; delete sharePaymentRefund[key]; }else delete sharePaymentSupplement[key];
              supplementButton.dataset.supplementAmount=String(amount); supplementButton.setAttribute('aria-pressed',amount>0?'true':'false'); supplementButton.textContent='补'; supplementButton.title=amount>0?'待补款 '+money(amount):'填写补款金额';
              refreshPaymentRowState('sharePaymentSummary','[data-share-payment-person]',key,sharePaymentPaid,sharePaymentRefund,sharePaymentSupplement); saveState(); rerenderPaymentInPlace('sharePaymentSummary',renderSharePaymentSummary); return;
            }
            const checkbox=e.target.closest('[data-share-payment-paid]'); if(!checkbox) return;
            e.preventDefault(); e.stopPropagation(); const key=decodeURIComponent(checkbox.dataset.sharePaymentPaid||''); if(!key) return;
            if(updateReceivedAmount(sharePaymentPaid,key,checkbox)){ saveState(); rerenderPaymentInPlace('sharePaymentSummary',renderSharePaymentSummary); }
          });
          $('sharePaymentSummary').addEventListener('blur',e=>{
            const cell=e.target.closest('[data-share-payment-key]'); if(!cell) return;
            const key=decodeURIComponent(cell.dataset.sharePaymentKey), value=(cell.textContent||'').replace(/[\r\n]+/g,' ').trim();
            sharePaymentEdits[key]=value; saveState(); setTimeout(()=>rerenderPaymentInPlace('sharePaymentSummary',renderSharePaymentSummary),0);
          },true);
          $('cartQrInput').addEventListener('change',e=>{
            const file=e.target.files[0]; if(!file) return;
            compressImage(file,600,0.92).then(data=>{ sharedCartQrImg=cartQrImg=data; saveState(); syncCartControls(); renderCart(); }).catch(()=>alert('二维码图片处理失败'));
            e.target.value='';
          });
          $('clearCartQrBtn').addEventListener('click',()=>{ sharedCartQrImg=cartQrImg=''; saveState(); syncCartControls(); renderCart(); });
          function handlePaymentQr(file){
            if(!file) return;
            compressQrPng(file,1600).then(data=>{
              sharedPaymentQrImg=paymentQrImg=data;
              saveState(); syncPaymentControls(); renderPaymentSummary(); renderSharePaymentSummary();
            }).catch(()=>alert('收款码图片处理失败'));
          }
          $('paymentQrInput').addEventListener('change',e=>{ handlePaymentQr(e.target.files[0]); e.target.value=''; });
          $('clearPaymentQrBtn').addEventListener('click',()=>{ sharedPaymentQrImg=paymentQrImg=''; saveState(); syncPaymentControls(); renderPaymentSummary(); renderSharePaymentSummary(); });
          $('cartRefreshBtn').addEventListener('click',renderCart);
          $('cartExportPngBtn').addEventListener('click',()=>{
            if(typeof html2canvas==='undefined'){ alert('导出库尚未加载完成，请确认联网后重试'); return; }
            const wrap=$('cartWrap'), oldWidth=wrap.style.width;
            wrap.style.width='1000px';
            renderExportCanvas(wrap,{backgroundColor:'#ffffff',scale:2,width:1000,height:wrap.scrollHeight,windowWidth:1040,windowHeight:wrap.scrollHeight+40}).then(canvas=>saveCanvasImage(canvas,'推车图.png')).catch(()=>alert('导出失败，请确认图片已加载后重试')).finally(()=>{ wrap.style.width=oldWidth; });
          });
          $('exportPaymentBtn').addEventListener('click',()=>{
            clearPaymentSearchHighlight();
            if(typeof html2canvas==='undefined'||!$('paymentSummary').querySelector('table')){ alert('还没有收款数据'); return; }
            const wrap=$('paymentSummary'), scroller=wrap.querySelector('.payment-table-wrap'), table=scroller.querySelector('table'), sticky=[...table.querySelectorAll('th')];
            const old={maxHeight:scroller.style.maxHeight,overflow:scroller.style.overflow,width:scroller.style.width,wrapWidth:wrap.style.width};
            const width=Math.max(680,table.scrollWidth+4);
            scroller.style.maxHeight='none'; scroller.style.overflow='visible'; scroller.style.width=width+'px'; wrap.style.width=width+'px'; sticky.forEach(el=>{ el.style.position='static'; });
            const name=(paymentTitle||'收款统计').replace(/[\\/:*?"<>|]/g,' ').trim()||'收款统计';
            renderExportCanvas(wrap,{backgroundColor:'#ffffff',scale:2,width:wrap.scrollWidth,height:wrap.scrollHeight,windowWidth:wrap.scrollWidth+40,windowHeight:wrap.scrollHeight+40}).then(canvas=>saveCanvasImage(canvas,name+'.png')).catch(()=>alert('导出失败，请重试')).finally(()=>{
              scroller.style.maxHeight=old.maxHeight; scroller.style.overflow=old.overflow; scroller.style.width=old.width; wrap.style.width=old.wrapWidth; sticky.forEach(el=>{ el.style.position=''; });
            });
          });
          $('exportUnpaidPaymentBtn').addEventListener('click',async()=>{
            clearPaymentSearchHighlight();
            const source=$('paymentSummary'), sourceTable=source.querySelector('table');
            if(typeof html2canvas==='undefined'||!sourceTable){ alert('还没有收款数据'); return; }
            const receivedByPerson=new Map([...source.querySelectorAll('[data-payment-paid]')].map(button=>[
              decodeURIComponent(button.dataset.paymentPaid||''),
              {total:Math.max(0,num(button.dataset.paymentAmount)),received:Math.max(0,num(button.dataset.paymentReceived))}
            ]));
            const clone=source.cloneNode(true); clone.removeAttribute('id'); clone.classList.add('payment-unpaid-export');
            const cloneTable=clone.querySelector('table'), groupedRows=new Map();
            cloneTable.querySelectorAll('tbody tr[data-payment-person]').forEach(row=>{
              const key=row.dataset.paymentPerson||'';
              if(!groupedRows.has(key)) groupedRows.set(key,[]);
              groupedRows.get(key).push(row);
            });
            let unpaidPeople=0,unpaidTotal=0;
            groupedRows.forEach((rows,key)=>{
              const amounts=receivedByPerson.get(key)||{total:0,received:0}, due=Math.max(0,amounts.total-amounts.received);
              if(due<=0.005){ rows.forEach(row=>row.remove()); return; }
              unpaidPeople++; unpaidTotal+=due;
              if(amounts.received>0){
                const firstRow=rows[0], editable=[...firstRow.querySelectorAll('[data-payment-key]')];
                const alipay=editable.find(el=>decodeURIComponent(el.dataset.paymentKey||'').startsWith('alipay:'));
                const wechat=editable.find(el=>decodeURIComponent(el.dataset.paymentKey||'').startsWith('wechat:'));
                if(alipay) alipay.textContent=due.toFixed(2);
                if(wechat){ const fee=Math.ceil(((due<=100?due+0.1:due*1.001)-1e-9)*100)/100; wechat.textContent=fee.toFixed(2); }
              }
              rows.forEach(row=>row.querySelectorAll('.payment-adjustment-note,.payment-received-note').forEach(note=>note.remove()));
            });
            if(!unpaidPeople){ alert('当前范围已经全部收齐'); return; }
            const title=clone.querySelector('.payment-project-title');
            if(title) title.textContent=`${paymentTitle||'未命名项目'}｜未肾`;
            const totalLabel=clone.querySelector('.payment-total-label'),totalValue=clone.querySelector('.payment-total-value');
            if(totalLabel) totalLabel.textContent=`未交合计（${unpaidPeople}人）`;
            if(totalValue) totalValue.textContent=money(unpaidTotal);
            clone.querySelectorAll('[contenteditable]').forEach(el=>el.removeAttribute('contenteditable'));
            clone.style.position='fixed'; clone.style.left='-10000px'; clone.style.top='0'; clone.style.zIndex='-1'; clone.style.pointerEvents='none'; clone.style.background='#fff';
            document.body.appendChild(clone);
            const scroller=clone.querySelector('.payment-table-wrap'), table=clone.querySelector('table'), sticky=[...table.querySelectorAll('th')], width=Math.max(680,table.scrollWidth+4);
            scroller.style.maxHeight='none'; scroller.style.overflow='visible'; scroller.style.width=width+'px'; clone.style.width=width+'px'; sticky.forEach(el=>{ el.style.position='static'; });
            const fileName=((paymentTitle||'收款统计')+' 未肾').replace(/[\\/:*?"<>|]/g,' ').trim()||'未肾';
            try{
              const canvas=await renderExportCanvas(clone,{backgroundColor:'#ffffff',scale:2,width:clone.scrollWidth,height:clone.scrollHeight,windowWidth:clone.scrollWidth+40,windowHeight:clone.scrollHeight+40});
              await saveCanvasImage(canvas,fileName+'.png');
            }catch(err){ alert('导出失败，请重试'); }
            finally{ clone.remove(); }
          });
          $('toggleBoughtSettlementBtn').addEventListener('click',()=>{
            showBoughtSettlement=!showBoughtSettlement;
            settlementDashboardOpen=showBoughtSettlement;
            saveState();
            syncPaymentControls();
            renderMatrix();
            renderPaymentSummary();
            renderSharePaymentSummary();
            renderSettlementDashboard();
          });
          $('settlementDashboard').addEventListener('click',e=>{
            const filterBtn=e.target.closest('[data-settlement-filter]');
            if(filterBtn){ settlementFilter=filterBtn.dataset.settlementFilter||'pending'; renderSettlementDashboard(); return; }
            const copyRefund=e.target.closest('#copyRefundListBtn'); if(copyRefund){ copySettlementList('refund',copyRefund); return; }
            const copySupplement=e.target.closest('#copySupplementListBtn'); if(copySupplement){ copySettlementList('supplement',copySupplement); return; }
            const adjust=e.target.closest('[data-settlement-adjust]');
            if(adjust){
              const key=decodeURIComponent(adjust.dataset.settlementKey||''), type=adjust.dataset.settlementAdjust; if(!key) return;
              const records=combinedSettlementRecords(), record=records.find(item=>item.key===key); if(!record) return;
              const current=type==='refund'?record.refund:record.due, label=type==='refund'?'退款':'补款';
              const answer=prompt(`手动调整${label}金额（填 0 恢复默认计算）`,fmtNum(current)); if(answer===null) return;
              const amount=Math.max(0,parseFloat(String(answer).replace(/[^\d.-]/g,''))||0);
              delete paymentRefund[key]; delete paymentSupplement[key]; delete sharePaymentRefund[key]; delete sharePaymentSupplement[key]; delete paymentRefundDone[key]; delete paymentSupplementDone[key];
              if(amount>0){ if(type==='refund') paymentRefund[key]=amount; else paymentSupplement[key]=amount; }
              saveState(); renderSettlementDashboard(); return;
            }
            const btn=e.target.closest('[data-settlement-status]'); if(!btn) return;
            const key=decodeURIComponent(btn.dataset.settlementKey||''), type=btn.dataset.settlementStatus;
            if(!key) return;
            if(type==='refund') paymentRefundDone[key]=!paymentRefundDone[key];
            if(type==='supplement') paymentSupplementDone[key]=!paymentSupplementDone[key];
            saveState(); renderSettlementDashboard();
          });
          $('settlementDashboard').addEventListener('keydown',e=>{ if(e.target.matches('[data-payment-note]')&&e.key==='Enter'){ e.preventDefault(); e.target.blur(); } });
          $('settlementDashboard').addEventListener('blur',e=>{ const cell=e.target.closest('[data-payment-note]'); if(!cell) return; const key=decodeURIComponent(cell.dataset.paymentNote||''); if(!key) return; const value=(cell.textContent||'').trim(); if(value) paymentNotes[key]=value; else delete paymentNotes[key]; saveState(); },true);
      
          $('exportPaymentExcelBtn').addEventListener('click',()=>{
            const table=$('paymentSummary').querySelector('table');
            if(!table){ alert('还没有收款数据'); return; }
            if(typeof XLSX==='undefined'){ alert('Excel 组件尚未加载，请联网后重试'); return; }
            const exportTable=document.createElement('table'), body=document.createElement('tbody');
            const titleRow=document.createElement('tr'), titleCell=document.createElement('td');
            titleCell.colSpan=5; titleCell.textContent=paymentTitle||'未命名项目'; titleRow.appendChild(titleCell); body.appendChild(titleRow);
            [...table.rows].forEach(row=>{ const copy=row.cloneNode(true); copy.querySelectorAll('[contenteditable]').forEach(el=>el.removeAttribute('contenteditable')); copy.querySelectorAll('[data-html2canvas-ignore]:not(.payment-adjustment-note):not(.payment-received-note)').forEach(el=>el.remove()); body.appendChild(copy); });
            exportTable.appendChild(body);
            const ws=XLSX.utils.table_to_sheet(exportTable,{raw:true});
            ws['!cols']=[{wch:16},{wch:24},{wch:10},{wch:16},{wch:16}];
            const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'收款统计');
            XLSX.writeFile(wb,(paymentTitle||'收款统计')+'.xlsx');
          });
          $('copyPaymentBtn').addEventListener('click',()=>{
            const table=$('paymentSummary').querySelector('table'); if(!table){ alert('还没有收款数据'); return; }
            const cleanTable=table.cloneNode(true); cleanTable.querySelectorAll('[data-html2canvas-ignore]:not(.payment-adjustment-note):not(.payment-received-note)').forEach(el=>el.remove());
            const lines=[...cleanTable.rows].map(row=>[...row.cells].map(cell=>cell.textContent.trim()).join('\t'));
            navigator.clipboard.writeText(lines.join('\n')).then(()=>{ const b=$('copyPaymentBtn'),old=b.textContent;b.textContent='已复制';setTimeout(()=>b.textContent=old,1200); });
          });
          $('exportSharePaymentBtn').addEventListener('click',()=>{
            clearSharePaymentSearchHighlight();
            if(typeof html2canvas==='undefined'||!$('sharePaymentSummary').querySelector('table')){ alert('还没有均摊数据'); return; }
            const wrap=$('sharePaymentSummary'), scroller=wrap.querySelector('.payment-table-wrap'), table=scroller.querySelector('table'), sticky=[...table.querySelectorAll('th')];
            const calculationNote=wrap.querySelector('.share-calculation-note'), oldNoteDisplay=calculationNote?calculationNote.style.display:''; if(calculationNote) calculationNote.style.display='none';
            const old={maxHeight:scroller.style.maxHeight,overflow:scroller.style.overflow,width:scroller.style.width,wrapWidth:wrap.style.width};
            const width=Math.max(680,table.scrollWidth+4); scroller.style.maxHeight='none'; scroller.style.overflow='visible'; scroller.style.width=width+'px'; wrap.style.width=width+'px'; sticky.forEach(el=>{ el.style.position='static'; });
            const name=(sharePaymentTitle||'均摊统计').replace(/[\\/:*?"<>|]/g,' ').trim()||'均摊统计';
            renderExportCanvas(wrap,{backgroundColor:'#ffffff',scale:2,width:wrap.scrollWidth,height:wrap.scrollHeight,windowWidth:wrap.scrollWidth+40,windowHeight:wrap.scrollHeight+40}).then(canvas=>saveCanvasImage(canvas,name+'.png')).catch(()=>alert('导出失败，请重试')).finally(()=>{
              scroller.style.maxHeight=old.maxHeight; scroller.style.overflow=old.overflow; scroller.style.width=old.width; wrap.style.width=old.wrapWidth; if(calculationNote) calculationNote.style.display=oldNoteDisplay; sticky.forEach(el=>{ el.style.position=''; });
            });
          });
          $('exportSharePaymentExcelBtn').addEventListener('click',()=>{
            const table=$('sharePaymentSummary').querySelector('table'); if(!table){ alert('还没有均摊数据'); return; }
            if(typeof XLSX==='undefined'){ alert('Excel 组件尚未加载，请联网后重试'); return; }
            const exportTable=document.createElement('table'), body=document.createElement('tbody'), titleRow=document.createElement('tr'), titleCell=document.createElement('td');
            titleCell.colSpan=5; titleCell.textContent=sharePaymentTitle||'均摊统计'; titleRow.appendChild(titleCell); body.appendChild(titleRow);
            [...table.rows].forEach(row=>{ const copy=row.cloneNode(true); copy.querySelectorAll('[contenteditable]').forEach(el=>el.removeAttribute('contenteditable')); copy.querySelectorAll('[data-html2canvas-ignore]:not(.payment-adjustment-note):not(.payment-received-note)').forEach(el=>el.remove()); body.appendChild(copy); });
            exportTable.appendChild(body); const ws=XLSX.utils.table_to_sheet(exportTable,{raw:true}); ws['!cols']=[{wch:16},{wch:24},{wch:10},{wch:16},{wch:16}];
            const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'均摊统计'); XLSX.writeFile(wb,(sharePaymentTitle||'均摊统计')+'.xlsx');
          });
          $('copySharePaymentBtn').addEventListener('click',()=>{
            const table=$('sharePaymentSummary').querySelector('table'); if(!table){ alert('还没有均摊数据'); return; }
            const cleanTable=table.cloneNode(true); cleanTable.querySelectorAll('[data-html2canvas-ignore]:not(.payment-adjustment-note):not(.payment-received-note)').forEach(el=>el.remove());
            const lines=[...cleanTable.rows].map(row=>[...row.cells].map(cell=>cell.textContent.trim()).join('\t'));
            navigator.clipboard.writeText(lines.join('\n')).then(()=>{ const b=$('copySharePaymentBtn'),old=b.textContent;b.textContent='已复制';setTimeout(()=>b.textContent=old,1200); });
          });
      
          // exports
          async function waitForExportImages(root){
            const images=[...root.querySelectorAll('img')].filter(img=>img.style.display!=='none');
            await Promise.all(images.map(img=>new Promise(resolve=>{
              let done=false;
              const finish=()=>{ if(done) return; done=true; clearTimeout(timer); resolve(); };
              const timer=setTimeout(finish,12000);
              if(img.complete){
                if(img.naturalWidth>0&&typeof img.decode==='function') img.decode().catch(()=>{}).finally(finish);
                else finish();
              }else{
                img.addEventListener('load',finish,{once:true}); img.addEventListener('error',finish,{once:true});
              }
            })));
          }
          async function renderExportCanvas(root,options){
            await waitForExportImages(root);
            const beforeWidth=root.scrollWidth,beforeHeight=root.scrollHeight;
            const dynamicWidth=!options.width||Math.abs(options.width-beforeWidth)<2;
            const dynamicHeight=!options.height||Math.abs(options.height-beforeHeight)<2;
            const dynamicWindowWidth=dynamicWidth&&options.windowWidth&&options.width&&Math.abs(options.windowWidth-options.width-40)<2;
            const dynamicWindowHeight=dynamicHeight&&options.windowHeight&&options.height&&Math.abs(options.windowHeight-options.height-40)<2;
            document.body.classList.add('export-rendering');
            try{
              await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
              const measured={...options};
              if(dynamicWidth) measured.width=root.scrollWidth;
              if(dynamicHeight) measured.height=root.scrollHeight;
              if(dynamicWindowWidth) measured.windowWidth=measured.width+40;
              if(dynamicWindowHeight) measured.windowHeight=measured.height+40;
              return await html2canvas(root,{useCORS:true,allowTaint:false,imageTimeout:20000,logging:false,...measured});
            }finally{
              document.body.classList.remove('export-rendering');
            }
          }
          async function saveCanvasImage(canvas,filename){
            const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));
            if(!blob) throw new Error('图片生成失败');
            const ua=String(navigator.userAgent||'');
            const isMobileDevice=/Android|iPhone|iPad|iPod|Mobile|HarmonyOS/i.test(ua)||(navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
            if(isMobileDevice&&typeof File!=='undefined'&&navigator.share){
              const file=new File([blob],filename,{type:'image/png'});
              try{
                if(!navigator.canShare||navigator.canShare({files:[file]})){ await navigator.share({files:[file],title:filename}); return; }
              }catch(err){ if(err&&err.name==='AbortError') return; }
            }
            const url=URL.createObjectURL(blob), a=document.createElement('a');
            a.href=url; a.download=filename; a.style.display='none'; document.body.appendChild(a); a.click();
            setTimeout(()=>{ a.remove(); URL.revokeObjectURL(url); },1500);
          }
          function quantityExportName(ext){
            const name=String(quantityTitle||sheets.find(item=>item.id===activeSheetId)?.name||'数量统计').replace(/[\\/:*?"<>|]/g,' ').trim()||'数量统计';
            return `${name}-数量统计.${ext}`;
          }
          $('exportQuantityPngBtn').addEventListener('click',()=>{
            if(typeof html2canvas==='undefined'){ alert('导出组件尚未加载完成，请确认联网后重试'); return; }
            const summary=$('quantitySummary'), table=summary.querySelector('.quantity-ride-table');
            if(!table){ alert('还没有数量统计'); return; }
            const scrollers=[...summary.querySelectorAll('.quantity-table-wrap')], oldScroll=scrollers.map(el=>({el,maxHeight:el.style.maxHeight,overflow:el.style.overflow,width:el.style.width}));
            const sticky=[...summary.querySelectorAll('th')], oldSummary={width:summary.style.width,padding:summary.style.padding,background:summary.style.background};
            const width=Math.max(720,table.scrollWidth+4);
            scrollers.forEach(el=>{ el.style.maxHeight='none'; el.style.overflow='visible'; el.style.width=width+'px'; });
            sticky.forEach(el=>{ el.style.position='static'; });
            summary.style.width=(width+24)+'px'; summary.style.padding='12px'; summary.style.background='#fff';
            renderExportCanvas(summary,{backgroundColor:'#ffffff',scale:2,width:summary.scrollWidth,height:summary.scrollHeight,windowWidth:summary.scrollWidth+40,windowHeight:summary.scrollHeight+40}).then(canvas=>saveCanvasImage(canvas,quantityExportName('png'))).catch(()=>alert('导出失败，请重试')).finally(()=>{
              oldScroll.forEach(item=>{ item.el.style.maxHeight=item.maxHeight; item.el.style.overflow=item.overflow; item.el.style.width=item.width; });
              sticky.forEach(el=>{ el.style.position=''; });
              summary.style.width=oldSummary.width; summary.style.padding=oldSummary.padding; summary.style.background=oldSummary.background;
            });
          });
          $('exportQuantityExcelBtn').addEventListener('click',()=>{
            if(typeof XLSX==='undefined'){ alert('表格组件尚未加载，请联网后重试'); return; }
            const table=$('quantitySummary').querySelector('.quantity-ride-table'); if(!table){ alert('还没有数量统计'); return; }
            const ws=XLSX.utils.table_to_sheet(table,{raw:true}); ws['!cols']=[{wch:18},{wch:18},{wch:18},{wch:12},{wch:12},{wch:28}];
            const settings=XLSX.utils.aoa_to_sheet([['是否启用',quantitySettingsReady()?'是':'否'],['每盒数量',boxSize||''],['每行计数',groupSize||''],['每几盒标记',completeMultiple||'']]); settings['!cols']=[{wch:16},{wch:14}];
            const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,'上车名单'); XLSX.utils.book_append_sheet(wb,settings,'计数设置'); XLSX.writeFile(wb,quantityExportName('xlsx'));
          });
          $('exportPngBtn').addEventListener('click',()=>{
            if(typeof html2canvas==='undefined'){ alert('导出库尚未加载完成，请确认联网后重试'); return; }
            const wrap=$('matrixWrap'), scroll=wrap.querySelector('.table-scroll'), table=$('matrixTable');
            const old={maxHeight:scroll.style.maxHeight,overflow:scroll.style.overflow,width:wrap.style.width};
            const sticky=[table.querySelector('thead'),...table.querySelectorAll('.seq-col, thead td:first-child, thead th:first-child'),...wrap.querySelectorAll('.payment-table th')];
            sticky.forEach(el=>{ if(el) el.style.position='static'; });
            scroll.style.maxHeight='none'; scroll.style.overflow='visible';
            wrap.style.width=Math.max(wrap.clientWidth,table.scrollWidth+12)+'px';
            const name=(matrixTitle||'排单表').replace(/[\\/:*?"<>|]/g,' ').trim()||'排单表';
            renderExportCanvas(wrap,{backgroundColor:'#ffffff',scale:2,width:wrap.scrollWidth,height:wrap.scrollHeight,windowWidth:wrap.scrollWidth+40,windowHeight:wrap.scrollHeight+40}).then(canvas=>saveCanvasImage(canvas,name+'.png')).catch(()=>alert('导出失败，请重试')).finally(()=>{
              scroll.style.maxHeight=old.maxHeight; scroll.style.overflow=old.overflow; wrap.style.width=old.width;
              sticky.forEach(el=>{ if(el) el.style.position=''; });
            });
          });
          $('copyTsvBtn').addEventListener('click',()=>{
            if(columns.length===0){ alert('还没有排单数据'); return; }
            const maxRows=Math.max(0,...columns.map(c=>(allocations[c.id]||[]).length));
            let lines=[];
            lines.push(['',...columns.map(c=>c.name)].join('\t'));
            lines.push(['调价',...columns.map(c=> c.mode==='avg'?'均价':(c.mode==='fixed'?(fmtNum(c.fixedPrice)+'/1'):(c.mode==='single'?('原价'+fmtNum(c.sourceJpyPrice)+'日元'):((num(c.priceAdj)>0?'+':'')+fmtNum(c.priceAdj)))))].join('\t'));
            lines.push(['单价',...columns.map(c=>unitPrice(c).toFixed(2))].join('\t'));
            lines.push(['提配点数',...columns.map(c=>fmtPoint(c.promotionPoints))].join('\t'));
            const step=quantitySettingsReady()?groupSize:1;
            for(let r=0;r<maxRows;r++) lines.push([(r+1)*step,...columns.map(c=>(allocations[c.id]||[])[r]||'')].join('\t'));
            navigator.clipboard.writeText(lines.join('\n')).then(()=>{ const btn=$('copyTsvBtn'); const old=btn.textContent; btn.textContent='已复制 ✓'; setTimeout(()=>btn.textContent=old,1500); });
          });
          function sheetPriceInfo(sheet){
            const cost={...COST_DEFAULTS,...(sheet.cost||{})}, cols=(sheet.columns||[]).map(c=>({...c}));
            const rate=Math.max(0,num(cost.exchangeRate)), enteredCount=parseInt(cost.count,10), count=Number.isFinite(enteredCount)&&enteredCount>0?enteredCount:Math.max(1,cols.length||1), raw=Math.max(0,num(cost.jpyPrice));
            const jpyTotal=cost.priceType==='single'?raw*count:raw;
            const total=jpyTotal*rate;
            let fixedCount=0;
            cols.forEach(c=>{ if(c.mode==='fixed'||c.mode==='single') fixedCount++; });
            const denom=(cols.length||count)-fixedCount;
            const average=raw>0&&rate>0?(cost.priceType==='single'?raw*rate:(denom>0?total/denom:0)):Math.max(0,num(cost.manualAveragePrice));
            const price=c=>c.mode==='fixed'?num(c.fixedPrice):c.mode==='single'?Math.max(0,num(c.sourceJpyPrice))*rate:c.mode==='adjust'?average+num(c.priceAdj):(c.avgOverride!==null&&c.avgOverride!==''&&Number.isFinite(Number(c.avgOverride))?Math.max(0,Number(c.avgOverride)):average);
            return {cols,price};
          }
          function sheetToAoa(sheet){
            const {cols,price}=sheetPriceInfo(sheet), data=sheet.allocations||{}, maxRows=Math.max(0,...cols.map(c=>(data[c.id]||[]).length));
            const pricing=c=>c.mode==='avg'?'均价':c.mode==='fixed'?`${fmtNum(c.fixedPrice)}/1`:c.mode==='single'?`原价${fmtNum(c.sourceJpyPrice)}日元`:`${num(c.priceAdj)>0?'+':''}${fmtNum(c.priceAdj)}`;
            const rows=[['',...cols.map(c=>c.name)],['调价',...cols.map(pricing)],['单价',...cols.map(c=>Number(price(c).toFixed(2)))],['提配点数',...cols.map(c=>Number.isFinite(Number(c.promotionPoints))?Math.max(0,Number(c.promotionPoints)):1)]];
            const step=sheet.quantityConfigured===true&&Number.isFinite(parseInt(sheet.boxSize,10))&&Number.isFinite(parseInt(sheet.groupSize,10))?Math.max(1,parseInt(sheet.groupSize,10)):1;
            for(let r=0;r<maxRows;r++) rows.push([(r+1)*step,...cols.map(c=>(data[c.id]||[])[r]||'')]);
            return rows;
          }
          function safeExcelSheetName(name,used){
            const base=(String(name||'排单表').replace(/[\\\/?*\[\]:]/g,' ').trim()||'排单表').slice(0,31); let result=base,n=2;
            while(used.has(result)){ const suffix=` ${n++}`; result=base.slice(0,31-suffix.length)+suffix; }
            used.add(result); return result;
          }
          function appendOrderSheet(wb,sheet,name){
            const rows=sheetToAoa(sheet), ws=XLSX.utils.aoa_to_sheet(rows);
            ws['!cols']=[{wch:8},...(sheet.columns||[]).map(()=>({wch:16}))];
            XLSX.utils.book_append_sheet(wb,ws,name);
          }
          function currentQuantityExportRows(mode){
            const exportColumns=mode==='bundle'?columns.filter(c=>c.mode!=='fixed'):columns;
            if(!exportColumns.length) return {rows:[],completeRows:0};
            if(mode==='single'){
              return {rows:exportColumns.map(c=>[c.name,(allocations[c.id]||[]).filter(person=>String(person||'').trim()).length]),completeRows:0};
            }
            const maxRows=Math.max(0,...exportColumns.map(c=>(allocations[c.id]||[]).length));
            let completeRows=0;
            for(let row=0;row<maxRows;row++){
              if(exportColumns.every(c=>String((allocations[c.id]||[])[row]||'').trim())) completeRows++;
            }
            return {rows:exportColumns.map(c=>[c.name,completeRows]),completeRows};
          }
          function copyTextWithFallback(text){
            if(navigator.clipboard&&navigator.clipboard.writeText) return navigator.clipboard.writeText(text);
            const area=document.createElement('textarea'); area.value=text; area.style.position='fixed'; area.style.opacity='0'; document.body.appendChild(area); area.select();
            try{ document.execCommand('copy'); area.remove(); return Promise.resolve(); }catch(err){ area.remove(); return Promise.reject(err); }
          }
          function exportCurrentQuantity(mode){
            if(!columns.length){ alert('还没有排单数据'); return; }
            const bundle=mode==='bundle', result=currentQuantityExportRows(mode);
            if(bundle&&!result.rows.length){ alert('当前表只有入均列，没有可统计的配比列'); return; }
            const title=matrixTitle||sheets.find(s=>s.id===activeSheetId)?.name||'未命名项目';
            const lines=[`${title}｜${bundle?'配比数量':'单领数量'}`];
            if(bundle) lines.push(`完整配比：${result.completeRows}配`);
            result.rows.filter(([,qty])=>qty>0).forEach(([name,qty])=>lines.push(`${name}×${qty}`));
            if(lines.length===(bundle?2:1)) lines.push('暂无数量');
            const button=$(bundle?'exportBundleQuantityBtn':'exportSingleQuantityBtn'), old=button.textContent;
            copyTextWithFallback(lines.join('\n')).then(()=>{ button.textContent='已复制 ✓'; setTimeout(()=>button.textContent=old,1500); $('dataActions').open=false; }).catch(()=>alert('复制失败，请允许浏览器访问剪贴板后重试'));
          }
          $('exportSingleQuantityBtn').addEventListener('click',()=>exportCurrentQuantity('single'));
          $('exportBundleQuantityBtn').addEventListener('click',()=>exportCurrentQuantity('bundle'));
          $('exportCurrentExcelBtn').addEventListener('click',()=>{
            if(typeof XLSX==='undefined'){ alert('Excel 组件尚未加载，请联网后重试'); return; }
            captureActiveSheet(); const sheet=sheets.find(s=>s.id===activeSheetId); if(!sheet||!sheet.columns.length){ alert('还没有排单数据'); return; }
            const wb=XLSX.utils.book_new(), used=new Set(); appendOrderSheet(wb,sheet,safeExcelSheetName(sheet.name,used)); XLSX.writeFile(wb,`${sheet.name||'当前排单'}.xlsx`); $('dataActions').open=false;
          });
          $('exportAllExcelBtn').addEventListener('click',()=>{
            if(typeof XLSX==='undefined'){ alert('Excel 组件尚未加载，请联网后重试'); return; }
            captureActiveSheet(); const available=sheets.filter(s=>(s.columns||[]).length); if(!available.length){ alert('还没有排单数据'); return; }
            const wb=XLSX.utils.book_new(), used=new Set(); available.forEach(sheet=>appendOrderSheet(wb,sheet,safeExcelSheetName(sheet.name,used))); XLSX.writeFile(wb,'全部排单.xlsx'); $('dataActions').open=false;
          });
          // ============================================================
          // 导入、导出与备份
          // ============================================================
          function downloadBackup(payload,name){
            const blob=new Blob([JSON.stringify(payload,null,2)],{type:'application/json'});
            const url=URL.createObjectURL(blob);
            const a=document.createElement('a'); a.href=url; a.download=name;
            document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
          }
          $('exportCurrentJsonBtn').addEventListener('click',()=>{
            captureActiveSheet();
            const sheet=sheets.find(s=>s.id===activeSheetId);
            downloadBackup({...sheet,sharedCartQrImg,sharedPaymentQrImg},`${sheet.name||'本表'}备份.json`);
          });
          $('exportJsonBtn').addEventListener('click',()=>{
            captureActiveSheet();
            downloadBackup({sheets,activeSheetId,sheetIdSeed,itemCatalog,catalogIdSeed,sharedCartQrImg,sharedPaymentQrImg},'全部排单备份.json');
          });
          $('exportImportTemplateBtn').addEventListener('click',()=>{
            if(typeof XLSX==='undefined'){ alert('Excel 组件尚未加载，请联网后重试'); return; }
            const templateColumns=columns.length?columns:Array.from({length:8},(_,i)=>({name:`谷子${i+1}`,mode:'avg',priceAdj:0,fixedPrice:0,sourceJpyPrice:0,promotionPoints:1}));
            const pricing=c=>c.mode==='fixed'?`${fmtNum(c.fixedPrice)}/1`:c.mode==='single'?`原价${fmtNum(c.sourceJpyPrice)}日元`:c.mode==='adjust'?`${num(c.priceAdj)>0?'+':''}${fmtNum(c.priceAdj)}`:'均价';
            const rows=[
              ['顺位',...templateColumns.map(c=>c.name)],
              ['调价',...templateColumns.map(pricing)],
              ['单价',...templateColumns.map(c=>Number(unitPrice(c).toFixed(2)))],
              ['提配点数',...templateColumns.map(c=>Number.isFinite(Number(c.promotionPoints))?Math.max(0,Number(c.promotionPoints)):1)],
            ];
            for(let row=1;row<=100;row++) rows.push([row,...templateColumns.map(()=>'')]);
            const ws=XLSX.utils.aoa_to_sheet(rows), sheetName=String((sheets.find(s=>s.id===activeSheetId)||{}).name||'排单导入模板').replace(/[\\/?*\[\]:]/g,' ').slice(0,31)||'排单导入模板';
            ws['!cols']=[{wch:9},...templateColumns.map(()=>({wch:18}))]; ws['!freeze']={xSplit:1,ySplit:4};
            if(ws.A1) ws.A1.c=[{a:'Codex',t:'第一行填写谷子名称；第5行开始，每一行代表同一个排单顺位。可以增加、删除谷子列，也可以增加人员行。填好后回到网页点击“导入 Excel”。'}];
            const wb=XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb,ws,sheetName); XLSX.writeFile(wb,`${sheetName}-排单导入模板.xlsx`); $('dataActions').open=false;
          });
          $('excelImportInput').addEventListener('change',e=>{
            const file=e.target.files[0]; if(!file) return;
            if(typeof XLSX==='undefined'){ alert('Excel 读取组件尚未加载，请联网后重试'); e.target.value=''; return; }
            const reader=new FileReader();
            reader.onload=()=>{
              try{
                const book=XLSX.read(reader.result,{type:'array'}), imported=[];
                book.SheetNames.forEach(sheetName=>{
                  const rows=XLSX.utils.sheet_to_json(book.Sheets[sheetName],{header:1,raw:false,defval:''});
                  if(!rows.length) return;
                  const hasLabelCol=['调价','定价','单价','提配点数'].some(label=>rows.slice(1,5).some(r=>String(r[0]||'').trim()===label));
                  const startCol=hasLabelCol||String(rows[0][0]||'').trim()===''?1:0;
                  const headers=(rows[0]||[]).slice(startCol).map(v=>String(v||'').trim());
                  while(headers.length&&!headers[headers.length-1]) headers.pop();
                  if(!headers.length) return;
                  const pricingIndex=rows.findIndex((r,i)=>i>0&&['调价','定价'].includes(String(r[0]||'').trim()));
                  const unitIndex=rows.findIndex((r,i)=>i>0&&String(r[0]||'').trim()==='单价');
                  const promotionPointIndex=rows.findIndex((r,i)=>i>0&&String(r[0]||'').trim()==='提配点数');
                  const dataStart=Math.max(1,pricingIndex+1,unitIndex+1,promotionPointIndex+1);
                  const sheet=blankSheet(sheetName||`表${sheets.length+imported.length+1}`);
                  sheet.cost={...COST_DEFAULTS,count:String(headers.length)};
                  sheet.columns=headers.map((name,i)=>{
                    const id=i+1, pricing=pricingIndex>=0?String((rows[pricingIndex]||[])[i+startCol]||'').trim():'';
                    const unit=unitIndex>=0?parseFloat((rows[unitIndex]||[])[i+startCol]):NaN;
                    const promotionPoint=promotionPointIndex>=0?parseFloat((rows[promotionPointIndex]||[])[i+startCol]):NaN;
                    let mode='avg',priceAdj=0,fixedPrice=0,sourceJpyPrice=0;
                    if(/固定|\/1/.test(pricing)||(/入均/.test(pricing)&&/\d/.test(pricing))){ mode='fixed'; fixedPrice=Math.max(0,parseFloat(pricing.replace(/[^\d.-]/g,''))||0); }
                    else if(/原价|日元/.test(pricing)){ mode='single'; sourceJpyPrice=Math.max(0,parseFloat(pricing.replace(/[^\d.-]/g,''))||0); }
                    else if(pricing&&!/^(?:入均|均价|均)$/.test(pricing)){ const n=parseFloat(pricing.replace(/[^\d.+-]/g,'')); if(Number.isFinite(n)){ mode='adjust'; priceAdj=n; } }
                    else if(Number.isFinite(unit)&&!pricing){ mode='fixed'; fixedPrice=Math.max(0,unit); }
                    return {id,name:name||`角色${i+1}`,aliases:[],mode,priceAdj,fixedPrice,sourceJpyPrice,promotionPoints:Number.isFinite(promotionPoint)?Math.max(0,promotionPoint):1,img:null};
                  });
                  sheet.allocations={};
                  sheet.columns.forEach((c,i)=>{
                    const arr=rows.slice(dataStart).map(r=>String((r||[])[i+startCol]||'').trim());
                    while(arr.length&&!arr[arr.length-1]) arr.pop(); sheet.allocations[c.id]=arr;
                  });
                  imported.push(sheet);
                });
                if(!imported.length){ alert('Excel 里没有找到可导入的表格'); return; }
                captureActiveSheet(); sheets.push(...imported); applySheet(imported[0]); saveState();
                alert(`已导入 ${imported.length} 张表`);
              }catch(err){ alert('Excel 导入失败：'+err.message); }
            };
            reader.readAsArrayBuffer(file); e.target.value='';
          });
          $('importInput').addEventListener('change',e=>{
            const file=e.target.files[0]; if(!file) return;
            const reader=new FileReader();
            reader.onload=()=>{
              try{
                const d=JSON.parse(reader.result);
                if(Array.isArray(d.sheets)&&d.sheets.length){
                  sheets=d.sheets; itemCatalog=migrateCatalogItems(d.itemCatalog); catalogIdSeed=Math.max(d.catalogIdSeed||1,...itemCatalog.map(x=>(x.catalogId||0)+1)); sheetIdSeed=Math.max(d.sheetIdSeed||1,...sheets.map(s=>(s.id||0)+1));
                  sharedCartQrImg=d.sharedCartQrImg||sheets.find(s=>s.cartQrImg)?.cartQrImg||'';
                  sharedPaymentQrImg=d.sharedPaymentQrImg||sheets.find(s=>s.paymentQrImg||s.alipayQrImg||s.wechatQrImg)?.paymentQrImg||sheets.find(s=>s.alipayQrImg)?.alipayQrImg||sheets.find(s=>s.wechatQrImg)?.wechatQrImg||'';
                  sheets.forEach(s=>{ delete s.cartQrImg; delete s.paymentQrImg; delete s.alipayQrImg; delete s.wechatQrImg; });
                  activeSheetId=sheets.some(s=>s.id===d.activeSheetId)?d.activeSheetId:sheets[0].id;
                  applySheet(sheets.find(s=>s.id===activeSheetId)); saveState();
                }else{
                  columns=Array.isArray(d.columns)?d.columns.map(migrateColumn):[]; allocations=d.allocations||{};
                  cartNote=d.cartNote||''; cartTargetMode=d.cartTargetMode||'auto';
                  cartTargetNum=d.cartTargetNum!==undefined?d.cartTargetNum:null; applyCost(d.cost);
                  sharedCartQrImg=d.sharedCartQrImg||d.cartQrImg||''; sharedPaymentQrImg=d.sharedPaymentQrImg||d.paymentQrImg||d.alipayQrImg||d.wechatQrImg||'';
                  cartCountMode=d.cartCountMode||'short'; cartColumns=d.cartColumns||4; cartQrImg=sharedCartQrImg;
                  const importedTargetSheet=sheets.find(s=>s.id===activeSheetId), importedSheetName=String(importedTargetSheet?.name||'表1');
                  matrixTitle=d.matrixTitle||importedSheetName; matrixColor=d.matrixColor||'#d1466a';
                  quantityTitle=d.quantityTitle||importedSheetName;
                  paymentTitle=d.paymentTitle||importedSheetName; paymentColor=d.paymentColor||'#d1466a'; paymentViewMode=d.paymentViewMode==='merged'?'merged':'detail';
                  if(importedTargetSheet){
                    importedTargetSheet.matrixTitleCustom=!!String(d.matrixTitle||'').trim()&&String(d.matrixTitle).trim()!==importedSheetName;
                    importedTargetSheet.quantityTitle=quantityTitle; importedTargetSheet.quantityTitleCustom=!!String(d.quantityTitle||'').trim()&&String(d.quantityTitle).trim()!==importedSheetName;
                    importedTargetSheet.paymentTitleCustom=!!String(d.paymentTitle||'').trim()&&String(d.paymentTitle).trim()!==importedSheetName;
                  }
                  paymentStartRow=Math.max(1,parseInt(d.paymentStartRow,10)||1); paymentEndRow=Number.isFinite(parseInt(d.paymentEndRow,10))?Math.max(paymentStartRow,parseInt(d.paymentEndRow,10)):null;
                  paymentEdits=d.paymentEdits||{};
                  paymentPaid=d.paymentPaid&&typeof d.paymentPaid==='object'?d.paymentPaid:{};
                  paymentRefund=d.paymentRefund&&typeof d.paymentRefund==='object'?d.paymentRefund:{};
                  paymentSupplement=d.paymentSupplement&&typeof d.paymentSupplement==='object'?d.paymentSupplement:{}; paymentRefundDone=d.paymentRefundDone&&typeof d.paymentRefundDone==='object'?d.paymentRefundDone:{}; paymentSupplementDone=d.paymentSupplementDone&&typeof d.paymentSupplementDone==='object'?d.paymentSupplementDone:{}; paymentNotes=d.paymentNotes&&typeof d.paymentNotes==='object'?d.paymentNotes:{}; settlementDashboardOpen=d.settlementDashboardOpen===true;
                  sharePaymentTitle=(typeof d.sharePaymentTitleCustom==='boolean'&&d.sharePaymentTitleCustom)?String(d.sharePaymentTitle||''):(String(d.sharePaymentTitle||'').trim()||'均摊统计'); sharePaymentTitleCustom=d.sharePaymentTitleCustom===true; sharePaymentColor=d.sharePaymentColor||paymentColor||'#d1466a'; sharePaymentViewMode=d.sharePaymentViewMode==='merged'?'merged':'detail'; sharePaymentEdits=d.sharePaymentEdits||{};
                  sharePaymentPaid=d.sharePaymentPaid&&typeof d.sharePaymentPaid==='object'?d.sharePaymentPaid:{}; shareDeductFixed=d.shareDeductFixed===true;
                  sharePaymentRefund=d.sharePaymentRefund&&typeof d.sharePaymentRefund==='object'?d.sharePaymentRefund:{};
                  sharePaymentSupplement=d.sharePaymentSupplement&&typeof d.sharePaymentSupplement==='object'?d.sharePaymentSupplement:{};
                  paymentQrImg=sharedPaymentQrImg;
                  quantityConfigured=d.quantityConfigured===true;
                  boxSize=quantityConfigured&&Number.isFinite(parseInt(d.boxSize,10))?Math.max(1,parseInt(d.boxSize,10)):null;
                  groupSize=quantityConfigured&&Number.isFinite(parseInt(d.groupSize,10))?Math.max(1,parseInt(d.groupSize,10)):null;
                  completeMultiple=quantityConfigured&&Number.isFinite(parseInt(d.completeMultiple,10))?Math.max(1,parseInt(d.completeMultiple,10)):null;
                  $('quantityTitleInput').value=quantityTitle;
            $('boxSizeInput').value=boxSize||''; $('groupSizeInput').value=groupSize||''; $('completeMultipleInput').value=completeMultiple||''; syncQuantityControlLabels();
                  showPricingRow=d.showPricingRow!==false; showUnitPriceRow=d.showUnitPriceRow!==false; showPromotionPointRow=d.showPromotionPointRow!==false; showCompleteRowColor=d.showCompleteRowColor!==false; showColdPromotionColor=d.showColdPromotionColor!==false;
                  coldPromotionHighlights=d.coldPromotionHighlights&&typeof d.coldPromotionHighlights==='object'?deepClone(d.coldPromotionHighlights):{completeRows:[],pendingRows:[]};
                  coldPromotionBatches=Array.isArray(d.coldPromotionBatches)?deepClone(d.coldPromotionBatches):[]; coldPromotionSeriesBaseAllocations=d.coldPromotionSeriesBaseAllocations&&typeof d.coldPromotionSeriesBaseAllocations==='object'?deepClone(d.coldPromotionSeriesBaseAllocations):null; coldPromotionSeriesBaseHighlights=d.coldPromotionSeriesBaseHighlights&&typeof d.coldPromotionSeriesBaseHighlights==='object'?deepClone(d.coldPromotionSeriesBaseHighlights):null; coldPromotionSeriesFormalSignature=String(d.coldPromotionSeriesFormalSignature||'');
                  coldPromotionDraftRows=Array.isArray(d.coldPromotionDraftRows)?deepClone(d.coldPromotionDraftRows):[]; coldPromotionDraftApplied=d.coldPromotionDraftApplied===true;
                  coldPromotionDraftBaseAllocations=d.coldPromotionDraftBaseAllocations&&typeof d.coldPromotionDraftBaseAllocations==='object'?deepClone(d.coldPromotionDraftBaseAllocations):null;
                  coldCarryBundleColumnIds=(Array.isArray(d.coldCarryBundleColumnIds)?d.coldCarryBundleColumnIds:[]).map(Number).filter(id=>columns.some(c=>c.id===id&&c.mode!=='fixed'));
                  syncMatrixOptions();
                  syncCartControls(); saveState(); renderColdBundleConfiguration(); renderColumnList(); recalc();
                }
              }catch(err){ alert('读取失败：'+err.message); }
            };
            reader.readAsText(file); e.target.value='';
          });
          $('clearAllBtn').addEventListener('click',()=>{
            if(!confirm('确定清空当前排单里的全部名字吗？谷子列、图片、价格和其他设置都会保留。')) return;
            if(!pushUndoSnapshot('clear-order','清空排单前')) return;
            allocations={}; columns.forEach(c=>{ allocations[c.id]=[]; }); matrixBoughtCells={}; highlightedPerson=''; coldPromotionHighlights={completeRows:[],pendingRows:[]}; coldPromotionDraftRows=[]; coldPromotionDraftApplied=false; coldPromotionDraftBaseAllocations=null; coldPromotionBatches=[]; coldPromotionSeriesBaseAllocations=null; coldPromotionSeriesBaseHighlights=null; coldPromotionSeriesFormalSignature=''; coldPromotionPreviewRows=[]; coldPromotionPreviewAllocations=null; coldPromotionPlanSignature=''; $('coldPromotionPreviewPanel').style.display='none'; clearMatrixPreview(false);
            saveState(); renderMatrix();
          });
      
          // ---------- boot ----------
          setupCollapsiblePanels();
          $('authRegisterForm').hidden=true; $('authLoginForm').hidden=false;
          $('workspaceInvitesPanel').hidden=true; $('workspaceMembersPanel').hidden=true;
          $('syncCodeInput').value=syncCode;
          $('editorNameInput').value=editorName;
          localStorage.removeItem('ggzCloudAuto');
          setCloudStatus('登录后自动读取协作组');
          loadUndoHistory();
          loadState();
          migrateLegacyColdPromotionDraft();
          rowIdSeed=Math.max(rowIdSeed,...coldPromotionDraftRows.map(row=>(Number(row.id)||0)+1));
          syncCartControls();
          syncPaymentControls();
          syncMatrixOptions();
          renderSheetTabs();
          setAppSection(activeAppSection,false);
          renderColumnList();
          renderColdBundleConfiguration(); syncUndoButton();
          recalc();
          cloudIdleEnabled=true; syncEditLockUI(); renderWorkspaceUI(); syncCollabUI();
          initAuthGate();
        }
      }
      return Component;
    }
  };
})(window);
