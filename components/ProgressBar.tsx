interface Props {
  etapa: number;
  total: number;
}

export default function ProgressBar({
  etapa,
  total,
}: Props) {
  const percentual = (etapa / total) * 100;

  return (
    <div className="mb-10">
      <div className="flex justify-between text-xs text-gray-300 mb-2">
        <span>Etapa {etapa} de {total}</span>
        <span>{percentual}%</span>
      </div>

      <div className="h-3 bg-slate-900 rounded-full">
        <div
          className="h-3 bg-blue-600 rounded-full"
          style={{ width: `${percentual}%` }}
        />
      </div>
    </div>
  );
}