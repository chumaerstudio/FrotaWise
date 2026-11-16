import { describe, expect, it } from 'vitest';
import { friendlyError } from '@/lib/errors';

describe('mensagens públicas de erro', () => {
  it('mantém uma validação útil retornada pela operação', () => {
    expect(friendlyError({ response: { status: 422, data: { detail: 'Quilometragem inferior ao último registro.' } } }))
      .toBe('Quilometragem inferior ao último registro.');
  });

  it('não revela mensagens técnicas da infraestrutura', () => {
    expect(friendlyError({ response: { status: 400, data: { detail: 'Erro da API no PostgreSQL' } } }))
      .toBe('Não foi possível concluir a operação. Tente novamente.');
  });

  it('explica sessão expirada e falta de permissão', () => {
    expect(friendlyError({ response: { status: 401 } })).toBe('Sua sessão expirou. Entre novamente.');
    expect(friendlyError({ response: { status: 403 } })).toBe('Você não tem permissão para realizar esta ação.');
  });

  it('não sugere sucesso quando o serviço não respondeu', () => {
    expect(friendlyError({ message: 'Network Error' })).toContain('indisponível');
  });
});
