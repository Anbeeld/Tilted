import Surface from "./surface.js";

export class Registry {
  private static _id: number = 0;
  public static id() : number { return Registry._id++; }
  
  private static surfaces: Map<number, Surface> = new Map();
  public static add(surface: Surface) : void {
    Registry.surfaces.set(surface.id, surface);
  }
  public static remove(id: number) : void {
    Registry.surfaces.delete(id);
  }
  public static surface(id: number) : Surface|undefined {
    return Registry.surfaces.get(id);
  }
  public static surfaceRequired(id: number) : Surface {
    const surface = Registry.surfaces.get(id);
    if (!surface) {
      throw new Error(`Surface with id ${id} not found in registry. Was it destroyed?`);
    }
    return surface;
  }
}
