import { PlatformLayout } from "@/layouts/platform-layout";

export default function PlatformRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PlatformLayout>{children}</PlatformLayout>;
}
