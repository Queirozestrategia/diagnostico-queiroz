type Props = {
  cep: string;
  endereco: string;
  bairro: string;
  municipio: string;
  estado: string;
  naturezaJuridica: string;
  porte: string;
  capitalSocial: string;
};

export default function DadosReceita({
  cep,
  endereco,
  bairro,
  municipio,
  estado,
  naturezaJuridica,
  porte,
  capitalSocial,
}: Props) {

  return (

    <>

      <h2 className="text-white text-2xl font-semibold mt-10">
        Dados Receita Federal
      </h2>

      <div className="grid md:grid-cols-2 gap-4 mt-4">

        <input
          value={cep}
          readOnly
          placeholder="CEP"
          className="input"
        />

        <input
          value={municipio}
          readOnly
          placeholder="Município"
          className="input"
        />

        <input
          value={endereco}
          readOnly
          placeholder="Endereço"
          className="input"
        />

        <input
          value={bairro}
          readOnly
          placeholder="Bairro"
          className="input"
        />

        <input
          value={estado}
          readOnly
          placeholder="UF"
          className="input"
        />

        <input
          value={porte}
          readOnly
          placeholder="Porte"
          className="input"
        />

        <input
          value={naturezaJuridica}
          readOnly
          placeholder="Natureza Jurídica"
          className="input"
        />

        <input
          value={capitalSocial}
          readOnly
          placeholder="Capital Social"
          className="input"
        />

      </div>

    </>
  );
}