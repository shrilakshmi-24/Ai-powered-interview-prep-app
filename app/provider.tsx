"use client"

import { api } from "@/convex/_generated/api";
import { useMutation } from "convex/react";
import { useUser } from "@clerk/nextjs";
import React, { createContext, useEffect, useState } from "react";
import { UserContextDetails } from "./context/userContextDetails";

function Provider({ children }: { children: React.ReactNode }) {
    const { user } = useUser();
    const createUser = useMutation(api.user.CreateNewUser);
    const [userDetail, setUserDetail] = useState<any>(null);
    
    useEffect(() => {
        const createNewUser = async () => {
            if (user) {
               const result = await createUser({
                    name: user.fullName || "No Name",
                    email: user.emailAddresses[0]?.emailAddress || "No Email",
                    image: user.imageUrl || undefined,
                });

                setUserDetail(result);
            }
        };
        
        createNewUser();
    }, [user, createUser]);

   return (
    <UserContextDetails.Provider value={{ userDetail, setUserDetail }}>
      <div>{children}</div>
    </UserContextDetails.Provider>
  );
} 
export default Provider;