"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import Image from "next/image";

export default function DiagnosticoPage() {

  const searchParams = useSearchParams();

  const diagnosticoId =
    searchParams.get("id");

  const [etapa, setEtapa] = useState(1);

  const [perguntas, setPerguntas] =
    useState<any[]>([]);

  const [empresaNome, setEmpresaNome] =
  useState("");

    const [respostas, setRespostas] =
    useState<Record<number, number>>({});
  const cores: Record<number, string> = {
  1: "border-red-500 text-red-500",
  2: "border-orange-500 text-orange-500",
  3: "border-yellow-400 text-yellow-400",
  4: "border-lime-500 text-lime-500",
  5: "border-green-500 text-green-500",
};
  const ETAPAS = [
    { etapa: 1, modulo: "FINANCEIRO", inicio: 1, fim: 10 },
    { etapa: 2, modulo: "FINANCEIRO", inicio: 11, fim: 20 },

    { etapa: 3, modulo: "ESTRATEGIA", inicio: 21, fim: 30 },
    { etapa: 4, modulo: "ESTRATEGIA", inicio: 31, fim: 40 },

    { etapa: 5, modulo: "OPERACIONAL", inicio: 41, fim: 50 },
    { etapa: 6, modulo: "OPERACIONAL", inicio: 51, fim: 60 },

    { etapa: 7, modulo: "GOVERNANCA", inicio: 61, fim: 70 },
    { etapa: 8, modulo: "GOVERNANCA", inicio: 71, fim: 80 },
  ];

  useEffect(() => {

  carregarPerguntas();

  if (diagnosticoId) {

    carregarEmpresa();

    carregarRespostas();

  }

}, [etapa, diagnosticoId]);

  async function carregarPerguntas() {

    const etapaAtual =
      ETAPAS.find(
        (e) => e.etapa === etapa
      );

    if (!etapaAtual) return;

    const { data, error } =
      await supabase
        .from("perguntas")
        .select("*")
        .gte("id", etapaAtual.inicio)
        .lte("id", etapaAtual.fim)
        .order("id");

    if (error) {
      console.log(error);
      return;
    }

    setPerguntas(data || []);
  }

  function selecionarResposta(
    perguntaId: number,
    nota: number
  ) {
    setRespostas((prev) => ({
      ...prev,
      [perguntaId]: nota,
    }));
  }
async function carregarEmpresa() {

  const { data, error } = await supabase
    .from("diagnosticos")
    .select(`
      empresa_id,
      empresas!fk_empresa(
        razao_social
      )
    `)
    .eq("id", diagnosticoId)
    .single();

  if (error) {

    console.log("ERRO EMPRESA");
    console.log(error);

    return;
  }

  console.log(data);

    setEmpresaNome(
  (data as any)?.empresas?.razao_social ?? ""
);
}
async function carregarRespostas() {

  const etapaAtual =
    ETAPAS.find(
      (e) => e.etapa === etapa
    );

  const { data, error } =
    await supabase
      .from("respostas")
      .select("*")
      .eq(
        "diagnostico_id",
        diagnosticoId
      )
      .gte(
        "pergunta_id",
        etapaAtual?.inicio || 1
      )
      .lte(
        "pergunta_id",
        etapaAtual?.fim || 10
      );

  if (error) {
    console.log(error);
    return;
  }

  const respostasObjeto:
    Record<number, number> = {};

  data?.forEach((item) => {
    respostasObjeto[item.pergunta_id] =
      item.resposta;
  });

  console.log(
    "RESPOSTAS CARREGADAS",
    respostasObjeto
  );

  setRespostas(respostasObjeto);
}
async function salvarEtapa() {

  console.log("INICIANDO SALVAR");

  const idsPerguntas =
    Object.keys(respostas).map(Number);

  const { error: deleteError } =
    await supabase
      .from("respostas")
      .delete()
      .eq(
        "diagnostico_id",
        diagnosticoId
      )
      .in(
        "pergunta_id",
        idsPerguntas
      );

  if (deleteError) {

    console.log(
      "ERRO DELETE",
      deleteError
    );

    return false;
  }

  console.log("DELETE OK");

  const registros =
    Object.entries(respostas)
      .map(
        ([perguntaId, nota]) => ({
          diagnostico_id:
            diagnosticoId,
          pergunta_id:
            Number(perguntaId),
          resposta:
            Number(nota),
        })
      );

  const { error } =
    await supabase
      .from("respostas")
      .insert(registros);

  if (error) {

    console.log(
      "ERRO INSERT",
      error
    );

    return false;
  }

  console.log("INSERT OK");

  return true;
}

  async function proximaEtapa() {

  const sucesso =
    await salvarEtapa();

  if (!sucesso) return;

  if (etapa < 8) {

    setEtapa(prev => prev + 1);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });

  } else {

    window.location.href =
      `/resultado?id=${diagnosticoId}`;

  }
}

  const etapaCompleta =
    perguntas.length > 0 &&
    perguntas.every(
      (p) => respostas[p.id]
    );

  const percentual =
    (etapa / 8) * 100;

  const etapaAtual =
    ETAPAS.find(
      (e) => e.etapa === etapa
    );

  return (

    <div className="min-h-screen bg-[#02142b] text-white p-8">
    <div className="flex justify-center mb-6">

  <Image
    src="/logo-queiroz-v2.png"
    alt="Queiroz Estratégia"
    width={220}
    height={220}
    priority
  />

</div>
      <div className="text-center mb-8">

  <h1 className="
    text-4xl
    font-bold
    text-[#D4AA3C]
    mb-4
  ">
    Diagnóstico de Maturidade Empresarial
  </h1>

  <p className="
    text-sm
    uppercase
    tracking-widest
    text-slate-400
  ">
    Empresa Avaliada
  </p>

  <p className="
    text-2xl
    font-semibold
    text-[#D4AA3C]
    mb-4
  ">
    {empresaNome}
  </p>

</div>

      <div className="mb-8">

        <div className="flex justify-between mb-2">

          <div>

  <div className="
    text-lg
    font-semibold
    text-white
  ">
    Etapa {etapa}/8
  </div>

  <div className="
    text-[#D4AA3C]
    font-semibold
  ">
    Módulo {etapaAtual?.modulo}
  </div>

  <div className="
    text-sm
    text-slate-300
  ">
    Perguntas {etapaAtual?.inicio} a {etapaAtual?.fim}
  </div>

</div>

<span className="font-bold">
  {percentual.toFixed(0)}%
</span> 

        </div>

        <div className="w-full h-4 bg-slate-700 rounded-full">

  <div
    className="
      h-4
      rounded-full
      bg-gradient-to-r
      from-green-500
      via-emerald-400
      to-green-600
      animate-pulse
    "
            style={{
              width: `${percentual}%`
            }}
          />

        </div>

      </div>

      <div
        className="
          border
          border-blue-500
          rounded-lg
          p-3
          mb-8
        "
      >

        <h2 className="font-bold mb-3">

          Orientações de preenchimento

        </h2>

        <p className="mb-2">

  Leia cada afirmação e selecione a opção que melhor representa a realidade atual da empresa.

</p>

<p className="text-slate-300">

  Não avalie o que pretende implementar futuramente.

</p>

<p className="text-slate-300">

  Considere apenas o que já está efetivamente estruturado e funcionando na organização.

</p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mt-6">

  <div className="bg-red-600 rounded-lg p-3 text-center shadow-lg">
    <div className="text-3xl font-bold">1</div>
    <div className="font-semibold">Nunca</div>
    <div className="text-sm">Inexistente</div>
  </div>

  <div className="bg-orange-500 rounded-lg p-3 text-center shadow-lg">
    <div className="text-3xl font-bold">2</div>
    <div className="font-semibold">Raramente</div>
    <div className="text-sm">Inicial</div>
  </div>

  <div className="bg-yellow-400 text-black rounded-lg p-3 text-center shadow-lg">
    <div className="text-3xl font-bold">3</div>
    <div className="font-semibold">Ás vezes</div>
    <div className="text-sm">Parcial</div>
  </div>

  <div className="bg-lime-500 text-black rounded-lg p-3 text-center shadow-lg">
    <div className="text-3xl font-bold">4</div>
    <div className="font-semibold">Frequentemente</div>
    <div className="text-sm">Estruturado</div>
  </div>

  <div className="bg-green-700 rounded-lg p-3 text-center shadow-lg">
    <div className="text-3xl font-bold">5</div>
    <div className="font-semibold">Sempre</div>
    <div className="text-sm">Excelência</div>
  </div>

</div>
</div>
      <div className="grid md:grid-cols-2 gap-6">

        {perguntas.map((pergunta) => (

          <div
            key={pergunta.id}
            className="
              border
              border-blue-500
              rounded-lg
              p-4 min-h-[120px]
            "
          >

            <p className="text-blue-300 text-sm mb-2">
  Pergunta {pergunta.id}
</p>

<p className="mb-4 text-lg font-medium">
  {pergunta.pergunta}
</p>

            <div className="flex gap-3">

              {[1, 2, 3, 4, 5].map(
                (nota) => (

                  <button
                    key={nota}
                    onClick={() =>
                      selecionarResposta(
                        pergunta.id,
                        nota
                      )
                    }
                    className={`
w-12
h-12
rounded-full
border-2
font-bold
transition-all
duration-300

${ respostas[pergunta.id] === nota
  ? nota === 1
    ? "bg-red-500 text-white border-red-500"
    : nota === 2
    ? "bg-orange-500 text-white border-orange-500"
    : nota === 3
    ? "bg-yellow-400 text-black border-yellow-400"
    : nota === 4
    ? "bg-lime-500 text-black border-lime-500"
    : "bg-green-600 text-white border-green-600"
  : cores[nota]}
`}
                  >
                    {nota}
                  </button>

                )
              )}

            </div>

          </div>

        ))}

      </div>

<div className="text-center text-blue-300 mt-4">
  Respondidas:
  {" "}
  {perguntas.filter(
    (p) => respostas[p.id]
  ).length}
  / {perguntas.length}
</div>

<div className="flex justify-center gap-4 mt-8">

  {etapa > 1 && (

    <button
  onClick={async () => {

    await salvarEtapa();

    setEtapa(prev => prev - 1);

  }}
  className="
    px-5
    py-2
    rounded-lg
    border
    border-slate-500
    hover:bg-slate-700
  "
>
  ← Etapa Anterior
</button>

  )}

  <button
    disabled={!etapaCompleta}
    onClick={proximaEtapa}
    className="
      px-6
      py-3
      rounded-lg
      bg-green-600
      hover:bg-green-700
      font-semibold
    "
  >
    {etapa < 8
      ? "Próxima Etapa →"
      : "Finalizar Diagnóstico"}
  </button>

</div>

    </div>

  );
}