import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";

export const Route = createFileRoute("/admin/login")({ component: LoginPage });

// ログイン・サインアップ（#27 でつなぎ込み、#31 で見た目）
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
    <form onSubmit={onSubmit} className="mx-auto flex max-w-sm flex-col gap-2 p-4">
      <h1 className="text-xl font-bold">ログイン</h1>
      <input
        name="email"
        type="email"
        placeholder="メールアドレス"
        required
        className="border p-2"
      />
      <input
        name="password"
        type="password"
        placeholder="パスワード（8文字以上）"
        required
        minLength={8}
        className="border p-2"
      />
      {error && <p className="text-red-600">{error}</p>}
      <Button type="submit" value="signin">
        ログイン
      </Button>
      <Button type="submit" value="signup" variant="outline">
        新規登録
      </Button>
    </form>
  );
}
