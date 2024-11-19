interface IMoveTypeProp {
  style: string;
  name: string;
}

export class MoveTypeProp implements IMoveTypeProp {
  style = '';
  name = '';

  constructor(name: string, style: string) {
    this.name = name;
    this.style = style;
  }
}
