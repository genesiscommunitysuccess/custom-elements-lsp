export interface CustomElementsResource {
  getCENames(): string[];
  getCEAttributes(name: string): CustomElementAttribute[];
}

export type CustomElementAttribute = {
  name: string; // Attribute name rather than associated field if available
  type: string;
};
