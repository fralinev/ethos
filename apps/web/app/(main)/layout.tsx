import Header from "../components/Header";
import { getSessionFromNextRequest } from "../../lib/session";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      {/* Anything you want shared across main app pages */}
      {/* <Header /> */}
      {children}
    </>
  );
}