export function buildWhatsAppLink(phone: string, message: string): string {
  const cleanPhone = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

export function buildSellMessage(
  template: string,
  vars: { nama_hp: string; kode: string; harga: string }
): string {
  return template
    .replace(/\{nama_hp\}/g, vars.nama_hp)
    .replace(/\{kode\}/g, vars.kode)
    .replace(/\{harga\}/g, vars.harga);
}

export function buildBuyMessage(
  template: string,
  vars: { nama_hp: string; kode: string; harga: string }
): string {
  return template
    .replace(/\{nama_hp\}/g, vars.nama_hp)
    .replace(/\{kode\}/g, vars.kode)
    .replace(/\{harga\}/g, vars.harga);
}

export function formatIDR(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}
