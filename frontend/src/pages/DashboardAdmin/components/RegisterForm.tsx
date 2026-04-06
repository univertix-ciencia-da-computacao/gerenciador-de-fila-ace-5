import React, { useState } from "react";
import { useAddEntry } from "../../../hooks/useQueue";
import type { AddEntryRequest } from "../../../api/types/queue";
import { toast } from "react-hot-toast";

// Pode organizar as lista dentro de src/{cria-pasta}/nome.ts (OPCIONAL)
const ESPECIALIDADES = [
  { id: "clinico-geral", label: "Clínico Geral" },
  { id: "ortopedia", label: "Ortopedia" },
  { id: "cardiologia", label: "Cardiologia" },
  { id: "pediatria", label: "Pediatria" },
] as const;

// Pode organizar as lista dentro de src/{cria-pasta}/nome.ts (OPCIONAL)
const INITIAL_STATE: AddEntryRequest = {
  person_name: "",
  unit_id: "default",
  priority: false,
  category: "clinico-geral",
};

export function RegisterForm() {
  const { mutate, isPending } = useAddEntry();
  const [formData, setFormData] = useState<AddEntryRequest>(INITIAL_STATE);
  const [error, setError] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const name = e.target.name as keyof AddEntryRequest; // Cast para garantir o tipo das chaves
    const value = e.target.value;

    if (name === "person_name" && error) setError(false);

    setFormData((prev) => ({
      ...prev,
      // Lógica para converter string de priority em boolean
      [name]: name === "priority" ? value === "true" : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const nomeLimpo = formData.person_name.trim();
    if (nomeLimpo.length < 3) {
      setError(true);
      return toast.error("O nome deve ter pelo menos 3 caracteres.");
    }

    mutate({ ...formData, person_name: nomeLimpo }, {
      onSuccess: () => {
        setFormData(INITIAL_STATE);
        toast.success(`Paciente ${nomeLimpo} adicionado com sucesso!`);
      },
    });
  };

  return (
    <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6" noValidate>
        <div className="flex flex-col gap-2">
          <label htmlFor="person_name" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
            Nome Completo do Paciente
          </label>
          <input
            type="text"
            id="person_name"
            name="person_name" // O atributo 'name' deve bater com a chave no INITIAL_STATE
            value={formData.person_name}
            onChange={handleInputChange}
            placeholder="Ex: Maria da Silva"
            disabled={isPending}
            className={`w-full bg-slate-50 border rounded-lg p-3 text-slate-800 focus:ring-2 outline-none transition-all ${
              error 
                ? "border-red-500 focus:ring-red-200" 
                : "border-slate-200 focus:ring-blue-600"
            }`}
          />
          {error && <span className="text-red-500 text-xs italic">Nome inválido ou muito curto.</span>}
        </div>

        <div className="flex gap-4">
          <div className="flex-1 flex flex-col gap-2">
            <label htmlFor="priority" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Urgência
            </label>
            <select
              id="priority"
              name="priority"
              value={formData.priority.toString()}
              onChange={handleInputChange}
              disabled={isPending}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
            >
              <option value="false">Não Urgente (Normal)</option>
              <option value="true">Urgente / Prioritário</option>
            </select>
          </div>

          <div className="flex-1 flex flex-col gap-2">
            <label htmlFor="category" className="text-xs font-bold text-slate-600 uppercase tracking-wider">
              Especialidade
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              disabled={isPending}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-800 focus:ring-2 focus:ring-blue-600 outline-none cursor-pointer"
            >
              {ESPECIALIDADES.map((esp) => (
                <option key={esp.id} value={esp.id}>
                  {esp.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-2 w-full bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white font-bold py-3 px-4 rounded-lg transition-all flex justify-center items-center gap-2 shadow-md active:scale-[0.98]"
        >
          {isPending ? "Processando..." : "+ Adicionar Paciente"}
        </button>
      </form>
    </div>
  );
}