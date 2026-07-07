"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "../../lib/supabase";
import {classificarMaturidade} from "../../lib/classificacao";
import Image from "next/image";

export default function ResultadoPage() {

  const searchParams = useSearchParams();

  const diagnosticoId =
    searchParams.get("id");

  const [empresa, setEmpresa] =
    useState("");

  const [financeiro, setFinanceiro] =
    useState(0);

  const [estrategia, setEstrategia] =
    useState(0);

  const [operacional, setOperacional] =
    useState(0);

  const [governanca, setGovernanca] =
    useState(0);

  const [geral, setGeral] =
    useState(0);
  const [swotForcas, setSwotForcas] =
  useState("");

  const [swotFraquezas, setSwotFraquezas] =
  useState("");

  const [swotOportunidades, setSwotOportunidades] =
  useState("");

  const [swotAmeacas, setSwotAmeacas] =
  useState("");

  const [planoAcao, setPlanoAcao] =
  useState<any[]>([]);
  
  const [resumoIA, setResumoIA] =
  useState("");

  useEffect(() => {

  if (diagnosticoId) {

    carregarResultado();

  }

}, [diagnosticoId]);

  async function carregarResultado() {

    const { data: diagnostico } =
  await supabase
    .from("diagnosticos")
    .select(`
      id,
      empresa_id,
      empresas!fk_empresa(
        razao_social
      )
    `)
    
    .eq("id", diagnosticoId)
    .single();

  console.log("Diagnostico:", diagnostico);

if (!diagnostico) {
  console.log("DIAGNOSTICO NÃO ENCONTRADO");
  return;
}

console.log("ID BANCO");
console.log(diagnostico.id);

console.log("ID URL");
console.log(diagnosticoId);


    setEmpresa(
  diagnostico.empresas?.razao_social || ""
);

    const { data: respostas } =
      await supabase
        .from("respostas")
        .select("*")
        .eq(
          "diagnostico_id",
          diagnosticoId
        );
        console.log("ID recebido:", diagnosticoId);
console.log("Qtd respostas:", respostas?.length);
console.log("Primeira resposta:", respostas?.[0]);

    if (!respostas) return;
    console.log("TOTAL RESPOSTAS");
    console.log(respostas.length);
      
    console.log("PRIMEIRO REGISTRO");
    console.log(respostas[0]);
    
    const financeiroResp =
      respostas.filter(
        (r) =>
          r.pergunta_id >= 1 &&
          r.pergunta_id <= 20
      );
      console.log("FINANCEIRO RESP");
console.log(financeiroResp);

console.log("PRIMEIRA RESPOSTA");
console.log(financeiroResp[0]);

console.log("VALOR");
console.log(financeiroResp[0]?.resposta);
    const estrategiaResp =
      respostas.filter(
        (r) =>
          r.pergunta_id >= 21 &&
          r.pergunta_id <= 40
      );

    const operacionalResp =
      respostas.filter(
        (r) =>
          r.pergunta_id >= 41 &&
          r.pergunta_id <= 60
      );

    const governancaResp =
      respostas.filter(
        (r) =>
          r.pergunta_id >= 61 &&
          r.pergunta_id <= 80
      );

    const calc = (arr: any[]) => {

      if (arr.length === 0)
        return 0;

      const total =
        arr.reduce(
          (acc, item) =>
            acc + item.resposta,
          0
        );

      return Math.round(
        (total /
          (arr.length * 5)) *
          100
      );
    };

    const f = calc(financeiroResp);

const e = calc(estrategiaResp);

const o = calc(operacionalResp);

const g = calc(governancaResp);
console.log("F:", f);
console.log("E:", e);
console.log("O:", o);
console.log("G:", g);

const geral =
  Math.round(
    (f + e + o + g) / 4
  );

setFinanceiro(f);
setEstrategia(e);
setOperacional(o);
setGovernanca(g);
setGeral(geral); 

const classificacao =
  geral >= 80
    ? "Excelência"
    : geral >= 60
    ? "Estruturado"
    : geral >= 40
    ? "Parcial"
    : geral >= 20
    ? "Inicial"
    : "Inexistente";

  await supabase
  .from("diagnosticos")
  .update({
    score_financeiro: f,
    score_estrategia: e,
    score_operacional: o,
    score_governanca: g,
    score_geral: geral,
    classificacao
  })
  .eq("id", diagnosticoId);
   const pontosFortes =
  gerarPontosFortes(
    f,
    e,
    o,
    g
  );

console.log("PONTOS FORTES");
console.log(pontosFortes);

const pontosAtencao =
  gerarPontosAtencao(
    f,
    e,
    o,
    g
  );

console.log("PONTOS ATENCAO");
console.log(pontosAtencao);

const recomendacoes =
  gerarRecomendacoes(
    f,
    e,
    o,
    g
  );
  const planoGerado =
  gerarPlanoAcao(
    f,e,o,g
  );
  setResumoIA(
  gerarResumoIA(
    f,
    e,
    o,
    g,
    geral
  )
);
console.log(
  "PLANO GERADO",
  planoGerado
);
setSwotForcas(
  gerarSwotForcas(
    f,e,o,g
  )
);

setSwotFraquezas(
  gerarSwotFraquezas(
    f,e,o,g
  )
);

setSwotOportunidades(
  gerarSwotOportunidades(
    f,e,o,g
  )
);

setSwotAmeacas(
  gerarSwotAmeacas(
    f,e,o,g
  )
);

console.log("RECOMENDACOES");
console.log(recomendacoes);
await supabase
  .from("tb_plano_acao")
  .delete()
  .eq(
    "diagnostico_id",
    diagnosticoId
  );  
  if (planoGerado.length > 0) {
  setPlanoAcao(planoGerado);

  const { data, error } =
    await supabase
      .from("tb_plano_acao")
      .insert(

        planoGerado.map(
          (item) => ({

            diagnostico_id:
              diagnosticoId,

            empresa_id:
              diagnostico.empresa_id,

            ...item

          })
        )

      )
      .select();

  console.log(
    "INSERT PLANO ACAO"
  );

  console.log(data);

  console.log(
    "ERRO PLANO ACAO"
  );

  console.log(error);

}
const { data: existe } =
  await supabase
    .from("tb_resultado_diagnostico")
    .select("id")
    .eq(
      "diagnostico_id",
      diagnosticoId
    )
    .maybeSingle();

if (!existe) {

  await supabase
    .from("tb_resultado_diagnostico")
    .insert({

      diagnostico_id:
        diagnosticoId,

      empresa_id:
        diagnostico.empresa_id,

      score_financeiro: f,
      score_estrategia: e,
      score_operacional: o,
      score_governanca: g,
      score_geral: geral,

      classificacao:
        classificacao,

      resumo_executivo:
  gerarResumoIA(
    f,e,o,g,geral
  ),

      pontos_fortes:
      pontosFortes,

      pontos_atencao:
        pontosAtencao,

      recomendacoes:
        recomendacoes,

swot_forcas:
  gerarSwotForcas(
    f,e,o,g
  ),

swot_fraquezas:
  gerarSwotFraquezas(
    f,e,o,g
  ),

swot_oportunidades:
  gerarSwotOportunidades(
    f,e,o,g
  ),

swot_ameacas:
  gerarSwotAmeacas(
    f,e,o,g
  )
    });

} else {

  const { error } =
  await supabase
    .from("tb_resultado_diagnostico")
    .update({
  
      score_financeiro: f,
      score_estrategia: e,
      score_operacional: o,
      score_governanca: g,
      score_geral: geral,

      classificacao:
        classificacao,

      resumo_executivo:
  gerarResumoIA(
    f,
    e,
    o,
    g,
    geral
  ),

      pontos_fortes:
        gerarPontosFortes(
          f,e,o,g
        ),

      pontos_atencao:
        gerarPontosAtencao(
          f,e,o,g
        ),

      recomendacoes:
        gerarRecomendacoes(
          f,e,o,g
        ),
  
swot_forcas:
  gerarSwotForcas(
    f,e,o,g
  ),

swot_fraquezas:
  gerarSwotFraquezas(
    f,e,o,g
  ),

swot_oportunidades:
  gerarSwotOportunidades(
    f,e,o,g
  ),

swot_ameacas:
  gerarSwotAmeacas(
    f,e,o,g
  )

    })
    .eq(
      "diagnostico_id",
      diagnosticoId
    );

}
  

  function gerarResumoIA(
  f:number,
  e:number,
  o:number,
  g:number,
  geral:number
){

  const melhor =
    [
      {nome:"Financeiro",valor:f},
      {nome:"Estratégia",valor:e},
      {nome:"Operacional",valor:o},
      {nome:"Governança",valor:g}
    ]
    .sort((a,b)=>b.valor-a.valor)[0];

  const pior =
    [
      {nome:"Financeiro",valor:f},
      {nome:"Estratégia",valor:e},
      {nome:"Operacional",valor:o},
      {nome:"Governança",valor:g}
    ]
    .sort((a,b)=>a.valor-b.valor)[0];

  let nivel = "";

  if(geral >= 80)
    nivel = "elevado";

  else if(geral >= 60)
    nivel = "estruturado";

  else if(geral >= 40)
    nivel = "intermediário";

  else if(geral >= 20)
    nivel = "inicial";

  else
    nivel = "crítico";

  return `
A avaliação realizada demonstra que a organização apresenta um índice geral de maturidade empresarial de ${geral}%, posicionando-se atualmente no nível ${nivel}. Este resultado indica que a empresa já possui práticas de gestão implementadas em algumas áreas-chave, porém ainda convive com oportunidades relevantes de estruturação, padronização e fortalecimento de seus processos gerenciais.

Sob a ótica das dimensões avaliadas, destaca-se positivamente a área de ${melhor.nome}, que alcançou desempenho de ${melhor.valor}%. Este resultado evidencia maior grau de organização, controle e maturidade operacional nesta dimensão, refletindo práticas mais consolidadas, melhor capacidade de execução e maior aderência aos princípios de gestão orientados a resultados.

Em contrapartida, a dimensão ${pior.nome} registrou índice de ${pior.valor}%, configurando atualmente o principal ponto de atenção identificado pelo diagnóstico. Este cenário demonstra a necessidade de priorização de iniciativas voltadas ao fortalecimento desta área, uma vez que suas fragilidades podem impactar diretamente a eficiência operacional, a previsibilidade dos resultados e a capacidade de crescimento sustentável da organização.

A leitura consolidada dos indicadores evidencia que o atual estágio de maturidade está diretamente associado a oportunidades de evolução em temas estratégicos como planejamento e desdobramento de metas, fortalecimento dos mecanismos de governança corporativa, padronização de processos, gestão por indicadores de desempenho e desenvolvimento de uma cultura orientada à melhoria contínua.

Considerando os resultados obtidos, bem como as ações estruturantes propostas neste relatório, estima-se que a execução disciplinada do plano de ação e do roadmap estratégico possibilite uma evolução consistente dos níveis de maturidade organizacional ao longo dos próximos ciclos de gestão. Tal movimento tende a ampliar a capacidade de tomada de decisão, aumentar a eficiência dos processos internos, fortalecer os controles gerenciais e elevar a competitividade da empresa em seu mercado de atuação.

De forma geral, o diagnóstico demonstra que a organização possui potencial concreto para avançar a patamares superiores de maturidade empresarial, desde que sejam mantidos o comprometimento da liderança, a execução das iniciativas recomendadas e o acompanhamento sistemático dos indicadores de desempenho definidos para cada dimensão avaliada.

`;
}

  let pontosCriticos = [];

  if(f < 60)
    pontosCriticos.push("Financeiro");

  if(e < 60)
    pontosCriticos.push("Estratégia");

  if(o < 60)
    pontosCriticos.push("Operacional");

  if(g < 60)
    pontosCriticos.push("Governança");

  const maior =
    Math.max(f,e,o,g);

  let destaque = "";

  if(maior === f)
    destaque = "Financeiro";

  if(maior === e)
    destaque = "Estratégia";

  if(maior === o)
    destaque = "Operacional";

  if(maior === g)
    destaque = "Governança";

  return `
A análise realizada identificou maturidade organizacional de ${geral}%.

A dimensão com melhor desempenho foi ${destaque}.

As principais oportunidades de evolução concentram-se em ${pontosCriticos.join(", ")}.

Recomenda-se priorizar ações estruturantes voltadas ao fortalecimento dos controles internos, gestão por indicadores, planejamento estratégico e padronização operacional.

A implementação do plano de ação proposto poderá elevar significativamente o nível de maturidade empresarial nos próximos ciclos de avaliação.
`;
}
function gerarPontosFortes(
  f:number,
  e:number,
  o:number,
  g:number
) {

  const areas = [
    { nome: "Financeiro", valor: f },
    { nome: "Estratégia", valor: e },
    { nome: "Operacional", valor: o },
    { nome: "Governança", valor: g }
  ];

  const maior =
    Math.max(...areas.map(a => a.valor));

  const fortes =
    areas
      .filter(a => a.valor === maior)
      .map(a => a.nome);

  return fortes.join(", ");
}
function gerarPontosAtencao(
  f:number,
  e:number,
  o:number,
  g:number
) {

  const lista = [];

  if (f < 60)
    lista.push("Financeiro");

  if (e < 60)
    lista.push("Estratégia");

  if (o < 60)
    lista.push("Operacional");

  if (g < 60)
    lista.push("Governança");

  return lista.join(", ");
}
function gerarRecomendacoes(
  f:number,
  e:number,
  o:number,
  g:number
) {

  let texto = "";

  if (f < 60)
    texto +=
      "Fortalecer gestão financeira. ";

  if (e < 60)
    texto +=
      "Estruturar planejamento estratégico. ";

  if (o < 60)
    texto +=
      "Padronizar processos operacionais. ";

  if (g < 60)
    texto +=
      "Implementar práticas de governança. ";

  return texto;
}
function gerarSwotForcas(
  f:number,
  e:number,
  o:number,
  g:number
){

  const lista = [];

  if(f >= 60)
    lista.push("Gestão financeira estruturada");

  if(e >= 60)
    lista.push("Planejamento estratégico consistente");

  if(o >= 60)
    lista.push("Operações padronizadas");

  if(g >= 60)
    lista.push("Governança corporativa madura");

  if(lista.length === 0){

    const areas = [
      {nome:"Financeiro",valor:f},
      {nome:"Estratégia",valor:e},
      {nome:"Operacional",valor:o},
      {nome:"Governança",valor:g}
    ];

    const maior =
      areas.sort(
        (a,b)=>b.valor-a.valor
      )[0];

    return `Melhor desempenho atual em ${maior.nome}`;
  }

  return lista.join("; ");
}

function gerarSwotFraquezas(
  f:number,
  e:number,
  o:number,
  g:number
){

  const lista = [];

  if(f < 60)
    lista.push("Controles financeiros insuficientes");

  if(e < 60)
    lista.push("Ausência de planejamento estratégico");

  if(o < 60)
    lista.push("Baixa eficiência operacional");

  if(g < 60)
    lista.push("Governança pouco estruturada");

  return lista.join("; ");
}

function gerarSwotOportunidades(
  f:number,
  e:number,
  o:number,
  g:number
){

  return `
Capacitação da equipe;
Automação de processos;
Implantação de indicadores;
Melhoria da gestão financeira;
Desenvolvimento de liderança
`;
}

function gerarSwotAmeacas(
  f:number,
  e:number,
  o:number,
  g:number
){

  return `
Perda de competitividade;
Redução de margens;
Aumento de custos;
Riscos operacionais;
Dependência de processos informais
`;
}
function gerarPlanoAcao(
  f:number,
  e:number,
  o:number,
  g:number
){

  const plano = [];

  if(f < 60){

    plano.push({

      dimensao: "Financeiro",

      what_action:
        "Implantar Fluxo de Caixa Projetado",

      why_action:
        "Melhorar previsibilidade financeira",

      where_apply:
        "Departamento Financeiro",

      who_responsavel:
        "Diretoria Financeira",

      when_deadline:
        "2026-09-30",

      how_execute:
        "Criar rotina semanal de projeção financeira",

      how_much:
        0,

      prioridade:
        "Alta",

      impacto:
        "Alto",

      esforco:
        "Médio",

      indicador_sucesso:
        "Fluxo atualizado semanalmente",

      observacoes:
        "Prioridade imediata"

    });

  }

  if(e < 60){

    plano.push({

      dimensao: "Estratégia",

      what_action:
        "Criar Planejamento Estratégico",

      why_action:
        "Definir metas e direcionamento",

      where_apply:
        "Diretoria",

      who_responsavel:
        "Diretor Executivo",

      when_deadline:
        "2026-08-31",

      how_execute:
        "Workshop estratégico e definição de indicadores",

      how_much:
        0,

      prioridade:
        "Alta",

      impacto:
        "Alto",

      esforco:
        "Alto",

      indicador_sucesso:
        "Plano estratégico implantado",

      observacoes:
        "Necessário para crescimento"

    });

  }
if(o < 60){

  plano.push({

    dimensao: "Operacional",

    what_action:
      "Padronizar Processos Operacionais",

    why_action:
      "Reduzir falhas e aumentar produtividade",

    where_apply:
      "Operações",

    who_responsavel:
      "Gestor Operacional",

    when_deadline:
      "2026-09-30",

    how_execute:
      "Mapear processos, criar POPs e indicadores",

    how_much:
      0,

    prioridade:
      "Alta",

    impacto:
      "Alto",

    esforco:
      "Médio",

    indicador_sucesso:
      "Redução de retrabalho e aumento de produtividade",

    observacoes:
      "Formalizar processos críticos"

  });

}

if(g < 60){

  plano.push({

    dimensao: "Governança",

    what_action:
      "Implantar Modelo de Governança Corporativa",

    why_action:
      "Melhorar controles e tomada de decisão",

    where_apply:
      "Diretoria",

    who_responsavel:
      "Diretor Executivo",

    when_deadline:
      "2026-10-31",

    how_execute:
      "Definir políticas, indicadores e reuniões periódicas",

    how_much:
      0,

    prioridade:
      "Alta",

    impacto:
      "Alto",

    esforco:
      "Alto",

    indicador_sucesso:
      "Governança formalizada e monitorada",

    observacoes:
      "Criar rotina de acompanhamento gerencial"

  });

}
  return plano;

}
  return (

    <div className="min-h-screen bg-[#02142b] text-white p-10">

      <div className="text-center mb-8">

        <Image
          src="/logo-queiroz-v2.png"
          alt="Logo"
          width={220}
          height={220}
          className="mx-auto"
        />

        <h1 className="text-5xl font-bold text-[#D4AA3C] mt-6">
          Resultado do Diagnóstico
        </h1>
        <p className="mt-3 text-xl">
          {empresa}
        </p>

      </div>

      <div className="grid md:grid-cols-4 gap-6">

        <Card
          titulo="Financeiro"
          valor={financeiro}
        />

        <Card
          titulo="Estratégia"
          valor={estrategia}
        />

        <Card
          titulo="Operacional"
          valor={operacional}
        />

        <Card
          titulo="Governança"
          valor={governanca}
        />

      </div>
<div className="mt-12">

  <h2 className="
    text-3xl
    font-bold
    text-[#D4AA3C]
    mb-6
    text-center
  ">
    Heatmap Executivo
  </h2>

  <div className="
    overflow-hidden
    rounded-xl
    border
    border-slate-700
  ">

    <table className="w-full">

      <thead>

        <tr className="bg-[#041d3b]">

          <th className="p-4 text-left">
            Dimensão
          </th>

          <th className="p-4 text-center">
            Score
          </th>

          <th className="p-4 text-center">
            Status
          </th>

        </tr>

      </thead>

      <tbody>

        <LinhaHeatmap
          titulo="Financeiro"
          valor={financeiro}
        />

        <LinhaHeatmap
          titulo="Estratégia"
          valor={estrategia}
        />

        <LinhaHeatmap
          titulo="Operacional"
          valor={operacional}
        />

        <LinhaHeatmap
          titulo="Governança"
          valor={governanca}
        />

      </tbody>

    </table>

  </div>

</div>

      <div className="mt-10">

        <div
          className="
          border
          border-[#D4AA3C]
          rounded-xl
          p-8
          text-center
        "
        >

          <h2 className="text-2xl mb-3">

            Maturidade Geral

          </h2>

          <div className="text-6xl font-bold text-[#D4AA3C]">

            {geral}%

          </div>

          <div className="mt-3 text-xl">

            {classificarMaturidade(geral)}

          </div>
          <div
  className="
    mt-12
    bg-[#041d3b]
    border
    border-[#D4AA3C]
    rounded-xl
    p-8
  "
>

  <h2
  className="
    text-4xl
    font-bold
    text-[#D4AA3C]
    mb-4
    text-center
  "
>
    Parecer Executivo Inteligente
  </h2>

  <div
  className="
    text-[18px]
    leading-relaxed
    text-justify
    whitespace-pre-wrap
    w-full
    mx-auto
    px-4
  "
>
    {resumoIA}
  </div>

</div>
        <div className="mt-12">

  <h2
    className="
      text-3xl
      font-bold
      text-[#D4AA3C]
      mb-8
      text-center
    "
  >
    Matriz SWOT Estratégica
  </h2>

  <div
    className="
      grid
      md:grid-cols-2
      gap-6
    "
  >

    <SwotCard
      titulo="FORÇAS"
      valor={swotForcas}
      cor="border-green-500"
    />

    <SwotCard
      titulo="FRAQUEZAS"
      valor={swotFraquezas}
      cor="border-red-500"
    />

    <SwotCard
      titulo="OPORTUNIDADES"
      valor={swotOportunidades}
      cor="border-blue-500"
    />

    <SwotCard
      titulo="AMEAÇAS"
      valor={swotAmeacas}
      cor="border-yellow-500"
    />
  </div>
</div>
<div className="
bg-[#041d3b]
border
border-[#D4AA3C]
rounded-xl
p-6
mt-10
">

<h2 className="
text-2xl
font-bold
text-[#D4AA3C]
mb-4
">
Ranking das Dimensões
</h2>

<ol className="space-y-2">

<li>🥇 Financeiro - {financeiro}%</li>

<li>🥈 Governança - {governanca}%</li>

<li>🥉 Estratégia - {estrategia}%</li>

<li>4º Operacional - {operacional}%</li>

</ol>

</div>
  <div className="mt-12">

  <h2
    className="
      text-3xl
      font-bold
      text-[#D4AA3C]
      mb-8
      text-center
    "
  >
    Plano de Ação Estratégico
  </h2>

 <div
  className="
    grid
    grid-cols-1
    xl:grid-cols-2
    gap-8
    w-full
  "
>
    {planoAcao.map((item, index) => (

      <div
  key={index}
  className="
  bg-[#041d3b]
  border
  border-[#D4AA3C]
  rounded-2xl
  p-8
  shadow-2xl
  hover:border-yellow-400
  transition-all
"
>

        <h3 className="text-xl font-bold text-[#D4AA3C] mb-4">
          {item.dimensao}
        </h3>

        <div className="mb-2">
  <span className="text-[#D4AA3C] font-semibold">
    O Que Fazer:
  </span>
  <span className="ml-2">
    {item.what_action}
  </span>
</div>

<div className="mb-2">
  <span className="text-[#D4AA3C] font-semibold">
    Por Quê fazer:
  </span>
  <span className="ml-2">
    {item.why_action}
  </span>
</div>

<div className="mb-2">
  <span className="text-[#D4AA3C] font-semibold">
    Onde Aplicar:
  </span>
  <span className="ml-2">
    {item.where_apply}
  </span>
</div>

<div className="mb-2">
  <span className="text-[#D4AA3C] font-semibold">
    Responsável pela Ação:
  </span>
  <span className="ml-2">
    {item.who_responsavel}
  </span>
</div>

<div className="mb-2">
  <span className="text-[#D4AA3C] font-semibold">
    Prazo para Conclusão:
  </span>

  <span className="ml-2">
    {
 new Date(
   item.when_deadline
 ).toLocaleDateString(
   "pt-BR"
 )
}
  </span>
</div>


<div className="mb-2">
  <span className="text-[#D4AA3C] font-semibold">
    Como Executar:
  </span>
  <span className="ml-2">
    {item.how_execute}
  </span>
</div>

<div className="mb-2">
  <span className="text-[#D4AA3C] font-semibold">
    Prioridade da Ação:
  </span>
  <span className="ml-2">
    {item.prioridade}
  </span>
</div>

<div className="mb-2">
  <span className="text-[#D4AA3C] font-semibold">
    Impacto da Ação:
  </span>
  <span className="ml-2">
    {item.impacto}
  </span>
</div>

<div className="mb-2">
  <span className="text-[#D4AA3C] font-semibold">
    Esforço Necessário:
  </span>
  <span className="ml-2">
    {item.esforco}
  </span>
</div>

<div className="mb-2">
  <span className="text-[#D4AA3C] font-semibold">
    Indicador de Sucesso:
  </span>
  <span className="ml-2">
    {item.indicador_sucesso}
  </span>
</div>
</div>

    ))}
</div>

<div className="mt-16">

  <h2 className="
    text-3xl
    font-bold
    text-[#D4AA3C]
    text-center
    mb-8
  ">
    Roadmap Estratégico
  </h2>

  <div
  className="
    flex
    flex-wrap
    justify-center
    gap-8
  "
>
    <RoadmapCard
      titulo="30 Dias"
      acoes={[
        "Planejamento Estratégico",
        "Fluxo de Caixa",
        "Indicadores"
      ]}
    />

    <RoadmapCard
      titulo="60 Dias"
      acoes={[
        "Padronização",
        "Processos",
        "Treinamentos"
      ]}
    />

    <RoadmapCard
      titulo="90 Dias"
      acoes={[
        "Governança",
        "KPIs",
        "Monitoramento"
      ]}
    />

  </div>

</div>
  </div>

</div>
  </div>

</div>

  );
}

function Card({
  titulo,
  valor,
}: any) {

  return (

    <div
      className="
        bg-[#041d3b]
        border
        border-blue-500
        rounded-xl
        p-6
        text-center
      "
    >

      <h3 className="text-lg mb-3">
        {titulo}
      </h3>

      <div className="text-5xl font-bold text-[#D4AA3C]">
        {valor}%
      </div>

    </div>

  );
}

function LinhaHeatmap({
  titulo,
  valor,
}: any) {

  let cor = "bg-red-600";

const status =
  classificarMaturidade(valor);

if (valor > 20)
  cor = "bg-orange-500";

if (valor > 40)
  cor = "bg-yellow-400";

if (valor > 60)
  cor = "bg-lime-500";

if (valor > 80)
  cor = "bg-green-700";

  return (

    <tr className="border-t border-slate-700">

      <td className="p-4">
        {titulo}
      </td>

      <td className="p-4 text-center">
        {valor}%
      </td>

      <td className="p-4">

        <div
          className={`
            ${cor}
            rounded-lg
            text-center
            py-2
            font-semibold
          `}
        >
          {status}
        </div>

      </td>

    </tr>
  );
}

  function SwotCard({
  titulo,
  valor,
  cor
}: any) {

  return (

    <div
      className={`
        bg-[#041d3b]
        border
        ${cor}
        rounded-xl
        p-6
      min-h-[350px]  
      `}
    >

      <h3
        className="
          text-xl
          font-bold
          text-[#D4AA3C]
          mb-4
        "
      >
        {titulo}
      </h3>

      <div
        className="
          text-lg
          leading-7
          whitespace-pre-line
        "
      >

        {valor
          ?.split(";")
          .map(
            (
              item:string,
              i:number
            ) => (
              <div key={i}>
                • {item.trim()}
              </div>
            )
          )}

      </div>

    </div>
  );
}
 function RoadmapCard({
 titulo,
 acoes
}:any){

 return(

  <div className="
bg-[#041d3b]
border
border-[#D4AA3C]
rounded-2xl
p-8
w-[380px]
min-h-[320px]
shadow-xl
">

   <h3 className="
    text-2xl
    text-[#D4AA3C]
    font-bold
    mb-4
   ">
    {titulo}
   </h3>

   {acoes.map(
    (acao:string,i:number)=>(
      <div
       key={i}
       className="mb-2"
      >
       ✓ {acao}
      </div>
    )
   )}

  </div>

 )

} 