export const calculateControlPoints = (
  centerX: number,
  centerY: number,
  radius: number,
) => {
  // Control points are offset by 0.552 times the radius
  const controlOffset = radius * 0.552;

  // Start point (270°) - directly below the center
  const startX = centerX;
  const startY = centerY + radius;

  // End point (90°) - directly above the center
  const endX = centerX;
  const endY = centerY - radius;

  // Control points
  const controlPoint1 = {
    x: centerX + controlOffset,
    y: centerY + radius,
  };
  const controlPoint2 = {
    x: centerX + controlOffset,
    y: centerY - radius,
  };

  return { startX, startY, controlPoint1, controlPoint2, endX, endY };
};

/**
 * Calculate the (x, y) coordinates of a point on a circle.
 * @param centerX - X-coordinate of the circle's center
 * @param centerY - Y-coordinate of the circle's center
 * @param radius - Radius of the circle
 * @param angleDegrees - Angle in degrees (0° is to the right, counterclockwise)
 * @returns { x: number, y: number } - Coordinates on the circle
 */
export const getCirclePoint = (
  centerX: number,
  centerY: number,
  radius: number,
  angleDegrees: number,
) => {
  const angleRadians = (angleDegrees * Math.PI) / 180; // Convert angle to radians

  const x = centerX + radius * Math.cos(angleRadians);
  const y = centerY + radius * Math.sin(angleRadians);

  return { x, y };
};

/**
 * Calculate the y-coordinate(s) on a circle given the x-coordinate.
 * @param centerX - X-coordinate of the circle's center (h)
 * @param centerY - Y-coordinate of the circle's center (k)
 * @param radius - Radius of the circle (r)
 * @param x - Given x-coordinate
 * @returns { y1: number, y2: number } - Upper and lower y-coordinates
 */
export const getCircleYCoordinates = (
  centerX: number,
  centerY: number,
  radius: number,
  x: number,
) => {
  const dx = x - centerX; // Horizontal distance from center
  const distanceSquared = radius * radius - dx * dx;

  if (distanceSquared < 0) {
    throw new Error('The given x-coordinate is outside the circle.');
  }

  const yOffset = Math.sqrt(distanceSquared);

  return {
    y1: centerY + yOffset, // Upper part of the circle
    y2: centerY - yOffset, // Lower part of the circle
  };
};
