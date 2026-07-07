export default function InfoDiagnostico() {
  return (
    <div className="border border-blue-600 rounded-xl p-5 mb-8">

      <span className="text-xs tracking-widest text-blue-300">
        DIAGNÓSTICO DE MATURIDADE EMPRESARIAL
      </span>

      <h3 className="font-bold mt-2 mb-4">
        O que será avaliado?
      </h3>

      <div className="grid md:grid-cols-2 gap-3 text-sm">

        <p>✓ Gestão Financeira</p>

        <p>✓ Gestão Operacional</p>

        <p>✓ Gestão Estratégica</p>

        <p>✓ Governança Empresarial</p>

      </div>

    </div>
  );
}