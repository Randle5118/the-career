import * as Headless from '@headlessui/react';
import React from 'react';
import clsx from 'clsx';

export function Fieldset({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'fieldset'>) {
  return (
    <fieldset
      {...props}
      className={clsx(className, '[&>*+[data-slot=control]]:mt-6 [&>[data-slot=text]]:mt-1')}
    />
  );
}

export function Legend({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'legend'>) {
  return (
    <legend
      {...props}
      data-slot="legend"
      className={clsx(
        className,
        'text-base/6 font-semibold text-base-content sm:text-sm/6'
      )}
    />
  );
}

export function FieldGroup({
  className,
  ...props
}: React.ComponentPropsWithoutRef<'div'>) {
  return (
    <div
      {...props}
      data-slot="control"
      className={clsx(className, 'space-y-8')}
    />
  );
}

export function Field({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Headless.Field>) {
  return (
    <Headless.Field
      className={clsx(
        className,
        '[&>[data-slot=label]+[data-slot=control]]:mt-1.5',
        '[&>[data-slot=label]+[data-slot=description]]:mt-1',
        '[&>[data-slot=description]+[data-slot=control]]:mt-1.5',
        '[&>[data-slot=control]+[data-slot=description]]:mt-1.5',
        '[&>[data-slot=control]+[data-slot=error]]:mt-1.5',
        '[&>[data-slot=label]]:font-medium'
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: React.ComponentPropsWithoutRef<typeof Headless.Label>) {
  return (
    <Headless.Label
      {...props}
      data-slot="label"
      className={clsx(
        className,
        'select-none text-sm text-base-content data-[disabled]:opacity-50'
      )}
    />
  );
}

export function Description({
  className,
  disabled,
  ...props
}: React.ComponentPropsWithoutRef<typeof Headless.Description> & {
  disabled?: boolean;
}) {
  return (
    <Headless.Description
      {...props}
      data-slot="description"
      className={clsx(
        className,
        'text-base/6 text-base-content/50 data-[disabled]:opacity-50 sm:text-sm/6',
        disabled && 'opacity-50'
      )}
    />
  );
}

export function ErrorMessage({
  className,
  disabled,
  ...props
}: React.ComponentPropsWithoutRef<typeof Headless.Description> & {
  disabled?: boolean;
}) {
  return (
    <Headless.Description
      {...props}
      data-slot="error"
      className={clsx(
        className,
        'text-base/6 text-error data-[disabled]:opacity-50 sm:text-sm/6',
        disabled && 'opacity-50'
      )}
    />
  );
}

