declare module '*.avif' {
  const src: string;
  export default src;
}
declare module '*.bmp' {
  const src: string;
  export default src;
}
declare module '*.gif' {
  const src: string;
  export default src;
}
declare module '*.jpg' {
  const src: string;
  export default src;
}
declare module '*.jpeg' {
  const src: string;
  export default src;
}
declare module '*.png' {
  const src: string;
  export default src;
}
declare module '*.webp' {
  const src: string;
  export default src;
}
declare module '*.svg' {
  import * as React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement>>;
  export default ReactComponent;
}

declare module '*.css';
declare module '*/*.css';
declare module 'antd/dist/reset.css';
declare module 'react-toastify/dist/ReactToastify.css';
declare module './globals.css';
