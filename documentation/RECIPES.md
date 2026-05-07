# Recipes & Snippets

Common patterns and copy-pasteable snippets for extending the SCPlayer's functionality.

---

## 1. External "Mute" Button

If you want to add a mute toggle outside of the player bar.

### In React

```tsx
const toggleMute = () => {
  const iframe = document.querySelector('.sc-player__iframe');
  const widget = window.SC.Widget(iframe);
  widget.getVolume((vol) => {
    widget.setVolume(vol > 0 ? 0 : 1);
  });
};
```

---

## 2. Triggering Animations on Track Change

Use the Widget API's `SOUND_CHANGE` event to trigger your own UI effects (like a background color shift).

```tsx
// Inside your component or a separate script
useEffect(() => {
  const widget = window.SC.Widget(iframeRef.current);
  widget.bind(window.SC.Widget.Events.SOUND_CHANGE, () => {
    document.body.classList.add('track-changing');
    setTimeout(() => document.body.classList.remove('track-changing'), 1000);
  });
}, []);
```

---

## 3. Dynamic Positioning

Switch the player from `bottom` to `top` based on device orientation or user preference.

```tsx
const [pos, setPos] = useState('bottom');

// In your render
<SCPlayer position={pos} />

// Toggle logic
<button onClick={() => setPos(prev => prev === 'bottom' ? 'top' : 'bottom')}>
  Move Player
</button>
```

---

## 4. Custom "Buy" Link Integration

Since we have local metadata, you can easily add a "Buy" or "Support" button to your UI that pulls from your own database/JSON.

```tsx
// In your custom track list item
<a href={track.buy_url} className="buy-btn">Support Artist</a>
```
