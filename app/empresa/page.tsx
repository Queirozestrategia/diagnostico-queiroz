"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Building2,
  User,
  Mail,
  Phone,
  Briefcase,
  MapPin,
  Users,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

const estados = [
  "AC","AL","AP","AM","BA","CE","DF","ES","GO",
  "MA","MT","MS","MG","PA","PB","PR","PE","PI",
  "RJ","RN","RS","RO","RR","SC","SP","SE","TO"
];

export default function EmpresaPage() {
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    razao_social: "",
    nome_fantasia: "",
    cnpj: "",
    segmento: "",
    regime_tributario: "",
    faturamento: "",
    colaboradores: "",
    cidade: "",
    uf: "",
    responsavel: "",
    cargo: "",
    email: "",
    telefone: "",
  });

  async function salvarEmpresa() {
    try {
      setLoading(true);

      const { error } = await supabase
        .from("empresas")
        .insert([form]);

      if (error) throw error;

      window.location.href = "/diagnostico";

    } catch (error: any) {
      alert(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#08162C] py-10 px-4">

      <div className="max-w-6xl mx-auto bg-[#0C1E3C] border border-blue-700 rounded-3xl p-8 shadow-2xl">

        {/* LOGO */}

        <div className="flex justify-center">

          <Image
            src="/logo-queiroz-v2.png"
            alt="Queiroz Estratégia"
            width={340}
            height={340}
            priority
          />

        </div>

        {/* PROGRESSO */}

        <div className="mt-2">

          <div className="flex justify-between items-center mb-2">

            <div>
              <p className="text-xs text-blue-300">
                Etapa 1 de 4
              </p>

              <p className="text-white font-semibold">
                Cadastro da Empresa
              </p>
            </div>

            <div className="bg-blue-600 text-white px-3 py-1 rounded-xl font-bold text-sm">
              25%
            </div>

          </div>

          <div className="h-3 bg-[#08162C] rounded-full">

            <div className="h-3 w-[25%] bg-blue-600 rounded-full"></div>

          </div>

        </div>

        {/* TITULO */}

        <div className="text-center mt-10">

          <h1 className="text-5xl font-bold text-white">
            Etapa 1 - Identificação da Empresa
          </h1>

          <p className="text-gray-300 mt-4">
            Preencha os dados da empresa para iniciar o diagnóstico estratégico.
          </p>

          <p className="text-blue-300 mt-2">
            ⏱ Tempo médio: 5 minutos
          </p>

        </div>

        {/* CARD */}

        <div className="bg-[#08162C] border border-blue-700 rounded-2xl p-6 mt-8">

          <p className="text-blue-300 uppercase text-xs tracking-widest">
            Diagnóstico de Maturidade Empresarial
          </p>

          <h3 className="text-white text-xl font-semibold mt-2">
            Áreas Avaliadas no Diagnóstico
          </h3>

          <div className="flex flex-wrap gap-3 mt-5">

            <Badge texto="✓ Gestão Financeira" />
            <Badge texto="✓ Gestão Operacional" />
            <Badge texto="✓ Gestão Estratégica" />
            <Badge texto="✓ Governança Empresarial" />

          </div>

        </div>

        {/* EMPRESA */}

        <div className="mt-10">

          <h2 className="text-white text-2xl font-semibold border-b border-blue-700 pb-3">
            Dados da Empresa
          </h2>

          <div className="grid md:grid-cols-2 gap-5 mt-6">

            <Campo
              icon={<Building2 size={18} />}
              placeholder="Razão Social"
              onChange={(v:any)=>setForm({...form,razao_social:v})}
            />

            <Campo
              icon={<Building2 size={18} />}
              placeholder="Nome Fantasia"
              onChange={(v:any)=>setForm({...form,nome_fantasia:v})}
            />

            <Campo
              icon={<Building2 size={18} />}
              placeholder="CNPJ"
              onChange={(v:any)=>setForm({...form,cnpj:v})}
            />

            <Campo
              icon={<Briefcase size={18} />}
              placeholder="Segmento de Atuação"
              onChange={(v:any)=>setForm({...form,segmento:v})}
            />

            <select
              className={selectClass}
              onChange={(e)=>
                setForm({...form,regime_tributario:e.target.value})
              }
            >
              <option>Regime Tributário</option>
              <option>MEI</option>
              <option>Simples Nacional</option>
              <option>Lucro Presumido</option>
              <option>Lucro Real</option>
            </select>

            <select
              className={selectClass}
              onChange={(e)=>
                setForm({...form,faturamento:e.target.value})
              }
            >
              <option>Faturamento Anual</option>
              <option>Até R$ 360 mil</option>
              <option>R$ 360 mil a R$ 4,8 milhões</option>
              <option>R$ 4,8 milhões a R$ 20 milhões</option>
              <option>R$ 20 milhões a R$ 100 milhões</option>
              <option>Acima de R$ 100 milhões</option>
            </select>

            <Campo
              icon={<Users size={18} />}
              placeholder="Quantidade de Colaboradores"
              type="number"
              onChange={(v:any)=>setForm({...form,colaboradores:v})}
            />

            <Campo
              icon={<MapPin size={18} />}
              placeholder="Cidade"
              onChange={(v:any)=>setForm({...form,cidade:v})}
            />

            <select
              className={selectClass}
              onChange={(e)=>
                setForm({...form,uf:e.target.value})
              }
            >
              <option>UF</option>

              {estados.map((estado)=>(
                <option key={estado}>
                  {estado}
                </option>
              ))}

            </select>

          </div>

        </div>

        {/* RESPONSAVEL */}

        <div className="mt-10">

          <h2 className="text-white text-2xl font-semibold border-b border-blue-700 pb-3">
            Responsável pelo Diagnóstico
          </h2>

          <div className="grid md:grid-cols-2 gap-5 mt-6">

            <Campo
              icon={<User size={18} />}
              placeholder="Nome Completo"
              onChange={(v:any)=>setForm({...form,responsavel:v})}
            />

            <Campo
              icon={<Briefcase size={18} />}
              placeholder="Cargo"
              onChange={(v:any)=>setForm({...form,cargo:v})}
            />

            <Campo
              icon={<Mail size={18} />}
              placeholder="E-mail"
              type="email"
              onChange={(v:any)=>setForm({...form,email:v})}
            />

            <Campo
              icon={<Phone size={18} />}
              placeholder="Telefone / WhatsApp"
              onChange={(v:any)=>setForm({...form,telefone:v})}
            />

          </div>

        </div>

        {/* LGPD */}

        <div className="mt-10">

          <p className="text-center text-gray-400 text-sm">
            Seus dados são protegidos e utilizados exclusivamente para a elaboração do diagnóstico empresarial.
          </p>

        </div>

        {/* BOTAO */}

        <div className="flex justify-center mt-8">

          <button
            onClick={salvarEmpresa}
            disabled={loading}
            className="
            bg-gradient-to-r
            from-blue-600
            to-blue-800
            hover:scale-105
            transition
            px-10
            py-4
            rounded-2xl
            text-white
            font-bold
            shadow-xl
            "
          >
            {loading
              ? "Salvando..."
              : "Iniciar Diagnóstico →"}
          </button>

        </div>

      </div>

    </main>
  );
}

/* COMPONENTES */

function Badge({ texto }: { texto: string }) {
  return (
    <span className="
    px-4
    py-2
    rounded-full
    bg-blue-900
    text-blue-100
    text-sm
    ">
      {texto}
    </span>
  );
}

function Campo({
  placeholder,
  icon,
  onChange,
  type="text"
}:any) {
  return (
    <div className="relative">

      <div className="absolute left-4 top-4 text-blue-300">
        {icon}
      </div>

      <input
        type={type}
        placeholder={placeholder}
        onChange={(e)=>onChange(e.target.value)}
        className="
        w-full
        bg-[#08162C]
        border
        border-blue-700
        rounded-xl
        pl-12
        p-4
        text-white
        placeholder-gray-400
        focus:outline-none
        focus:border-blue-400
        "
      />

    </div>
  );
}

const selectClass = `
w-full
bg-[#08162C]
border
border-blue-700
rounded-xl
p-4
text-white
focus:outline-none
focus:border-blue-400
`;