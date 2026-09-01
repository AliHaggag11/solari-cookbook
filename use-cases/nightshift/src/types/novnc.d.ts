declare module "@novnc/novnc" {
  export default class RFB {
    constructor(
      target: Element,
      url: string,
      options?: Record<string, unknown>,
    );
    viewOnly: boolean;
    scaleViewport: boolean;
    background: string;
    disconnect(): void;
    addEventListener(type: string, listener: (event?: Event) => void): void;
  }
}
