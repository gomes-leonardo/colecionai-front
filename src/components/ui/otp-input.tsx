'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface OtpInputProps {
  length?: number;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

export function OtpInput({ length = 6, value, onChange, disabled }: OtpInputProps) {
  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  const handleChange = (index: number, char: string) => {
    const newValue = value.split('');
    newValue[index] = char;
    const nextValue = newValue.join('');
    onChange(nextValue);

    // Auto-focus next input
    if (char && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!value[index] && index > 0) {
        // Empty current slot, go back and delete
        inputRefs.current[index - 1]?.focus();
      } else {
         // Just delete current
         const newValue = value.split('');
         newValue[index] = '';
         onChange(newValue.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').slice(0, length);
    if (!/^[a-zA-Z0-9]*$/.test(pastedData)) return; 
    
    onChange(pastedData);
    
    // Fill and focus last filled
    const nextIndex = Math.min(pastedData.length, length - 1);
    inputRefs.current[nextIndex]?.focus();
  };

  // Allow alphanumeric
  const isValidChar = (char: string) => /^[a-zA-Z0-9]$/.test(char);

  return (
    <div className="flex gap-3 sm:gap-4 justify-center">
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          ref={(el) => { inputRefs.current[i] = el }}
          type="text"
          maxLength={1}
          value={value[i] || ''}
          disabled={disabled}
          onChange={(e) => {
            const val = e.target.value;
            if (val === '' || isValidChar(val)) {
              handleChange(i, val);
            }
          }}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          className={cn(
            "w-12 h-14 sm:w-16 sm:h-20 text-center text-3xl font-bold bg-black/20 rounded-2xl border-2 shadow-sm outline-none transition-all duration-200",
            "text-white placeholder:text-zinc-700",
            "focus:border-amber-400 focus:scale-110 focus:shadow-[0_0_20px_rgba(251,191,36,0.2)]",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            value[i] ? "border-amber-400/50" : "border-white/10"
          )}
        />
      ))}
    </div>
  );
}
