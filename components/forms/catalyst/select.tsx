import * as Headless from '@headlessui/react';
import React, { forwardRef } from 'react';
import clsx from 'clsx';
import { ChevronDownIcon } from 'lucide-react';

export const Select = forwardRef(function Select(
  {
    className,
    children,
    ...props
  }: {
    className?: string;
  } & Omit<Headless.SelectProps, 'as' | 'className'>,
  ref: React.ForwardedRef<HTMLSelectElement>
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
      ])}
    >
      <Headless.Select
        ref={ref}
        className={clsx([
          // Basic layout
          'relative block w-full appearance-none rounded-lg',
          // Padding
          'pl-3 pr-10 py-2',
          // Typography
          'text-sm text-base-content',
          // Border
          'border border-base-content/20',
          // Focus state
          'focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/10',
          // Hover state
          'hover:border-base-content/30',
          // Background color
          'bg-white',
          // Disabled state
          'disabled:bg-base-content/5 disabled:text-base-content/50 disabled:cursor-not-allowed',
          // Transition
          'transition-colors duration-150',
        ])}
        {...props}
      >
        {children}
      </Headless.Select>
      <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
        <ChevronDownIcon
          data-slot="icon"
          className="size-4 text-base-content/50"
          aria-hidden="true"
        />
      </span>
    </span>
  );
});

