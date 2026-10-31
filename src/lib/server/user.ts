/** Normaliza as respostas reais do FastAPI, sem inventar permissões. */
export function mapUserFromBackend(data: {id: string; nome: string; email: string; role: string; empresaId: string; nomeEmpresa: string}) {
  const role = data.role;
  const write = role === 'ADMIN' || role === 'OPERADOR';
  return {
    id: data.id, nome: data.nome, email: data.email,
    papel: role, tenantId: data.empresaId, nomeEmpresa: data.nomeEmpresa,
    capabilities: {
      canManageVehicles: write, canManageTires: write, canManageMalha: write,
      canManagePreventiveRules: role === 'ADMIN', canManageFuelings: write,
      canManageMaintenances: write, canManageFines: write,
      canImportData: role === 'ADMIN', canExportData: role === 'ADMIN'
    }
  };
}
