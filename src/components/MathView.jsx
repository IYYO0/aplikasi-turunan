import katex from 'katex';

/**
 * Komponen pembungkus Inline KaTeX yang aman
 */
export function InlineMath({ math, children, className = '' }) {
  const content = math || (typeof children === 'string' ? children : '');
  if (!content) return null;

  const html = katex.renderToString(content, {
    throwOnError: false,
    displayMode: false,
  });

  return (
    <span
      className={`inline-block align-middle ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

/**
 * Komponen pembungkus Block KaTeX yang aman
 */
export function BlockMath({ math, children, className = '' }) {
  const content = math || (typeof children === 'string' ? children : '');
  if (!content) return null;

  const html = katex.renderToString(content, {
    throwOnError: false,
    displayMode: true,
  });

  return (
    <div
      className={`overflow-x-auto py-1 text-center ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export { default as MathText } from './MathText.jsx';
