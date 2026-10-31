const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const ts=require('typescript');
const root=path.resolve(__dirname,'../..');
const src=p=>fs.readFileSync(path.join(root,p),'utf8');
const spec=require('../../docs/contracts/frotawise-fastapi-v1.json');
function compileTypescript(file) {
 const output=ts.transpileModule(src(file), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}});
 const exports={};
 new Function('exports','module',output.outputText)(exports,{exports});
 return exports;
}
const backend=(method,p)=>Boolean(spec.paths['/v1'+p]?.[method]);
const tests=[
 ['post','/auth/login'],['get','/auth/me'],['post','/auth/logout'],['post','/auth/change-password'],
 ['get','/bootstrap'],['get','/dashboard/resumo'],
 ['get','/empresa/config'],['put','/empresa/config'],
 ['get','/veiculos'],['post','/veiculos'],['get','/veiculos/{item_id}'],['patch','/veiculos/{item_id}'],['delete','/veiculos/{item_id}'],
 ['get','/pneus'],['post','/pneus'],['get','/pneus/{item_id}'],['patch','/pneus/{item_id}'],['delete','/pneus/{item_id}'],['post','/pneus/{item_id}/operacao'],['post','/pneus/{item_id}/concluir-recapagem'],
 ['get','/manutencoes'],['post','/manutencoes'],['patch','/manutencoes/{item_id}'],['delete','/manutencoes/{item_id}'],
 ['get','/multas'],['post','/multas'],['patch','/multas/{item_id}/status'],['delete','/multas/{item_id}'],
 ['get','/abastecimentos'],['post','/abastecimentos'],['patch','/abastecimentos/{item_id}'],['delete','/abastecimentos/{item_id}'],
 ['get','/malha'],['post','/malha'],['put','/malha/{item_id}'],['delete','/malha/{item_id}'],
 ['get','/preventivas/regras'],['post','/preventivas/regras'],['put','/preventivas/regras/{item_id}'],['delete','/preventivas/regras/{item_id}'],
 ['get','/usuarios'],['post','/usuarios'],['patch','/usuarios/{item_id}'],['post','/usuarios/{item_id}/reset-password'],
 ['get','/onboarding/modelo-planilha'],['post','/onboarding/importar-planilha'],['get','/onboarding/exportar-backup'],
];
test('Contrato: 47 métodos reais da API existem no OpenAPI do FastAPI',()=>{
 assert.equal(tests.length,47);
 for(const [m,p] of tests)assert.ok(backend(m,p),`${m.toUpperCase()} /v1${p} não encontrado`);
});
test('Login mapeia usuario+empresa sem retornar JWT ao navegador',()=>{
 const {mapUserFromBackend}=compileTypescript('src/lib/server/user.ts');
 const u=mapUserFromBackend({id:'a',nome:'Teste',email:'test@example.test',role:'ADMIN',empresaId:'e',nomeEmpresa:'FrotaWise Testes'});
 assert.equal(u.papel,'ADMIN');assert.equal(u.tenantId,'e');assert.equal(u.capabilities.canManagePreventiveRules,true);
 assert.equal(u.capabilities.canImportData,true);
 assert.ok(!('accessToken' in u));
});
test('Permissões respeitam role DIRETOR/OPERADOR',()=>{
 const {mapUserFromBackend}=compileTypescript('src/lib/server/user.ts');
 for(const role of ['DIRETOR','OPERADOR']){
  const u=mapUserFromBackend({id:'a',nome:'T',email:'t@test.test',role,empresaId:'e',nomeEmpresa:'E'});
  assert.equal(u.capabilities.canManagePreventiveRules,false);
  assert.equal(u.capabilities.canImportData,false);
  assert.equal(u.capabilities.canExportData,false);
  assert.equal(u.capabilities.canManageVehicles,role==='OPERADOR');
 }
});
test('Mutações passam por anti-CSRF; JWT fica no servidor',()=>{
 assert.match(src('src/lib/http/client.ts'),/fw_csrf/);
 assert.match(src('src/app/api/[...path]/route.ts'),/verifyCsrfForMutation/);
 assert.match(src('src/app/api/auth/login/route.ts'),/httpOnly:\s*true/);
 assert.doesNotMatch(src('src/hooks/useFrotaWiseStore.tsx'),/localStorage\.setItem\(['"](accessToken|fw_session)/);
});
test('Frontend API não usa snapshots locais nem IDs artificiais nas operações reais',()=>{
 const s=src('src/hooks/useFrotaWiseStore.tsx');
 assert.match(s,/liveMode \? \[\] : INITIAL_VEHICLES/);
 assert.match(s,/liveMode \? \[\] : INITIAL_TIRES/);
 assert.match(s,/if \(isLive\) \{ setHydrated\(true\); return; \}/);
 const m=src('src/components/forms/GlobalModals.tsx');
 assert.match(m,/awaitLive\('post', '\/veiculos'/);
 assert.match(m,/awaitLive\('post', '\/pneus'/);
 assert.match(m,/awaitLive\('post', '\/manutencoes'/);
 assert.match(m,/awaitLive\('post', '\/abastecimentos'/);
 assert.match(m,/awaitLive\('post', '\/multas'/);
});
test('BFF aceita endpoints de regras/usuários/bootstrap e bloqueia rotas arbitrárias',()=>{
 const s=src('src/app/api/[...path]/route.ts');
 for(const seg of ['bootstrap','preventivas','malha','usuarios','onboarding'])assert.ok(s.includes("'"+seg+"'"));
 assert.match(s,/return ALLOWED_TOP_SEGMENTS\.has/);
 assert.match(s,/seg\.includes\('\\\\'\)/);
});
test('Uploads e downloads são transmitidos sem converter binário em JSON',()=>{
 const s=src('src/app/api/[...path]/route.ts');
 assert.match(s,/request\.formData\(\)/);
 assert.match(s,/upstreamResponse\.arrayBuffer\(\)/);
 assert.match(s,/responseBody = upstreamResponse\.status === 204/);
});
test('Configuração aponta para a API HTTPS do Render, com BFF same-origin',()=>{
 const env=src('.env.example');
 assert.match(env,/BACKEND_API_URL=https:\/\/frotawise-api\.onrender\.com\/v1/);
 assert.match(env,/NEXT_PUBLIC_BFF_BASE_PATH=\/api/);
 assert.doesNotMatch(env,/JWT_SECRET|postgresql/);
});
