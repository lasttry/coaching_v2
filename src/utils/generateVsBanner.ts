// src/utils/generateVsBanner.ts
export interface BannerTeam {
  image: string;
  name: string;
  isClub: boolean;
}

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = (error) => reject(error);
    img.src = src;
  });

interface GenerateVsBannerOptions {
  width?: number;
  height?: number;
  backgroundColor?: string;
}

const BASE_WIDTH = 800;
const BASE_HEIGHT = 400;
const BASE_LOGO_SIZE = 210;
const BASE_OFFSET_X = 150;
const BASE_VS_FONT_SIZE = 110;
const BASE_NAME_FONT_SIZE = 28;
const BASE_NAME_OFFSET_X = 180;
const BASE_NAME_OFFSET_Y = 55;

/**
 * Gera um banner VS e devolve um dataURL (PNG base64).
 * Pode ser usado para:
 *  - fazer download (href do link)
 *  - meter no PDF (doc.addImage)
 */
export const generateVsBanner = async (
  homeTeam: BannerTeam,
  awayTeam: BannerTeam,
  options: GenerateVsBannerOptions = {}
): Promise<string> => {
  const width = options.width ?? BASE_WIDTH;
  const height = options.height ?? BASE_HEIGHT;

  // Escala uniforme baseada no layout de referência
  const scale = Math.min(width / BASE_WIDTH, height / BASE_HEIGHT);

  const bgColor = (options.backgroundColor ?? '#ffffff').trim().toLowerCase();
  const isWhiteLike = bgColor === '#fff' || bgColor === '#ffffff' || bgColor === 'white';
  const textColor = isWhiteLike ? '#000000' : '#ffffff';

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Cannot get 2D context from canvas');
  }

  const [homeImg, awayImg] = await Promise.all([
    loadImage(homeTeam.image),
    loadImage(awayTeam.image),
  ]);

  // Fundo sólido com a cor escolhida (por defeito branco)
  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, width, height);

  // Desenhar logos mais juntos e centrados, com escala
  const logoSize = BASE_LOGO_SIZE * scale;
  const centerY = height / 2 - logoSize / 2;
  const offsetX = BASE_OFFSET_X * scale;

  const homeX = width / 2 - logoSize - offsetX / 2;
  const awayX = width / 2 + offsetX / 2;

  ctx.drawImage(homeImg, homeX, centerY, logoSize, logoSize);
  ctx.drawImage(awayImg, awayX, centerY, logoSize, logoSize);

  // VS com efeito "fogo"
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  const vsFontSize = Math.max(40, BASE_VS_FONT_SIZE * scale);

  // camada de glow laranja
  ctx.font = `bold ${vsFontSize}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.shadowColor = 'rgba(255,140,0,0.9)';
  ctx.shadowBlur = 35 * scale;
  ctx.fillStyle = 'rgba(255,69,0,0.7)';
  ctx.fillText('VS', width / 2, height / 2 - 10 * scale);

  // letras por cima com glow mais subtil, na cor oposta ao fundo
  ctx.shadowColor = 'rgba(255,140,0,0.5)';
  ctx.shadowBlur = 12 * scale;
  ctx.fillStyle = textColor;
  ctx.fillText('VS', width / 2, height / 2 - 10 * scale);

  // reset shadow para texto das equipas
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;

  // Nome das equipas por baixo
  const nameFontSize = Math.max(14, BASE_NAME_FONT_SIZE * scale);
  ctx.font = `${nameFontSize}px system-ui, -apple-system, BlinkMacSystemFont, sans-serif`;
  ctx.fillStyle = textColor;

  const nameOffsetX = BASE_NAME_OFFSET_X * scale;
  const nameOffsetY = BASE_NAME_OFFSET_Y * scale;

  ctx.fillText(homeTeam.name, width / 2 - nameOffsetX, height - nameOffsetY);
  ctx.fillText(awayTeam.name, width / 2 + nameOffsetX, height - nameOffsetY);

  // Devolve o dataURL (string base64)
  return canvas.toDataURL('image/png');
};
