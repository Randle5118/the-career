import * as Headless from '@headlessui/react';
import React, { forwardRef } from 'react';
import clsx from 'clsx';

const dateTypes = ['date', 'datetime-local', 'month', 'time', 'week'];

export const Input = forwardRef(function Input(
  {
    className,
    ...props
  }: {
    className?: string;
    type?:
      | 'email'
      | 'number'
      | 'password'
      | 'search'
      | 'tel'
      | 'text'
      | 'url'
      | 'date'
      | 'datetime-local'
      | 'month'
      | 'time'
      | 'week';
  } & Omit<Headless.InputProps, 'as' | 'className'>,
  ref: React.ForwardedRef<HTMLInputElement>
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
        // Invalid state - shows red ring on focus
        'has-[[data-invalid]]:focus-within:ring-2 has-[[data-invalid]]:focus-within:ring-error/20',
      ])}
    >
      <Headless.Input
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
          // Focus state - subtle primary color
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
        ])}
        {...props}
      />
    </span>
  );
});

export const InputGroup = forwardRef(function InputGroup(
  {
    className,
    children,
    ...props
  }: React.ComponentPropsWithoutRef<'span'>,
  ref: React.ForwardedRef<HTMLSpanElement>
) {
  return (
    <span
      ref={ref}
      data-slot="control"
      {...props}
      className={clsx([
        className,
        // Basic layout
        'relative isolate block',
        // Background color + shadow applied to inset pseudo element, so shadow blends with border in light mode
        '[&:has(input)]:before:absolute [&:has(input)]:before:inset-px [&:has(input)]:before:rounded-[calc(theme(borderRadius.lg)-1px)] [&:has(input)]:before:bg-white [&:has(input)]:before:shadow',
        // Background color is moved to control and shadow is removed in dark mode so hide `before` pseudo
        '[&:has(input)]:dark:before:hidden',
        // Focus ring
        'after:pointer-events-none after:absolute after:inset-0 after:rounded-lg after:ring-inset after:ring-transparent has-[:focus]:after:ring-2 has-[:focus]:after:ring-primary',
        // Disabled state
        'has-[:disabled]:opacity-50 [&:has(input)]:before:has-[:disabled]:bg-base-content/5 [&:has(input)]:before:has-[:disabled]:shadow-none',
      ])}
    >
      <span className="relative flex items-center">
        {children}
        <span
          className={clsx([
            'pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center',
            '[&>[data-slot=icon]]:size-4 [&>[data-slot=icon]]:shrink-0 [&>[data-slot=icon]]:text-base-content/60 [&>[data-slot=icon]]:group-data-[focus]:text-base-content',
            'pl-3 pr-0',
            '[&>[data-slot=icon]]:sm:size-3.5',
          ])}
        >
          {React.Children.toArray(children).find(
            (child) =>
              React.isValidElement(child) && 'data-slot' in child.props && child.props['data-slot'] === 'icon'
          )}
        </span>
      </span>
    </span>
  );
});

