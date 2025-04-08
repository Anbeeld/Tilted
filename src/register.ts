import Surface from "./surface.js";

export class Register {
  private static _id: number = 0;
  public static id() : number { return Register._id++; }
  
  private static _surfaces: Map<number, Surface> = new Map();
  public static add(surface: Surface) : void {
    Register._surfaces.set(surface.id, surface);
  }
  public static surface(id: number) : Surface|undefined {
    return Register._surfaces.get(id);
  }
}