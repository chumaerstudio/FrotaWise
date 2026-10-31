$ErrorActionPreference = 'Stop'

Write-Host 'FrotaWise - preparação para Node.js 24' -ForegroundColor Cyan

try {
  $nodeVersion = (node -p "process.versions.node").Trim()
  $npmVersion = (npm -v).Trim()
} catch {
  Write-Error 'Node.js/npm não encontrados no PATH. Instale Node.js 24 e abra um novo PowerShell.'
  exit 1
}

$nodeMajor = [int]($nodeVersion.Split('.')[0])
Write-Host "Node.js: $nodeVersion"
Write-Host "npm: $npmVersion"
if ($nodeMajor -ne 24) {
  Write-Warning 'Este projeto foi configurado para Node.js 24.x. O comando seguirá, mas verifique a versão indicada acima.'
}

Write-Host 'Sincronizando package-lock.json com package.json via npm install...' -ForegroundColor Yellow
npm install --no-audit --no-fund
if ($LASTEXITCODE -ne 0) {
  Write-Error 'npm install falhou. Confira a conexão com a internet e o log do npm; não execute npm ci até a sincronização terminar.'
  exit $LASTEXITCODE
}

Write-Host 'Lockfile sincronizado. Agora você pode validar o projeto:' -ForegroundColor Green
Write-Host '  npm run type-check'
Write-Host '  npm test'
Write-Host '  npm run build'
Write-Host '  npm run dev'
