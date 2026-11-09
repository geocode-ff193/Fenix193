/**
 * IMG-UTILS.JS — Fundação Fênix 193
 * Otimiza imagens hospedadas no Cloudinary pela própria URL (formato e qualidade
 * automáticos + redução de largura). Imagens de outros endereços passam sem alteração.
 *
 *   cld(url, 700)                 → .../upload/f_auto,q_auto,c_limit,w_700/...
 *   cld(url, 1200, {format:'jpg'})→ útil para Open Graph (WhatsApp/Facebook preferem JPG)
 *   cldSrcset(url, [640, 1024])   → "url1 640w, url2 1024w" (ou "" se não for Cloudinary)
 */
const CLD_RE = /^(https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/)(.+)$/i;
const ALREADY_TRANSFORMED = /^[a-z]{1,3}_[^/]*\//i;

export function cld(url, width, { format = 'auto' } = {}) {
    const u = String(url || '');
    const m = CLD_RE.exec(u);
    if (!m || !width) return u;
    if (ALREADY_TRANSFORMED.test(m[2])) return u; // a URL já traz uma transformação
    return `${m[1]}f_${format},q_auto,c_limit,w_${Math.round(width)}/${m[2]}`;
}

export function cldSrcset(url, widths) {
    const u = String(url || '');
    if (!CLD_RE.test(u)) return '';
    return widths.map(w => `${cld(u, w)} ${w}w`).join(', ');
}
