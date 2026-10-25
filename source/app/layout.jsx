import "@fontsource-variable/manrope";
import "@fontsource/lora/400-italic.css";
import "@fontsource/lora/500-italic.css";
import "./base.css";
import "./chrome.css";
import "./home.css";
import "./pages.css";
import Motion from "@/components/Motion";
import Transition from "@/components/Transition";

export const metadata = {
  title: "Vladnes — сайты и автоматизация для бизнеса",
  description:
    "Собираем сайты, онлайн-запись и Telegram-ботов для бизнеса. Сначала бесплатный прототип, оплата только если понравится.",
  openGraph: {
    title: "Vladnes — сайты и автоматизация для бизнеса",
    description: "Сначала бесплатный прототип, оплата только если понравится.",
    type: "website",
    locale: "ru_RU",
  },
};

export const viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
  ],
};

// Тема и флаг анимаций ставятся до первой отрисовки, чтобы страница не мигала.
const boot = `(function(){try{var d=document.documentElement;var t=localStorage.getItem('theme');d.dataset.theme=t==='light'?'light':'dark';if(sessionStorage.getItem('arriving')){sessionStorage.removeItem('arriving');d.classList.add('is-arriving')}if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('js-motion');setTimeout(function(){d.classList.add('motion-ready')},3500)}}catch(e){document.documentElement.dataset.theme='dark'}})()`;

export default function RootLayout({ children }) {
  return (
    <html lang="ru" data-theme="dark" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: boot }} />
      </head>
      <body>
        <a className="skip" href="#main">
          К содержанию
        </a>
        {children}
        <Motion />
        <Transition />
      </body>
    </html>
  );
}
