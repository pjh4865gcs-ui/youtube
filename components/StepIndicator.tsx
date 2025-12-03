import React from 'react';
import { AppStep } from '../types';
import { Check, Circle } from 'lucide-react';

interface StepIndicatorProps {
  currentStep: AppStep;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ currentStep }) => {
  const steps = [
    { id: AppStep.INPUT, label: '입력' },
    { id: AppStep.SELECTION, label: '전략' },
    { id: AppStep.RESULT, label: '대본' },
  ];

  const getStepStatus = (stepId: AppStep) => {
    const order = [AppStep.INPUT, AppStep.ANALYZING, AppStep.SELECTION, AppStep.GENERATING, AppStep.RESULT];
    
    // Map intermediate loading states to main steps
    let normalizedCurrent = currentStep;
    if (currentStep === AppStep.ANALYZING) normalizedCurrent = AppStep.INPUT;
    if (currentStep === AppStep.GENERATING) normalizedCurrent = AppStep.SELECTION;

    const currentIndex = steps.findIndex(s => s.id === normalizedCurrent);
    const stepIndex = steps.findIndex(s => s.id === stepId);

    if (stepIndex < currentIndex) return 'completed';
    if (stepIndex === currentIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="flex items-center justify-center space-x-4 mb-8">
      {steps.map((step, idx) => {
        const status = getStepStatus(step.id);
        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center space-x-2">
              <div className={`
                flex items-center justify-center w-8 h-8 rounded-full border-2 
                ${status === 'completed' ? 'bg-indigo-600 border-indigo-600 text-white' : ''}
                ${status === 'current' ? 'border-indigo-500 text-indigo-400' : ''}
                ${status === 'pending' ? 'border-slate-700 text-slate-700' : ''}
              `}>
                {status === 'completed' ? <Check size={16} /> : <span className="text-sm font-bold">{idx + 1}</span>}
              </div>
              <span className={`text-sm font-medium ${status === 'current' ? 'text-white' : 'text-slate-500'}`}>
                {step.label}
              </span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-12 h-0.5 ${status === 'completed' ? 'bg-indigo-600' : 'bg-slate-800'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};