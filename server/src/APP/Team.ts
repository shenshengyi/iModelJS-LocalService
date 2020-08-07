export class Team {
  public constructor(private num: number) {
    this.Name = "NBA联盟";
  }
  Display(): void {
    console.log(this.Name);
  }
  private readonly Name: string;
}
