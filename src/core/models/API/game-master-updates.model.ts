export type GameMasterChangeStatus = 'added' | 'updated' | 'removed';
export type GameMasterEntityType = 'pokemon' | 'item' | 'move' | 'setting';
export type GameMasterPatchSection = 'pokemon' | 'moves' | 'battle' | 'items' | 'progression' | 'systems';

export interface GameMasterVersion {
  name: string;
  apkVersion?: string;
  timestamp: string;
  sourceUrl: string;
}

export interface GameMasterMoveReference {
  id: string;
  name: string;
  type?: string;
}

export interface GameMasterFieldChange {
  path: string;
  label: string;
  before?: string | number | boolean | null;
  after?: string | number | boolean | null;
  beforeMoves?: GameMasterMoveReference[];
  afterMoves?: GameMasterMoveReference[];
}

export interface GameMasterChange {
  templateId: string;
  status: GameMasterChangeStatus;
  category: string;
  categories?: string[];
  categoryLabel: string;
  entityType: GameMasterEntityType;
  entityId?: string;
  pokemonId?: number;
  form?: string;
  moveType?: string;
  templateIds?: string[];
  label: string;
  description: string;
  imageUrl?: string;
  section: GameMasterPatchSection;
  affectedPages: string[];
  fields: GameMasterFieldChange[];
  changedFieldCount: number;
  forms?: string[];
}

export interface GameMasterUpdateSummary {
  total: number;
  added: number;
  updated: number;
  removed: number;
  entityTypes: Record<GameMasterEntityType, number>;
  sections: Array<{
    key: GameMasterPatchSection;
    label: string;
    total: number;
  }>;
  categories: Array<{
    key: string;
    label: string;
    total: number;
    added: number;
    updated: number;
    removed: number;
  }>;
}

export interface GameMasterPatchHeroImage {
  url: string;
  label: string;
}

export interface GameMasterPatchSummary {
  compareTo: string;
  slug?: string;
  current: GameMasterVersion;
  previous: GameMasterVersion;
  summary: GameMasterUpdateSummary;
  heroImage?: GameMasterPatchHeroImage;
  title?: string;
  description?: string;
  highlights?: string[];
}

export interface GameMasterUpdatesResponse {
  data: {
    generatedAt: string;
    current: GameMasterVersion;
    previous: GameMasterVersion;
    versions: GameMasterVersion[];
    patches?: GameMasterPatchSummary[];
    selectedPatch?: GameMasterPatchSummary;
    summary: GameMasterUpdateSummary;
    changes: GameMasterChange[];
  };
  meta: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    compareTo: string;
    patchPage: number;
    patchLimit: number;
    patchTotal: number;
    patchPages: number;
  };
}
