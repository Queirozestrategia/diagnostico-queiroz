import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#08162C] flex items-center justify-center px-6">

      <div className="max-w-5xl w-full">

        <div className="bg-[#0C1E3C] border border-blue-900 rounded-3xl p-12 shadow-2xl">

          <div className="flex flex-col items-center text-center">

            <Image
              src="/logo-queiroz-v2.png"
              alt="Queiroz Estratégia"
              width={280}
              height={280}
              priority
            />

            <span className="mt-2 text-slate-400 tracking-[0.3em] text-sm uppercase">
              DIAGNÓSTICO DE MATURIDADE EMPRESARIAL
            </span>

            <h1 className="mt-8 text-4xl md:text-5xl font-bold text-white leading-tight">
              Antes de crescer,
              <br />
              entenda o potencial real do seu negócio.
            </h1>

            <p className="mt-6 max-w-3xl text-xl text-slate-300">
              Avalie a maturidade da sua empresa em poucos minutos e receba um diagnóstico estratégico com recomendações personalizadas para crescimento sustentável.
            </p>

            <div className="grid md:grid-cols-2 gap-4 mt-10 text-left">

              <div className="text-slate-300">
                ✓ Score de Maturidade Empresarial
              </div>

              <div className="text-slate-300">
                ✓ Diagnóstico Financeiro e Operacional
              </div>

              <div className="text-slate-300">
                ✓ Avaliação Estratégica e Governança
              </div>

              <div className="text-slate-300">
                ✓ Plano de Ação Executivo Personalizado
              </div>

            </div>

<Link
  href="/empresa"
  className="
  mt-12
  px-10
  py-4
  rounded-xl
  bg-blue-600
  hover:bg-blue-700
  transition-all
  text-white
  font-semibold
  text-lg
  shadow-lg
  "
>
  Iniciar Diagnóstico
</Link> 
          </div>

        </div>

      </div>

    </main>
  );
}