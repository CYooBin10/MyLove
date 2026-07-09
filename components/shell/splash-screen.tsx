export function SplashScreen() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-primary/12 text-4xl">♥</div>
        <h1 className="text-2xl font-bold text-foreground">MyLove</h1>
        <p className="mt-2 text-sm text-muted-foreground">Loading your private space...</p>
      </div>
    </div>
  );
}
