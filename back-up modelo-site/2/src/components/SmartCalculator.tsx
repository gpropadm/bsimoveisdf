'use client';

import { useState, useEffect } from 'react';

interface SmartCalculatorProps {
  propertyPrice: number;
  propertyType: string;
}

interface FinancingCalculation {
  monthlyPayment: number;
  totalAmount: number;
  totalInterest: number;
  downPayment: number;
  financedAmount: number;
  monthlyIncome: number;
  affordability: string;
  recommendation: string;
}

export default function SmartCalculator({ propertyPrice, propertyType }: SmartCalculatorProps) {
  const [downPaymentPercentage, setDownPaymentPercentage] = useState(20);
  const [loanTermYears, setLoanTermYears] = useState(30);
  const [interestRate, setInterestRate] = useState(10.5);
  const [monthlyIncome, setMonthlyIncome] = useState(10000);
  const [calculation, setCalculation] = useState<FinancingCalculation | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    calculateFinancing();
  }, [downPaymentPercentage, loanTermYears, interestRate, monthlyIncome, propertyPrice]);

  const calculateFinancing = () => {
    const downPayment = (propertyPrice * downPaymentPercentage) / 100;
    const financedAmount = propertyPrice - downPayment;
    const monthlyInterestRate = interestRate / 100 / 12;
    const numberOfPayments = loanTermYears * 12;

    let monthlyPayment = 0;
    if (monthlyInterestRate > 0) {
      monthlyPayment =
        (financedAmount * monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) /
        (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);
    } else {
      monthlyPayment = financedAmount / numberOfPayments;
    }

    const totalAmount = monthlyPayment * numberOfPayments + downPayment;
    const totalInterest = totalAmount - propertyPrice;

    // Calculando comprometimento da renda
    const incomeRatio = (monthlyPayment / monthlyIncome) * 100;
    let affordability = '';
    let recommendation = '';

    if (incomeRatio <= 30) {
      affordability = 'Excelente';
      recommendation = '✅ Financiamento muito viável! Sua renda permite esta compra com folga.';
    } else if (incomeRatio <= 40) {
      affordability = 'Bom';
      recommendation = '⚠️ Financiamento viável, mas considere uma entrada maior para reduzir as parcelas.';
    } else if (incomeRatio <= 50) {
      affordability = 'Apertado';
      recommendation = '🔴 Muito comprometimento da renda. Considere um imóvel mais barato ou aumente sua entrada.';
    } else {
      affordability = 'Inviável';
      recommendation = '❌ Financiamento inviável. Considere aumentar sua renda ou procurar um imóvel mais barato.';
    }

    setCalculation({
      monthlyPayment,
      totalAmount,
      totalInterest,
      downPayment,
      financedAmount,
      monthlyIncome,
      affordability,
      recommendation
    });
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="bg-white rounded-3 border p-4 mb-4" style={{ borderColor: '#e9ecef' }}>
      <div
        className="d-flex align-items-center justify-content-between mb-3"
        style={{ cursor: 'pointer' }}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <h4
          className="fw-bold mb-0 font-sora d-flex align-items-center"
          style={{
            fontSize: '16px',
            color: '#212529'
          }}
        >
          🧮 Simulador Inteligente
          <span
            className="ms-2 text-primary"
            style={{ fontSize: '12px' }}
          >
            IA
          </span>
        </h4>
        <i
          className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}
          style={{ fontSize: '14px', color: '#6c757d' }}
        ></i>
      </div>

      {/* Preview quando fechado */}
      {!isExpanded && calculation && (
        <div className="text-center">
          <div
            className="fw-bold font-sora mb-1"
            style={{
              fontSize: '20px',
              color: '#28a745'
            }}
          >
            {formatCurrency(calculation.monthlyPayment)}
          </div>
          <div
            className="font-sora"
            style={{
              fontSize: '12px',
              color: '#6c757d'
            }}
          >
            Parcela mensal estimada
          </div>
        </div>
      )}

      {/* Calculadora expandida */}
      {isExpanded && (
        <div>
          {/* Controles de Simulação */}
          <div className="mb-4">
            <div className="mb-3">
              <label
                className="font-sora fw-semibold"
                style={{ fontSize: '13px', color: '#495057' }}
              >
                Entrada ({downPaymentPercentage}%)
              </label>
              <input
                type="range"
                className="form-range"
                min="10"
                max="50"
                step="5"
                value={downPaymentPercentage}
                onChange={(e) => setDownPaymentPercentage(Number(e.target.value))}
              />
              <div className="d-flex justify-content-between">
                <small style={{ color: '#6c757d' }}>10%</small>
                <small style={{ color: '#6c757d' }}>50%</small>
              </div>
            </div>

            <div className="mb-3">
              <label
                className="font-sora fw-semibold"
                style={{ fontSize: '13px', color: '#495057' }}
              >
                Prazo ({loanTermYears} anos)
              </label>
              <input
                type="range"
                className="form-range"
                min="10"
                max="35"
                step="5"
                value={loanTermYears}
                onChange={(e) => setLoanTermYears(Number(e.target.value))}
              />
              <div className="d-flex justify-content-between">
                <small style={{ color: '#6c757d' }}>10 anos</small>
                <small style={{ color: '#6c757d' }}>35 anos</small>
              </div>
            </div>

            <div className="mb-3">
              <label
                className="font-sora fw-semibold"
                style={{ fontSize: '13px', color: '#495057' }}
              >
                Sua renda mensal
              </label>
              <input
                type="number"
                className="form-control"
                value={monthlyIncome}
                onChange={(e) => setMonthlyIncome(Number(e.target.value))}
                placeholder="Ex: 10000"
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>

          {/* Resultados */}
          {calculation && (
            <div>
              <div
                className="p-3 rounded-2 mb-3"
                style={{
                  backgroundColor: calculation.affordability === 'Excelente' ? '#d4edda' :
                               calculation.affordability === 'Bom' ? '#fff3cd' :
                               calculation.affordability === 'Apertado' ? '#f8d7da' : '#f8d7da',
                  border: `1px solid ${calculation.affordability === 'Excelente' ? '#c3e6cb' :
                                    calculation.affordability === 'Bom' ? '#ffeaa7' :
                                    calculation.affordability === 'Apertado' ? '#f5c6cb' : '#f5c6cb'}`
                }}
              >
                <div className="text-center">
                  <div
                    className="fw-bold font-sora mb-2"
                    style={{
                      fontSize: '24px',
                      color: calculation.affordability === 'Excelente' ? '#155724' :
                           calculation.affordability === 'Bom' ? '#856404' : '#721c24'
                    }}
                  >
                    {formatCurrency(calculation.monthlyPayment)}
                  </div>
                  <div
                    className="font-sora mb-2"
                    style={{ fontSize: '12px', color: '#6c757d' }}
                  >
                    Parcela mensal
                  </div>
                  <div
                    className="fw-bold font-sora"
                    style={{
                      fontSize: '14px',
                      color: calculation.affordability === 'Excelente' ? '#155724' :
                           calculation.affordability === 'Bom' ? '#856404' : '#721c24'
                    }}
                  >
                    Viabilidade: {calculation.affordability}
                  </div>
                </div>
              </div>

              {/* Detalhes */}
              <div className="row g-2 mb-3">
                <div className="col-6">
                  <div className="text-center">
                    <div
                      className="fw-bold font-sora"
                      style={{ fontSize: '16px', color: '#212529' }}
                    >
                      {formatCurrency(calculation.downPayment)}
                    </div>
                    <div
                      className="font-sora"
                      style={{ fontSize: '11px', color: '#6c757d' }}
                    >
                      Entrada
                    </div>
                  </div>
                </div>
                <div className="col-6">
                  <div className="text-center">
                    <div
                      className="fw-bold font-sora"
                      style={{ fontSize: '16px', color: '#212529' }}
                    >
                      {((calculation.monthlyPayment / calculation.monthlyIncome) * 100).toFixed(1)}%
                    </div>
                    <div
                      className="font-sora"
                      style={{ fontSize: '11px', color: '#6c757d' }}
                    >
                      Da renda
                    </div>
                  </div>
                </div>
              </div>

              {/* Recomendação da IA */}
              <div
                className="p-3 rounded-2 border"
                style={{
                  backgroundColor: '#f8f9fa',
                  borderColor: '#e9ecef'
                }}
              >
                <div className="d-flex align-items-start">
                  <div className="me-2">🤖</div>
                  <div>
                    <div
                      className="fw-bold font-sora mb-1"
                      style={{ fontSize: '12px', color: '#495057' }}
                    >
                      Análise Inteligente:
                    </div>
                    <p
                      className="font-sora mb-0"
                      style={{ fontSize: '11px', color: '#6c757d', lineHeight: '1.4' }}
                    >
                      {calculation.recommendation}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botão de Ação */}
              <div className="mt-3">
                <button
                  className="btn btn-primary w-100 py-2 font-sora fw-semibold"
                  style={{
                    backgroundColor: '#4f2de8',
                    borderColor: '#4f2de8',
                    fontSize: '14px'
                  }}
                  onClick={() => {
                    const message = `Olá! Gostaria de simular o financiamento do imóvel no valor de ${formatCurrency(propertyPrice)}:\n\n💰 Entrada: ${formatCurrency(calculation.downPayment)} (${downPaymentPercentage}%)\n📅 Prazo: ${loanTermYears} anos\n📊 Parcela mensal: ${formatCurrency(calculation.monthlyPayment)}\n\nPode me ajudar com mais detalhes?`;
                    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(message)}`;
                    window.open(whatsappUrl, '_blank');
                  }}
                >
                  💬 Falar com Especialista
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}