export interface APIPath {
  path: string;
  url: string;
}

export interface APITree {
  tree: APIPath[];
}

interface Committer {
  date: Date;
}

interface Commit {
  tree: APIPath;
  committer: Committer;
}

export interface APITreeRoot {
  commit: Commit;
  url: string;
}
