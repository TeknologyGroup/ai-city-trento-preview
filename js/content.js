'use strict';
// Dataset esclusivamente sintetico: nessuna coordinata, disponibilità o prezzo reale.
(() => {
  const app = window.AICity;
  const source = Object.freeze({ mode: 'DEMO', origin: 'Scenario sintetico AI CITY', attribution: 'Testi e segni grafici creati internamente per la demo', verified: false });
  const places = [
    { id: 'place-carta', name: 'Cortile delle Carte DEMO', category: 'Spazi immaginari', description: 'Un cortile inventato per costruire un itinerario di prova. Non identifica un luogo di Trento.', zone: 'Scenario demo A' },
    { id: 'place-trame', name: 'Galleria delle Trame DEMO', category: 'Cultura dimostrativa', description: 'Spazio espositivo interamente inventato, senza eventi o disponibilità reali.', zone: 'Scenario demo B' },
    { id: 'place-foglie', name: 'Giardino delle Foglie DEMO', category: 'Spazi immaginari', description: 'Un giardino di fantasia per esplorare una scheda e organizzare una tappa.', zone: 'Scenario demo C' }
  ].map(record => Object.freeze({ ...record, source }));
  const offers = [
    { id: 'offer-quaderno', merchantId: 1, type: 'Prodotto', name: 'Quaderno delle idee DEMO', description: 'Esempio fittizio di articolo di cartoleria. Nessun prezzo, stock o acquisto disponibile.' },
    { id: 'offer-carta', merchantId: 1, type: 'Servizio', name: 'Composizione carta DEMO', description: 'Esempio di servizio inventato, non prenotabile.' },
    { id: 'offer-nuvola', merchantId: 2, type: 'Prodotto', name: 'Oggetto Nuvola DEMO', description: 'Oggetto decorativo immaginario. Non in vendita.' },
    { id: 'offer-trame', merchantId: 3, type: 'Servizio', name: 'Laboratorio delle trame DEMO', description: 'Attività inventata senza date o posti disponibili.' }
  ].map(record => Object.freeze({ ...record, source }));
  const text = (value, max) => typeof value === 'string' && value.trim().length > 0 && value.length <= max;
  const validSource = value => value && value.mode === 'DEMO' && value.verified === false && text(value.origin, 180) && text(value.attribution, 250);
  const validatePlace = r => !!r && /^place-[a-z-]+$/.test(r.id) && text(r.name, 100) && text(r.category, 100) && text(r.description, 500) && text(r.zone, 100) && validSource(r.source) && !('latitude' in r) && !('longitude' in r);
  const validateOffer = r => !!r && /^offer-[a-z-]+$/.test(r.id) && Number.isInteger(r.merchantId) && !!app.state.get(r.merchantId) && ['Prodotto', 'Servizio'].includes(r.type) && text(r.name, 100) && text(r.description, 500) && validSource(r.source);
  const valid = places.every(validatePlace) && offers.every(validateOffer) && new Set([...places, ...offers].map(r => r.id)).size === places.length + offers.length;
  const normalize = value => String(value).normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLocaleLowerCase('it');
  const categories = Object.freeze([...new Set(places.map(p => p.category))]);
  const search = (query = '', category = '') => {
    if (!valid) return { status: 'INVALID_DATA', records: [] };
    if (category && !categories.includes(category)) return { status: 'INVALID_FILTER', records: [] };
    if (typeof query !== 'string' || query.length > 180) return { status: 'INVALID_QUERY', records: [] };
    return { status: 'OK', records: places.filter(p => (!category || p.category === category) && normalize(p.name + ' ' + p.category).includes(normalize(query))) };
  };
  const getPlace = id => valid ? places.find(p => p.id === id) : undefined;
  const getOffer = id => valid ? offers.find(o => o.id === id && app.state.get(o.merchantId)?.status === 'Pubblicata') : undefined;
  const offersFor = id => valid && app.state.get(id)?.status === 'Pubblicata' ? offers.filter(o => o.merchantId === Number(id)) : [];
  const resolve = (kind, id) => kind === 'place' ? getPlace(id) : kind === 'merchant' && app.state.get(id)?.status === 'Pubblicata' ? app.state.get(id) : undefined;
  let plan = [], next = 1;
  const planner = Object.freeze({
    all: () => plan.map(step => ({ ...step, available: !!resolve(step.kind, step.targetId), record: resolve(step.kind, step.targetId) })),
    add(kind, id, time = '') {
      const record = resolve(kind, id);
      if (!record) throw new Error('Tappa non disponibile.');
      id = record.id;
      if (typeof time !== 'string' || (time && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time))) throw new Error('Orario non valido. Usa HH:MM.');
      if (plan.length >= 12) throw new Error('Il piano dimostrativo può contenere al massimo 12 tappe.');
      if (plan.some(s => s.kind === kind && s.targetId === id)) throw new Error('Questa tappa è già nel piano.');
      plan.push({ id: next++, kind, targetId: id, time });
    },
    setTime(id, time) {
      const step = plan.find(s => s.id === id);
      if (!step || typeof time !== 'string' || (time && !/^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time))) throw new Error('Tappa o orario non valido.');
      step.time = time;
    },
    move(id, direction) {
      const index = plan.findIndex(s => s.id === id), target = index + direction;
      if (![-1, 1].includes(direction) || index < 0 || target < 0 || target >= plan.length) throw new Error('Spostamento non disponibile.');
      [plan[index], plan[target]] = [plan[target], plan[index]];
    },
    remove(id) { if (!plan.some(s => s.id === id)) throw new Error('Tappa non disponibile.'); plan = plan.filter(s => s.id !== id); },
    reset() { plan = []; next = 1; }
  });
  const mediaFor = id => getPlace(id) ? [Object.freeze({ id: 'media-' + id, kind: 'css-placeholder', attribution: source.attribution, origin: source.origin, rights: 'Grafica dimostrativa interna; nessun media di terzi', geographicEvidence: false })] : [];
  app.content = Object.freeze({ mediaFor, valid, source, categories, search, getPlace, getOffer, offersFor, resolve, validatePlace, validateOffer, planner });
})();
