/// <reference types="expo" />
/// <reference types="expo-router/types" />

declare module '*.png' {
  const value: any;
  export = value;
}

declare module '*.jpg' {
  const value: any;
  export = value;
}

declare module '*.jpeg' {
  const value: any;
  export = value;
}

declare module '*.gif' {
  const value: any;
  export = value;
}

declare module '*.svg' {
  import React from 'react';
  import { SvgProps } from 'react-native-svg';
  const content: React.FC<SvgProps>;
  export default content;
}

declare module '*.json' {
  const value: any;
  export default value;
}

declare module '*.mp3' {
  const value: any;
  export = value;
}

declare module '*.mp4' {
  const value: any;
  export = value;
}

declare module '*.ttf' {
  const value: any;
  export = value;
}

declare module '*.otf' {
  const value: any;
  export = value;
}

declare module '*.woff' {
  const value: any;
  export = value;
}

declare module '*.woff2' {
  const value: any;
  export = value;
}

declare module '*.eot' {
  const value: any;
  export = value;
}

declare module '*.obj' {
  const value: any;
  export = value;
}

declare module '*.mtl' {
  const value: any;
  export = value;
}

declare module '*.fbx' {
  const value: any;
  export = value;
}

declare module '*.glb' {
  const value: any;
  export = value;
}

declare module '*.gltf' {
  const value: any;
  export = value;
}

declare module '*.hdr' {
  const value: any;
  export = value;
}

declare module '*.exr' {
  const value: any;
  export = value;
}

declare module '*.db' {
  const value: any;
  export = value;
}
