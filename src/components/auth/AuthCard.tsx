import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "./LoginForm";

const AuthCard = () => {
  return (
    <Card className="w-full max-w-md shadow-soft-lg border-border/50">
      <CardHeader className="space-y-4 text-center pb-2">
        <div className="mx-auto w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center mb-2">
          <span className="text-white font-bold text-xl">F</span>
        </div>
        <div>
          <CardTitle className="text-2xl font-semibold">
            Fechamento<span className="text-primary">.PRO</span>
          </CardTitle>
          <CardDescription className="mt-2">
            Sistema de gerenciamento financeiro
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <LoginForm />
      </CardContent>
    </Card>
  );
};

export default AuthCard;
