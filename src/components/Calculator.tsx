import { useState, useEffect } from 'react';
import { Calculator as CalculatorIcon, AlertTriangle, AlertCircle, CheckCircle2, RotateCcw, Ruler, XCircle, Ban } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Input, cn } from './ui/Input';
import { calculateRamp, type RampResult } from '../utils/rampCalculations';
import { RampDiagram } from './RampDiagram';

type Field = 'h' | 'c' | 'i';

export function Calculator() {
  const [values, setValues] = useState<{ h: string; c: string; i: string }>({
    h: '',
    c: '',
    i: ''
  });
  
  const [largura, setLargura] = useState<string>('1.20');
  const [activeFields, setActiveFields] = useState<Field[]>([]);
  const [result, setResult] = useState<RampResult | null>(null);

  const handleInputChange = (field: Field, value: string) => {
    if (value && !/^\d*\.?\d*$/.test(value)) return;

    let newActive = [...activeFields];
    if (value === '') {
      newActive = newActive.filter(f => f !== field);
    } else if (!newActive.includes(field)) {
      newActive.push(field);
      if (newActive.length > 2) {
        newActive.shift();
      }
    }

    setActiveFields(newActive);
    
    setValues(prev => {
      const next = { ...prev, [field]: value };
      
      if (value === '') {
        const computedField = (['h', 'c', 'i'] as Field[]).find(f => !newActive.includes(f));
        if (computedField && newActive.length < 2) {
          next[computedField] = '';
        }
      }
      return next;
    });
  };

  useEffect(() => {
    if (activeFields.length === 2) {
      const field1 = activeFields[0];
      const field2 = activeFields[1];
      const val1 = parseFloat(values[field1]);
      const val2 = parseFloat(values[field2]);

      if (!isNaN(val1) && !isNaN(val2) && val1 > 0 && val2 > 0) {
        const hInput = activeFields.includes('h') ? parseFloat(values.h) : null;
        const cInput = activeFields.includes('c') ? parseFloat(values.c) : null;
        const iInput = activeFields.includes('i') ? parseFloat(values.i) : null;

        const res = calculateRamp(hInput, cInput, iInput);
        if (res) {
          setResult(res);
          const computedField = (['h', 'c', 'i'] as Field[]).find(f => !activeFields.includes(f))!;
          setValues(prev => ({
            ...prev,
            [computedField]: String(res[computedField])
          }));

          // Vibrate if critical error
          if ((res.status === 'reprovado' || res.status === 'inviavel') && typeof navigator !== 'undefined' && navigator.vibrate) {
            navigator.vibrate([200, 100, 200]);
          }
        } else {
          setResult(null);
        }
      } else {
        setResult(null);
      }
    } else {
      setResult(null);
    }
  }, [activeFields, values.h, values.c, values.i]);

  const clearAll = () => {
    setValues({ h: '', c: '', i: '' });
    setActiveFields([]);
    setResult(null);
    setLargura('1.20');
  };

  const statusConfig = {
    piso_plano: { color: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-200', icon: Ruler },
    aprovado: { color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', icon: CheckCircle2 },
    atencao: { color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200', icon: AlertTriangle },
    reprovado: { color: 'text-red-700', bg: 'bg-red-50', border: 'border-red-200', icon: XCircle },
    inviavel: { color: 'text-red-800', bg: 'bg-red-100', border: 'border-red-300', icon: Ban }
  };

  const currentConfig = result ? statusConfig[result.status] : null;
  const StatusIcon = currentConfig?.icon || AlertCircle;
  
  const numLargura = parseFloat(largura);
  const isLarguraWarning = !isNaN(numLargura) && numLargura < 1.20;

  return (
    <div className="w-full max-w-md mx-auto space-y-4 pb-4">
      <Card className="border-gray-200 shadow-sm rounded-3xl">
        <CardHeader className="flex flex-row items-center justify-between pb-4 pt-4 px-5 bg-white border-b-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gray-100 rounded-xl">
              <CalculatorIcon className="w-5 h-5 text-gray-800" />
            </div>
            <CardTitle className="text-lg font-medium tracking-tight">Cálculo NBR 9050</CardTitle>
          </div>
          <button
            onClick={clearAll}
            className="p-2 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-200"
            title="Limpar campos"
            aria-label="Limpar calculadora"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </CardHeader>
        
        <CardContent className="space-y-4 px-5 pb-5">
          <div className="space-y-3">
            <Input
              label="Desnível / Altura (h)"
              unit="m"
              value={values.h}
              onChange={(e) => handleInputChange('h', e.target.value)}
              placeholder="Ex: 0.80"
              inputMode="decimal"
              className={cn("h-12 text-base transition-colors", !activeFields.includes('h') && values.h ? "bg-gray-50 border-transparent font-medium text-gray-600" : "")}
            />

            <Input
              label="Comprimento da Rampa (c)"
              unit="m"
              value={values.c}
              onChange={(e) => handleInputChange('c', e.target.value)}
              placeholder="Ex: 10.00"
              inputMode="decimal"
              className={cn("h-12 text-base transition-colors", !activeFields.includes('c') && values.c ? "bg-gray-50 border-transparent font-medium text-gray-600" : "")}
            />

            <Input
              label="Inclinação (i)"
              unit="%"
              value={values.i}
              onChange={(e) => handleInputChange('i', e.target.value)}
              placeholder="Ex: 8.33"
              inputMode="decimal"
              className={cn("h-12 text-base transition-colors", !activeFields.includes('i') && values.i ? "bg-gray-50 border-transparent font-medium text-gray-600" : "")}
            />

            <Input
              label="Largura Livre (L) - Opcional"
              unit="m"
              value={largura}
              onChange={(e) => {
                const val = e.target.value;
                if (!val || /^\d*\.?\d*$/.test(val)) setLargura(val);
              }}
              placeholder="Ex: 1.20"
              inputMode="decimal"
              className="h-12 text-base"
            />
            {isLarguraWarning && (
              <div className="mt-3 flex items-start gap-2 text-amber-700 bg-amber-50 p-3 rounded-xl border border-amber-100">
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="text-sm font-medium leading-tight">
                  A largura livre mínima recomendada pela norma é de 1.20m.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {result && currentConfig && (
        <Card className={cn("border-2 transition-all duration-500 rounded-3xl overflow-hidden", currentConfig.border, currentConfig.bg)}>
          <CardContent className="p-5">
            <div className="flex items-start gap-3">
              <StatusIcon className={cn("w-6 h-6 shrink-0", currentConfig.color)} />
              <div className="space-y-1">
                <h4 className={cn("text-base font-semibold tracking-tight", currentConfig.color)}>
                  {result.status.charAt(0).toUpperCase() + result.status.slice(1).replace('_', ' ')}
                </h4>
                <p className={cn("text-sm leading-snug font-medium", currentConfig.color, "opacity-90")}>
                  {result.message}
                </p>
                {result.ratio !== '-' && (
                  <p className={cn("text-sm font-bold mt-1 opacity-75", currentConfig.color)}>
                    Proporção Exigida: {result.ratio}
                  </p>
                )}
              </div>
            </div>

            <RampDiagram 
              status={result.status} 
              segmentsNeeded={result.segmentsNeeded} 
              totalProjection={result.totalProjection}
              h={result.h}
              c={result.c}
            />
            
            {(result.segmentsNeeded > 1 || result.landingsCount > 0) && result.status !== 'reprovado' && result.status !== 'inviavel' && (
              <div className="mt-4 pt-4 border-t border-black/10">
                <h5 className={cn("text-xs font-bold mb-3 tracking-wide opacity-75", currentConfig.color)}>
                  ESTRUTURA DA RAMPA
                </h5>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-white/50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 font-medium mb-1">Segmentos</p>
                    <p className="text-xl font-semibold text-gray-900">{result.segmentsNeeded}x</p>
                  </div>
                  <div className="bg-white/50 rounded-xl p-3">
                    <p className="text-xs text-gray-500 font-medium mb-1">Patamares</p>
                    <p className="text-xl font-semibold text-gray-900">{result.landingsCount}x</p>
                  </div>
                  <div className="col-span-2 bg-white/50 rounded-xl p-3 flex justify-between items-center mt-1">
                    <div>
                      <p className="text-xs text-gray-500 font-medium mb-1">Projeção Horizontal Total</p>
                      <p className="text-xl font-bold text-gray-900">{result.totalProjection.toFixed(2)}m</p>
                    </div>
                    <Ruler className="w-6 h-6 text-gray-400 opacity-50" />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
