/**
 * Gera um ZIP do estado ATUAL do projeto.
 *
 * Esta versão substitui o gerador antigo, que regravava os arquivos a partir
 * de um snapshot 3.5.0 embutido e poderia sobrescrever atualizações recentes.
 * Execute na raiz do projeto com: node gerar-zip-frotawise.mjs
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';

const PROJECT_ROOT = process.cwd();
const ZIP_NAME = 'frotawise-frontend-3.9.0-completo.zip';
const ZIP_OUTPUT = path.join(PROJECT_ROOT, ZIP_NAME);

if (!fs.existsSync(path.join(PROJECT_ROOT, 'package.json'))) {
  throw new Error('Execute este script na raiz do projeto (package.json não encontrado).');
}

if (fs.existsSync(ZIP_OUTPUT)) fs.unlinkSync(ZIP_OUTPUT);

const excludes = [
  'node_modules',
  '.next',
  '.git',
  '.env',
  '.env.local',
  '.env.*.local',
  'coverage',
  '.turbo',
  ZIP_NAME,
  '*.tsbuildinfo',
];

console.log(`Gerando ${ZIP_NAME} a partir dos arquivos atuais...`);
if (process.platform === 'win32') {
  const escapedRoot = PROJECT_ROOT.replace(/'/g, "''");
  const escapedOutput = ZIP_OUTPUT.replace(/'/g, "''");
  const escapedExcludes = excludes.map((item) => `'${item.replace(/'/g, "''")}'`).join(',');
  const command = `$items = Get-ChildItem -LiteralPath '${escapedRoot}' -Force | Where-Object { $_.Name -notin @(${escapedExcludes}) -and $_.Name -notlike '.env.*.local' }; Compress-Archive -Path $items.FullName -DestinationPath '${escapedOutput}' -Force`;
  execFileSync('powershell.exe', ['-NoProfile', '-Command', command], { stdio: 'inherit' });
} else {
  const patterns = excludes.map((item) => `-x '${item}' '${item}/*'`).join(' ');
  execFileSync('bash', ['-lc', `zip -r '${ZIP_OUTPUT.replace(/'/g, "'\\''")}' . ${patterns}`], {
    cwd: PROJECT_ROOT,
    stdio: 'inherit',
  });
}

console.log(`ZIP criado: ${ZIP_OUTPUT}`);
console.log('O pacote não inclui .git, credenciais locais (.env*) nem dependências/cache gerados.');
