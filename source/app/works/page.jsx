import Footer from "@/components/Footer";
import Header from "@/components/Header";
import WorksGrid from "@/components/WorksGrid";
import { works } from "@/lib/site";

export const metadata = {
  title: "Работы — Vladnes",
  description: "Сайты, которые мы собрали: логистическая компания, инструктор по дайвингу, ресторан, агентство недвижимости.",
};

export default function WorksPage() {
  return (
    <>
      <Header />
      <main id="main" className="page">
        <div className="wrap">
          <h1 className="page__title" data-split data-hero>
            Наши <em>работы</em>
          </h1>
          <WorksGrid works={works} />
        </div>
      </main>
      <Footer />
    </>
  );
}
