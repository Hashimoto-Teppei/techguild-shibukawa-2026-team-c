import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/admin/login")({ component: LoginPage });

// ログイン・サインアップ
function LoginPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const email = String(form.get("email"));
    const password = String(form.get("password"));
    const isSignUp = (e.nativeEvent as SubmitEvent).submitter?.getAttribute("value") === "signup";
    const { error } = isSignUp
      ? await authClient.signUp.email({ email, password, name: email })
      : await authClient.signIn.email({ email, password });
    if (error) return setError(error.message ?? "失敗しました");
    // 前にログインしていた人のマップ一覧を出さない
    queryClient.clear();
    navigate({ to: "/admin" });
  }

  return (
    <main className="flex min-h-svh items-center justify-center p-4">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-xl">マップを作る・編集する</CardTitle>
          <CardDescription>はじめての方は「新規登録」を押してください</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="flex flex-col gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">メールアドレス</Label>
              <Input id="email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード（8文字以上）</Label>
              <Input id="password" name="password" type="password" required minLength={8} />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            <Button type="submit" value="signin" size="lg">
              ログイン
            </Button>
            <Button type="submit" value="signup" variant="outline" size="lg">
              新規登録
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
