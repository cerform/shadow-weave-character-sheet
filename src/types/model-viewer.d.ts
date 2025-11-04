// Type definitions for @google/model-viewer web component
declare namespace JSX {
  interface IntrinsicElements {
    'model-viewer': React.DetailedHTMLProps<
      React.HTMLAttributes<HTMLElement> & {
        src?: string;
        alt?: string;
        'auto-rotate'?: boolean;
        'camera-controls'?: boolean;
        'disable-zoom'?: boolean;
        'interaction-prompt'?: string;
        'ar-modes'?: string;
        autoplay?: boolean;
        exposure?: number;
        'shadow-intensity'?: number;
        scale?: string;
        poster?: string;
        loading?: 'auto' | 'lazy' | 'eager';
        reveal?: 'auto' | 'interaction' | 'manual';
        'environment-image'?: string;
        skybox?: string;
      },
      HTMLElement
    >;
  }
}
