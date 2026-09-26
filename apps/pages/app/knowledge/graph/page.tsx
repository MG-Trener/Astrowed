import { LibraryRedirect } from "@/components/library-redirect";

export const metadata = {
  title: "Библиотека знаний",
  robots: { index: false, follow: true },
};

export default function Page() {
  return <LibraryRedirect />;
}
