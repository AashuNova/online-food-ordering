import { useReducer, useState, useMemo } from 'react';
import { MENU, CATEGORIES } from './data.js';
import MenuCard from './components/MenuCard.jsx';
import Cart from './components/Cart.jsx';
import Checkout from './components/Checkout.jsx';

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD': {
      const found = state.find(i => i.id === action.item.id);
      return found
        ? state.map(i => (i.id === found.id ? { ...i, qty: i.qty + 1 } : i))
        : [...state, { ...action.item, qty: 1 }];
    }
    case 'DECREASE':
      return state.flatMap(i => (i.id !== action.id ? [i] : i.qty > 1 ? [{ ...i, qty: i.qty - 1 }] : []));
    case 'REMOVE':
      return state.filter(i => i.id !== action.id);
    case 'CLEAR':
      return [];
    default:
      return state;
  }
}

export default function App() {
  const [cart, dispatch] = useReducer(cartReducer, []);
  const [view, setView] = useState('menu'); // menu | cart | checkout | done
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');
  const [vegOnly, setVegOnly] = useState(false);
  const [order, setOrder] = useState(null);

  const count = cart.reduce((s, i) => s + i.qty, 0);
  const total = cart.reduce((s, i) => s + i.qty * i.price, 0);

  const visible = useMemo(
    () => MENU.filter(m =>
      (category === 'All' || m.category === category) &&
      (!vegOnly || m.veg) &&
      m.name.toLowerCase().includes(query.toLowerCase())),
    [category, vegOnly, query]
  );

  const placeOrder = details => {
    setOrder({ ...details, total, id: Math.floor(1000 + Math.random() * 9000) });
    dispatch({ type: 'CLEAR' });
    setView('done');
  };

  return (
    <>
      <header className="topbar">
        <h1 onClick={() => setView('menu')}>Spice Route</h1>
        <button className="btn cart-btn" onClick={() => setView('cart')}>Cart ({count})</button>
      </header>

      <main>
        {view === 'menu' && (
          <>
            <div className="filters">
              <input type="search" placeholder="Search dishes" value={query} onChange={e => setQuery(e.target.value)} aria-label="Search dishes" />
              <div className="chips" role="group" aria-label="Categories">
                {CATEGORIES.map(c => (
                  <button key={c} className={c === category ? 'chip active' : 'chip'} onClick={() => setCategory(c)}>{c}</button>
                ))}
              </div>
              <label className="check"><input type="checkbox" checked={vegOnly} onChange={e => setVegOnly(e.target.checked)} /> Vegetarian only</label>
            </div>
            {visible.length === 0 ? (
              <p className="empty">No dishes match. Clear the search or change the category.</p>
            ) : (
              <div className="grid">
                {visible.map(item => (
                  <MenuCard key={item.id} item={item} qty={cart.find(c => c.id === item.id)?.qty} onAdd={it => dispatch({ type: 'ADD', item: it })} />
                ))}
              </div>
            )}
          </>
        )}
        {view === 'cart' && <Cart items={cart} total={total} dispatch={dispatch} onBack={() => setView('menu')} onCheckout={() => setView('checkout')} />}
        {view === 'checkout' && <Checkout total={total} onPlace={placeOrder} onBack={() => setView('cart')} />}
        {view === 'done' && order && (
          <section className="panel">
            <h2>Order #{order.id} placed</h2>
            <p>Thanks, {order.name}. Your ₹{order.total} order is on its way to {order.address}.</p>
            <button className="btn" onClick={() => setView('menu')}>Order again</button>
          </section>
        )}
      </main>
    </>
  );
}
