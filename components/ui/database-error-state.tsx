import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function DatabaseErrorState({ message }: { message?: string }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background p-6">
      <Card className="w-full max-w-lg p-6">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-[20px] bg-destructive/10 text-2xl text-destructive">
          !
        </div>
        <h1 className="text-xl font-bold text-foreground">Chưa kết nối được database</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {message || "DATABASE_URL hiện chưa hợp lệ hoặc Postgres chưa chạy."}
        </p>

        <div className="mt-5 rounded-2xl border bg-muted/20 p-4 text-sm text-foreground/90">
          <p className="font-semibold">Cách sửa nhanh:</p>
          <ol className="mt-2 list-decimal space-y-1 pl-5 text-muted-foreground">
            <li>Tạo file <code>.env</code> từ <code>.env.example</code>.</li>
            <li>Thay <code>HOST</code>, <code>USER</code>, <code>PASSWORD</code>, <code>DATABASE</code> bằng PostgreSQL thật.</li>
            <li>Chạy <code>npx prisma migrate dev --name init</code>.</li>
            <li>Refresh lại trang.</li>
          </ol>
        </div>

        <div className="mt-5 rounded-2xl bg-card p-4 text-xs text-muted-foreground border">
          Ví dụ local: <code>postgresql://postgres:postgres@localhost:5432/mylove</code>
          <br />
          Ví dụ cloud: dùng connection string từ Vercel Postgres hoặc Supabase.
        </div>

        <div className="mt-5 flex gap-3">
          <Button className="flex-1" onClick={() => window.location.reload()}>
            Thử lại
          </Button>
        </div>
      </Card>
    </div>
  );
}
