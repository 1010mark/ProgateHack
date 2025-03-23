'use client';
import { useState } from 'react';
import { ModalContainer } from '@/components/atom/modalContainer';
import { EditIngredientForm } from '@/components/molecule/addNewIngredientModal/editIngredientForm';
import { updateIngredientApi } from '@/lib/api/ingredients';
import { Unit, IngredientCategory, Ingredient } from '@/types/ingredients';

interface EditIngredientModalProps {
  ingredient: Ingredient;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditIngredientModal = ({
  ingredient,
  onClose,
  onSuccess,
}: EditIngredientModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: Ingredient) => {
    try {
      setLoading(true);
      const newIngredient = {
        ...ingredient,
        name: formData.name,
        category: formData.category as IngredientCategory,
        quantity: formData.quantity,
        unit: formData.unit as Unit,
        expiration_date: new Date(formData.expiration_date),
        notes: formData.notes || undefined,
        status: 'active' as 'active',
        updatedAt: new Date(),
      };

      await updateIngredientApi(newIngredient);
      if (onSuccess) {
        onSuccess();
      }
      window.location.reload();
      onClose();
    } catch (err) {
      setError('食材の編集に失敗しました');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <ModalContainer onClose={onClose}>
      <h2 className='text-2xl font-bold mb-4'>食材情報を編集</h2>
      <div className='border-t mx-3 my-2'>
        <EditIngredientForm
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
          ingredient={ingredient}
        />
      </div>
    </ModalContainer>
  );
};
