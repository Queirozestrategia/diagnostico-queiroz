"use client";

import Image from "next/image";
import { Suspense, useEffect, useState } from "react";

import { supabase } from "../../lib/supabase";
import { classificarMaturidade } from "../../lib/classificacao";

function ResultadoContent() {

  /* ===========================
     ESTADOS
  ============================ */

  const [diagnosticoId, setDiagnosticoId] = useState<string | null>(null);

  const [empresa, setEmpresa] = useState("");

  const [financeiro, setFinanceiro] = useState(0);
  const [estrategia, setEstrategia] = useState(0);
  const [operacional, setOperacional] = useState(0);
  const [governanca, setGovernanca] = useState(0);
  const [geral, setGeral] = useState(0);

  const [swotForcas, setSwotForcas] = useState("");
  const [swotFraquezas, setSwotFraquezas] = useState("");
  const [swotOportunidades, setSwotOportunidades] = useState("");
  const [swotAmeacas, setSwotAmeacas] = useState("");

  const [planoAcao, setPlanoAcao] = useState<any[]>([]);
  const [resumoIA, setResumoIA] = useState("");

  const [loading, setLoading] = useState(true);

  /* ===========================
     OBTÉM O ID DO DIAGNÓSTICO
  ============================ */

  useEffect(() => {

    const params = new URLSearchParams(window.location.search);

    const id = params.get("id");

    if (!id) {

      console.error("Diagnóstico não informado.");

      setLoading(false);

      return;

    }

    setDiagnosticoId(id);

  }, []);

  /* ===========================
     CARREGA RESULTADO
  ============================ */

  useEffect(() => {

    if (!diagnosticoId) return;

    carregarResultado();

  }, [diagnosticoId]);

  /* ===========================
     CONSULTA DADOS
  ============================ */

  async function carregarResultado() {

    try {

      setLoading(true);

      const { data: diagnostico, error } = await supabase

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

      if (error) {

        console.error("Erro ao localizar diagnóstico:");

        console.error(error);

        return;

      }

      if (!diagnostico) {

        console.warn("Diagnóstico não encontrado.");

        return;

      }

      console.log("Diagnóstico carregado:", diagnostico);

      setEmpresa(

        (diagnostico as any)?.empresas?.razao_social ?? ""

      );
      /* ===========================
         RESPOSTAS DO DIAGNÓSTICO
      ============================ */

      const { data: respostas, error: erroRespostas } = await supabase
        .from("respostas")
        .select("*")
        .eq("diagnostico_id", diagnosticoId);

      if (erroRespostas) {

        console.error("Erro ao carregar respostas:");

        console.error(erroRespostas);

        return;

      }

      if (!respostas || respostas.length === 0) {

        console.warn("Nenhuma resposta localizada.");

        return;

      }

      console.log("Diagnóstico:", diagnosticoId);
      console.log("Total de respostas:", respostas.length);

      /* ===========================
         SEPARAÇÃO POR DIMENSÃO
      ============================ */

      const financeiroResp = respostas.filter(
        (r) => r.pergunta_id >= 1 && r.pergunta_id <= 20
      );

      const estrategiaResp = respostas.filter(
        (r) => r.pergunta_id >= 21 && r.pergunta_id <= 40
      );

      const operacionalResp = respostas.filter(
        (r) => r.pergunta_id >= 41 && r.pergunta_id <= 60
      );

      const governancaResp = respostas.filter(
        (r) => r.pergunta_id >= 61 && r.pergunta_id <= 80
      );

      /* ===========================
         FUNÇÃO DE CÁLCULO
      ============================ */

      const calcularScore = (lista: any[]): number => {

        if (!lista.length) return 0;

        const soma = lista.reduce(

          (total, resposta) => total + resposta.resposta,

          0

        );

        return Math.round(

          (soma / (lista.length * 5)) * 100

        );

      };

      /* ===========================
         SCORES
      ============================ */

      const f = calcularScore(financeiroResp);
      const e = calcularScore(estrategiaResp);
      const o = calcularScore(operacionalResp);
      const g = calcularScore(governancaResp);

      const scoreGeral = Math.round(

        (f + e + o + g) / 4

      );

      console.table({

        Financeiro: f,

        Estrategia: e,

        Operacional: o,

        Governanca: g,

        Geral: scoreGeral

      });

      /* ===========================
         ATUALIZA ESTADOS
      ============================ */

      setFinanceiro(f);
      setEstrategia(e);
      setOperacional(o);
      setGovernanca(g);
      setGeral(scoreGeral);

      /* ===========================
         CLASSIFICAÇÃO
      ============================ */

      const classificacao =

        scoreGeral >= 80 ? "Excelência" :

        scoreGeral >= 60 ? "Estruturado" :

        scoreGeral >= 40 ? "Parcial" :

        scoreGeral >= 20 ? "Inicial" :

        "Inexistente";
      /* ===========================
         ATUALIZA DIAGNÓSTICO
      ============================ */

      const { error: erroDiagnostico } = await supabase

        .from("diagnosticos")

        .update({

          score_financeiro: f,

          score_estrategia: e,

          score_operacional: o,

          score_governanca: g,

          score_geral: scoreGeral,

          classificacao

        })

        .eq("id", diagnosticoId);

      if (erroDiagnostico) {

        console.error("Erro ao atualizar diagnóstico:");

        console.error(erroDiagnostico);

      }

      /* ===========================
         GERA CONTEÚDO EXECUTIVO
      ============================ */

      const pontosFortes = gerarPontosFortes(

        f,

        e,

        o,

        g

      );

      const pontosAtencao = gerarPontosAtencao(

        f,

        e,

        o,

        g

      );

      const recomendacoes = gerarRecomendacoes(

        f,

        e,

        o,

        g

      );

      const planoGerado = gerarPlanoAcao(

        f,

        e,

        o,

        g

      );

      const resumoExecutivo = gerarResumoIA(

        f,

        e,

        o,

        g,

        scoreGeral

      );

      const swotForcasGerada = gerarSwotForcas(

        f,

        e,

        o,

        g

      );

      const swotFraquezasGerada = gerarSwotFraquezas(

        f,

        e,

        o,

        g

      );

      const swotOportunidadesGerada = gerarSwotOportunidades(

        f,

        e,

        o,

        g

      );

      const swotAmeacasGerada = gerarSwotAmeacas(

        f,

        e,

        o,

        g

      );

      /* ===========================
         ATUALIZA ESTADOS
      ============================ */

      setResumoIA(resumoExecutivo);

      setSwotForcas(swotForcasGerada);

      setSwotFraquezas(swotFraquezasGerada);

      setSwotOportunidades(swotOportunidadesGerada);

      setSwotAmeacas(swotAmeacasGerada);

      setPlanoAcao(planoGerado);

      /* ===========================
         RECRIA PLANO DE AÇÃO
      ============================ */

      await supabase

        .from("tb_plano_acao")

        .delete()

        .eq(

          "diagnostico_id",

          diagnosticoId

        );

      if (planoGerado.length > 0) {
      /* ===========================
         GRAVA PLANO DE AÇÃO
      ============================ */

      const { error: erroPlano } = await supabase

        .from("tb_plano_acao")

        .insert(

          planoGerado.map((item) => ({

            diagnostico_id: diagnosticoId,

            empresa_id: diagnostico.empresa_id,

            ...item

          }))

        )

        .select();

      if (erroPlano) {

        console.error("Erro ao gravar Plano de Ação:");

        console.error(erroPlano);

      }

      }

      /* ===========================
         RESULTADO CONSOLIDADO
      ============================ */

      const { data: resultadoExistente } = await supabase

        .from("tb_resultado_diagnostico")

        .select("id")

        .eq(

          "diagnostico_id",

          diagnosticoId

        )

        .maybeSingle();

      const dadosResultado = {

        diagnostico_id: diagnosticoId,

        empresa_id: diagnostico.empresa_id,

        score_financeiro: f,

        score_estrategia: e,

        score_operacional: o,

        score_governanca: g,

        score_geral: scoreGeral,

        classificacao,

        resumo_executivo: resumoExecutivo,

        pontos_fortes: pontosFortes,

        pontos_atencao: pontosAtencao,

        recomendacoes,

        swot_forcas: swotForcasGerada,

        swot_fraquezas: swotFraquezasGerada,

        swot_oportunidades: swotOportunidadesGerada,
        
        swot_ameacas: swotAmeacasGerada

      };

      /* ===========================
         INSERT / UPDATE RESULTADO
      ============================ */

      if (!resultadoExistente) {

        const { error: erroInsertResultado } = await supabase

          .from("tb_resultado_diagnostico")

          .insert(dadosResultado);

        if (erroInsertResultado) {

          console.error("Erro ao inserir resultado:");

          console.error(erroInsertResultado);

        }

      } else {

        const { error: erroUpdateResultado } = await supabase

          .from("tb_resultado_diagnostico")

          .update(dadosResultado)

          .eq(

            "diagnostico_id",

            diagnosticoId

          );

        if (erroUpdateResultado) {

          console.error("Erro ao atualizar resultado:");

          console.error(erroUpdateResultado);

        }

      }

      setLoading(false);

    }

    catch (error) {

      console.error("Erro ao gerar relatório:");

      console.error(error);

      setLoading(false);

    }

  }

  /* ============================================================
     IA - RESUMO EXECUTIVO
  ============================================================ */

  function gerarResumoIA(

    f:number,

    e:number,

    o:number,

    g:number,

    geral:number

  ){

    const melhor = [

      { nome:"Financeiro", valor:f },

      { nome:"Estratégia", valor:e },

      { nome:"Operacional", valor:o },

      { nome:"Governança", valor:g }

    ].sort(

      (a,b)=>b.valor-a.valor

    )[0];
     
        const pior = [

      { nome: "Financeiro", valor: f },

      { nome: "Estratégia", valor: e },

      { nome: "Operacional", valor: o },

      { nome: "Governança", valor: g }

    ].sort(

      (a, b) => a.valor - b.valor

    )[0];

    let nivel = "crítico";

    if (geral >= 80)

      nivel = "elevado";

    else if (geral >= 60)

      nivel = "estruturado";

    else if (geral >= 40)

      nivel = "intermediário";

    else if (geral >= 20)

      nivel = "inicial";

    return `
A avaliação realizada demonstra que a organização apresenta um índice geral de maturidade empresarial de ${geral}%, posicionando-se atualmente no nível ${nivel}. Este resultado indica que a empresa já possui práticas de gestão implementadas em algumas áreas-chave, porém ainda convive com oportunidades relevantes de estruturação, padronização e fortalecimento de seus processos gerenciais.

Sob a ótica das dimensões avaliadas, destaca-se positivamente a área de ${melhor.nome}, que alcançou desempenho de ${melhor.valor}%. Este resultado evidencia maior grau de organização, controle e maturidade operacional nesta dimensão, refletindo práticas mais consolidadas, melhor capacidade de execução e maior aderência aos princípios de gestão orientados a resultados.

Em contrapartida, a dimensão ${pior.nome} registrou índice de ${pior.valor}%, configurando atualmente o principal ponto de atenção identificado pelo diagnóstico. Este cenário demonstra a necessidade de priorização de iniciativas voltadas ao fortalecimento desta área, uma vez que suas fragilidades podem impactar diretamente a eficiência operacional, a previsibilidade dos resultados e a capacidade de crescimento sustentável da organização.

A leitura consolidada dos indicadores evidencia que o atual estágio de maturidade está diretamente associado a oportunidades de evolução em temas estratégicos como planejamento e desdobramento de metas, fortalecimento dos mecanismos de governança corporativa, padronização de processos, gestão por indicadores de desempenho e desenvolvimento de uma cultura orientada à melhoria contínua.

Considerando os resultados obtidos, bem como as ações estruturantes propostas neste relatório, estima-se que a execução disciplinada do plano de ação e do roadmap estratégico possibilite uma evolução consistente dos níveis de maturidade organizacional ao longo dos próximos ciclos de gestão. Tal movimento tende a ampliar a capacidade de tomada de decisão, aumentar a eficiência dos processos internos, fortalecer os controles gerenciais e elevar a competitividade da empresa em seu mercado de atuação.

De forma geral, o diagnóstico demonstra que a organização possui potencial concreto para avançar a patamares superiores de maturidade empresarial, desde que sejam mantidos o comprometimento da liderança, a execução das iniciativas recomendadas e o acompanhamento sistemático dos indicadores de desempenho definidos para cada dimensão avaliada.
`;

  }

  /* ============================================================
     PONTOS FORTES
  ============================================================ */

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
    const maior = Math.max(

      ...areas.map((area) => area.valor)

    );

    return areas

      .filter((area) => area.valor === maior)

      .map((area) => area.nome)

      .join(", ");

  }

  /* ============================================================
     PONTOS DE ATENÇÃO
  ============================================================ */

  function gerarPontosAtencao(

    f:number,

    e:number,

    o:number,

    g:number

  ){

    const lista:string[] = [];

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

  /* ============================================================
     RECOMENDAÇÕES
  ============================================================ */

  function gerarRecomendacoes(

    f:number,

    e:number,

    o:number,

    g:number

  ){

    const recomendacoes:string[] = [];

    if (f < 60)

      recomendacoes.push(

        "Fortalecer gestão financeira."

      );

    if (e < 60)

      recomendacoes.push(

        "Estruturar planejamento estratégico."

      );

    if (o < 60)

      recomendacoes.push(

        "Padronizar processos operacionais."

      );

    if (g < 60)

      recomendacoes.push(

        "Implementar práticas de governança."

      );

    return recomendacoes.join(" ");

  }

  /* ============================================================
     SWOT - FORÇAS
  ============================================================ */

  function gerarSwotForcas(

    f:number,

    e:number,

    o:number,

    g:number

  ){

    const lista:string[] = [];

    if (f >= 60)

      lista.push(

        "Gestão financeira estruturada"

      );

    if (e >= 60)

      lista.push(

        "Planejamento estratégico consistente"

      );

    if (o >= 60)

      lista.push(

        "Operações padronizadas"

      );

    if (g >= 60)

      lista.push(

        "Governança corporativa madura"

      );

    if (lista.length === 0) {

      const melhorArea = [

        { nome:"Financeiro", valor:f },

        { nome:"Estratégia", valor:e },

        { nome:"Operacional", valor:o },

        { nome:"Governança", valor:g }

      ]

      .sort(

        (a,b)=>b.valor-a.valor

      )[0];

      return `Melhor desempenho atual em ${melhorArea.nome}`;

    }

    return lista.join("; ");

  }
  /* ============================================================
     SWOT - FRAQUEZAS
  ============================================================ */

  function gerarSwotFraquezas(

    f:number,

    e:number,

    o:number,

    g:number

  ){

    const lista:string[] = [];

    if (f < 60)

      lista.push("Controles financeiros insuficientes");

    if (e < 60)

      lista.push("Ausência de planejamento estratégico");

    if (o < 60)

      lista.push("Baixa eficiência operacional");

    if (g < 60)

      lista.push("Governança pouco estruturada");

    return lista.join("; ");

  }

  /* ============================================================
     SWOT - OPORTUNIDADES
  ============================================================ */

  function gerarSwotOportunidades(

    f:number,

    e:number,

    o:number,

    g:number

  ){

    return [

      "Capacitação da equipe",

      "Automação de processos",

      "Implantação de indicadores",

      "Melhoria da gestão financeira",

      "Desenvolvimento de liderança"

    ].join("; ");

  }

  /* ============================================================
     SWOT - AMEAÇAS
  ============================================================ */

  function gerarSwotAmeacas(

    f:number,

    e:number,

    o:number,

    g:number

  ){

    return [

      "Perda de competitividade",

      "Redução de margens",

      "Aumento de custos",

      "Riscos operacionais",

      "Dependência de processos informais"

    ].join("; ");

  }

  /* ============================================================
     PLANO DE AÇÃO
  ============================================================ */

  function gerarPlanoAcao(

    f:number,

    e:number,

    o:number,

    g:number

  ){

    const plano:any[] = [];

    /* ===========================
       FINANCEIRO
    ============================ */

    if (f < 60) {

      plano.push({

        dimensao: "Financeiro",

        what_action: "Implantar Fluxo de Caixa Projetado",

        why_action: "Melhorar previsibilidade financeira",

        where_apply: "Departamento Financeiro",

        who_responsavel: "Diretoria Financeira",

        when_deadline: "2026-09-30",

        how_execute:
          "Criar rotina semanal de projeção financeira",

        how_much: 0,

        prioridade: "Alta",

        impacto: "Alto",

        esforco: "Médio",

        indicador_sucesso:
          "Fluxo atualizado semanalmente",

        observacoes:
          "Prioridade imediata"

      });

    }
    /* ===========================
       ESTRATÉGIA
    ============================ */

    if (e < 60) {

      plano.push({

        dimensao: "Estratégia",

        what_action: "Criar Planejamento Estratégico",

        why_action: "Definir metas e direcionamento",

        where_apply: "Diretoria",

        who_responsavel: "Diretor Executivo",

        when_deadline: "2026-08-31",

        how_execute:
          "Workshop estratégico e definição de indicadores",

        how_much: 0,

        prioridade: "Alta",

        impacto: "Alto",

        esforco: "Alto",

        indicador_sucesso:
          "Plano estratégico implantado",

        observacoes:
          "Necessário para crescimento"

      });

    }

    /* ===========================
       OPERACIONAL
    ============================ */

    if (o < 60) {

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

        how_much: 0,

        prioridade: "Alta",

        impacto: "Alto",

        esforco: "Médio",

        indicador_sucesso:
          "Redução de retrabalho e aumento de produtividade",

        observacoes:
          "Formalizar processos críticos"

      });

    }
    /* ===========================
       GOVERNANÇA
    ============================ */

    if (g < 60) {

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

        how_much: 0,

        prioridade: "Alta",

        impacto: "Alto",

        esforco: "Alto",

        indicador_sucesso:
          "Governança formalizada e monitorada",

        observacoes:
          "Criar rotina de acompanhamento gerencial"

      });

    }

    return plano;

  }

  /* ============================================================
     RENDERIZAÇÃO
  ============================================================ */

  if (loading) {

    return (

      <div className="min-h-screen bg-[#02142b] flex items-center justify-center text-white">

        <div className="text-center">

          <div className="animate-pulse text-4xl font-bold text-[#D4AA3C]">

            Gerando Relatório...

          </div>

          <p className="mt-4 text-slate-300">

            Aguarde enquanto analisamos os resultados do diagnóstico.

          </p>

        </div>

      </div>

    );

  }

  if (!diagnosticoId) {

    return (

      <div className="min-h-screen bg-[#02142b] flex items-center justify-center text-red-400">

        Diagnóstico não localizado.

      </div>

    );

  }

  return (

    <div className="min-h-screen bg-[#02142b] text-white p-10">

      <div className="text-center mb-10">

        <Image

          src="/logo-queiroz-v2.png"

          alt="Logo Queiroz"

          width={220}

          height={220}

          className="mx-auto"

          priority

        />

        <h1 className="text-5xl font-bold text-[#D4AA3C] mt-6">

          Resultado do Diagnóstico

        </h1>

        <p className="mt-3 text-xl text-slate-300">

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
          </div>
        {/* ============================================================
            PARECER EXECUTIVO
        ============================================================ */}

        <section
          className="
            mt-12
            bg-[#041d3b]
            border
            border-[#D4AA3C]
            rounded-2xl
            p-10
            shadow-xl
          "
        >

          <h2
            className="
              text-4xl
              font-bold
              text-[#D4AA3C]
              text-center
              mb-8
            "
          >
            Parecer Executivo Inteligente
          </h2>

          <div
            className="
              text-[18px]
              leading-9
              text-justify
              whitespace-pre-wrap
              text-slate-200
            "
          >
            {resumoIA}
          </div>

        </section>

        {/* ============================================================
            MATRIZ SWOT
        ============================================================ */}

        <section className="mt-14">

          <h2
            className="
              text-3xl
              font-bold
              text-[#D4AA3C]
              text-center
              mb-8
            "
          >
            Matriz SWOT Estratégica
          </h2>

          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-2
              gap-8
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

        </section>

        {/* ============================================================
            RANKING DAS DIMENSÕES
        ============================================================ */}

        <section
          className="
            mt-12
            bg-[#041d3b]
            border
            border-[#D4AA3C]
            rounded-2xl
            p-8
            shadow-xl
          "
        >

          <h2
            className="
              text-2xl
              font-bold
              text-[#D4AA3C]
              mb-6
            "
          >
            Ranking das Dimensões
          </h2>
          <ol className="space-y-3 text-lg">

            {[
              { nome: "Financeiro", valor: financeiro },
              { nome: "Estratégia", valor: estrategia },
              { nome: "Operacional", valor: operacional },
              { nome: "Governança", valor: governanca }
            ]
              .sort((a, b) => b.valor - a.valor)
              .map((item, index) => (

                <li
                  key={item.nome}
                  className="
                    flex
                    justify-between
                    items-center
                    bg-[#02142b]
                    rounded-xl
                    px-5
                    py-3
                    border
                    border-slate-700
                  "
                >

                  <span>

                    {index === 0 && "🥇 "}
                    {index === 1 && "🥈 "}
                    {index === 2 && "🥉 "}
                    {index > 2 && `${index + 1}º `}

                    {item.nome}

                  </span>

                  <span className="font-bold text-[#D4AA3C]">

                    {item.valor}%

                  </span>

                </li>

              ))}

          </ol>

        </section>

        {/* ============================================================
            PLANO DE AÇÃO ESTRATÉGICO
        ============================================================ */}

        <section className="mt-14">

          <h2
            className="
              text-3xl
              font-bold
              text-[#D4AA3C]
              text-center
              mb-10
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

                <h3
                  className="
                    text-2xl
                    font-bold
                    text-[#D4AA3C]
                    mb-6
                  "
                >
                  {item.dimensao}
                </h3>

                <div className="space-y-3">

                  <div>

                    <span className="font-semibold text-[#D4AA3C]">
                      O Que Fazer:
                    </span>

                    <span className="ml-2">
                      {item.what_action}
                    </span>

                  </div>

                  <div>

                    <span className="font-semibold text-[#D4AA3C]">
                      Por que fazer:
                    </span>

                    <span className="ml-2">
                      {item.why_action}
                    </span>

                  </div>

                  <div>

                    <span className="font-semibold text-[#D4AA3C]">
                      Onde aplicar:
                    </span>

                    <span className="ml-2">
                      {item.where_apply}
                    </span>

                  </div>

                  <div>

                    <span className="font-semibold text-[#D4AA3C]">
                      Responsável:
                    </span>

                    <span className="ml-2">
                      {item.who_responsavel}
                    </span>

                  </div>

                  <div>

                    <span className="font-semibold text-[#D4AA3C]">
        
                      Prazo:
                    </span>

                    <span className="ml-2">

                      {new Date(

                        item.when_deadline

                      ).toLocaleDateString("pt-BR")}

                    </span>

                  </div>

                  <div>

                    <span className="font-semibold text-[#D4AA3C]">
                      Como executar:
                    </span>

                    <span className="ml-2">
                      {item.how_execute}
                    </span>

                  </div>

                  <div>

                    <span className="font-semibold text-[#D4AA3C]">
                      Prioridade:
                    </span>

                    <span className="ml-2">
                      {item.prioridade}
                    </span>

                  </div>

                  <div>

                    <span className="font-semibold text-[#D4AA3C]">
                      Impacto:
                    </span>

                    <span className="ml-2">
                      {item.impacto}
                    </span>

                  </div>

                  <div>

                    <span className="font-semibold text-[#D4AA3C]">
                      Esforço:
                    </span>

                    <span className="ml-2">
                      {item.esforco}
                    </span>

                  </div>

                  <div>

                    <span className="font-semibold text-[#D4AA3C]">
                      Indicador de sucesso:
                    </span>

                    <span className="ml-2">
                      {item.indicador_sucesso}
                    </span>

                  </div>

                </div>

              </div>

            ))}

          </div>

        </section>

        {/* ============================================================
            ROADMAP ESTRATÉGICO
        ============================================================ */}

        <section className="mt-16">

          <h2
            className="
              text-3xl
              font-bold
              text-[#D4AA3C]
              text-center
              mb-10
            "
          >
            Roadmap Estratégico
          </h2>

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-3
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
                "Padronização de Processos",
                "Treinamentos",
                "Automação"
              ]}
            />

            <RoadmapCard
              titulo="90 Dias"
              acoes={[
                "Governança Corporativa",
                "KPIs Gerenciais",
                "Monitoramento Contínuo"
              ]}
            />

          </div>

        </section>

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
/* ============================================================
   CARD SWOT
============================================================ */

function SwotCard({

  titulo,

  valor,

  cor

}:{

  titulo:string;

  valor:string;

  cor:string;

}){

  const itens =

    valor

      ?.split(";")

      .map(item => item.trim())

      .filter(item => item.length > 0) ?? [];

  return(

    <div
      className={`
        bg-[#041d3b]
        border
        ${cor}
        rounded-2xl
        p-8
        min-h-[360px]
        shadow-xl
      `}
    >

      <h3
        className="
          text-2xl
          font-bold
          text-[#D4AA3C]
          mb-6
        "
      >

        {titulo}

      </h3>

      <div
        className="
          space-y-3
          text-lg
          leading-8
        "
      >

        {itens.length > 0 ? (

          itens.map((item,i)=>(

            <div
              key={i}
              className="flex gap-3"
            >

              <span className="text-[#D4AA3C]">
                ●
              </span>

              <span>
                {item}
              </span>

            </div>

          ))

        ) : (

          <div className="text-slate-400">

            Nenhuma informação disponível.

          </div>

        )}

      </div>

    </div>

  );

}

/* ============================================================
   ROADMAP CARD
============================================================ */

function RoadmapCard({

  titulo,

  acoes

}:{

  titulo:string;

  acoes:string[];

}){

  return(

    <div
      className="
        bg-[#041d3b]
        border
        border-[#D4AA3C]
        rounded-2xl
        p-8
        shadow-xl
        min-h-[320px]
        hover:border-yellow-400
        transition-all
      "
    >

      <h3
        className="
          text-2xl
          font-bold
          text-[#D4AA3C]
          mb-6
          text-center
        "
      >

        {titulo}

      </h3>

      <div className="space-y-4">

        {acoes.map((acao,index)=>(

          <div
            key={index}
            className="flex gap-3"
          >

            <span className="text-green-400 font-bold">

              ✓

            </span>

            <span>

              {acao}

            </span>

          </div>

        ))}

      </div>

    </div>

  );

}

/* ============================================================
   EXPORTAÇÃO DA PÁGINA
============================================================ */

export default function ResultadoPage(){

  return(

    <Suspense

      fallback={

        <div
          className="
            min-h-screen
            bg-[#02142b]
            flex
            items-center
            justify-center
            text-white
          "
        >

          <div className="text-center">

            <div
              className="
                text-4xl
                font-bold
                text-[#D4AA3C]
                animate-pulse
              "
            >

              Gerando relatório...

            </div>

            <p className="mt-4 text-slate-300">

              Aguarde enquanto consolidamos os resultados.

            </p>

          </div>

        </div>

      }

    >

      <ResultadoContent />

    </Suspense>

  );

}

