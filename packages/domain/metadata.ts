export interface Metadata {
  id: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  featured?: boolean;
  tags?: string[];
}

export interface OrderedMetadata extends Metadata {
  order: number;
}
