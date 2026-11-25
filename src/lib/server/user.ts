/** Normaliza as respostas reais do FastAPI, sem inventar permissões. */
export function mapUserFromBackend(data: {
  id: string;
  nome: string;
  email: string;
  role: string;
  empresaId: string;
  nomeEmpresa: string;
  limiteVeiculos?: number | null;
  limiteVeiculosEmpresa?: number | null;
  veiculosCadastrados?: number;
  veiculosEmpresa?: number;
}) {
  const role = data.role;
  const write = role === 'ADMIN' || role === 'OPERADOR';
  return {
    id: data.id, nome: data.nome, email: data.email,
    papel: role, tenantId: data.empresaId, nomeEmpresa: data.nomeEmpresa,
    limiteVeiculos: data.limiteVeiculos ?? null,
    limiteVeiculosEmpresa: data.limiteVeiculosEmpresa ?? null,
    veiculosCadastrados: data.veiculosCadastrados ?? 0,
    veiculosEmpresa: data.veiculosEmpresa ?? 0,
    capabilities: {
      canManageVehicles: write, canManageTires: write, canManageMalha: write,
      canManagePreventiveRules: role === 'ADMIN', canManageFuelings: write,
      canManageMaintenances: write, canManageFines: write,
      canImportData: role === 'ADMIN', canExportData: role === 'ADMIN'
    }
  };
}
