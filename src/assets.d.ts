declare module '*.svg' {
  import * as React from 'react';
  const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module '*.png' {
  const content: unknown;
  export default content;
}

declare module '*.jpg' {
  const content: unknown;
  export default content;
}
