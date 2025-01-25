import Raoi from "raoi";
import Surface from "./surface.js";

export function getSurface(id: number) : Surface {
  return Raoi.get(id, Surface)!;
}