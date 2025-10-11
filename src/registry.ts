import Surface from "./surface.js";

export class Registry {
  private static _id: number = 0;
  public static id() : number { return Registry._id++; }
  
  private static surfaces: Map<number, Surface> = new Map();
  public static add(surface: Surface) : void {
    Registry.surfaces.set(surface.id, surface);
  }
  public static surface(id: number) : Surface|undefined {
    return Registry.surfaces.get(id);
  }
}