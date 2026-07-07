import LogoHeader from "../../components/LogoHeader";
import ProgressBar from "../../components/ProgressBar";
import InfoDiagnostico from "../../components/InfoDiagnostico";
import DadosEmpresa from "../../components/DadosEmpresa";
import { supabase } from "../../lib/supabase";

export default function EmpresaPage() {
  return (
    <main className="min-h-screen bg-[#08162C] py-10 px-4">

      <div className="max-w-5xl mx-auto">

        <div className="bg-[#0C1E3C] border border-blue-700 rounded-3xl p-8">

          <LogoHeader />

          <ProgressBar
            etapa={1}
            total={5}
          />

          <h1 className="text-5xl font-bold text-center text-white mt-8">
            Cadastro Inicial
          </h1>

          <p className="text-center text-slate-300 mt-3">
            Diagnóstico de Maturidade Empresarial
          </p>

          <div className="mt-8">
            <InfoDiagnostico />
          </div>

          <DadosEmpresa />
        </div>

      </div>

    </main>
  );
}