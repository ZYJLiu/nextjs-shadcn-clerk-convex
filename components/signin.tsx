"use client";

import {
  SignInButton,
  UserButton,
  ClerkLoading,
  SignedIn,
  SignedOut,
} from "@clerk/clerk-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export function SignIn() {
  return (
    <div>
      <ClerkLoading>
        <Skeleton className="w-8 h-8 rounded-full" />
      </ClerkLoading>
      <SignedIn>
        <UserButton afterSignOutUrl="/" />
      </SignedIn>
      <SignedOut>
        <SignInButton mode="modal">
          <Button variant="outline">Sign in</Button>
        </SignInButton>
      </SignedOut>
    </div>
  );
}
