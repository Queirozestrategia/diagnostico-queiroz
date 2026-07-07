import axios from "axios";

export async function consultarCNPJ(cnpj: string) {

  try {

    const numero = cnpj.replace(/\D/g, "");

    const response = await axios.get(
      `https://brasilapi.com.br/api/cnpj/v1/${numero}`
    );

    console.log(response.data);

    return response.data;

  } catch (error) {

    console.error(error);

    return null;

  }

}