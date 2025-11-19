import Header from "../components/Header";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Anything you want shared across main app pages */}
      <Header />
      {children}
    </>
  );
}