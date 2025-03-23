'use client';
import { useState } from 'react';
import { ModalContainer } from '@/components/atom/modalContainer';
import { AddNewIngredientForm } from '@/components/molecule/addNewIngredientModal/addNewIngredientForm';
import { addIngredient } from '@/lib/api/ingredients';
import { Unit, IngredientCategory } from '@/types/ingredients';
import { Ingredient } from '@/types/ingredients';
interface AddNewIngredientModalProps {
  onClose: () => void;
  onSuccess?: () => void;
}

export const AddNewIngredientModal = ({
  onClose,
  onSuccess,
}: AddNewIngredientModalProps) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (formData: Ingredient) => {
    try {
      setLoading(true);
      const newIngredient = {
        name: formData.name,
        category: formData.category as IngredientCategory,
        quantity: formData.quantity,
        unit: formData.unit as Unit,
        expiration_date: new Date(formData.expiration_date),
        notes: formData.notes || undefined,
        user_id: formData.user_id,
        status: 'active' as 'active',
        created_at: new Date(),
        updated_at: new Date(),
      };

      await addIngredient(newIngredient);
      if (onSuccess) {
        onSuccess();
      } else {
        onClose();
      }
    } catch (err) {
      setError('食材の追加に失敗しました');
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <ModalContainer onClose={onClose}>
      <h2 className='text-2xl font-bold mb-4'>新しい食材を追加</h2>
      <div className='border-t mx-3 my-2'></div>
      <AddNewIngredientForm
        onSubmit={handleSubmit}
        loading={loading}
        error={error}
      />
    </ModalContainer>
  );
};
