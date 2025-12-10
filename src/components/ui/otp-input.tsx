'use client';

import { useRef, useEffect, KeyboardEvent } from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  disabled?: boolean;
}

export function OtpInput({ value, onChange, length = 6, disabled = false }: OtpInputProps) {
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (index: number, inputValue: string) => {
    const newValue = inputValue.slice(-1); // Pega apenas o último caractere
    
    // Aceitar letras e números (alfanumérico)
    if (!/^[a-zA-Z0-9]*$/.test(newValue)) return;

    const newOtp = value.split('');
    newOtp[index] = newValue.toUpperCase(); // Converter para maiúscula
    onChange(newOtp.join(''));

    // Auto-focus no próximo input
    if (newValue && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // Se o campo está vazio e aperta backspace, volta para o anterior
        inputRefs.current[index - 1]?.focus();
      } else {
        // Limpa o campo atual
        const newOtp = value.split('');
        newOtp[index] = '';
        onChange(newOtp.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').slice(0, length);
    
    // Aceitar alfanumérico
    if (!/^[a-zA-Z0-9]+$/.test(pastedData)) return;
    
    onChange(pastedData.toUpperCase());
    
    // Focus no próximo campo vazio ou no último
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  return (
    <div className="flex gap-4 sm:gap-5 justify-center px-2">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => { inputRefs.current[index] = el; }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={value[index] || ''}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          disabled={disabled}
          className={cn(
            // Base styles - aumentado para mais espaço
            "w-16 h-20 sm:w-18 sm:h-24 text-center text-3xl sm:text-4xl font-bold",
            "rounded-2xl transition-all duration-200",
            
            // Background and border
            "bg-backgroundSecondary border-2",
            value[index] 
              ? "border-primary bg-primary-subtle" 
              : "border-border hover:border-primary/50",
            
            // Focus state
            "focus:outline-none focus:ring-4 focus:ring-primary/20 focus:border-primary",
            
            // Text color
            "text-textPrimary placeholder:text-textMuted",
            
            // Disabled state
            disabled && "opacity-50 cursor-not-allowed",
            
            // Shadow
            "shadow-sm hover:shadow-md focus:shadow-lg"
          )}
          aria-label={`Dígito ${index + 1}`}
        />
      ))}
    </div>
  );
}
