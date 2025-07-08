export interface Timestamp {
  isCurrentVersion: boolean;
  isCurrentGameMaster: boolean;
  isCurrentImage: boolean;
  isCurrentSound: boolean;
  gamemasterTimestamp: number;
  assetsTimestamp: number;
  soundsTimestamp: number;
}
