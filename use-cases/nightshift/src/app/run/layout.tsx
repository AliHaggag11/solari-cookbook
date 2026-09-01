export default function RunLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="operator-ui min-h-dvh bg-black text-white">{children}</div>
  );
}
