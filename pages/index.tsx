import type { NextPage } from "next";
import { useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useRouter } from "next/router";
import timeMachineImage from "./../public/time-machine.jpg";
import Image from "next/image";
import dynamic from "next/dynamic";

const DynamicSplashPage = dynamic(
  () => import("../src/components/SplashPage"),
  {
    ssr: false,
  }
);

const LandingPage: NextPage = () => {
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (session) {
      router.replace("/apps");
    }
  }, [session]);

  return (
    <div className="container h-full w-full">
      <DynamicSplashPage />
    </div>
  );
};

export default LandingPage;
