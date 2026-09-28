import { useEffect, useMemo, useState } from 'react';
import './App.css';
import {
  fetchMenu, createOrder, createReservation,
  fetchAdminOrders, updateOrderStatus,
  fetchAdminReservations, updateReservationStatus,
  fetchTipsReport,
} from './api';
import { login, logout, loadSession, can, PERMISSIONS } from './auth';

/* ---------- IMAGES ---------- */
const wm = (file, w = 800) =>
  `https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=${w}`;

const PIC = {
  egusi: wm('Assorted Egusi.jpg'),
  ogbono: wm('Eba and ogbono soup.jpg'),
  ogbono2: wm('Semovita and ogbono soup.jpg'),
  afang: wm('Afang Soup.jpg'),
  okra: wm('Amala with okra soup and fish.jpg'),
  asun: wm('Asun.jpg'),
  jollof: wm('Nigerian party jollof.jpg'),
  jollof2: wm('Nigerian jollof rice.jpg'),
  jollofDodo: wm('Jollof rice and Dodo.jpg'),
  ofada: wm('Ofada Rice and Jollof Rice.jpg'),
  friedrice: wm('Plates of Jollof Rice, Fried Rice and Chicken.jpg'),
  jollofFish: wm('Spinach jollof rice with fish.jpg'),
  jollofBeef: wm('Spicy jollof rice and fried beef.jpg'),
  suya: wm('Suyawithriceplaintains.JPG'),
  peppersoup: wm('Assorted meat pepper soup at Lagos Island.jpg'),

  grill: 'https://images.unsplash.com/photo-1633945274405-b6c8069047b0?auto=format&fit=crop&w=800&q=70',
  charcoal: 'https://images.unsplash.com/photo-1627843337825-9c1ba8d21669?auto=format&fit=crop&w=800&q=70',
  fish: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=70',
  prawns: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=70',
  stockfish: 'https://images.unsplash.com/photo-1544943910-4c1dc44aab44?auto=format&fit=crop&w=800&q=70',
  plantain: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?auto=format&fit=crop&w=800&q=70',
  snack: 'https://images.unsplash.com/photo-1610631087218-f784839e48f1?auto=format&fit=crop&w=800&q=70',
  pie: 'https://images.unsplash.com/photo-1619740455993-9e612b1af08a?auto=format&fit=crop&w=800&q=70',
  beans: 'https://images.unsplash.com/photo-1604909052743-94e838986d24?auto=format&fit=crop&w=800&q=70',
  pap: 'https://images.unsplash.com/photo-1517093157656-b9eccef91cb1?auto=format&fit=crop&w=800&q=70',
  drink: 'https://images.unsplash.com/photo-1600332098294-2e6fefaa6d66?auto=format&fit=crop&w=800&q=70',
  hibiscus: 'https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=70',
  milk: 'https://images.unsplash.com/photo-1563636619-e9143da7973b?auto=format&fit=crop&w=800&q=70',
  palmwine: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=800&q=70',
  juice: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=70',
  ice: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=800&q=70',
  sorbet: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=800&q=70',
  choc: 'https://images.unsplash.com/photo-1567206563064-6f60f40a2b57?auto=format&fit=crop&w=800&q=70',
  sundae: 'https://images.unsplash.com/photo-1534706936160-d5ee67737249?auto=format&fit=crop&w=800&q=70',
  popcorn: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?auto=format&fit=crop&w=800&q=70',
  popcornCaramel: 'https://images.unsplash.com/photo-1505686994434-e3cc5abf1330?auto=format&fit=crop&w=800&q=70',
  tuwo: 'https://images.unsplash.com/photo-1512058564366-18510be2db19?auto=format&fit=crop&w=800&q=70',
  platter: wm('Nigerian party jollof.jpg', 1000),
};

const CATEGORY_META = {
  'Soups & swallow': { image: PIC.egusi, note: 'Pounded yam, eba, fufu or semo included with every soup' },
  'Rice & grains': { image: PIC.jollof, note: 'Party-style, finished over firewood' },
  'Grills & suya': { image: PIC.suya, note: 'Charcoal grilled to order, yaji-dusted' },
  Seafood: { image: PIC.fish, note: 'Bought fresh at Makoko market each morning' },
  'Small chops': { image: PIC.snack, note: 'Fried to order, never made ahead' },
  Drinks: { image: PIC.drink, note: 'Brewed, tapped and pressed in house' },
  Extras: { image: PIC.popcorn, note: 'Add a scoop or a bag to any order' },
};

const LOCAL_MENU = [
  { id: 'l-01', name: 'Egusi soup with pounded yam', category: 'Soups & swallow', price: 6500, available_quantity: 22, image_url: PIC.egusi, blurb: 'Melon seed, bitterleaf, assorted meat and stockfish.', ready: true },
  { id: 'l-02', name: 'Ogbono soup with eba', category: 'Soups & swallow', price: 6200, available_quantity: 19, image_url: PIC.ogbono, blurb: 'Drawn thick with wild mango seed and smoked fish.', ready: true },
  { id: 'l-03', name: 'Afang soup with fufu', category: 'Soups & swallow', price: 7000, available_quantity: 14, image_url: PIC.afang, blurb: 'Efik classic — afang leaf, waterleaf and periwinkle.' },
  { id: 'l-04', name: 'Banga soup with starch', category: 'Soups & swallow', price: 7200, available_quantity: 12, image_url: PIC.ogbono2, blurb: 'Delta palm-nut broth with beletientien and catfish.' },
  { id: 'l-05', name: 'Edikang ikong', category: 'Soups & swallow', price: 7400, available_quantity: 10, image_url: PIC.afang, blurb: 'Heavy with ugu, waterleaf, dried prawn and beef.' },
  { id: 'l-06', name: 'Oha soup with pounded yam', category: 'Soups & swallow', price: 6800, available_quantity: 15, image_url: PIC.egusi, blurb: 'Cocoyam-thickened, finished with torn oha leaf.' },
  { id: 'l-07', name: 'Nsala (white soup)', category: 'Soups & swallow', price: 7100, available_quantity: 8, image_url: PIC.peppersoup, blurb: 'Peppery catfish broth, no palm oil, utazi lift.' },
  { id: 'l-08', name: 'Okra soup with semo', category: 'Soups & swallow', price: 5900, available_quantity: 24, image_url: PIC.okra, blurb: 'Chopped fresh, cooked short so it stays green.', ready: true },
  { id: 'l-09', name: 'Bitterleaf soup (ofe onugbu)', category: 'Soups & swallow', price: 6600, available_quantity: 13, image_url: PIC.ogbono2, blurb: 'Washed three times, cocoyam base, achi finish.' },

  { id: 'l-10', name: 'Party jollof rice', category: 'Rice & grains', price: 5500, available_quantity: 40, image_url: PIC.jollof, blurb: 'Firewood smoke, long-simmered pepper base, fried plantain.', ready: true },
  { id: 'l-11', name: 'Ofada rice & ayamase', category: 'Rice & grains', price: 6900, available_quantity: 18, image_url: PIC.ofada, blurb: 'Unpolished ofada with green pepper designer stew.' },
  { id: 'l-12', name: 'Coconut jollof', category: 'Rice & grains', price: 6200, available_quantity: 16, image_url: PIC.jollof2, blurb: 'Cooked in fresh coconut milk, prawns folded through.' },
  { id: 'l-13', name: 'Native jollof (palm oil rice)', category: 'Rice & grains', price: 6400, available_quantity: 14, image_url: PIC.jollofFish, blurb: 'Iwuk edesi style with dried fish and periwinkle.' },
  { id: 'l-14', name: 'Fried rice', category: 'Rice & grains', price: 5800, available_quantity: 30, image_url: PIC.friedrice, blurb: 'Liver, sweetcorn, green beans, curry-gold grains.', ready: true },
  { id: 'l-15', name: 'Tuwo shinkafa & miyan kuka', category: 'Rice & grains', price: 6100, available_quantity: 11, image_url: PIC.tuwo, blurb: 'Northern rice pudding with baobab leaf soup.' },
  { id: 'l-16', name: 'Jollof spaghetti', category: 'Rice & grains', price: 4900, available_quantity: 26, image_url: PIC.jollofBeef, blurb: 'The house favourite of every Lagos child.' },
  { id: 'l-17', name: 'Ewa agoyin & dodo', category: 'Rice & grains', price: 4200, available_quantity: 28, image_url: PIC.beans, blurb: 'Mashed soft, with that black agoyin pepper sauce.', ready: true },

  { id: 'l-18', name: 'Beef suya platter', category: 'Grills & suya', price: 7500, available_quantity: 25, image_url: PIC.suya, blurb: 'Hand-sliced, yaji-dusted, raw onion and tomato.', ready: true },
  { id: 'l-19', name: 'Chicken suya skewers', category: 'Grills & suya', price: 6800, available_quantity: 22, image_url: PIC.grill, blurb: 'Six skewers, extra yaji served on the side.' },
  { id: 'l-20', name: 'Asun (peppered goat)', category: 'Grills & suya', price: 8200, available_quantity: 13, image_url: PIC.asun, blurb: 'Smoked goat tossed hot with scotch bonnet.', ready: true },
  { id: 'l-21', name: 'Bole & roasted fish', category: 'Grills & suya', price: 7800, available_quantity: 9, image_url: PIC.plantain, blurb: 'Port Harcourt style — roast plantain, palm oil sauce.' },
  { id: 'l-22', name: 'Nkwobi', category: 'Grills & suya', price: 7600, available_quantity: 10, image_url: PIC.charcoal, blurb: 'Cow foot in spiced palm oil emulsion, utazi on top.' },
  { id: 'l-23', name: 'Isi ewu', category: 'Grills & suya', price: 9500, available_quantity: 6, image_url: PIC.charcoal, blurb: 'Goat head, ehu seed, served in the wooden mortar.' },

  { id: 'l-24', name: 'Grilled croaker fish', category: 'Seafood', price: 8900, available_quantity: 12, image_url: PIC.fish, blurb: 'Whole croaker, pepper marinade, fried plantain.' },
  { id: 'l-25', name: 'Catfish peppersoup', category: 'Seafood', price: 7200, available_quantity: 15, image_url: PIC.peppersoup, blurb: 'Uziza, scent leaf and a broth that clears the head.', ready: true },
  { id: 'l-26', name: 'Prawns in obe ata', category: 'Seafood', price: 9200, available_quantity: 8, image_url: PIC.prawns, blurb: 'Tiger prawns in deep-fried pepper stew.' },
  { id: 'l-27', name: 'Stockfish & periwinkle pot', category: 'Seafood', price: 8600, available_quantity: 7, image_url: PIC.stockfish, blurb: 'Slow-cooked riverine pot, best eaten with starch.' },

  { id: 'l-28', name: 'Puff puff (6 pieces)', category: 'Small chops', price: 2000, available_quantity: 45, image_url: PIC.snack, blurb: 'Fried to order, dusted with sugar.', ready: true },
  { id: 'l-29', name: 'Meat pie', category: 'Small chops', price: 1800, available_quantity: 38, image_url: PIC.pie, blurb: 'Shortcrust, minced beef, potato and carrot.', ready: true },
  { id: 'l-30', name: 'Small chops platter', category: 'Small chops', price: 5500, available_quantity: 20, image_url: PIC.snack, blurb: 'Puff puff, samosa, spring roll, peppered gizzard.' },
  { id: 'l-31', name: 'Akara & pap', category: 'Small chops', price: 2600, available_quantity: 24, image_url: PIC.pap, blurb: 'Morning classic — bean cakes with warm ogi.' },
  { id: 'l-32', name: 'Moi moi', category: 'Small chops', price: 2400, available_quantity: 30, image_url: PIC.beans, blurb: 'Steamed in leaves with egg and corned beef.', ready: true },
  { id: 'l-33', name: 'Peppered gizdodo', category: 'Small chops', price: 4200, available_quantity: 18, image_url: PIC.plantain, blurb: 'Gizzard and plantain cubes in thick pepper sauce.' },
  { id: 'l-34', name: 'Boli & groundnut', category: 'Small chops', price: 1900, available_quantity: 26, image_url: PIC.plantain, blurb: 'Roast plantain, roasted groundnut, nothing else.', ready: true },

  { id: 'l-35', name: 'Chapman', category: 'Drinks', price: 2800, available_quantity: 50, image_url: PIC.drink, blurb: 'The Lagos house cocktail, cucumber and bitters.', ready: true },
  { id: 'l-36', name: 'Zobo (hibiscus)', category: 'Drinks', price: 1800, available_quantity: 48, image_url: PIC.hibiscus, blurb: 'Steeped with ginger, clove and pineapple skin.', ready: true },
  { id: 'l-37', name: 'Kunu aya', category: 'Drinks', price: 2000, available_quantity: 32, image_url: PIC.milk, blurb: 'Tigernut milk, dates and a whisper of ginger.', ready: true },
  { id: 'l-38', name: 'Palm wine (fresh tap)', category: 'Drinks', price: 3500, available_quantity: 14, image_url: PIC.palmwine, blurb: 'Tapped at dawn, on our counter by noon.' },
  { id: 'l-39', name: 'Fura da nono', category: 'Drinks', price: 2400, available_quantity: 16, image_url: PIC.milk, blurb: 'Fermented milk with millet balls, served cold.' },
  { id: 'l-40', name: 'Soursop & ginger juice', category: 'Drinks', price: 2200, available_quantity: 28, image_url: PIC.juice, blurb: 'Pressed each morning, never from concentrate.', ready: true },

  { id: 'x-01', name: 'Coconut & tigernut ice cream', category: 'Extras', kind: 'Ice cream', price: 3200, available_quantity: 24, image_url: PIC.ice, blurb: 'Kunu aya, frozen. Double scoop in a cup or cone.', ready: true },
  { id: 'x-02', name: 'Zobo sorbet', category: 'Extras', kind: 'Ice cream', price: 3000, available_quantity: 20, image_url: PIC.sorbet, blurb: 'Sharp, deep red, clears the palate after suya.', ready: true },
  { id: 'x-03', name: 'Chin chin crunch ice cream', category: 'Extras', kind: 'Ice cream', price: 3600, available_quantity: 18, image_url: PIC.sundae, blurb: 'Vanilla base folded through with crushed chin chin.', ready: true },
  { id: 'x-04', name: 'Suya-spiced chocolate ice cream', category: 'Extras', kind: 'Ice cream', price: 3800, available_quantity: 12, image_url: PIC.choc, blurb: 'Dark chocolate with a warm yaji finish.' },
  { id: 'x-05', name: 'Agbalumo sorbet', category: 'Extras', kind: 'Ice cream', price: 3400, available_quantity: 9, image_url: PIC.sorbet, blurb: 'African star apple, in season and properly tart.' },
  { id: 'x-06', name: 'Plantain caramel ice cream', category: 'Extras', kind: 'Ice cream', price: 3500, available_quantity: 16, image_url: PIC.ice, blurb: 'Caramelised dodo swirled through sweet cream.', ready: true },
  { id: 'x-07', name: 'Groundnut & honey ice cream', category: 'Extras', kind: 'Ice cream', price: 3300, available_quantity: 21, image_url: PIC.sundae, blurb: 'Roasted groundnut butter with a wild honey ripple.' },
  { id: 'x-08', name: 'Salted popcorn (regular)', category: 'Extras', kind: 'Popcorn', price: 1200, available_quantity: 60, image_url: PIC.popcorn, blurb: 'Popped every hour. Warm, light, lightly salted.', ready: true },
  { id: 'x-09', name: 'Caramel popcorn', category: 'Extras', kind: 'Popcorn', price: 1600, available_quantity: 44, image_url: PIC.popcornCaramel, blurb: 'Glossy caramel coat, cooled until it snaps.', ready: true },
  { id: 'x-10', name: 'Suya-spiced popcorn', category: 'Extras', kind: 'Popcorn', price: 1800, available_quantity: 30, image_url: PIC.popcorn, blurb: 'Yaji dusted over butter. The bar favourite.', ready: true },
  { id: 'x-11', name: 'Coconut popcorn', category: 'Extras', kind: 'Popcorn', price: 1700, available_quantity: 26, image_url: PIC.popcornCaramel, blurb: 'Popped in coconut oil, finished with toasted flakes.' },
  { id: 'x-12', name: 'Family popcorn bucket', category: 'Extras', kind: 'Popcorn', price: 4500, available_quantity: 18, image_url: PIC.popcorn, blurb: 'Big bucket, any two flavours, made for sharing.', ready: true },
];

const CATEGORY_ORDER = ['Soups & swallow', 'Rice & grains', 'Grills & suya', 'Seafood', 'Small chops', 'Drinks', 'Extras'];
const metaFor = (c) => CATEGORY_META[c] || CATEGORY_META['Rice & grains'];
const money = (n) => `₦${Number(n).toLocaleString()}`;

/* ---------- SOCIAL ICONS ---------- */
const ICONS = {
  instagram: 'M12 2.2c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07s-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41a3.8 3.8 0 0 1-1.38-.9 3.8 3.8 0 0 1-.9-1.38c-.16-.42-.36-1.06-.41-2.23C2.21 15.58 2.2 15.2 2.2 12s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41C8.42 2.21 8.8 2.2 12 2.2Zm0 3.3a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Zm0 10.72a4.22 4.22 0 1 1 0-8.44 4.22 4.22 0 0 1 0 8.44Zm6.76-10.98a1.52 1.52 0 1 1-3.04 0 1.52 1.52 0 0 1 3.04 0Z',
  facebook: 'M22 12a10 10 0 1 0-11.56 9.88v-6.99H7.9V12h2.54V9.8c0-2.51 1.5-3.9 3.78-3.9 1.1 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.77-1.63 1.56V12h2.78l-.45 2.89h-2.33v6.99A10 10 0 0 0 22 12Z',
  x: 'M17.53 3h3.05l-6.66 7.61L21.75 21h-5.9l-4.62-6.04L5.94 21H2.88l7.13-8.14L2.4 3h6.05l4.18 5.52L17.53 3Zm-1.07 16.14h1.69L7.63 4.77H5.82l10.64 14.37Z',
  tiktok: 'M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.1v12.4a2.59 2.59 0 1 1-1.84-2.48V9.74a5.68 5.68 0 1 0 4.94 5.63V9.01a7.35 7.35 0 0 0 4.3 1.38V7.29a4.3 4.3 0 0 1-3.24-1.47Z',
  whatsapp: 'M12.04 2a9.9 9.9 0 0 0-8.5 14.96L2 22l5.19-1.5A9.9 9.9 0 1 0 12.04 2Zm0 1.83a8.07 8.07 0 1 1-4.1 15.03l-.3-.18-3.07.89.9-3-.2-.31A8.07 8.07 0 0 1 12.04 3.83Z',
};

const SOCIALS = [
  ['Instagram', 'https://instagram.com', 'instagram'],
  ['Facebook', 'https://facebook.com', 'facebook'],
  ['X', 'https://x.com', 'x'],
  ['TikTok', 'https://tiktok.com', 'tiktok'],
  ['WhatsApp', 'https://wa.me/7046302002', 'whatsapp'],
];

function Socials() {
  return (
    <div className="socials">
      {SOCIALS.map(([name, href, key]) => (
        <a key={name} href={href} target="_blank" rel="noreferrer" aria-label={name} title={name}>
          <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" aria-hidden="true">
            <path d={ICONS[key]} />
          </svg>
        </a>
      ))}
    </div>
  );
}

const fallback = (cat) => (e) => {
  if (e.currentTarget.dataset.fb) return;
  e.currentTarget.dataset.fb = '1';
  e.currentTarget.src = metaFor(cat).image;
};

/* ---------- DISH CARD with new two-button layout ---------- */
function Card({ item, add, addAndGo, detail }) {
  const low = item.available_quantity < 10;
  return (
    <article className="card">
      <div className="pic">
        <img src={item.image_url || metaFor(item.category).image} alt={item.name} loading="lazy" onError={fallback(item.category)} />
        <em className={low ? 'low' : ''}>{low ? `Only ${item.available_quantity} left` : 'Made fresh today'}</em>
        {item.ready && <span className="readytag">Ready now</span>}
      </div>
      <div className="cardbody">
        <small>{item.kind || item.category}</small>
        <h3>{item.name}</h3>
        {item.blurb && <p className="blurb">{item.blurb}</p>}
        {detail && <p className="stockline">{item.available_quantity} portions available</p>}
        <div className="cardfoot">
          <b>{money(item.price)}</b>
          <div className="cardbtns">
            <button
              className="btnadd"
              onClick={() => add(item)}
              aria-label={`Add ${item.name} to your bag`}
            >
              Add to bag
            </button>
            <button
              className="btnbuy"
              onClick={() => addAndGo(item)}
              aria-label={`Order ${item.name} now`}
            >
              Order now →
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ---------- RESERVATION MODAL ---------- */
function Booking({ close }) {
  const [done, setDone] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', phone: '', guest_count: '2', date: '', time: '19:00', occasion: '' });
  const set = (f) => (e) => setForm((s) => ({ ...s, [f]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.date) { setError('Please choose a date.'); return; }
    setSubmitting(true);
    try {
      await createReservation({
        name: form.name, email: form.email, phone: form.phone,
        guest_count: Number(form.guest_count),
        reserved_at: `${form.date} ${form.time}:00`,
        occasion: form.occasion || null,
      });
      setDone(true);
    } catch (err) { setError(err.message); } finally { setSubmitting(false); }
  };

  return (
    <div className="overlay" onClick={(e) => e.target === e.currentTarget && close()}>
      <div className="modal">
        <button className="x" onClick={close} aria-label="Close">×</button>
        {done ? (
          <div className="done">
            <b>✦</b>
            <small className="eyebrow">YOUR TABLE IS HELD</small>
            <h2>See you soon.</h2>
            <p>We've written your name in the book. A confirmation is on its way to your phone.</p>
            <button className="primary" onClick={close}>Wonderful</button>
          </div>
        ) : (
          <>
            <small className="eyebrow">RESERVATIONS</small>
            <h2>Book a table</h2>
            <p>Tables are held for fifteen minutes past the booking time.</p>
            <form onSubmit={submit}>
              <label>Your name<input required placeholder="e.g. Ada Okafor" value={form.name} onChange={set('name')} /></label>
              <section>
                <label>Email<input required type="email" placeholder="you@email.com" value={form.email} onChange={set('email')} /></label>
                <label>Phone<input required placeholder="080..." value={form.phone} onChange={set('phone')} /></label>
              </section>
              <section>
                <label>Guests
                  <select value={form.guest_count} onChange={set('guest_count')}>
                    <option value="2">2 guests</option><option value="3">3 guests</option>
                    <option value="4">4 guests</option><option value="6">5–6 guests</option>
                    <option value="10">7+ (private room)</option>
                  </select>
                </label>
                <label>Date<input required type="date" value={form.date} onChange={set('date')} /></label>
              </section>
              <label>Time
                <select value={form.time} onChange={set('time')}>
                  {['13:00', '14:00', '18:00', '19:00', '20:00', '21:00'].map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </label>
              <label>Occasion (optional)<input placeholder="Birthday, owambe, business lunch…" value={form.occasion} onChange={set('occasion')} /></label>
              {error && <p className="formerror">{error}</p>}
              <button className="primary full" disabled={submitting}>{submitting ? 'Reserving…' : 'Reserve table →'}</button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

const ROLE_PICKS = [
  ['manager', 'Manager', 'Full access'],
  ['supervisor', 'Supervisor', 'Floor & kitchen'],
  ['staff', 'Staff', 'Orders only'],
];

/* ---------- ADMIN LOGIN ---------- */
function AdminLogin({ onSuccess, goHome }) {
  const [form, setForm] = useState({ email: '', password: '' });
  const [role, setRole] = useState('manager');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const set = (f) => (e) => setForm((s) => ({ ...s, [f]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) { setError('Enter your work email and password.'); return; }
    setBusy(true);
    try {
      const session = await login(form.email, form.password);
      if (session.user.role !== role) {
        await logout();
        setError(`This account is registered as ${session.user.role}, not ${role}. Pick the matching role and try again.`);
        return;
      }
      onSuccess(session);
    } catch (err) { setError(err.message); } finally { setBusy(false); }
  };

  return (
    <section className="loginpage">
      <div className="logincard">
        <div className="loginmark"><i>W</i></div>
        <small className="eyebrow">STAFF ACCESS ONLY</small>
        <h1>Management sign in</h1>
        <p>This area is restricted to Winning Spot Kitchen staff. What you can see depends on your role.</p>

        <div className="rolepicks">
          {ROLE_PICKS.map(([value, label, sub]) => (
            <button
              key={value}
              type="button"
              className={role === value ? 'on' : ''}
              onClick={() => setRole(value)}
              aria-pressed={role === value}
            >
              <b>{label}</b><small>{sub}</small>
            </button>
          ))}
        </div>

        <form onSubmit={submit}>
          <label>Work email<input type="email" autoComplete="username" placeholder="you@winningspot.ng" value={form.email} onChange={set('email')} /></label>
          <label>
            Password
            <div className="pwfield">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                placeholder="••••••••"
                value={form.password}
                onChange={set('password')}
              />
              <button
                type="button"
                className="pwtoggle"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
                title={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? '🙈' : '👁'}
              </button>
            </div>
          </label>
          {error && <p className="formerror">{error}</p>}
          <button className="primary full" disabled={busy}>{busy ? 'Signing in…' : `Sign in as ${ROLE_PICKS.find((r) => r[0] === role)[1]} →`}</button>
        </form>
        <button className="link" onClick={goHome}>← Back to the restaurant</button>
      </div>
    </section>
  );
}

const money2 = (n) => `₦${Number(n || 0).toLocaleString()}`;
const initialsOf = (name) => (name || '??').split(' ').map((w) => w[0]).join('').toUpperCase().slice(0, 2);
const timeOf = (iso) => { try { return new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

/* ---------- ADMIN DASHBOARD (unchanged) ---------- */
function Admin({ menu, session, signOut }) {
  const user = session.user;
  const allowed = PERMISSIONS[user.role] || [];
  const [tab, setTab] = useState(allowed[0] || 'Overview');
  const links = ['Overview', 'Orders', 'Menu & stock', 'Reservations', 'Customers', 'Reports'];
  const permitted = can(user, tab);
  const initials = initialsOf(user.name);

  const [orders, setOrders] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [liveError, setLiveError] = useState('');
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const jobs = [];
        if (can(user, 'Orders')) jobs.push(fetchAdminOrders().then((d) => !cancelled && setOrders(d.data || d)));
        if (can(user, 'Reservations')) jobs.push(fetchAdminReservations().then((d) => !cancelled && setReservations(d.data || d)));
        if (can(user, 'Reports')) jobs.push(fetchTipsReport().then((d) => !cancelled && setTips(d)));
        await Promise.all(jobs);
        if (!cancelled) setLiveError('');
      } catch (err) {
        if (!cancelled) setLiveError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    const id = setInterval(load, 8000);
    return () => { cancelled = true; clearInterval(id); };
  }, [session, user]);

  const changeOrderStatus = async (order, status) => {
    setBusyId(order.id);
    try {
      const updated = await updateOrderStatus(order.id, status);
      setOrders((list) => list.map((o) => (o.id === order.id ? { ...o, ...updated } : o)));
    } catch (err) { setLiveError(err.message); } finally { setBusyId(null); }
  };

  const changeReservationStatus = async (res, status) => {
    setBusyId(res.id);
    try {
      const updated = await updateReservationStatus(res.id, status);
      setReservations((list) => list.map((r) => (r.id === res.id ? { ...r, ...updated } : r)));
    } catch (err) { setLiveError(err.message); } finally { setBusyId(null); }
  };

  const revenueToday = orders.reduce((s, o) => s + Number(o.total || 0), 0);
  const tipsToday = orders.reduce((s, o) => s + Number(o.tip_amount || 0), 0);
  const activeOrders = orders.filter((o) => !['completed', 'cancelled'].includes(o.status));
  const pendingReservations = reservations.filter((r) => ['new', 'pending'].includes(r.status)).length;
  const weekTips = tips[0]?.total_tips ?? tipsToday;

  const customers = useMemo(() => {
    const map = new Map();
    for (const o of orders) {
      const key = o.customer_email || o.customer_name;
      if (!key) continue;
      const row = map.get(key) || { name: o.customer_name, email: o.customer_email, phone: o.customer_phone, orders: 0, spent: 0 };
      row.orders += 1;
      row.spent += Number(o.total || 0);
      map.set(key, row);
    }
    return [...map.values()].sort((a, b) => b.spent - a.spent);
  }, [orders]);

  return (
    <section className="admin">
      <aside>
        <div className="adminbrand"><i>W</i><b>Winning Spot</b><small>MANAGEMENT</small></div>
        {links.map((x) => {
          const ok = can(user, x);
          return (
            <button className={`${tab === x ? 'on' : ''}${ok ? '' : ' locked'}`} onClick={() => ok && setTab(x)} key={x} title={ok ? '' : 'Your role cannot open this'}>
              {x}{x === 'Orders' && ok && activeOrders.length > 0 && <em>{activeOrders.length}</em>}{!ok && <span className="lock">🔒</span>}
            </button>
          );
        })}
        <div className="manager">
          <i>{initials}</i>
          <span><b>{user.name}</b><small>{user.title || user.role}</small></span>
        </div>
        <button className="signout" onClick={signOut}>Sign out</button>
      </aside>
      <main>
        <header>
          <div>
            <small className="eyebrow">SIGNED IN AS {user.role.toUpperCase()}</small>
            <h1>{tab === 'Overview' ? `Good afternoon, ${user.name.split(' ')[0]}.` : tab}</h1>
          </div>
          {can(user, 'Orders') && <button className="primary">+ New order</button>}
        </header>

        {liveError && (<p className="formerror">Couldn't reach the API ({liveError}) — showing the last data loaded.</p>)}

        {!permitted ? (
          <div className="emptyadmin denied">
            <b>🔒</b>
            <h2>Not authorised</h2>
            <p>Your role ({user.role}) does not have access to {tab}. Ask a manager if you need it.</p>
          </div>
        ) : loading ? (
          <p className="loading">Loading live data…</p>
        ) : tab === 'Orders' ? (
          <section className="panel fulllist">
            <h2>All orders</h2>
            <p>{orders.length} loaded · {activeOrders.length} active</p>
            {orders.map((o) => (
              <article className="order wide" key={o.id}>
                <i>{initialsOf(o.customer_name)}</i>
                <span>
                  <b>{o.customer_name}</b>
                  <small>{(o.items || []).map((it) => `${it.name} × ${it.quantity}`).join(', ') || o.reference}</small>
                </span>
                <span><b>{o.type}</b><small>{o.customer_phone}</small></span>
                <span><b>{money2(o.total)}</b><small>{timeOf(o.created_at)}</small></span>
                <select className={`statuspick ${o.status}`} value={o.status} disabled={busyId === o.id} onChange={(e) => changeOrderStatus(o, e.target.value)}>
                  {['new', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'].map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </article>
            ))}
            {!orders.length && <p className="loading">No orders yet.</p>}
          </section>
        ) : tab === 'Reservations' ? (
          <section className="panel fulllist">
            <h2>All reservations</h2>
            <p>{reservations.length} loaded · {pendingReservations} awaiting confirmation</p>
            {reservations.map((r) => (
              <article className="order wide" key={r.id}>
                <i>{initialsOf(r.name)}</i>
                <span><b>{r.name}</b><small>{r.email} · {r.phone}</small></span>
                <span><b>{r.guest_count} guests</b><small>{r.occasion || 'No occasion given'}</small></span>
                <span><b>{r.reserved_at ? new Date(r.reserved_at).toLocaleDateString() : ''}</b><small>{timeOf(r.reserved_at)}</small></span>
                <select className={`statuspick ${r.status}`} value={r.status} disabled={busyId === r.id} onChange={(e) => changeReservationStatus(r, e.target.value)}>
                  {['new', 'confirmed', 'seated', 'completed', 'cancelled'].map((s) => (<option key={s} value={s}>{s}</option>))}
                </select>
              </article>
            ))}
            {!reservations.length && <p className="loading">No reservations yet.</p>}
          </section>
        ) : tab === 'Menu & stock' ? (
          <section className="panel stock fulllist">
            <h2>Menu &amp; stock</h2>
            <p>{menu.length} items on the menu</p>
            {menu.map((x) => (
              <article key={x.id}>
                <i className="thumb"><img src={x.image_url} alt={x.name} onError={fallback(x.category)} /></i>
                <b>{x.name}</b>
                <span><em style={{ width: Math.min(100, x.available_quantity * 8) + '%' }} /></span>
                <small>{x.available_quantity} left</small>
              </article>
            ))}
          </section>
        ) : tab === 'Customers' ? (
          <section className="panel fulllist">
            <h2>Customers</h2>
            <p>{customers.length} customers from loaded orders</p>
            {customers.map((c) => (
              <article className="order wide" key={c.email || c.name}>
                <i>{initialsOf(c.name)}</i>
                <span><b>{c.name}</b><small>{c.email}</small></span>
                <span><b>{c.phone}</b></span>
                <span><b>{c.orders} order{c.orders === 1 ? '' : 's'}</b><small>{money2(c.spent)} lifetime</small></span>
              </article>
            ))}
            {!customers.length && <p className="loading">No customer data yet.</p>}
          </section>
        ) : tab === 'Reports' ? (
          <section className="panel fulllist">
            <h2>Weekly tips</h2>
            <p>Grouped by ISO week, split across kitchen and floor</p>
            {tips.map((row) => (
              <article className="order wide" key={row.week}>
                <span><b>Week {row.week}</b></span>
                <span><b>{money2(row.total_tips)}</b></span>
              </article>
            ))}
            {!tips.length && <p className="loading">No tip data yet.</p>}
          </section>
        ) : (
          <>
            <div className="stats">
              {[
                ['Revenue (loaded orders)', money2(revenueToday), `${orders.length} orders in view`],
                ['Active orders', activeOrders.length, `${orders.length} total loaded`],
                ['Tips (loaded orders)', money2(tipsToday), can(user, 'Reports') ? `${money2(weekTips)} this week` : 'Ask a manager for reports'],
                ['Pending reservations', pendingReservations, `${reservations.length} total loaded`],
              ].map((x) => (
                <div key={x[0]}><small>{x[0]}</small><h2>{x[1]}</h2><p>{x[2]}</p></div>
              ))}
            </div>
            <div className="admincols">
              <section className="panel">
                <h2>Live orders</h2>
                <p>{activeOrders.length ? `${activeOrders.length} active in the kitchen` : 'Nothing active right now'}</p>
                {orders.slice(0, 6).map((o) => (
                  <article className="order" key={o.id}>
                    <i>{initialsOf(o.customer_name)}</i>
                    <span><b>{o.customer_name}</b><small>{(o.items || []).map((it) => `${it.name} × ${it.quantity}`).join(', ') || o.reference}</small></span>
                    <span><b>{money2(o.total)}</b><small>{timeOf(o.created_at)}</small></span>
                    {can(user, 'Orders') ? (
                      <select className={`statuspick ${o.status}`} value={o.status} disabled={busyId === o.id} onChange={(e) => changeOrderStatus(o, e.target.value)}>
                        {['new', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'].map((s) => (<option key={s} value={s}>{s}</option>))}
                      </select>
                    ) : (<em className={o.status}>{o.status}</em>)}
                  </article>
                ))}
                {!orders.length && <p className="loading">No orders loaded yet.</p>}
              </section>
              <section className="panel">
                <h2>Reservations</h2>
                <p>{reservations.length ? `${pendingReservations} awaiting confirmation` : 'No reservations loaded yet'}</p>
                {reservations.slice(0, 6).map((r) => (
                  <article className="order" key={r.id}>
                    <i>{initialsOf(r.name)}</i>
                    <span><b>{r.name}</b><small>{r.guest_count} guests · {r.occasion || 'No occasion given'}</small></span>
                    <span><b>{r.reserved_at ? new Date(r.reserved_at).toLocaleDateString() : ''}</b><small>{timeOf(r.reserved_at)}</small></span>
                    {can(user, 'Reservations') ? (
                      <select className={`statuspick ${r.status}`} value={r.status} disabled={busyId === r.id} onChange={(e) => changeReservationStatus(r, e.target.value)}>
                        {['new', 'confirmed', 'seated', 'completed', 'cancelled'].map((s) => (<option key={s} value={s}>{s}</option>))}
                      </select>
                    ) : (<em className={r.status}>{r.status}</em>)}
                  </article>
                ))}
              </section>
            </div>
            <section className="panel stock">
              <h2>Stock attention</h2>
              <p>Dishes running low in the kitchen</p>
              {menu.filter((x) => x.available_quantity < 12).slice(0, 8).map((x) => (
                <article key={x.id}>
                  <i className="thumb"><img src={x.image_url} alt={x.name} onError={fallback(x.category)} /></i>
                  <b>{x.name}</b>
                  <span><em style={{ width: Math.min(100, x.available_quantity * 8) + '%' }} /></span>
                  <small>{x.available_quantity} left</small>
                </article>
              ))}
            </section>
          </>
        )}
      </main>
    </section>
  );
}

function About({ book }) {
  return (
    <section className="aboutpage">
      <div className="pagehead">
        <small className="eyebrow">OUR STORY</small>
        <h1>Everybody eats at the <i>winning spot.</i></h1>
      </div>

      <div className="aboutintro">
        <div>
          <p className="lede">Winning Spot Kitchen began in 2014 as six plastic chairs under a tarpaulin on BCG Road, Keffi, serving jollof to traders who had no time to sit down.</p>
          <p>Word travelled the way it does in Keffi — one cousin tells another. Within two years the tarpaulin had become a room, the room became a dining hall, and the same pot of stew that fed six people a day was feeding four hundred.</p>
          <p>We have grown, but the cooking has not changed. Everything is made from scratch each morning: the pepper is blended, not bought; the stock simmers overnight; the swallow is pounded in the back room, not scooped from a bag. If our grandmothers would not recognise it, we do not serve it.</p>
          <div className="aboutstats">
            <b>2014<small>YEAR WE OPENED</small></b>
            <b>47<small>PEOPLE ON OUR TEAM</small></b>
            <b>400+<small>PLATES A DAY</small></b>
            <b>4.9 ★<small>GUEST RATING</small></b>
          </div>
        </div>
        <div className="aboutpic">
          <img src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=900&q=70" alt="The dining room at Winning Spot Kitchen" />
          <span className="tag">Keffi, Nasarawa State</span>
        </div>
      </div>

      <div className="timeline">
        <small className="eyebrow">HOW WE GOT HERE</small>
        <div>
          {[
            ['2014', 'Six chairs, one pot', 'Chinaza starts cooking lunch for traders on BCG Road, Keffi.'],
            ['2017', 'The first dining room', 'Twelve tables, a charcoal grill and a queue down the street.'],
            ['2021', 'The suya yard opens', 'An open-fire terrace built for asun, bole and isi ewu.'],
            ['2026', 'Where we are now', '47 staff, a takeaway counter, and ice cream churned in house.'],
          ].map((x) => (
            <article key={x[0]}><b>{x[0]}</b><h3>{x[1]}</h3><p>{x[2]}</p></article>
          ))}
        </div>
      </div>

      <div className="owner">
        <div className="ownerpic">
          <img src="https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=700&q=70" alt="Chinaza Ogundele, owner" />
        </div>
        <div>
          <small className="eyebrow">MEET THE OWNER</small>
          <h2>Chinaza <i>Ogundele</i></h2>
          <p className="ownerrole">Founder &amp; Head of Kitchen</p>
          <p>Chinaza learned to cook in Nsukka, standing on a stool beside her mother's fire, told she was too young to be trusted with the ogbono. She was eleven when she first cooked a soup start to finish for a family of nine.</p>
          <p>She moved to Keffi at twenty-three with ₦40,000, a borrowed pot and a conviction that the town did not need another continental restaurant — it needed one place that cooked Nigerian food properly, without shortcuts and without apology.</p>
          <p>She still buys the fish herself, three mornings a week, before the sun is properly up.</p>
          <blockquote>People do not come here for something new. They come for something right.</blockquote>
        </div>
      </div>

      <div className="eotm">
        <div className="eotmhead">
          <small className="eyebrow">RECOGNITION</small>
          <h2>Employee of the month</h2>
          <p>Every month the whole team votes — kitchen, floor and back office alike — for the person who carried the room.</p>
        </div>
        <article className="eotmcard">
          <div className="eotmpic">
            <img src="https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&w=600&q=70" alt="Tobi Adesanya" />
            <span className="badge">★ SEPTEMBER 2026</span>
          </div>
          <div className="eotmbody">
            <h3>Tobi Adesanya</h3>
            <p className="ownerrole">Head server · 3 years with us</p>
            <p>Tobi has a memory for faces that borders on unfair. Regulars are greeted by name, their usual table is ready, and somehow the Chapman arrives before anyone has asked for it.</p>
            <p>In September he covered fourteen extra shifts through our anniversary week, trained two new servers on the floor while doing it, and did not once lose his warmth with a table.</p>
            <div className="eotmmetrics">
              <b>14<small>EXTRA SHIFTS</small></b>
              <b>2<small>SERVERS TRAINED</small></b>
              <b>₦86k<small>TIPS EARNED</small></b>
            </div>
            <div className="eotmquote">
              <b>“He makes a full Saturday feel calm. That is a rare thing in this job.”</b>
              <small>— Amara Okafor, Restaurant manager</small>
            </div>
          </div>
        </article>
        <div className="pastwinners">
          <small className="eyebrow">PREVIOUS WINNERS</small>
          <div>
            {[
              ['Ngozi Eze', 'Soups & swallow section', 'August 2026'],
              ['Samuel Idris', 'Suya yard / grill', 'July 2026'],
              ['Halima Bello', 'Front of house', 'June 2026'],
              ['Emeka Uche', 'Kitchen porter', 'May 2026'],
            ].map((x) => (
              <article key={x[0]}>
                <i>{x[0].split(' ').map((w) => w[0]).join('')}</i>
                <span><b>{x[0]}</b><small>{x[1]}</small></span>
                <em>{x[2]}</em>
              </article>
            ))}
          </div>
        </div>
      </div>

      <div className="values">
        {[
          ['✦', 'Bought at the market, not the depot', 'Fish from Makoko, pepper from Mile 12, palm oil from the same Delta supplier since 2015.'],
          ['◈', 'Pounded, not packaged', 'Our swallow is pounded in the back room every service. You can hear it from the dining floor.'],
          ['❖', 'Nothing sits waiting', 'Small chops are fried to order. Suya goes on the fire when you sit down, not before.'],
          ['✧', 'Tips go to the team', 'Every naira tipped is split across kitchen and floor at the end of each week.'],
        ].map((x) => (
          <div key={x[1]}><b>{x[0]}</b><h3>{x[1]}</h3><p>{x[2]}</p></div>
        ))}
      </div>

      <div className="aboutcta">
        <small className="eyebrow">COME AND EAT</small>
        <h2>The pot is already on the <i>fire.</i></h2>
        <button className="primary" onClick={book}>Reserve a table →</button>
      </div>
    </section>
  );
}

const PLATTER = {
  id: 'platter-1',
  name: 'The Winning Platter',
  category: 'Rice & grains',
  price: 24500,
  available_quantity: 12,
  image_url: PIC.platter,
  blurb: 'Party jollof, beef suya, asun, moi moi, fried plantain and two Chapmans.',
};

export default function App() {
  const [view, setView] = useState('home');
  const [menu, setMenu] = useState(LOCAL_MENU);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuError, setMenuError] = useState('');
  const [cart, setCart] = useState([]);
  const [book, setBook] = useState(false);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');
  const [note, setNote] = useState(null); // { text, link }
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [orderType, setOrderType] = useState('pickup');
  const [tipPct, setTipPct] = useState(10);
  const [customTip, setCustomTip] = useState('');
  const [tipNote, setTipNote] = useState('');
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState('');
  const [email, setEmail] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [session, setSession] = useState(() => loadSession());
  const [theme, setTheme] = useState(() => localStorage.getItem('wsk-theme') || 'light');

  // Confirmed order (for the confirmation screen)
  const [confirmed, setConfirmed] = useState(null);
  // Last added item, for the mini cart
  const [lastAdded, setLastAdded] = useState(null);
  const [miniCartVisible, setMiniCartVisible] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('wsk-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!note) return;
    const t = setTimeout(() => setNote(null), 4500);
    return () => clearTimeout(t);
  }, [note]);

  // Auto-hide mini-cart after 6 seconds
  useEffect(() => {
    if (!miniCartVisible) return;
    const t = setTimeout(() => setMiniCartVisible(false), 6000);
    return () => clearTimeout(t);
  }, [miniCartVisible, lastAdded]);

  useEffect(() => {
    let cancelled = false;
    fetchMenu()
      .then((data) => {
        if (cancelled) return;
        const extra = (data || []).filter((d) => !LOCAL_MENU.some((l) => l.name.toLowerCase() === String(d.name).toLowerCase()));
        setMenu([...LOCAL_MENU, ...extra]);
      })
      .catch((err) => { if (!cancelled) setMenuError(err.message); })
      .finally(() => { if (!cancelled) setMenuLoading(false); });
    return () => { cancelled = true; };
  }, []);

  /* ---------- CART HELPERS ---------- */
  const add = (item, msg) => {
    setCart((c) => {
      const hit = c.find((x) => x.id === item.id);
      return hit ? c.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x)) : [...c, { ...item, qty: 1 }];
    });
    setLastAdded(item);
    setMiniCartVisible(true);
    setNote({
      text: msg || `${item.name} added to your bag`,
      link: { label: 'View bag →', go: () => go('cart') },
    });
  };

  const addAndGo = (item) => {
    setCart((c) => {
      const hit = c.find((x) => x.id === item.id);
      return hit ? c.map((x) => (x.id === item.id ? { ...x, qty: x.qty + 1 } : x)) : [...c, { ...item, qty: 1 }];
    });
    setMiniCartVisible(false);
    go('cart');
  };

  const setQty = (id, qty) => {
    if (qty <= 0) {
      setCart((c) => c.filter((x) => x.id !== id));
      return;
    }
    setCart((c) => c.map((x) => (x.id === id ? { ...x, qty } : x)));
  };

  const takeaway = (item) => {
    setOrderType('takeaway');
    add(item, `${item.name} added — ready for pickup in about 5 minutes`);
  };

  const subtotal = useMemo(() => cart.reduce((s, x) => s + Number(x.price) * x.qty, 0), [cart]);
  const service = Math.round(subtotal * 0.075);
  const tip = customTip !== '' ? Math.max(0, Math.round(Number(customTip) || 0)) : Math.round(subtotal * (tipPct / 100));
  const total = subtotal + service + tip;
  const count = cart.reduce((s, x) => s + x.qty, 0);
  const go = (x) => { setView(x); setMenuOpen(false); setMiniCartVisible(false); scrollTo(0, 0); };

  const readyNow = useMemo(() => menu.filter((x) => x.ready).slice(0, 8), [menu]);

  const categories = useMemo(() => {
    const present = [...new Set(menu.map((x) => x.category))];
    const ordered = CATEGORY_ORDER.filter((c) => present.includes(c));
    return ['All', ...ordered, ...present.filter((c) => !CATEGORY_ORDER.includes(c))];
  }, [menu]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return menu.filter((x) =>
      (filter === 'All' || x.category === filter) &&
      (!q || x.name.toLowerCase().includes(q) || (x.blurb || '').toLowerCase().includes(q))
    );
  }, [menu, filter, query]);

  const placeOrder = async () => {
    setOrderError('');
    if (!customer.name || !customer.email || !customer.phone) {
      setOrderError('Please fill in your name, email and phone before placing the order.');
      return;
    }
    setPlacing(true);
    try {
      const snapshot = { ...cart.reduce((a, x) => ({ ...a, [x.id]: x.qty }), {}) };
      const res = await createOrder({
        customer_name: customer.name,
        customer_email: customer.email,
        customer_phone: customer.phone,
        type: orderType,
        tip_amount: tip,
        tip_note: tipNote || null,
        items: cart.map((x) => ({ menu_item_id: x.id, quantity: x.qty })),
      });
      setConfirmed({
        reference: res.reference || res.id,
        customer, orderType, cart: [...cart],
        subtotal, service, tip, total,
        itemsSnapshot: snapshot,
      });
      setCart([]); setCustomTip(''); setTipNote('');
      setMiniCartVisible(false);
    } catch (err) { setOrderError(err.message); } finally { setPlacing(false); }
  };

  const signOut = async () => { await logout(); setSession(null); setNote({ text: 'Signed out of the management panel.' }); go('home'); };

  const Brand = ({ onClick }) => (
    <button className="brand" onClick={onClick}>
      <i>W</i><span className="bname">Winning Spot<em>KITCHEN</em></span>
    </button>
  );

  return (
    <>
      <div className="ticker"><div>
        {Array.from({ length: 2 }).map((_, i) => (
          <span key={i}>Firewood jollof from 12 noon　✦　Takeaway counter open all day　✦　Suya yard open till 11pm　✦　Free delivery within Keffi over ₦25,000　✦　</span>
        ))}
      </div></div>

      <header className="top">
        <Brand onClick={() => go('home')} />
        <nav className={menuOpen ? 'open' : ''}>
          <button className={view === 'home' ? 'on' : ''} onClick={() => go('home')}>Home</button>
          <button className={view === 'menu' ? 'on' : ''} onClick={() => go('menu')}>Menu</button>
          <button className={view === 'about' ? 'on' : ''} onClick={() => go('about')}>About us</button>
          <button onClick={() => { setBook(true); setMenuOpen(false); }}>Reservations</button>
        </nav>
        <button className="reserve" onClick={() => setBook(true)}>▣ Reserve a table</button>
        <button
          className="themebtn"
          onClick={() => setTheme((t) => (t === 'light' ? 'dark' : 'light'))}
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          <span className="knob" aria-hidden="true"><em>☀</em><em>☾</em></span>
        </button>
        <button className={`bag ${count > 0 ? 'hasItems' : ''}`} onClick={() => go('cart')} aria-label="Your bag">
          🛍{count > 0 && <b>{count}</b>}
        </button>
        <button className="burger" onClick={() => setMenuOpen((o) => !o)} aria-label="Menu">{menuOpen ? '×' : '☰'}</button>
      </header>

      {/* Toast with link */}
      {note && (
        <div className="toast">
          <span>✓ {note.text}</span>
          {note.link && (
            <button className="toastlink" onClick={note.link.go}>{note.link.label}</button>
          )}
          <button className="toastclose" onClick={() => setNote(null)}>×</button>
        </div>
      )}

      {/* Mini cart preview */}
      {miniCartVisible && cart.length > 0 && view !== 'cart' && (
        <div className="minicart" role="status" aria-live="polite">
          <button className="minicartclose" onClick={() => setMiniCartVisible(false)}>×</button>
          <div className="minicarthead">
            <b>In your bag</b>
            <small>{count} item{count !== 1 ? 's' : ''}</small>
          </div>
          {lastAdded && (
            <div className="minicartitem">
              <i><img src={lastAdded.image_url} alt="" onError={fallback(lastAdded.category)} /></i>
              <span>
                <b>{lastAdded.name}</b>
                <small>{money(lastAdded.price)} · just added</small>
              </span>
            </div>
          )}
          <div className="minicartfoot">
            <span>Subtotal <b>{money(subtotal)}</b></span>
            <button onClick={() => go('cart')}>Checkout →</button>
          </div>
        </div>
      )}

      {view === 'home' && (
        <>
          <section className="hero">
            <div className="herotext">
              <small className="eyebrow">TRADITIONAL NIGERIAN KITCHEN · KEFFI, NASARAWA STATE</small>
              <h1>Food the way<br />your <i>mother</i><br />would make it.</h1>
              <p>Pounded in the back. Simmered overnight. Grilled over charcoal while you sit down. No shortcuts, no apologies — just the food we grew up on, done properly.</p>
              <div className="herobtns">
                <button className="primary" onClick={() => go('menu')}>See the full menu →</button>
                <button className="ghost" onClick={() => setBook(true)}>Book your table ↗</button>
              </div>
              <footer className="herometa">
                <b>4.9 ★★★★★<small>1,200+ GUEST REVIEWS</small></b>
                <b>12:00 – 23:00<small>OPEN EVERY DAY</small></b>
                <b>Since 2014<small>ON BCG ROAD</small></b>
              </footer>
            </div>

            <div className="heroart">
              <div className="platter">
                <div className="platterpic">
                  <img src={PLATTER.image_url} alt="The Winning Platter" onError={fallback(PLATTER.category)} />
                  <span className="plattertag">SERVES 4 · SIGNATURE</span>
                </div>
                <div className="platterbody">
                  <small className="eyebrow">OUR SPECIAL PLATTER</small>
                  <h3>The Winning Platter</h3>
                  <ul>
                    <li>Party jollof rice</li>
                    <li>Beef suya &amp; asun</li>
                    <li>Moi moi &amp; fried plantain</li>
                    <li>Two Chapmans</li>
                  </ul>
                  <div className="platterfoot">
                    <b>{money(PLATTER.price)}<small>Feeds four comfortably</small></b>
                    <button onClick={() => add(PLATTER)}>Add platter ＋</button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <section className="strip">
            {[['🔥', 'Charcoal grill', 'Open flame, never gas'], ['🌿', 'Market fresh', 'Bought each morning'], ['🥡', 'Takeaway counter', 'Ready food, no waiting'], ['🛵', 'Free delivery', 'Keffi orders over ₦25k']].map((x) => (
              <div key={x[1]}><b>{x[0]}</b><span><strong>{x[1]}</strong><small>{x[2]}</small></span></div>
            ))}
          </section>

          <section className="takeaway">
            <header>
              <div>
                <small className="eyebrow">TAKEAWAY COUNTER · READY NOW</small>
                <h2>Cooked already. <i>Just take it.</i></h2>
                <p>These are in the warmer at the front counter right now. Tap one, pay, and walk out with it — no waiting on the kitchen.</p>
              </div>
              <div className="takeawaymeta">
                <b>≈5 min<small>AVERAGE PICKUP</small></b>
                <b>{readyNow.length}<small>DISHES READY</small></b>
              </div>
            </header>
            <div className="takegrid">
              {readyNow.map((x) => (
                <TakeawayCard key={x.id} item={x} onAdd={takeaway} onBuy={addAndGo} />
              ))}
            </div>
            <p className="takenote">Counter hours 12:00 – 22:30 · pay by card, transfer or cash · bring your own container for ₦200 off</p>
          </section>

          <section className="intro">
            <div>
              <small className="eyebrow">A LITTLE ABOUT US</small>
              <h2>Rooted in the<br />things we <i>know.</i></h2>
            </div>
            <div>
              <p>Egusi, ogbono, afang, banga. Ofada with ayamase. Suya off the charcoal at midnight. This is not fusion and it is not reinvention — it is Nigerian cooking given the time and care it has always deserved.</p>
              <button className="link" onClick={() => go('about')}>Read our story →</button>
            </div>
          </section>

          <section className="categories">
            <header><div><small className="eyebrow">EXPLORE THE KITCHEN</small><h2>What we cook</h2></div></header>
            <div className="catgrid">
              {CATEGORY_ORDER.map((c) => (
                <button key={c} onClick={() => { setFilter(c); go('menu'); }}>
                  <img src={CATEGORY_META[c].image} alt={c} loading="lazy" />
                  <span><b>{c}</b><small>{menu.filter((m) => m.category === c).length} items</small></span>
                </button>
              ))}
            </div>
          </section>

          <section className="favourites">
            <header>
              <div><small className="eyebrow">FROM THE KITCHEN</small><h2>What everyone orders</h2></div>
              <button onClick={() => go('menu')}>View full menu →</button>
            </header>
            <div className="grid">
              {['l-10', 'l-01', 'l-18', 'l-11'].map((id) => {
                const item = menu.find((m) => m.id === id);
                return item ? <Card item={item} add={add} addAndGo={addAndGo} key={id} /> : null;
              })}
            </div>
          </section>

          <section className="feature">
            <div className="featurepic"><img src={PIC.suya} alt="The suya yard" onError={fallback('Grills & suya')} /></div>
            <div>
              <small className="eyebrow">THE SUYA YARD</small>
              <h2>Open fire, open till <i>eleven.</i></h2>
              <p>Round the back is a charcoal terrace built for one purpose. Beef and chicken suya sliced by hand and dusted heavy with yaji. Asun tossed hot with scotch bonnet. Nkwobi and isi ewu served the proper way, in the wooden mortar.</p>
              <p>Come after work, sit outside, order a cold palm wine and stay longer than you planned.</p>
              <button className="primary" onClick={() => { setFilter('Grills & suya'); go('menu'); }}>See the grill menu →</button>
            </div>
          </section>

          <section className="gallery">
            <header><small className="eyebrow">THE ROOM</small><h2>A look inside</h2></header>
            <div className="gallerygrid">
              {[
                'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=800&q=70',
                'https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=800&q=70',
                'https://images.unsplash.com/photo-1424847651672-bf20a4b0982b?auto=format&fit=crop&w=800&q=70',
                'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=800&q=70',
                'https://images.unsplash.com/photo-1600891964092-4316c288032e?auto=format&fit=crop&w=800&q=70',
                'https://images.unsplash.com/photo-1470337458703-46ad1756a187?auto=format&fit=crop&w=800&q=70',
              ].map((src, i) => <img src={src} alt="" key={i} loading="lazy" />)}
            </div>
          </section>

          <section className="reviews">
            <header><small className="eyebrow">GUEST BOOK</small><h2>What people say</h2></header>
            <div>
              {[
                ['★★★★★', 'The egusi tastes like my grandmother\u2019s, and I do not say that lightly. The pounded yam is actually pounded. I have found my spot.', 'Ada O.', 'Angwan Lambu'],
                ['★★★★★', 'Best suya on the island, and I have tried all of them. The asun is dangerous. Go on a Friday and sit in the yard.', 'Femi A.', 'Keffi Town'],
                ['★★★★★', 'I grab jollof from the takeaway counter twice a week on my way home. Two minutes, still hot when I get there.', 'Chiamaka N.', 'Keffi'],
              ].map((x) => (
                <article key={x[2]}><em>{x[0]}</em><p>{x[1]}</p><b>{x[2]}<small>{x[3]}</small></b></article>
              ))}
            </div>
          </section>

          <section className="pre">
            <div>
              <small className="eyebrow">OWAMBE · MEETINGS · FAMILY SUNDAYS</small>
              <h2>Cooking for a<br /><i>crowd?</i></h2>
              <p>Party trays of jollof, coolers of soup, suya by the kilo, small chops by the hundred, popcorn buckets for the children. Tell us the headcount and the time.</p>
              <p className="prenote">Minimum 20 portions · 48 hours notice · delivery across Nasarawa State</p>
              <button onClick={() => go('menu')}>Start a pre-order →</button>
            </div>
            <span><img src={PIC.jollofDodo} alt="Party trays" onError={fallback('Rice & grains')} /></span>
          </section>

          <section className="visit">
            <div>
              <small className="eyebrow">FIND US</small>
              <h2>Come and visit</h2>
              <p className="addr"><b>BCG Road</b><br />Keffi, Nasarawa State, Nigeria</p>
              <p className="addr"><b>+234 800 000 0000</b><br />hello@winningspotkitchen.ng</p>
              <p className="addrnote">Parking behind the building. Takeaway counter is the first door on your right.</p>
              <Socials />
            </div>
            <div className="hours">
              <small className="eyebrow">OPENING HOURS</small>
              {[
                ['Monday – Thursday', '12:00 – 22:00'],
                ['Friday – Saturday', '12:00 – 23:30'],
                ['Sunday', '13:00 – 22:00'],
                ['Takeaway counter', '12:00 – 22:30'],
                ['Suya yard', '17:00 – 23:00'],
              ].map((x) => <p key={x[0]}>{x[0]}<b>{x[1]}</b></p>)}
            </div>
          </section>

          <section className="news">
            <div>
              <small className="eyebrow">STAY IN TOUCH</small>
              <h2>Know what's in the pot.</h2>
              <p>One message a month. Seasonal soups, palm wine delivery days, and first call on the private room.</p>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); if (!email) return; setNote({ text: 'Thanks — you\u2019re on the list.' }); setEmail(''); }}>
              <input type="email" required placeholder="you@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
              <button className="primary">Subscribe</button>
            </form>
          </section>

          <section className="staffstrip">
            <div>
              <small className="eyebrow">FOR OUR TEAM</small>
              <p>Winning Spot staff can manage orders, stock, tables and reservations from the management dashboard. Sign-in required.</p>
            </div>
            <button onClick={() => go('admin')}>{session ? 'Open dashboard ↗' : 'Staff login ↗'}</button>
          </section>
        </>
      )}

      {view === 'menu' && (
        <section className="menupage">
          <div className="pagehead">
            <small className="eyebrow">OUR KITCHEN</small>
            <h1>Come hungry.</h1>
            <p>Fifty-two items, all Nigerian, all cooked to order. Every soup comes with your choice of pounded yam, eba, fufu or semo — and there is always ice cream and popcorn at the end.</p>
          </div>

          <div className="menutools">
            <div className="filters">
              {categories.map((x) => (
                <button className={filter === x ? 'on' : ''} onClick={() => setFilter(x)} key={x}>
                  {x}{x !== 'All' && <em>{menu.filter((m) => m.category === x).length}</em>}
                </button>
              ))}
            </div>
            <input className="search" placeholder="Search a dish…" value={query} onChange={(e) => setQuery(e.target.value)} />
          </div>

          {filter !== 'All' && CATEGORY_META[filter] && <p className="catnote">✦ {CATEGORY_META[filter].note}</p>}
          {menuLoading && <p className="loading">Checking today's stock…</p>}
          {menuError && <p className="formerror">Live stock unavailable ({menuError}) — showing the standing menu.</p>}
          {!shown.length && !menuLoading && <p className="loading">Nothing matches that. Try another dish name.</p>}

          <div className="menugrid">
            {shown.map((x) => <Card item={x} add={add} addAndGo={addAndGo} detail key={x.id} />)}
          </div>
        </section>
      )}

      {view === 'about' && <About book={() => setBook(true)} />}

      {view === 'cart' && (
        <section className="cart">
          {confirmed ? (
            <ConfirmScreen
              data={confirmed}
              onNewOrder={() => { setConfirmed(null); go('menu'); }}
              onHome={() => { setConfirmed(null); go('home'); }}
            />
          ) : (
            <>
              <div>
                <small className="eyebrow">YOUR ORDER</small>
                <h1>Almost there.</h1>
                {!cart.length ? (
                  <div className="empty">
                    <b>🛍</b>
                    <h2>Your bag is empty</h2>
                    <p>Add your dishes, or grab something already cooked from the takeaway counter.</p>
                    <div className="emptyctas">
                      <button className="primary" onClick={() => go('menu')}>Browse the menu →</button>
                      <button className="ghost" onClick={() => go('home')}>Takeaway counter ↗</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="ordertype">
                      {[
                        ['takeaway', 'Takeaway', 'Collect in ~5 min'],
                        ['pickup', 'Pickup later', 'Choose a time'],
                        ['delivery', 'Delivery', 'Across Nasarawa State'],
                      ].map(([k, label, sub]) => (
                        <button key={k} className={orderType === k ? 'on' : ''} onClick={() => setOrderType(k)}>
                          <span className="check">{orderType === k ? '●' : '○'}</span>
                          <b>{label}</b>
                          <small>{sub}</small>
                        </button>
                      ))}
                    </div>

                    <div className="items">
                      {cart.map((x) => (
                        <article key={x.id}>
                          <i className="thumb"><img src={x.image_url} alt={x.name} onError={fallback(x.category)} /></i>
                          <span>
                            <h3>{x.name}</h3>
                            <small>{money(x.price)} each</small>
                          </span>
                          <div className="qty">
                            <button aria-label="Decrease" onClick={() => setQty(x.id, x.qty - 1)}>−</button>
                            <b>{x.qty}</b>
                            <button aria-label="Increase" onClick={() => setQty(x.id, x.qty + 1)}>+</button>
                          </div>
                          <b className="linetotal">{money(x.price * x.qty)}</b>
                          <button className="removebtn" aria-label={`Remove ${x.name}`} onClick={() => setQty(x.id, 0)}>×</button>
                        </article>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {cart.length > 0 && (
                <aside>
                  <small className="eyebrow">YOUR DETAILS</small>
                  <label>Name<input required value={customer.name} onChange={(e) => setCustomer((c) => ({ ...c, name: e.target.value }))} placeholder="e.g. Ada Okafor" /></label>
                  <label>Email<input required type="email" value={customer.email} onChange={(e) => setCustomer((c) => ({ ...c, email: e.target.value }))} placeholder="you@email.com" /></label>
                  <label>Phone<input required value={customer.phone} onChange={(e) => setCustomer((c) => ({ ...c, phone: e.target.value }))} placeholder="080..." /></label>

                  <div className="tipbox">
                    <small className="eyebrow">LEAVE A TIP</small>
                    <p className="tipintro">If the food was good, say so. Every naira is split across the kitchen and the floor at the end of the week.</p>
                    <div className="tippicks">
                      {[0, 5, 10, 15].map((p) => (
                        <button
                          key={p}
                          className={customTip === '' && tipPct === p ? 'on' : ''}
                          onClick={() => { setTipPct(p); setCustomTip(''); }}
                        >{p === 0 ? 'No tip' : `${p}%`}</button>
                      ))}
                    </div>
                    <input
                      className="tipcustom"
                      type="number"
                      min="0"
                      step="100"
                      placeholder="Or enter your own amount (₦)"
                      value={customTip}
                      onChange={(e) => setCustomTip(e.target.value)}
                    />
                    {tip > 0 && (
                      <>
                        <input className="tipcustom" placeholder="Say thank you to someone by name (optional)" value={tipNote} onChange={(e) => setTipNote(e.target.value)} />
                        <p className="tipthanks">✦ {money(tip)} to the team. Thank you.</p>
                      </>
                    )}
                  </div>

                  <small className="eyebrow">SUMMARY</small>
                  <p>Subtotal <b>{money(subtotal)}</b></p>
                  <p>Service charge (7.5%) <b>{money(service)}</b></p>
                  <p className={tip > 0 ? 'tipline' : ''}>Tip <b>{money(tip)}</b></p>
                  <hr />
                  <h3>Total <b>{money(total)}</b></h3>
                  {orderError && <p className="formerror">{orderError}</p>}
                  <button className="primary full" disabled={placing} onClick={placeOrder}>
                    {placing ? 'Placing order…' : `Place ${orderType} order →`}
                  </button>
                  <small className="finenote">Free delivery within Keffi for orders over ₦25,000.</small>
                </aside>
              )}
            </>
          )}
        </section>
      )}

      {view === 'admin' && (
        session
          ? <Admin menu={menu} session={session} signOut={signOut} />
          : <AdminLogin onSuccess={setSession} goHome={() => go('home')} />
      )}

      <footer className="bottom">
        <div className="footmain">
          <div className="footbrand">
            <Brand onClick={() => go('home')} />
            <p>Traditional Nigerian cooking, done properly, since 2014.</p>
            <Socials />
          </div>
          <div className="footcol">
            <small className="eyebrow">EXPLORE</small>
            <button onClick={() => go('home')}>Home</button>
            <button onClick={() => go('menu')}>Full menu</button>
            <button onClick={() => go('about')}>About us</button>
            <button onClick={() => setBook(true)}>Reservations</button>
            <button onClick={() => go('admin')}>Staff login</button>
          </div>
          <div className="footcol">
            <small className="eyebrow">VISIT</small>
            <p>BCG Road</p>
            <p>Keffi, Nasarawa State</p>
            <p>+234 800 000 0000</p>
            <p>hello@winningspotkitchen.ng</p>
          </div>
          <div className="footcol">
            <small className="eyebrow">HOURS</small>
            <p>Mon – Thu · 12:00 – 22:00</p>
            <p>Fri – Sat · 12:00 – 23:30</p>
            <p>Takeaway · 12:00 – 22:30</p>
            <p>Suya yard · 17:00 – 23:00</p>
          </div>
        </div>
        <div className="footbar">
          <small>© 2026 Winning Spot Kitchen. All rights reserved.</small>
          <small className="madeby">Made by <b>Authntech</b></small>
        </div>
      </footer>

      {book && <Booking close={() => setBook(false)} />}
    </>
  );
}

/* ---------- Takeaway card with quantity stepper ---------- */
function TakeawayCard({ item, onAdd, onBuy }) {
  const [qty, setQty] = useState(1);
  return (
    <article>
      <div className="takepic">
        <img src={item.image_url} alt={item.name} loading="lazy" onError={fallback(item.category)} />
        <span>● Ready</span>
      </div>
      <div className="takebody">
        <h3>{item.name}</h3>
        <small>{item.available_quantity} portions in the warmer</small>
        <div className="takefoot">
          <b>{money(item.price)}</b>
          <div className="takeqty">
            <button aria-label="Decrease" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <b>{qty}</b>
            <button aria-label="Increase" onClick={() => setQty((q) => Math.min(item.available_quantity, q + 1))}>+</button>
          </div>
        </div>
        <div className="takebtns">
          <button
            className="btnadd"
            onClick={() => { for (let i = 0; i < qty; i++) onAdd(item); setQty(1); }}
          >
            Add {qty} to bag
          </button>
          <button
            className="btnbuy"
            onClick={() => { for (let i = 0; i < qty; i++) onBuy(item); }}
          >
            Buy now →
          </button>
        </div>
      </div>
    </article>
  );
}

/* ---------- Order Confirmation screen ---------- */
function ConfirmScreen({ data, onNewOrder, onHome }) {
  const eta = data.orderType === 'takeaway' ? '5 minutes' : data.orderType === 'pickup' ? '15 minutes' : '30 minutes';
  return (
    <div className="confirmwrap">
      <div className="confirmcard">
        <div className="confirmmark">✓</div>
        <small className="eyebrow">ORDER RECEIVED</small>
        <h1>Thank you, {data.customer.name.split(' ')[0]}.</h1>
        <p className="confirmmsg">
          Your order is on its way to the kitchen. You'll get a text when it's ready —
          estimated <b>{eta}</b> for {data.orderType}.
        </p>

        <div className="confirmref">
          <small>ORDER REFERENCE</small>
          <b>#{data.reference}</b>
        </div>

        <div className="confirmitems">
          <h3>What you ordered</h3>
          {data.cart.map((x) => (
            <div key={x.id} className="confirmrow">
              <span>{x.name} <small>× {x.qty}</small></span>
              <b>{money(x.price * x.qty)}</b>
            </div>
          ))}
          <hr />
          <div className="confirmrow"><span>Subtotal</span><b>{money(data.subtotal)}</b></div>
          <div className="confirmrow"><span>Service charge</span><b>{money(data.service)}</b></div>
          {data.tip > 0 && <div className="confirmrow tiprow"><span>Tip to the team</span><b>{money(data.tip)}</b></div>}
          <div className="confirmrow totalrow"><span>Total</span><b>{money(data.total)}</b></div>
        </div>

        <div className="confirmctas">
          <button className="primary" onClick={onHome}>Back to home</button>
          <button className="ghost" onClick={onNewOrder}>Order something else →</button>
        </div>

        <p className="confirmfoot">A copy of this receipt was sent to {data.customer.email}.</p>
      </div>
    </div>
  );
}