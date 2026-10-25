import { logos } from "@/lib/logos";
import { tools } from "@/lib/site";

// Сетка 4×2 с общими линиями и крестами на пересечениях. Структура взята из logo-cloud-2 (21st.dev),
// переписана без Tailwind: у сайта обычный CSS.
export default function LogoCloud() {
  return (
    <ul className="logos">
      {tools.map((tool, i) => (
        <li className="logos__cell" key={tool.name} style={{ "--i": i }}>
          <span className="dots" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <svg className="logos__icon" viewBox="0 0 24 24" aria-hidden="true">
            <path d={logos[tool.logo]} />
          </svg>
          <span>{tool.name}</span>
        </li>
      ))}
    </ul>
  );
}
