import { signIn, signOut, useSession } from "next-auth/react";
import styled from "styled-components";
import Image from "next/image";
import { profile } from "console";
import Link from "next/link";

const Header = () => {
  const { data: session } = useSession();

  return (
    <div className="bg-white header-wrapper grid grid-cols-12 salmon z-20">
      <button className="head-title col-start-2 ">
        <Link href="/apps">
          <h2> 🧰 Asana Toolbox</h2>
        </Link>
      </button>
      <div className="head-info col-start-8 col-end-12">
        {session ? (
          <div className="head-profile">
            <img
              className="profile-image"
              src={
                session?.user?.image ||
                "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Question_mark_%28black%29.svg/200px-Question_mark_%28black%29.svg.png"
              }
            ></img>
            <p className="profile-name">{session.user?.name}</p>
            <button onClick={() => signOut({ callbackUrl: "/" })}>
              Sign out
            </button>
          </div>
        ) : (
          <div className="head-signin">
            <button onClick={() => signIn()}>Sign In</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Header;
