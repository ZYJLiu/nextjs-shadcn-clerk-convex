"use client";

import { SignInButton, UserButton } from "@clerk/clerk-react";
import { useConvexAuth } from "convex/react";
import { buttonVariants } from "@/components/ui/button";
import useStoreUserEffect from "@/app/userStoreUserEffect";

export function SignIn() {
  const { isLoading, isAuthenticated } = useConvexAuth();
  const userId = useStoreUserEffect();
  return isAuthenticated ? (
    <UserButton afterSignOutUrl="/" />
  ) : (
    <div>
      {isLoading ? (
        <button disabled>...</button>
      ) : (
        <SignInButton>
          <button
            className={buttonVariants({
              size: "sm",
            })}
          >
            Sign In
          </button>
        </SignInButton>
      )}
    </div>
  );
}
