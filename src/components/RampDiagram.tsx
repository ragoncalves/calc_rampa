import type { RampStatus } from '../utils/rampCalculations';

interface RampDiagramProps {
  status: RampStatus;
  segmentsNeeded: number;
  totalProjection: number;
  h: number;
  c: number;
}

export function RampDiagram({ status, segmentsNeeded, totalProjection, h, c }: RampDiagramProps) {
  if (status === 'reprovado' || status === 'inviavel' || h <= 0 || c <= 0) {
    return null; // Não desenha se for inválido
  }

  const viewBoxWidth = 500;
  const viewBoxHeight = 200;
  const marginX = 20;
  const marginY = 20;
  
  const drawWidth = viewBoxWidth - marginX * 2;
  const drawHeight = viewBoxHeight - marginY * 2;

  const groundY = viewBoxHeight - marginY;

  // Calculando proporções
  const patamarSize = 1.20;
  const cPerSegment = c / segmentsNeeded;
  const hPerSegment = h / segmentsNeeded;

  // Determinar cores baseadas no status
  let strokeColor = '#10b981'; // emerald-500
  let fillColor = '#d1fae5'; // emerald-100
  
  if (status === 'atencao') {
    strokeColor = '#f59e0b'; // amber-500
    fillColor = '#fef3c7'; // amber-100
  } else if (status === 'piso_plano') {
    strokeColor = '#6b7280'; // gray-500
    fillColor = '#f3f4f6'; // gray-100
  }

  let currentX = viewBoxWidth - marginX;
  let currentY = groundY;

  // Iniciando o caminho da rampa (do topo/base até o fim)
  // Vamos desenhar da direita (chão) para a esquerda (topo)
  let pathD = `M ${currentX} ${currentY}`;
  
  for (let i = 0; i < segmentsNeeded; i++) {
    // Sobe a rampa (esquerda e cima)
    const dxRamp = (cPerSegment / totalProjection) * drawWidth;
    const dyRamp = (hPerSegment / h) * drawHeight;
    
    currentX -= dxRamp;
    currentY -= dyRamp;
    pathD += ` L ${currentX} ${currentY}`;
    
    // Desenha o patamar se não for o último segmento
    if (i < segmentsNeeded - 1) {
      const dxPatamar = (patamarSize / totalProjection) * drawWidth;
      currentX -= dxPatamar;
      pathD += ` L ${currentX} ${currentY}`;
    }
  }

  // Fechando o polígono para preenchimento
  const fillPathD = `${pathD} L ${currentX} ${groundY} Z`;

  return (
    <div className="w-full mt-4 flex flex-col items-center select-none pointer-events-none">
      <svg 
        viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`} 
        className="w-full h-auto max-h-20 drop-shadow-sm"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Preenchimento sob a rampa */}
        <path d={fillPathD} fill={fillColor} opacity={0.6} />
        
        {/* Linha da rampa */}
        <path 
          d={pathD} 
          fill="none" 
          stroke={strokeColor} 
          strokeWidth="4" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
        />
        
        {/* Linha do chão */}
        <line 
          x1={marginX} 
          y1={groundY} 
          x2={viewBoxWidth - marginX} 
          y2={groundY} 
          stroke="#9ca3af" // gray-400
          strokeWidth="2" 
          strokeLinecap="round" 
        />
        
        {/* Tracejado de altura máxima */}
        <line
          x1={currentX}
          y1={currentY}
          x2={currentX}
          y2={groundY}
          stroke="#9ca3af"
          strokeWidth="1.5"
          strokeDasharray="4 4"
        />
      </svg>
    </div>
  );
}
