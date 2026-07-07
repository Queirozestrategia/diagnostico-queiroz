"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { consultarCNPJ } from "../lib/brasilapi";
import { supabase } from "../lib/supabase";

export default function DadosEmpresa() {
  const router = useRouter();
  const [cnpj, setCnpj] = useState("");
  const [empresa, setEmpresa] = useState({
  razao_social: "",
  nome_fantasia: "",
  municipio: "",
  estado: "",
  bairro: "",
  cep: "",
  logradouro: "",
  natureza_juridica: "",
  data_abertura: "",
  situacao_cadastral: "",
  cnae_principal: "",
  codigo_cnae: "",
  capital_social: 0,
  simples_nacional: false,
  mei: false,
});

 async function buscarCNPJ(valor: string) {
  const numero = valor.replace(/\D/g, "");

  if (numero.length !== 14) return;

  const dados = await consultarCNPJ(numero);

  if (!dados) return;

  setEmpresa({
    razao_social: dados.razao_social || "",
    nome_fantasia: dados.nome_fantasia || "",
    municipio: dados.municipio || "",
    estado: dados.uf || "",
    bairro: dados.bairro || "",
    cep: dados.cep || "",
    logradouro: dados.logradouro || "",
    natureza_juridica: dados.natureza_juridica || "",
    data_abertura: dados.data_inicio_atividade || "",
    situacao_cadastral: dados.descricao_situacao_cadastral || "",
    cnae_principal: dados.cnae_fiscal_descricao || "",
    codigo_cnae: dados.cnae_fiscal || "",
    capital_social: Number(dados.capital_social || 0),
    simples_nacional: dados.opcao_pelo_simples || false,
    mei: dados.opcao_pelo_mei || false,
  });
 }
async function salvarEmpresa() {
  try {

    const { data: empresaData, error: empresaError } =
      await supabase
        .from("empresas")
        .insert([
          {
            razao_social: empresa.razao_social,
            nome_fantasia: empresa.nome_fantasia,
            cnpj: cnpj,
            municipio: empresa.municipio,
            estado: empresa.estado,
            bairro: empresa.bairro,
            cep: empresa.cep,
            logradouro: empresa.logradouro,
            natureza_juridica:
              empresa.natureza_juridica,
            data_abertura:
              empresa.data_abertura,
            situacao_cadastral:
              empresa.situacao_cadastral,
            cnae_principal:
              empresa.cnae_principal,
            codigo_cnae:
              empresa.codigo_cnae,
            capital_social:
              empresa.capital_social,
            simples_nacional:
              empresa.simples_nacional,
            mei:
              empresa.mei,
          },
        ])
        .select()
        .single();

    if (empresaError) {

      console.log(empresaError);

      alert(
        JSON.stringify(
          empresaError,
          null,
          2
        )
      );

      return;
    }

    const empresaId = empresaData.id;

    const {
      data: diagnosticoData,
      error: diagnosticoError,
    } = await supabase
      .from("diagnosticos")
      .insert([
        {
          empresa_id: empresaId,
        },
      ])
      .select()
      .single();
    if (diagnosticoError) {

      console.log(diagnosticoError);

      alert(
        JSON.stringify(
          diagnosticoError,
          null,
          2
        )
      );

      return;
    }

   router.push(`/diagnostico?id=${diagnosticoData.id}`);

  } catch (erro) {

    console.error(erro);

    alert("Erro inesperado.");
}
}
  return (
    <>
      <h2 className="text-2xl font-bold mb-4">
        Dados da Empresa
      </h2>

      <div className="grid md:grid-cols-2 gap-4">

        <input
  className="input"
  placeholder="CNPJ"
  value={cnpj}
  onChange={(e) => {

    let valor = e.target.value
      .replace(/\D/g, "")
      .slice(0, 14);

    valor = valor
      .replace(/^(\d{2})(\d)/, "$1.$2")
      .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
      .replace(/\.(\d{3})(\d)/, ".$1/$2")
      .replace(/(\d{4})(\d)/, "$1-$2");

    setCnpj(valor);
  }}
  onBlur={(e) => buscarCNPJ(e.target.value)}
/>

        <input
          className="input"
          value={empresa.razao_social}
          placeholder="Razão Social"
          readOnly
        />

        <input
          className="input"
          value={empresa.nome_fantasia}
          placeholder="Nome Fantasia"
          readOnly
        />

        <input
          className="input"
          placeholder="Segmento de Atuação"
        />

        <select className="input">

          <option>
            Regime Tributário
          </option>

          <option>Simples Nacional</option>

          <option>Lucro Presumido</option>

          <option>Lucro Real</option>

        </select>

        <select className="input">

          <option>
            Faturamento Anual
          </option>

          <option>
            Até R$ 360 mil
          </option>

          <option>
            R$ 360 mil a R$ 4,8 milhões
          </option>

          <option>
            R$ 4,8 milhões a R$ 20 milhões
          </option>

          <option>
            R$ 20 milhões a R$ 100 milhões
          </option>

          <option>
            Acima de R$ 100 milhões
          </option>

        </select>

        <input
          className="input"
          placeholder="Quantidade de Colaboradores"
        />

        <input
          className="input"
          value={empresa.estado}
          placeholder="UF"
          readOnly
        />

        <input
          className="input"
          value={empresa.municipio}
          placeholder="Município"
          readOnly
        />
        
        <input
  className="input"
  value={empresa.bairro}
  placeholder="Bairro"
  readOnly
/>

<input
  className="input"
  value={empresa.cep}
  placeholder="CEP"
  readOnly
/>

<input
  className="input"
  value={empresa.logradouro}
  placeholder="Logradouro"
  readOnly
/>

<input
  className="input"
  value={empresa.natureza_juridica}
  placeholder="Natureza Jurídica"
  readOnly
/>

<input
  className="input"
  value={empresa.data_abertura}
  placeholder="Data de Abertura"
  readOnly
/>

<input
  className="input"
  value={empresa.situacao_cadastral}
  placeholder="Situação Cadastral"
  readOnly
/>

<input
  className="input"
  value={empresa.codigo_cnae}
  placeholder="Código CNAE"
  readOnly
/>
        <input
          className="input"
          value={empresa.cnae_principal}
          placeholder="CNAE Principal"
          readOnly
        />
        <input
          className="input"
          value={
  empresa.capital_social
    ? Number(empresa.capital_social).toLocaleString(
        "pt-BR",
        {
          style: "currency",
          currency: "BRL",
        }
      )
    : ""
}
        />

        <input
  className="input"
  value={
    empresa.simples_nacional
      ? "Sim"
      : "Não"
  }
  placeholder="Simples Nacional"
  readOnly
/>

<input
  className="input"
  value={
    empresa.mei
      ? "Sim"
      : "Não"
  }
  placeholder="MEI"
  readOnly
/>

      </div>
      <h2 className="text-2xl font-bold mt-10 mb-4">
  Responsável pelo Diagnóstico
</h2>

<div className="grid md:grid-cols-2 gap-4">

  <input
    className="input"
    placeholder="Nome Completo"
  />

  <input
    className="input"
    placeholder="Cargo"
  />

  <input
    className="input"
    placeholder="E-mail"
  />

  <input
    className="input"
    placeholder="Telefone / WhatsApp"
  />

</div>

<div className="flex justify-center mt-8">
<button
  type="button"
  onClick={salvarEmpresa}
  className="
    bg-blue-600
    hover:bg-blue-700
    text-white
    font-semibold
    px-8
    py-3
    rounded-lg
    transition
    duration-300
    shadow-lg
  "
>
  Iniciar Diagnóstico →
</button>
</div>
    </>
  );
}