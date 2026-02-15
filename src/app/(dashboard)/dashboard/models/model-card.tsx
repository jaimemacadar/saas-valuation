"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Edit, Copy, Trash2, Loader2 } from "lucide-react";
import { deleteModel, duplicateModel, updateModel } from "@/lib/actions/models";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { FinancialModelBasic } from "@/lib/actions/models";

interface ModelCardProps {
  model: FinancialModelBasic;
}

export function ModelCard({ model }: ModelCardProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const form = useForm({
    defaultValues: {
      company_name: model.company_name,
      ticker_symbol: model.ticker_symbol || "",
      description: model.description || "",
    },
  });

  const updatedDate = new Date(model.updated_at).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteModel(model.id);
      if (result.success) {
        toast.success("Modelo excluído com sucesso");
        setShowDeleteDialog(false);
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao excluir modelo");
      }
    } catch (error) {
      toast.error("Erro ao excluir modelo");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDuplicate = async () => {
    setIsDuplicating(true);
    try {
      const result = await duplicateModel(model.id);
      if (result.success) {
        toast.success("Modelo duplicado com sucesso");
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao duplicar modelo");
      }
    } catch (error) {
      toast.error("Erro ao duplicar modelo");
    } finally {
      setIsDuplicating(false);
    }
  };

  const handleUpdate = async (values: {
    company_name: string;
    ticker_symbol: string;
    description: string;
  }) => {
    setIsUpdating(true);
    try {
      const result = await updateModel(model.id, values);
      if (result.success) {
        toast.success("Modelo atualizado com sucesso");
        setShowEditDialog(false);
        router.refresh();
      } else {
        toast.error(result.error || "Erro ao atualizar modelo");
      }
    } catch (error) {
      toast.error("Erro ao atualizar modelo");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCardClick = () => {
    router.push(`/model/${model.id}/input/base`);
  };

  const handleCardKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleCardClick();
    }
  };

  return (
    <>
      <Card
        className="flex flex-col cursor-pointer hover:shadow-md transition-shadow"
        onClick={handleCardClick}
        onKeyDown={handleCardKeyDown}
        role="button"
        tabIndex={0}
      >
        <CardHeader>
          <CardTitle className="line-clamp-1">{model.company_name}</CardTitle>
          {model.ticker_symbol && (
            <CardDescription className="mt-1">
              {model.ticker_symbol}
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className="flex-1">
          {model.description ? (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {model.description}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">Sem descrição</p>
          )}
        </CardContent>
        <CardFooter className="flex justify-between items-center text-xs text-muted-foreground">
          <span>Atualizado em {updatedDate}</span>
          <TooltipProvider>
            <div className="flex gap-1">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setShowEditDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                    <span className="sr-only">Editar modelo</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Editar modelo</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleDuplicate();
                    }}
                    disabled={isDuplicating}
                  >
                    {isDuplicating ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                    <span className="sr-only">Duplicar modelo</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Duplicar modelo</TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      setShowDeleteDialog(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                    <span className="sr-only">Excluir modelo</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Excluir modelo</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </CardFooter>
      </Card>

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o modelo "{model.company_name}"? Esta
              ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowDeleteDialog(false)}
              disabled={isDeleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={isDeleting}
            >
              {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Modelo</DialogTitle>
            <DialogDescription>
              Atualize as informações do modelo
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleUpdate)} className="space-y-4">
              <FormField
                control={form.control}
                name="company_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome da Empresa</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Magazine Luiza" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ticker_symbol"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ticker (opcional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: MGLU3" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição (opcional)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Breve descrição do modelo"
                        rows={3}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowEditDialog(false)}
                  disabled={isUpdating}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isUpdating}>
                  {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}
