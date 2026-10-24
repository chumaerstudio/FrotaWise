'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Pneu, StatusPneu } from '@/types/frotawise';
import { pneusService } from '@/services/pneusService';

export function useEstoquePneus() {
  const [pneus, setPneus] = useState<Pneu[]>([]);
  const [carregando, setCarregando] = useState<boolean>(true);
  const [filtroStatus, setFiltroStatus] = useState<StatusPneu | 'TODOS'>('TODOS');
  const [termoBusca, setTermoBusca] = useState<string>('');
  const [mensagemOperacao, setMensagemOperacao] = useState<string | null>(null);

  const carregarEstoque = useCallback(async () => {
    setCarregando(true);
    const dados = await pneusService.listarPneus();
    setPneus(dados);
    setCarregando(false);
  }, []);

  useEffect(() => {
    carregarEstoque();
  }, [carregarEstoque]);

  const pneusFiltrados = useMemo(() => {
    return pneus.filter((pneu) => {
      const correspondeStatus = filtroStatus === 'TODOS' || pneu.status === filtroStatus;
      const correspondeBusca =
        termoBusca.trim() === '' ||
        pneu.numeroFogo.toLowerCase().includes(termoBusca.toLowerCase()) ||
        pneu.marca.toLowerCase().includes(termoBusca.toLowerCase()) ||
        (pneu.veiculoPlaca && pneu.veiculoPlaca.toLowerCase().includes(termoBusca.toLowerCase()));
      return correspondeStatus && correspondeBusca;
    });
  }, [pneus, filtroStatus, termoBusca]);

  const dispararRemold = useCallback(async (pneuId: string) => {
    const resposta = await pneusService.enviarParaRemold(pneuId);
    if (resposta.sucesso) {
      setPneus((estadoAnterior) =>
        estadoAnterior.map((p) =>
          p.id === pneuId
            ? {
                ...p,
                status: 'EM_REMOLD',
                veiculoId: undefined,
                veiculoPlaca: undefined,
                posicaoEixo: undefined,
              }
            : p
        )
      );
      setMensagemOperacao(`Ordem de Remold gerada com sucesso! Protocolo: ${resposta.protocolo}`);
      setTimeout(() => setMensagemOperacao(null), 5000);
    }
  }, []);

  const alocarEmVeiculo = useCallback(
    async (pneuId: string, veiculoPlaca: string, posicaoCodigo: string) => {
      const resposta = await pneusService.alocarPneu({
        pneuId,
        veiculoId: veiculoPlaca,
        posicaoCodigo,
        odometroVeiculoKm: 285000,
        pressaoInicialPsi: 112,
      });

      if (resposta.sucesso) {
        setPneus((estadoAnterior) =>
          estadoAnterior.map((p) =>
            p.id === pneuId
              ? {
                  ...p,
                  status: 'EM_USO',
                  veiculoPlaca,
                  posicaoEixo: posicaoCodigo,
                }
              : p
          )
        );
        setMensagemOperacao(resposta.mensagem);
        setTimeout(() => setMensagemOperacao(null), 5000);
      }
    },
    []
  );

  return {
    pneus: pneusFiltrados,
    totalBruto: pneus.length,
    carregando,
    filtroStatus,
    setFiltroStatus,
    termoBusca,
    setTermoBusca,
    mensagemOperacao,
    dispararRemold,
    alocarEmVeiculo,
    recarregar: carregarEstoque,
  };
}
