export type RampStatus = 'piso_plano' | 'aprovado' | 'atencao' | 'reprovado' | 'inviavel';

export interface RampResult {
  h: number;
  c: number;
  i: number;
  status: RampStatus;
  message: string;
  maxHeightPerSegment: number;
  segmentsNeeded: number;
  landingsCount: number;
  totalProjection: number;
  ratio: string;
}

export function calculateRamp(
  hInput: number | null,
  cInput: number | null,
  iInput: number | null
): RampResult | null {
  let h = hInput !== null ? hInput : 0;
  let c = cInput !== null ? cInput : 0;
  let i = iInput !== null ? iInput : 0;

  // Precisamos de exatamente 2 valores
  const inputsCount = [hInput, cInput, iInput].filter(val => val !== null && val > 0).length;
  if (inputsCount !== 2) return null;

  // Calcula o valor faltante
  if (!iInput && hInput && cInput) {
    i = (h / c) * 100;
  } else if (!cInput && hInput && iInput) {
    c = (h * 100) / i;
  } else if (!hInput && iInput && cInput) {
    h = (i * c) / 100;
  }

  // Se algum valor for menor ou igual a 0 ou inválido, retorna nulo
  if (h <= 0 || c <= 0 || i <= 0 || isNaN(h) || isNaN(c) || isNaN(i)) {
    return null;
  }

  // Validação segundo NBR 9050
  let status: RampStatus = 'aprovado';
  let message = '';
  let maxHeightPerSegment = 0;
  let maxSegmentsAllowed = Infinity;
  let ratio = '';

  if (i <= 5) {
    status = 'piso_plano';
    message = 'Piso plano (Não requer regras de rampa).';
    maxHeightPerSegment = Infinity;
    maxSegmentsAllowed = Infinity;
    ratio = '1:20';
  } else if (i <= 6.25) {
    status = 'aprovado';
    message = 'Aprovado. Desnível máximo por segmento de 1.00m.';
    maxHeightPerSegment = 1.00;
    maxSegmentsAllowed = Infinity;
    ratio = '1:16';
  } else if (i <= 8.33) {
    status = 'aprovado';
    message = 'Aprovado. Desnível máximo por segmento de 0.80m.';
    maxHeightPerSegment = 0.80;
    maxSegmentsAllowed = 15;
    ratio = '1:12';
  } else if (i <= 10) {
    status = 'atencao';
    message = 'Atenção. Permitido apenas em reformas. Desnível máximo por segmento de 0.20m.';
    maxHeightPerSegment = 0.20;
    maxSegmentsAllowed = 4;
    ratio = '1:10';
  } else if (i <= 12.5) {
    status = 'atencao';
    message = 'Atenção. Permitido apenas em reformas. Desnível máximo por segmento de 0.075m.';
    maxHeightPerSegment = 0.075;
    maxSegmentsAllowed = 1;
    ratio = '1:8';
  } else {
    status = 'reprovado';
    message = 'Reprovado - Fora da norma para cadeirantes.';
    maxHeightPerSegment = 0;
    maxSegmentsAllowed = 0;
    ratio = '-';
  }

  let segmentsNeeded = 1;
  let landingsCount = 0;
  let totalProjection = c;

  if (status !== 'reprovado' && status !== 'piso_plano') {
    if (h > maxHeightPerSegment) {
      segmentsNeeded = Math.ceil(h / maxHeightPerSegment);
    }
    
    // Validação de limite de segmentos
    if (segmentsNeeded > maxSegmentsAllowed) {
      status = 'inviavel';
      message = 'Projeto inviável: excede o limite de segmentos permitidos para esta inclinação.';
    } else {
      landingsCount = segmentsNeeded - 1;
      totalProjection = c + (landingsCount * 1.20);
    }
  }

  return {
    h: Number(h.toFixed(3)),
    c: Number(c.toFixed(3)),
    i: Number(i.toFixed(2)),
    status,
    message,
    maxHeightPerSegment,
    segmentsNeeded,
    landingsCount,
    totalProjection: Number(totalProjection.toFixed(3)),
    ratio
  };
}
