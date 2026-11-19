'use strict';
(() => {
  const { node, append, button } = window.AICity.ui;
  window.AICity.cityMap = Object.freeze({
    create(onSelect, { prefix = 'merchant-' } = {}) {
      const section = node('section', undefined, 'map-section');
      section.setAttribute('aria-labelledby', 'map-title');
      const title = node('h2', 'Mappa dimostrativa, non geografica'); title.id = 'map-title';
      const disclosure = node('details');
      const summary = node('summary', 'Mostra o nascondi lo schema');
      const host = node('div', undefined, 'map');
      const markers = new Map();
      let entries = [], selected = null, rendered = false;
      const paint = () => {
        host.replaceChildren(); markers.clear();
        append(host, node('p', 'Nessun dato geospaziale autorizzato integrato. Lo schema non rappresenta la posizione delle schede o la geografia di Trento.'));
        const pins = node('div', undefined, 'pins');
        entries.forEach((record, index) => {
          const marker = button((index + 1) + ' · ' + record.name, () => onSelect(record));
          marker.classList.add('pin');marker.setAttribute('aria-controls', prefix + record.id);
          marker.setAttribute('aria-pressed', String(selected === record.id));
          markers.set(record.id, marker);pins.append(marker);
        });
        host.append(pins);rendered = true;
      };
      append(disclosure, summary, host); append(section, title, disclosure);
      disclosure.addEventListener('toggle', () => { if (disclosure.open && !rendered) paint(); });
      return {
        element: section,
        update(records) { entries = records.slice();rendered = false;if (disclosure.open) paint(); },
        select(id) { selected = id;markers.forEach((marker, key) => marker.setAttribute('aria-pressed', String(key === id))); }
      };
    }
  });
})();
