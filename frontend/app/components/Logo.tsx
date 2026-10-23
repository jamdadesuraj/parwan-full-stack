import Image from "next/image";
import Link from "next/link";

const Logo = () => {
  return (
    <Link href="/" className="inline-flex items-center">
      <Image
        src="/img/logo.png"
        alt="Logo"
        width={150}
        height={100}
        priority
        className="h-18 "
      />
    </Link>
  );
};

export default Logo;
