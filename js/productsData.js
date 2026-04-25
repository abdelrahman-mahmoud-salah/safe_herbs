/** Product cards rendered after lazy load (keeps copy aligned with original site). */
export const PRODUCTS = [
  {
    id: 'pc1',
    dotsId: 'dots1',
    lblId: 'lbl1',
    tag: 'Category 01',
    nameHtml: 'Herbs &<br>Infusions',
    desc: 'Chamomile, peppermint, rosemary, thyme, basil — dried and blended from our certified organic fields.',
    type: 'herb'
  },
  {
    id: 'pc2',
    dotsId: 'dots2',
    lblId: 'lbl2',
    tag: 'Category 02',
    nameHtml: 'Premium<br>Seeds',
    desc: 'Coriander, cumin, fennel, fenugreek — carefully harvested and graded to global standards.',
    type: 'seed'
  },
  {
    id: 'pc3',
    dotsId: 'dots3',
    lblId: 'lbl3',
    tag: 'Category 03',
    nameHtml: 'Onion &<br>Garlic',
    desc: 'Dehydrated flakes, powder & granules — the sharpest flavors from Egypt\'s fertile Nile delta soils.',
    type: 'bulb'
  }
];

export function buildProductsGridHtml() {
  return PRODUCTS.map(
    (p) => `
    <div class="product-card reveal">
      <canvas id="${p.id}" aria-hidden="true"></canvas>
      <div class="card-overlay">
        <div class="stage-dots" id="${p.dotsId}">
          <div class="sdot active"></div><div class="sdot"></div><div class="sdot"></div><div class="sdot"></div>
        </div>
        <p class="stage-lbl" id="${p.lblId}">Planting seeds</p>
        <p class="product-tag">${p.tag}</p>
        <h3 class="product-name">${p.nameHtml}</h3>
        <p class="product-desc">${p.desc}</p>
        <div class="product-actions">
          <a class="btn-quote" data-spa-ignore="true" href="contactUs.html">Request Quote</a>
          <a href="safeherbs-products.html#${p.type === 'herb' ? 'herbs' : p.type === 'seed' ? 'seeds' : 'oniongarlic'}" target="_blank" 
   rel="noopener noreferrer" class="product-arrow">
  Explore →
</a>
        </div>
      </div>
    </div>`
  ).join('');
}
