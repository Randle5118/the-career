import clsx from 'clsx';
import React from 'react';

type HeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export function Heading({
  className,
  level = 1,
  ...props
}: React.ComponentPropsWithoutRef<`h${HeadingLevel}`> & {
  level?: HeadingLevel;
}) {
  const Element: `h${HeadingLevel}` = `h${level}`;

  return (
    <Element
      {...props}
      className={clsx(
        className,
        'text-2xl/8 font-semibold text-base-content sm:text-xl/8'
      )}
    />
  );
}

export function Subheading({
  className,
  level = 2,
  ...props
}: React.ComponentPropsWithoutRef<`h${HeadingLevel}`> & {
  level?: HeadingLevel;
}) {
  const Element: `h${HeadingLevel}` = `h${level}`;

  return (
    <Element
      {...props}
      className={clsx(
        className,
        'text-base/7 font-semibold text-base-content sm:text-sm/6'
      )}
    />
  );
}

