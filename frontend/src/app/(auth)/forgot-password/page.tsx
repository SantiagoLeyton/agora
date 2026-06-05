import { AuthLayout } from "@/layouts/auth-layout";
import { ForgotPasswordForm } from "@/modules/auth/components/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthLayout>
      <ForgotPasswordForm />
    </AuthLayout>
  );
}
