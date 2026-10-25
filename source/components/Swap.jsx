// Текст кнопки, который при наведении «прокручивается» по буквам: каждая буква уезжает вверх,
// на её место снизу приходит такая же, с небольшой задержкой от буквы к букве.
// Видимые буквы скрыты от скринридеров, читается цельная копия в .sr. Анимация описана в .swap (base.css).
export default function Swap({ children }) {
  const text = String(children);
  return (
    <span className="swap">
      <span className="sr">{text}</span>
      <span className="swap__row" aria-hidden="true">
        {Array.from(text).map((char, i) => (
          <span className="swap__c" key={i} data-c={char} style={{ "--i": i }}>
            {char}
          </span>
        ))}
      </span>
    </span>
  );
}
