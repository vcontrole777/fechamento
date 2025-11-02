
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import LoginForm from "./LoginForm";

const AuthCard = () => {
  return (
    <Card className="w-full max-w-md glow-card border-2 border-primary bg-card/90 backdrop-blur-sm">
      <CardHeader className="space-y-4">
        <CardTitle className="text-4xl font-bold text-center glow-text animate-pulse">
          Flow Insight
        </CardTitle>
        <CardDescription className="text-center text-foreground/80">
          Sistema de gerenciamento avançado
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
        <LoginForm />
      </CardContent>
    </Card>
  );
};

export default AuthCard;
