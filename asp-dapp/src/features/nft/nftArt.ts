import type { NftDrop } from './nftTypes';

/**
 * Mirror of AspDrop.sol `_svg()` for previews before anything is minted.
 * Keep the two in sync — the on-chain tokenURI is the source of truth.
 */
export const COLORWAYS: { name: string; a: string; b: string }[] = [
  { name: 'Monad Violet', a: '#836EF9', b: '#3A2BB8' },
  { name: 'Sakura', a: '#FF7AA2', b: '#B5179E' },
  { name: 'Metro Red', a: '#FF3B30', b: '#8B0000' },
  { name: 'Matcha', a: '#8BD48E', b: '#2E7D32' },
  { name: 'Harbor Blue', a: '#3FA9F5', b: '#1A4F9C' },
  { name: 'Gold Leaf', a: '#FFC94A', b: '#C77700' },
  { name: 'Ice', a: '#9BE7FF', b: '#3D8BD9' },
  { name: 'Sunset', a: '#FF8A3D', b: '#C2185B' },
  { name: 'Chrome', a: '#D9D9E0', b: '#5E5E6A' },
  { name: 'Volt', a: '#D4FF3F', b: '#5FA800' },
];

export const MAX_EDITIONS = COLORWAYS.length;

export function colorwayFor(tokenId: number) {
  return COLORWAYS[(tokenId - 1) % COLORWAYS.length];
}

export function capsuleSvg(tokenId: number, total = MAX_EDITIONS) {
  const { name, a, b } = colorwayFor(tokenId);
  const ed = String(tokenId).padStart(2, '0');
  const font = "font-family='Helvetica,Arial,sans-serif'";
  return (
    "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'>" +
    `<defs><radialGradient id='g' cx='50%' cy='45%' r='60%'><stop offset='0' stop-color='${a}' stop-opacity='.45'/><stop offset='1' stop-color='#0B0B0F' stop-opacity='0'/></radialGradient>` +
    `<linearGradient id='t' x1='0' y1='0' x2='1' y2='1'><stop offset='0' stop-color='${a}'/><stop offset='1' stop-color='${b}'/></linearGradient>` +
    "<clipPath id='c'><rect x='130' y='90' width='140' height='220' rx='70'/></clipPath></defs>" +
    "<rect width='400' height='400' fill='#0B0B0F'/><rect width='400' height='400' fill='url(#g)'/>" +
    "<g transform='rotate(-18 200 200)'><g clip-path='url(#c)'>" +
    "<rect x='130' y='90' width='140' height='110' fill='url(#t)'/>" +
    "<rect x='130' y='200' width='140' height='110' fill='#F4F4F6'/></g>" +
    "<rect x='130' y='90' width='140' height='220' rx='70' fill='none' stroke='#FFFFFF' stroke-opacity='.55' stroke-width='3'/>" +
    "<rect x='124' y='193' width='152' height='14' rx='7' fill='#111111'/>" +
    "<ellipse cx='170' cy='140' rx='12' ry='30' fill='#FFFFFF' fill-opacity='.35'/>" +
    `<text x='200' y='266' text-anchor='middle' ${font} font-weight='800' font-size='34' fill='#111111'>ASP</text></g>` +
    `<text x='28' y='46' ${font} font-size='13' font-weight='700' letter-spacing='3' fill='#FFFFFF' fill-opacity='.7'>METROPOLIS / LIMITED</text>` +
    `<text x='372' y='46' text-anchor='end' ${font} font-size='13' font-weight='700' letter-spacing='3' fill='#FFFFFF' fill-opacity='.7'>MONAD</text>` +
    `<text x='28' y='368' ${font} font-size='34' font-weight='800' fill='#FFFFFF'>#${ed}<tspan font-size='16' fill-opacity='.55' dx='8'>/ ${total}</tspan></text>` +
    `<text x='372' y='366' text-anchor='end' ${font} font-size='13' font-weight='700' letter-spacing='2' fill='${a}'>${name.toUpperCase()}</text>` +
    '</svg>'
  );
}

export function svgDataUri(svg: string) {
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/** Preview drop for `/test/claim?preview=1` — looks like a real one, nothing on-chain. */
export function previewNft(tokenId = 1, total = MAX_EDITIONS): NftDrop {
  return {
    tokenId: String(tokenId),
    edition: `${tokenId} / ${total}`,
    name: `Asp Capsule #${tokenId}`,
    image: svgDataUri(capsuleSvg(tokenId, total)),
    colorway: colorwayFor(tokenId).name,
    owner: '0x0000000000000000000000000000000000000000',
    contract: '0x0000000000000000000000000000000000000000',
    mintTx: null,
    tokenUrl: '#',
    already: false,
  };
}
