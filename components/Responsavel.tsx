export default function Responsavel() {
  return (
    <>
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
    </>
  );
}