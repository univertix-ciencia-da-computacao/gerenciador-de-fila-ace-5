import { RegisterForm } from '../DashboardAdmin/components/RegisterForm';

export default function DashboardRegistration() {
  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-6">
      <div>
        <h1 className="text-3xl font-extrabold text-blue-900 tracking-tight">Inscrição na fila</h1>
        <p className="mt-1 text-slate-500">Cadastre o paciente com classificação de risco.</p>
      </div>
      <RegisterForm />
    </div>
  );
}
