'use client';

import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Pneu } from '@/types/frotawise';
import { formatCurrency } from '@/services/api';
import { SectionHead, Btn } from '@/components/ui';

export const ExpensesByVehicleBarChart: React.FC<{
  data: { placa: string; Manutencao: number; Multas: number }[];
  theme: 'light' | 'dark';
  onOpenExpenses: () => void;
}> = ({ data, theme, onOpenExpenses }) => {
  const C =
    theme === 'dark'
      ? { tick: '#9FB1CC', grid: '#1B2D49', bar: '#7FA8DE', tipBg: '#0E1B2E', tipC: '#E8EFF9' }
      : { tick: '#475A78', grid: '#E5EAF2', bar: '#0E2C50', tipBg: '#FFFFFF', tipC: '#0E2240' };
  const tip = {
    borderRadius: 10,
    border: `1px solid ${C.grid}`,
    fontSize: 13,
    background: C.tipBg,
    color: C.tipC,
  };

  return (
    <div className="card ef-rise" style={{ animationDelay: '120ms' }}>
      <SectionHead title="Despesas por veículo" sub="Manutenções e multas, por placa">
        <Btn sm onClick={onOpenExpenses}>
          Abrir despesas
        </Btn>
      </SectionHead>
      <div className="h-64 p-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
            <XAxis dataKey="placa" tick={{ fontSize: 12, fill: C.tick }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12, fill: C.tick }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v: number) => formatCurrency(v)}
              contentStyle={tip}
              itemStyle={{ color: C.tipC }}
              labelStyle={{ color: C.tipC }}
              cursor={{ fill: 'rgba(14,124,123,.06)' }}
            />
            <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
            <Bar dataKey="Manutencao" name="Manutenções" fill={C.bar} radius={[6, 6, 0, 0]} />
            <Bar dataKey="Multas" name="Multas" fill="#C8372D" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export const TiresPortfolioDonutChart: React.FC<{
  tires: Pneu[];
  stockCount: number;
  theme: 'light' | 'dark';
}> = ({ tires, stockCount, theme }) => {
  const C =
    theme === 'dark'
      ? { tick: '#9FB1CC', grid: '#1B2D49', bar: '#7FA8DE', tipBg: '#0E1B2E', tipC: '#E8EFF9' }
      : { tick: '#475A78', grid: '#E5EAF2', bar: '#0E2C50', tipBg: '#FFFFFF', tipC: '#0E2240' };

  const pieData = [
    { name: 'Rodando', value: tires.filter((t) => !!t.veiculoAtualId).length, color: C.bar },
    { name: 'Em estoque', value: stockCount, color: '#18B389' },
    { name: 'Para recapar', value: tires.filter((t) => t.classificacao === 'Recapar').length, color: '#F2B01E' },
    { name: 'Sucateados', value: tires.filter((t) => t.classificacao === 'Sucatear').length, color: '#C8372D' },
  ].filter((d) => d.value > 0);

  const tip = {
    borderRadius: 10,
    border: `1px solid ${C.grid}`,
    fontSize: 13,
    background: C.tipBg,
    color: C.tipC,
  };

  return (
    <div className="card ef-rise" style={{ animationDelay: '180ms' }}>
      <SectionHead title="Distribuição dos pneus" sub="Situação de toda a carteira" />
      <div className="h-64 p-4 relative">
        <div className="ef-donut-center">
          <div className="disp ef-t26 font-semibold leading-none">{tires.length}</div>
          <div className="ef-t12" style={{ color: 'var(--mute)' }}>
            pneus
          </div>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy={96}
              innerRadius={54}
              outerRadius={80}
              paddingAngle={3}
              stroke="none"
            >
              {pieData.map((e, i) => (
                <Cell key={i} fill={e.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={tip} itemStyle={{ color: C.tipC }} labelStyle={{ color: C.tipC }} />
            <Legend verticalAlign="bottom" iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
