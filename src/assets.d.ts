declare module '*.svg' {
  import React = require('react');

  export const content: SVGSVGElement;
  export const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

declare module '*.png' {
  const content: unknown;
  export default content;
}

declare module '*.jpg' {
  const content: unknown;
  export default content;
}
