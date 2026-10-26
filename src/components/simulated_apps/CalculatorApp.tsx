import React, { useState } from 'react';
import { Calculator, X, Delete } from 'lucide-react';

interface CalculatorAppProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculatorApp: React.FC<CalculatorAppProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  if (!isOpen) return null;

  const handleInput = (val: string) => {
    if (val === 'C') {
      setDisplay('0');
      setEquation('');
      return;
    }

    if (val === '=') {
      try {
        // Safe evaluation of standard arithmetic
        const sanitized = equation + display;
        if (!/^[0-9+\-*/. ]+$/.test(sanitized)) return;
        // eslint-disable-next-line no-eval
        const result = Function(`'use strict'; return (${sanitized})`)();
        setDisplay(String(result));
        setEquation('');
      } catch (err) {
        setDisplay('त्रुटि (Error)');
      }
      return;
    }

    if (['+', '-', '*', '/'].includes(val)) {
      setEquation((prev) => prev + display + ' ' + val + ' ');
      setDisplay('0');
      return;
    }

    if (display === '0') {
      setDisplay(val);
    } else {
      setDisplay((prev) => prev + val);
    }
  };

  const buttons = [
    'C', '(', ')', '/',
    '7', '8', '9', '*',
    '4', '5', '6', '-',
    '1', '2', '3', '+',
    '0', '.', '=',
  ];

  return (
    <div className="fixed inset-0 z-40 bg-slate-950 flex flex-col justify-between text-white p-4 animate-in zoom-in-95 duration-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
            <Calculator className="w-4 h-4" />
          </div>
          <span className="font-semibold text-sm">Android Calculator / कैलकुलेटर</span>
        </div>
        <button
          onClick={onClose}
          className="p-2 rounded-full hover:bg-slate-800 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="flex-1 flex flex-col justify-end py-6 px-2 text-right">
        <div className="text-sm font-mono text-slate-400 min-h-[24px]">{equation}</div>
        <div className="text-4xl font-bold font-mono tracking-tight text-white mt-1 break-all">
          {display}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2.5 max-w-sm mx-auto w-full pb-4">
        {buttons.map((b, i) => {
          const isAction = ['C', '(', ')', '/', '*', '-', '+', '='].includes(b);
          const isEquals = b === '=';
          return (
            <button
              key={i}
              onClick={() => handleInput(b)}
              className={`h-16 rounded-2xl font-semibold text-lg flex items-center justify-center transition-all active:scale-95 ${
                isEquals
                  ? 'col-span-2 bg-gradient-to-r from-amber-500 to-indigo-600 text-white shadow-lg shadow-amber-500/20'
                  : isAction
                  ? 'bg-slate-800 text-amber-400 border border-slate-700/60'
                  : 'bg-slate-900 text-white border border-slate-800 hover:bg-slate-850'
              }`}
            >
              {b}
            </button>
          );
        })}
      </div>
    </div>
  );
};
