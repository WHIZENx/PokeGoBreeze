interface Sound {
  cry: any[];
}

export interface Asset {
  id: number;
  name: string;
  image: any[];
  sound: Sound;
}
