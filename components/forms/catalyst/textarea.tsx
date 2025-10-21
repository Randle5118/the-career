import * as Headless from '@headlessui/react';
import React, { forwardRef } from 'react';
import clsx from 'clsx';

export const Textarea = forwardRef(function Textarea(
  {
    className,
    resizable = true,
    ...props
  }: {
    className?: string;
    resizable?: boolean;
  } & Omit<Headless.TextareaProps, 'as' | 'className'>,
  ref: React.ForwardedRef<HTMLTextAreaElement>
) {
  return (
    <span
      data-slot="control"
      className={clsx([
        className,
        // Basic layout
        'relative block w-full',
        // Disabled state
        'has-[[data-disabled]]:opacity-50',
        // Invalid state
        'has-[[data-invalid]]:focus-within:ring-2 has-[[data-invalid]]:focus-within:ring-error/20',
      ])}
    >
      <Headless.Textarea
        ref={ref}
        className={clsx([
          // Basic layout
          'relative block w-full appearance-none rounded-lg',
          // Padding
          'px-3 py-2',
          // Typography
          'text-sm text-base-content placeholder:text-base-content/40',
          // Border
          'border border-base-content/20',
          // Focus state
          'focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10',
          // Hover state
          'hover:border-base-content/30',
          // Background color
          'bg-white',
          // Invalid state
          'data-[invalid]:border-error data-[invalid]:focus:border-error data-[invalid]:focus:ring-error/10',
          // Disabled state
          'disabled:bg-base-content/5 disabled:text-base-content/50 disabled:cursor-not-allowed',
          // Selection
          'selection:bg-primary/20',
          // Transition
          'transition-colors duration-150',
          // Resizable
          resizable ? 'resize-y' : 'resize-none',
        ])}
        {...props}
      />
    </span>
  );
});

