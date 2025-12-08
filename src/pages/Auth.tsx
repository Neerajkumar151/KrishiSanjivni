import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Layout } from '@/components/layout/Layout';
import { Sprout } from 'lucide-react';

const Auth: React.FC = () => {
  const { t } = useTranslation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  const signInSchema = z.object({
    email: z.string().email(t('auth.invalidEmail')),
    password: z.string().min(6, t('auth.passwordMinLength')),
  });

  const signUpSchema = z
    .object({
      email: z.string().email(t('auth.invalidEmail')),
      password: z.string().min(6, t('auth.passwordMinLength')),
      confirmPassword: z.string(),
      fullName: z.string().min(2, t('auth.fullNameMinLength')),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: t('auth.passwordsDontMatch'),
      path: ['confirmPassword'],
    });

  type SignInFormData = z.infer<typeof signInSchema>;
  type SignUpFormData = z.infer<typeof signUpSchema>;

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
  });

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
  });

  useEffect(() => {
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleSignIn = async (data: SignInFormData) => {
    setLoading(true);
    const { error } = await signIn(data.email, data.password);
    setLoading(false);

    if (!error) navigate('/');
  };

  const handleSignUp = async (data: SignUpFormData) => {
    setLoading(true);
    const { error } = await signUp(data.email, data.password, data.fullName);
    setLoading(false);

    if (!error) setIsSignUp(false);
  };

  return (
    <Layout>
      <div
  className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-cover bg-center"
  style={{ backgroundImage: "url('/bg.png')" }}
>
        <Card className="w-full max-w-md shadow-medium">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <Sprout className="h-12 w-12 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {isSignUp ? t('auth.signUp') : t('auth.signIn')}
            </CardTitle>
            <CardDescription>
              {isSignUp
                ? t('auth.createAccountDescription')
                : t('auth.welcomeBackDescription')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isSignUp ? (
              <form onSubmit={signUpForm.handleSubmit(handleSignUp)} className="space-y-4">
                <div>
                  <Label htmlFor="fullName">{t('auth.fullName')}</Label>
                  <Input id="fullName" type="text" {...signUpForm.register('fullName')} className="mt-1" />
                  {signUpForm.formState.errors.fullName && (
                    <p className="text-sm text-destructive mt-1">
                      {signUpForm.formState.errors.fullName.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input id="email" type="email" {...signUpForm.register('email')} className="mt-1" />
                  {signUpForm.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">
                      {signUpForm.formState.errors.email.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <Input id="password" type="password" {...signUpForm.register('password')} className="mt-1" />
                  {signUpForm.formState.errors.password && (
                    <p className="text-sm text-destructive mt-1">
                      {signUpForm.formState.errors.password.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="confirmPassword">{t('auth.confirmPassword')}</Label>
                  <Input id="confirmPassword" type="password" {...signUpForm.register('confirmPassword')} className="mt-1" />
                  {signUpForm.formState.errors.confirmPassword && (
                    <p className="text-sm text-destructive mt-1">
                      {signUpForm.formState.errors.confirmPassword.message}
                    </p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('common.loading') : t('auth.createAccount')}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  {t('auth.alreadyHaveAccount')}{' '}
                  <button type="button" onClick={() => setIsSignUp(false)} className="text-primary hover:underline">
                    {t('auth.signIn')}
                  </button>
                </p>
              </form>
            ) : (
              <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-4">
                <div>
                  <Label htmlFor="email">{t('auth.email')}</Label>
                  <Input id="email" type="email" {...signInForm.register('email')} className="mt-1" />
                  {signInForm.formState.errors.email && (
                    <p className="text-sm text-destructive mt-1">{signInForm.formState.errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">{t('auth.password')}</Label>
                  <Input id="password" type="password" {...signInForm.register('password')} className="mt-1" />
                  {signInForm.formState.errors.password && (
                    <p className="text-sm text-destructive mt-1">{signInForm.formState.errors.password.message}</p>
                  )}
                </div>

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? t('common2.loading') : t('auth.signIn')}
                </Button>

                <p className="text-center text-sm text-muted-foreground">
                  {t('auth.dontHaveAccount')}{' '}
                  <button type="button" onClick={() => setIsSignUp(true)} className="text-primary hover:underline">
                    {t('auth.signUp')}
                  </button>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Auth;
