export interface APIPath {
  path: string;
  url: string;
}

export interface APITree {
  tree: APIPath[];
}

export interface APITreeRoot {
  commit: {
    tree: APIPath;
    committer: {
      date: Date;
    };
  };
}
