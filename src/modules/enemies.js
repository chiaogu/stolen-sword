import { vector } from "../utils"
import { transform } from "./camera";

const enemy = vector(300, 300);

export default ctx => {
  ctx.fillStyle = '#f00';
  ctx.fillRect(...transform(enemy), transform(30), transform(30));
}