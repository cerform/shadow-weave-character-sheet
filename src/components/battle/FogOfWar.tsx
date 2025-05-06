
// Вместо прямого доступа к x и y, используем position
const { position } = light;
const scaledX = position.x * scale + mapOffset.x;
const scaledY = position.y * scale + mapOffset.y;
