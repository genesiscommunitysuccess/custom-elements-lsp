export interface GlobalDataService {
  getAttributes(): string[];
  getAriaAttributes(): string[];
  getEvents(): string[];
}

export interface GlobalDataRepository {
  getAttributes(): string[];
  getAriaAttributes(): string[];
  getEvents(): string[];
}
