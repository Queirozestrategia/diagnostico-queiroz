import Image from "next/image";

export default function LogoHeader() {
  return (
    <div className="flex justify-center mb-6">
      <Image
        src="/logo-queiroz-v2.png"
        alt="Queiroz Consultoria Estratégica"
        width={120}
        height={120}
        priority
      />
    </div>
  );
}