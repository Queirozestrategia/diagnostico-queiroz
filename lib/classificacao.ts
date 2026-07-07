export function classificarMaturidade(
  score: number
) {

  if (score <= 20)
    return "INEXISTENTE";

  if (score <= 40)
    return "INICIAL";

  if (score <= 60)
    return "PARCIAL";

  if (score <= 80)
    return "ESTRUTURADO";

  return "EXCELÊNCIA";
}